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
define(["require", "exports", "vs/base/common/semver/semver", "vs/base/common/lifecycle", "vs/workbench/contrib/extensions/common/extensions", "vs/base/browser/dom", "vs/base/common/platform", "vs/nls", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/label/common/label", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/theme", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/base/browser/ui/countBadge/countBadge", "vs/platform/configuration/common/configuration", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/theme/common/colorRegistry", "vs/platform/hover/browser/hover", "vs/base/common/htmlContent", "vs/base/common/uri", "vs/workbench/services/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/severity", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/common/color", "vs/base/browser/markdownRenderer", "vs/platform/opener/common/opener", "vs/base/common/errors", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/keyboardEvent", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/extensionsWidgets"], function (require, exports, semver, lifecycle_1, extensions_1, dom_1, platform, nls_1, extensionManagement_1, extensionRecommendations_1, label_1, extensionsActions_1, themeService_1, themables_1, theme_1, event_1, instantiation_1, countBadge_1, configuration_1, userDataSync_1, extensionsIcons_1, colorRegistry_1, hover_1, htmlContent_1, uri_1, extensions_2, extensionManagementUtil_1, severity_1, iconLabelHover_1, color_1, markdownRenderer_1, opener_1, errors_1, iconLabels_1, keyboardEvent_1, telemetry_1, defaultStyles_1) {
    "use strict";
    var ExtensionHoverWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extensionSponsorIconColor = exports.extensionPreReleaseIconColor = exports.extensionVerifiedPublisherIconColor = exports.extensionRatingIconColor = exports.ExtensionRecommendationWidget = exports.ExtensionStatusWidget = exports.ExtensionHoverWidget = exports.ExtensionActivationStatusWidget = exports.SyncIgnoredWidget = exports.ExtensionPackCountWidget = exports.RemoteBadgeWidget = exports.PreReleaseBookmarkWidget = exports.RecommendationWidget = exports.SponsorWidget = exports.VerifiedPublisherWidget = exports.RatingsWidget = exports.InstallCountWidget = exports.onClick = exports.ExtensionWidget = void 0;
    class ExtensionWidget extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._extension = null;
        }
        get extension() { return this._extension; }
        set extension(extension) { this._extension = extension; this.update(); }
        update() { this.render(); }
    }
    exports.ExtensionWidget = ExtensionWidget;
    function onClick(element, callback) {
        const disposables = new lifecycle_1.DisposableStore();
        disposables.add((0, dom_1.addDisposableListener)(element, dom_1.EventType.CLICK, (0, dom_1.finalHandler)(callback)));
        disposables.add((0, dom_1.addDisposableListener)(element, dom_1.EventType.KEY_UP, e => {
            const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
            if (keyboardEvent.equals(10 /* KeyCode.Space */) || keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                e.preventDefault();
                e.stopPropagation();
                callback();
            }
        }));
        return disposables;
    }
    exports.onClick = onClick;
    class InstallCountWidget extends ExtensionWidget {
        constructor(container, small) {
            super();
            this.container = container;
            this.small = small;
            container.classList.add('extension-install-count');
            this.render();
        }
        render() {
            this.container.innerText = '';
            if (!this.extension) {
                return;
            }
            if (this.small && this.extension.state !== 3 /* ExtensionState.Uninstalled */) {
                return;
            }
            const installLabel = InstallCountWidget.getInstallLabel(this.extension, this.small);
            if (!installLabel) {
                return;
            }
            (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.installCountIcon)));
            const count = (0, dom_1.append)(this.container, (0, dom_1.$)('span.count'));
            count.textContent = installLabel;
        }
        static getInstallLabel(extension, small) {
            const installCount = extension.installCount;
            if (installCount === undefined) {
                return undefined;
            }
            let installLabel;
            if (small) {
                if (installCount > 1000000) {
                    installLabel = `${Math.floor(installCount / 100000) / 10}M`;
                }
                else if (installCount > 1000) {
                    installLabel = `${Math.floor(installCount / 1000)}K`;
                }
                else {
                    installLabel = String(installCount);
                }
            }
            else {
                installLabel = installCount.toLocaleString(platform.language);
            }
            return installLabel;
        }
    }
    exports.InstallCountWidget = InstallCountWidget;
    class RatingsWidget extends ExtensionWidget {
        constructor(container, small) {
            super();
            this.container = container;
            this.small = small;
            container.classList.add('extension-ratings');
            if (this.small) {
                container.classList.add('small');
            }
            this.render();
        }
        render() {
            this.container.innerText = '';
            this.container.title = '';
            if (!this.extension) {
                return;
            }
            if (this.small && this.extension.state !== 3 /* ExtensionState.Uninstalled */) {
                return;
            }
            if (this.extension.rating === undefined) {
                return;
            }
            if (this.small && !this.extension.ratingCount) {
                return;
            }
            const rating = Math.round(this.extension.rating * 2) / 2;
            this.container.title = (0, nls_1.localize)('ratedLabel', "Average rating: {0} out of 5", rating);
            if (this.small) {
                (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starFullIcon)));
                const count = (0, dom_1.append)(this.container, (0, dom_1.$)('span.count'));
                count.textContent = String(rating);
            }
            else {
                for (let i = 1; i <= 5; i++) {
                    if (rating >= i) {
                        (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starFullIcon)));
                    }
                    else if (rating >= i - 0.5) {
                        (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starHalfIcon)));
                    }
                    else {
                        (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starEmptyIcon)));
                    }
                }
                if (this.extension.ratingCount) {
                    const ratingCountElemet = (0, dom_1.append)(this.container, (0, dom_1.$)('span', undefined, ` (${this.extension.ratingCount})`));
                    ratingCountElemet.style.paddingLeft = '1px';
                }
            }
        }
    }
    exports.RatingsWidget = RatingsWidget;
    let VerifiedPublisherWidget = class VerifiedPublisherWidget extends ExtensionWidget {
        constructor(container, small, openerService) {
            super();
            this.container = container;
            this.small = small;
            this.openerService = openerService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this.render();
        }
        render() {
            (0, dom_1.reset)(this.container);
            this.disposables.clear();
            if (!this.extension?.publisherDomain?.verified) {
                return;
            }
            const publisherDomainLink = uri_1.URI.parse(this.extension.publisherDomain.link);
            const verifiedPublisher = (0, dom_1.append)(this.container, (0, dom_1.$)('span.extension-verified-publisher.clickable'));
            (0, dom_1.append)(verifiedPublisher, (0, iconLabels_1.renderIcon)(extensionsIcons_1.verifiedPublisherIcon));
            if (!this.small) {
                verifiedPublisher.tabIndex = 0;
                verifiedPublisher.title = `Verified Domain: ${this.extension.publisherDomain.link}`;
                verifiedPublisher.setAttribute('role', 'link');
                (0, dom_1.append)(verifiedPublisher, (0, dom_1.$)('span.extension-verified-publisher-domain', undefined, publisherDomainLink.authority.startsWith('www.') ? publisherDomainLink.authority.substring(4) : publisherDomainLink.authority));
                this.disposables.add(onClick(verifiedPublisher, () => this.openerService.open(publisherDomainLink)));
            }
        }
    };
    exports.VerifiedPublisherWidget = VerifiedPublisherWidget;
    exports.VerifiedPublisherWidget = VerifiedPublisherWidget = __decorate([
        __param(2, opener_1.IOpenerService)
    ], VerifiedPublisherWidget);
    let SponsorWidget = class SponsorWidget extends ExtensionWidget {
        constructor(container, openerService, telemetryService) {
            super();
            this.container = container;
            this.openerService = openerService;
            this.telemetryService = telemetryService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this.render();
        }
        render() {
            (0, dom_1.reset)(this.container);
            this.disposables.clear();
            if (!this.extension?.publisherSponsorLink) {
                return;
            }
            const sponsor = (0, dom_1.append)(this.container, (0, dom_1.$)('span.sponsor.clickable', { tabIndex: 0, title: this.extension?.publisherSponsorLink }));
            sponsor.setAttribute('role', 'link'); // #132645
            const sponsorIconElement = (0, iconLabels_1.renderIcon)(extensionsIcons_1.sponsorIcon);
            const label = (0, dom_1.$)('span', undefined, (0, nls_1.localize)('sponsor', "Sponsor"));
            (0, dom_1.append)(sponsor, sponsorIconElement, label);
            this.disposables.add(onClick(sponsor, () => {
                this.telemetryService.publicLog2('extensionsAction.sponsorExtension', { extensionId: this.extension.identifier.id });
                this.openerService.open(this.extension.publisherSponsorLink);
            }));
        }
    };
    exports.SponsorWidget = SponsorWidget;
    exports.SponsorWidget = SponsorWidget = __decorate([
        __param(1, opener_1.IOpenerService),
        __param(2, telemetry_1.ITelemetryService)
    ], SponsorWidget);
    let RecommendationWidget = class RecommendationWidget extends ExtensionWidget {
        constructor(parent, extensionRecommendationsService) {
            super();
            this.parent = parent;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this.render();
            this._register((0, lifecycle_1.toDisposable)(() => this.clear()));
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.render()));
        }
        clear() {
            if (this.element) {
                this.parent.removeChild(this.element);
            }
            this.element = undefined;
            this.disposables.clear();
        }
        render() {
            this.clear();
            if (!this.extension || this.extension.state === 1 /* ExtensionState.Installed */ || this.extension.deprecationInfo) {
                return;
            }
            const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
            if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
                this.element = (0, dom_1.append)(this.parent, (0, dom_1.$)('div.extension-bookmark'));
                const recommendation = (0, dom_1.append)(this.element, (0, dom_1.$)('.recommendation'));
                (0, dom_1.append)(recommendation, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.ratingIcon)));
            }
        }
    };
    exports.RecommendationWidget = RecommendationWidget;
    exports.RecommendationWidget = RecommendationWidget = __decorate([
        __param(1, extensionRecommendations_1.IExtensionRecommendationsService)
    ], RecommendationWidget);
    class PreReleaseBookmarkWidget extends ExtensionWidget {
        constructor(parent) {
            super();
            this.parent = parent;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this.render();
            this._register((0, lifecycle_1.toDisposable)(() => this.clear()));
        }
        clear() {
            if (this.element) {
                this.parent.removeChild(this.element);
            }
            this.element = undefined;
            this.disposables.clear();
        }
        render() {
            this.clear();
            if (this.extension?.state === 1 /* ExtensionState.Installed */ ? this.extension.preRelease : this.extension?.hasPreReleaseVersion) {
                this.element = (0, dom_1.append)(this.parent, (0, dom_1.$)('div.extension-bookmark'));
                const preRelease = (0, dom_1.append)(this.element, (0, dom_1.$)('.pre-release'));
                (0, dom_1.append)(preRelease, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.preReleaseIcon)));
            }
        }
    }
    exports.PreReleaseBookmarkWidget = PreReleaseBookmarkWidget;
    let RemoteBadgeWidget = class RemoteBadgeWidget extends ExtensionWidget {
        constructor(parent, tooltip, extensionManagementServerService, instantiationService) {
            super();
            this.tooltip = tooltip;
            this.extensionManagementServerService = extensionManagementServerService;
            this.instantiationService = instantiationService;
            this.remoteBadge = this._register(new lifecycle_1.MutableDisposable());
            this.element = (0, dom_1.append)(parent, (0, dom_1.$)('.extension-remote-badge-container'));
            this.render();
            this._register((0, lifecycle_1.toDisposable)(() => this.clear()));
        }
        clear() {
            if (this.remoteBadge.value) {
                this.element.removeChild(this.remoteBadge.value.element);
            }
            this.remoteBadge.clear();
        }
        render() {
            this.clear();
            if (!this.extension || !this.extension.local || !this.extension.server || !(this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) || this.extension.server !== this.extensionManagementServerService.remoteExtensionManagementServer) {
                return;
            }
            this.remoteBadge.value = this.instantiationService.createInstance(RemoteBadge, this.tooltip);
            (0, dom_1.append)(this.element, this.remoteBadge.value.element);
        }
    };
    exports.RemoteBadgeWidget = RemoteBadgeWidget;
    exports.RemoteBadgeWidget = RemoteBadgeWidget = __decorate([
        __param(2, extensionManagement_1.IExtensionManagementServerService),
        __param(3, instantiation_1.IInstantiationService)
    ], RemoteBadgeWidget);
    let RemoteBadge = class RemoteBadge extends lifecycle_1.Disposable {
        constructor(tooltip, labelService, themeService, extensionManagementServerService) {
            super();
            this.tooltip = tooltip;
            this.labelService = labelService;
            this.themeService = themeService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.element = (0, dom_1.$)('div.extension-badge.extension-remote-badge');
            this.render();
        }
        render() {
            (0, dom_1.append)(this.element, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.remoteIcon)));
            const applyBadgeStyle = () => {
                if (!this.element) {
                    return;
                }
                const bgColor = this.themeService.getColorTheme().getColor(theme_1.EXTENSION_BADGE_REMOTE_BACKGROUND);
                const fgColor = this.themeService.getColorTheme().getColor(theme_1.EXTENSION_BADGE_REMOTE_FOREGROUND);
                this.element.style.backgroundColor = bgColor ? bgColor.toString() : '';
                this.element.style.color = fgColor ? fgColor.toString() : '';
            };
            applyBadgeStyle();
            this._register(this.themeService.onDidColorThemeChange(() => applyBadgeStyle()));
            if (this.tooltip) {
                const updateTitle = () => {
                    if (this.element && this.extensionManagementServerService.remoteExtensionManagementServer) {
                        this.element.title = (0, nls_1.localize)('remote extension title', "Extension in {0}", this.extensionManagementServerService.remoteExtensionManagementServer.label);
                    }
                };
                this._register(this.labelService.onDidChangeFormatters(() => updateTitle()));
                updateTitle();
            }
        }
    };
    RemoteBadge = __decorate([
        __param(1, label_1.ILabelService),
        __param(2, themeService_1.IThemeService),
        __param(3, extensionManagement_1.IExtensionManagementServerService)
    ], RemoteBadge);
    class ExtensionPackCountWidget extends ExtensionWidget {
        constructor(parent) {
            super();
            this.parent = parent;
            this.render();
            this._register((0, lifecycle_1.toDisposable)(() => this.clear()));
        }
        clear() {
            this.element?.remove();
        }
        render() {
            this.clear();
            if (!this.extension || !(this.extension.categories?.some(category => category.toLowerCase() === 'extension packs')) || !this.extension.extensionPack.length) {
                return;
            }
            this.element = (0, dom_1.append)(this.parent, (0, dom_1.$)('.extension-badge.extension-pack-badge'));
            const countBadge = new countBadge_1.CountBadge(this.element, {}, defaultStyles_1.defaultCountBadgeStyles);
            countBadge.setCount(this.extension.extensionPack.length);
        }
    }
    exports.ExtensionPackCountWidget = ExtensionPackCountWidget;
    let SyncIgnoredWidget = class SyncIgnoredWidget extends ExtensionWidget {
        constructor(container, configurationService, extensionsWorkbenchService, userDataSyncEnablementService) {
            super();
            this.container = container;
            this.configurationService = configurationService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.ignoredExtensions'))(() => this.render()));
            this._register(userDataSyncEnablementService.onDidChangeEnablement(() => this.update()));
            this.render();
        }
        render() {
            this.container.innerText = '';
            if (this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.userDataSyncEnablementService.isEnabled() && this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension)) {
                const element = (0, dom_1.append)(this.container, (0, dom_1.$)('span.extension-sync-ignored' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.syncIgnoredIcon)));
                element.title = (0, nls_1.localize)('syncingore.label', "This extension is ignored during sync.");
                element.classList.add(...themables_1.ThemeIcon.asClassNameArray(extensionsIcons_1.syncIgnoredIcon));
            }
        }
    };
    exports.SyncIgnoredWidget = SyncIgnoredWidget;
    exports.SyncIgnoredWidget = SyncIgnoredWidget = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, userDataSync_1.IUserDataSyncEnablementService)
    ], SyncIgnoredWidget);
    let ExtensionActivationStatusWidget = class ExtensionActivationStatusWidget extends ExtensionWidget {
        constructor(container, small, extensionService, extensionsWorkbenchService) {
            super();
            this.container = container;
            this.small = small;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this._register(extensionService.onDidChangeExtensionsStatus(extensions => {
                if (this.extension && extensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.value }, this.extension.identifier))) {
                    this.update();
                }
            }));
        }
        render() {
            this.container.innerText = '';
            if (!this.extension) {
                return;
            }
            const extensionStatus = this.extensionsWorkbenchService.getExtensionStatus(this.extension);
            if (!extensionStatus || !extensionStatus.activationTimes) {
                return;
            }
            const activationTime = extensionStatus.activationTimes.codeLoadingTime + extensionStatus.activationTimes.activateCallTime;
            if (this.small) {
                (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.activationTimeIcon)));
                const activationTimeElement = (0, dom_1.append)(this.container, (0, dom_1.$)('span.activationTime'));
                activationTimeElement.textContent = `${activationTime}ms`;
            }
            else {
                const activationTimeElement = (0, dom_1.append)(this.container, (0, dom_1.$)('span.activationTime'));
                activationTimeElement.textContent = `${(0, nls_1.localize)('activation', "Activation time")}${extensionStatus.activationTimes.activationReason.startup ? ` (${(0, nls_1.localize)('startup', "Startup")})` : ''} : ${activationTime}ms`;
            }
        }
    };
    exports.ExtensionActivationStatusWidget = ExtensionActivationStatusWidget;
    exports.ExtensionActivationStatusWidget = ExtensionActivationStatusWidget = __decorate([
        __param(2, extensions_2.IExtensionService),
        __param(3, extensions_1.IExtensionsWorkbenchService)
    ], ExtensionActivationStatusWidget);
    let ExtensionHoverWidget = ExtensionHoverWidget_1 = class ExtensionHoverWidget extends ExtensionWidget {
        constructor(options, extensionStatusAction, extensionsWorkbenchService, hoverService, configurationService, extensionRecommendationsService, themeService) {
            super();
            this.options = options;
            this.extensionStatusAction = extensionStatusAction;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.hoverService = hoverService;
            this.configurationService = configurationService;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.themeService = themeService;
            this.hover = this._register(new lifecycle_1.MutableDisposable());
        }
        render() {
            this.hover.value = undefined;
            if (this.extension) {
                this.hover.value = (0, iconLabelHover_1.setupCustomHover)({
                    delay: this.configurationService.getValue('workbench.hover.delay'),
                    showHover: (options) => {
                        return this.hoverService.showHover({
                            ...options,
                            additionalClasses: ['extension-hover'],
                            position: {
                                hoverPosition: this.options.position(),
                                forcePosition: true,
                            },
                        });
                    },
                    placement: 'element'
                }, this.options.target, { markdown: () => Promise.resolve(this.getHoverMarkdown()), markdownNotSupportedFallback: undefined });
            }
        }
        getHoverMarkdown() {
            if (!this.extension) {
                return undefined;
            }
            const markdown = new htmlContent_1.MarkdownString('', { isTrusted: true, supportThemeIcons: true });
            markdown.appendMarkdown(`**${this.extension.displayName}**`);
            if (semver.valid(this.extension.version)) {
                markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">**&nbsp;_v${this.extension.version}${(this.extension.isPreReleaseVersion ? ' (pre-release)' : '')}_**&nbsp;</span>`);
            }
            markdown.appendText(`\n`);
            if (this.extension.state === 1 /* ExtensionState.Installed */) {
                let addSeparator = false;
                const installLabel = InstallCountWidget.getInstallLabel(this.extension, true);
                if (installLabel) {
                    if (addSeparator) {
                        markdown.appendText(`  |  `);
                    }
                    markdown.appendMarkdown(`$(${extensionsIcons_1.installCountIcon.id}) ${installLabel}`);
                    addSeparator = true;
                }
                if (this.extension.rating) {
                    if (addSeparator) {
                        markdown.appendText(`  |  `);
                    }
                    const rating = Math.round(this.extension.rating * 2) / 2;
                    markdown.appendMarkdown(`$(${extensionsIcons_1.starFullIcon.id}) [${rating}](${this.extension.url}&ssr=false#review-details)`);
                    addSeparator = true;
                }
                if (this.extension.publisherSponsorLink) {
                    if (addSeparator) {
                        markdown.appendText(`  |  `);
                    }
                    markdown.appendMarkdown(`$(${extensionsIcons_1.sponsorIcon.id}) [${(0, nls_1.localize)('sponsor', "Sponsor")}](${this.extension.publisherSponsorLink})`);
                    addSeparator = true;
                }
                if (addSeparator) {
                    markdown.appendText(`\n`);
                }
            }
            if (this.extension.description) {
                markdown.appendMarkdown(`${this.extension.description}`);
                markdown.appendText(`\n`);
            }
            if (this.extension.publisherDomain?.verified) {
                const bgColor = this.themeService.getColorTheme().getColor(exports.extensionVerifiedPublisherIconColor);
                const publisherVerifiedTooltip = (0, nls_1.localize)('publisher verified tooltip', "This publisher has verified ownership of {0}", `[${uri_1.URI.parse(this.extension.publisherDomain.link).authority}](${this.extension.publisherDomain.link})`);
                markdown.appendMarkdown(`<span style="color:${bgColor ? color_1.Color.Format.CSS.formatHex(bgColor) : '#ffffff'};">$(${extensionsIcons_1.verifiedPublisherIcon.id})</span>&nbsp;${publisherVerifiedTooltip}`);
                markdown.appendText(`\n`);
            }
            if (this.extension.outdated) {
                markdown.appendMarkdown((0, nls_1.localize)('updateRequired', "Latest version:"));
                markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">**&nbsp;_v${this.extension.latestVersion}_**&nbsp;</span>`);
                markdown.appendText(`\n`);
            }
            const preReleaseMessage = ExtensionHoverWidget_1.getPreReleaseMessage(this.extension);
            const extensionRuntimeStatus = this.extensionsWorkbenchService.getExtensionStatus(this.extension);
            const extensionStatus = this.extensionStatusAction.status;
            const reloadRequiredMessage = this.extension.reloadRequiredStatus;
            const recommendationMessage = this.getRecommendationMessage(this.extension);
            if (extensionRuntimeStatus || extensionStatus || reloadRequiredMessage || recommendationMessage || preReleaseMessage) {
                markdown.appendMarkdown(`---`);
                markdown.appendText(`\n`);
                if (extensionRuntimeStatus) {
                    if (extensionRuntimeStatus.activationTimes) {
                        const activationTime = extensionRuntimeStatus.activationTimes.codeLoadingTime + extensionRuntimeStatus.activationTimes.activateCallTime;
                        markdown.appendMarkdown(`${(0, nls_1.localize)('activation', "Activation time")}${extensionRuntimeStatus.activationTimes.activationReason.startup ? ` (${(0, nls_1.localize)('startup', "Startup")})` : ''}: \`${activationTime}ms\``);
                        markdown.appendText(`\n`);
                    }
                    if (extensionRuntimeStatus.runtimeErrors.length || extensionRuntimeStatus.messages.length) {
                        const hasErrors = extensionRuntimeStatus.runtimeErrors.length || extensionRuntimeStatus.messages.some(message => message.type === severity_1.default.Error);
                        const hasWarnings = extensionRuntimeStatus.messages.some(message => message.type === severity_1.default.Warning);
                        const errorsLink = extensionRuntimeStatus.runtimeErrors.length ? `[${extensionRuntimeStatus.runtimeErrors.length === 1 ? (0, nls_1.localize)('uncaught error', '1 uncaught error') : (0, nls_1.localize)('uncaught errors', '{0} uncaught errors', extensionRuntimeStatus.runtimeErrors.length)}](${uri_1.URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, "runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */]))}`)})` : undefined;
                        const messageLink = extensionRuntimeStatus.messages.length ? `[${extensionRuntimeStatus.messages.length === 1 ? (0, nls_1.localize)('message', '1 message') : (0, nls_1.localize)('messages', '{0} messages', extensionRuntimeStatus.messages.length)}](${uri_1.URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, "runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */]))}`)})` : undefined;
                        markdown.appendMarkdown(`$(${hasErrors ? extensionsIcons_1.errorIcon.id : hasWarnings ? extensionsIcons_1.warningIcon.id : extensionsIcons_1.infoIcon.id}) This extension has reported `);
                        if (errorsLink && messageLink) {
                            markdown.appendMarkdown(`${errorsLink} and ${messageLink}`);
                        }
                        else {
                            markdown.appendMarkdown(`${errorsLink || messageLink}`);
                        }
                        markdown.appendText(`\n`);
                    }
                }
                if (extensionStatus) {
                    if (extensionStatus.icon) {
                        markdown.appendMarkdown(`$(${extensionStatus.icon.id})&nbsp;`);
                    }
                    markdown.appendMarkdown(extensionStatus.message.value);
                    if (this.extension.enablementState === 5 /* EnablementState.DisabledByExtensionDependency */ && this.extension.local) {
                        markdown.appendMarkdown(`&nbsp;[${(0, nls_1.localize)('dependencies', "Show Dependencies")}](${uri_1.URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, "dependencies" /* ExtensionEditorTab.Dependencies */]))}`)})`);
                    }
                    markdown.appendText(`\n`);
                }
                if (reloadRequiredMessage) {
                    markdown.appendMarkdown(`$(${extensionsIcons_1.infoIcon.id})&nbsp;`);
                    markdown.appendMarkdown(`${reloadRequiredMessage}`);
                    markdown.appendText(`\n`);
                }
                if (preReleaseMessage) {
                    const extensionPreReleaseIcon = this.themeService.getColorTheme().getColor(exports.extensionPreReleaseIconColor);
                    markdown.appendMarkdown(`<span style="color:${extensionPreReleaseIcon ? color_1.Color.Format.CSS.formatHex(extensionPreReleaseIcon) : '#ffffff'};">$(${extensionsIcons_1.preReleaseIcon.id})</span>&nbsp;${preReleaseMessage}`);
                    markdown.appendText(`\n`);
                }
                if (recommendationMessage) {
                    markdown.appendMarkdown(recommendationMessage);
                    markdown.appendText(`\n`);
                }
            }
            return markdown;
        }
        getRecommendationMessage(extension) {
            if (extension.state === 1 /* ExtensionState.Installed */) {
                return undefined;
            }
            if (extension.deprecationInfo) {
                return undefined;
            }
            const recommendation = this.extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()];
            if (!recommendation?.reasonText) {
                return undefined;
            }
            const bgColor = this.themeService.getColorTheme().getColor(extensionsActions_1.extensionButtonProminentBackground);
            return `<span style="color:${bgColor ? color_1.Color.Format.CSS.formatHex(bgColor) : '#ffffff'};">$(${extensionsIcons_1.starEmptyIcon.id})</span>&nbsp;${recommendation.reasonText}`;
        }
        static getPreReleaseMessage(extension) {
            if (!extension.hasPreReleaseVersion) {
                return undefined;
            }
            if (extension.isBuiltin) {
                return undefined;
            }
            if (extension.isPreReleaseVersion) {
                return undefined;
            }
            if (extension.preRelease) {
                return undefined;
            }
            const preReleaseVersionLink = `[${(0, nls_1.localize)('Show prerelease version', "Pre-Release version")}](${uri_1.URI.parse(`command:workbench.extensions.action.showPreReleaseVersion?${encodeURIComponent(JSON.stringify([extension.identifier.id]))}`)})`;
            return (0, nls_1.localize)('has prerelease', "This extension has a {0} available", preReleaseVersionLink);
        }
    };
    exports.ExtensionHoverWidget = ExtensionHoverWidget;
    exports.ExtensionHoverWidget = ExtensionHoverWidget = ExtensionHoverWidget_1 = __decorate([
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, hover_1.IHoverService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(6, themeService_1.IThemeService)
    ], ExtensionHoverWidget);
    let ExtensionStatusWidget = class ExtensionStatusWidget extends ExtensionWidget {
        constructor(container, extensionStatusAction, openerService) {
            super();
            this.container = container;
            this.extensionStatusAction = extensionStatusAction;
            this.openerService = openerService;
            this.renderDisposables = this._register(new lifecycle_1.MutableDisposable());
            this._onDidRender = this._register(new event_1.Emitter());
            this.onDidRender = this._onDidRender.event;
            this.render();
            this._register(extensionStatusAction.onDidChangeStatus(() => this.render()));
        }
        render() {
            (0, dom_1.reset)(this.container);
            this.renderDisposables.value = undefined;
            const disposables = new lifecycle_1.DisposableStore();
            this.renderDisposables.value = disposables;
            const extensionStatus = this.extensionStatusAction.status;
            if (extensionStatus) {
                const markdown = new htmlContent_1.MarkdownString('', { isTrusted: true, supportThemeIcons: true });
                if (extensionStatus.icon) {
                    markdown.appendMarkdown(`$(${extensionStatus.icon.id})&nbsp;`);
                }
                markdown.appendMarkdown(extensionStatus.message.value);
                const rendered = disposables.add((0, markdownRenderer_1.renderMarkdown)(markdown, {
                    actionHandler: {
                        callback: (content) => {
                            this.openerService.open(content, { allowCommands: true }).catch(errors_1.onUnexpectedError);
                        },
                        disposables
                    }
                }));
                (0, dom_1.append)(this.container, rendered.element);
            }
            this._onDidRender.fire();
        }
    };
    exports.ExtensionStatusWidget = ExtensionStatusWidget;
    exports.ExtensionStatusWidget = ExtensionStatusWidget = __decorate([
        __param(2, opener_1.IOpenerService)
    ], ExtensionStatusWidget);
    let ExtensionRecommendationWidget = class ExtensionRecommendationWidget extends ExtensionWidget {
        constructor(container, extensionRecommendationsService, extensionIgnoredRecommendationsService) {
            super();
            this.container = container;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
            this._onDidRender = this._register(new event_1.Emitter());
            this.onDidRender = this._onDidRender.event;
            this.render();
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.render()));
        }
        render() {
            (0, dom_1.reset)(this.container);
            const recommendationStatus = this.getRecommendationStatus();
            if (recommendationStatus) {
                if (recommendationStatus.icon) {
                    (0, dom_1.append)(this.container, (0, dom_1.$)(`div${themables_1.ThemeIcon.asCSSSelector(recommendationStatus.icon)}`));
                }
                (0, dom_1.append)(this.container, (0, dom_1.$)(`div.recommendation-text`, undefined, recommendationStatus.message));
            }
            this._onDidRender.fire();
        }
        getRecommendationStatus() {
            if (!this.extension
                || this.extension.deprecationInfo
                || this.extension.state === 1 /* ExtensionState.Installed */) {
                return undefined;
            }
            const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
            if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
                const reasonText = extRecommendations[this.extension.identifier.id.toLowerCase()].reasonText;
                if (reasonText) {
                    return { icon: extensionsIcons_1.starEmptyIcon, message: reasonText };
                }
            }
            else if (this.extensionIgnoredRecommendationsService.globalIgnoredRecommendations.indexOf(this.extension.identifier.id.toLowerCase()) !== -1) {
                return { icon: undefined, message: (0, nls_1.localize)('recommendationHasBeenIgnored', "You have chosen not to receive recommendations for this extension.") };
            }
            return undefined;
        }
    };
    exports.ExtensionRecommendationWidget = ExtensionRecommendationWidget;
    exports.ExtensionRecommendationWidget = ExtensionRecommendationWidget = __decorate([
        __param(1, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(2, extensionRecommendations_1.IExtensionIgnoredRecommendationsService)
    ], ExtensionRecommendationWidget);
    exports.extensionRatingIconColor = (0, colorRegistry_1.registerColor)('extensionIcon.starForeground', { light: '#DF6100', dark: '#FF8E00', hcDark: '#FF8E00', hcLight: colorRegistry_1.textLinkForeground }, (0, nls_1.localize)('extensionIconStarForeground', "The icon color for extension ratings."), true);
    exports.extensionVerifiedPublisherIconColor = (0, colorRegistry_1.registerColor)('extensionIcon.verifiedForeground', { dark: colorRegistry_1.textLinkForeground, light: colorRegistry_1.textLinkForeground, hcDark: colorRegistry_1.textLinkForeground, hcLight: colorRegistry_1.textLinkForeground }, (0, nls_1.localize)('extensionIconVerifiedForeground', "The icon color for extension verified publisher."), true);
    exports.extensionPreReleaseIconColor = (0, colorRegistry_1.registerColor)('extensionIcon.preReleaseForeground', { dark: '#1d9271', light: '#1d9271', hcDark: '#1d9271', hcLight: colorRegistry_1.textLinkForeground }, (0, nls_1.localize)('extensionPreReleaseForeground', "The icon color for pre-release extension."), true);
    exports.extensionSponsorIconColor = (0, colorRegistry_1.registerColor)('extensionIcon.sponsorForeground', { light: '#B51E78', dark: '#D758B3', hcDark: null, hcLight: '#B51E78' }, (0, nls_1.localize)('extensionIcon.sponsorForeground', "The icon color for extension sponsor."), true);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const extensionRatingIcon = theme.getColor(exports.extensionRatingIconColor);
        if (extensionRatingIcon) {
            collector.addRule(`.extension-ratings .codicon-extensions-star-full, .extension-ratings .codicon-extensions-star-half { color: ${extensionRatingIcon}; }`);
            collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starFullIcon)} { color: ${extensionRatingIcon}; }`);
        }
        const extensionVerifiedPublisherIcon = theme.getColor(exports.extensionVerifiedPublisherIconColor);
        if (extensionVerifiedPublisherIcon) {
            collector.addRule(`${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.verifiedPublisherIcon)} { color: ${extensionVerifiedPublisherIcon}; }`);
        }
        collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.sponsorIcon)} { color: var(--vscode-extensionIcon-sponsorForeground); }`);
        collector.addRule(`.extension-editor > .header > .details > .subtitle .sponsor ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.sponsorIcon)} { color: var(--vscode-extensionIcon-sponsorForeground); }`);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1dpZGdldHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvYnJvd3Nlci9leHRlbnNpb25zV2lkZ2V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeUNoRyxNQUFzQixlQUFnQixTQUFRLHNCQUFVO1FBQXhEOztZQUNTLGVBQVUsR0FBc0IsSUFBSSxDQUFDO1FBSzlDLENBQUM7UUFKQSxJQUFJLFNBQVMsS0FBd0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUM5RCxJQUFJLFNBQVMsQ0FBQyxTQUE0QixJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzRixNQUFNLEtBQVcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztLQUVqQztJQU5ELDBDQU1DO0lBRUQsU0FBZ0IsT0FBTyxDQUFDLE9BQW9CLEVBQUUsUUFBb0I7UUFDakUsTUFBTSxXQUFXLEdBQW9CLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBQzNELFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxPQUFPLEVBQUUsZUFBUyxDQUFDLEtBQUssRUFBRSxJQUFBLGtCQUFZLEVBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxPQUFPLEVBQUUsZUFBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRTtZQUNwRSxNQUFNLGFBQWEsR0FBRyxJQUFJLHFDQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25ELElBQUksYUFBYSxDQUFDLE1BQU0sd0JBQWUsSUFBSSxh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