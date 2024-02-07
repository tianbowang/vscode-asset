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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/lifecycle", "vs/base/common/network", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensionRunningLocation", "vs/workbench/services/extensions/common/extensions", "vs/css!./media/runtimeExtensionsEditor"], function (require, exports, dom_1, actionbar_1, iconLabels_1, actions_1, arrays_1, async_1, decorators_1, lifecycle_1, network_1, nls, actionCommonCategories_1, actions_2, clipboardService_1, contextkey_1, contextView_1, extensions_1, instantiation_1, label_1, listService_1, notification_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, editorPane_1, extensions_2, runtimeExtensionsInput_1, editorService_1, environmentService_1, extensionManagement_1, extensionRunningLocation_1, extensions_3) {
    "use strict";
    var AbstractRuntimeExtensionsEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShowRuntimeExtensionsAction = exports.AbstractRuntimeExtensionsEditor = void 0;
    let AbstractRuntimeExtensionsEditor = class AbstractRuntimeExtensionsEditor extends editorPane_1.EditorPane {
        static { AbstractRuntimeExtensionsEditor_1 = this; }
        static { this.ID = 'workbench.editor.runtimeExtensions'; }
        constructor(telemetryService, themeService, contextKeyService, _extensionsWorkbenchService, _extensionService, _notificationService, _contextMenuService, _instantiationService, storageService, _labelService, _environmentService, _clipboardService) {
            super(AbstractRuntimeExtensionsEditor_1.ID, telemetryService, themeService, storageService);
            this._extensionsWorkbenchService = _extensionsWorkbenchService;
            this._extensionService = _extensionService;
            this._notificationService = _notificationService;
            this._contextMenuService = _contextMenuService;
            this._instantiationService = _instantiationService;
            this._labelService = _labelService;
            this._environmentService = _environmentService;
            this._clipboardService = _clipboardService;
            this._list = null;
            this._elements = null;
            this._updateSoon = this._register(new async_1.RunOnceScheduler(() => this._updateExtensions(), 200));
            this._register(this._extensionService.onDidChangeExtensionsStatus(() => this._updateSoon.schedule()));
            this._updateExtensions();
        }
        async _updateExtensions() {
            this._elements = await this._resolveExtensions();
            this._list?.splice(0, this._list.length, this._elements);
        }
        async _resolveExtensions() {
            // We only deal with extensions with source code!
            await this._extensionService.whenInstalledExtensionsRegistered();
            const extensionsDescriptions = this._extensionService.extensions.filter((extension) => {
                return Boolean(extension.main) || Boolean(extension.browser);
            });
            const marketplaceMap = new extensions_1.ExtensionIdentifierMap();
            const marketPlaceExtensions = await this._extensionsWorkbenchService.queryLocal();
            for (const extension of marketPlaceExtensions) {
                marketplaceMap.set(extension.identifier.id, extension);
            }
            const statusMap = this._extensionService.getExtensionsStatus();
            // group profile segments by extension
            const segments = new extensions_1.ExtensionIdentifierMap();
            const profileInfo = this._getProfileInfo();
            if (profileInfo) {
                let currentStartTime = profileInfo.startTime;
                for (let i = 0, len = profileInfo.deltas.length; i < len; i++) {
                    const id = profileInfo.ids[i];
                    const delta = profileInfo.deltas[i];
                    let extensionSegments = segments.get(id);
                    if (!extensionSegments) {
                        extensionSegments = [];
                        segments.set(id, extensionSegments);
                    }
                    extensionSegments.push(currentStartTime);
                    currentStartTime = currentStartTime + delta;
                    extensionSegments.push(currentStartTime);
                }
            }
            let result = [];
            for (let i = 0, len = extensionsDescriptions.length; i < len; i++) {
                const extensionDescription = extensionsDescriptions[i];
                let extProfileInfo = null;
                if (profileInfo) {
                    const extensionSegments = segments.get(extensionDescription.identifier) || [];
                    let extensionTotalTime = 0;
                    for (let j = 0, lenJ = extensionSegments.length / 2; j < lenJ; j++) {
                        const startTime = extensionSegments[2 * j];
                        const endTime = extensionSegments[2 * j + 1];
                        extensionTotalTime += (endTime - startTime);
                    }
                    extProfileInfo = {
                        segments: extensionSegments,
                        totalTime: extensionTotalTime
                    };
                }
                result[i] = {
                    originalIndex: i,
                    description: extensionDescription,
                    marketplaceInfo: marketplaceMap.get(extensionDescription.identifier),
                    status: statusMap[extensionDescription.identifier.value],
                    profileInfo: extProfileInfo || undefined,
                    unresponsiveProfile: this._getUnresponsiveProfile(extensionDescription.identifier)
                };
            }
            result = result.filter(element => element.status.activationStarted);
            // bubble up extensions that have caused slowness
            const isUnresponsive = (extension) => extension.unresponsiveProfile === profileInfo;
            const profileTime = (extension) => extension.profileInfo?.totalTime ?? 0;
            const activationTime = (extension) => (extension.status.activationTimes?.codeLoadingTime ?? 0) +
                (extension.status.activationTimes?.activateCallTime ?? 0);
            result = result.sort((a, b) => {
                if (isUnresponsive(a) || isUnresponsive(b)) {
                    return +isUnresponsive(b) - +isUnresponsive(a);
                }
                else if (profileTime(a) || profileTime(b)) {
                    return profileTime(b) - profileTime(a);
                }
                else if (activationTime(a) || activationTime(b)) {
                    return activationTime(b) - activationTime(a);
                }
                return a.originalIndex - b.originalIndex;
            });
            return result;
        }
        createEditor(parent) {
            parent.classList.add('runtime-extensions-editor');
            const TEMPLATE_ID = 'runtimeExtensionElementTemplate';
            const delegate = new class {
                getHeight(element) {
                    return 70;
                }
                getTemplateId(element) {
                    return TEMPLATE_ID;
                }
            };
            const renderer = {
                templateId: TEMPLATE_ID,
                renderTemplate: (root) => {
                    const element = (0, dom_1.append)(root, (0, dom_1.$)('.extension'));
                    const iconContainer = (0, dom_1.append)(element, (0, dom_1.$)('.icon-container'));
                    const icon = (0, dom_1.append)(iconContainer, (0, dom_1.$)('img.icon'));
                    const desc = (0, dom_1.append)(element, (0, dom_1.$)('div.desc'));
                    const headerContainer = (0, dom_1.append)(desc, (0, dom_1.$)('.header-container'));
                    const header = (0, dom_1.append)(headerContainer, (0, dom_1.$)('.header'));
                    const name = (0, dom_1.append)(header, (0, dom_1.$)('div.name'));
                    const version = (0, dom_1.append)(header, (0, dom_1.$)('span.version'));
                    const msgContainer = (0, dom_1.append)(desc, (0, dom_1.$)('div.msg'));
                    const actionbar = new actionbar_1.ActionBar(desc, { animated: false });
                    actionbar.onDidRun(({ error }) => error && this._notificationService.error(error));
                    const timeContainer = (0, dom_1.append)(element, (0, dom_1.$)('.time'));
                    const activationTime = (0, dom_1.append)(timeContainer, (0, dom_1.$)('div.activation-time'));
                    const profileTime = (0, dom_1.append)(timeContainer, (0, dom_1.$)('div.profile-time'));
                    const disposables = [actionbar];
                    return {
                        root,
                        element,
                        icon,
                        name,
                        version,
                        actionbar,
                        activationTime,
                        profileTime,
                        msgContainer,
                        disposables,
                        elementDisposables: [],
                    };
                },
                renderElement: (element, index, data) => {
                    data.elementDisposables = (0, lifecycle_1.dispose)(data.elementDisposables);
                    data.root.classList.toggle('odd', index % 2 === 1);
                    data.elementDisposables.push((0, dom_1.addDisposableListener)(data.icon, 'error', () => data.icon.src = element.marketplaceInfo?.iconUrlFallback || extensionManagement_1.DefaultIconPath, { once: true }));
                    data.icon.src = element.marketplaceInfo?.iconUrl || extensionManagement_1.DefaultIconPath;
                    if (!data.icon.complete) {
                        data.icon.style.visibility = 'hidden';
                        data.icon.onload = () => data.icon.style.visibility = 'inherit';
                    }
                    else {
                        data.icon.style.visibility = 'inherit';
                    }
                    data.name.textContent = (element.marketplaceInfo?.displayName || element.description.identifier.value).substr(0, 50);
                    data.version.textContent = element.description.version;
                    const activationTimes = element.status.activationTimes;
                    if (activationTimes) {
                        const syncTime = activationTimes.codeLoadingTime + activationTimes.activateCallTime;
                        data.activationTime.textContent = activationTimes.activationReason.startup ? `Startup Activation: ${syncTime}ms` : `Activation: ${syncTime}ms`;
                    }
                    else {
                        data.activationTime.textContent = `Activating...`;
                    }
                    data.actionbar.clear();
                    const slowExtensionAction = this._createSlowExtensionAction(element);
                    if (slowExtensionAction) {
                        data.actionbar.push(slowExtensionAction, { icon: false, label: true });
                    }
                    if ((0, arrays_1.isNonEmptyArray)(element.status.runtimeErrors)) {
                        const reportExtensionIssueAction = this._createReportExtensionIssueAction(element);
                        if (reportExtensionIssueAction) {
                            data.actionbar.push(reportExtensionIssueAction, { icon: false, label: true });
                        }
                    }
                    let title;
                    if (activationTimes) {
                        const activationId = activationTimes.activationReason.extensionId.value;
                        const activationEvent = activationTimes.activationReason.activationEvent;
                        if (activationEvent === '*') {
                            title = nls.localize({
                                key: 'starActivation',
                                comment: [
                                    '{0} will be an extension identifier'
                                ]
                            }, "Activated by {0} on start-up", activationId);
                        }
                        else if (/^workspaceContains:/.test(activationEvent)) {
                            const fileNameOrGlob = activationEvent.substr('workspaceContains:'.length);
                            if (fileNameOrGlob.indexOf('*') >= 0 || fileNameOrGlob.indexOf('?') >= 0) {
                                title = nls.localize({
                                    key: 'workspaceContainsGlobActivation',
                                    comment: [
                                        '{0} will be a glob pattern',
                                        '{1} will be an extension identifier'
                                    ]
                                }, "Activated by {1} because a file matching {0} exists in your workspace", fileNameOrGlob, activationId);
                            }
                            else {
                                title = nls.localize({
                                    key: 'workspaceContainsFileActivation',
                                    comment: [
                                        '{0} will be a file name',
                                        '{1} will be an extension identifier'
                                    ]
                                }, "Activated by {1} because file {0} exists in your workspace", fileNameOrGlob, activationId);
                            }
                        }
                        else if (/^workspaceContainsTimeout:/.test(activationEvent)) {
                            const glob = activationEvent.substr('workspaceContainsTimeout:'.length);
                            title = nls.localize({
                                key: 'workspaceContainsTimeout',
                                comment: [
                                    '{0} will be a glob pattern',
                                    '{1} will be an extension identifier'
                                ]
                            }, "Activated by {1} because searching for {0} took too long", glob, activationId);
                        }
                        else if (activationEvent === 'onStartupFinished') {
                            title = nls.localize({
                                key: 'startupFinishedActivation',
                                comment: [
                                    'This refers to an extension. {0} will be an activation event.'
                                ]
                            }, "Activated by {0} after start-up finished", activationId);
                        }
                        else if (/^onLanguage:/.test(activationEvent)) {
                            const language = activationEvent.substr('onLanguage:'.length);
                            title = nls.localize('languageActivation', "Activated by {1} because you opened a {0} file", language, activationId);
                        }
                        else {
                            title = nls.localize({
                                key: 'workspaceGenericActivation',
                                comment: [
                                    '{0} will be an activation event, like e.g. \'language:typescript\', \'debug\', etc.',
                                    '{1} will be an extension identifier'
                                ]
                            }, "Activated by {1} on {0}", activationEvent, activationId);
                        }
                    }
                    else {
                        title = nls.localize('extensionActivating', "Extension is activating...");
                    }
                    data.activationTime.title = title;
                    (0, dom_1.clearNode)(data.msgContainer);
                    if (this._getUnresponsiveProfile(element.description.identifier)) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.renderLabelWithIcons)(` $(alert) Unresponsive`));
                        el.title = nls.localize('unresponsive.title', "Extension has caused the extension host to freeze.");
                        data.msgContainer.appendChild(el);
                    }
                    if ((0, arrays_1.isNonEmptyArray)(element.status.runtimeErrors)) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.renderLabelWithIcons)(`$(bug) ${nls.localize('errors', "{0} uncaught errors", element.status.runtimeErrors.length)}`));
                        data.msgContainer.appendChild(el);
                    }
                    if (element.status.messages && element.status.messages.length > 0) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.renderLabelWithIcons)(`$(alert) ${element.status.messages[0].message}`));
                        data.msgContainer.appendChild(el);
                    }
                    let extraLabel = null;
                    if (element.status.runningLocation && element.status.runningLocation.equals(new extensionRunningLocation_1.LocalWebWorkerRunningLocation(0))) {
                        extraLabel = `$(globe) web worker`;
                    }
                    else if (element.description.extensionLocation.scheme === network_1.Schemas.vscodeRemote) {
                        const hostLabel = this._labelService.getHostLabel(network_1.Schemas.vscodeRemote, this._environmentService.remoteAuthority);
                        if (hostLabel) {
                            extraLabel = `$(remote) ${hostLabel}`;
                        }
                        else {
                            extraLabel = `$(remote) ${element.description.extensionLocation.authority}`;
                        }
                    }
                    else if (element.status.runningLocation && element.status.runningLocation.affinity > 0) {
                        extraLabel = element.status.runningLocation instanceof extensionRunningLocation_1.LocalWebWorkerRunningLocation
                            ? `$(globe) web worker ${element.status.runningLocation.affinity + 1}`
                            : `$(server-process) local process ${element.status.runningLocation.affinity + 1}`;
                    }
                    if (extraLabel) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.renderLabelWithIcons)(extraLabel));
                        data.msgContainer.appendChild(el);
                    }
                    if (element.profileInfo) {
                        data.profileTime.textContent = `Profile: ${(element.profileInfo.totalTime / 1000).toFixed(2)}ms`;
                    }
                    else {
                        data.profileTime.textContent = '';
                    }
                },
                disposeTemplate: (data) => {
                    data.disposables = (0, lifecycle_1.dispose)(data.disposables);
                }
            };
            this._list = this._instantiationService.createInstance(listService_1.WorkbenchList, 'RuntimeExtensions', parent, delegate, [renderer], {
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                horizontalScrolling: false,
                overrideStyles: {
                    listBackground: colorRegistry_1.editorBackground
                },
                accessibilityProvider: new class {
                    getWidgetAriaLabel() {
                        return nls.localize('runtimeExtensions', "Runtime Extensions");
                    }
                    getAriaLabel(element) {
                        return element.description.name;
                    }
                }
            });
            this._list.splice(0, this._list.length, this._elements || undefined);
            this._list.onContextMenu((e) => {
                if (!e.element) {
                    return;
                }
                const actions = [];
                actions.push(new actions_1.Action('runtimeExtensionsEditor.action.copyId', nls.localize('copy id', "Copy id ({0})", e.element.description.identifier.value), undefined, true, () => {
                    this._clipboardService.writeText(e.element.description.identifier.value);
                }));
                const reportExtensionIssueAction = this._createReportExtensionIssueAction(e.element);
                if (reportExtensionIssueAction) {
                    actions.push(reportExtensionIssueAction);
                }
                actions.push(new actions_1.Separator());
                if (e.element.marketplaceInfo) {
                    actions.push(new actions_1.Action('runtimeExtensionsEditor.action.disableWorkspace', nls.localize('disable workspace', "Disable (Workspace)"), undefined, true, () => this._extensionsWorkbenchService.setEnablement(e.element.marketplaceInfo, 7 /* EnablementState.DisabledWorkspace */)));
                    actions.push(new actions_1.Action('runtimeExtensionsEditor.action.disable', nls.localize('disable', "Disable"), undefined, true, () => this._extensionsWorkbenchService.setEnablement(e.element.marketplaceInfo, 6 /* EnablementState.DisabledGlobally */)));
                }
                actions.push(new actions_1.Separator());
                const profileAction = this._createProfileAction();
                if (profileAction) {
                    actions.push(profileAction);
                }
                const saveExtensionHostProfileAction = this.saveExtensionHostProfileAction;
                if (saveExtensionHostProfileAction) {
                    actions.push(saveExtensionHostProfileAction);
                }
                this._contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => actions
                });
            });
        }
        get saveExtensionHostProfileAction() {
            return this._createSaveExtensionHostProfileAction();
        }
        layout(dimension) {
            this._list?.layout(dimension.height);
        }
    };
    exports.AbstractRuntimeExtensionsEditor = AbstractRuntimeExtensionsEditor;
    __decorate([
        decorators_1.memoize
    ], AbstractRuntimeExtensionsEditor.prototype, "saveExtensionHostProfileAction", null);
    exports.AbstractRuntimeExtensionsEditor = AbstractRuntimeExtensionsEditor = AbstractRuntimeExtensionsEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, extensions_2.IExtensionsWorkbenchService),
        __param(4, extensions_3.IExtensionService),
        __param(5, notification_1.INotificationService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, storage_1.IStorageService),
        __param(9, label_1.ILabelService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, clipboardService_1.IClipboardService)
    ], AbstractRuntimeExtensionsEditor);
    class ShowRuntimeExtensionsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.showRuntimeExtensions',
                title: { value: nls.localize('showRuntimeExtensions', "Show Running Extensions"), original: 'Show Running Extensions' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true,
                menu: {
                    id: actions_2.MenuId.ViewContainerTitle,
                    when: contextkey_1.ContextKeyExpr.equals('viewContainer', 'workbench.view.extensions'),
                    group: '2_enablement',
                    order: 3
                }
            });
        }
        async run(accessor) {
            await accessor.get(editorService_1.IEditorService).openEditor(runtimeExtensionsInput_1.RuntimeExtensionsInput.instance, { pinned: true });
        }
    }
    exports.ShowRuntimeExtensionsAction = ShowRuntimeExtensionsAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RSdW50aW1lRXh0ZW5zaW9uc0VkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2Fic3RyYWN0UnVudGltZUV4dGVuc2lvbnNFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTZEekYsSUFBZSwrQkFBK0IsR0FBOUMsTUFBZSwrQkFBZ0MsU0FBUSx1QkFBVTs7aUJBRWhELE9BQUUsR0FBVyxvQ0FBb0MsQUFBL0MsQ0FBZ0Q7UUFNekUsWUFDb0IsZ0JBQW1DLEVBQ3ZDLFlBQTJCLEVBQ3RCLGlCQUFxQyxFQUNYLDJCQUF3RCxFQUNsRSxpQkFBb0MsRUFDakMsb0JBQTBDLEVBQzNDLG1CQUF3QyxFQUNwQyxxQkFBNEMsRUFDckUsY0FBK0IsRUFDaEIsYUFBNEIsRUFDYixtQkFBaUQsRUFDNUQsaUJBQW9DO1lBRXhFLEtBQUssQ0FBQyxpQ0FBK0IsQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBVjVDLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBNkI7WUFDbEUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNqQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQzNDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDcEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUV0RCxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUNiLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBOEI7WUFDNUQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUl4RSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJ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