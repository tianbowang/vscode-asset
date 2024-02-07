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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/platform/userDataSync/common/userDataSync", "vs/base/common/uri", "vs/base/common/resources", "vs/base/common/network", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/contrib/welcomeGettingStarted/common/gettingStartedContent", "vs/workbench/services/assignment/common/assignmentService", "vs/workbench/services/host/browser/host", "vs/platform/configuration/common/configuration", "vs/base/common/linkedText", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedExtensionPoint", "vs/platform/instantiation/common/extensions", "vs/base/common/path", "vs/base/common/arrays", "vs/workbench/services/views/common/viewsService", "vs/nls", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/extensions/common/workspaceContains", "vs/platform/workspace/common/workspace", "vs/base/common/cancellation", "vs/workbench/services/extensionManagement/common/extensionManagement"], function (require, exports, instantiation_1, event_1, storage_1, memento_1, actions_1, commands_1, contextkey_1, lifecycle_1, userDataSync_1, uri_1, resources_1, network_1, extensionManagement_1, gettingStartedContent_1, assignmentService_1, host_1, configuration_1, linkedText_1, gettingStartedExtensionPoint_1, extensions_1, path_1, arrays_1, viewsService_1, nls_1, telemetry_1, workspaceContains_1, workspace_1, cancellation_1, extensionManagement_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.convertInternalMediaPathToFileURI = exports.WalkthroughsService = exports.walkthroughMetadataConfigurationKey = exports.hiddenEntriesConfigurationKey = exports.IWalkthroughsService = exports.HasMultipleNewFileEntries = void 0;
    exports.HasMultipleNewFileEntries = new contextkey_1.RawContextKey('hasMultipleNewFileEntries', false);
    exports.IWalkthroughsService = (0, instantiation_1.createDecorator)('walkthroughsService');
    exports.hiddenEntriesConfigurationKey = 'workbench.welcomePage.hiddenCategories';
    exports.walkthroughMetadataConfigurationKey = 'workbench.welcomePage.walkthroughMetadata';
    const BUILT_IN_SOURCE = (0, nls_1.localize)('builtin', "Built-In");
    // Show walkthrough as "new" for 7 days after first install
    const DAYS = 24 * 60 * 60 * 1000;
    const NEW_WALKTHROUGH_TIME = 7 * DAYS;
    let WalkthroughsService = class WalkthroughsService extends lifecycle_1.Disposable {
        constructor(storageService, commandService, instantiationService, workspaceContextService, contextService, userDataSyncEnablementService, configurationService, extensionManagementService, hostService, viewsService, telemetryService, tasExperimentService) {
            super();
            this.storageService = storageService;
            this.commandService = commandService;
            this.instantiationService = instantiationService;
            this.workspaceContextService = workspaceContextService;
            this.contextService = contextService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.configurationService = configurationService;
            this.extensionManagementService = extensionManagementService;
            this.hostService = hostService;
            this.viewsService = viewsService;
            this.telemetryService = telemetryService;
            this.tasExperimentService = tasExperimentService;
            this._onDidAddWalkthrough = new event_1.Emitter();
            this.onDidAddWalkthrough = this._onDidAddWalkthrough.event;
            this._onDidRemoveWalkthrough = new event_1.Emitter();
            this.onDidRemoveWalkthrough = this._onDidRemoveWalkthrough.event;
            this._onDidChangeWalkthrough = new event_1.Emitter();
            this.onDidChangeWalkthrough = this._onDidChangeWalkthrough.event;
            this._onDidProgressStep = new event_1.Emitter();
            this.onDidProgressStep = this._onDidProgressStep.event;
            this.sessionEvents = new Set();
            this.completionListeners = new Map();
            this.gettingStartedContributions = new Map();
            this.steps = new Map();
            this.sessionInstalledExtensions = new Set();
            this.categoryVisibilityContextKeys = new Set();
            this.stepCompletionContextKeyExpressions = new Set();
            this.stepCompletionContextKeys = new Set();
            this.metadata = new Map(JSON.parse(this.storageService.get(exports.walkthroughMetadataConfigurationKey, 0 /* StorageScope.PROFILE */, '[]')));
            this.memento = new memento_1.Memento('gettingStartedService', this.storageService);
            this.stepProgress = this.memento.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            this.initCompletionEventListeners();
            exports.HasMultipleNewFileEntries.bindTo(this.contextService).set(false);
            this.registerWalkthroughs();
        }
        registerWalkthroughs() {
            gettingStartedContent_1.walkthroughs.forEach(async (category, index) => {
                this._registerWalkthrough({
                    ...category,
                    icon: { type: 'icon', icon: category.icon },
                    order: gettingStartedContent_1.walkthroughs.length - index,
                    source: BUILT_IN_SOURCE,
                    when: contextkey_1.ContextKeyExpr.deserialize(category.when) ?? contextkey_1.ContextKeyExpr.true(),
                    steps: category.content.steps.map((step, index) => {
                        return ({
                            ...step,
                            completionEvents: step.completionEvents ?? [],
                            description: parseDescription(step.description),
                            category: category.id,
                            order: index,
                            when: contextkey_1.ContextKeyExpr.deserialize(step.when) ?? contextkey_1.ContextKeyExpr.true(),
                            media: step.media.type === 'image'
                                ? {
                                    type: 'image',
                                    altText: step.media.altText,
                                    path: convertInternalMediaPathsToBrowserURIs(step.media.path)
                                }
                                : step.media.type === 'svg'
                                    ? {
                                        type: 'svg',
                                        altText: step.media.altText,
                                        path: (0, exports.convertInternalMediaPathToFileURI)(step.media.path).with({ query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcomeGettingStarted/common/media/' + step.media.path }) })
                                    }
                                    : {
                                        type: 'markdown',
                                        path: (0, exports.convertInternalMediaPathToFileURI)(step.media.path).with({ query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcomeGettingStarted/common/media/' + step.media.path }) }),
                                        base: network_1.FileAccess.asFileUri('vs/workbench/contrib/welcomeGettingStarted/common/media/'),
                                        root: network_1.FileAccess.asFileUri('vs/workbench/contrib/welcomeGettingStarted/common/media/'),
                                    },
                        });
                    })
                });
            });
            gettingStartedExtensionPoint_1.walkthroughsExtensionPoint.setHandler((_, { added, removed }) => {
                added.map(e => this.registerExtensionWalkthroughContributions(e.description));
                removed.map(e => this.unregisterExtensionWalkthroughContributions(e.description));
            });
        }
        initCompletionEventListeners() {
            this._register(this.commandService.onDidExecuteCommand(command => this.progressByEvent(`onCommand:${command.commandId}`)));
            this.extensionManagementService.getInstalled().then(installed => {
                installed.forEach(ext => this.progressByEvent(`extensionInstalled:${ext.identifier.id.toLowerCase()}`));
            });
            this._register(this.extensionManagementService.onDidInstallExtensions(async (result) => {
                const hadLastFoucs = await this.hostService.hadLastFocus();
                for (const e of result) {
                    const skipWalkthrough = e?.context?.[extensionManagement_1.EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT] || e?.context?.[extensionManagement_1.EXTENSION_INSTALL_DEP_PACK_CONTEXT];
                    // If the window had last focus and the install didn't specify to skip the walkthrough
                    // Then add it to the sessionInstallExtensions to be opened
                    if (hadLastFoucs && !skipWalkthrough) {
                        this.sessionInstalledExtensions.add(e.identifier.id.toLowerCase());
                    }
                    this.progressByEvent(`extensionInstalled:${e.identifier.id.toLowerCase()}`);
                }
            }));
            this._register(this.contextService.onDidChangeContext(event => {
                if (event.affectsSome(this.stepCompletionContextKeys)) {
                    this.stepCompletionContextKeyExpressions.forEach(expression => {
                        if (event.affectsSome(new Set(expression.keys())) && this.contextService.contextMatchesRules(expression)) {
                            this.progressByEvent(`onContext:` + expression.serialize());
                        }
                    });
                }
            }));
            this._register(this.viewsService.onDidChangeViewVisibility(e => {
                if (e.visible) {
                    this.progressByEvent('onView:' + e.id);
                }
            }));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                e.affectedKeys.forEach(key => { this.progressByEvent('onSettingChanged:' + key); });
            }));
            if (this.userDataSyncEnablementService.isEnabled()) {
                this.progressByEvent('onEvent:sync-enabled');
            }
            this._register(this.userDataSyncEnablementService.onDidChangeEnablement(() => {
                if (this.userDataSyncEnablementService.isEnabled()) {
                    this.progressByEvent('onEvent:sync-enabled');
                }
            }));
        }
        markWalkthroughOpened(id) {
            const walkthrough = this.gettingStartedContributions.get(id);
            const prior = this.metadata.get(id);
            if (prior && walkthrough) {
                this.metadata.set(id, { ...prior, manaullyOpened: true, stepIDs: walkthrough.steps.map(s => s.id) });
            }
            this.storageService.store(exports.walkthroughMetadataConfigurationKey, JSON.stringify([...this.metadata.entries()]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        async registerExtensionWalkthroughContributions(extension) {
            const convertExtensionPathToFileURI = (path) => path.startsWith('https://')
                ? uri_1.URI.parse(path, true)
                : network_1.FileAccess.uriToFileUri((0, resources_1.joinPath)(extension.extensionLocation, path));
            const convertExtensionRelativePathsToBrowserURIs = (path) => {
                const convertPath = (path) => path.startsWith('https://')
                    ? uri_1.URI.parse(path, true)
                    : network_1.FileAccess.uriToBrowserUri((0, resources_1.joinPath)(extension.extensionLocation, path));
                if (typeof path === 'string') {
                    const converted = convertPath(path);
                    return { hcDark: converted, hcLight: converted, dark: converted, light: converted };
                }
                else {
                    return {
                        hcDark: convertPath(path.hc),
                        hcLight: convertPath(path.hcLight ?? path.light),
                        light: convertPath(path.light),
                        dark: convertPath(path.dark)
                    };
                }
            };
            if (!(extension.contributes?.walkthroughs?.length)) {
                return;
            }
            let sectionToOpen;
            let sectionToOpenIndex = Math.min(); // '+Infinity';
            await Promise.all(extension.contributes?.walkthroughs?.map(async (walkthrough, index) => {
                const categoryID = extension.identifier.value + '#' + walkthrough.id;
                const isNewlyInstalled = !this.metadata.get(categoryID);
                if (isNewlyInstalled) {
                    this.metadata.set(categoryID, { firstSeen: +new Date(), stepIDs: walkthrough.steps?.map(s => s.id) ?? [], manaullyOpened: false });
                }
                const override = await Promise.race([
                    this.tasExperimentService?.getTreatment(`gettingStarted.overrideCategory.${extension.identifier.value + '.' + walkthrough.id}.when`),
                    new Promise(resolve => setTimeout(() => resolve(walkthrough.when), 5000))
                ]);
                if (this.sessionInstalledExtensions.has(extension.identifier.value.toLowerCase())
                    && this.contextService.contextMatchesRules(contextkey_1.ContextKeyExpr.deserialize(override ?? walkthrough.when) ?? contextkey_1.ContextKeyExpr.true())) {
                    this.sessionInstalledExtensions.delete(extension.identifier.value.toLowerCase());
                    if (index < sectionToOpenIndex && isNewlyInstalled) {
                        sectionToOpen = categoryID;
                        sectionToOpenIndex = index;
                    }
                }
                const steps = (walkthrough.steps ?? []).map((step, index) => {
                    const description = parseDescription(step.description || '');
                    const fullyQualifiedID = extension.identifier.value + '#' + walkthrough.id + '#' + step.id;
                    let media;
                    if (!step.media) {
                        throw Error('missing media in walkthrough step: ' + walkthrough.id + '@' + step.id);
                    }
                    if (step.media.image) {
                        const altText = step.media.altText;
                        if (altText === undefined) {
                            console.error('Walkthrough item:', fullyQualifiedID, 'is missing altText for its media element.');
                        }
                        media = { type: 'image', altText, path: convertExtensionRelativePathsToBrowserURIs(step.media.image) };
                    }
                    else if (step.media.markdown) {
                        media = {
                            type: 'markdown',
                            path: convertExtensionPathToFileURI(step.media.markdown),
                            base: convertExtensionPathToFileURI((0, path_1.dirname)(step.media.markdown)),
                            root: network_1.FileAccess.uriToFileUri(extension.extensionLocation),
                        };
                    }
                    else if (step.media.svg) {
                        media = {
                            type: 'svg',
                            path: convertExtensionPathToFileURI(step.media.svg),
                            altText: step.media.svg,
                        };
                    }
                    // Throw error for unknown walkthrough format
                    else {
                        throw new Error('Unknown walkthrough format detected for ' + fullyQualifiedID);
                    }
                    return ({
                        description,
                        media,
                        completionEvents: step.completionEvents?.filter(x => typeof x === 'string') ?? [],
                        id: fullyQualifiedID,
                        title: step.title,
                        when: contextkey_1.ContextKeyExpr.deserialize(step.when) ?? contextkey_1.ContextKeyExpr.true(),
                        category: categoryID,
                        order: index,
                    });
                });
                let isFeatured = false;
                if (walkthrough.featuredFor) {
                    const folders = this.workspaceContextService.getWorkspace().folders.map(f => f.uri);
                    const token = new cancellation_1.CancellationTokenSource();
                    setTimeout(() => token.cancel(), 2000);
                    isFeatured = await this.instantiationService.invokeFunction(a => (0, workspaceContains_1.checkGlobFileExists)(a, folders, walkthrough.featuredFor, token.token));
                }
                const iconStr = walkthrough.icon ?? extension.icon;
                const walkthoughDescriptor = {
                    description: walkthrough.description,
                    title: walkthrough.title,
                    id: categoryID,
                    isFeatured,
                    source: extension.displayName ?? extension.name,
                    order: 0,
                    steps,
                    icon: {
                        type: 'image',
                        path: iconStr
                            ? network_1.FileAccess.uriToBrowserUri((0, resources_1.joinPath)(extension.extensionLocation, iconStr)).toString(true)
                            : extensionManagement_2.DefaultIconPath
                    },
                    when: contextkey_1.ContextKeyExpr.deserialize(override ?? walkthrough.when) ?? contextkey_1.ContextKeyExpr.true(),
                };
                this._registerWalkthrough(walkthoughDescriptor);
                this._onDidAddWalkthrough.fire(this.resolveWalkthrough(walkthoughDescriptor));
            }));
            this.storageService.store(exports.walkthroughMetadataConfigurationKey, JSON.stringify([...this.metadata.entries()]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            if (sectionToOpen && this.configurationService.getValue('workbench.welcomePage.walkthroughs.openOnInstall')) {
                this.telemetryService.publicLog2('gettingStarted.didAutoOpenWalkthrough', { id: sectionToOpen });
                this.commandService.executeCommand('workbench.action.openWalkthrough', sectionToOpen, true);
            }
        }
        unregisterExtensionWalkthroughContributions(extension) {
            if (!(extension.contributes?.walkthroughs?.length)) {
                return;
            }
            extension.contributes?.walkthroughs?.forEach(section => {
                const categoryID = extension.identifier.value + '#' + section.id;
                section.steps.forEach(step => {
                    const fullyQualifiedID = extension.identifier.value + '#' + section.id + '#' + step.id;
                    this.steps.delete(fullyQualifiedID);
                });
                this.gettingStartedContributions.delete(categoryID);
                this._onDidRemoveWalkthrough.fire(categoryID);
            });
        }
        getWalkthrough(id) {
            const walkthrough = this.gettingStartedContributions.get(id);
            if (!walkthrough) {
                throw Error('Trying to get unknown walkthrough: ' + id);
            }
            return this.resolveWalkthrough(walkthrough);
        }
        getWalkthroughs() {
            const registeredCategories = [...this.gettingStartedContributions.values()];
            const categoriesWithCompletion = registeredCategories
                .map(category => {
                return {
                    ...category,
                    content: {
                        type: 'steps',
                        steps: category.steps
                    }
                };
            })
                .filter(category => category.content.type !== 'steps' || category.content.steps.length)
                .map(category => this.resolveWalkthrough(category));
            return categoriesWithCompletion;
        }
        resolveWalkthrough(category) {
            const stepsWithProgress = category.steps.map(step => this.getStepProgress(step));
            const hasOpened = this.metadata.get(category.id)?.manaullyOpened;
            const firstSeenDate = this.metadata.get(category.id)?.firstSeen;
            const isNew = firstSeenDate && firstSeenDate > (+new Date() - NEW_WALKTHROUGH_TIME);
            const lastStepIDs = this.metadata.get(category.id)?.stepIDs;
            const rawCategory = this.gettingStartedContributions.get(category.id);
            if (!rawCategory) {
                throw Error('Could not find walkthrough with id ' + category.id);
            }
            const currentStepIds = rawCategory.steps.map(s => s.id);
            const hasNewSteps = lastStepIDs && (currentStepIds.length !== lastStepIDs.length || currentStepIds.some((id, index) => id !== lastStepIDs[index]));
            let recencyBonus = 0;
            if (firstSeenDate) {
                const currentDate = +new Date();
                const timeSinceFirstSeen = currentDate - firstSeenDate;
                recencyBonus = Math.max(0, (NEW_WALKTHROUGH_TIME - timeSinceFirstSeen) / NEW_WALKTHROUGH_TIME);
            }
            return {
                ...category,
                recencyBonus,
                steps: stepsWithProgress,
                newItems: !!hasNewSteps,
                newEntry: !!(isNew && !hasOpened),
            };
        }
        getStepProgress(step) {
            return {
                ...step,
                done: false,
                ...this.stepProgress[step.id]
            };
        }
        progressStep(id) {
            const oldProgress = this.stepProgress[id];
            if (!oldProgress || oldProgress.done !== true) {
                this.stepProgress[id] = { done: true };
                this.memento.saveMemento();
                const step = this.getStep(id);
                if (!step) {
                    throw Error('Tried to progress unknown step');
                }
                this._onDidProgressStep.fire(this.getStepProgress(step));
            }
        }
        deprogressStep(id) {
            delete this.stepProgress[id];
            this.memento.saveMemento();
            const step = this.getStep(id);
            this._onDidProgressStep.fire(this.getStepProgress(step));
        }
        progressByEvent(event) {
            if (this.sessionEvents.has(event)) {
                return;
            }
            this.sessionEvents.add(event);
            this.completionListeners.get(event)?.forEach(id => this.progressStep(id));
        }
        registerWalkthrough(walkthoughDescriptor) {
            this._registerWalkthrough({
                ...walkthoughDescriptor,
                steps: walkthoughDescriptor.steps.map(step => ({ ...step, description: parseDescription(step.description) }))
            });
        }
        _registerWalkthrough(walkthroughDescriptor) {
            const oldCategory = this.gettingStartedContributions.get(walkthroughDescriptor.id);
            if (oldCategory) {
                console.error(`Skipping attempt to overwrite walkthrough. (${walkthroughDescriptor.id})`);
                return;
            }
            this.gettingStartedContributions.set(walkthroughDescriptor.id, walkthroughDescriptor);
            walkthroughDescriptor.steps.forEach(step => {
                if (this.steps.has(step.id)) {
                    throw Error('Attempting to register step with id ' + step.id + ' twice. Second is dropped.');
                }
                this.steps.set(step.id, step);
                step.when.keys().forEach(key => this.categoryVisibilityContextKeys.add(key));
                this.registerDoneListeners(step);
            });
            walkthroughDescriptor.when.keys().forEach(key => this.categoryVisibilityContextKeys.add(key));
        }
        registerDoneListeners(step) {
            if (step.doneOn) {
                console.error(`wakthrough step`, step, `uses deprecated 'doneOn' property. Adopt 'completionEvents' to silence this warning`);
                return;
            }
            if (!step.completionEvents.length) {
                step.completionEvents = (0, arrays_1.coalesce)((0, arrays_1.flatten)(step.description
                    .filter(linkedText => linkedText.nodes.length === 1) // only buttons
                    .map(linkedText => linkedText.nodes
                    .filter(((node) => typeof node !== 'string'))
                    .map(({ href }) => {
                    if (href.startsWith('command:')) {
                        return 'onCommand:' + href.slice('command:'.length, href.includes('?') ? href.indexOf('?') : undefined);
                    }
                    if (href.startsWith('https://') || href.startsWith('http://')) {
                        return 'onLink:' + href;
                    }
                    return undefined;
                }))));
            }
            if (!step.completionEvents.length) {
                step.completionEvents.push('stepSelected');
            }
            for (let event of step.completionEvents) {
                const [_, eventType, argument] = /^([^:]*):?(.*)$/.exec(event) ?? [];
                if (!eventType) {
                    console.error(`Unknown completionEvent ${event} when registering step ${step.id}`);
                    continue;
                }
                switch (eventType) {
                    case 'onLink':
                    case 'onEvent':
                    case 'onView':
                    case 'onSettingChanged':
                        break;
                    case 'onContext': {
                        const expression = contextkey_1.ContextKeyExpr.deserialize(argument);
                        if (expression) {
                            this.stepCompletionContextKeyExpressions.add(expression);
                            expression.keys().forEach(key => this.stepCompletionContextKeys.add(key));
                            event = eventType + ':' + expression.serialize();
                            if (this.contextService.contextMatchesRules(expression)) {
                                this.sessionEvents.add(event);
                            }
                        }
                        else {
                            console.error('Unable to parse context key expression:', expression, 'in walkthrough step', step.id);
                        }
                        break;
                    }
                    case 'onStepSelected':
                    case 'stepSelected':
                        event = 'stepSelected:' + step.id;
                        break;
                    case 'onCommand':
                        event = eventType + ':' + argument.replace(/^toSide:/, '');
                        break;
                    case 'onExtensionInstalled':
                    case 'extensionInstalled':
                        event = 'extensionInstalled:' + argument.toLowerCase();
                        break;
                    default:
                        console.error(`Unknown completionEvent ${event} when registering step ${step.id}`);
                        continue;
                }
                this.registerCompletionListener(event, step);
            }
        }
        registerCompletionListener(event, step) {
            if (!this.completionListeners.has(event)) {
                this.completionListeners.set(event, new Set());
            }
            this.completionListeners.get(event)?.add(step.id);
        }
        getStep(id) {
            const step = this.steps.get(id);
            if (!step) {
                throw Error('Attempting to access step which does not exist in registry ' + id);
            }
            return step;
        }
    };
    exports.WalkthroughsService = WalkthroughsService;
    exports.WalkthroughsService = WalkthroughsService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, commands_1.ICommandService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, userDataSync_1.IUserDataSyncEnablementService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, extensionManagement_1.IExtensionManagementService),
        __param(8, host_1.IHostService),
        __param(9, viewsService_1.IViewsService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, assignmentService_1.IWorkbenchAssignmentService)
    ], WalkthroughsService);
    const parseDescription = (desc) => desc.split('\n').filter(x => x).map(text => (0, linkedText_1.parseLinkedText)(text));
    const convertInternalMediaPathToFileURI = (path) => path.startsWith('https://')
        ? uri_1.URI.parse(path, true)
        : network_1.FileAccess.asFileUri(`vs/workbench/contrib/welcomeGettingStarted/common/media/${path}`);
    exports.convertInternalMediaPathToFileURI = convertInternalMediaPathToFileURI;
    const convertInternalMediaPathToBrowserURI = (path) => path.startsWith('https://')
        ? uri_1.URI.parse(path, true)
        : network_1.FileAccess.asBrowserUri(`vs/workbench/contrib/welcomeGettingStarted/common/media/${path}`);
    const convertInternalMediaPathsToBrowserURIs = (path) => {
        if (typeof path === 'string') {
            const converted = convertInternalMediaPathToBrowserURI(path);
            return { hcDark: converted, hcLight: converted, dark: converted, light: converted };
        }
        else {
            return {
                hcDark: convertInternalMediaPathToBrowserURI(path.hc),
                hcLight: convertInternalMediaPathToBrowserURI(path.hcLight ?? path.light),
                light: convertInternalMediaPathToBrowserURI(path.light),
                dark: convertInternalMediaPathToBrowserURI(path.dark)
            };
        }
    };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'resetGettingStartedProgress',
                category: { original: 'Developer', value: (0, nls_1.localize)('developer', "Developer") },
                title: { original: 'Reset Welcome Page Walkthrough Progress', value: (0, nls_1.localize)('resetWelcomePageWalkthroughProgress', "Reset Welcome Page Walkthrough Progress") },
                f1: true
            });
        }
        run(accessor) {
            const gettingStartedService = accessor.get(exports.IWalkthroughsService);
            const storageService = accessor.get(storage_1.IStorageService);
            storageService.store(exports.hiddenEntriesConfigurationKey, JSON.stringify([]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            storageService.store(exports.walkthroughMetadataConfigurationKey, JSON.stringify([]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const memento = new memento_1.Memento('gettingStartedService', accessor.get(storage_1.IStorageService));
            const record = memento.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            for (const key in record) {
                if (Object.prototype.hasOwnProperty.call(record, key)) {
                    try {
                        gettingStartedService.deprogressStep(key);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
            memento.saveMemento();
        }
    });
    (0, extensions_1.registerSingleton)(exports.IWalkthroughsService, WalkthroughsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dGluZ1N0YXJ0ZWRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWxjb21lR2V0dGluZ1N0YXJ0ZWQvYnJvd3Nlci9nZXR0aW5nU3RhcnRlZFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0NuRixRQUFBLHlCQUF5QixHQUFHLElBQUksMEJBQWEsQ0FBVSwyQkFBMkIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUUzRixRQUFBLG9CQUFvQixHQUFHLElBQUEsK0JBQWUsRUFBdUIscUJBQXFCLENBQUMsQ0FBQztJQUVwRixRQUFBLDZCQUE2QixHQUFHLHdDQUF3QyxDQUFDO0lBRXpFLFFBQUEsbUNBQW1DLEdBQUcsMkNBQTJDLENBQUM7SUFHL0YsTUFBTSxlQUFlLEdBQUcsSUFBQSxjQUFRLEVBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBZ0V4RCwyREFBMkQ7SUFDM0QsTUFBTSxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBQ2pDLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUUvQixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBNkJsRCxZQUNrQixjQUFnRCxFQUNoRCxjQUFnRCxFQUMxQyxvQkFBNEQsRUFDekQsdUJBQWtFLEVBQ3hFLGNBQW1ELEVBQ3ZDLDZCQUE4RSxFQUN2RixvQkFBNEQsRUFDdEQsMEJBQXdFLEVBQ3ZGLFdBQTBDLEVBQ3pDLFlBQTRDLEVBQ3hDLGdCQUFvRCxFQUMxQyxvQkFBa0U7WUFFL0YsS0FBSyxFQUFFLENBQUM7WUFiMEIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQy9CLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZ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