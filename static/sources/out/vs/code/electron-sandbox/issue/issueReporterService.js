var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/button/button", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/window", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/collections", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/themables", "vs/code/electron-sandbox/issue/issueReporterModel", "vs/nls", "vs/platform/diagnostics/common/diagnostics", "vs/platform/issue/common/issue", "vs/platform/issue/common/issueReporterUtil", "vs/platform/native/common/native", "vs/platform/theme/browser/iconsStyleSheet", "vs/platform/window/electron-sandbox/window"], function (require, exports, dom_1, button_1, iconLabels_1, window_1, async_1, codicons_1, collections_1, decorators_1, errors_1, lifecycle_1, platform_1, strings_1, themables_1, issueReporterModel_1, nls_1, diagnostics_1, issue_1, issueReporterUtil_1, native_1, iconsStyleSheet_1, window_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.show = exports.hide = exports.IssueReporter = void 0;
    // GitHub has let us know that we could up our limit here to 8k. We chose 7500 to play it safe.
    // ref https://github.com/microsoft/vscode/issues/159191
    const MAX_URL_LENGTH = 7500;
    var IssueSource;
    (function (IssueSource) {
        IssueSource["VSCode"] = "vscode";
        IssueSource["Extension"] = "extension";
        IssueSource["Marketplace"] = "marketplace";
    })(IssueSource || (IssueSource = {}));
    let IssueReporter = class IssueReporter extends lifecycle_1.Disposable {
        constructor(configuration, nativeHostService, issueMainService) {
            super();
            this.configuration = configuration;
            this.nativeHostService = nativeHostService;
            this.issueMainService = issueMainService;
            this.numberOfSearchResultsDisplayed = 0;
            this.receivedSystemInfo = false;
            this.receivedExtensionData = false;
            this.receivedPerformanceInfo = false;
            this.shouldQueueSearch = false;
            this.hasBeenSubmitted = false;
            this.delayedSubmit = new async_1.Delayer(300);
            const targetExtension = configuration.data.extensionId ? configuration.data.enabledExtensions.find(extension => extension.id.toLocaleLowerCase() === configuration.data.extensionId?.toLocaleLowerCase()) : undefined;
            this.issueReporterModel = new issueReporterModel_1.IssueReporterModel({
                ...configuration.data,
                issueType: configuration.data.issueType || 0 /* IssueType.Bug */,
                versionInfo: {
                    vscodeVersion: `${configuration.product.nameShort} ${!!configuration.product.darwinUniversalAssetId ? `${configuration.product.version} (Universal)` : configuration.product.version} (${configuration.product.commit || 'Commit unknown'}, ${configuration.product.date || 'Date unknown'})`,
                    os: `${this.configuration.os.type} ${this.configuration.os.arch} ${this.configuration.os.release}${platform_1.isLinuxSnap ? ' snap' : ''}`
                },
                extensionsDisabled: !!configuration.disableExtensions,
                fileOnExtension: configuration.data.extensionId ? !targetExtension?.isBuiltin : undefined,
                selectedExtension: targetExtension
            });
            //TODO: Handle case where extension is not activated
            const issueReporterElement = this.getElementById('issue-reporter');
            if (issueReporterElement) {
                this.previewButton = new button_1.Button(issueReporterElement, button_1.unthemedButtonStyles);
                this.updatePreviewButtonState();
            }
            const issueTitle = configuration.data.issueTitle;
            if (issueTitle) {
                const issueTitleElement = this.getElementById('issue-title');
                if (issueTitleElement) {
                    issueTitleElement.value = issueTitle;
                }
            }
            const issueBody = configuration.data.issueBody;
            if (issueBody) {
                const description = this.getElementById('description');
                if (description) {
                    description.value = issueBody;
                    this.issueReporterModel.update({ issueDescription: issueBody });
                }
            }
            this.issueMainService.$getSystemInfo().then(info => {
                this.issueReporterModel.update({ systemInfo: info });
                this.receivedSystemInfo = true;
                this.updateSystemInfo(this.issueReporterModel.getData());
                this.updatePreviewButtonState();
            });
            if (configuration.data.issueType === 1 /* IssueType.PerformanceIssue */) {
                this.issueMainService.$getPerformanceInfo().then(info => {
                    this.updatePerformanceInfo(info);
                });
            }
            if (window_1.mainWindow.document.documentElement.lang !== 'en') {
                show(this.getElementById('english'));
            }
            const codiconStyleSheet = (0, dom_1.createStyleSheet)();
            codiconStyleSheet.id = 'codiconStyles';
            // TODO: Is there a way to use the IThemeService here instead
            const iconsStyleSheet = (0, iconsStyleSheet_1.getIconsStyleSheet)(undefined);
            function updateAll() {
                codiconStyleSheet.textContent = iconsStyleSheet.getCSS();
            }
            const delayer = new async_1.RunOnceScheduler(updateAll, 0);
            iconsStyleSheet.onDidChange(() => delayer.schedule());
            delayer.schedule();
            this.setUpTypes();
            this.setEventHandlers();
            (0, window_2.applyZoom)(configuration.data.zoomLevel, window_1.mainWindow);
            this.applyStyles(configuration.data.styles);
            this.handleExtensionData(configuration.data.enabledExtensions);
            this.updateExperimentsInfo(configuration.data.experiments);
            this.updateRestrictedMode(configuration.data.restrictedMode);
            this.updateUnsupportedMode(configuration.data.isUnsupported);
            // Handle case where extension is pre-selected through the command
            if (configuration.data.command && targetExtension) {
                this.updateExtensionStatus(targetExtension);
            }
        }
        render() {
            this.renderBlocks();
        }
        setInitialFocus() {
            const { fileOnExtension } = this.issueReporterModel.getData();
            if (fileOnExtension) {
                const issueTitle = window_1.mainWindow.document.getElementById('issue-title');
                issueTitle?.focus();
            }
            else {
                const issueType = window_1.mainWindow.document.getElementById('issue-type');
                issueType?.focus();
            }
        }
        applyStyles(styles) {
            const styleTag = document.createElement('style');
            const content = [];
            if (styles.inputBackground) {
                content.push(`input[type="text"], textarea, select, .issues-container > .issue > .issue-state, .block-info { background-color: ${styles.inputBackground}; }`);
            }
            if (styles.inputBorder) {
                content.push(`input[type="text"], textarea, select { border: 1px solid ${styles.inputBorder}; }`);
            }
            else {
                content.push(`input[type="text"], textarea, select { border: 1px solid transparent; }`);
            }
            if (styles.inputForeground) {
                content.push(`input[type="text"], textarea, select, .issues-container > .issue > .issue-state, .block-info { color: ${styles.inputForeground}; }`);
            }
            if (styles.inputErrorBorder) {
                content.push(`.invalid-input, .invalid-input:focus, .validation-error { border: 1px solid ${styles.inputErrorBorder} !important; }`);
                content.push(`.required-input { color: ${styles.inputErrorBorder}; }`);
            }
            if (styles.inputErrorBackground) {
                content.push(`.validation-error { background: ${styles.inputErrorBackground}; }`);
            }
            if (styles.inputErrorForeground) {
                content.push(`.validation-error { color: ${styles.inputErrorForeground}; }`);
            }
            if (styles.inputActiveBorder) {
                content.push(`input[type='text']:focus, textarea:focus, select:focus, summary:focus, button:focus, a:focus, .workbenchCommand:focus  { border: 1px solid ${styles.inputActiveBorder}; outline-style: none; }`);
            }
            if (styles.textLinkColor) {
                content.push(`a, .workbenchCommand { color: ${styles.textLinkColor}; }`);
            }
            if (styles.textLinkColor) {
                content.push(`a { color: ${styles.textLinkColor}; }`);
            }
            if (styles.textLinkActiveForeground) {
                content.push(`a:hover, .workbenchCommand:hover { color: ${styles.textLinkActiveForeground}; }`);
            }
            if (styles.sliderBackgroundColor) {
                content.push(`::-webkit-scrollbar-thumb { background-color: ${styles.sliderBackgroundColor}; }`);
            }
            if (styles.sliderActiveColor) {
                content.push(`::-webkit-scrollbar-thumb:active { background-color: ${styles.sliderActiveColor}; }`);
            }
            if (styles.sliderHoverColor) {
                content.push(`::--webkit-scrollbar-thumb:hover { background-color: ${styles.sliderHoverColor}; }`);
            }
            if (styles.buttonBackground) {
                content.push(`.monaco-text-button { background-color: ${styles.buttonBackground} !important; }`);
            }
            if (styles.buttonForeground) {
                content.push(`.monaco-text-button { color: ${styles.buttonForeground} !important; }`);
            }
            if (styles.buttonHoverBackground) {
                content.push(`.monaco-text-button:not(.disabled):hover, .monaco-text-button:focus { background-color: ${styles.buttonHoverBackground} !important; }`);
            }
            styleTag.textContent = content.join('\n');
            window_1.mainWindow.document.head.appendChild(styleTag);
            window_1.mainWindow.document.body.style.color = styles.color || '';
        }
        handleExtensionData(extensions) {
            const installedExtensions = extensions.filter(x => !x.isBuiltin);
            const { nonThemes, themes } = (0, collections_1.groupBy)(installedExtensions, ext => {
                return ext.isTheme ? 'themes' : 'nonThemes';
            });
            const numberOfThemeExtesions = themes && themes.length;
            this.issueReporterModel.update({ numberOfThemeExtesions, enabledNonThemeExtesions: nonThemes, allExtensions: installedExtensions });
            this.updateExtensionTable(nonThemes, numberOfThemeExtesions);
            if (this.configuration.disableExtensions || installedExtensions.length === 0) {
                this.getElementById('disableExtensions').disabled = true;
            }
            this.updateExtensionSelector(installedExtensions);
        }
        async updateIssueReporterUri(extension) {
            try {
                if (extension.command?.uri) {
                    extension.bugsUrl = extension.command.uri;
                }
                else {
                    const uri = await this.issueMainService.$getIssueReporterUri(extension.id);
                    extension.bugsUrl = uri.toString(true);
                }
            }
            catch (e) {
                extension.hasIssueUriRequestHandler = false;
                // The issue handler failed so fall back to old issue reporter experience.
                this.renderBlocks();
            }
        }
        async getIssueDataFromExtension(extension) {
            try {
                const data = await this.issueMainService.$getIssueReporterData(extension.id);
                extension.extensionData = data;
                this.receivedExtensionData = true;
                this.issueReporterModel.update({ extensionData: data });
                return data;
            }
            catch (e) {
                extension.hasIssueDataProviders = false;
                // The issue handler failed so fall back to old issue reporter experience.
                this.renderBlocks();
                throw e;
            }
        }
        async getIssueTemplateFromExtension(extension) {
            try {
                const data = await this.issueMainService.$getIssueReporterTemplate(extension.id);
                extension.extensionTemplate = data;
                return data;
            }
            catch (e) {
                throw e;
            }
        }
        async getReporterStatus(extension) {
            try {
                const data = await this.issueMainService.$getReporterStatus(extension.id, extension.name);
                return data;
            }
            catch (e) {
                console.error(e);
                return [false, false];
            }
        }
        setEventHandlers() {
            this.addEventListener('issue-type', 'change', (event) => {
                const issueType = parseInt(event.target.value);
                this.issueReporterModel.update({ issueType: issueType });
                if (issueType === 1 /* IssueType.PerformanceIssue */ && !this.receivedPerformanceInfo) {
                    this.issueMainService.$getPerformanceInfo().then(info => {
                        this.updatePerformanceInfo(info);
                    });
                }
                this.updatePreviewButtonState();
                this.setSourceOptions();
                this.render();
            });
            ['includeSystemInfo', 'includeProcessInfo', 'includeWorkspaceInfo', 'includeExtensions', 'includeExperiments', 'includeExtensionData'].forEach(elementId => {
                this.addEventListener(elementId, 'click', (event) => {
                    event.stopPropagation();
                    this.issueReporterModel.update({ [elementId]: !this.issueReporterModel.getData()[elementId] });
                });
            });
            const showInfoElements = window_1.mainWindow.document.getElementsByClassName('showInfo');
            for (let i = 0; i < showInfoElements.length; i++) {
                const showInfo = showInfoElements.item(i);
                showInfo.addEventListener('click', (e) => {
                    e.preventDefault();
                    const label = e.target;
                    if (label) {
                        const containingElement = label.parentElement && label.parentElement.parentElement;
                        const info = containingElement && containingElement.lastElementChild;
                        if (info && info.classList.contains('hidden')) {
                            show(info);
                            label.textContent = (0, nls_1.localize)('hide', "hide");
                        }
                        else {
                            hide(info);
                            label.textContent = (0, nls_1.localize)('show', "show");
                        }
                    }
                });
            }
            this.addEventListener('issue-source', 'change', (e) => {
                const value = e.target.value;
                const problemSourceHelpText = this.getElementById('problem-source-help-text');
                if (value === '') {
                    this.issueReporterModel.update({ fileOnExtension: undefined });
                    show(problemSourceHelpText);
                    this.clearSearchResults();
                    this.render();
                    return;
                }
                else {
                    hide(problemSourceHelpText);
                }
                let fileOnExtension, fileOnMarketplace = false;
                if (value === IssueSource.Extension) {
                    fileOnExtension = true;
                }
                else if (value === IssueSource.Marketplace) {
                    fileOnMarketplace = true;
                }
                this.issueReporterModel.update({ fileOnExtension, fileOnMarketplace });
                this.render();
                const title = this.getElementById('issue-title').value;
                this.searchIssues(title, fileOnExtension, fileOnMarketplace);
            });
            this.addEventListener('description', 'input', (e) => {
                const issueDescription = e.target.value;
                this.issueReporterModel.update({ issueDescription });
                // Only search for extension issues on title change
                if (this.issueReporterModel.fileOnExtension() === false) {
                    const title = this.getElementById('issue-title').value;
                    this.searchVSCodeIssues(title, issueDescription);
                }
            });
            this.addEventListener('issue-title', 'input', (e) => {
                const title = e.target.value;
                const lengthValidationMessage = this.getElementById('issue-title-length-validation-error');
                const issueUrl = this.getIssueUrl();
                if (title && this.getIssueUrlWithTitle(title, issueUrl).length > MAX_URL_LENGTH) {
                    show(lengthValidationMessage);
                }
                else {
                    hide(lengthValidationMessage);
                }
                const issueSource = this.getElementById('issue-source');
                if (!issueSource || issueSource.value === '') {
                    return;
                }
                const { fileOnExtension, fileOnMarketplace } = this.issueReporterModel.getData();
                this.searchIssues(title, fileOnExtension, fileOnMarketplace);
            });
            this.previewButton.onDidClick(async () => {
                this.delayedSubmit.trigger(async () => {
                    this.createIssue();
                });
            });
            this.addEventListener('disableExtensions', 'click', () => {
                this.issueMainService.$reloadWithExtensionsDisabled();
            });
            this.addEventListener('extensionBugsLink', 'click', (e) => {
                const url = e.target.innerText;
                (0, dom_1.windowOpenNoOpener)(url);
            });
            this.addEventListener('disableExtensions', 'keydown', (e) => {
                e.stopPropagation();
                if (e.keyCode === 13 || e.keyCode === 32) {
                    this.issueMainService.$reloadWithExtensionsDisabled();
                }
            });
            window_1.mainWindow.document.onkeydown = async (e) => {
                const cmdOrCtrlKey = platform_1.isMacintosh ? e.metaKey : e.ctrlKey;
                // Cmd/Ctrl+Enter previews issue and closes window
                if (cmdOrCtrlKey && e.keyCode === 13) {
                    this.delayedSubmit.trigger(async () => {
                        if (await this.createIssue()) {
                            this.close();
                        }
                    });
                }
                // Cmd/Ctrl + w closes issue window
                if (cmdOrCtrlKey && e.keyCode === 87) {
                    e.stopPropagation();
                    e.preventDefault();
                    const issueTitle = this.getElementById('issue-title').value;
                    const { issueDescription } = this.issueReporterModel.getData();
                    if (!this.hasBeenSubmitted && (issueTitle || issueDescription)) {
                        // fire and forget
                        this.issueMainService.$showConfirmCloseDialog();
                    }
                    else {
                        this.close();
                    }
                }
                // Cmd/Ctrl + zooms in
                if (cmdOrCtrlKey && e.keyCode === 187) {
                    (0, window_2.zoomIn)(window_1.mainWindow);
                }
                // Cmd/Ctrl - zooms out
                if (cmdOrCtrlKey && e.keyCode === 189) {
                    (0, window_2.zoomOut)(window_1.mainWindow);
                }
                // With latest electron upgrade, cmd+a is no longer propagating correctly for inputs in this window on mac
                // Manually perform the selection
                if (platform_1.isMacintosh) {
                    if (cmdOrCtrlKey && e.keyCode === 65 && e.target) {
                        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                            e.target.select();
                        }
                    }
                }
            };
        }
        updatePerformanceInfo(info) {
            this.issueReporterModel.update(info);
            this.receivedPerformanceInfo = true;
            const state = this.issueReporterModel.getData();
            this.updateProcessInfo(state);
            this.updateWorkspaceInfo(state);
            this.updatePreviewButtonState();
        }
        updatePreviewButtonState() {
            if (this.isPreviewEnabled()) {
                if (this.configuration.data.githubAccessToken) {
                    this.previewButton.label = (0, nls_1.localize)('createOnGitHub', "Create on GitHub");
                }
                else {
                    this.previewButton.label = (0, nls_1.localize)('previewOnGitHub', "Preview on GitHub");
                }
                this.previewButton.enabled = true;
            }
            else {
                this.previewButton.enabled = false;
                this.previewButton.label = (0, nls_1.localize)('loadingData', "Loading data...");
            }
        }
        isPreviewEnabled() {
            const issueType = this.issueReporterModel.getData().issueType;
            if (this.issueReporterModel.getData().selectedExtension?.hasIssueDataProviders && !this.receivedExtensionData) {
                return false;
            }
            if (issueType === 0 /* IssueType.Bug */ && this.receivedSystemInfo) {
                return true;
            }
            if (issueType === 1 /* IssueType.PerformanceIssue */ && this.receivedSystemInfo && this.receivedPerformanceInfo) {
                return true;
            }
            if (issueType === 2 /* IssueType.FeatureRequest */) {
                return true;
            }
            return false;
        }
        getExtensionRepositoryUrl() {
            const selectedExtension = this.issueReporterModel.getData().selectedExtension;
            return selectedExtension && selectedExtension.repositoryUrl;
        }
        getExtensionBugsUrl() {
            const selectedExtension = this.issueReporterModel.getData().selectedExtension;
            return selectedExtension && selectedExtension.bugsUrl;
        }
        getExtensionData() {
            return this.issueReporterModel.getData().selectedExtension?.extensionData;
        }
        searchVSCodeIssues(title, issueDescription) {
            if (title) {
                this.searchDuplicates(title, issueDescription);
            }
            else {
                this.clearSearchResults();
            }
        }
        searchIssues(title, fileOnExtension, fileOnMarketplace) {
            if (fileOnExtension) {
                return this.searchExtensionIssues(title);
            }
            if (fileOnMarketplace) {
                return this.searchMarketplaceIssues(title);
            }
            const description = this.issueReporterModel.getData().issueDescription;
            this.searchVSCodeIssues(title, description);
        }
        searchExtensionIssues(title) {
            const url = this.getExtensionGitHubUrl();
            if (title) {
                const matches = /^https?:\/\/github\.com\/(.*)/.exec(url);
                if (matches && matches.length) {
                    const repo = matches[1];
                    return this.searchGitHub(repo, title);
                }
                // If the extension has no repository, display empty search results
                if (this.issueReporterModel.getData().selectedExtension) {
                    this.clearSearchResults();
                    return this.displaySearchResults([]);
                }
            }
            this.clearSearchResults();
        }
        searchMarketplaceIssues(title) {
            if (title) {
                const gitHubInfo = this.parseGitHubUrl(this.configuration.product.reportMarketplaceIssueUrl);
                if (gitHubInfo) {
                    return this.searchGitHub(`${gitHubInfo.owner}/${gitHubInfo.repositoryName}`, title);
                }
            }
        }
        async close() {
            await this.issueMainService.$closeReporter();
        }
        clearSearchResults() {
            const similarIssues = this.getElementById('similar-issues');
            similarIssues.innerText = '';
            this.numberOfSearchResultsDisplayed = 0;
        }
        searchGitHub(repo, title) {
            const query = `is:issue+repo:${repo}+${title}`;
            const similarIssues = this.getElementById('similar-issues');
            fetch(`https://api.github.com/search/issues?q=${query}`).then((response) => {
                response.json().then(result => {
                    similarIssues.innerText = '';
                    if (result && result.items) {
                        this.displaySearchResults(result.items);
                    }
                    else {
                        // If the items property isn't present, the rate limit has been hit
                        const message = (0, dom_1.$)('div.list-title');
                        message.textContent = (0, nls_1.localize)('rateLimited', "GitHub query limit exceeded. Please wait.");
                        similarIssues.appendChild(message);
                        const resetTime = response.headers.get('X-RateLimit-Reset');
                        const timeToWait = resetTime ? parseInt(resetTime) - Math.floor(Date.now() / 1000) : 1;
                        if (this.shouldQueueSearch) {
                            this.shouldQueueSearch = false;
                            setTimeout(() => {
                                this.searchGitHub(repo, title);
                                this.shouldQueueSearch = true;
                            }, timeToWait * 1000);
                        }
                    }
                }).catch(_ => {
                    // Ignore
                });
            }).catch(_ => {
                // Ignore
            });
        }
        searchDuplicates(title, body) {
            const url = 'https://vscode-probot.westus.cloudapp.azure.com:7890/duplicate_candidates';
            const init = {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    body
                }),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            };
            fetch(url, init).then((response) => {
                response.json().then(result => {
                    this.clearSearchResults();
                    if (result && result.candidates) {
                        this.displaySearchResults(result.candidates);
                    }
                    else {
                        throw new Error('Unexpected response, no candidates property');
                    }
                }).catch(_ => {
                    // Ignore
                });
            }).catch(_ => {
                // Ignore
            });
        }
        displaySearchResults(results) {
            const similarIssues = this.getElementById('similar-issues');
            if (results.length) {
                const issues = (0, dom_1.$)('div.issues-container');
                const issuesText = (0, dom_1.$)('div.list-title');
                issuesText.textContent = (0, nls_1.localize)('similarIssues', "Similar issues");
                this.numberOfSearchResultsDisplayed = results.length < 5 ? results.length : 5;
                for (let i = 0; i < this.numberOfSearchResultsDisplayed; i++) {
                    const issue = results[i];
                    const link = (0, dom_1.$)('a.issue-link', { href: issue.html_url });
                    link.textContent = issue.title;
                    link.title = issue.title;
                    link.addEventListener('click', (e) => this.openLink(e));
                    link.addEventListener('auxclick', (e) => this.openLink(e));
                    let issueState;
                    let item;
                    if (issue.state) {
                        issueState = (0, dom_1.$)('span.issue-state');
                        const issueIcon = (0, dom_1.$)('span.issue-icon');
                        issueIcon.appendChild((0, iconLabels_1.renderIcon)(issue.state === 'open' ? codicons_1.Codicon.issueOpened : codicons_1.Codicon.issueClosed));
                        const issueStateLabel = (0, dom_1.$)('span.issue-state.label');
                        issueStateLabel.textContent = issue.state === 'open' ? (0, nls_1.localize)('open', "Open") : (0, nls_1.localize)('closed', "Closed");
                        issueState.title = issue.state === 'open' ? (0, nls_1.localize)('open', "Open") : (0, nls_1.localize)('closed', "Closed");
                        issueState.appendChild(issueIcon);
                        issueState.appendChild(issueStateLabel);
                        item = (0, dom_1.$)('div.issue', undefined, issueState, link);
                    }
                    else {
                        item = (0, dom_1.$)('div.issue', undefined, link);
                    }
                    issues.appendChild(item);
                }
                similarIssues.appendChild(issuesText);
                similarIssues.appendChild(issues);
            }
            else {
                const message = (0, dom_1.$)('div.list-title');
                message.textContent = (0, nls_1.localize)('noSimilarIssues', "No similar issues found");
                similarIssues.appendChild(message);
            }
        }
        setUpTypes() {
            const makeOption = (issueType, description) => (0, dom_1.$)('option', { 'value': issueType.valueOf() }, (0, strings_1.escape)(description));
            const typeSelect = this.getElementById('issue-type');
            const { issueType } = this.issueReporterModel.getData();
            (0, dom_1.reset)(typeSelect, makeOption(0 /* IssueType.Bug */, (0, nls_1.localize)('bugReporter', "Bug Report")), makeOption(2 /* IssueType.FeatureRequest */, (0, nls_1.localize)('featureRequest', "Feature Request")), makeOption(1 /* IssueType.PerformanceIssue */, (0, nls_1.localize)('performanceIssue', "Performance Issue")));
            typeSelect.value = issueType.toString();
            this.setSourceOptions();
        }
        makeOption(value, description, disabled) {
            const option = document.createElement('option');
            option.disabled = disabled;
            option.value = value;
            option.textContent = description;
            return option;
        }
        setSourceOptions() {
            const sourceSelect = this.getElementById('issue-source');
            const { issueType, fileOnExtension, selectedExtension } = this.issueReporterModel.getData();
            let selected = sourceSelect.selectedIndex;
            if (selected === -1) {
                if (fileOnExtension !== undefined) {
                    selected = fileOnExtension ? 2 : 1;
                }
                else if (selectedExtension?.isBuiltin) {
                    selected = 1;
                }
            }
            sourceSelect.innerText = '';
            sourceSelect.append(this.makeOption('', (0, nls_1.localize)('selectSource', "Select source"), true));
            sourceSelect.append(this.makeOption('vscode', (0, nls_1.localize)('vscode', "Visual Studio Code"), false));
            sourceSelect.append(this.makeOption('extension', (0, nls_1.localize)('extension', "An extension"), false));
            if (this.configuration.product.reportMarketplaceIssueUrl) {
                sourceSelect.append(this.makeOption('marketplace', (0, nls_1.localize)('marketplace', "Extensions marketplace"), false));
            }
            if (issueType !== 2 /* IssueType.FeatureRequest */) {
                sourceSelect.append(this.makeOption('unknown', (0, nls_1.localize)('unknown', "Don't know"), false));
            }
            if (selected !== -1 && selected < sourceSelect.options.length) {
                sourceSelect.selectedIndex = selected;
            }
            else {
                sourceSelect.selectedIndex = 0;
                hide(this.getElementById('problem-source-help-text'));
            }
        }
        renderBlocks() {
            // Depending on Issue Type, we render different blocks and text
            const { issueType, fileOnExtension, fileOnMarketplace, selectedExtension } = this.issueReporterModel.getData();
            const blockContainer = this.getElementById('block-container');
            const systemBlock = window_1.mainWindow.document.querySelector('.block-system');
            const processBlock = window_1.mainWindow.document.querySelector('.block-process');
            const workspaceBlock = window_1.mainWindow.document.querySelector('.block-workspace');
            const extensionsBlock = window_1.mainWindow.document.querySelector('.block-extensions');
            const experimentsBlock = window_1.mainWindow.document.querySelector('.block-experiments');
            const extensionDataBlock = window_1.mainWindow.document.querySelector('.block-extension-data');
            const problemSource = this.getElementById('problem-source');
            const descriptionTitle = this.getElementById('issue-description-label');
            const descriptionSubtitle = this.getElementById('issue-description-subtitle');
            const extensionSelector = this.getElementById('extension-selection');
            const titleTextArea = this.getElementById('issue-title-container');
            const descriptionTextArea = this.getElementById('description');
            const extensionDataTextArea = this.getElementById('extension-data');
            // Hide all by default
            hide(blockContainer);
            hide(systemBlock);
            hide(processBlock);
            hide(workspaceBlock);
            hide(extensionsBlock);
            hide(experimentsBlock);
            hide(extensionSelector);
            hide(extensionDataTextArea);
            hide(extensionDataBlock);
            show(problemSource);
            show(titleTextArea);
            show(descriptionTextArea);
            if (fileOnExtension) {
                show(extensionSelector);
            }
            if (fileOnExtension && selectedExtension?.hasIssueUriRequestHandler && !selectedExtension.hasIssueDataProviders) {
                hide(titleTextArea);
                hide(descriptionTextArea);
                (0, dom_1.reset)(descriptionTitle, (0, nls_1.localize)('handlesIssuesElsewhere', "This extension handles issues outside of VS Code"));
                (0, dom_1.reset)(descriptionSubtitle, (0, nls_1.localize)('elsewhereDescription', "The '{0}' extension prefers to use an external issue reporter. To be taken to that issue reporting experience, click the button below.", selectedExtension.displayName));
                this.previewButton.label = (0, nls_1.localize)('openIssueReporter', "Open External Issue Reporter");
                return;
            }
            if (fileOnExtension && selectedExtension?.hasIssueDataProviders) {
                const data = this.getExtensionData();
                if (data) {
                    extensionDataTextArea.innerText = data.toString();
                }
                extensionDataTextArea.readOnly = true;
                show(extensionDataBlock);
            }
            if (fileOnExtension && selectedExtension?.command?.data) {
                const data = selectedExtension?.command?.data;
                extensionDataTextArea.innerText = data.toString();
                extensionDataTextArea.readOnly = true;
                show(extensionDataBlock);
            }
            if (issueType === 0 /* IssueType.Bug */) {
                if (!fileOnMarketplace) {
                    show(blockContainer);
                    show(systemBlock);
                    show(experimentsBlock);
                    if (!fileOnExtension) {
                        show(extensionsBlock);
                    }
                }
                (0, dom_1.reset)(descriptionTitle, (0, nls_1.localize)('stepsToReproduce', "Steps to Reproduce") + ' ', (0, dom_1.$)('span.required-input', undefined, '*'));
                (0, dom_1.reset)(descriptionSubtitle, (0, nls_1.localize)('bugDescription', "Share the steps needed to reliably reproduce the problem. Please include actual and expected results. We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub."));
            }
            else if (issueType === 1 /* IssueType.PerformanceIssue */) {
                if (!fileOnMarketplace) {
                    show(blockContainer);
                    show(systemBlock);
                    show(processBlock);
                    show(workspaceBlock);
                    show(experimentsBlock);
                }
                if (fileOnExtension) {
                    show(extensionSelector);
                }
                else if (!fileOnMarketplace) {
                    show(extensionsBlock);
                }
                (0, dom_1.reset)(descriptionTitle, (0, nls_1.localize)('stepsToReproduce', "Steps to Reproduce") + ' ', (0, dom_1.$)('span.required-input', undefined, '*'));
                (0, dom_1.reset)(descriptionSubtitle, (0, nls_1.localize)('performanceIssueDesciption', "When did this performance issue happen? Does it occur on startup or after a specific series of actions? We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub."));
            }
            else if (issueType === 2 /* IssueType.FeatureRequest */) {
                (0, dom_1.reset)(descriptionTitle, (0, nls_1.localize)('description', "Description") + ' ', (0, dom_1.$)('span.required-input', undefined, '*'));
                (0, dom_1.reset)(descriptionSubtitle, (0, nls_1.localize)('featureRequestDescription', "Please describe the feature you would like to see. We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub."));
            }
        }
        validateInput(inputId) {
            const inputElement = this.getElementById(inputId);
            const inputValidationMessage = this.getElementById(`${inputId}-empty-error`);
            if (!inputElement.value) {
                inputElement.classList.add('invalid-input');
                inputValidationMessage?.classList.remove('hidden');
                return false;
            }
            else {
                inputElement.classList.remove('invalid-input');
                inputValidationMessage?.classList.add('hidden');
                return true;
            }
        }
        validateInputs() {
            let isValid = true;
            ['issue-title', 'description', 'issue-source'].forEach(elementId => {
                isValid = this.validateInput(elementId) && isValid;
            });
            if (this.issueReporterModel.fileOnExtension()) {
                isValid = this.validateInput('extension-selector') && isValid;
            }
            return isValid;
        }
        async submitToGitHub(issueTitle, issueBody, gitHubDetails) {
            const url = `https://api.github.com/repos/${gitHubDetails.owner}/${gitHubDetails.repositoryName}/issues`;
            const init = {
                method: 'POST',
                body: JSON.stringify({
                    title: issueTitle,
                    body: issueBody
                }),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.configuration.data.githubAccessToken}`
                })
            };
            const response = await fetch(url, init);
            if (!response.ok) {
                return false;
            }
            const result = await response.json();
            await this.nativeHostService.openExternal(result.html_url);
            this.close();
            return true;
        }
        async createIssue() {
            const selectedExtension = this.issueReporterModel.getData().selectedExtension;
            const hasUri = selectedExtension?.hasIssueUriRequestHandler;
            const hasData = selectedExtension?.hasIssueDataProviders;
            // Short circuit if the extension provides a custom issue handler
            if (hasUri && !hasData) {
                const url = this.getExtensionBugsUrl();
                if (url) {
                    this.hasBeenSubmitted = true;
                    await this.nativeHostService.openExternal(url);
                    return true;
                }
            }
            if (!this.validateInputs()) {
                // If inputs are invalid, set focus to the first one and add listeners on them
                // to detect further changes
                const invalidInput = window_1.mainWindow.document.getElementsByClassName('invalid-input');
                if (invalidInput.length) {
                    invalidInput[0].focus();
                }
                this.addEventListener('issue-title', 'input', _ => {
                    this.validateInput('issue-title');
                });
                this.addEventListener('description', 'input', _ => {
                    this.validateInput('description');
                });
                this.addEventListener('issue-source', 'change', _ => {
                    this.validateInput('issue-source');
                });
                if (this.issueReporterModel.fileOnExtension()) {
                    this.addEventListener('extension-selector', 'change', _ => {
                        this.validateInput('extension-selector');
                    });
                }
                return false;
            }
            this.hasBeenSubmitted = true;
            const issueTitle = this.getElementById('issue-title').value;
            const issueBody = this.issueReporterModel.serialize();
            let issueUrl = hasUri ? this.getExtensionBugsUrl() : this.getIssueUrl();
            if (!issueUrl) {
                return false;
            }
            if (selectedExtension?.command?.uri) {
                issueUrl = selectedExtension.command.uri;
            }
            const gitHubDetails = this.parseGitHubUrl(issueUrl);
            if (this.configuration.data.githubAccessToken && gitHubDetails) {
                return this.submitToGitHub(issueTitle, issueBody, gitHubDetails);
            }
            const baseUrl = this.getIssueUrlWithTitle(this.getElementById('issue-title').value, issueUrl);
            let url = baseUrl + `&body=${encodeURIComponent(issueBody)}`;
            if (url.length > MAX_URL_LENGTH) {
                try {
                    url = await this.writeToClipboard(baseUrl, issueBody);
                }
                catch (_) {
                    return false;
                }
            }
            await this.nativeHostService.openExternal(url);
            return true;
        }
        async writeToClipboard(baseUrl, issueBody) {
            const shouldWrite = await this.issueMainService.$showClipboardDialog();
            if (!shouldWrite) {
                throw new errors_1.CancellationError();
            }
            await this.nativeHostService.writeClipboardText(issueBody);
            return baseUrl + `&body=${encodeURIComponent((0, nls_1.localize)('pasteData', "We have written the needed data into your clipboard because it was too large to send. Please paste."))}`;
        }
        getIssueUrl() {
            return this.issueReporterModel.fileOnExtension()
                ? this.getExtensionGitHubUrl()
                : this.issueReporterModel.getData().fileOnMarketplace
                    ? this.configuration.product.reportMarketplaceIssueUrl
                    : this.configuration.product.reportIssueUrl;
        }
        parseGitHubUrl(url) {
            // Assumes a GitHub url to a particular repo, https://github.com/repositoryName/owner.
            // Repository name and owner cannot contain '/'
            const match = /^https?:\/\/github\.com\/([^\/]*)\/([^\/]*).*/.exec(url);
            if (match && match.length) {
                return {
                    owner: match[1],
                    repositoryName: match[2]
                };
            }
            return undefined;
        }
        getExtensionGitHubUrl() {
            let repositoryUrl = '';
            const bugsUrl = this.getExtensionBugsUrl();
            const extensionUrl = this.getExtensionRepositoryUrl();
            // If given, try to match the extension's bug url
            if (bugsUrl && bugsUrl.match(/^https?:\/\/github\.com\/(.*)/)) {
                repositoryUrl = (0, issueReporterUtil_1.normalizeGitHubUrl)(bugsUrl);
            }
            else if (extensionUrl && extensionUrl.match(/^https?:\/\/github\.com\/(.*)/)) {
                repositoryUrl = (0, issueReporterUtil_1.normalizeGitHubUrl)(extensionUrl);
            }
            return repositoryUrl;
        }
        getIssueUrlWithTitle(issueTitle, repositoryUrl) {
            if (this.issueReporterModel.fileOnExtension()) {
                repositoryUrl = repositoryUrl + '/issues/new';
            }
            const queryStringPrefix = repositoryUrl.indexOf('?') === -1 ? '?' : '&';
            return `${repositoryUrl}${queryStringPrefix}title=${encodeURIComponent(issueTitle)}`;
        }
        updateSystemInfo(state) {
            const target = window_1.mainWindow.document.querySelector('.block-system .block-info');
            if (target) {
                const systemInfo = state.systemInfo;
                const renderedDataTable = (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'CPUs'), (0, dom_1.$)('td', undefined, systemInfo.cpus || '')), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'GPU Status'), (0, dom_1.$)('td', undefined, Object.keys(systemInfo.gpuStatus).map(key => `${key}: ${systemInfo.gpuStatus[key]}`).join('\n'))), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Load (avg)'), (0, dom_1.$)('td', undefined, systemInfo.load || '')), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Memory (System)'), (0, dom_1.$)('td', undefined, systemInfo.memory)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Process Argv'), (0, dom_1.$)('td', undefined, systemInfo.processArgs)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Screen Reader'), (0, dom_1.$)('td', undefined, systemInfo.screenReader)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'VM'), (0, dom_1.$)('td', undefined, systemInfo.vmHint)));
                (0, dom_1.reset)(target, renderedDataTable);
                systemInfo.remoteData.forEach(remote => {
                    target.appendChild((0, dom_1.$)('hr'));
                    if ((0, diagnostics_1.isRemoteDiagnosticError)(remote)) {
                        const remoteDataTable = (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Remote'), (0, dom_1.$)('td', undefined, remote.hostName)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, ''), (0, dom_1.$)('td', undefined, remote.errorMessage)));
                        target.appendChild(remoteDataTable);
                    }
                    else {
                        const remoteDataTable = (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Remote'), (0, dom_1.$)('td', undefined, remote.latency ? `${remote.hostName} (latency: ${remote.latency.current.toFixed(2)}ms last, ${remote.latency.average.toFixed(2)}ms average)` : remote.hostName)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'OS'), (0, dom_1.$)('td', undefined, remote.machineInfo.os)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'CPUs'), (0, dom_1.$)('td', undefined, remote.machineInfo.cpus || '')), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Memory (System)'), (0, dom_1.$)('td', undefined, remote.machineInfo.memory)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'VM'), (0, dom_1.$)('td', undefined, remote.machineInfo.vmHint)));
                        target.appendChild(remoteDataTable);
                    }
                });
            }
        }
        updateExtensionSelector(extensions) {
            const extensionOptions = extensions.map(extension => {
                return {
                    name: extension.displayName || extension.name || '',
                    id: extension.id
                };
            });
            // Sort extensions by name
            extensionOptions.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                if (aName > bName) {
                    return 1;
                }
                if (aName < bName) {
                    return -1;
                }
                return 0;
            });
            const makeOption = (extension, selectedExtension) => {
                const selected = selectedExtension && extension.id === selectedExtension.id;
                return (0, dom_1.$)('option', {
                    'value': extension.id,
                    'selected': selected || ''
                }, extension.name);
            };
            const extensionsSelector = this.getElementById('extension-selector');
            if (extensionsSelector) {
                const { selectedExtension } = this.issueReporterModel.getData();
                (0, dom_1.reset)(extensionsSelector, this.makeOption('', (0, nls_1.localize)('selectExtension', "Select extension"), true), ...extensionOptions.map(extension => makeOption(extension, selectedExtension)));
                if (!selectedExtension) {
                    extensionsSelector.selectedIndex = 0;
                }
                this.addEventListener('extension-selector', 'change', async (e) => {
                    this.clearExtensionData();
                    const selectedExtensionId = e.target.value;
                    const extensions = this.issueReporterModel.getData().allExtensions;
                    const matches = extensions.filter(extension => extension.id === selectedExtensionId);
                    if (matches.length) {
                        this.issueReporterModel.update({ selectedExtension: matches[0] });
                        const selectedExtension = this.issueReporterModel.getData().selectedExtension;
                        if (selectedExtension) {
                            selectedExtension.command = undefined;
                        }
                        this.updateExtensionStatus(matches[0]);
                    }
                    else {
                        this.issueReporterModel.update({ selectedExtension: undefined });
                        this.clearSearchResults();
                        this.validateSelectedExtension();
                    }
                });
            }
            this.addEventListener('problem-source', 'change', (_) => {
                this.validateSelectedExtension();
            });
        }
        clearExtensionData() {
            this.issueReporterModel.update({ extensionData: undefined });
            this.configuration.data.command = undefined;
        }
        async updateExtensionStatus(extension) {
            this.issueReporterModel.update({ selectedExtension: extension });
            if (this.configuration.data.command) {
                const template = this.configuration.data.command.template;
                if (template) {
                    const descriptionTextArea = this.getElementById('description');
                    const descriptionText = descriptionTextArea.value;
                    if (descriptionText === '' || !descriptionText.includes(template.toString())) {
                        const fullTextArea = descriptionText + (descriptionText === '' ? '' : '\n') + template.toString();
                        descriptionTextArea.value = fullTextArea;
                        this.issueReporterModel.update({ issueDescription: fullTextArea });
                    }
                }
                const data = this.configuration.data.command.data;
                if (data) {
                    const extensionDataBlock = window_1.mainWindow.document.querySelector('.block-extension-data');
                    show(extensionDataBlock);
                    this.issueReporterModel.update({ extensionData: data });
                }
                const uri = this.configuration.data.command.uri;
                if (uri) {
                    this.updateIssueReporterUri(extension);
                }
            }
            // if extension does not have provider/handles, will check for either. If extension is already active, IPC will return [false, false] and will proceed as normal.
            if (!extension.hasIssueDataProviders && !extension.hasIssueUriRequestHandler) {
                const toActivate = await this.getReporterStatus(extension);
                extension.hasIssueDataProviders = toActivate[0];
                extension.hasIssueUriRequestHandler = toActivate[1];
                this.renderBlocks();
            }
            if (extension.hasIssueUriRequestHandler && extension.hasIssueDataProviders) {
                // update this first
                const template = await this.getIssueTemplateFromExtension(extension);
                const descriptionTextArea = this.getElementById('description');
                const descriptionText = descriptionTextArea.value;
                if (descriptionText === '' || !descriptionText.includes(template)) {
                    const fullTextArea = descriptionText + (descriptionText === '' ? '' : '\n') + template;
                    descriptionTextArea.value = fullTextArea;
                    this.issueReporterModel.update({ issueDescription: fullTextArea });
                }
                const extensionDataBlock = window_1.mainWindow.document.querySelector('.block-extension-data');
                show(extensionDataBlock);
                // Start loading for extension data.
                const iconElement = document.createElement('span');
                iconElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.loading), 'codicon-modifier-spin');
                this.setLoading(iconElement);
                await this.getIssueDataFromExtension(extension);
                this.removeLoading(iconElement);
                // then update this
                this.updateIssueReporterUri(extension);
            }
            else if (extension.hasIssueUriRequestHandler) {
                this.updateIssueReporterUri(extension);
            }
            else if (extension.hasIssueDataProviders) {
                const template = await this.getIssueTemplateFromExtension(extension);
                const descriptionTextArea = this.getElementById('description');
                const descriptionText = descriptionTextArea.value;
                if (descriptionText === '' || !descriptionText.includes(template)) {
                    const fullTextArea = descriptionText + (descriptionText === '' ? '' : '\n') + template;
                    descriptionTextArea.value = fullTextArea;
                    this.issueReporterModel.update({ issueDescription: fullTextArea });
                }
                const extensionDataBlock = window_1.mainWindow.document.querySelector('.block-extension-data');
                show(extensionDataBlock);
                // Start loading for extension data.
                const iconElement = document.createElement('span');
                iconElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.loading), 'codicon-modifier-spin');
                this.setLoading(iconElement);
                await this.getIssueDataFromExtension(extension);
                this.removeLoading(iconElement);
            }
            else {
                this.validateSelectedExtension();
                this.issueReporterModel.update({ extensionData: extension.command?.data ?? undefined });
                const title = this.getElementById('issue-title').value;
                this.searchExtensionIssues(title);
            }
            this.updatePreviewButtonState();
            this.renderBlocks();
        }
        validateSelectedExtension() {
            const extensionValidationMessage = this.getElementById('extension-selection-validation-error');
            const extensionValidationNoUrlsMessage = this.getElementById('extension-selection-validation-error-no-url');
            hide(extensionValidationMessage);
            hide(extensionValidationNoUrlsMessage);
            const extension = this.issueReporterModel.getData().selectedExtension;
            if (!extension) {
                this.previewButton.enabled = true;
                return;
            }
            const hasValidGitHubUrl = this.getExtensionGitHubUrl();
            if (hasValidGitHubUrl || (extension.hasIssueUriRequestHandler && !extension.hasIssueDataProviders)) {
                this.previewButton.enabled = true;
            }
            else {
                this.setExtensionValidationMessage();
                this.previewButton.enabled = false;
            }
        }
        setLoading(element) {
            // Show loading
            this.receivedExtensionData = false;
            this.updatePreviewButtonState();
            const extensionDataCaption = this.getElementById('extension-id');
            hide(extensionDataCaption);
            const extensionDataCaption2 = Array.from(window_1.mainWindow.document.querySelectorAll('.ext-parens'));
            extensionDataCaption2.forEach(extensionDataCaption2 => hide(extensionDataCaption2));
            const showLoading = this.getElementById('ext-loading');
            show(showLoading);
            showLoading.append(element);
            this.renderBlocks();
        }
        removeLoading(element) {
            this.updatePreviewButtonState();
            const extensionDataCaption = this.getElementById('extension-id');
            show(extensionDataCaption);
            const extensionDataCaption2 = Array.from(window_1.mainWindow.document.querySelectorAll('.ext-parens'));
            extensionDataCaption2.forEach(extensionDataCaption2 => show(extensionDataCaption2));
            const hideLoading = this.getElementById('ext-loading');
            hide(hideLoading);
            hideLoading.removeChild(element);
        }
        setExtensionValidationMessage() {
            const extensionValidationMessage = this.getElementById('extension-selection-validation-error');
            const extensionValidationNoUrlsMessage = this.getElementById('extension-selection-validation-error-no-url');
            const bugsUrl = this.getExtensionBugsUrl();
            if (bugsUrl) {
                show(extensionValidationMessage);
                const link = this.getElementById('extensionBugsLink');
                link.textContent = bugsUrl;
                return;
            }
            const extensionUrl = this.getExtensionRepositoryUrl();
            if (extensionUrl) {
                show(extensionValidationMessage);
                const link = this.getElementById('extensionBugsLink');
                link.textContent = extensionUrl;
                return;
            }
            show(extensionValidationNoUrlsMessage);
        }
        updateProcessInfo(state) {
            const target = window_1.mainWindow.document.querySelector('.block-process .block-info');
            if (target) {
                (0, dom_1.reset)(target, (0, dom_1.$)('code', undefined, state.processInfo ?? ''));
            }
        }
        updateWorkspaceInfo(state) {
            window_1.mainWindow.document.querySelector('.block-workspace .block-info code').textContent = '\n' + state.workspaceInfo;
        }
        updateExtensionTable(extensions, numThemeExtensions) {
            const target = window_1.mainWindow.document.querySelector('.block-extensions .block-info');
            if (target) {
                if (this.configuration.disableExtensions) {
                    (0, dom_1.reset)(target, (0, nls_1.localize)('disabledExtensions', "Extensions are disabled"));
                    return;
                }
                const themeExclusionStr = numThemeExtensions ? `\n(${numThemeExtensions} theme extensions excluded)` : '';
                extensions = extensions || [];
                if (!extensions.length) {
                    target.innerText = 'Extensions: none' + themeExclusionStr;
                    return;
                }
                (0, dom_1.reset)(target, this.getExtensionTableHtml(extensions), document.createTextNode(themeExclusionStr));
            }
        }
        updateRestrictedMode(restrictedMode) {
            this.issueReporterModel.update({ restrictedMode });
        }
        updateUnsupportedMode(isUnsupported) {
            this.issueReporterModel.update({ isUnsupported });
        }
        updateExperimentsInfo(experimentInfo) {
            this.issueReporterModel.update({ experimentInfo });
            const target = window_1.mainWindow.document.querySelector('.block-experiments .block-info');
            if (target) {
                target.textContent = experimentInfo ? experimentInfo : (0, nls_1.localize)('noCurrentExperiments', "No current experiments.");
            }
        }
        getExtensionTableHtml(extensions) {
            return (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, 'Extension'), (0, dom_1.$)('th', undefined, 'Author (truncated)'), (0, dom_1.$)('th', undefined, 'Version')), ...extensions.map(extension => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, extension.name), (0, dom_1.$)('td', undefined, extension.publisher?.substr(0, 3) ?? 'N/A'), (0, dom_1.$)('td', undefined, extension.version))));
        }
        openLink(event) {
            event.preventDefault();
            event.stopPropagation();
            // Exclude right click
            if (event.which < 3) {
                (0, dom_1.windowOpenNoOpener)(event.target.href);
            }
        }
        getElementById(elementId) {
            const element = window_1.mainWindow.document.getElementById(elementId);
            if (element) {
                return element;
            }
            else {
                return undefined;
            }
        }
        addEventListener(elementId, eventType, handler) {
            const element = this.getElementById(elementId);
            element?.addEventListener(eventType, handler);
        }
    };
    exports.IssueReporter = IssueReporter;
    __decorate([
        (0, decorators_1.debounce)(300)
    ], IssueReporter.prototype, "searchGitHub", null);
    __decorate([
        (0, decorators_1.debounce)(300)
    ], IssueReporter.prototype, "searchDuplicates", null);
    exports.IssueReporter = IssueReporter = __decorate([
        __param(1, native_1.INativeHostService),
        __param(2, issue_1.IIssueMainService)
    ], IssueReporter);
    // helper functions
    function hide(el) {
        el?.classList.add('hidden');
    }
    exports.hide = hide;
    function show(el) {
        el?.classList.remove('hidden');
    }
    exports.show = show;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVSZXBvcnRlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2NvZGUvZWxlY3Ryb24tc2FuZGJveC9pc3N1ZS9pc3N1ZVJlcG9ydGVyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBMEJBLCtGQUErRjtJQUMvRix3REFBd0Q7SUFDeEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBUTVCLElBQUssV0FJSjtJQUpELFdBQUssV0FBVztRQUNmLGdDQUFpQixDQUFBO1FBQ2pCLHNDQUF1QixDQUFBO1FBQ3ZCLDBDQUEyQixDQUFBO0lBQzVCLENBQUMsRUFKSSxXQUFXLEtBQVgsV0FBVyxRQUlmO0lBRU0sSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLHNCQUFVO1FBVzVDLFlBQ2tCLGFBQStDLEVBQzVDLGlCQUFzRCxFQUN2RCxnQkFBb0Q7WUFFdkUsS0FBSyxFQUFFLENBQUM7WUFKUyxrQkFBYSxHQUFiLGFBQWEsQ0FBa0M7WUFDM0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBWmhFLG1DQUE4QixHQUFHLENBQUMsQ0FBQztZQUNuQyx1QkFBa0IsR0FBRyxLQUFLLENBQUM7WUFDM0IsMEJBQXFCLEdBQUcsS0FBSyxDQUFDO1lBQzlCLDRCQUF1QixHQUFHLEtBQUssQ0FBQztZQUNoQyxzQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFDMUIscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLGtCQUFhLEdBQUcsSUFBSSxlQUFPLENBQU8sR0FBRyxDQUFDLENBQUM7WUFTOUMsTUFBTSxlQUFlLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFD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