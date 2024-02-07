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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/tunnel/common/tunnel", "vs/workbench/contrib/terminalContrib/links/browser/terminalExternalLinkDetector", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkDetectorAdapter", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkOpeners", "vs/workbench/contrib/terminalContrib/links/browser/terminalLocalLinkDetector", "vs/workbench/contrib/terminalContrib/links/browser/terminalUriLinkDetector", "vs/workbench/contrib/terminalContrib/links/browser/terminalWordLinkDetector", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/widgets/terminalHoverWidget", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers", "vs/base/common/async", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/terminalContrib/links/browser/terminalMultiLineLinkDetector"], function (require, exports, dom_1, htmlContent_1, lifecycle_1, platform_1, uri_1, nls, configuration_1, instantiation_1, tunnel_1, terminalExternalLinkDetector_1, terminalLinkDetectorAdapter_1, terminalLinkOpeners_1, terminalLocalLinkDetector_1, terminalUriLinkDetector_1, terminalWordLinkDetector_1, terminal_1, terminalHoverWidget_1, terminal_2, terminalLinkHelpers_1, async_1, terminal_3, terminalMultiLineLinkDetector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalLinkManager = void 0;
    /**
     * An object responsible for managing registration of link matchers and link providers.
     */
    let TerminalLinkManager = class TerminalLinkManager extends lifecycle_1.DisposableStore {
        constructor(_xterm, _processInfo, capabilities, _linkResolver, _configurationService, _instantiationService, _logService, _tunnelService) {
            super();
            this._xterm = _xterm;
            this._processInfo = _processInfo;
            this._linkResolver = _linkResolver;
            this._configurationService = _configurationService;
            this._instantiationService = _instantiationService;
            this._logService = _logService;
            this._tunnelService = _tunnelService;
            this._standardLinkProviders = new Map();
            this._linkProvidersDisposables = [];
            this._externalLinkProviders = [];
            this._openers = new Map();
            let enableFileLinks = true;
            const enableFileLinksConfig = this._configurationService.getValue(terminal_2.TERMINAL_CONFIG_SECTION).enableFileLinks;
            switch (enableFileLinksConfig) {
                case 'off':
                case false: // legacy from v1.75
                    enableFileLinks = false;
                    break;
                case 'notRemote':
                    enableFileLinks = !this._processInfo.remoteAuthority;
                    break;
            }
            // Setup link detectors in their order of priority
            if (enableFileLinks) {
                this._setupLinkDetector(terminalMultiLineLinkDetector_1.TerminalMultiLineLinkDetector.id, this._instantiationService.createInstance(terminalMultiLineLinkDetector_1.TerminalMultiLineLinkDetector, this._xterm, this._processInfo, this._linkResolver));
                this._setupLinkDetector(terminalLocalLinkDetector_1.TerminalLocalLinkDetector.id, this._instantiationService.createInstance(terminalLocalLinkDetector_1.TerminalLocalLinkDetector, this._xterm, capabilities, this._processInfo, this._linkResolver));
            }
            this._setupLinkDetector(terminalUriLinkDetector_1.TerminalUriLinkDetector.id, this._instantiationService.createInstance(terminalUriLinkDetector_1.TerminalUriLinkDetector, this._xterm, this._processInfo, this._linkResolver));
            this._setupLinkDetector(terminalWordLinkDetector_1.TerminalWordLinkDetector.id, this.add(this._instantiationService.createInstance(terminalWordLinkDetector_1.TerminalWordLinkDetector, this._xterm)));
            // Setup link openers
            const localFileOpener = this._instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFileLinkOpener);
            const localFolderInWorkspaceOpener = this._instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderInWorkspaceLinkOpener);
            this._openers.set("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, localFileOpener);
            this._openers.set("LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */, localFolderInWorkspaceOpener);
            this._openers.set("LocalFolderOutsideWorkspace" /* TerminalBuiltinLinkType.LocalFolderOutsideWorkspace */, this._instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderOutsideWorkspaceLinkOpener));
            this._openers.set("Search" /* TerminalBuiltinLinkType.Search */, this._instantiationService.createInstance(terminalLinkOpeners_1.TerminalSearchLinkOpener, capabilities, this._processInfo.initialCwd, localFileOpener, localFolderInWorkspaceOpener, () => this._processInfo.os || platform_1.OS));
            this._openers.set("Url" /* TerminalBuiltinLinkType.Url */, this._instantiationService.createInstance(terminalLinkOpeners_1.TerminalUrlLinkOpener, !!this._processInfo.remoteAuthority));
            this._registerStandardLinkProviders();
            let activeHoverDisposable;
            let activeTooltipScheduler;
            this.add((0, lifecycle_1.toDisposable)(() => {
                activeHoverDisposable?.dispose();
                activeTooltipScheduler?.dispose();
            }));
            this._xterm.options.linkHandler = {
                activate: (_, text) => {
                    this._openers.get("Url" /* TerminalBuiltinLinkType.Url */)?.open({
                        type: "Url" /* TerminalBuiltinLinkType.Url */,
                        text,
                        bufferRange: null,
                        uri: uri_1.URI.parse(text)
                    });
                },
                hover: (e, text, range) => {
                    activeHoverDisposable?.dispose();
                    activeHoverDisposable = undefined;
                    activeTooltipScheduler?.dispose();
                    activeTooltipScheduler = new async_1.RunOnceScheduler(() => {
                        const core = this._xterm._core;
                        const cellDimensions = {
                            width: core._renderService.dimensions.css.cell.width,
                            height: core._renderService.dimensions.css.cell.height
                        };
                        const terminalDimensions = {
                            width: this._xterm.cols,
                            height: this._xterm.rows
                        };
                        activeHoverDisposable = this._showHover({
                            viewportRange: (0, terminalLinkHelpers_1.convertBufferRangeToViewport)(range, this._xterm.buffer.active.viewportY),
                            cellDimensions,
                            terminalDimensions
                        }, this._getLinkHoverString(text, text), undefined, (text) => this._xterm.options.linkHandler?.activate(e, text, range));
                        // Clear out scheduler until next hover event
                        activeTooltipScheduler?.dispose();
                        activeTooltipScheduler = undefined;
                    }, this._configurationService.getValue('workbench.hover.delay'));
                    activeTooltipScheduler.schedule();
                }
            };
        }
        _setupLinkDetector(id, detector, isExternal = false) {
            const detectorAdapter = this.add(this._instantiationService.createInstance(terminalLinkDetectorAdapter_1.TerminalLinkDetectorAdapter, detector));
            this.add(detectorAdapter.onDidActivateLink(e => {
                // Prevent default electron link handling so Alt+Click mode works normally
                e.event?.preventDefault();
                // Require correct modifier on click unless event is coming from linkQuickPick selection
                if (e.event && !(e.event instanceof terminal_1.TerminalLinkQuickPickEvent) && !this._isLinkActivationModifierDown(e.event)) {
                    return;
                }
                // Just call the handler if there is no before listener
                if (e.link.activate) {
                    // Custom activate call (external links only)
                    e.link.activate(e.link.text);
                }
                else {
                    this._openLink(e.link);
                }
            }));
            this.add(detectorAdapter.onDidShowHover(e => this._tooltipCallback(e.link, e.viewportRange, e.modifierDownCallback, e.modifierUpCallback)));
            if (!isExternal) {
                this._standardLinkProviders.set(id, detectorAdapter);
            }
            return detectorAdapter;
        }
        async _openLink(link) {
            this._logService.debug('Opening link', link);
            const opener = this._openers.get(link.type);
            if (!opener) {
                throw new Error(`No matching opener for link type "${link.type}"`);
            }
            await opener.open(link);
        }
        async openRecentLink(type) {
            let links;
            let i = this._xterm.buffer.active.length;
            while ((!links || links.length === 0) && i >= this._xterm.buffer.active.viewportY) {
                links = await this._getLinksForType(i, type);
                i--;
            }
            if (!links || links.length < 1) {
                return undefined;
            }
            const event = new terminal_1.TerminalLinkQuickPickEvent(dom_1.EventType.CLICK);
            links[0].activate(event, links[0].text);
            return links[0];
        }
        async getLinks() {
            // Fetch and await the viewport results
            const viewportLinksByLinePromises = [];
            for (let i = this._xterm.buffer.active.viewportY + this._xterm.rows - 1; i >= this._xterm.buffer.active.viewportY; i--) {
                viewportLinksByLinePromises.push(this._getLinksForLine(i));
            }
            const viewportLinksByLine = await Promise.all(viewportLinksByLinePromises);
            // Assemble viewport links
            const viewportLinks = {
                wordLinks: [],
                webLinks: [],
                fileLinks: [],
                folderLinks: [],
            };
            for (const links of viewportLinksByLine) {
                if (links) {
                    const { wordLinks, webLinks, fileLinks, folderLinks } = links;
                    if (wordLinks?.length) {
                        viewportLinks.wordLinks.push(...wordLinks.reverse());
                    }
                    if (webLinks?.length) {
                        viewportLinks.webLinks.push(...webLinks.reverse());
                    }
                    if (fileLinks?.length) {
                        viewportLinks.fileLinks.push(...fileLinks.reverse());
                    }
                    if (folderLinks?.length) {
                        viewportLinks.folderLinks.push(...folderLinks.reverse());
                    }
                }
            }
            // Fetch the remaining results async
            const aboveViewportLinksPromises = [];
            for (let i = this._xterm.buffer.active.viewportY - 1; i >= 0; i--) {
                aboveViewportLinksPromises.push(this._getLinksForLine(i));
            }
            const belowViewportLinksPromises = [];
            for (let i = this._xterm.buffer.active.length - 1; i >= this._xterm.buffer.active.viewportY + this._xterm.rows; i--) {
                belowViewportLinksPromises.push(this._getLinksForLine(i));
            }
            // Assemble all links in results
            const allLinks = Promise.all(aboveViewportLinksPromises).then(async (aboveViewportLinks) => {
                const belowViewportLinks = await Promise.all(belowViewportLinksPromises);
                const allResults = {
                    wordLinks: [...viewportLinks.wordLinks],
                    webLinks: [...viewportLinks.webLinks],
                    fileLinks: [...viewportLinks.fileLinks],
                    folderLinks: [...viewportLinks.folderLinks]
                };
                for (const links of [...belowViewportLinks, ...aboveViewportLinks]) {
                    if (links) {
                        const { wordLinks, webLinks, fileLinks, folderLinks } = links;
                        if (wordLinks?.length) {
                            allResults.wordLinks.push(...wordLinks.reverse());
                        }
                        if (webLinks?.length) {
                            allResults.webLinks.push(...webLinks.reverse());
                        }
                        if (fileLinks?.length) {
                            allResults.fileLinks.push(...fileLinks.reverse());
                        }
                        if (folderLinks?.length) {
                            allResults.folderLinks.push(...folderLinks.reverse());
                        }
                    }
                }
                return allResults;
            });
            return {
                viewport: viewportLinks,
                all: allLinks
            };
        }
        async _getLinksForLine(y) {
            const unfilteredWordLinks = await this._getLinksForType(y, 'word');
            const webLinks = await this._getLinksForType(y, 'url');
            const fileLinks = await this._getLinksForType(y, 'localFile');
            const folderLinks = await this._getLinksForType(y, 'localFolder');
            const words = new Set();
            let wordLinks;
            if (unfilteredWordLinks) {
                wordLinks = [];
                for (const link of unfilteredWordLinks) {
                    if (!words.has(link.text) && link.text.length > 1) {
                        wordLinks.push(link);
                        words.add(link.text);
                    }
                }
            }
            return { wordLinks, webLinks, fileLinks, folderLinks };
        }
        async _getLinksForType(y, type) {
            switch (type) {
                case 'word':
                    return (await new Promise(r => this._standardLinkProviders.get(terminalWordLinkDetector_1.TerminalWordLinkDetector.id)?.provideLinks(y, r)));
                case 'url':
                    return (await new Promise(r => this._standardLinkProviders.get(terminalUriLinkDetector_1.TerminalUriLinkDetector.id)?.provideLinks(y, r)));
                case 'localFile': {
                    const links = (await new Promise(r => this._standardLinkProviders.get(terminalLocalLinkDetector_1.TerminalLocalLinkDetector.id)?.provideLinks(y, r)));
                    return links?.filter(link => link.type === "LocalFile" /* TerminalBuiltinLinkType.LocalFile */);
                }
                case 'localFolder': {
                    const links = (await new Promise(r => this._standardLinkProviders.get(terminalLocalLinkDetector_1.TerminalLocalLinkDetector.id)?.provideLinks(y, r)));
                    return links?.filter(link => link.type === "LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */);
                }
            }
        }
        _tooltipCallback(link, viewportRange, modifierDownCallback, modifierUpCallback) {
            if (!this._widgetManager) {
                return;
            }
            const core = this._xterm._core;
            const cellDimensions = {
                width: core._renderService.dimensions.css.cell.width,
                height: core._renderService.dimensions.css.cell.height
            };
            const terminalDimensions = {
                width: this._xterm.cols,
                height: this._xterm.rows
            };
            // Don't pass the mouse event as this avoids the modifier check
            this._showHover({
                viewportRange,
                cellDimensions,
                terminalDimensions,
                modifierDownCallback,
                modifierUpCallback
            }, this._getLinkHoverString(link.text, link.label), link.actions, (text) => link.activate(undefined, text), link);
        }
        _showHover(targetOptions, text, actions, linkHandler, link) {
            if (this._widgetManager) {
                const widget = this._instantiationService.createInstance(terminalHoverWidget_1.TerminalHover, targetOptions, text, actions, linkHandler);
                const attached = this._widgetManager.attachWidget(widget);
                if (attached) {
                    link?.onInvalidated(() => attached.dispose());
                }
                return attached;
            }
            return undefined;
        }
        setWidgetManager(widgetManager) {
            this._widgetManager = widgetManager;
        }
        _clearLinkProviders() {
            (0, lifecycle_1.dispose)(this._linkProvidersDisposables);
            this._linkProvidersDisposables.length = 0;
        }
        _registerStandardLinkProviders() {
            for (const p of this._standardLinkProviders.values()) {
                this._linkProvidersDisposables.push(this._xterm.registerLinkProvider(p));
            }
        }
        registerExternalLinkProvider(provideLinks) {
            // Clear and re-register the standard link providers so they are a lower priority than the new one
            this._clearLinkProviders();
            const detectorId = `extension-${this._externalLinkProviders.length}`;
            const wrappedLinkProvider = this._setupLinkDetector(detectorId, new terminalExternalLinkDetector_1.TerminalExternalLinkDetector(detectorId, this._xterm, provideLinks), true);
            const newLinkProvider = this._xterm.registerLinkProvider(wrappedLinkProvider);
            this._externalLinkProviders.push(newLinkProvider);
            this._registerStandardLinkProviders();
            return newLinkProvider;
        }
        _isLinkActivationModifierDown(event) {
            const editorConf = this._configurationService.getValue('editor');
            if (editorConf.multiCursorModifier === 'ctrlCmd') {
                return !!event.altKey;
            }
            return platform_1.isMacintosh ? event.metaKey : event.ctrlKey;
        }
        _getLinkHoverString(uri, label) {
            const editorConf = this._configurationService.getValue('editor');
            let clickLabel = '';
            if (editorConf.multiCursorModifier === 'ctrlCmd') {
                if (platform_1.isMacintosh) {
                    clickLabel = nls.localize('terminalLinkHandler.followLinkAlt.mac', "option + click");
                }
                else {
                    clickLabel = nls.localize('terminalLinkHandler.followLinkAlt', "alt + click");
                }
            }
            else {
                if (platform_1.isMacintosh) {
                    clickLabel = nls.localize('terminalLinkHandler.followLinkCmd', "cmd + click");
                }
                else {
                    clickLabel = nls.localize('terminalLinkHandler.followLinkCtrl', "ctrl + click");
                }
            }
            let fallbackLabel = nls.localize('followLink', "Follow link");
            try {
                if (this._tunnelService.canTunnel(uri_1.URI.parse(uri))) {
                    fallbackLabel = nls.localize('followForwardedLink', "Follow link using forwarded port");
                }
            }
            catch {
                // No-op, already set to fallback
            }
            const markdown = new htmlContent_1.MarkdownString('', true);
            // Escapes markdown in label & uri
            if (label) {
                label = markdown.appendText(label).value;
                markdown.value = '';
            }
            if (uri) {
                uri = markdown.appendText(uri).value;
                markdown.value = '';
            }
            label = label || fallbackLabel;
            // Use the label when uri is '' so the link displays correctly
            uri = uri || label;
            // Although if there is a space in the uri, just replace it completely
            if (/(\s|&nbsp;)/.test(uri)) {
                uri = nls.localize('followLinkUrl', 'Link');
            }
            return markdown.appendLink(uri, label).appendMarkdown(` (${clickLabel})`);
        }
    };
    exports.TerminalLinkManager = TerminalLinkManager;
    exports.TerminalLinkManager = TerminalLinkManager = __decorate([
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, terminal_3.ITerminalLogService),
        __param(7, tunnel_1.ITunnelService)
    ], TerminalLinkManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2xpbmtzL2Jyb3dzZXIvdGVybWluYWxMaW5rTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQ2hHOztPQUVHO0lBQ0ksSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSwyQkFBZTtRQU92RCxZQUNrQixNQUFnQixFQUNoQixZQUFrQyxFQUNuRCxZQUFzQyxFQUNyQixhQUFvQyxFQUM5QixxQkFBNkQsRUFDN0QscUJBQTZELEVBQy9ELFdBQWlELEVBQ3RELGNBQStDO1lBRS9ELEtBQUssRUFBRSxDQUFDO1lBVFMsV0FBTSxHQUFOLE1BQU0sQ0FBVTtZQUNoQixpQkFBWSxHQUFaLFlBQVksQ0FBc0I7WUFFbEMsa0JBQWEsR0FBYixhQUFhLENBQXVCO1lBQ2IsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUM1QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQzlDLGdCQUFXLEdBQVgsV0FBVyxDQUFxQjtZQUNyQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFiL0MsMkJBQXNCLEdBQStCLElBQUksR0FBRyxFQUFFLENBQUM7WUFDL0QsOEJBQXlCLEdBQWtCLEVBQUUsQ0FBQztZQUM5QywyQkFBc0IsR0FBa0IsRUFBRSxDQUFDO1lBQzNDLGFBQVEsR0FBK0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQWNqRixJQUFJLGVBQWUsR0FBWSxJQUFJLENBQUM7WUFDcEMsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUF5QixrQ0FBdUIsQ0FBQyxDQUFDLGVBQXNFLENBQUM7WUFDMUwsUUFBUSxxQkFBcUIsRUFBRSxDQUFD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