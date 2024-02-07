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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/supports/tokenization", "vs/editor/common/languages/textToHtmlTokenizer", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/notebookCellList", "vs/workbench/contrib/notebook/browser/view/renderers/webviewPreloads", "vs/workbench/contrib/notebook/browser/view/renderers/webviewThemeMapping", "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookLoggingService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webview/browser/webviewWindowDragMonitor", "vs/workbench/contrib/webview/common/webview", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/path/common/pathService"], function (require, exports, dom_1, arrays_1, async_1, buffer_1, event_1, mime_1, network_1, objects_1, osPath, platform_1, resources_1, uri_1, UUID, languages_1, language_1, tokenization_1, textToHtmlTokenizer_1, nls, actions_1, configuration_1, contextkey_1, contextView_1, dialogs_1, files_1, opener_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, workspace_1, workspaceTrust_1, notebookBrowser_1, notebookCellList_1, webviewPreloads_1, webviewThemeMapping_1, markupCellViewModel_1, notebookCommon_1, notebookLoggingService_1, notebookService_1, webview_1, webviewWindowDragMonitor_1, webview_2, editorGroupsService_1, environmentService_1, pathService_1) {
    "use strict";
    var BackLayerWebView_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackLayerWebView = void 0;
    const LINE_COLUMN_REGEX = /:([\d]+)(?::([\d]+))?$/;
    const LineQueryRegex = /line=(\d+)$/;
    const FRAGMENT_REGEX = /^(.*)#([^#]*)$/;
    let BackLayerWebView = class BackLayerWebView extends themeService_1.Themable {
        static { BackLayerWebView_1 = this; }
        static getOriginStore(storageService) {
            this._originStore ??= new webview_1.WebviewOriginStore('notebook.backlayerWebview.origins', storageService);
            return this._originStore;
        }
        constructor(notebookEditor, id, notebookViewType, documentUri, options, rendererMessaging, webviewService, openerService, notebookService, contextService, environmentService, fileDialogService, fileService, contextMenuService, contextKeyService, workspaceTrustManagementService, configurationService, languageService, workspaceContextService, editorGroupService, storageService, pathService, notebookLogService, themeService, telemetryService) {
            super(themeService);
            this.notebookEditor = notebookEditor;
            this.id = id;
            this.notebookViewType = notebookViewType;
            this.documentUri = documentUri;
            this.options = options;
            this.rendererMessaging = rendererMessaging;
            this.webviewService = webviewService;
            this.openerService = openerService;
            this.notebookService = notebookService;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.fileDialogService = fileDialogService;
            this.fileService = fileService;
            this.contextMenuService = contextMenuService;
            this.contextKeyService = contextKeyService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.configurationService = configurationService;
            this.languageService = languageService;
            this.workspaceContextService = workspaceContextService;
            this.editorGroupService = editorGroupService;
            this.storageService = storageService;
            this.pathService = pathService;
            this.notebookLogService = notebookLogService;
            this.telemetryService = telemetryService;
            this.webview = undefined;
            this.insetMapping = new Map();
            this.pendingWebviewIdleCreationRequest = new Map();
            this.pendingWebviewIdleInsetMapping = new Map();
            this.reversedPendingWebviewIdleInsetMapping = new Map();
            this.markupPreviewMapping = new Map();
            this.hiddenInsetMapping = new Set();
            this.reversedInsetMapping = new Map();
            this.localResourceRootsCache = undefined;
            this._onMessage = this._register(new event_1.Emitter());
            this._preloadsCache = new Set();
            this.onMessage = this._onMessage.event;
            this._disposed = false;
            this.firstInit = true;
            this.nonce = UUID.generateUuid();
            this._logRendererDebugMessage('Creating backlayer webview for notebook');
            this.element = document.createElement('div');
            this.element.style.height = '1400px';
            this.element.style.position = 'absolute';
            if (rendererMessaging) {
                this._register(rendererMessaging);
                rendererMessaging.receiveMessageHandler = (rendererId, message) => {
                    if (!this.webview || this._disposed) {
                        return Promise.resolve(false);
                    }
                    this._sendMessageToWebview({
                        __vscode_notebook_message: true,
                        type: 'customRendererMessage',
                        rendererId: rendererId,
                        message: message
                    });
                    return Promise.resolve(true);
                };
            }
            this._register(workspaceTrustManagementService.onDidChangeTrust(e => {
                const baseUrl = this.asWebviewUri(this.getNotebookBaseUri(), undefined);
                const htmlContent = this.generateContent(baseUrl.toString());
                this.webview?.setHtml(htmlContent);
            }));
            this._register(languages_1.TokenizationRegistry.onDidChange(() => {
                this._sendMessageToWebview({
                    type: 'tokenizedStylesChanged',
                    css: getTokenizationCss(),
                });
            }));
        }
        updateOptions(options) {
            this.options = options;
            this._updateStyles();
            this._updateOptions();
        }
        _logRendererDebugMessage(msg) {
            this.notebookLogService.debug('BacklayerWebview', `${this.documentUri} (${this.id}) - ${msg}`);
        }
        _updateStyles() {
            this._sendMessageToWebview({
                type: 'notebookStyles',
                styles: this._generateStyles()
            });
        }
        _updateOptions() {
            this._sendMessageToWebview({
                type: 'notebookOptions',
                options: {
                    dragAndDropEnabled: this.options.dragAndDropEnabled
                },
                renderOptions: {
                    lineLimit: this.options.outputLineLimit,
                    outputScrolling: this.options.outputScrolling,
                    outputWordWrap: this.options.outputWordWrap,
                    linkifyFilePaths: this.options.outputLinkifyFilePaths,
                }
            });
        }
        _generateStyles() {
            return {
                'notebook-output-left-margin': `${this.options.leftMargin + this.options.runGutter}px`,
                'notebook-output-width': `calc(100% - ${this.options.leftMargin + this.options.rightMargin + this.options.runGutter}px)`,
                'notebook-output-node-padding': `${this.options.outputNodePadding}px`,
                'notebook-run-gutter': `${this.options.runGutter}px`,
                'notebook-preview-node-padding': `${this.options.previewNodePadding}px`,
                'notebook-markdown-left-margin': `${this.options.markdownLeftMargin}px`,
                'notebook-output-node-left-padding': `${this.options.outputNodeLeftPadding}px`,
                'notebook-markdown-min-height': `${this.options.previewNodePadding * 2}px`,
                'notebook-markup-font-size': typeof this.options.markupFontSize === 'number' && this.options.markupFontSize > 0 ? `${this.options.markupFontSize}px` : `calc(${this.options.fontSize}px * 1.2)`,
                'notebook-cell-output-font-size': `${this.options.outputFontSize || this.options.fontSize}px`,
                'notebook-cell-output-line-height': `${this.options.outputLineHeight}px`,
                'notebook-cell-output-max-height': `${this.options.outputLineHeight * this.options.outputLineLimit}px`,
                'notebook-cell-output-font-family': this.options.outputFontFamily || this.options.fontFamily,
                'notebook-cell-markup-empty-content': nls.localize('notebook.emptyMarkdownPlaceholder', "Empty markdown cell, double-click or press enter to edit."),
                'notebook-cell-renderer-not-found-error': nls.localize({
                    key: 'notebook.error.rendererNotFound',
                    comment: ['$0 is a placeholder for the mime type']
                }, "No renderer found for '$0'"),
                'notebook-cell-renderer-fallbacks-exhausted': nls.localize({
                    key: 'notebook.error.rendererFallbacksExhausted',
                    comment: ['$0 is a placeholder for the mime type']
                }, "Could not render content for '$0'"),
            };
        }
        generateContent(baseUrl) {
            const renderersData = this.getRendererData();
            const preloadsData = this.getStaticPreloadsData();
            const renderOptions = {
                lineLimit: this.options.outputLineLimit,
                outputScrolling: this.options.outputScrolling,
                outputWordWrap: this.options.outputWordWrap,
                linkifyFilePaths: this.options.outputLinkifyFilePaths
            };
            const preloadScript = (0, webviewPreloads_1.preloadsScriptStr)({
                ...this.options,
                tokenizationCss: getTokenizationCss(),
            }, { dragAndDropEnabled: this.options.dragAndDropEnabled }, renderOptions, renderersData, preloadsData, this.workspaceTrustManagementService.isWorkspaceTrusted(), this.nonce);
            const enableCsp = this.configurationService.getValue('notebook.experimental.enableCsp');
            const currentHighlight = this.getColor(colorRegistry_1.editorFindMatch);
            const findMatchHighlight = this.getColor(colorRegistry_1.editorFindMatchHighlight);
            return /* html */ `
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<base href="${baseUrl}/" />
				${enableCsp ?
                `<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
					script-src ${webview_2.webviewGenericCspSource} 'unsafe-inline' 'unsafe-eval';
					style-src ${webview_2.webviewGenericCspSource} 'unsafe-inline';
					img-src ${webview_2.webviewGenericCspSource} https: http: data:;
					font-src ${webview_2.webviewGenericCspSource} https:;
					connect-src https:;
					child-src https: data:;
				">` : ''}
				<style nonce="${this.nonce}">
					::highlight(find-highlight) {
						background-color: var(--vscode-editor-findMatchBackground, ${findMatchHighlight});
					}

					::highlight(current-find-highlight) {
						background-color: var(--vscode-editor-findMatchHighlightBackground, ${currentHighlight});
					}

					#container .cell_container {
						width: 100%;
					}

					#container .output_container {
						width: 100%;
					}

					#container > div > div > div.output {
						font-size: var(--notebook-cell-output-font-size);
						width: var(--notebook-output-width);
						margin-left: var(--notebook-output-left-margin);
						background-color: var(--theme-notebook-output-background);
						padding-top: var(--notebook-output-node-padding);
						padding-right: var(--notebook-output-node-padding);
						padding-bottom: var(--notebook-output-node-padding);
						padding-left: var(--notebook-output-node-left-padding);
						box-sizing: border-box;
						border-top: none;
					}

					/* markdown */
					#container div.preview {
						width: 100%;
						padding-right: var(--notebook-preview-node-padding);
						padding-left: var(--notebook-markdown-left-margin);
						padding-top: var(--notebook-preview-node-padding);
						padding-bottom: var(--notebook-preview-node-padding);

						box-sizing: border-box;
						white-space: nowrap;
						overflow: hidden;
						white-space: initial;

						font-size: var(--notebook-markup-font-size);
						color: var(--theme-ui-foreground);
					}

					#container div.preview.draggable {
						user-select: none;
						-webkit-user-select: none;
						-ms-user-select: none;
						cursor: grab;
					}

					#container div.preview.selected {
						background: var(--theme-notebook-cell-selected-background);
					}

					#container div.preview.dragging {
						background-color: var(--theme-background);
						opacity: 0.5 !important;
					}

					.monaco-workbench.vs-dark .notebookOverlay .cell.markdown .latex img,
					.monaco-workbench.vs-dark .notebookOverlay .cell.markdown .latex-block img {
						filter: brightness(0) invert(1)
					}

					#container .markup > div.nb-symbolHighlight {
						background-color: var(--theme-notebook-symbol-highlight-background);
					}

					#container > div.nb-cellDeleted .output_container {
						background-color: var(--theme-notebook-diff-removed-background);
					}

					#container > div.nb-cellAdded .output_container {
						background-color: var(--theme-notebook-diff-inserted-background);
					}

					#container > div > div:not(.preview) > div {
						overflow-x: auto;
					}

					#container .no-renderer-error {
						color: var(--vscode-editorError-foreground);
					}

					body {
						padding: 0px;
						height: 100%;
						width: 100%;
					}

					table, thead, tr, th, td, tbody {
						border: none !important;
						border-color: transparent;
						border-spacing: 0;
						border-collapse: collapse;
					}

					table, th, tr {
						vertical-align: middle;
						text-align: right;
					}

					thead {
						font-weight: bold;
						background-color: rgba(130, 130, 130, 0.16);
					}

					th, td {
						padding: 4px 8px;
					}

					tr:nth-child(even) {
						background-color: rgba(130, 130, 130, 0.08);
					}

					tbody th {
						font-weight: normal;
					}

					.find-match {
						background-color: var(--vscode-editor-findMatchHighlightBackground);
					}

					.current-find-match {
						background-color: var(--vscode-editor-findMatchBackground);
					}

					#_defaultColorPalatte {
						color: var(--vscode-editor-findMatchHighlightBackground);
						background-color: var(--vscode-editor-findMatchBackground);
					}
				</style>
			</head>
			<body style="overflow: hidden;">
				<div id='findStart' tabIndex=-1></div>
				<div id='container' class="widgetarea" style="position: absolute;width:100%;top: 0px"></div>
				<div id="_defaultColorPalatte"></div>
				<script type="module">${preloadScript}</script>
			</body>
		</html>`;
        }
        getRendererData() {
            return this.notebookService.getRenderers().map((renderer) => {
                const entrypoint = {
                    extends: renderer.entrypoint.extends,
                    path: this.asWebviewUri(renderer.entrypoint.path, renderer.extensionLocation).toString()
                };
                return {
                    id: renderer.id,
                    entrypoint,
                    mimeTypes: renderer.mimeTypes,
                    messaging: renderer.messaging !== "never" /* RendererMessagingSpec.Never */,
                    isBuiltin: renderer.isBuiltin
                };
            });
        }
        getStaticPreloadsData() {
            return Array.from(this.notebookService.getStaticPreloads(this.notebookViewType), preload => {
                return { entrypoint: this.asWebviewUri(preload.entrypoint, preload.extensionLocation).toString().toString() };
            });
        }
        asWebviewUri(uri, fromExtension) {
            return (0, webview_2.asWebviewUri)(uri, fromExtension?.scheme === network_1.Schemas.vscodeRemote ? { isRemote: true, authority: fromExtension.authority } : undefined);
        }
        postKernelMessage(message) {
            this._sendMessageToWebview({
                __vscode_notebook_message: true,
                type: 'customKernelMessage',
                message,
            });
        }
        resolveOutputId(id) {
            const output = this.reversedInsetMapping.get(id);
            if (!output) {
                return;
            }
            const cellInfo = this.insetMapping.get(output).cellInfo;
            return { cellInfo, output };
        }
        isResolved() {
            return !!this.webview;
        }
        createWebview(codeWindow) {
            const baseUrl = this.asWebviewUri(this.getNotebookBaseUri(), undefined);
            const htmlContent = this.generateContent(baseUrl.toString());
            return this._initialize(htmlContent, codeWindow);
        }
        getNotebookBaseUri() {
            if (this.documentUri.scheme === network_1.Schemas.untitled) {
                const folder = this.workspaceContextService.getWorkspaceFolder(this.documentUri);
                if (folder) {
                    return folder.uri;
                }
                const folders = this.workspaceContextService.getWorkspace().folders;
                if (folders.length) {
                    return folders[0].uri;
                }
            }
            return (0, resources_1.dirname)(this.documentUri);
        }
        getBuiltinLocalResourceRoots() {
            // Python notebooks assume that requirejs is a global.
            // For all other notebooks, they need to provide their own loader.
            if (!this.documentUri.path.toLowerCase().endsWith('.ipynb')) {
                return [];
            }
            if (platform_1.isWeb) {
                return []; // script is inlined
            }
            return [
                (0, resources_1.dirname)(network_1.FileAccess.asFileUri('vs/loader.js')),
            ];
        }
        _initialize(content, codeWindow) {
            if (!(0, dom_1.getWindow)(this.element).document.body.contains(this.element)) {
                throw new Error('Element is already detached from the DOM tree');
            }
            this.webview = this._createInset(this.webviewService, content, codeWindow);
            this.webview.mountTo(this.element);
            this._register(this.webview);
            this._register(new webviewWindowDragMonitor_1.WebviewWindowDragMonitor(() => this.webview));
            const initializePromise = new async_1.DeferredPromise();
            this._register(this.webview.onFatalError(e => {
                initializePromise.error(new Error(`Could not initialize webview: ${e.message}}`));
            }));
            this._register(this.webview.onMessage(async (message) => {
                const data = message.message;
                if (this._disposed) {
                    return;
                }
                if (!data.__vscode_notebook_message) {
                    return;
                }
                switch (data.type) {
                    case 'initialized': {
                        initializePromise.complete();
                        this.initializeWebViewState();
                        break;
                    }
                    case 'initializedMarkup': {
                        if (this.initializeMarkupPromise?.requestId === data.requestId) {
                            this.initializeMarkupPromise?.p.complete();
                            this.initializeMarkupPromise = undefined;
                        }
                        break;
                    }
                    case 'dimension': {
                        for (const update of data.updates) {
                            const height = update.height;
                            if (update.isOutput) {
                                const resolvedResult = this.resolveOutputId(update.id);
                                if (resolvedResult) {
                                    const { cellInfo, output } = resolvedResult;
                                    this.notebookEditor.updateOutputHeight(cellInfo, output, height, !!update.init, 'webview#dimension');
                                    this.notebookEditor.scheduleOutputHeightAck(cellInfo, update.id, height);
                                }
                                else if (update.init) {
                                    // might be idle render request's ack
                                    const outputRequest = this.reversedPendingWebviewIdleInsetMapping.get(update.id);
                                    if (outputRequest) {
                                        const inset = this.pendingWebviewIdleInsetMapping.get(outputRequest);
                                        // clear the pending mapping
                                        this.pendingWebviewIdleCreationRequest.delete(outputRequest);
                                        this.pendingWebviewIdleCreationRequest.delete(outputRequest);
                                        const cellInfo = inset.cellInfo;
                                        this.reversedInsetMapping.set(update.id, outputRequest);
                                        this.insetMapping.set(outputRequest, inset);
                                        this.notebookEditor.updateOutputHeight(cellInfo, outputRequest, height, !!update.init, 'webview#dimension');
                                        this.notebookEditor.scheduleOutputHeightAck(cellInfo, update.id, height);
                                    }
                                    this.reversedPendingWebviewIdleInsetMapping.delete(update.id);
                                }
                                {
                                    if (!update.init) {
                                        continue;
                                    }
                                    const output = this.reversedInsetMapping.get(update.id);
                                    if (!output) {
                                        continue;
                                    }
                                    const inset = this.insetMapping.get(output);
                                    inset.initialized = true;
                                }
                            }
                            else {
                                this.notebookEditor.updateMarkupCellHeight(update.id, height, !!update.init);
                            }
                        }
                        break;
                    }
                    case 'mouseenter': {
                        const resolvedResult = this.resolveOutputId(data.id);
                        if (resolvedResult) {
                            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                            if (latestCell) {
                                latestCell.outputIsHovered = true;
                            }
                        }
                        break;
                    }
                    case 'mouseleave': {
                        const resolvedResult = this.resolveOutputId(data.id);
                        if (resolvedResult) {
                            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                            if (latestCell) {
                                latestCell.outputIsHovered = false;
                            }
                        }
                        break;
                    }
                    case 'outputFocus': {
                        const resolvedResult = this.resolveOutputId(data.id);
                        if (resolvedResult) {
                            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                            if (latestCell) {
                                latestCell.outputIsFocused = true;
                                this.notebookEditor.focusNotebookCell(latestCell, 'output', { skipReveal: true, outputWebviewFocused: true });
                            }
                        }
                        break;
                    }
                    case 'outputBlur': {
                        const resolvedResult = this.resolveOutputId(data.id);
                        if (resolvedResult) {
                            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                            if (latestCell) {
                                latestCell.outputIsFocused = false;
                            }
                        }
                        break;
                    }
                    case 'scroll-ack': {
                        // const date = new Date();
                        // const top = data.data.top;
                        // console.log('ack top ', top, ' version: ', data.version, ' - ', date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds());
                        break;
                    }
                    case 'scroll-to-reveal': {
                        this.notebookEditor.setScrollTop(data.scrollTop - notebookCellList_1.NOTEBOOK_WEBVIEW_BOUNDARY);
                        break;
                    }
                    case 'did-scroll-wheel': {
                        this.notebookEditor.triggerScroll({
                            ...data.payload,
                            preventDefault: () => { },
                            stopPropagation: () => { }
                        });
                        break;
                    }
                    case 'focus-editor': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell) {
                            if (data.focusNext) {
                                this.notebookEditor.focusNextNotebookCell(cell, 'editor');
                            }
                            else {
                                await this.notebookEditor.focusNotebookCell(cell, 'editor');
                            }
                        }
                        break;
                    }
                    case 'clicked-data-url': {
                        this._onDidClickDataLink(data);
                        break;
                    }
                    case 'clicked-link': {
                        if ((0, network_1.matchesScheme)(data.href, network_1.Schemas.command)) {
                            const uri = uri_1.URI.parse(data.href);
                            if (uri.path === 'workbench.action.openLargeOutput') {
                                const outputId = uri.query;
                                const group = this.editorGroupService.activeGroup;
                                if (group) {
                                    if (group.activeEditor) {
                                        group.pinEditor(group.activeEditor);
                                    }
                                }
                                this.openerService.open(notebookCommon_1.CellUri.generateCellOutputUri(this.documentUri, outputId));
                                return;
                            }
                            if (uri.path === 'cellOutput.enableScrolling') {
                                const outputId = uri.query;
                                const cell = this.reversedInsetMapping.get(outputId);
                                if (cell) {
                                    this.telemetryService.publicLog2('workbenchActionExecuted', { id: 'notebook.cell.toggleOutputScrolling', from: 'inlineLink' });
                                    cell.cellViewModel.outputsViewModels.forEach((vm) => {
                                        if (vm.model.metadata) {
                                            vm.model.metadata['scrollable'] = true;
                                            vm.resetRenderer();
                                        }
                                    });
                                }
                                return;
                            }
                            // We allow a very limited set of commands
                            this.openerService.open(data.href, {
                                fromUserGesture: true,
                                fromWorkspace: true,
                                allowCommands: [
                                    'github-issues.authNow',
                                    'workbench.extensions.search',
                                    'workbench.action.openSettings',
                                    '_notebook.selectKernel',
                                    // TODO@rebornix explore open output channel with name command
                                    'jupyter.viewOutput'
                                ],
                            });
                            return;
                        }
                        if ((0, network_1.matchesSomeScheme)(data.href, network_1.Schemas.http, network_1.Schemas.https, network_1.Schemas.mailto)) {
                            this.openerService.open(data.href, { fromUserGesture: true, fromWorkspace: true });
                        }
                        else if ((0, network_1.matchesScheme)(data.href, network_1.Schemas.vscodeNotebookCell)) {
                            const uri = uri_1.URI.parse(data.href);
                            await this._handleNotebookCellResource(uri);
                        }
                        else if (!/^[\w\-]+:/.test(data.href)) {
                            // Uri without scheme, such as a file path
                            await this._handleResourceOpening(tryDecodeURIComponent(data.href));
                        }
                        else {
                            // uri with scheme
                            if (osPath.isAbsolute(data.href)) {
                                this._openUri(uri_1.URI.file(data.href));
                            }
                            else {
                                this._openUri(uri_1.URI.parse(data.href));
                            }
                        }
                        break;
                    }
                    case 'customKernelMessage': {
                        this._onMessage.fire({ message: data.message });
                        break;
                    }
                    case 'customRendererMessage': {
                        this.rendererMessaging?.postMessage(data.rendererId, data.message);
                        break;
                    }
                    case 'clickMarkupCell': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell) {
                            if (data.shiftKey || (platform_1.isMacintosh ? data.metaKey : data.ctrlKey)) {
                                // Modify selection
                                this.notebookEditor.toggleNotebookCellSelection(cell, /* fromPrevious */ data.shiftKey);
                            }
                            else {
                                // Normal click
                                await this.notebookEditor.focusNotebookCell(cell, 'container', { skipReveal: true });
                            }
                        }
                        break;
                    }
                    case 'contextMenuMarkupCell': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell) {
                            // Focus the cell first
                            await this.notebookEditor.focusNotebookCell(cell, 'container', { skipReveal: true });
                            // Then show the context menu
                            const webviewRect = this.element.getBoundingClientRect();
                            this.contextMenuService.showContextMenu({
                                menuId: actions_1.MenuId.NotebookCellTitle,
                                contextKeyService: this.contextKeyService,
                                getAnchor: () => ({
                                    x: webviewRect.x + data.clientX,
                                    y: webviewRect.y + data.clientY
                                })
                            });
                        }
                        break;
                    }
                    case 'toggleMarkupPreview': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell && !this.notebookEditor.creationOptions.isReadOnly) {
                            this.notebookEditor.setMarkupCellEditState(data.cellId, notebookBrowser_1.CellEditState.Editing);
                            await this.notebookEditor.focusNotebookCell(cell, 'editor', { skipReveal: true });
                        }
                        break;
                    }
                    case 'mouseEnterMarkupCell': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                            cell.cellIsHovered = true;
                        }
                        break;
                    }
                    case 'mouseLeaveMarkupCell': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                            cell.cellIsHovered = false;
                        }
                        break;
                    }
                    case 'cell-drag-start': {
                        this.notebookEditor.didStartDragMarkupCell(data.cellId, data);
                        break;
                    }
                    case 'cell-drag': {
                        this.notebookEditor.didDragMarkupCell(data.cellId, data);
                        break;
                    }
                    case 'cell-drop': {
                        this.notebookEditor.didDropMarkupCell(data.cellId, {
                            dragOffsetY: data.dragOffsetY,
                            ctrlKey: data.ctrlKey,
                            altKey: data.altKey,
                        });
                        break;
                    }
                    case 'cell-drag-end': {
                        this.notebookEditor.didEndDragMarkupCell(data.cellId);
                        break;
                    }
                    case 'renderedMarkup': {
                        const cell = this.notebookEditor.getCellById(data.cellId);
                        if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                            cell.renderedHtml = data.html;
                        }
                        this._handleHighlightCodeBlock(data.codeBlocks);
                        break;
                    }
                    case 'renderedCellOutput': {
                        this._handleHighlightCodeBlock(data.codeBlocks);
                        break;
                    }
                    case 'outputResized': {
                        this.notebookEditor.didResizeOutput(data.cellId);
                        break;
                    }
                    case 'getOutputItem': {
                        const resolvedResult = this.resolveOutputId(data.outputId);
                        const output = resolvedResult?.output.model.outputs.find(output => output.mime === data.mime);
                        this._sendMessageToWebview({
                            type: 'returnOutputItem',
                            requestId: data.requestId,
                            output: output ? { mime: output.mime, valueBytes: output.data.buffer } : undefined,
                        });
                        break;
                    }
                    case 'logRendererDebugMessage': {
                        this._logRendererDebugMessage(`${data.message}${data.data ? ' ' + JSON.stringify(data.data, null, 4) : ''}`);
                        break;
                    }
                    case 'notebookPerformanceMessage': {
                        this.notebookEditor.updatePerformanceMetadata(data.cellId, data.executionId, data.duration, data.rendererId);
                        break;
                    }
                    case 'outputInputFocus': {
                        this.notebookEditor.didFocusOutputInputChange(data.inputFocused);
                    }
                }
            }));
            return initializePromise.p;
        }
        _handleNotebookCellResource(uri) {
            const notebookResource = uri.path.length > 0 ? uri : this.documentUri;
            const lineMatch = /(?:^|&)line=([^&]+)/.exec(uri.query);
            let editorOptions = undefined;
            if (lineMatch) {
                const parsedLineNumber = parseInt(lineMatch[1], 10);
                if (!isNaN(parsedLineNumber)) {
                    const lineNumber = parsedLineNumber;
                    editorOptions = {
                        selection: { startLineNumber: lineNumber, startColumn: 1 }
                    };
                }
            }
            const executionMatch = /(?:^|&)execution_count=([^&]+)/.exec(uri.query);
            if (executionMatch) {
                const executionCount = parseInt(executionMatch[1], 10);
                if (!isNaN(executionCount)) {
                    const notebookModel = this.notebookService.getNotebookTextModel(notebookResource);
                    // multiple cells with the same execution count can exist if the kernel is restarted
                    // so look for the most recently added cell with the matching execution count.
                    // Somewhat more likely to be correct in notebooks, an much more likely for the interactive window
                    const cell = notebookModel?.cells.slice().reverse().find(cell => {
                        return cell.internalMetadata.executionOrder === executionCount;
                    });
                    if (cell?.uri) {
                        return this.openerService.open(cell.uri, {
                            fromUserGesture: true,
                            fromWorkspace: true,
                            editorOptions: editorOptions
                        });
                    }
                }
            }
            // URLs built by the jupyter extension put the line query param in the fragment
            // They also have the cell fragment pre-calculated
            const fragmentLineMatch = /\?line=(\d+)$/.exec(uri.fragment);
            if (fragmentLineMatch) {
                const parsedLineNumber = parseInt(fragmentLineMatch[1], 10);
                if (!isNaN(parsedLineNumber)) {
                    const lineNumber = parsedLineNumber + 1;
                    const fragment = uri.fragment.substring(0, fragmentLineMatch.index);
                    // open the uri with selection
                    const editorOptions = {
                        selection: { startLineNumber: lineNumber, startColumn: 1, endLineNumber: lineNumber, endColumn: 1 }
                    };
                    return this.openerService.open(notebookResource.with({ fragment }), {
                        fromUserGesture: true,
                        fromWorkspace: true,
                        editorOptions: editorOptions
                    });
                }
            }
            return this.openerService.open(notebookResource, { fromUserGesture: true, fromWorkspace: true });
        }
        async _handleResourceOpening(href) {
            let linkToOpen = undefined;
            let fragment = undefined;
            // Separate out the fragment so that the subsequent calls
            // to URI.joinPath() don't URL encode it. This allows opening
            // links with both paths and fragments.
            const hrefWithFragment = FRAGMENT_REGEX.exec(href);
            if (hrefWithFragment) {
                href = hrefWithFragment[1];
                fragment = hrefWithFragment[2];
            }
            if (href.startsWith('/')) {
                linkToOpen = await this.pathService.fileURI(href);
                const folders = this.workspaceContextService.getWorkspace().folders;
                if (folders.length) {
                    linkToOpen = linkToOpen.with({
                        scheme: folders[0].uri.scheme,
                        authority: folders[0].uri.authority
                    });
                }
            }
            else if (href.startsWith('~')) {
                const userHome = await this.pathService.userHome();
                if (userHome) {
                    linkToOpen = uri_1.URI.joinPath(userHome, href.substring(2));
                }
            }
            else {
                if (this.documentUri.scheme === network_1.Schemas.untitled) {
                    const folders = this.workspaceContextService.getWorkspace().folders;
                    if (!folders.length) {
                        return;
                    }
                    linkToOpen = uri_1.URI.joinPath(folders[0].uri, href);
                }
                else {
                    // Resolve relative to notebook document
                    linkToOpen = uri_1.URI.joinPath((0, resources_1.dirname)(this.documentUri), href);
                }
            }
            if (linkToOpen) {
                // Re-attach fragment now that we have the full file path.
                if (fragment) {
                    linkToOpen = linkToOpen.with({ fragment });
                }
                this._openUri(linkToOpen);
            }
        }
        _openUri(uri) {
            let lineNumber = undefined;
            let column = undefined;
            const lineCol = LINE_COLUMN_REGEX.exec(uri.path);
            if (lineCol) {
                uri = uri.with({
                    path: uri.path.slice(0, lineCol.index),
                    fragment: `L${lineCol[0].slice(1)}`
                });
                lineNumber = parseInt(lineCol[1], 10);
                column = parseInt(lineCol[2], 10);
            }
            //#region error renderer migration, remove once done
            const lineMatch = LineQueryRegex.exec(uri.query);
            if (lineMatch) {
                const parsedLineNumber = parseInt(lineMatch[1], 10);
                if (!isNaN(parsedLineNumber)) {
                    lineNumber = parsedLineNumber + 1;
                    column = 1;
                    uri = uri.with({ fragment: `L${lineNumber}` });
                }
            }
            uri = uri.with({
                query: null
            });
            //#endregion
            let match = undefined;
            for (const group of this.editorGroupService.groups) {
                const editorInput = group.editors.find(editor => editor.resource && (0, resources_1.isEqual)(editor.resource, uri, true));
                if (editorInput) {
                    match = { group, editor: editorInput };
                    break;
                }
            }
            if (match) {
                match.group.openEditor(match.editor, lineNumber !== undefined && column !== undefined ? { selection: { startLineNumber: lineNumber, startColumn: column } } : undefined);
            }
            else {
                this.openerService.open(uri, { fromUserGesture: true, fromWorkspace: true });
            }
        }
        _handleHighlightCodeBlock(codeBlocks) {
            for (const { id, value, lang } of codeBlocks) {
                // The language id may be a language aliases (e.g.js instead of javascript)
                const languageId = this.languageService.getLanguageIdByLanguageName(lang);
                if (!languageId) {
                    continue;
                }
                (0, textToHtmlTokenizer_1.tokenizeToString)(this.languageService, value, languageId).then((html) => {
                    if (this._disposed) {
                        return;
                    }
                    this._sendMessageToWebview({
                        type: 'tokenizedCodeBlock',
                        html,
                        codeBlockId: id
                    });
                });
            }
        }
        async _onDidClickDataLink(event) {
            if (typeof event.data !== 'string') {
                return;
            }
            const [splitStart, splitData] = event.data.split(';base64,');
            if (!splitData || !splitStart) {
                return;
            }
            const defaultDir = (0, resources_1.extname)(this.documentUri) === '.interactive' ?
                this.workspaceContextService.getWorkspace().folders[0]?.uri ?? await this.fileDialogService.defaultFilePath() :
                (0, resources_1.dirname)(this.documentUri);
            let defaultName;
            if (event.downloadName) {
                defaultName = event.downloadName;
            }
            else {
                const mimeType = splitStart.replace(/^data:/, '');
                const candidateExtension = mimeType && (0, mime_1.getExtensionForMimeType)(mimeType);
                defaultName = candidateExtension ? `download${candidateExtension}` : 'download';
            }
            const defaultUri = (0, resources_1.joinPath)(defaultDir, defaultName);
            const newFileUri = await this.fileDialogService.showSaveDialog({
                defaultUri
            });
            if (!newFileUri) {
                return;
            }
            const buff = (0, buffer_1.decodeBase64)(splitData);
            await this.fileService.writeFile(newFileUri, buff);
            await this.openerService.open(newFileUri);
        }
        _createInset(webviewService, content, codeWindow) {
            this.localResourceRootsCache = this._getResourceRootsCache();
            const webview = webviewService.createWebviewElement({
                origin: BackLayerWebView_1.getOriginStore(this.storageService).getOrigin(this.notebookViewType, undefined),
                title: nls.localize('webview title', "Notebook webview content"),
                options: {
                    purpose: "notebookRenderer" /* WebviewContentPurpose.NotebookRenderer */,
                    enableFindWidget: false,
                    transformCssVariables: webviewThemeMapping_1.transformWebviewThemeVars,
                },
                contentOptions: {
                    allowMultipleAPIAcquire: true,
                    allowScripts: true,
                    localResourceRoots: this.localResourceRootsCache,
                },
                extension: undefined,
                providedViewType: 'notebook.output',
                codeWindow: codeWindow
            });
            webview.setHtml(content);
            webview.setContextKeyService(this.contextKeyService);
            return webview;
        }
        _getResourceRootsCache() {
            const workspaceFolders = this.contextService.getWorkspace().folders.map(x => x.uri);
            const notebookDir = this.getNotebookBaseUri();
            return [
                this.notebookService.getNotebookProviderResourceRoots(),
                this.notebookService.getRenderers().map(x => (0, resources_1.dirname)(x.entrypoint.path)),
                ...Array.from(this.notebookService.getStaticPreloads(this.notebookViewType), x => [
                    (0, resources_1.dirname)(x.entrypoint),
                    ...x.localResourceRoots,
                ]),
                workspaceFolders,
                notebookDir,
                this.getBuiltinLocalResourceRoots()
            ].flat();
        }
        initializeWebViewState() {
            this._preloadsCache.clear();
            if (this._currentKernel) {
                this._updatePreloadsFromKernel(this._currentKernel);
            }
            for (const [output, inset] of this.insetMapping.entries()) {
                this._sendMessageToWebview({ ...inset.cachedCreation, initiallyHidden: this.hiddenInsetMapping.has(output) });
            }
            if (this.initializeMarkupPromise?.isFirstInit) {
                // On first run the contents have already been initialized so we don't need to init them again
                // no op
            }
            else {
                const mdCells = [...this.markupPreviewMapping.values()];
                this.markupPreviewMapping.clear();
                this.initializeMarkup(mdCells);
            }
            this._updateStyles();
            this._updateOptions();
        }
        shouldUpdateInset(cell, output, cellTop, outputOffset) {
            if (this._disposed) {
                return false;
            }
            if ('isOutputCollapsed' in cell && cell.isOutputCollapsed) {
                return false;
            }
            if (this.hiddenInsetMapping.has(output)) {
                return true;
            }
            const outputCache = this.insetMapping.get(output);
            if (!outputCache) {
                return false;
            }
            if (outputOffset === outputCache.cachedCreation.outputOffset && cellTop === outputCache.cachedCreation.cellTop) {
                return false;
            }
            return true;
        }
        ackHeight(updates) {
            this._sendMessageToWebview({
                type: 'ack-dimension',
                updates
            });
        }
        updateScrollTops(outputRequests, markupPreviews) {
            if (this._disposed) {
                return;
            }
            const widgets = (0, arrays_1.coalesce)(outputRequests.map((request) => {
                const outputCache = this.insetMapping.get(request.output);
                if (!outputCache) {
                    return;
                }
                if (!request.forceDisplay && !this.shouldUpdateInset(request.cell, request.output, request.cellTop, request.outputOffset)) {
                    return;
                }
                const id = outputCache.outputId;
                outputCache.cachedCreation.cellTop = request.cellTop;
                outputCache.cachedCreation.outputOffset = request.outputOffset;
                this.hiddenInsetMapping.delete(request.output);
                return {
                    cellId: request.cell.id,
                    outputId: id,
                    cellTop: request.cellTop,
                    outputOffset: request.outputOffset,
                    forceDisplay: request.forceDisplay,
                };
            }));
            if (!widgets.length && !markupPreviews.length) {
                return;
            }
            this._sendMessageToWebview({
                type: 'view-scroll',
                widgets: widgets,
                markupCells: markupPreviews,
            });
        }
        async createMarkupPreview(initialization) {
            if (this._disposed) {
                return;
            }
            if (this.markupPreviewMapping.has(initialization.cellId)) {
                console.error('Trying to create markup preview that already exists');
                return;
            }
            this.markupPreviewMapping.set(initialization.cellId, initialization);
            this._sendMessageToWebview({
                type: 'createMarkupCell',
                cell: initialization
            });
        }
        async showMarkupPreview(newContent) {
            if (this._disposed) {
                return;
            }
            const entry = this.markupPreviewMapping.get(newContent.cellId);
            if (!entry) {
                return this.createMarkupPreview(newContent);
            }
            const sameContent = newContent.content === entry.content;
            const sameMetadata = ((0, objects_1.equals)(newContent.metadata, entry.metadata));
            if (!sameContent || !sameMetadata || !entry.visible) {
                this._sendMessageToWebview({
                    type: 'showMarkupCell',
                    id: newContent.cellId,
                    handle: newContent.cellHandle,
                    // If the content has not changed, we still want to make sure the
                    // preview is visible but don't need to send anything over
                    content: sameContent ? undefined : newContent.content,
                    top: newContent.offset,
                    metadata: sameMetadata ? undefined : newContent.metadata
                });
            }
            entry.metadata = newContent.metadata;
            entry.content = newContent.content;
            entry.offset = newContent.offset;
            entry.visible = true;
        }
        async hideMarkupPreviews(cellIds) {
            if (this._disposed) {
                return;
            }
            const cellsToHide = [];
            for (const cellId of cellIds) {
                const entry = this.markupPreviewMapping.get(cellId);
                if (entry) {
                    if (entry.visible) {
                        cellsToHide.push(cellId);
                        entry.visible = false;
                    }
                }
            }
            if (cellsToHide.length) {
                this._sendMessageToWebview({
                    type: 'hideMarkupCells',
                    ids: cellsToHide
                });
            }
        }
        async unhideMarkupPreviews(cellIds) {
            if (this._disposed) {
                return;
            }
            const toUnhide = [];
            for (const cellId of cellIds) {
                const entry = this.markupPreviewMapping.get(cellId);
                if (entry) {
                    if (!entry.visible) {
                        entry.visible = true;
                        toUnhide.push(cellId);
                    }
                }
                else {
                    console.error(`Trying to unhide a preview that does not exist: ${cellId}`);
                }
            }
            this._sendMessageToWebview({
                type: 'unhideMarkupCells',
                ids: toUnhide,
            });
        }
        async deleteMarkupPreviews(cellIds) {
            if (this._disposed) {
                return;
            }
            for (const id of cellIds) {
                if (!this.markupPreviewMapping.has(id)) {
                    console.error(`Trying to delete a preview that does not exist: ${id}`);
                }
                this.markupPreviewMapping.delete(id);
            }
            if (cellIds.length) {
                this._sendMessageToWebview({
                    type: 'deleteMarkupCell',
                    ids: cellIds
                });
            }
        }
        async updateMarkupPreviewSelections(selectedCellsIds) {
            if (this._disposed) {
                return;
            }
            this._sendMessageToWebview({
                type: 'updateSelectedMarkupCells',
                selectedCellIds: selectedCellsIds.filter(id => this.markupPreviewMapping.has(id)),
            });
        }
        async initializeMarkup(cells) {
            if (this._disposed) {
                return;
            }
            this.initializeMarkupPromise?.p.complete();
            const requestId = UUID.generateUuid();
            this.initializeMarkupPromise = { p: new async_1.DeferredPromise(), requestId, isFirstInit: this.firstInit };
            this.firstInit = false;
            for (const cell of cells) {
                this.markupPreviewMapping.set(cell.cellId, cell);
            }
            this._sendMessageToWebview({
                type: 'initializeMarkup',
                cells,
                requestId,
            });
            return this.initializeMarkupPromise.p.p;
        }
        /**
         * Validate if cached inset is out of date and require a rerender
         * Note that it doesn't account for output content change.
         */
        _cachedInsetEqual(cachedInset, content) {
            if (content.type === 1 /* RenderOutputType.Extension */) {
                // Use a new renderer
                return cachedInset.renderer?.id === content.renderer.id;
            }
            else {
                // The new renderer is the default HTML renderer
                return cachedInset.cachedCreation.type === 'html';
            }
        }
        requestCreateOutputWhenWebviewIdle(cellInfo, content, cellTop, offset) {
            if (this._disposed) {
                return;
            }
            if (this.insetMapping.has(content.source)) {
                return;
            }
            if (this.pendingWebviewIdleCreationRequest.has(content.source)) {
                return;
            }
            if (this.pendingWebviewIdleInsetMapping.has(content.source)) {
                // handled in renderer process, waiting for webview to process it when idle
                return;
            }
            this.pendingWebviewIdleCreationRequest.set(content.source, (0, async_1.runWhenGlobalIdle)(() => {
                const { message, renderer, transfer: transferable } = this._createOutputCreationMessage(cellInfo, content, cellTop, offset, true, true);
                this._sendMessageToWebview(message, transferable);
                this.pendingWebviewIdleInsetMapping.set(content.source, { outputId: message.outputId, versionId: content.source.model.versionId, cellInfo: cellInfo, renderer, cachedCreation: message });
                this.reversedPendingWebviewIdleInsetMapping.set(message.outputId, content.source);
                this.pendingWebviewIdleCreationRequest.delete(content.source);
            }));
        }
        createOutput(cellInfo, content, cellTop, offset) {
            if (this._disposed) {
                return;
            }
            const cachedInset = this.insetMapping.get(content.source);
            // we now request to render the output immediately, so we can remove the pending request
            // dispose the pending request in renderer process if it exists
            this.pendingWebviewIdleCreationRequest.get(content.source)?.dispose();
            this.pendingWebviewIdleCreationRequest.delete(content.source);
            // if request has already been sent out, we then remove it from the pending mapping
            this.pendingWebviewIdleInsetMapping.delete(content.source);
            if (cachedInset) {
                this.reversedPendingWebviewIdleInsetMapping.delete(cachedInset.outputId);
            }
            if (cachedInset && this._cachedInsetEqual(cachedInset, content)) {
                this.hiddenInsetMapping.delete(content.source);
                this._sendMessageToWebview({
                    type: 'showOutput',
                    cellId: cachedInset.cellInfo.cellId,
                    outputId: cachedInset.outputId,
                    cellTop: cellTop,
                    outputOffset: offset
                });
                return;
            }
            // create new output
            const { message, renderer, transfer: transferable } = this._createOutputCreationMessage(cellInfo, content, cellTop, offset, false, false);
            this._sendMessageToWebview(message, transferable);
            this.insetMapping.set(content.source, { outputId: message.outputId, versionId: content.source.model.versionId, cellInfo: cellInfo, renderer, cachedCreation: message });
            this.hiddenInsetMapping.delete(content.source);
            this.reversedInsetMapping.set(message.outputId, content.source);
        }
        createMetadata(output, mimeType) {
            if (mimeType.startsWith('image')) {
                const buffer = output.outputs.find(out => out.mime === 'text/plain')?.data.buffer;
                if (buffer?.length && buffer?.length > 0) {
                    const altText = new TextDecoder().decode(buffer);
                    return { ...output.metadata, vscode_altText: altText };
                }
            }
            return output.metadata;
        }
        _createOutputCreationMessage(cellInfo, content, cellTop, offset, createOnIdle, initiallyHidden) {
            const messageBase = {
                type: 'html',
                executionId: cellInfo.executionId,
                cellId: cellInfo.cellId,
                cellTop: cellTop,
                outputOffset: offset,
                left: 0,
                requiredPreloads: [],
                createOnIdle: createOnIdle
            };
            const transfer = [];
            let message;
            let renderer;
            if (content.type === 1 /* RenderOutputType.Extension */) {
                const output = content.source.model;
                renderer = content.renderer;
                const first = output.outputs.find(op => op.mime === content.mimeType);
                const metadata = this.createMetadata(output, content.mimeType);
                const valueBytes = copyBufferIfNeeded(first.data.buffer, transfer);
                message = {
                    ...messageBase,
                    outputId: output.outputId,
                    rendererId: content.renderer.id,
                    content: {
                        type: 1 /* RenderOutputType.Extension */,
                        outputId: output.outputId,
                        metadata: metadata,
                        output: {
                            mime: first.mime,
                            valueBytes,
                        },
                        allOutputs: output.outputs.map(output => ({ mime: output.mime })),
                    },
                    initiallyHidden: initiallyHidden
                };
            }
            else {
                message = {
                    ...messageBase,
                    outputId: UUID.generateUuid(),
                    content: {
                        type: content.type,
                        htmlContent: content.htmlContent,
                    },
                    initiallyHidden: initiallyHidden
                };
            }
            return {
                message,
                renderer,
                transfer,
            };
        }
        updateOutput(cellInfo, content, cellTop, offset) {
            if (this._disposed) {
                return;
            }
            if (!this.insetMapping.has(content.source)) {
                this.createOutput(cellInfo, content, cellTop, offset);
                return;
            }
            const outputCache = this.insetMapping.get(content.source);
            if (outputCache.versionId === content.source.model.versionId) {
                // already sent this output version to the renderer
                return;
            }
            this.hiddenInsetMapping.delete(content.source);
            let updatedContent = undefined;
            const transfer = [];
            if (content.type === 1 /* RenderOutputType.Extension */) {
                const output = content.source.model;
                const firstBuffer = output.outputs.find(op => op.mime === content.mimeType);
                const appenededData = output.appendedSinceVersion(outputCache.versionId, content.mimeType);
                const appended = appenededData ? { valueBytes: appenededData.buffer, previousVersion: outputCache.versionId } : undefined;
                const valueBytes = copyBufferIfNeeded(firstBuffer.data.buffer, transfer);
                updatedContent = {
                    type: 1 /* RenderOutputType.Extension */,
                    outputId: outputCache.outputId,
                    metadata: output.metadata,
                    output: {
                        mime: content.mimeType,
                        valueBytes,
                        appended: appended
                    },
                    allOutputs: output.outputs.map(output => ({ mime: output.mime }))
                };
            }
            this._sendMessageToWebview({
                type: 'showOutput',
                cellId: outputCache.cellInfo.cellId,
                outputId: outputCache.outputId,
                cellTop: cellTop,
                outputOffset: offset,
                content: updatedContent
            }, transfer);
            outputCache.versionId = content.source.model.versionId;
            return;
        }
        async copyImage(output) {
            this._sendMessageToWebview({
                type: 'copyImage',
                outputId: output.model.outputId,
                altOutputId: output.model.alternativeOutputId
            });
        }
        removeInsets(outputs) {
            if (this._disposed) {
                return;
            }
            for (const output of outputs) {
                const outputCache = this.insetMapping.get(output);
                if (!outputCache) {
                    continue;
                }
                const id = outputCache.outputId;
                this._sendMessageToWebview({
                    type: 'clearOutput',
                    rendererId: outputCache.cachedCreation.rendererId,
                    cellUri: outputCache.cellInfo.cellUri.toString(),
                    outputId: id,
                    cellId: outputCache.cellInfo.cellId
                });
                this.insetMapping.delete(output);
                this.pendingWebviewIdleCreationRequest.get(output)?.dispose();
                this.pendingWebviewIdleCreationRequest.delete(output);
                this.pendingWebviewIdleInsetMapping.delete(output);
                this.reversedPendingWebviewIdleInsetMapping.delete(id);
                this.reversedInsetMapping.delete(id);
            }
        }
        hideInset(output) {
            if (this._disposed) {
                return;
            }
            const outputCache = this.insetMapping.get(output);
            if (!outputCache) {
                return;
            }
            this.hiddenInsetMapping.add(output);
            this._sendMessageToWebview({
                type: 'hideOutput',
                outputId: outputCache.outputId,
                cellId: outputCache.cellInfo.cellId,
            });
        }
        focusWebview() {
            if (this._disposed) {
                return;
            }
            this.webview?.focus();
        }
        focusOutput(cellOrOutputId, alternateId, viewFocused) {
            if (this._disposed) {
                return;
            }
            if (!viewFocused) {
                this.webview?.focus();
            }
            this._sendMessageToWebview({
                type: 'focus-output',
                cellOrOutputId: cellOrOutputId,
                alternateId: alternateId
            });
        }
        async find(query, options) {
            if (query === '') {
                this._sendMessageToWebview({
                    type: 'findStop',
                    ownerID: options.ownerID
                });
                return [];
            }
            const p = new Promise(resolve => {
                const sub = this.webview?.onMessage(e => {
                    if (e.message.type === 'didFind') {
                        resolve(e.message.matches);
                        sub?.dispose();
                    }
                });
            });
            this._sendMessageToWebview({
                type: 'find',
                query: query,
                options
            });
            const ret = await p;
            return ret;
        }
        findStop(ownerID) {
            this._sendMessageToWebview({
                type: 'findStop',
                ownerID
            });
        }
        async findHighlightCurrent(index, ownerID) {
            const p = new Promise(resolve => {
                const sub = this.webview?.onMessage(e => {
                    if (e.message.type === 'didFindHighlightCurrent') {
                        resolve(e.message.offset);
                        sub?.dispose();
                    }
                });
            });
            this._sendMessageToWebview({
                type: 'findHighlightCurrent',
                index,
                ownerID
            });
            const ret = await p;
            return ret;
        }
        async findUnHighlightCurrent(index, ownerID) {
            this._sendMessageToWebview({
                type: 'findUnHighlightCurrent',
                index,
                ownerID
            });
        }
        deltaCellContainerClassNames(cellId, added, removed) {
            this._sendMessageToWebview({
                type: 'decorations',
                cellId,
                addedClassNames: added,
                removedClassNames: removed
            });
        }
        updateOutputRenderers() {
            if (!this.webview) {
                return;
            }
            const renderersData = this.getRendererData();
            this.localResourceRootsCache = this._getResourceRootsCache();
            const mixedResourceRoots = [
                ...(this.localResourceRootsCache || []),
                ...(this._currentKernel ? [this._currentKernel.localResourceRoot] : []),
            ];
            this.webview.localResourcesRoot = mixedResourceRoots;
            this._sendMessageToWebview({
                type: 'updateRenderers',
                rendererData: renderersData
            });
        }
        async updateKernelPreloads(kernel) {
            if (this._disposed || kernel === this._currentKernel) {
                return;
            }
            const previousKernel = this._currentKernel;
            this._currentKernel = kernel;
            if (previousKernel && previousKernel.preloadUris.length > 0) {
                this.webview?.reload(); // preloads will be restored after reload
            }
            else if (kernel) {
                this._updatePreloadsFromKernel(kernel);
            }
        }
        _updatePreloadsFromKernel(kernel) {
            const resources = [];
            for (const preload of kernel.preloadUris) {
                const uri = this.environmentService.isExtensionDevelopment && (preload.scheme === 'http' || preload.scheme === 'https')
                    ? preload : this.asWebviewUri(preload, undefined);
                if (!this._preloadsCache.has(uri.toString())) {
                    resources.push({ uri: uri.toString(), originalUri: preload.toString() });
                    this._preloadsCache.add(uri.toString());
                }
            }
            if (!resources.length) {
                return;
            }
            this._updatePreloads(resources);
        }
        _updatePreloads(resources) {
            if (!this.webview) {
                return;
            }
            const mixedResourceRoots = [
                ...(this.localResourceRootsCache || []),
                ...(this._currentKernel ? [this._currentKernel.localResourceRoot] : []),
            ];
            this.webview.localResourcesRoot = mixedResourceRoots;
            this._sendMessageToWebview({
                type: 'preload',
                resources: resources,
            });
        }
        _sendMessageToWebview(message, transfer) {
            if (this._disposed) {
                return;
            }
            this.webview?.postMessage(message, transfer);
        }
        dispose() {
            this._disposed = true;
            this.webview?.dispose();
            this.webview = undefined;
            this.notebookEditor = null;
            this.insetMapping.clear();
            this.pendingWebviewIdleCreationRequest.clear();
            super.dispose();
        }
    };
    exports.BackLayerWebView = BackLayerWebView;
    exports.BackLayerWebView = BackLayerWebView = BackLayerWebView_1 = __decorate([
        __param(6, webview_1.IWebviewService),
        __param(7, opener_1.IOpenerService),
        __param(8, notebookService_1.INotebookService),
        __param(9, workspace_1.IWorkspaceContextService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, dialogs_1.IFileDialogService),
        __param(12, files_1.IFileService),
        __param(13, contextView_1.IContextMenuService),
        __param(14, contextkey_1.IContextKeyService),
        __param(15, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(16, configuration_1.IConfigurationService),
        __param(17, language_1.ILanguageService),
        __param(18, workspace_1.IWorkspaceContextService),
        __param(19, editorGroupsService_1.IEditorGroupsService),
        __param(20, storage_1.IStorageService),
        __param(21, pathService_1.IPathService),
        __param(22, notebookLoggingService_1.INotebookLoggingService),
        __param(23, themeService_1.IThemeService),
        __param(24, telemetry_1.ITelemetryService)
    ], BackLayerWebView);
    function copyBufferIfNeeded(buffer, transfer) {
        if (buffer.byteLength === buffer.buffer.byteLength) {
            // No copy needed but we can't transfer either
            return buffer;
        }
        else {
            // The buffer is smaller than its backing array buffer.
            // Create a copy to avoid sending the entire array buffer.
            const valueBytes = new Uint8Array(buffer);
            transfer.push(valueBytes.buffer);
            return valueBytes;
        }
    }
    function getTokenizationCss() {
        const colorMap = languages_1.TokenizationRegistry.getColorMap();
        const tokenizationCss = colorMap ? (0, tokenization_1.generateTokensCSSForColorMap)(colorMap) : '';
        return tokenizationCss;
    }
    function tryDecodeURIComponent(uri) {
        try {
            return decodeURIComponent(uri);
        }
        catch {
            return uri;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja0xheWVyV2ViVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L3JlbmRlcmVycy9iYWNrTGF5ZXJXZWJWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF5RGhHLE1BQU0saUJBQWlCLEdBQUcsd0JBQXdCLENBQUM7SUFDbkQsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDO0lBQ3JDLE1BQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDO0lBOERqQyxJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUE0QyxTQUFRLHVCQUFROztRQUloRSxNQUFNLENBQUMsY0FBYyxDQUFDLGNBQStCO1lBQzVELElBQUksQ0FBQyxZQUFZLEtBQUssSUFBSSw0QkFBa0IsQ0FBQyxtQ0FBbUMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNsRyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDMUIsQ0FBQztRQXdCRCxZQUNRLGNBQTJDLEVBQ2pDLEVBQVUsRUFDWCxnQkFBd0IsRUFDeEIsV0FBZ0IsRUFDeEIsT0FBZ0MsRUFDdkIsaUJBQXVELEVBQ3ZELGNBQWdELEVBQ2pELGFBQThDLEVBQzVDLGVBQWtELEVBQzFDLGNBQXlELEVBQ3JELGtCQUFpRSxFQUMzRSxpQkFBc0QsRUFDNUQsV0FBMEMsRUFDbkMsa0JBQXdELEVBQ3pELGlCQUFzRCxFQUN4QywrQkFBa0YsRUFDN0Ysb0JBQTRELEVBQ2pFLGVBQWtELEVBQzFDLHVCQUFrRSxFQUN0RSxrQkFBeUQsRUFDOUQsY0FBZ0QsRUFDbkQsV0FBMEMsRUFDL0Isa0JBQTRELEVBQ3RFLFlBQTJCLEVBQ3ZCLGdCQUFvRDtZQUV2RSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUExQmIsbUJBQWMsR0FBZCxjQUFjLENB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