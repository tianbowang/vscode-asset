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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/formattedTextRenderer", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/button/button", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/ui/toggle/toggle", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/errors", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/themables", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/languages/language", "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/notification/common/notification", "vs/platform/opener/browser/link", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/common/workspaces", "vs/workbench/browser/actions/windowActions", "vs/workbench/browser/actions/workspaceActions", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/contextkeys", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/welcomeGettingStarted/browser/featuredExtensionService", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedDetailsRenderer", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedIcons", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService", "vs/workbench/contrib/welcomeGettingStarted/browser/startupPage", "vs/workbench/contrib/welcomeGettingStarted/common/gettingStartedContent", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/host/browser/host", "vs/workbench/services/themes/common/workbenchThemeService", "./gettingStartedList", "vs/css!./media/gettingStarted", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedColors"], function (require, exports, dom_1, formattedTextRenderer_1, keyboardEvent_1, button_1, iconLabels_1, scrollableElement_1, toggle_1, arrays_1, async_1, codicons_1, errors_1, labels_1, lifecycle_1, marshalling_1, network_1, platform_1, themables_1, types_1, uri_1, uuid_1, language_1, markdownRenderer_1, nls_1, accessibility_1, commands_1, configuration_1, contextkey_1, extensionManagement_1, extensions_1, files_1, instantiation_1, keybinding_1, label_1, notification_1, link_1, opener_1, productService_1, quickInput_1, storage_1, telemetry_1, telemetryUtils_1, defaultStyles_1, themeService_1, workspace_1, workspaces_1, windowActions_1, workspaceActions_1, editorPane_1, contextkeys_1, webview_1, featuredExtensionService_1, gettingStartedDetailsRenderer_1, gettingStartedIcons_1, gettingStartedInput_1, gettingStartedService_1, startupPage_1, gettingStartedContent_1, editorGroupsService_1, extensions_2, host_1, workbenchThemeService_1, gettingStartedList_1) {
    "use strict";
    var GettingStartedPage_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GettingStartedInputSerializer = exports.GettingStartedPage = exports.inWelcomeContext = exports.allWalkthroughsHiddenContext = void 0;
    const SLIDE_TRANSITION_TIME_MS = 250;
    const configurationKey = 'workbench.startupEditor';
    exports.allWalkthroughsHiddenContext = new contextkey_1.RawContextKey('allWalkthroughsHidden', false);
    exports.inWelcomeContext = new contextkey_1.RawContextKey('inWelcome', false);
    const parsedStartEntries = gettingStartedContent_1.startEntries.map((e, i) => ({
        command: e.content.command,
        description: e.description,
        icon: { type: 'icon', icon: e.icon },
        id: e.id,
        order: i,
        title: e.title,
        when: contextkey_1.ContextKeyExpr.deserialize(e.when) ?? contextkey_1.ContextKeyExpr.true()
    }));
    const REDUCED_MOTION_KEY = 'workbench.welcomePage.preferReducedMotion';
    let GettingStartedPage = class GettingStartedPage extends editorPane_1.EditorPane {
        static { GettingStartedPage_1 = this; }
        static { this.ID = 'gettingStartedPage'; }
        constructor(commandService, productService, keybindingService, gettingStartedService, featuredExtensionService, configurationService, telemetryService, languageService, fileService, openerService, themeService, storageService, extensionService, instantiationService, notificationService, groupsService, contextService, quickInputService, workspacesService, labelService, hostService, webviewService, workspaceContextService, accessibilityService, extensionManagementService) {
            super(GettingStartedPage_1.ID, telemetryService, themeService, storageService);
            this.commandService = commandService;
            this.productService = productService;
            this.keybindingService = keybindingService;
            this.gettingStartedService = gettingStartedService;
            this.featuredExtensionService = featuredExtensionService;
            this.configurationService = configurationService;
            this.languageService = languageService;
            this.fileService = fileService;
            this.openerService = openerService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.instantiationService = instantiationService;
            this.notificationService = notificationService;
            this.groupsService = groupsService;
            this.quickInputService = quickInputService;
            this.workspacesService = workspacesService;
            this.labelService = labelService;
            this.hostService = hostService;
            this.webviewService = webviewService;
            this.workspaceContextService = workspaceContextService;
            this.accessibilityService = accessibilityService;
            this.extensionManagementService = extensionManagementService;
            this.inProgressScroll = Promise.resolve();
            this.dispatchListeners = new lifecycle_1.DisposableStore();
            this.stepDisposables = new lifecycle_1.DisposableStore();
            this.detailsPageDisposables = new lifecycle_1.DisposableStore();
            this.mediaDisposables = new lifecycle_1.DisposableStore();
            this.buildSlideThrottle = new async_1.Throttler();
            this.hasScrolledToFirstCategory = false;
            this.currentMediaComponent = undefined;
            this.currentMediaType = undefined;
            this.container = (0, dom_1.$)('.gettingStartedContainer', {
                role: 'document',
                tabindex: 0,
                'aria-label': (0, nls_1.localize)('welcomeAriaLabel', "Overview of how to get up to speed with your editor.")
            });
            this.stepMediaComponent = (0, dom_1.$)('.getting-started-media');
            this.stepMediaComponent.id = (0, uuid_1.generateUuid)();
            this.categoriesSlideDisposables = this._register(new lifecycle_1.DisposableStore());
            this.detailsRenderer = new gettingStartedDetailsRenderer_1.GettingStartedDetailsRenderer(this.fileService, this.notificationService, this.extensionService, this.languageService);
            this.contextService = this._register(contextService.createScoped(this.container));
            exports.inWelcomeContext.bindTo(this.contextService).set(true);
            this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
            this.featuredExtensions = this.featuredExtensionService.getExtensions();
            this._register(this.dispatchListeners);
            this.buildSlideThrottle = new async_1.Throttler();
            const rerender = () => {
                this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
                this.featuredExtensions = this.featuredExtensionService.getExtensions();
                if (this.currentWalkthrough) {
                    const existingSteps = this.currentWalkthrough.steps.map(step => step.id);
                    const newCategory = this.gettingStartedCategories.find(category => this.currentWalkthrough?.id === category.id);
                    if (newCategory) {
                        const newSteps = newCategory.steps.map(step => step.id);
                        if (!(0, arrays_1.equals)(newSteps, existingSteps)) {
                            this.buildSlideThrottle.queue(() => this.buildCategoriesSlide());
                        }
                    }
                }
                else {
                    this.buildSlideThrottle.queue(() => this.buildCategoriesSlide());
                }
            };
            this._register(this.extensionManagementService.onDidInstallExtensions(async (result) => {
                for (const e of result) {
                    const installedFeaturedExtension = (await this.featuredExtensions)?.find(ext => extensions_1.ExtensionIdentifier.equals(ext.id, e.identifier.id));
                    if (installedFeaturedExtension) {
                        this.hideExtension(e.identifier.id);
                    }
                }
            }));
            this._register(this.gettingStartedService.onDidAddWalkthrough(rerender));
            this._register(this.gettingStartedService.onDidRemoveWalkthrough(rerender));
            this.recentlyOpened = this.workspacesService.getRecentlyOpened();
            this._register(workspacesService.onDidChangeRecentlyOpened(() => {
                this.recentlyOpened = workspacesService.getRecentlyOpened();
                rerender();
            }));
            this._register(this.gettingStartedService.onDidChangeWalkthrough(category => {
                const ourCategory = this.gettingStartedCategories.find(c => c.id === category.id);
                if (!ourCategory) {
                    return;
                }
                ourCategory.title = category.title;
                ourCategory.description = category.description;
                this.container.querySelectorAll(`[x-category-title-for="${category.id}"]`).forEach(step => step.innerText = ourCategory.title);
                this.container.querySelectorAll(`[x-category-description-for="${category.id}"]`).forEach(step => step.innerText = ourCategory.description);
            }));
            this._register(this.gettingStartedService.onDidProgressStep(step => {
                const category = this.gettingStartedCategories.find(category => category.id === step.category);
                if (!category) {
                    throw Error('Could not find category with ID: ' + step.category);
                }
                const ourStep = category.steps.find(_step => _step.id === step.id);
                if (!ourStep) {
                    throw Error('Could not find step with ID: ' + step.id);
                }
                const stats = this.getWalkthroughCompletionStats(category);
                if (!ourStep.done && stats.stepsComplete === stats.stepsTotal - 1) {
                    this.hideCategory(category.id);
                }
                this._register(this.configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(REDUCED_MOTION_KEY)) {
                        this.container.classList.toggle('animatable', this.shouldAnimate());
                    }
                }));
                ourStep.done = step.done;
                if (category.id === this.currentWalkthrough?.id) {
                    const badgeelements = (0, types_1.assertIsDefined)((0, dom_1.getWindow)(this.container).document.querySelectorAll(`[data-done-step-id="${step.id}"]`));
                    badgeelements.forEach(badgeelement => {
                        if (step.done) {
                            badgeelement.parentElement?.setAttribute('aria-checked', 'true');
                            badgeelement.classList.remove(...themables_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.gettingStartedUncheckedCodicon));
                            badgeelement.classList.add('complete', ...themables_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.gettingStartedCheckedCodicon));
                        }
                        else {
                            badgeelement.parentElement?.setAttribute('aria-checked', 'false');
                            badgeelement.classList.remove('complete', ...themables_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.gettingStartedCheckedCodicon));
                            badgeelement.classList.add(...themables_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.gettingStartedUncheckedCodicon));
                        }
                    });
                }
                this.updateCategoryProgress();
            }));
        }
        // remove when 'workbench.welcomePage.preferReducedMotion' deprecated
        shouldAnimate() {
            if (this.configurationService.getValue(REDUCED_MOTION_KEY)) {
                return false;
            }
            if (this.accessibilityService.isMotionReduced()) {
                return false;
            }
            return true;
        }
        getWalkthroughCompletionStats(walkthrough) {
            const activeSteps = walkthrough.steps.filter(s => this.contextService.contextMatchesRules(s.when));
            return {
                stepsComplete: activeSteps.filter(s => s.done).length,
                stepsTotal: activeSteps.length,
            };
        }
        async setInput(newInput, options, context, token) {
            this.container.classList.remove('animatable');
            this.editorInput = newInput;
            await super.setInput(newInput, options, context, token);
            await this.buildCategoriesSlide();
            if (this.shouldAnimate()) {
                setTimeout(() => this.container.classList.add('animatable'), 0);
            }
        }
        async makeCategoryVisibleWhenAvailable(categoryID, stepId) {
            this.scrollToCategory(categoryID, stepId);
        }
        registerDispatchListeners() {
            this.dispatchListeners.clear();
            this.container.querySelectorAll('[x-dispatch]').forEach(element => {
                const [command, argument] = (element.getAttribute('x-dispatch') ?? '').split(':');
                if (command) {
                    this.dispatchListeners.add((0, dom_1.addDisposableListener)(element, 'click', (e) => {
                        e.stopPropagation();
                        this.runDispatchCommand(command, argument);
                    }));
                    this.dispatchListeners.add((0, dom_1.addDisposableListener)(element, 'keyup', (e) => {
                        const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                        e.stopPropagation();
                        switch (keyboardEvent.keyCode) {
                            case 3 /* KeyCode.Enter */:
                            case 10 /* KeyCode.Space */:
                                this.runDispatchCommand(command, argument);
                                return;
                        }
                    }));
                }
            });
        }
        async runDispatchCommand(command, argument) {
            this.commandService.executeCommand('workbench.action.keepEditor');
            this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command, argument, walkthroughId: this.currentWalkthrough?.id });
            switch (command) {
                case 'scrollPrev': {
                    this.scrollPrev();
                    break;
                }
                case 'skip': {
                    this.runSkip();
                    break;
                }
                case 'showMoreRecents': {
                    this.commandService.executeCommand(windowActions_1.OpenRecentAction.ID);
                    break;
                }
                case 'seeAllWalkthroughs': {
                    await this.openWalkthroughSelector();
                    break;
                }
                case 'openFolder': {
                    if (this.contextService.contextMatchesRules(contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace')))) {
                        this.commandService.executeCommand(workspaceActions_1.OpenFolderViaWorkspaceAction.ID);
                    }
                    else {
                        this.commandService.executeCommand(platform_1.isMacintosh ? 'workbench.action.files.openFileFolder' : 'workbench.action.files.openFolder');
                    }
                    break;
                }
                case 'selectCategory': {
                    this.scrollToCategory(argument);
                    this.gettingStartedService.markWalkthroughOpened(argument);
                    break;
                }
                case 'selectStartEntry': {
                    const selected = gettingStartedContent_1.startEntries.find(e => e.id === argument);
                    if (selected) {
                        this.runStepCommand(selected.content.command);
                    }
                    else {
                        throw Error('could not find start entry with id: ' + argument);
                    }
                    break;
                }
                case 'hideCategory': {
                    this.hideCategory(argument);
                    break;
                }
                // Use selectTask over selectStep to keep telemetry consistant:https://github.com/microsoft/vscode/issues/122256
                case 'selectTask': {
                    this.selectStep(argument);
                    break;
                }
                case 'toggleStepCompletion': {
                    this.toggleStepCompletion(argument);
                    break;
                }
                case 'allDone': {
                    this.markAllStepsComplete();
                    break;
                }
                case 'nextSection': {
                    const next = this.currentWalkthrough?.next;
                    if (next) {
                        this.scrollToCategory(next);
                    }
                    else {
                        console.error('Error scrolling to next section of', this.currentWalkthrough);
                    }
                    break;
                }
                case 'openExtensionPage': {
                    this.commandService.executeCommand('extension.open', argument);
                    break;
                }
                case 'hideExtension': {
                    this.hideExtension(argument);
                    break;
                }
                default: {
                    console.error('Dispatch to', command, argument, 'not defined');
                    break;
                }
            }
        }
        hideCategory(categoryId) {
            const selectedCategory = this.gettingStartedCategories.find(category => category.id === categoryId);
            if (!selectedCategory) {
                throw Error('Could not find category with ID ' + categoryId);
            }
            this.setHiddenCategories([...this.getHiddenCategories().add(categoryId)]);
            this.gettingStartedList?.rerender();
        }
        hideExtension(extensionId) {
            this.setHiddenCategories([...this.getHiddenCategories().add(extensionId)]);
            this.featuredExtensionsList?.rerender();
            this.registerDispatchListeners();
        }
        markAllStepsComplete() {
            if (this.currentWalkthrough) {
                this.currentWalkthrough?.steps.forEach(step => {
                    if (!step.done) {
                        this.gettingStartedService.progressStep(step.id);
                    }
                });
                this.hideCategory(this.currentWalkthrough?.id);
                this.scrollPrev();
            }
            else {
                throw Error('No walkthrough opened');
            }
        }
        toggleStepCompletion(argument) {
            const stepToggle = (0, types_1.assertIsDefined)(this.currentWalkthrough?.steps.find(step => step.id === argument));
            if (stepToggle.done) {
                this.gettingStartedService.deprogressStep(argument);
            }
            else {
                this.gettingStartedService.progressStep(argument);
            }
        }
        async openWalkthroughSelector() {
            const selection = await this.quickInputService.pick(this.gettingStartedCategories
                .filter(c => this.contextService.contextMatchesRules(c.when))
                .map(x => ({
                id: x.id,
                label: x.title,
                detail: x.description,
                description: x.source,
            })), { canPickMany: false, matchOnDescription: true, matchOnDetail: true, title: (0, nls_1.localize)('pickWalkthroughs', "Open Walkthrough...") });
            if (selection) {
                this.runDispatchCommand('selectCategory', selection.id);
            }
        }
        getHiddenCategories() {
            return new Set(JSON.parse(this.storageService.get(gettingStartedService_1.hiddenEntriesConfigurationKey, 0 /* StorageScope.PROFILE */, '[]')));
        }
        setHiddenCategories(hidden) {
            this.storageService.store(gettingStartedService_1.hiddenEntriesConfigurationKey, JSON.stringify(hidden), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        async buildMediaComponent(stepId) {
            if (!this.currentWalkthrough) {
                throw Error('no walkthrough selected');
            }
            const stepToExpand = (0, types_1.assertIsDefined)(this.currentWalkthrough.steps.find(step => step.id === stepId));
            if (this.currentMediaComponent === stepId) {
                return;
            }
            this.currentMediaComponent = stepId;
            this.stepDisposables.clear();
            this.stepDisposables.add({
                dispose: () => {
                    this.currentMediaComponent = undefined;
                }
            });
            if (this.currentMediaType !== stepToExpand.media.type) {
                this.currentMediaType = stepToExpand.media.type;
                this.mediaDisposables.add((0, lifecycle_1.toDisposable)(() => {
                    this.currentMediaType = undefined;
                }));
                (0, dom_1.clearNode)(this.stepMediaComponent);
                if (stepToExpand.media.type === 'svg') {
                    this.webview = this.mediaDisposables.add(this.webviewService.createWebviewElement({ title: undefined, options: { disableServiceWorker: true }, contentOptions: {}, extension: undefined }));
                    this.webview.mountTo(this.stepMediaComponent);
                }
                else if (stepToExpand.media.type === 'markdown') {
                    this.webview = this.mediaDisposables.add(this.webviewService.createWebviewElement({ options: {}, contentOptions: { localResourceRoots: [stepToExpand.media.root], allowScripts: true }, title: '', extension: undefined }));
                    this.webview.mountTo(this.stepMediaComponent);
                }
            }
            if (stepToExpand.media.type === 'image') {
                this.stepsContent.classList.add('image');
                this.stepsContent.classList.remove('markdown');
                const media = stepToExpand.media;
                const mediaElement = (0, dom_1.$)('img');
                (0, dom_1.clearNode)(this.stepMediaComponent);
                this.stepMediaComponent.appendChild(mediaElement);
                mediaElement.setAttribute('alt', media.altText);
                this.updateMediaSourceForColorMode(mediaElement, media.path);
                this.stepDisposables.add((0, dom_1.addDisposableListener)(this.stepMediaComponent, 'click', () => {
                    const hrefs = (0, arrays_1.flatten)(stepToExpand.description.map(lt => lt.nodes.filter((node) => typeof node !== 'string').map(node => node.href)));
                    if (hrefs.length === 1) {
                        const href = hrefs[0];
                        if (href.startsWith('http')) {
                            this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'runStepAction', argument: href, walkthroughId: this.currentWalkthrough?.id });
                            this.openerService.open(href);
                        }
                    }
                }));
                this.stepDisposables.add(this.themeService.onDidColorThemeChange(() => this.updateMediaSourceForColorMode(mediaElement, media.path)));
            }
            else if (stepToExpand.media.type === 'svg') {
                this.stepsContent.classList.add('image');
                this.stepsContent.classList.remove('markdown');
                const media = stepToExpand.media;
                this.webview.setHtml(await this.detailsRenderer.renderSVG(media.path));
                let isDisposed = false;
                this.stepDisposables.add((0, lifecycle_1.toDisposable)(() => { isDisposed = true; }));
                this.stepDisposables.add(this.themeService.onDidColorThemeChange(async () => {
                    // Render again since color vars change
                    const body = await this.detailsRenderer.renderSVG(media.path);
                    if (!isDisposed) { // Make sure we weren't disposed of in the meantime
                        this.webview.setHtml(body);
                    }
                }));
                this.stepDisposables.add((0, dom_1.addDisposableListener)(this.stepMediaComponent, 'click', () => {
                    const hrefs = (0, arrays_1.flatten)(stepToExpand.description.map(lt => lt.nodes.filter((node) => typeof node !== 'string').map(node => node.href)));
                    if (hrefs.length === 1) {
                        const href = hrefs[0];
                        if (href.startsWith('http')) {
                            this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'runStepAction', argument: href, walkthroughId: this.currentWalkthrough?.id });
                            this.openerService.open(href);
                        }
                    }
                }));
                this.stepDisposables.add(this.webview.onDidClickLink(link => {
                    if ((0, network_1.matchesScheme)(link, network_1.Schemas.https) || (0, network_1.matchesScheme)(link, network_1.Schemas.http) || ((0, network_1.matchesScheme)(link, network_1.Schemas.command))) {
                        this.openerService.open(link, { allowCommands: true });
                    }
                }));
            }
            else if (stepToExpand.media.type === 'markdown') {
                this.stepsContent.classList.remove('image');
                this.stepsContent.classList.add('markdown');
                const media = stepToExpand.media;
                const rawHTML = await this.detailsRenderer.renderMarkdown(media.path, media.base);
                this.webview.setHtml(rawHTML);
                const serializedContextKeyExprs = rawHTML.match(/checked-on=\"([^'][^"]*)\"/g)?.map(attr => attr.slice('checked-on="'.length, -1)
                    .replace(/&#39;/g, '\'')
                    .replace(/&amp;/g, '&'));
                const postTrueKeysMessage = () => {
                    const enabledContextKeys = serializedContextKeyExprs?.filter(expr => this.contextService.contextMatchesRules(contextkey_1.ContextKeyExpr.deserialize(expr)));
                    if (enabledContextKeys) {
                        this.webview.postMessage({
                            enabledContextKeys
                        });
                    }
                };
                if (serializedContextKeyExprs) {
                    const contextKeyExprs = (0, arrays_1.coalesce)(serializedContextKeyExprs.map(expr => contextkey_1.ContextKeyExpr.deserialize(expr)));
                    const watchingKeys = new Set((0, arrays_1.flatten)(contextKeyExprs.map(expr => expr.keys())));
                    this.stepDisposables.add(this.contextService.onDidChangeContext(e => {
                        if (e.affectsSome(watchingKeys)) {
                            postTrueKeysMessage();
                        }
                    }));
                }
                let isDisposed = false;
                this.stepDisposables.add((0, lifecycle_1.toDisposable)(() => { isDisposed = true; }));
                this.stepDisposables.add(this.webview.onDidClickLink(link => {
                    if ((0, network_1.matchesScheme)(link, network_1.Schemas.https) || (0, network_1.matchesScheme)(link, network_1.Schemas.http) || ((0, network_1.matchesScheme)(link, network_1.Schemas.command))) {
                        this.openerService.open(link, { allowCommands: true });
                    }
                }));
                if (rawHTML.indexOf('<code>') >= 0) {
                    // Render again when Theme changes since syntax highlighting of code blocks may have changed
                    this.stepDisposables.add(this.themeService.onDidColorThemeChange(async () => {
                        const body = await this.detailsRenderer.renderMarkdown(media.path, media.base);
                        if (!isDisposed) { // Make sure we weren't disposed of in the meantime
                            this.webview.setHtml(body);
                            postTrueKeysMessage();
                        }
                    }));
                }
                const layoutDelayer = new async_1.Delayer(50);
                this.layoutMarkdown = () => {
                    layoutDelayer.trigger(() => {
                        this.webview.postMessage({ layoutMeNow: true });
                    });
                };
                this.stepDisposables.add(layoutDelayer);
                this.stepDisposables.add({ dispose: () => this.layoutMarkdown = undefined });
                postTrueKeysMessage();
                this.stepDisposables.add(this.webview.onMessage(e => {
                    const message = e.message;
                    if (message.startsWith('command:')) {
                        this.openerService.open(message, { allowCommands: true });
                    }
                    else if (message.startsWith('setTheme:')) {
                        this.configurationService.updateValue(workbenchThemeService_1.ThemeSettings.COLOR_THEME, message.slice('setTheme:'.length), 2 /* ConfigurationTarget.USER */);
                    }
                    else {
                        console.error('Unexpected message', message);
                    }
                }));
            }
        }
        async selectStepLoose(id) {
            // Allow passing in id with a category appended or with just the id of the step
            if (id.startsWith(`${this.editorInput.selectedCategory}#`)) {
                this.selectStep(id);
            }
            else {
                const toSelect = this.editorInput.selectedCategory + '#' + id;
                this.selectStep(toSelect);
            }
        }
        async selectStep(id, delayFocus = true) {
            if (id) {
                let stepElement = this.container.querySelector(`[data-step-id="${id}"]`);
                if (!stepElement) {
                    // Selected an element that is not in-context, just fallback to whatever.
                    stepElement = this.container.querySelector(`[data-step-id]`);
                    if (!stepElement) {
                        // No steps around... just ignore.
                        return;
                    }
                    id = (0, types_1.assertIsDefined)(stepElement.getAttribute('data-step-id'));
                }
                stepElement.parentElement?.querySelectorAll('.expanded').forEach(node => {
                    if (node.getAttribute('data-step-id') !== id) {
                        node.classList.remove('expanded');
                        node.setAttribute('aria-expanded', 'false');
                    }
                });
                setTimeout(() => stepElement.focus(), delayFocus && this.shouldAnimate() ? SLIDE_TRANSITION_TIME_MS : 0);
                this.editorInput.selectedStep = id;
                stepElement.classList.add('expanded');
                stepElement.setAttribute('aria-expanded', 'true');
                this.buildMediaComponent(id);
                this.gettingStartedService.progressStep(id);
            }
            else {
                this.editorInput.selectedStep = undefined;
            }
            this.detailsPageScrollbar?.scanDomNode();
            this.detailsScrollbar?.scanDomNode();
        }
        updateMediaSourceForColorMode(element, sources) {
            const themeType = this.themeService.getColorTheme().type;
            const src = sources[themeType].toString(true).replace(/ /g, '%20');
            element.srcset = src.toLowerCase().endsWith('.svg') ? src : (src + ' 1.5x');
        }
        createEditor(parent) {
            if (this.detailsPageScrollbar) {
                this.detailsPageScrollbar.dispose();
            }
            if (this.categoriesPageScrollbar) {
                this.categoriesPageScrollbar.dispose();
            }
            this.categoriesSlide = (0, dom_1.$)('.gettingStartedSlideCategories.gettingStartedSlide');
            const prevButton = (0, dom_1.$)('button.prev-button.button-link', { 'x-dispatch': 'scrollPrev' }, (0, dom_1.$)('span.scroll-button.codicon.codicon-chevron-left'), (0, dom_1.$)('span.moreText', {}, (0, nls_1.localize)('welcome', "Welcome")));
            this.stepsSlide = (0, dom_1.$)('.gettingStartedSlideDetails.gettingStartedSlide', {}, prevButton);
            this.stepsContent = (0, dom_1.$)('.gettingStartedDetailsContent', {});
            this.detailsPageScrollbar = this._register(new scrollableElement_1.DomScrollableElement(this.stepsContent, { className: 'full-height-scrollable' }));
            this.categoriesPageScrollbar = this._register(new scrollableElement_1.DomScrollableElement(this.categoriesSlide, { className: 'full-height-scrollable categoriesScrollbar' }));
            this.stepsSlide.appendChild(this.detailsPageScrollbar.getDomNode());
            const gettingStartedPage = (0, dom_1.$)('.gettingStarted', {}, this.categoriesPageScrollbar.getDomNode(), this.stepsSlide);
            this.container.appendChild(gettingStartedPage);
            this.categoriesPageScrollbar.scanDomNode();
            this.detailsPageScrollbar.scanDomNode();
            parent.appendChild(this.container);
        }
        async buildCategoriesSlide() {
            this.categoriesSlideDisposables.clear();
            const showOnStartupCheckbox = new toggle_1.Toggle({
                icon: codicons_1.Codicon.check,
                actionClassName: 'getting-started-checkbox',
                isChecked: this.configurationService.getValue(configurationKey) === 'welcomePage',
                title: (0, nls_1.localize)('checkboxTitle', "When checked, this page will be shown on startup."),
                ...defaultStyles_1.defaultToggleStyles
            });
            showOnStartupCheckbox.domNode.id = 'showOnStartup';
            const showOnStartupLabel = (0, dom_1.$)('label.caption', { for: 'showOnStartup' }, (0, nls_1.localize)('welcomePage.showOnStartup', "Show welcome page on startup"));
            const onShowOnStartupChanged = () => {
                if (showOnStartupCheckbox.checked) {
                    this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'showOnStartupChecked', argument: undefined, walkthroughId: this.currentWalkthrough?.id });
                    this.configurationService.updateValue(configurationKey, 'welcomePage');
                }
                else {
                    this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'showOnStartupUnchecked', argument: undefined, walkthroughId: this.currentWalkthrough?.id });
                    this.configurationService.updateValue(configurationKey, 'none');
                }
            };
            this.categoriesSlideDisposables.add(showOnStartupCheckbox);
            this.categoriesSlideDisposables.add(showOnStartupCheckbox.onChange(() => {
                onShowOnStartupChanged();
            }));
            this.categoriesSlideDisposables.add((0, dom_1.addDisposableListener)(showOnStartupLabel, 'click', () => {
                showOnStartupCheckbox.checked = !showOnStartupCheckbox.checked;
                onShowOnStartupChanged();
            }));
            const header = (0, dom_1.$)('.header', {}, (0, dom_1.$)('h1.product-name.caption', {}, this.productService.nameLong), (0, dom_1.$)('p.subtitle.description', {}, (0, nls_1.localize)({ key: 'gettingStarted.editingEvolved', comment: ['Shown as subtitle on the Welcome page.'] }, "Editing evolved")));
            const leftColumn = (0, dom_1.$)('.categories-column.categories-column-left', {});
            const rightColumn = (0, dom_1.$)('.categories-column.categories-column-right', {});
            const startList = this.buildStartList();
            const recentList = this.buildRecentlyOpenedList();
            const featuredExtensionList = this.buildFeaturedExtensionsList();
            const gettingStartedList = this.buildGettingStartedWalkthroughsList();
            const footer = (0, dom_1.$)('.footer', {}, (0, dom_1.$)('p.showOnStartup', {}, showOnStartupCheckbox.domNode, showOnStartupLabel));
            const layoutLists = () => {
                if (gettingStartedList.itemCount) {
                    this.container.classList.remove('noWalkthroughs');
                    (0, dom_1.reset)(rightColumn, featuredExtensionList.getDomElement(), gettingStartedList.getDomElement());
                }
                else {
                    this.container.classList.add('noWalkthroughs');
                    (0, dom_1.reset)(rightColumn, featuredExtensionList.getDomElement());
                }
                setTimeout(() => this.categoriesPageScrollbar?.scanDomNode(), 50);
                layoutRecentList();
            };
            const layoutFeaturedExtension = () => {
                if (featuredExtensionList.itemCount) {
                    this.container.classList.remove('noExtensions');
                    (0, dom_1.reset)(rightColumn, featuredExtensionList.getDomElement(), gettingStartedList.getDomElement());
                }
                else {
                    this.container.classList.add('noExtensions');
                    (0, dom_1.reset)(rightColumn, gettingStartedList.getDomElement());
                }
                setTimeout(() => this.categoriesPageScrollbar?.scanDomNode(), 50);
                layoutRecentList();
            };
            const layoutRecentList = () => {
                if (this.container.classList.contains('noWalkthroughs') && this.container.classList.contains('noExtensions')) {
                    recentList.setLimit(10);
                    (0, dom_1.reset)(leftColumn, startList.getDomElement());
                    (0, dom_1.reset)(rightColumn, recentList.getDomElement());
                }
                else {
                    recentList.setLimit(5);
                    (0, dom_1.reset)(leftColumn, startList.getDomElement(), recentList.getDomElement());
                }
            };
            featuredExtensionList.onDidChange(layoutFeaturedExtension);
            layoutFeaturedExtension();
            gettingStartedList.onDidChange(layoutLists);
            layoutLists();
            (0, dom_1.reset)(this.categoriesSlide, (0, dom_1.$)('.gettingStartedCategoriesContainer', {}, header, leftColumn, rightColumn, footer));
            this.categoriesPageScrollbar?.scanDomNode();
            this.updateCategoryProgress();
            this.registerDispatchListeners();
            if (this.editorInput.selectedCategory) {
                this.currentWalkthrough = this.gettingStartedCategories.find(category => category.id === this.editorInput.selectedCategory);
                if (!this.currentWalkthrough) {
                    this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
                    this.currentWalkthrough = this.gettingStartedCategories.find(category => category.id === this.editorInput.selectedCategory);
                    if (this.currentWalkthrough) {
                        this.buildCategorySlide(this.editorInput.selectedCategory, this.editorInput.selectedStep);
                        this.setSlide('details');
                        return;
                    }
                }
            }
            const someStepsComplete = this.gettingStartedCategories.some(category => category.steps.find(s => s.done));
            if (this.editorInput.showTelemetryNotice && this.productService.openToWelcomeMainPage) {
                const telemetryNotice = (0, dom_1.$)('p.telemetry-notice');
                this.buildTelemetryFooter(telemetryNotice);
                footer.appendChild(telemetryNotice);
            }
            else if (!this.productService.openToWelcomeMainPage && !someStepsComplete && !this.hasScrolledToFirstCategory) {
                const firstSessionDateString = this.storageService.get(telemetry_1.firstSessionDateStorageKey, -1 /* StorageScope.APPLICATION */) || new Date().toUTCString();
                const daysSinceFirstSession = ((+new Date()) - (+new Date(firstSessionDateString))) / 1000 / 60 / 60 / 24;
                const fistContentBehaviour = daysSinceFirstSession < 1 ? 'openToFirstCategory' : 'index';
                if (fistContentBehaviour === 'openToFirstCategory') {
                    const first = this.gettingStartedCategories.filter(c => !c.when || this.contextService.contextMatchesRules(c.when))[0];
                    this.hasScrolledToFirstCategory = true;
                    if (first) {
                        this.currentWalkthrough = first;
                        this.editorInput.selectedCategory = this.currentWalkthrough?.id;
                        this.buildCategorySlide(this.editorInput.selectedCategory, undefined);
                        this.setSlide('details');
                        return;
                    }
                }
            }
            this.setSlide('categories');
        }
        buildRecentlyOpenedList() {
            const renderRecent = (recent) => {
                let fullPath;
                let windowOpenable;
                if ((0, workspaces_1.isRecentFolder)(recent)) {
                    windowOpenable = { folderUri: recent.folderUri };
                    fullPath = recent.label || this.labelService.getWorkspaceLabel(recent.folderUri, { verbose: 2 /* Verbosity.LONG */ });
                }
                else {
                    fullPath = recent.label || this.labelService.getWorkspaceLabel(recent.workspace, { verbose: 2 /* Verbosity.LONG */ });
                    windowOpenable = { workspaceUri: recent.workspace.configPath };
                }
                const { name, parentPath } = (0, labels_1.splitRecentLabel)(fullPath);
                const li = (0, dom_1.$)('li');
                const link = (0, dom_1.$)('button.button-link');
                link.innerText = name;
                link.title = fullPath;
                link.setAttribute('aria-label', (0, nls_1.localize)('welcomePage.openFolderWithPath', "Open folder {0} with path {1}", name, parentPath));
                link.addEventListener('click', e => {
                    this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'openRecent', argument: undefined, walkthroughId: this.currentWalkthrough?.id });
                    this.hostService.openWindow([windowOpenable], {
                        forceNewWindow: e.ctrlKey || e.metaKey,
                        remoteAuthority: recent.remoteAuthority || null // local window if remoteAuthority is not set or can not be deducted from the openable
                    });
                    e.preventDefault();
                    e.stopPropagation();
                });
                li.appendChild(link);
                const span = (0, dom_1.$)('span');
                span.classList.add('path');
                span.classList.add('detail');
                span.innerText = parentPath;
                span.title = fullPath;
                li.appendChild(span);
                return li;
            };
            if (this.recentlyOpenedList) {
                this.recentlyOpenedList.dispose();
            }
            const recentlyOpenedList = this.recentlyOpenedList = new gettingStartedList_1.GettingStartedIndexList({
                title: (0, nls_1.localize)('recent', "Recent"),
                klass: 'recently-opened',
                limit: 5,
                empty: (0, dom_1.$)('.empty-recent', {}, (0, nls_1.localize)('noRecents', "You have no recent folders,"), (0, dom_1.$)('button.button-link', { 'x-dispatch': 'openFolder' }, (0, nls_1.localize)('openFolder', "open a folder")), (0, nls_1.localize)('toStart', "to start.")),
                more: (0, dom_1.$)('.more', {}, (0, dom_1.$)('button.button-link', {
                    'x-dispatch': 'showMoreRecents',
                    title: (0, nls_1.localize)('show more recents', "Show All Recent Folders {0}", this.getKeybindingLabel(windowActions_1.OpenRecentAction.ID))
                }, (0, nls_1.localize)('showAll', "More..."))),
                renderElement: renderRecent,
                contextService: this.contextService
            });
            recentlyOpenedList.onDidChange(() => this.registerDispatchListeners());
            this.recentlyOpened.then(({ workspaces }) => {
                // Filter out the current workspace
                const workspacesWithID = workspaces
                    .filter(recent => !this.workspaceContextService.isCurrentWorkspace((0, workspaces_1.isRecentWorkspace)(recent) ? recent.workspace : recent.folderUri))
                    .map(recent => ({ ...recent, id: (0, workspaces_1.isRecentWorkspace)(recent) ? recent.workspace.id : recent.folderUri.toString() }));
                const updateEntries = () => {
                    recentlyOpenedList.setEntries(workspacesWithID);
                };
                updateEntries();
                recentlyOpenedList.register(this.labelService.onDidChangeFormatters(() => updateEntries()));
            }).catch(errors_1.onUnexpectedError);
            return recentlyOpenedList;
        }
        buildStartList() {
            const renderStartEntry = (entry) => (0, dom_1.$)('li', {}, (0, dom_1.$)('button.button-link', {
                'x-dispatch': 'selectStartEntry:' + entry.id,
                title: entry.description + ' ' + this.getKeybindingLabel(entry.command),
            }, this.iconWidgetFor(entry), (0, dom_1.$)('span', {}, entry.title)));
            if (this.startList) {
                this.startList.dispose();
            }
            const startList = this.startList = new gettingStartedList_1.GettingStartedIndexList({
                title: (0, nls_1.localize)('start', "Start"),
                klass: 'start-container',
                limit: 10,
                renderElement: renderStartEntry,
                rankElement: e => -e.order,
                contextService: this.contextService
            });
            startList.setEntries(parsedStartEntries);
            startList.onDidChange(() => this.registerDispatchListeners());
            return startList;
        }
        buildGettingStartedWalkthroughsList() {
            const renderGetttingStaredWalkthrough = (category) => {
                const renderNewBadge = (category.newItems || category.newEntry) && !category.isFeatured;
                const newBadge = (0, dom_1.$)('.new-badge', {});
                if (category.newEntry) {
                    (0, dom_1.reset)(newBadge, (0, dom_1.$)('.new-category', {}, (0, nls_1.localize)('new', "New")));
                }
                else if (category.newItems) {
                    (0, dom_1.reset)(newBadge, (0, dom_1.$)('.new-items', {}, (0, nls_1.localize)({ key: 'newItems', comment: ['Shown when a list of items has changed based on an update from a remote source'] }, "Updated")));
                }
                const featuredBadge = (0, dom_1.$)('.featured-badge', {});
                const descriptionContent = (0, dom_1.$)('.description-content', {});
                if (category.isFeatured) {
                    (0, dom_1.reset)(featuredBadge, (0, dom_1.$)('.featured', {}, (0, dom_1.$)('span.featured-icon.codicon.codicon-star-full')));
                    (0, dom_1.reset)(descriptionContent, ...(0, iconLabels_1.renderLabelWithIcons)(category.description));
                }
                const titleContent = (0, dom_1.$)('h3.category-title.max-lines-3', { 'x-category-title-for': category.id });
                (0, dom_1.reset)(titleContent, ...(0, iconLabels_1.renderLabelWithIcons)(category.title));
                return (0, dom_1.$)('button.getting-started-category' + (category.isFeatured ? '.featured' : ''), {
                    'x-dispatch': 'selectCategory:' + category.id,
                    'title': category.description
                }, featuredBadge, (0, dom_1.$)('.main-content', {}, this.iconWidgetFor(category), titleContent, renderNewBadge ? newBadge : (0, dom_1.$)('.no-badge'), (0, dom_1.$)('a.codicon.codicon-close.hide-category-button', {
                    'tabindex': 0,
                    'x-dispatch': 'hideCategory:' + category.id,
                    'title': (0, nls_1.localize)('close', "Hide"),
                    'role': 'button',
                    'aria-label': (0, nls_1.localize)('closeAriaLabel', "Hide"),
                })), descriptionContent, (0, dom_1.$)('.category-progress', { 'x-data-category-id': category.id, }, (0, dom_1.$)('.progress-bar-outer', { 'role': 'progressbar' }, (0, dom_1.$)('.progress-bar-inner'))));
            };
            if (this.gettingStartedList) {
                this.gettingStartedList.dispose();
            }
            const rankWalkthrough = (e) => {
                let rank = e.order;
                if (e.isFeatured) {
                    rank += 7;
                }
                if (e.newEntry) {
                    rank += 3;
                }
                if (e.newItems) {
                    rank += 2;
                }
                if (e.recencyBonus) {
                    rank += 4 * e.recencyBonus;
                }
                if (this.getHiddenCategories().has(e.id)) {
                    rank = null;
                }
                return rank;
            };
            const gettingStartedList = this.gettingStartedList = new gettingStartedList_1.GettingStartedIndexList({
                title: (0, nls_1.localize)('walkthroughs', "Walkthroughs"),
                klass: 'getting-started',
                limit: 5,
                footer: (0, dom_1.$)('span.button-link.see-all-walkthroughs', { 'x-dispatch': 'seeAllWalkthroughs', 'tabindex': 0 }, (0, nls_1.localize)('showAll', "More...")),
                renderElement: renderGetttingStaredWalkthrough,
                rankElement: rankWalkthrough,
                contextService: this.contextService,
            });
            gettingStartedList.onDidChange(() => {
                const hidden = this.getHiddenCategories();
                const someWalkthroughsHidden = hidden.size || gettingStartedList.itemCount < this.gettingStartedCategories.filter(c => this.contextService.contextMatchesRules(c.when)).length;
                this.container.classList.toggle('someWalkthroughsHidden', !!someWalkthroughsHidden);
                this.registerDispatchListeners();
                exports.allWalkthroughsHiddenContext.bindTo(this.contextService).set(gettingStartedList.itemCount === 0);
                this.updateCategoryProgress();
            });
            gettingStartedList.setEntries(this.gettingStartedCategories);
            exports.allWalkthroughsHiddenContext.bindTo(this.contextService).set(gettingStartedList.itemCount === 0);
            return gettingStartedList;
        }
        buildFeaturedExtensionsList() {
            const renderFeaturedExtensions = (entry) => {
                const descriptionContent = (0, dom_1.$)('.featured-description-content', {});
                (0, dom_1.reset)(descriptionContent, ...(0, iconLabels_1.renderLabelWithIcons)(entry.description));
                const titleContent = (0, dom_1.$)('h3.category-title.max-lines-3', { 'x-category-title-for': entry.id });
                (0, dom_1.reset)(titleContent, ...(0, iconLabels_1.renderLabelWithIcons)(entry.title));
                return (0, dom_1.$)('button.getting-started-category', {
                    'x-dispatch': 'openExtensionPage:' + entry.id,
                    'title': entry.description
                }, (0, dom_1.$)('.main-content', {}, (0, dom_1.$)('img.featured-icon.icon-widget', { src: entry.imagePath }), titleContent, (0, dom_1.$)('a.codicon.codicon-close.hide-category-button', {
                    'tabindex': 0,
                    'x-dispatch': 'hideExtension:' + entry.id,
                    'title': (0, nls_1.localize)('close', "Hide"),
                    'role': 'button',
                    'aria-label': (0, nls_1.localize)('closeAriaLabel', "Hide"),
                })), descriptionContent);
            };
            if (this.featuredExtensionsList) {
                this.featuredExtensionsList.dispose();
            }
            const featuredExtensionsList = this.featuredExtensionsList = new gettingStartedList_1.GettingStartedIndexList({
                title: this.featuredExtensionService.title,
                klass: 'featured-extensions',
                limit: 5,
                renderElement: renderFeaturedExtensions,
                rankElement: (extension) => { if (this.getHiddenCategories().has(extension.id)) {
                    return null;
                } return 0; },
                contextService: this.contextService,
            });
            this.featuredExtensions?.then(extensions => {
                featuredExtensionsList.setEntries(extensions);
            });
            this.featuredExtensionsList?.onDidChange(() => {
                this.registerDispatchListeners();
            });
            return featuredExtensionsList;
        }
        layout(size) {
            this.detailsScrollbar?.scanDomNode();
            this.categoriesPageScrollbar?.scanDomNode();
            this.detailsPageScrollbar?.scanDomNode();
            this.startList?.layout(size);
            this.gettingStartedList?.layout(size);
            this.featuredExtensionsList?.layout(size);
            this.recentlyOpenedList?.layout(size);
            if (this.editorInput?.selectedStep && this.currentMediaType) {
                this.mediaDisposables.clear();
                this.stepDisposables.clear();
                this.buildMediaComponent(this.editorInput.selectedStep);
            }
            this.layoutMarkdown?.();
            this.container.classList.toggle('height-constrained', size.height <= 600);
            this.container.classList.toggle('width-constrained', size.width <= 400);
            this.container.classList.toggle('width-semi-constrained', size.width <= 800);
            this.categoriesPageScrollbar?.scanDomNode();
            this.detailsPageScrollbar?.scanDomNode();
            this.detailsScrollbar?.scanDomNode();
        }
        updateCategoryProgress() {
            (0, dom_1.getWindow)(this.container).document.querySelectorAll('.category-progress').forEach(element => {
                const categoryID = element.getAttribute('x-data-category-id');
                const category = this.gettingStartedCategories.find(category => category.id === categoryID);
                if (!category) {
                    throw Error('Could not find category with ID ' + categoryID);
                }
                const stats = this.getWalkthroughCompletionStats(category);
                const bar = (0, types_1.assertIsDefined)(element.querySelector('.progress-bar-inner'));
                bar.setAttribute('aria-valuemin', '0');
                bar.setAttribute('aria-valuenow', '' + stats.stepsComplete);
                bar.setAttribute('aria-valuemax', '' + stats.stepsTotal);
                const progress = (stats.stepsComplete / stats.stepsTotal) * 100;
                bar.style.width = `${progress}%`;
                element.parentElement.classList.toggle('no-progress', stats.stepsComplete === 0);
                if (stats.stepsTotal === stats.stepsComplete) {
                    bar.title = (0, nls_1.localize)('gettingStarted.allStepsComplete', "All {0} steps complete!", stats.stepsComplete);
                }
                else {
                    bar.title = (0, nls_1.localize)('gettingStarted.someStepsComplete', "{0} of {1} steps complete", stats.stepsComplete, stats.stepsTotal);
                }
            });
        }
        async scrollToCategory(categoryID, stepId) {
            if (!this.gettingStartedCategories.some(c => c.id === categoryID)) {
                this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
            }
            const ourCategory = this.gettingStartedCategories.find(c => c.id === categoryID);
            if (!ourCategory) {
                throw Error('Could not find category with ID: ' + categoryID);
            }
            this.inProgressScroll = this.inProgressScroll.then(async () => {
                (0, dom_1.reset)(this.stepsContent);
                this.editorInput.selectedCategory = categoryID;
                this.editorInput.selectedStep = stepId;
                this.currentWalkthrough = ourCategory;
                this.buildCategorySlide(categoryID);
                this.setSlide('details');
            });
        }
        iconWidgetFor(category) {
            const widget = category.icon.type === 'icon' ? (0, dom_1.$)(themables_1.ThemeIcon.asCSSSelector(category.icon.icon)) : (0, dom_1.$)('img.category-icon', { src: category.icon.path });
            widget.classList.add('icon-widget');
            return widget;
        }
        runStepCommand(href) {
            const isCommand = href.startsWith('command:');
            const toSide = href.startsWith('command:toSide:');
            const command = href.replace(/command:(toSide:)?/, 'command:');
            this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'runStepAction', argument: href, walkthroughId: this.currentWalkthrough?.id });
            const fullSize = this.group ? this.groupsService.getPart(this.group).contentDimension : undefined;
            if (toSide && fullSize && fullSize.width > 700) {
                if (this.groupsService.count === 1) {
                    const sideGroup = this.groupsService.addGroup(this.groupsService.groups[0], 3 /* GroupDirection.RIGHT */);
                    this.groupsService.activateGroup(sideGroup);
                    const gettingStartedSize = Math.floor(fullSize.width / 2);
                    const gettingStartedGroup = this.groupsService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */).find(group => (group.activeEditor instanceof gettingStartedInput_1.GettingStartedInput));
                    this.groupsService.setSize((0, types_1.assertIsDefined)(gettingStartedGroup), { width: gettingStartedSize, height: fullSize.height });
                }
                const nonGettingStartedGroup = this.groupsService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */).find(group => !(group.activeEditor instanceof gettingStartedInput_1.GettingStartedInput));
                if (nonGettingStartedGroup) {
                    this.groupsService.activateGroup(nonGettingStartedGroup);
                    nonGettingStartedGroup.focus();
                }
            }
            if (isCommand) {
                const commandURI = uri_1.URI.parse(command);
                // execute as command
                let args = [];
                try {
                    args = (0, marshalling_1.parse)(decodeURIComponent(commandURI.query));
                }
                catch {
                    // ignore and retry
                    try {
                        args = (0, marshalling_1.parse)(commandURI.query);
                    }
                    catch {
                        // ignore error
                    }
                }
                if (!Array.isArray(args)) {
                    args = [args];
                }
                // If a step is requesting the OpenFolder action to be executed in an empty workspace...
                if ((commandURI.path === workspaceActions_1.OpenFileFolderAction.ID.toString() ||
                    commandURI.path === workspaceActions_1.OpenFolderAction.ID.toString()) &&
                    this.workspaceContextService.getWorkspace().folders.length === 0) {
                    const selectedStepIndex = this.currentWalkthrough?.steps.findIndex(step => step.id === this.editorInput.selectedStep);
                    // and there are a few more steps after this step which are yet to be completed...
                    if (selectedStepIndex !== undefined &&
                        selectedStepIndex > -1 &&
                        this.currentWalkthrough?.steps.slice(selectedStepIndex + 1).some(step => !step.done)) {
                        const restoreData = { folder: workspace_1.UNKNOWN_EMPTY_WINDOW_WORKSPACE.id, category: this.editorInput.selectedCategory, step: this.editorInput.selectedStep };
                        // save state to restore after reload
                        this.storageService.store(startupPage_1.restoreWalkthroughsConfigurationKey, JSON.stringify(restoreData), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                    }
                }
                this.commandService.executeCommand(commandURI.path, ...args).then(result => {
                    const toOpen = result?.openFolder;
                    if (toOpen) {
                        if (!uri_1.URI.isUri(toOpen)) {
                            console.warn('Warn: Running walkthrough command', href, 'yielded non-URI `openFolder` result', toOpen, '. It will be disregarded.');
                            return;
                        }
                        const restoreData = { folder: toOpen.toString(), category: this.editorInput.selectedCategory, step: this.editorInput.selectedStep };
                        this.storageService.store(startupPage_1.restoreWalkthroughsConfigurationKey, JSON.stringify(restoreData), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                        this.hostService.openWindow([{ folderUri: toOpen }]);
                    }
                });
            }
            else {
                this.openerService.open(command, { allowCommands: true });
            }
            if (!isCommand && (href.startsWith('https://') || href.startsWith('http://'))) {
                this.gettingStartedService.progressByEvent('onLink:' + href);
            }
        }
        buildStepMarkdownDescription(container, text) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            for (const linkedText of text) {
                if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== 'string') {
                    const node = linkedText.nodes[0];
                    const buttonContainer = (0, dom_1.append)(container, (0, dom_1.$)('.button-container'));
                    const button = new button_1.Button(buttonContainer, { title: node.title, supportIcons: true, ...defaultStyles_1.defaultButtonStyles });
                    const isCommand = node.href.startsWith('command:');
                    const command = node.href.replace(/command:(toSide:)?/, 'command:');
                    button.label = node.label;
                    button.onDidClick(e => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.runStepCommand(node.href);
                    }, null, this.detailsPageDisposables);
                    if (isCommand) {
                        const keybindingLabel = this.getKeybindingLabel(command);
                        if (keybindingLabel) {
                            container.appendChild((0, dom_1.$)('span.shortcut-message', {}, (0, nls_1.localize)('gettingStarted.keyboardTip', 'Tip: Use keyboard shortcut '), (0, dom_1.$)('span.keybinding', {}, keybindingLabel)));
                        }
                    }
                    this.detailsPageDisposables.add(button);
                }
                else {
                    const p = (0, dom_1.append)(container, (0, dom_1.$)('p'));
                    for (const node of linkedText.nodes) {
                        if (typeof node === 'string') {
                            const labelWithIcon = (0, iconLabels_1.renderLabelWithIcons)(node);
                            for (const element of labelWithIcon) {
                                if (typeof element === 'string') {
                                    p.appendChild((0, formattedTextRenderer_1.renderFormattedText)(element, { inline: true, renderCodeSegments: true }));
                                }
                                else {
                                    p.appendChild(element);
                                }
                            }
                        }
                        else {
                            const link = this.instantiationService.createInstance(link_1.Link, p, node, { opener: (href) => this.runStepCommand(href) });
                            this.detailsPageDisposables.add(link);
                        }
                    }
                }
            }
            return container;
        }
        clearInput() {
            this.stepDisposables.clear();
            super.clearInput();
        }
        buildCategorySlide(categoryID, selectedStep) {
            if (this.detailsScrollbar) {
                this.detailsScrollbar.dispose();
            }
            this.extensionService.whenInstalledExtensionsRegistered().then(() => {
                // Remove internal extension id specifier from exposed id's
                this.extensionService.activateByEvent(`onWalkthrough:${categoryID.replace(/[^#]+#/, '')}`);
            });
            this.detailsPageDisposables.clear();
            this.mediaDisposables.clear();
            const category = this.gettingStartedCategories.find(category => category.id === categoryID);
            if (!category) {
                throw Error('could not find category with ID ' + categoryID);
            }
            const categoryDescriptorComponent = (0, dom_1.$)('.getting-started-category', {}, (0, dom_1.$)('.category-description-container', {}, (0, dom_1.$)('h2.category-title.max-lines-3', { 'x-category-title-for': category.id }, ...(0, iconLabels_1.renderLabelWithIcons)(category.title)), (0, dom_1.$)('.category-description.description.max-lines-3', { 'x-category-description-for': category.id }, ...(0, iconLabels_1.renderLabelWithIcons)(category.description))));
            const stepListContainer = (0, dom_1.$)('.step-list-container');
            this.detailsPageDisposables.add((0, dom_1.addDisposableListener)(stepListContainer, 'keydown', (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                const currentStepIndex = () => category.steps.findIndex(e => e.id === this.editorInput.selectedStep);
                if (event.keyCode === 16 /* KeyCode.UpArrow */) {
                    const toExpand = category.steps.filter((step, index) => index < currentStepIndex() && this.contextService.contextMatchesRules(step.when));
                    if (toExpand.length) {
                        this.selectStep(toExpand[toExpand.length - 1].id, false);
                    }
                }
                if (event.keyCode === 18 /* KeyCode.DownArrow */) {
                    const toExpand = category.steps.find((step, index) => index > currentStepIndex() && this.contextService.contextMatchesRules(step.when));
                    if (toExpand) {
                        this.selectStep(toExpand.id, false);
                    }
                }
            }));
            let renderedSteps = undefined;
            const contextKeysToWatch = new Set(category.steps.flatMap(step => step.when.keys()));
            const buildStepList = () => {
                category.steps.sort((a, b) => a.order - b.order);
                const toRender = category.steps
                    .filter(step => this.contextService.contextMatchesRules(step.when));
                if ((0, arrays_1.equals)(renderedSteps, toRender, (a, b) => a.id === b.id)) {
                    return;
                }
                renderedSteps = toRender;
                (0, dom_1.reset)(stepListContainer, ...renderedSteps
                    .map(step => {
                    const codicon = (0, dom_1.$)('.codicon' + (step.done ? '.complete' + themables_1.ThemeIcon.asCSSSelector(gettingStartedIcons_1.gettingStartedCheckedCodicon) : themables_1.ThemeIcon.asCSSSelector(gettingStartedIcons_1.gettingStartedUncheckedCodicon)), {
                        'data-done-step-id': step.id,
                        'x-dispatch': 'toggleStepCompletion:' + step.id,
                        'role': 'checkbox',
                        'tabindex': '0',
                    });
                    const container = (0, dom_1.$)('.step-description-container', { 'x-step-description-for': step.id });
                    this.buildStepMarkdownDescription(container, step.description);
                    const stepTitle = (0, dom_1.$)('h3.step-title.max-lines-3', { 'x-step-title-for': step.id });
                    (0, dom_1.reset)(stepTitle, ...(0, iconLabels_1.renderLabelWithIcons)(step.title));
                    const stepDescription = (0, dom_1.$)('.step-container', {}, stepTitle, container);
                    if (step.media.type === 'image') {
                        stepDescription.appendChild((0, dom_1.$)('.image-description', { 'aria-label': (0, nls_1.localize)('imageShowing', "Image showing {0}", step.media.altText) }));
                    }
                    return (0, dom_1.$)('button.getting-started-step', {
                        'x-dispatch': 'selectTask:' + step.id,
                        'data-step-id': step.id,
                        'aria-expanded': 'false',
                        'aria-checked': '' + step.done,
                        'role': 'button',
                    }, codicon, stepDescription);
                }));
            };
            buildStepList();
            this.detailsPageDisposables.add(this.contextService.onDidChangeContext(e => {
                if (e.affectsSome(contextKeysToWatch)) {
                    buildStepList();
                    this.registerDispatchListeners();
                    this.selectStep(this.editorInput.selectedStep, false);
                }
            }));
            const showNextCategory = this.gettingStartedCategories.find(_category => _category.id === category.next);
            const stepsContainer = (0, dom_1.$)('.getting-started-detail-container', { 'role': 'list' }, stepListContainer, (0, dom_1.$)('.done-next-container', {}, (0, dom_1.$)('button.button-link.all-done', { 'x-dispatch': 'allDone' }, (0, dom_1.$)('span.codicon.codicon-check-all'), (0, nls_1.localize)('allDone', "Mark Done")), ...(showNextCategory
                ? [(0, dom_1.$)('button.button-link.next', { 'x-dispatch': 'nextSection' }, (0, nls_1.localize)('nextOne', "Next Section"), (0, dom_1.$)('span.codicon.codicon-arrow-right'))]
                : [])));
            this.detailsScrollbar = this._register(new scrollableElement_1.DomScrollableElement(stepsContainer, { className: 'steps-container' }));
            const stepListComponent = this.detailsScrollbar.getDomNode();
            const categoryFooter = (0, dom_1.$)('.getting-started-footer');
            if (this.editorInput.showTelemetryNotice && (0, telemetryUtils_1.getTelemetryLevel)(this.configurationService) !== 0 /* TelemetryLevel.NONE */ && this.productService.enableTelemetry) {
                this.buildTelemetryFooter(categoryFooter);
            }
            (0, dom_1.reset)(this.stepsContent, categoryDescriptorComponent, stepListComponent, this.stepMediaComponent, categoryFooter);
            const toExpand = category.steps.find(step => this.contextService.contextMatchesRules(step.when) && !step.done) ?? category.steps[0];
            this.selectStep(selectedStep ?? toExpand.id, !selectedStep);
            this.detailsScrollbar.scanDomNode();
            this.detailsPageScrollbar?.scanDomNode();
            this.registerDispatchListeners();
        }
        buildTelemetryFooter(parent) {
            const mdRenderer = this.instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, {});
            const privacyStatementCopy = (0, nls_1.localize)('privacy statement', "privacy statement");
            const privacyStatementButton = `[${privacyStatementCopy}](command:workbench.action.openPrivacyStatementUrl)`;
            const optOutCopy = (0, nls_1.localize)('optOut', "opt out");
            const optOutButton = `[${optOutCopy}](command:settings.filterByTelemetry)`;
            const text = (0, nls_1.localize)({ key: 'footer', comment: ['fist substitution is "vs code", second is "privacy statement", third is "opt out".'] }, "{0} collects usage data. Read our {1} and learn how to {2}.", this.productService.nameShort, privacyStatementButton, optOutButton);
            parent.append(mdRenderer.render({ value: text, isTrusted: true }).element);
            mdRenderer.dispose();
        }
        getKeybindingLabel(command) {
            command = command.replace(/^command:/, '');
            const label = this.keybindingService.lookupKeybinding(command)?.getLabel();
            if (!label) {
                return '';
            }
            else {
                return `(${label})`;
            }
        }
        async scrollPrev() {
            this.inProgressScroll = this.inProgressScroll.then(async () => {
                this.currentWalkthrough = undefined;
                this.editorInput.selectedCategory = undefined;
                this.editorInput.selectedStep = undefined;
                this.editorInput.showTelemetryNotice = false;
                this.selectStep(undefined);
                this.setSlide('categories');
                this.container.focus();
            });
        }
        runSkip() {
            this.commandService.executeCommand('workbench.action.closeActiveEditor');
        }
        escape() {
            if (this.editorInput.selectedCategory) {
                this.scrollPrev();
            }
            else {
                this.runSkip();
            }
        }
        setSlide(toEnable) {
            const slideManager = (0, types_1.assertIsDefined)(this.container.querySelector('.gettingStarted'));
            if (toEnable === 'categories') {
                slideManager.classList.remove('showDetails');
                slideManager.classList.add('showCategories');
                this.container.querySelector('.prev-button.button-link').style.display = 'none';
                this.container.querySelector('.gettingStartedSlideDetails').querySelectorAll('button').forEach(button => button.disabled = true);
                this.container.querySelector('.gettingStartedSlideCategories').querySelectorAll('button').forEach(button => button.disabled = false);
                this.container.querySelector('.gettingStartedSlideCategories').querySelectorAll('input').forEach(button => button.disabled = false);
            }
            else {
                slideManager.classList.add('showDetails');
                slideManager.classList.remove('showCategories');
                this.container.querySelector('.prev-button.button-link').style.display = 'block';
                this.container.querySelector('.gettingStartedSlideDetails').querySelectorAll('button').forEach(button => button.disabled = false);
                this.container.querySelector('.gettingStartedSlideCategories').querySelectorAll('button').forEach(button => button.disabled = true);
                this.container.querySelector('.gettingStartedSlideCategories').querySelectorAll('input').forEach(button => button.disabled = true);
            }
        }
        focus() {
            super.focus();
            const active = this.container.ownerDocument.activeElement;
            let parent = this.container.parentElement;
            while (parent && parent !== active) {
                parent = parent.parentElement;
            }
            if (parent) {
                // Only set focus if there is no other focued element outside this chain.
                // This prevents us from stealing back focus from other focused elements such as quick pick due to delayed load.
                this.container.focus();
            }
        }
    };
    exports.GettingStartedPage = GettingStartedPage;
    exports.GettingStartedPage = GettingStartedPage = GettingStartedPage_1 = __decorate([
        __param(0, commands_1.ICommandService),
        __param(1, productService_1.IProductService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, gettingStartedService_1.IWalkthroughsService),
        __param(4, featuredExtensionService_1.IFeaturedExtensionsService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, language_1.ILanguageService),
        __param(8, files_1.IFileService),
        __param(9, opener_1.IOpenerService),
        __param(10, themeService_1.IThemeService),
        __param(11, storage_1.IStorageService),
        __param(12, extensions_2.IExtensionService),
        __param(13, instantiation_1.IInstantiationService),
        __param(14, notification_1.INotificationService),
        __param(15, editorGroupsService_1.IEditorGroupsService),
        __param(16, contextkey_1.IContextKeyService),
        __param(17, quickInput_1.IQuickInputService),
        __param(18, workspaces_1.IWorkspacesService),
        __param(19, label_1.ILabelService),
        __param(20, host_1.IHostService),
        __param(21, webview_1.IWebviewService),
        __param(22, workspace_1.IWorkspaceContextService),
        __param(23, accessibility_1.IAccessibilityService),
        __param(24, extensionManagement_1.IExtensionManagementService)
    ], GettingStartedPage);
    class GettingStartedInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return JSON.stringify({ selectedCategory: editorInput.selectedCategory, selectedStep: editorInput.selectedStep });
        }
        deserialize(instantiationService, serializedEditorInput) {
            try {
                const { selectedCategory, selectedStep } = JSON.parse(serializedEditorInput);
                return new gettingStartedInput_1.GettingStartedInput({ selectedCategory, selectedStep });
            }
            catch { }
            return new gettingStartedInput_1.GettingStartedInput({});
        }
    }
    exports.GettingStartedInputSerializer = GettingStartedInputSerializer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dGluZ1N0YXJ0ZWQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3dlbGNvbWVHZXR0aW5nU3RhcnRlZC9icm93c2VyL2dldHRpbmdTdGFydGVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEwRWhHLE1BQU0sd0JBQXdCLEdBQUcsR0FBRyxDQUFDO0lBQ3JDLE1BQU0sZ0JBQWdCLEdBQUcseUJBQXlCLENBQUM7SUFFdEMsUUFBQSw0QkFBNEIsR0FBRyxJQUFJLDBCQUFhLENBQVUsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUYsUUFBQSxnQkFBZ0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBWS9FLE1BQU0sa0JBQWtCLEdBQTZCLG9DQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNoRixPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPO1FBQzFCLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVztRQUMxQixJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFO1FBQ3BDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRTtRQUNSLEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO1FBQ2QsSUFBSSxFQUFFLDJCQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQkFBYyxDQUFDLElBQUksRUFBRTtLQUNqRSxDQUFDLENBQUMsQ0FBQztJQWtCSixNQUFNLGtCQUFrQixHQUFHLDJDQUEyQyxDQUFDO0lBQ2hFLElBQU0sa0JBQWtCLEdBQXhC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