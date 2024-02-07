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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/ui/toggle/toggle", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/cache", "vs/base/common/cancellation", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/semver/semver", "vs/base/common/themables", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/supports/tokenization", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/workbench/contrib/extensions/browser/extensionsList", "vs/workbench/contrib/extensions/browser/extensionsViewer", "vs/workbench/contrib/extensions/browser/extensionsWidgets", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/markdown/browser/markdownDocumentRenderer", "vs/workbench/contrib/update/common/update", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/css!./media/extensionEditor"], function (require, exports, dom_1, markdownRenderer_1, actionbar_1, keybindingLabel_1, scrollableElement_1, toggle_1, actions_1, arrays, cache_1, cancellation_1, color_1, errors_1, event_1, lifecycle_1, network_1, platform_1, process_1, semver, themables_1, types_1, uri_1, uuid_1, editorContextKeys_1, languages_1, language_1, tokenization_1, nls_1, actions_2, configurationRegistry_1, contextkey_1, contextView_1, extensionManagement_1, extensionManagementUtil_1, extensions_1, instantiation_1, keybinding_1, notification_1, opener_1, storage_1, telemetry_1, defaultStyles_1, colorRegistry_1, themeService_1, editorPane_1, extensionsActions_1, extensionsIcons_1, extensionsList_1, extensionsViewer_1, extensionsWidgets_1, extensions_2, markdownDocumentRenderer_1, update_1, webview_1, editorService_1, extensionRecommendations_1, extensions_3, panecomposite_1) {
    "use strict";
    var ExtensionEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionEditor = void 0;
    class NavBar extends lifecycle_1.Disposable {
        get onChange() { return this._onChange.event; }
        get currentId() { return this._currentId; }
        constructor(container) {
            super();
            this._onChange = this._register(new event_1.Emitter());
            this._currentId = null;
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.navbar'));
            this.actions = [];
            this.actionbar = this._register(new actionbar_1.ActionBar(element, { animated: false }));
        }
        push(id, label, tooltip) {
            const action = new actions_1.Action(id, label, undefined, true, () => this.update(id, true));
            action.tooltip = tooltip;
            this.actions.push(action);
            this.actionbar.push(action);
            if (this.actions.length === 1) {
                this.update(id);
            }
        }
        clear() {
            this.actions = (0, lifecycle_1.dispose)(this.actions);
            this.actionbar.clear();
        }
        switch(id) {
            const action = this.actions.find(action => action.id === id);
            if (action) {
                action.run();
                return true;
            }
            return false;
        }
        update(id, focus) {
            this._currentId = id;
            this._onChange.fire({ id, focus: !!focus });
            this.actions.forEach(a => a.checked = a.id === id);
        }
    }
    var WebviewIndex;
    (function (WebviewIndex) {
        WebviewIndex[WebviewIndex["Readme"] = 0] = "Readme";
        WebviewIndex[WebviewIndex["Changelog"] = 1] = "Changelog";
    })(WebviewIndex || (WebviewIndex = {}));
    const CONTEXT_SHOW_PRE_RELEASE_VERSION = new contextkey_1.RawContextKey('showPreReleaseVersion', false);
    class ExtensionWithDifferentGalleryVersionWidget extends extensionsWidgets_1.ExtensionWidget {
        constructor() {
            super(...arguments);
            this._gallery = null;
        }
        get gallery() { return this._gallery; }
        set gallery(gallery) {
            if (this.extension && gallery && !(0, extensionManagementUtil_1.areSameExtensions)(this.extension.identifier, gallery.identifier)) {
                return;
            }
            this._gallery = gallery;
            this.update();
        }
    }
    class VersionWidget extends ExtensionWithDifferentGalleryVersionWidget {
        constructor(container) {
            super();
            this.element = (0, dom_1.append)(container, (0, dom_1.$)('code.version', { title: (0, nls_1.localize)('extension version', "Extension Version") }));
            this.render();
        }
        render() {
            if (!this.extension || !semver.valid(this.extension.version)) {
                return;
            }
            this.element.textContent = `v${this.gallery?.version ?? this.extension.version}${this.extension.isPreReleaseVersion ? ' (pre-release)' : ''}`;
        }
    }
    let ExtensionEditor = class ExtensionEditor extends editorPane_1.EditorPane {
        static { ExtensionEditor_1 = this; }
        static { this.ID = 'workbench.editor.extension'; }
        constructor(telemetryService, instantiationService, paneCompositeService, extensionsWorkbenchService, extensionGalleryService, themeService, keybindingService, notificationService, openerService, extensionRecommendationsService, storageService, extensionService, webviewService, languageService, contextMenuService, contextKeyService) {
            super(ExtensionEditor_1.ID, telemetryService, themeService, storageService);
            this.instantiationService = instantiationService;
            this.paneCompositeService = paneCompositeService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionGalleryService = extensionGalleryService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.extensionService = extensionService;
            this.webviewService = webviewService;
            this.languageService = languageService;
            this.contextMenuService = contextMenuService;
            this.contextKeyService = contextKeyService;
            this._scopedContextKeyService = this._register(new lifecycle_1.MutableDisposable());
            // Some action bar items use a webview whose vertical scroll position we track in this map
            this.initialScrollProgress = new Map();
            // Spot when an ExtensionEditor instance gets reused for a different extension, in which case the vertical scroll positions must be zeroed
            this.currentIdentifier = '';
            this.layoutParticipants = [];
            this.contentDisposables = this._register(new lifecycle_1.DisposableStore());
            this.transientDisposables = this._register(new lifecycle_1.DisposableStore());
            this.activeElement = null;
            this.extensionReadme = null;
            this.extensionChangelog = null;
            this.extensionManifest = null;
        }
        get scopedContextKeyService() {
            return this._scopedContextKeyService.value;
        }
        createEditor(parent) {
            const root = (0, dom_1.append)(parent, (0, dom_1.$)('.extension-editor'));
            this._scopedContextKeyService.value = this.contextKeyService.createScoped(root);
            this._scopedContextKeyService.value.createKey('inExtensionEditor', true);
            this.showPreReleaseVersionContextKey = CONTEXT_SHOW_PRE_RELEASE_VERSION.bindTo(this._scopedContextKeyService.value);
            root.tabIndex = 0; // this is required for the focus tracker on the editor
            root.style.outline = 'none';
            root.setAttribute('role', 'document');
            const header = (0, dom_1.append)(root, (0, dom_1.$)('.header'));
            const iconContainer = (0, dom_1.append)(header, (0, dom_1.$)('.icon-container'));
            const icon = (0, dom_1.append)(iconContainer, (0, dom_1.$)('img.icon', { draggable: false, alt: '' }));
            const remoteBadge = this.instantiationService.createInstance(extensionsWidgets_1.RemoteBadgeWidget, iconContainer, true);
            const details = (0, dom_1.append)(header, (0, dom_1.$)('.details'));
            const title = (0, dom_1.append)(details, (0, dom_1.$)('.title'));
            const name = (0, dom_1.append)(title, (0, dom_1.$)('span.name.clickable', { title: (0, nls_1.localize)('name', "Extension name"), role: 'heading', tabIndex: 0 }));
            const versionWidget = new VersionWidget(title);
            const preview = (0, dom_1.append)(title, (0, dom_1.$)('span.preview', { title: (0, nls_1.localize)('preview', "Preview") }));
            preview.textContent = (0, nls_1.localize)('preview', "Preview");
            const builtin = (0, dom_1.append)(title, (0, dom_1.$)('span.builtin'));
            builtin.textContent = (0, nls_1.localize)('builtin', "Built-in");
            const subtitle = (0, dom_1.append)(details, (0, dom_1.$)('.subtitle'));
            const publisher = (0, dom_1.append)((0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('.publisher.clickable', { title: (0, nls_1.localize)('publisher', "Publisher"), tabIndex: 0 }));
            publisher.setAttribute('role', 'button');
            const publisherDisplayName = (0, dom_1.append)(publisher, (0, dom_1.$)('.publisher-name'));
            const verifiedPublisherWidget = this.instantiationService.createInstance(extensionsWidgets_1.VerifiedPublisherWidget, (0, dom_1.append)(publisher, (0, dom_1.$)('.verified-publisher')), false);
            const installCount = (0, dom_1.append)((0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('span.install', { title: (0, nls_1.localize)('install count', "Install count"), tabIndex: 0 }));
            const installCountWidget = this.instantiationService.createInstance(extensionsWidgets_1.InstallCountWidget, installCount, false);
            const rating = (0, dom_1.append)((0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('span.rating.clickable', { title: (0, nls_1.localize)('rating', "Rating"), tabIndex: 0 }));
            rating.setAttribute('role', 'link'); // #132645
            const ratingsWidget = this.instantiationService.createInstance(extensionsWidgets_1.RatingsWidget, rating, false);
            const sponsorWidget = this.instantiationService.createInstance(extensionsWidgets_1.SponsorWidget, (0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')));
            const widgets = [
                remoteBadge,
                versionWidget,
                verifiedPublisherWidget,
                installCountWidget,
                ratingsWidget,
                sponsorWidget,
            ];
            const description = (0, dom_1.append)(details, (0, dom_1.$)('.description'));
            const installAction = this.instantiationService.createInstance(extensionsActions_1.InstallDropdownAction);
            const actions = [
                this.instantiationService.createInstance(extensionsActions_1.ReloadAction),
                this.instantiationService.createInstance(extensionsActions_1.ExtensionStatusLabelAction),
                this.instantiationService.createInstance(extensionsActions_1.ActionWithDropDownAction, 'extensions.updateActions', '', [[this.instantiationService.createInstance(extensionsActions_1.UpdateAction, true)], [this.instantiationService.createInstance(extensionsActions_1.ToggleAutoUpdateForExtensionAction, true, [true, 'onlyEnabledExtensions'])]]),
                this.instantiationService.createInstance(extensionsActions_1.SetColorThemeAction),
                this.instantiationService.createInstance(extensionsActions_1.SetFileIconThemeAction),
                this.instantiationService.createInstance(extensionsActions_1.SetProductIconThemeAction),
                this.instantiationService.createInstance(extensionsActions_1.SetLanguageAction),
                this.instantiationService.createInstance(extensionsActions_1.ClearLanguageAction),
                this.instantiationService.createInstance(extensionsActions_1.EnableDropDownAction),
                this.instantiationService.createInstance(extensionsActions_1.DisableDropDownAction),
                this.instantiationService.createInstance(extensionsActions_1.RemoteInstallAction, false),
                this.instantiationService.createInstance(extensionsActions_1.LocalInstallAction),
                this.instantiationService.createInstance(extensionsActions_1.WebInstallAction),
                installAction,
                this.instantiationService.createInstance(extensionsActions_1.InstallingLabelAction),
                this.instantiationService.createInstance(extensionsActions_1.ActionWithDropDownAction, 'extensions.uninstall', extensionsActions_1.UninstallAction.UninstallLabel, [
                    [
                        this.instantiationService.createInstance(extensionsActions_1.MigrateDeprecatedExtensionAction, false),
                        this.instantiationService.createInstance(extensionsActions_1.UninstallAction),
                        this.instantiationService.createInstance(extensionsActions_1.InstallAnotherVersionAction),
                    ]
                ]),
                this.instantiationService.createInstance(extensionsActions_1.TogglePreReleaseExtensionAction),
                this.instantiationService.createInstance(extensionsActions_1.ToggleAutoUpdateForExtensionAction, false, [false, 'onlySelectedExtensions']),
                new extensionsActions_1.ExtensionEditorManageExtensionAction(this.scopedContextKeyService || this.contextKeyService, this.instantiationService),
            ];
            const actionsAndStatusContainer = (0, dom_1.append)(details, (0, dom_1.$)('.actions-status-container'));
            const extensionActionBar = this._register(new actionbar_1.ActionBar(actionsAndStatusContainer, {
                animated: false,
                actionViewItemProvider: (action) => {
                    if (action instanceof extensionsActions_1.ExtensionDropDownAction) {
                        return action.createActionViewItem();
                    }
                    if (action instanceof extensionsActions_1.ActionWithDropDownAction) {
                        return new extensionsActions_1.ExtensionActionWithDropdownActionViewItem(action, { icon: true, label: true, menuActionsOrProvider: { getActions: () => action.menuActions }, menuActionClassNames: (action.class || '').split(' ') }, this.contextMenuService);
                    }
                    if (action instanceof extensionsActions_1.ToggleAutoUpdateForExtensionAction) {
                        return new toggle_1.CheckboxActionViewItem(undefined, action, { icon: true, label: true, checkboxStyles: defaultStyles_1.defaultCheckboxStyles });
                    }
                    return undefined;
                },
                focusOnlyEnabledItems: true
            }));
            extensionActionBar.push(actions, { icon: true, label: true });
            extensionActionBar.setFocusable(true);
            // update focusable elements when the enablement of an action changes
            this._register(event_1.Event.any(...actions.map(a => event_1.Event.filter(a.onDidChange, e => e.enabled !== undefined)))(() => {
                extensionActionBar.setFocusable(false);
                extensionActionBar.setFocusable(true);
            }));
            const otherExtensionContainers = [];
            const extensionStatusAction = this.instantiationService.createInstance(extensionsActions_1.ExtensionStatusAction);
            const extensionStatusWidget = this._register(this.instantiationService.createInstance(extensionsWidgets_1.ExtensionStatusWidget, (0, dom_1.append)(actionsAndStatusContainer, (0, dom_1.$)('.status')), extensionStatusAction));
            otherExtensionContainers.push(extensionStatusAction, new class extends extensionsWidgets_1.ExtensionWidget {
                render() {
                    actionsAndStatusContainer.classList.toggle('list-layout', this.extension?.state === 1 /* ExtensionState.Installed */);
                }
            }());
            const recommendationWidget = this.instantiationService.createInstance(extensionsWidgets_1.ExtensionRecommendationWidget, (0, dom_1.append)(details, (0, dom_1.$)('.recommendation')));
            widgets.push(recommendationWidget);
            this._register(event_1.Event.any(extensionStatusWidget.onDidRender, recommendationWidget.onDidRender)(() => {
                if (this.dimension) {
                    this.layout(this.dimension);
                }
            }));
            const extensionContainers = this.instantiationService.createInstance(extensions_2.ExtensionContainers, [...actions, ...widgets, ...otherExtensionContainers]);
            for (const disposable of [...actions, ...widgets, ...otherExtensionContainers, extensionContainers]) {
                this._register(disposable);
            }
            const onError = event_1.Event.chain(extensionActionBar.onDidRun, $ => $.map(({ error }) => error)
                .filter(error => !!error));
            this._register(onError(this.onError, this));
            const body = (0, dom_1.append)(root, (0, dom_1.$)('.body'));
            const navbar = new NavBar(body);
            const content = (0, dom_1.append)(body, (0, dom_1.$)('.content'));
            content.id = (0, uuid_1.generateUuid)(); // An id is needed for the webview parent flow to
            this.template = {
                builtin,
                content,
                description,
                header,
                icon,
                iconContainer,
                installCount,
                name,
                navbar,
                preview,
                publisher,
                publisherDisplayName,
                rating,
                actionsAndStatusContainer,
                extensionActionBar,
                set extension(extension) {
                    extensionContainers.extension = extension;
                },
                set gallery(gallery) {
                    versionWidget.gallery = gallery;
                },
                set manifest(manifest) {
                    installAction.manifest = manifest;
                }
            };
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            this.updatePreReleaseVersionContext();
            if (this.template) {
                await this.render(input.extension, this.template, !!options?.preserveFocus);
            }
        }
        setOptions(options) {
            const currentOptions = this.options;
            super.setOptions(options);
            this.updatePreReleaseVersionContext();
            if (this.input && this.template && currentOptions?.showPreReleaseVersion !== options?.showPreReleaseVersion) {
                this.render(this.input.extension, this.template, !!options?.preserveFocus);
            }
        }
        updatePreReleaseVersionContext() {
            let showPreReleaseVersion = this.options?.showPreReleaseVersion;
            if ((0, types_1.isUndefined)(showPreReleaseVersion)) {
                showPreReleaseVersion = !!this.input.extension.gallery?.properties.isPreReleaseVersion;
            }
            this.showPreReleaseVersionContextKey?.set(showPreReleaseVersion);
        }
        async openTab(tab) {
            if (!this.input || !this.template) {
                return;
            }
            if (this.template.navbar.switch(tab)) {
                return;
            }
            // Fallback to Readme tab if ExtensionPack tab does not exist
            if (tab === "extensionPack" /* ExtensionEditorTab.ExtensionPack */) {
                this.template.navbar.switch("readme" /* ExtensionEditorTab.Readme */);
            }
        }
        async getGalleryVersionToShow(extension, preRelease) {
            if ((0, types_1.isUndefined)(preRelease)) {
                return null;
            }
            if (preRelease === extension.gallery?.properties.isPreReleaseVersion) {
                return null;
            }
            if (preRelease && !extension.hasPreReleaseVersion) {
                return null;
            }
            if (!preRelease && !extension.hasReleaseVersion) {
                return null;
            }
            return (await this.extensionGalleryService.getExtensions([{ ...extension.identifier, preRelease, hasPreRelease: extension.hasPreReleaseVersion }], cancellation_1.CancellationToken.None))[0] || null;
        }
        async render(extension, template, preserveFocus) {
            this.activeElement = null;
            this.transientDisposables.clear();
            const token = this.transientDisposables.add(new cancellation_1.CancellationTokenSource()).token;
            const gallery = await this.getGalleryVersionToShow(extension, this.options?.showPreReleaseVersion);
            if (token.isCancellationRequested) {
                return;
            }
            this.extensionReadme = new cache_1.Cache(() => gallery ? this.extensionGalleryService.getReadme(gallery, token) : extension.getReadme(token));
            this.extensionChangelog = new cache_1.Cache(() => gallery ? this.extensionGalleryService.getChangelog(gallery, token) : extension.getChangelog(token));
            this.extensionManifest = new cache_1.Cache(() => gallery ? this.extensionGalleryService.getManifest(gallery, token) : extension.getManifest(token));
            template.extension = extension;
            template.gallery = gallery;
            template.manifest = null;
            this.transientDisposables.add((0, dom_1.addDisposableListener)(template.icon, 'error', () => template.icon.src = extension.iconUrlFallback, { once: true }));
            template.icon.src = extension.iconUrl;
            template.name.textContent = extension.displayName;
            template.name.classList.toggle('clickable', !!extension.url);
            template.name.classList.toggle('deprecated', !!extension.deprecationInfo);
            template.preview.style.display = extension.preview ? 'inherit' : 'none';
            template.builtin.style.display = extension.isBuiltin ? 'inherit' : 'none';
            template.description.textContent = extension.description;
            // subtitle
            template.publisher.classList.toggle('clickable', !!extension.url);
            template.publisherDisplayName.textContent = extension.publisherDisplayName;
            template.installCount.parentElement?.classList.toggle('hide', !extension.url);
            template.rating.parentElement?.classList.toggle('hide', !extension.url);
            template.rating.classList.toggle('clickable', !!extension.url);
            if (extension.url) {
                this.transientDisposables.add((0, extensionsWidgets_1.onClick)(template.name, () => this.openerService.open(uri_1.URI.parse(extension.url))));
                this.transientDisposables.add((0, extensionsWidgets_1.onClick)(template.rating, () => this.openerService.open(uri_1.URI.parse(`${extension.url}&ssr=false#review-details`))));
                this.transientDisposables.add((0, extensionsWidgets_1.onClick)(template.publisher, () => {
                    this.paneCompositeService.openPaneComposite(extensions_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
                        .then(viewlet => viewlet?.getViewPaneContainer())
                        .then(viewlet => viewlet.search(`publisher:"${extension.publisherDisplayName}"`));
                }));
            }
            const manifest = await this.extensionManifest.get().promise;
            if (token.isCancellationRequested) {
                return;
            }
            if (manifest) {
                template.manifest = manifest;
            }
            this.renderNavbar(extension, manifest, template, preserveFocus);
            // report telemetry
            const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
            let recommendationsData = {};
            if (extRecommendations[extension.identifier.id.toLowerCase()]) {
                recommendationsData = { recommendationReason: extRecommendations[extension.identifier.id.toLowerCase()].reasonId };
            }
            /* __GDPR__
            "extensionGallery:openExtension" : {
                "owner": "sandy081",
                "recommendationReason": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "${include}": [
                    "${GalleryExtensionTelemetryData}"
                ]
            }
            */
            this.telemetryService.publicLog('extensionGallery:openExtension', { ...extension.telemetryData, ...recommendationsData });
        }
        renderNavbar(extension, manifest, template, preserveFocus) {
            template.content.innerText = '';
            template.navbar.clear();
            if (this.currentIdentifier !== extension.identifier.id) {
                this.initialScrollProgress.clear();
                this.currentIdentifier = extension.identifier.id;
            }
            template.navbar.push("readme" /* ExtensionEditorTab.Readme */, (0, nls_1.localize)('details', "Details"), (0, nls_1.localize)('detailstooltip', "Extension details, rendered from the extension's 'README.md' file"));
            if (manifest && manifest.contributes) {
                template.navbar.push("contributions" /* ExtensionEditorTab.Contributions */, (0, nls_1.localize)('contributions', "Feature Contributions"), (0, nls_1.localize)('contributionstooltip', "Lists contributions to VS Code by this extension"));
            }
            if (extension.hasChangelog()) {
                template.navbar.push("changelog" /* ExtensionEditorTab.Changelog */, (0, nls_1.localize)('changelog', "Changelog"), (0, nls_1.localize)('changelogtooltip', "Extension update history, rendered from the extension's 'CHANGELOG.md' file"));
            }
            if (extension.dependencies.length) {
                template.navbar.push("dependencies" /* ExtensionEditorTab.Dependencies */, (0, nls_1.localize)('dependencies', "Dependencies"), (0, nls_1.localize)('dependenciestooltip', "Lists extensions this extension depends on"));
            }
            if (manifest && manifest.extensionPack?.length && !this.shallRenderAsExtensionPack(manifest)) {
                template.navbar.push("extensionPack" /* ExtensionEditorTab.ExtensionPack */, (0, nls_1.localize)('extensionpack', "Extension Pack"), (0, nls_1.localize)('extensionpacktooltip', "Lists extensions those will be installed together with this extension"));
            }
            const addRuntimeStatusSection = () => template.navbar.push("runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */, (0, nls_1.localize)('runtimeStatus', "Runtime Status"), (0, nls_1.localize)('runtimeStatus description', "Extension runtime status"));
            if (this.extensionsWorkbenchService.getExtensionStatus(extension)) {
                addRuntimeStatusSection();
            }
            else {
                const disposable = this.extensionService.onDidChangeExtensionsStatus(e => {
                    if (e.some(extensionIdentifier => (0, extensionManagementUtil_1.areSameExtensions)({ id: extensionIdentifier.value }, extension.identifier))) {
                        addRuntimeStatusSection();
                        disposable.dispose();
                    }
                }, this, this.transientDisposables);
            }
            if (template.navbar.currentId) {
                this.onNavbarChange(extension, { id: template.navbar.currentId, focus: !preserveFocus }, template);
            }
            template.navbar.onChange(e => this.onNavbarChange(extension, e, template), this, this.transientDisposables);
        }
        clearInput() {
            this.contentDisposables.clear();
            this.transientDisposables.clear();
            super.clearInput();
        }
        focus() {
            super.focus();
            this.activeElement?.focus();
        }
        showFind() {
            this.activeWebview?.showFind();
        }
        runFindAction(previous) {
            this.activeWebview?.runFindAction(previous);
        }
        get activeWebview() {
            if (!this.activeElement || !this.activeElement.runFindAction) {
                return undefined;
            }
            return this.activeElement;
        }
        onNavbarChange(extension, { id, focus }, template) {
            this.contentDisposables.clear();
            template.content.innerText = '';
            this.activeElement = null;
            if (id) {
                const cts = new cancellation_1.CancellationTokenSource();
                this.contentDisposables.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
                this.open(id, extension, template, cts.token)
                    .then(activeElement => {
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    this.activeElement = activeElement;
                    if (focus) {
                        this.focus();
                    }
                });
            }
        }
        open(id, extension, template, token) {
            switch (id) {
                case "readme" /* ExtensionEditorTab.Readme */: return this.openDetails(extension, template, token);
                case "contributions" /* ExtensionEditorTab.Contributions */: return this.openContributions(template, token);
                case "changelog" /* ExtensionEditorTab.Changelog */: return this.openChangelog(template, token);
                case "dependencies" /* ExtensionEditorTab.Dependencies */: return this.openExtensionDependencies(extension, template, token);
                case "extensionPack" /* ExtensionEditorTab.ExtensionPack */: return this.openExtensionPack(extension, template, token);
                case "runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */: return this.openRuntimeStatus(extension, template, token);
            }
            return Promise.resolve(null);
        }
        async openMarkdown(cacheResult, noContentCopy, container, webviewIndex, title, token) {
            try {
                const body = await this.renderMarkdown(cacheResult, container, token);
                if (token.isCancellationRequested) {
                    return Promise.resolve(null);
                }
                const webview = this.contentDisposables.add(this.webviewService.createWebviewOverlay({
                    title,
                    options: {
                        enableFindWidget: true,
                        tryRestoreScrollPosition: true,
                        disableServiceWorker: true,
                    },
                    contentOptions: {},
                    extension: undefined,
                }));
                webview.initialScrollProgress = this.initialScrollProgress.get(webviewIndex) || 0;
                webview.claim(this, this.scopedContextKeyService);
                (0, dom_1.setParentFlowTo)(webview.container, container);
                webview.layoutWebviewOverElement(container);
                webview.setHtml(body);
                webview.claim(this, undefined);
                this.contentDisposables.add(webview.onDidFocus(() => this.fireOnDidFocus()));
                this.contentDisposables.add(webview.onDidScroll(() => this.initialScrollProgress.set(webviewIndex, webview.initialScrollProgress)));
                const removeLayoutParticipant = arrays.insert(this.layoutParticipants, {
                    layout: () => {
                        webview.layoutWebviewOverElement(container);
                    }
                });
                this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
                let isDisposed = false;
                this.contentDisposables.add((0, lifecycle_1.toDisposable)(() => { isDisposed = true; }));
                this.contentDisposables.add(this.themeService.onDidColorThemeChange(async () => {
                    // Render again since syntax highlighting of code blocks may have changed
                    const body = await this.renderMarkdown(cacheResult, container);
                    if (!isDisposed) { // Make sure we weren't disposed of in the meantime
                        webview.setHtml(body);
                    }
                }));
                this.contentDisposables.add(webview.onDidClickLink(link => {
                    if (!link) {
                        return;
                    }
                    // Only allow links with specific schemes
                    if ((0, network_1.matchesScheme)(link, network_1.Schemas.http) || (0, network_1.matchesScheme)(link, network_1.Schemas.https) || (0, network_1.matchesScheme)(link, network_1.Schemas.mailto)) {
                        this.openerService.open(link);
                    }
                    if ((0, network_1.matchesScheme)(link, network_1.Schemas.command) && uri_1.URI.parse(link).path === update_1.ShowCurrentReleaseNotesActionId) {
                        this.openerService.open(link, { allowCommands: true }); // TODO@sandy081 use commands service
                    }
                }));
                return webview;
            }
            catch (e) {
                const p = (0, dom_1.append)(container, (0, dom_1.$)('p.nocontent'));
                p.textContent = noContentCopy;
                return p;
            }
        }
        async renderMarkdown(cacheResult, container, token) {
            const contents = await this.loadContents(() => cacheResult, container);
            if (token?.isCancellationRequested) {
                return '';
            }
            const content = await (0, markdownDocumentRenderer_1.renderMarkdownDocument)(contents, this.extensionService, this.languageService, true, false, token);
            if (token?.isCancellationRequested) {
                return '';
            }
            return this.renderBody(content);
        }
        renderBody(body) {
            const nonce = (0, uuid_1.generateUuid)();
            const colorMap = languages_1.TokenizationRegistry.getColorMap();
            const css = colorMap ? (0, tokenization_1.generateTokensCSSForColorMap)(colorMap) : '';
            return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; script-src 'none'; style-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${markdownDocumentRenderer_1.DEFAULT_MARKDOWN_STYLES}

					/* prevent scroll-to-top button from blocking the body text */
					body {
						padding-bottom: 75px;
					}

					#scroll-to-top {
						position: fixed;
						width: 32px;
						height: 32px;
						right: 25px;
						bottom: 25px;
						background-color: var(--vscode-button-secondaryBackground);
						border-color: var(--vscode-button-border);
						border-radius: 50%;
						cursor: pointer;
						box-shadow: 1px 1px 1px rgba(0,0,0,.25);
						outline: none;
						display: flex;
						justify-content: center;
						align-items: center;
					}

					#scroll-to-top:hover {
						background-color: var(--vscode-button-secondaryHoverBackground);
						box-shadow: 2px 2px 2px rgba(0,0,0,.25);
					}

					body.vscode-high-contrast #scroll-to-top {
						border-width: 2px;
						border-style: solid;
						box-shadow: none;
					}

					#scroll-to-top span.icon::before {
						content: "";
						display: block;
						background: var(--vscode-button-secondaryForeground);
						/* Chevron up icon */
						webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNiAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO30KCS5zdDF7ZmlsbDpub25lO30KPC9zdHlsZT4KPHRpdGxlPnVwY2hldnJvbjwvdGl0bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04LDUuMWwtNy4zLDcuM0wwLDExLjZsOC04bDgsOGwtMC43LDAuN0w4LDUuMXoiLz4KPHJlY3QgY2xhc3M9InN0MSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ii8+Cjwvc3ZnPgo=');
						-webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNiAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO30KCS5zdDF7ZmlsbDpub25lO30KPC9zdHlsZT4KPHRpdGxlPnVwY2hldnJvbjwvdGl0bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04LDUuMWwtNy4zLDcuM0wwLDExLjZsOC04bDgsOGwtMC43LDAuN0w4LDUuMXoiLz4KPHJlY3QgY2xhc3M9InN0MSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ii8+Cjwvc3ZnPgo=');
						width: 16px;
						height: 16px;
					}
					${css}
				</style>
			</head>
			<body>
				<a id="scroll-to-top" role="button" aria-label="scroll to top" href="#"><span class="icon"></span></a>
				${body}
			</body>
		</html>`;
        }
        async openDetails(extension, template, token) {
            const details = (0, dom_1.append)(template.content, (0, dom_1.$)('.details'));
            const readmeContainer = (0, dom_1.append)(details, (0, dom_1.$)('.readme-container'));
            const additionalDetailsContainer = (0, dom_1.append)(details, (0, dom_1.$)('.additional-details-container'));
            const layout = () => details.classList.toggle('narrow', this.dimension && this.dimension.width < 500);
            layout();
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(arrays.insert(this.layoutParticipants, { layout })));
            let activeElement = null;
            const manifest = await this.extensionManifest.get().promise;
            if (manifest && manifest.extensionPack?.length && this.shallRenderAsExtensionPack(manifest)) {
                activeElement = await this.openExtensionPackReadme(manifest, readmeContainer, token);
            }
            else {
                activeElement = await this.openMarkdown(this.extensionReadme.get(), (0, nls_1.localize)('noReadme', "No README available."), readmeContainer, 0 /* WebviewIndex.Readme */, (0, nls_1.localize)('Readme title', "Readme"), token);
            }
            this.renderAdditionalDetails(additionalDetailsContainer, extension);
            return activeElement;
        }
        shallRenderAsExtensionPack(manifest) {
            return !!(manifest.categories?.some(category => category.toLowerCase() === 'extension packs'));
        }
        async openExtensionPackReadme(manifest, container, token) {
            if (token.isCancellationRequested) {
                return Promise.resolve(null);
            }
            const extensionPackReadme = (0, dom_1.append)(container, (0, dom_1.$)('div', { class: 'extension-pack-readme' }));
            extensionPackReadme.style.margin = '0 auto';
            extensionPackReadme.style.maxWidth = '882px';
            const extensionPack = (0, dom_1.append)(extensionPackReadme, (0, dom_1.$)('div', { class: 'extension-pack' }));
            if (manifest.extensionPack.length <= 3) {
                extensionPackReadme.classList.add('one-row');
            }
            else if (manifest.extensionPack.length <= 6) {
                extensionPackReadme.classList.add('two-rows');
            }
            else if (manifest.extensionPack.length <= 9) {
                extensionPackReadme.classList.add('three-rows');
            }
            else {
                extensionPackReadme.classList.add('more-rows');
            }
            const extensionPackHeader = (0, dom_1.append)(extensionPack, (0, dom_1.$)('div.header'));
            extensionPackHeader.textContent = (0, nls_1.localize)('extension pack', "Extension Pack ({0})", manifest.extensionPack.length);
            const extensionPackContent = (0, dom_1.append)(extensionPack, (0, dom_1.$)('div', { class: 'extension-pack-content' }));
            extensionPackContent.setAttribute('tabindex', '0');
            (0, dom_1.append)(extensionPack, (0, dom_1.$)('div.footer'));
            const readmeContent = (0, dom_1.append)(extensionPackReadme, (0, dom_1.$)('div.readme-content'));
            await Promise.all([
                this.renderExtensionPack(manifest, extensionPackContent, token),
                this.openMarkdown(this.extensionReadme.get(), (0, nls_1.localize)('noReadme', "No README available."), readmeContent, 0 /* WebviewIndex.Readme */, (0, nls_1.localize)('Readme title', "Readme"), token),
            ]);
            return { focus: () => extensionPackContent.focus() };
        }
        renderAdditionalDetails(container, extension) {
            const content = (0, dom_1.$)('div', { class: 'additional-details-content', tabindex: '0' });
            const scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
            const layout = () => scrollableContent.scanDomNode();
            const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
            this.contentDisposables.add(scrollableContent);
            this.renderCategories(content, extension);
            this.renderExtensionResources(content, extension);
            this.renderMoreInfo(content, extension);
            (0, dom_1.append)(container, scrollableContent.getDomNode());
            scrollableContent.scanDomNode();
        }
        renderCategories(container, extension) {
            if (extension.categories.length) {
                const categoriesContainer = (0, dom_1.append)(container, (0, dom_1.$)('.categories-container.additional-details-element'));
                (0, dom_1.append)(categoriesContainer, (0, dom_1.$)('.additional-details-title', undefined, (0, nls_1.localize)('categories', "Categories")));
                const categoriesElement = (0, dom_1.append)(categoriesContainer, (0, dom_1.$)('.categories'));
                for (const category of extension.categories) {
                    this.transientDisposables.add((0, extensionsWidgets_1.onClick)((0, dom_1.append)(categoriesElement, (0, dom_1.$)('span.category', { tabindex: '0' }, category)), () => {
                        this.paneCompositeService.openPaneComposite(extensions_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
                            .then(viewlet => viewlet?.getViewPaneContainer())
                            .then(viewlet => viewlet.search(`@category:"${category}"`));
                    }));
                }
            }
        }
        renderExtensionResources(container, extension) {
            const resources = [];
            if (extension.url) {
                resources.push([(0, nls_1.localize)('Marketplace', "Marketplace"), uri_1.URI.parse(extension.url)]);
            }
            if (extension.url && extension.supportUrl) {
                try {
                    resources.push([(0, nls_1.localize)('issues', "Issues"), uri_1.URI.parse(extension.supportUrl)]);
                }
                catch (error) { /* Ignore */ }
            }
            if (extension.repository) {
                try {
                    resources.push([(0, nls_1.localize)('repository', "Repository"), uri_1.URI.parse(extension.repository)]);
                }
                catch (error) { /* Ignore */ }
            }
            if (extension.url && extension.licenseUrl) {
                try {
                    resources.push([(0, nls_1.localize)('license', "License"), uri_1.URI.parse(extension.licenseUrl)]);
                }
                catch (error) { /* Ignore */ }
            }
            if (extension.publisherUrl) {
                resources.push([extension.publisherDisplayName, extension.publisherUrl]);
            }
            if (resources.length || extension.publisherSponsorLink) {
                const extensionResourcesContainer = (0, dom_1.append)(container, (0, dom_1.$)('.resources-container.additional-details-element'));
                (0, dom_1.append)(extensionResourcesContainer, (0, dom_1.$)('.additional-details-title', undefined, (0, nls_1.localize)('resources', "Extension Resources")));
                const resourcesElement = (0, dom_1.append)(extensionResourcesContainer, (0, dom_1.$)('.resources'));
                for (const [label, uri] of resources) {
                    this.transientDisposables.add((0, extensionsWidgets_1.onClick)((0, dom_1.append)(resourcesElement, (0, dom_1.$)('a.resource', { title: uri.toString(), tabindex: '0' }, label)), () => this.openerService.open(uri)));
                }
            }
        }
        renderMoreInfo(container, extension) {
            const gallery = extension.gallery;
            const moreInfoContainer = (0, dom_1.append)(container, (0, dom_1.$)('.more-info-container.additional-details-element'));
            (0, dom_1.append)(moreInfoContainer, (0, dom_1.$)('.additional-details-title', undefined, (0, nls_1.localize)('Marketplace Info', "More Info")));
            const moreInfo = (0, dom_1.append)(moreInfoContainer, (0, dom_1.$)('.more-info'));
            const toDateString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}, ${date.toLocaleTimeString(platform_1.language, { hourCycle: 'h23' })}`;
            if (gallery) {
                (0, dom_1.append)(moreInfo, (0, dom_1.$)('.more-info-entry', undefined, (0, dom_1.$)('div', undefined, (0, nls_1.localize)('published', "Published")), (0, dom_1.$)('div', undefined, toDateString(new Date(gallery.releaseDate)))), (0, dom_1.$)('.more-info-entry', undefined, (0, dom_1.$)('div', undefined, (0, nls_1.localize)('last released', "Last released")), (0, dom_1.$)('div', undefined, toDateString(new Date(gallery.lastUpdated)))));
            }
            if (extension.local && extension.local.installedTimestamp) {
                (0, dom_1.append)(moreInfo, (0, dom_1.$)('.more-info-entry', undefined, (0, dom_1.$)('div', undefined, (0, nls_1.localize)('last updated', "Last updated")), (0, dom_1.$)('div', undefined, toDateString(new Date(extension.local.installedTimestamp)))));
            }
            (0, dom_1.append)(moreInfo, (0, dom_1.$)('.more-info-entry', undefined, (0, dom_1.$)('div', undefined, (0, nls_1.localize)('id', "Identifier")), (0, dom_1.$)('code', undefined, extension.identifier.id)));
        }
        openChangelog(template, token) {
            return this.openMarkdown(this.extensionChangelog.get(), (0, nls_1.localize)('noChangelog', "No Changelog available."), template.content, 1 /* WebviewIndex.Changelog */, (0, nls_1.localize)('Changelog title', "Changelog"), token);
        }
        openContributions(template, token) {
            const content = (0, dom_1.$)('div.subcontent.feature-contributions', { tabindex: '0' });
            return this.loadContents(() => this.extensionManifest.get(), template.content)
                .then(manifest => {
                if (token.isCancellationRequested) {
                    return null;
                }
                if (!manifest) {
                    return content;
                }
                const scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
                const layout = () => scrollableContent.scanDomNode();
                const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
                this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
                const renders = [
                    this.renderSettings(content, manifest, layout),
                    this.renderCommands(content, manifest, layout),
                    this.renderCodeActions(content, manifest, layout),
                    this.renderLanguages(content, manifest, layout),
                    this.renderColorThemes(content, manifest, layout),
                    this.renderIconThemes(content, manifest, layout),
                    this.renderProductIconThemes(content, manifest, layout),
                    this.renderColors(content, manifest, layout),
                    this.renderJSONValidation(content, manifest, layout),
                    this.renderDebuggers(content, manifest, layout),
                    this.renderViewContainers(content, manifest, layout),
                    this.renderViews(content, manifest, layout),
                    this.renderLocalizations(content, manifest, layout),
                    this.renderCustomEditors(content, manifest, layout),
                    this.renderNotebooks(content, manifest, layout),
                    this.renderNotebookRenderers(content, manifest, layout),
                    this.renderAuthentication(content, manifest, layout),
                    this.renderActivationEvents(content, manifest, layout),
                ];
                scrollableContent.scanDomNode();
                const isEmpty = !renders.some(x => x);
                if (isEmpty) {
                    (0, dom_1.append)(content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)('noContributions', "No Contributions");
                    (0, dom_1.append)(template.content, content);
                }
                else {
                    (0, dom_1.append)(template.content, scrollableContent.getDomNode());
                    this.contentDisposables.add(scrollableContent);
                }
                return content;
            }, () => {
                if (token.isCancellationRequested) {
                    return null;
                }
                (0, dom_1.append)(content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)('noContributions', "No Contributions");
                (0, dom_1.append)(template.content, content);
                return content;
            });
        }
        openExtensionDependencies(extension, template, token) {
            if (token.isCancellationRequested) {
                return Promise.resolve(null);
            }
            if (arrays.isFalsyOrEmpty(extension.dependencies)) {
                (0, dom_1.append)(template.content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)('noDependencies', "No Dependencies");
                return Promise.resolve(template.content);
            }
            const content = (0, dom_1.$)('div', { class: 'subcontent' });
            const scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
            (0, dom_1.append)(template.content, scrollableContent.getDomNode());
            this.contentDisposables.add(scrollableContent);
            const dependenciesTree = this.instantiationService.createInstance(extensionsViewer_1.ExtensionsTree, new extensionsViewer_1.ExtensionData(extension, null, extension => extension.dependencies || [], this.extensionsWorkbenchService), content, {
                listBackground: colorRegistry_1.editorBackground
            });
            const layout = () => {
                scrollableContent.scanDomNode();
                const scrollDimensions = scrollableContent.getScrollDimensions();
                dependenciesTree.layout(scrollDimensions.height);
            };
            const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
            this.contentDisposables.add(dependenciesTree);
            scrollableContent.scanDomNode();
            return Promise.resolve({ focus() { dependenciesTree.domFocus(); } });
        }
        async openExtensionPack(extension, template, token) {
            if (token.isCancellationRequested) {
                return Promise.resolve(null);
            }
            const manifest = await this.loadContents(() => this.extensionManifest.get(), template.content);
            if (token.isCancellationRequested) {
                return null;
            }
            if (!manifest) {
                return null;
            }
            return this.renderExtensionPack(manifest, template.content, token);
        }
        async openRuntimeStatus(extension, template, token) {
            const content = (0, dom_1.$)('div', { class: 'subcontent', tabindex: '0' });
            const scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
            const layout = () => scrollableContent.scanDomNode();
            const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
            const updateContent = () => {
                scrollableContent.scanDomNode();
                (0, dom_1.reset)(content, this.renderRuntimeStatus(extension, layout));
            };
            updateContent();
            this.extensionService.onDidChangeExtensionsStatus(e => {
                if (e.some(extensionIdentifier => (0, extensionManagementUtil_1.areSameExtensions)({ id: extensionIdentifier.value }, extension.identifier))) {
                    updateContent();
                }
            }, this, this.contentDisposables);
            this.contentDisposables.add(scrollableContent);
            (0, dom_1.append)(template.content, scrollableContent.getDomNode());
            return content;
        }
        renderRuntimeStatus(extension, onDetailsToggle) {
            const extensionStatus = this.extensionsWorkbenchService.getExtensionStatus(extension);
            const element = (0, dom_1.$)('.runtime-status');
            if (extensionStatus?.activationTimes) {
                const activationTime = extensionStatus.activationTimes.codeLoadingTime + extensionStatus.activationTimes.activateCallTime;
                const activationElement = (0, dom_1.append)(element, (0, dom_1.$)('div.activation-details'));
                const activationReasonElement = (0, dom_1.append)(activationElement, (0, dom_1.$)('div.activation-element-entry'));
                (0, dom_1.append)(activationReasonElement, (0, dom_1.$)('span.activation-message-title', undefined, (0, nls_1.localize)('activation reason', "Activation Event:")));
                (0, dom_1.append)(activationReasonElement, (0, dom_1.$)('code', undefined, extensionStatus.activationTimes.activationReason.startup ? (0, nls_1.localize)('startup', "Startup") : extensionStatus.activationTimes.activationReason.activationEvent));
                const activationTimeElement = (0, dom_1.append)(activationElement, (0, dom_1.$)('div.activation-element-entry'));
                (0, dom_1.append)(activationTimeElement, (0, dom_1.$)('span.activation-message-title', undefined, (0, nls_1.localize)('activation time', "Activation Time:")));
                (0, dom_1.append)(activationTimeElement, (0, dom_1.$)('code', undefined, `${activationTime}ms`));
                if (extensions_1.ExtensionIdentifier.toKey(extensionStatus.activationTimes.activationReason.extensionId) !== extensions_1.ExtensionIdentifier.toKey(extension.identifier.id)) {
                    const activatedByElement = (0, dom_1.append)(activationElement, (0, dom_1.$)('div.activation-element-entry'));
                    (0, dom_1.append)(activatedByElement, (0, dom_1.$)('span.activation-message-title', undefined, (0, nls_1.localize)('activatedBy', "Activated By:")));
                    (0, dom_1.append)(activatedByElement, (0, dom_1.$)('span', undefined, extensionStatus.activationTimes.activationReason.extensionId.value));
                }
            }
            else if (extension.local && (extension.local.manifest.main || extension.local.manifest.browser)) {
                (0, dom_1.append)(element, (0, dom_1.$)('div.activation-message', undefined, (0, nls_1.localize)('not yet activated', "Not yet activated.")));
            }
            if (extensionStatus?.runtimeErrors.length) {
                (0, dom_1.append)(element, (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('uncaught errors', "Uncaught Errors ({0})", extensionStatus.runtimeErrors.length)), (0, dom_1.$)('div', undefined, ...extensionStatus.runtimeErrors.map(error => (0, dom_1.$)('div.message-entry', undefined, (0, dom_1.$)(`span${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.errorIcon)}`, undefined), (0, dom_1.$)('span', undefined, (0, errors_1.getErrorMessage)(error)))))));
            }
            if (extensionStatus?.messages.length) {
                (0, dom_1.append)(element, (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('messages', "Messages ({0})", extensionStatus?.messages.length)), (0, dom_1.$)('div', undefined, ...extensionStatus.messages.sort((a, b) => b.type - a.type)
                    .map(message => (0, dom_1.$)('div.message-entry', undefined, (0, dom_1.$)(`span${themables_1.ThemeIcon.asCSSSelector(message.type === notification_1.Severity.Error ? extensionsIcons_1.errorIcon : message.type === notification_1.Severity.Warning ? extensionsIcons_1.warningIcon : extensionsIcons_1.infoIcon)}`, undefined), (0, dom_1.$)('span', undefined, message.message))))));
            }
            if (element.children.length === 0) {
                (0, dom_1.append)(element, (0, dom_1.$)('div.no-status-message')).textContent = (0, nls_1.localize)('noStatus', "No status available.");
            }
            return element;
        }
        async renderExtensionPack(manifest, parent, token) {
            if (token.isCancellationRequested) {
                return null;
            }
            const content = (0, dom_1.$)('div', { class: 'subcontent' });
            const scrollableContent = new scrollableElement_1.DomScrollableElement(content, { useShadows: false });
            (0, dom_1.append)(parent, scrollableContent.getDomNode());
            const extensionsGridView = this.instantiationService.createInstance(extensionsViewer_1.ExtensionsGridView, content, new extensionsList_1.Delegate());
            const extensions = await (0, extensionsViewer_1.getExtensions)(manifest.extensionPack, this.extensionsWorkbenchService);
            extensionsGridView.setExtensions(extensions);
            scrollableContent.scanDomNode();
            this.contentDisposables.add(scrollableContent);
            this.contentDisposables.add(extensionsGridView);
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(arrays.insert(this.layoutParticipants, { layout: () => scrollableContent.scanDomNode() })));
            return content;
        }
        renderSettings(container, manifest, onDetailsToggle) {
            const configuration = manifest.contributes?.configuration;
            let properties = {};
            if (Array.isArray(configuration)) {
                configuration.forEach(config => {
                    properties = { ...properties, ...config.properties };
                });
            }
            else if (configuration) {
                properties = configuration.properties;
            }
            let contrib = properties ? Object.keys(properties) : [];
            // filter deprecated settings
            contrib = contrib.filter(key => {
                const config = properties[key];
                return !config.deprecationMessage && !config.markdownDeprecationMessage;
            });
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('settings', "Settings ({0})", contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('setting name', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('description', "Description")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('default', "Default"))), ...contrib
                .sort((a, b) => a.localeCompare(b))
                .map(key => {
                let description = properties[key].description || '';
                if (properties[key].markdownDescription) {
                    const { element, dispose } = (0, markdownRenderer_1.renderMarkdown)({ value: properties[key].markdownDescription }, { actionHandler: { callback: (content) => this.openerService.open(content).catch(errors_1.onUnexpectedError), disposables: this.contentDisposables } });
                    description = element;
                    this.contentDisposables.add((0, lifecycle_1.toDisposable)(dispose));
                }
                return (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, key)), (0, dom_1.$)('td', undefined, description), (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, `${(0, types_1.isUndefined)(properties[key].default) ? (0, configurationRegistry_1.getDefaultValue)(properties[key].type) : JSON.stringify(properties[key].default)}`)));
            })));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderDebuggers(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.debuggers || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('debuggers', "Debuggers ({0})", contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('debugger name', "Name")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('debugger type', "Type"))), ...contrib
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(d => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, d.label), (0, dom_1.$)('td', undefined, d.type)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderViewContainers(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.viewsContainers || {};
            const viewContainers = Object.keys(contrib).reduce((result, location) => {
                const viewContainersForLocation = contrib[location];
                result.push(...viewContainersForLocation.map(viewContainer => ({ ...viewContainer, location })));
                return result;
            }, []);
            if (!viewContainers.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('viewContainers', "View Containers ({0})", viewContainers.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('view container id', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('view container title', "Title")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('view container location', "Where"))), ...viewContainers
                .sort((a, b) => a.id.localeCompare(b.id))
                .map(viewContainer => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, viewContainer.id), (0, dom_1.$)('td', undefined, viewContainer.title), (0, dom_1.$)('td', undefined, viewContainer.location)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderViews(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.views || {};
            const views = Object.keys(contrib).reduce((result, location) => {
                const viewsForLocation = contrib[location];
                result.push(...viewsForLocation.map(view => ({ ...view, location })));
                return result;
            }, []);
            if (!views.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('views', "Views ({0})", views.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('view id', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('view name', "Name")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('view location', "Where"))), ...views
                .sort((a, b) => a.id.localeCompare(b.id))
                .map(view => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, view.id), (0, dom_1.$)('td', undefined, view.name), (0, dom_1.$)('td', undefined, view.location)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderLocalizations(container, manifest, onDetailsToggle) {
            const localizations = manifest.contributes?.localizations || [];
            if (!localizations.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('localizations', "Localizations ({0})", localizations.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('localizations language id', "Language ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('localizations language name', "Language Name")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('localizations localized language name', "Language Name (Localized)"))), ...localizations
                .sort((a, b) => a.languageId.localeCompare(b.languageId))
                .map(localization => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, localization.languageId), (0, dom_1.$)('td', undefined, localization.languageName || ''), (0, dom_1.$)('td', undefined, localization.localizedLanguageName || '')))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderCustomEditors(container, manifest, onDetailsToggle) {
            const webviewEditors = manifest.contributes?.customEditors || [];
            if (!webviewEditors.length) {
                return false;
            }
            const renderEditors = Array.from(webviewEditors).sort((a, b) => a.viewType.localeCompare(b.viewType));
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('customEditors', "Custom Editors ({0})", renderEditors.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('customEditors view type', "View Type")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('customEditors priority', "Priority")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('customEditors filenamePattern', "Filename Pattern"))), ...renderEditors.map(webviewEditor => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, webviewEditor.viewType), (0, dom_1.$)('td', undefined, webviewEditor.priority), (0, dom_1.$)('td', undefined, arrays.coalesce(webviewEditor.selector.map(x => x.filenamePattern)).join(', '))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderCodeActions(container, manifest, onDetailsToggle) {
            const codeActions = manifest.contributes?.codeActions || [];
            if (!codeActions.length) {
                return false;
            }
            const flatActions = arrays.flatten(codeActions.map(contribution => contribution.actions.map(action => ({ ...action, languages: contribution.languages }))));
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('codeActions', "Code Actions ({0})", flatActions.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('codeActions.title', "Title")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('codeActions.kind', "Kind")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('codeActions.description', "Description")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('codeActions.languages', "Languages"))), ...flatActions
                .sort((a, b) => a.title.localeCompare(b.title))
                .map(action => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, action.title), (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, action.kind)), (0, dom_1.$)('td', undefined, action.description ?? ''), (0, dom_1.$)('td', undefined, ...action.languages.map(language => (0, dom_1.$)('code', undefined, language)))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderAuthentication(container, manifest, onDetailsToggle) {
            const authentication = manifest.contributes?.authentication || [];
            if (!authentication.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('authentication', "Authentication ({0})", authentication.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('authentication.label', "Label")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('authentication.id', "ID"))), ...authentication
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(action => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, action.label), (0, dom_1.$)('td', undefined, action.id)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderColorThemes(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.themes || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('colorThemes', "Color Themes ({0})", contrib.length)), (0, dom_1.$)('ul', undefined, ...contrib
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(theme => (0, dom_1.$)('li', undefined, theme.label))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderIconThemes(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.iconThemes || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('iconThemes', "File Icon Themes ({0})", contrib.length)), (0, dom_1.$)('ul', undefined, ...contrib
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(theme => (0, dom_1.$)('li', undefined, theme.label))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderProductIconThemes(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.productIconThemes || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('productThemes', "Product Icon Themes ({0})", contrib.length)), (0, dom_1.$)('ul', undefined, ...contrib
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(theme => (0, dom_1.$)('li', undefined, theme.label))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderColors(container, manifest, onDetailsToggle) {
            const colors = manifest.contributes?.colors || [];
            if (!colors.length) {
                return false;
            }
            function colorPreview(colorReference) {
                const result = [];
                if (colorReference && colorReference[0] === '#') {
                    const color = color_1.Color.fromHex(colorReference);
                    if (color) {
                        result.push((0, dom_1.$)('span', { class: 'colorBox', style: 'background-color: ' + color_1.Color.Format.CSS.format(color) }, ''));
                    }
                }
                result.push((0, dom_1.$)('code', undefined, colorReference));
                return result;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('colors', "Colors ({0})", colors.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('colorId', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('description', "Description")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('defaultDark', "Dark Default")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('defaultLight', "Light Default")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('defaultHC', "High Contrast Default"))), ...colors
                .sort((a, b) => a.id.localeCompare(b.id))
                .map(color => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, color.id)), (0, dom_1.$)('td', undefined, color.description), (0, dom_1.$)('td', undefined, ...colorPreview(color.defaults.dark)), (0, dom_1.$)('td', undefined, ...colorPreview(color.defaults.light)), (0, dom_1.$)('td', undefined, ...colorPreview(color.defaults.highContrast))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderJSONValidation(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.jsonValidation || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('JSON Validation', "JSON Validation ({0})", contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('fileMatch', "File Match")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('schema', "Schema"))), ...contrib.map(v => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, Array.isArray(v.fileMatch) ? v.fileMatch.join(', ') : v.fileMatch)), (0, dom_1.$)('td', undefined, v.url)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderCommands(container, manifest, onDetailsToggle) {
            const rawCommands = manifest.contributes?.commands || [];
            const commands = rawCommands.map(c => ({
                id: c.command,
                title: c.title,
                keybindings: [],
                menus: []
            }));
            const byId = arrays.index(commands, c => c.id);
            const menus = manifest.contributes?.menus || {};
            for (const context in menus) {
                for (const menu of menus[context]) {
                    if (menu.command) {
                        let command = byId[menu.command];
                        if (command) {
                            command.menus.push(context);
                        }
                        else {
                            command = { id: menu.command, title: '', keybindings: [], menus: [context] };
                            byId[command.id] = command;
                            commands.push(command);
                        }
                    }
                }
            }
            const rawKeybindings = manifest.contributes?.keybindings ? (Array.isArray(manifest.contributes.keybindings) ? manifest.contributes.keybindings : [manifest.contributes.keybindings]) : [];
            rawKeybindings.forEach(rawKeybinding => {
                const keybinding = this.resolveKeybinding(rawKeybinding);
                if (!keybinding) {
                    return;
                }
                let command = byId[rawKeybinding.command];
                if (command) {
                    command.keybindings.push(keybinding);
                }
                else {
                    command = { id: rawKeybinding.command, title: '', keybindings: [keybinding], menus: [] };
                    byId[command.id] = command;
                    commands.push(command);
                }
            });
            if (!commands.length) {
                return false;
            }
            const renderKeybinding = (keybinding) => {
                const element = (0, dom_1.$)('');
                const kbl = new keybindingLabel_1.KeybindingLabel(element, platform_1.OS, defaultStyles_1.defaultKeybindingLabelStyles);
                kbl.set(keybinding);
                return element;
            };
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('commands', "Commands ({0})", commands.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('command name', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('command title', "Title")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('keyboard shortcuts', "Keyboard Shortcuts")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('menuContexts', "Menu Contexts"))), ...commands
                .sort((a, b) => a.id.localeCompare(b.id))
                .map(c => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, c.id)), (0, dom_1.$)('td', undefined, typeof c.title === 'string' ? c.title : c.title.value), (0, dom_1.$)('td', undefined, ...c.keybindings.map(keybinding => renderKeybinding(keybinding))), (0, dom_1.$)('td', undefined, ...c.menus.map(context => (0, dom_1.$)('code', undefined, context)))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderLanguages(container, manifest, onDetailsToggle) {
            const contributes = manifest.contributes;
            const rawLanguages = contributes?.languages || [];
            const languages = rawLanguages.map(l => ({
                id: l.id,
                name: (l.aliases || [])[0] || l.id,
                extensions: l.extensions || [],
                hasGrammar: false,
                hasSnippets: false
            }));
            const byId = arrays.index(languages, l => l.id);
            const grammars = contributes?.grammars || [];
            grammars.forEach(grammar => {
                let language = byId[grammar.language];
                if (language) {
                    language.hasGrammar = true;
                }
                else {
                    language = { id: grammar.language, name: grammar.language, extensions: [], hasGrammar: true, hasSnippets: false };
                    byId[language.id] = language;
                    languages.push(language);
                }
            });
            const snippets = contributes?.snippets || [];
            snippets.forEach(snippet => {
                let language = byId[snippet.language];
                if (language) {
                    language.hasSnippets = true;
                }
                else {
                    language = { id: snippet.language, name: snippet.language, extensions: [], hasGrammar: false, hasSnippets: true };
                    byId[language.id] = language;
                    languages.push(language);
                }
            });
            if (!languages.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('languages', "Languages ({0})", languages.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('language id', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('language name', "Name")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('file extensions', "File Extensions")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('grammar', "Grammar")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('snippets', "Snippets"))), ...languages
                .sort((a, b) => a.id.localeCompare(b.id))
                .map(l => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, l.id), (0, dom_1.$)('td', undefined, l.name), (0, dom_1.$)('td', undefined, ...(0, dom_1.join)(l.extensions.map(ext => (0, dom_1.$)('code', undefined, ext)), ' ')), (0, dom_1.$)('td', undefined, document.createTextNode(l.hasGrammar ? '✔︎' : '\u2014')), (0, dom_1.$)('td', undefined, document.createTextNode(l.hasSnippets ? '✔︎' : '\u2014'))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderActivationEvents(container, manifest, onDetailsToggle) {
            const activationEvents = manifest.activationEvents || [];
            if (!activationEvents.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('activation events', "Activation Events ({0})", activationEvents.length)), (0, dom_1.$)('ul', undefined, ...activationEvents
                .sort((a, b) => a.localeCompare(b))
                .map(activationEvent => (0, dom_1.$)('li', undefined, (0, dom_1.$)('code', undefined, activationEvent)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderNotebooks(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.notebooks || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('Notebooks', "Notebooks ({0})", contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('Notebook id', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('Notebook name', "Name"))), ...contrib
                .sort((a, b) => a.type.localeCompare(b.type))
                .map(d => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, d.type), (0, dom_1.$)('td', undefined, d.displayName)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderNotebookRenderers(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.notebookRenderer || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('NotebookRenderers', "Notebook Renderers ({0})", contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('Notebook renderer name', "Name")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('Notebook mimetypes', "Mimetypes"))), ...contrib
                .sort((a, b) => a.displayName.localeCompare(b.displayName))
                .map(d => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, d.displayName), (0, dom_1.$)('td', undefined, d.mimeTypes.join(','))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        resolveKeybinding(rawKeyBinding) {
            let key;
            switch (process_1.platform) {
                case 'win32':
                    key = rawKeyBinding.win;
                    break;
                case 'linux':
                    key = rawKeyBinding.linux;
                    break;
                case 'darwin':
                    key = rawKeyBinding.mac;
                    break;
            }
            return this.keybindingService.resolveUserBinding(key || rawKeyBinding.key)[0];
        }
        loadContents(loadingTask, container) {
            container.classList.add('loading');
            const result = this.contentDisposables.add(loadingTask());
            const onDone = () => container.classList.remove('loading');
            result.promise.then(onDone, onDone);
            return result.promise;
        }
        layout(dimension) {
            this.dimension = dimension;
            this.layoutParticipants.forEach(p => p.layout());
        }
        onError(err) {
            if ((0, errors_1.isCancellationError)(err)) {
                return;
            }
            this.notificationService.error(err);
        }
    };
    exports.ExtensionEditor = ExtensionEditor;
    exports.ExtensionEditor = ExtensionEditor = ExtensionEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, panecomposite_1.IPaneCompositePartService),
        __param(3, extensions_2.IExtensionsWorkbenchService),
        __param(4, extensionManagement_1.IExtensionGalleryService),
        __param(5, themeService_1.IThemeService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, notification_1.INotificationService),
        __param(8, opener_1.IOpenerService),
        __param(9, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(10, storage_1.IStorageService),
        __param(11, extensions_3.IExtensionService),
        __param(12, webview_1.IWebviewService),
        __param(13, language_1.ILanguageService),
        __param(14, contextView_1.IContextMenuService),
        __param(15, contextkey_1.IContextKeyService)
    ], ExtensionEditor);
    const contextKeyExpr = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('activeEditor', ExtensionEditor.ID), editorContextKeys_1.EditorContextKeys.focus.toNegated());
    (0, actions_2.registerAction2)(class ShowExtensionEditorFindAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'editor.action.extensioneditor.showfind',
                title: (0, nls_1.localize)('find', "Find"),
                keybinding: {
                    when: contextKeyExpr,
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                }
            });
        }
        run(accessor) {
            const extensionEditor = getExtensionEditor(accessor);
            extensionEditor?.showFind();
        }
    });
    (0, actions_2.registerAction2)(class StartExtensionEditorFindNextAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'editor.action.extensioneditor.findNext',
                title: (0, nls_1.localize)('find next', "Find Next"),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(contextKeyExpr, webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED),
                    primary: 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            const extensionEditor = getExtensionEditor(accessor);
            extensionEditor?.runFindAction(false);
        }
    });
    (0, actions_2.registerAction2)(class StartExtensionEditorFindPreviousAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'editor.action.extensioneditor.findPrevious',
                title: (0, nls_1.localize)('find previous', "Find Previous"),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(contextKeyExpr, webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED),
                    primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            const extensionEditor = getExtensionEditor(accessor);
            extensionEditor?.runFindAction(true);
        }
    });
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const link = theme.getColor(colorRegistry_1.textLinkForeground);
        if (link) {
            collector.addRule(`.monaco-workbench .extension-editor .content .details .additional-details-container .resources-container a.resource { color: ${link}; }`);
            collector.addRule(`.monaco-workbench .extension-editor .content .feature-contributions a { color: ${link}; }`);
        }
        const activeLink = theme.getColor(colorRegistry_1.textLinkActiveForeground);
        if (activeLink) {
            collector.addRule(`.monaco-workbench .extension-editor .content .details .additional-details-container .resources-container a.resource:hover,
			.monaco-workbench .extension-editor .content .details .additional-details-container .resources-container a.resource:active { color: ${activeLink}; }`);
            collector.addRule(`.monaco-workbench .extension-editor .content .feature-contributions a:hover,
			.monaco-workbench .extension-editor .content .feature-contributions a:active { color: ${activeLink}; }`);
        }
        const buttonHoverBackgroundColor = theme.getColor(colorRegistry_1.buttonHoverBackground);
        if (buttonHoverBackgroundColor) {
            collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .categories-container > .categories > .category:hover { background-color: ${buttonHoverBackgroundColor}; border-color: ${buttonHoverBackgroundColor}; }`);
            collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .tags-container > .tags > .tag:hover { background-color: ${buttonHoverBackgroundColor}; border-color: ${buttonHoverBackgroundColor}; }`);
        }
        const buttonForegroundColor = theme.getColor(colorRegistry_1.buttonForeground);
        if (buttonForegroundColor) {
            collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .categories-container > .categories > .category:hover { color: ${buttonForegroundColor}; }`);
            collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .tags-container > .tags > .tag:hover { color: ${buttonForegroundColor}; }`);
        }
    });
    function getExtensionEditor(accessor) {
        const activeEditorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
        if (activeEditorPane instanceof ExtensionEditor) {
            return activeEditorPane;
        }
        return null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9uRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEyRmhHLE1BQU0sTUFBTyxTQUFRLHNCQUFVO1FBRzlCLElBQUksUUFBUSxLQUFtRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUc3RixJQUFJLFNBQVMsS0FBb0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUsxRCxZQUFZLFNBQXNCO1lBQ2pDLEtBQUssRUFBRSxDQUFDO1lBVkQsY0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXlDLENBQUMsQ0FBQztZQUdqRixlQUFVLEdBQWtCLElBQUksQ0FBQztZQVF4QyxNQUFNLE9BQU8sR0FBRyxJQUFBLFlBQU0sRUFBQyxTQUFTLEVBQUUsSUFBQSxPQUFDLEVBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxxQkFBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVELElBQUksQ0FBQyxFQUFVLEVBQUUsS0FBYSxFQUFFLE9BQWU7WUFDOUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQkFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFB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TSxDQUFDLENBQUMsRUFDbEYsSUFBQSxPQUFDLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFDbkIsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFDaEIsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFDN0MsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUMsRUFDMUQsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFDM0QsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUMsRUFDN0QsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyxXQUFXLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUNsRSxFQUNELEdBQUcsTUFBTTtpQkFDUCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3hDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUEsT0FBQyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQzlCLElBQUEsT0FBQyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBQSxPQUFDLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDbEQsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQ3JDLElBQUEsT0FBQyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxZQUFZLENB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