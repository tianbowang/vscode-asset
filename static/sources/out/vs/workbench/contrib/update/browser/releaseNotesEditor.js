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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/keybindingParser", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/languages", "vs/editor/common/languages/supports/tokenization", "vs/editor/common/languages/language", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/workbench/contrib/markdown/browser/markdownDocumentRenderer", "vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/css!./media/releasenoteseditor"], function (require, exports, cancellation_1, errors_1, htmlContent_1, keybindingParser_1, strings_1, uri_1, uuid_1, languages_1, tokenization_1, language_1, nls, environment_1, keybinding_1, opener_1, productService_1, request_1, markdownDocumentRenderer_1, webviewWorkbenchService_1, editorGroupsService_1, editorService_1, extensions_1, telemetryUtils_1, configuration_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseNotesManager = void 0;
    let ReleaseNotesManager = class ReleaseNotesManager {
        constructor(_environmentService, _keybindingService, _languageService, _openerService, _requestService, _configurationService, _editorService, _editorGroupService, _webviewWorkbenchService, _extensionService, _productService) {
            this._environmentService = _environmentService;
            this._keybindingService = _keybindingService;
            this._languageService = _languageService;
            this._openerService = _openerService;
            this._requestService = _requestService;
            this._configurationService = _configurationService;
            this._editorService = _editorService;
            this._editorGroupService = _editorGroupService;
            this._webviewWorkbenchService = _webviewWorkbenchService;
            this._extensionService = _extensionService;
            this._productService = _productService;
            this._releaseNotesCache = new Map();
            this._currentReleaseNotes = undefined;
            this.disposables = new lifecycle_1.DisposableStore();
            languages_1.TokenizationRegistry.onDidChange(async () => {
                if (!this._currentReleaseNotes || !this._lastText) {
                    return;
                }
                const html = await this.renderBody(this._lastText);
                if (this._currentReleaseNotes) {
                    this._currentReleaseNotes.webview.setHtml(html);
                }
            });
            _configurationService.onDidChangeConfiguration(this.onDidChangeConfiguration, this, this.disposables);
            _webviewWorkbenchService.onDidChangeActiveWebviewEditor(this.onDidChangeActiveWebviewEditor, this, this.disposables);
        }
        async show(version) {
            const releaseNoteText = await this.loadReleaseNotes(version);
            this._lastText = releaseNoteText;
            const html = await this.renderBody(releaseNoteText);
            const title = nls.localize('releaseNotesInputName', "Release Notes: {0}", version);
            const activeEditorPane = this._editorService.activeEditorPane;
            if (this._currentReleaseNotes) {
                this._currentReleaseNotes.setName(title);
                this._currentReleaseNotes.webview.setHtml(html);
                this._webviewWorkbenchService.revealWebview(this._currentReleaseNotes, activeEditorPane ? activeEditorPane.group : this._editorGroupService.activeGroup, false);
            }
            else {
                this._currentReleaseNotes = this._webviewWorkbenchService.openWebview({
                    title,
                    options: {
                        tryRestoreScrollPosition: true,
                        enableFindWidget: true,
                        disableServiceWorker: true,
                    },
                    contentOptions: {
                        localResourceRoots: [],
                        allowScripts: true
                    },
                    extension: undefined
                }, 'releaseNotes', title, { group: editorService_1.ACTIVE_GROUP, preserveFocus: false });
                this._currentReleaseNotes.webview.onDidClickLink(uri => this.onDidClickLink(uri_1.URI.parse(uri)));
                const disposables = new lifecycle_1.DisposableStore();
                disposables.add(this._currentReleaseNotes.webview.onMessage(e => {
                    if (e.message.type === 'showReleaseNotes') {
                        this._configurationService.updateValue('update.showReleaseNotes', e.message.value);
                    }
                }));
                disposables.add(this._currentReleaseNotes.onWillDispose(() => {
                    disposables.dispose();
                    this._currentReleaseNotes = undefined;
                }));
                this._currentReleaseNotes.webview.setHtml(html);
            }
            return true;
        }
        async loadReleaseNotes(version) {
            const match = /^(\d+\.\d+)\./.exec(version);
            if (!match) {
                throw new Error('not found');
            }
            const versionLabel = match[1].replace(/\./g, '_');
            const baseUrl = 'https://code.visualstudio.com/raw';
            const url = `${baseUrl}/v${versionLabel}.md`;
            const unassigned = nls.localize('unassigned', "unassigned");
            const escapeMdHtml = (text) => {
                return (0, strings_1.escape)(text).replace(/\\/g, '\\\\');
            };
            const patchKeybindings = (text) => {
                const kb = (match, kb) => {
                    const keybinding = this._keybindingService.lookupKeybinding(kb);
                    if (!keybinding) {
                        return unassigned;
                    }
                    return keybinding.getLabel() || unassigned;
                };
                const kbstyle = (match, kb) => {
                    const keybinding = keybindingParser_1.KeybindingParser.parseKeybinding(kb);
                    if (!keybinding) {
                        return unassigned;
                    }
                    const resolvedKeybindings = this._keybindingService.resolveKeybinding(keybinding);
                    if (resolvedKeybindings.length === 0) {
                        return unassigned;
                    }
                    return resolvedKeybindings[0].getLabel() || unassigned;
                };
                const kbCode = (match, binding) => {
                    const resolved = kb(match, binding);
                    return resolved ? `<code title="${binding}">${escapeMdHtml(resolved)}</code>` : resolved;
                };
                const kbstyleCode = (match, binding) => {
                    const resolved = kbstyle(match, binding);
                    return resolved ? `<code title="${binding}">${escapeMdHtml(resolved)}</code>` : resolved;
                };
                return text
                    .replace(/`kb\(([a-z.\d\-]+)\)`/gi, kbCode)
                    .replace(/`kbstyle\(([^\)]+)\)`/gi, kbstyleCode)
                    .replace(/kb\(([a-z.\d\-]+)\)/gi, (match, binding) => (0, htmlContent_1.escapeMarkdownSyntaxTokens)(kb(match, binding)))
                    .replace(/kbstyle\(([^\)]+)\)/gi, (match, binding) => (0, htmlContent_1.escapeMarkdownSyntaxTokens)(kbstyle(match, binding)));
            };
            const fetchReleaseNotes = async () => {
                let text;
                try {
                    text = await (0, request_1.asTextOrError)(await this._requestService.request({ url }, cancellation_1.CancellationToken.None));
                }
                catch {
                    throw new Error('Failed to fetch release notes');
                }
                if (!text || !/^#\s/.test(text)) { // release notes always starts with `#` followed by whitespace
                    throw new Error('Invalid release notes');
                }
                return patchKeybindings(text);
            };
            if (!this._releaseNotesCache.has(version)) {
                this._releaseNotesCache.set(version, (async () => {
                    try {
                        return await fetchReleaseNotes();
                    }
                    catch (err) {
                        this._releaseNotesCache.delete(version);
                        throw err;
                    }
                })());
            }
            return this._releaseNotesCache.get(version);
        }
        onDidClickLink(uri) {
            this.addGAParameters(uri, 'ReleaseNotes')
                .then(updated => this._openerService.open(updated))
                .then(undefined, errors_1.onUnexpectedError);
        }
        async addGAParameters(uri, origin, experiment = '1') {
            if ((0, telemetryUtils_1.supportsTelemetry)(this._productService, this._environmentService) && (0, telemetryUtils_1.getTelemetryLevel)(this._configurationService) === 3 /* TelemetryLevel.USAGE */) {
                if (uri.scheme === 'https' && uri.authority === 'code.visualstudio.com') {
                    return uri.with({ query: `${uri.query ? uri.query + '&' : ''}utm_source=VsCode&utm_medium=${encodeURIComponent(origin)}&utm_content=${encodeURIComponent(experiment)}` });
                }
            }
            return uri;
        }
        async renderBody(text) {
            const nonce = (0, uuid_1.generateUuid)();
            const content = await (0, markdownDocumentRenderer_1.renderMarkdownDocument)(text, this._extensionService, this._languageService, false);
            const colorMap = languages_1.TokenizationRegistry.getColorMap();
            const css = colorMap ? (0, tokenization_1.generateTokensCSSForColorMap)(colorMap) : '';
            const showReleaseNotes = Boolean(this._configurationService.getValue('update.showReleaseNotes'));
            return `<!DOCTYPE html>
		<html>
			<head>
				<base href="https://code.visualstudio.com/raw/">
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; style-src 'nonce-${nonce}' https://code.visualstudio.com; script-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${markdownDocumentRenderer_1.DEFAULT_MARKDOWN_STYLES}
					${css}
					header { display: flex; align-items: center; padding-top: 1em; }
				</style>
			</head>
			<body>
				${content}
				<script nonce="${nonce}">
					const vscode = acquireVsCodeApi();
					const container = document.createElement('p');
					container.style.display = 'flex';
					container.style.alignItems = 'center';

					const input = document.createElement('input');
					input.type = 'checkbox';
					input.id = 'showReleaseNotes';
					input.checked = ${showReleaseNotes};
					container.appendChild(input);

					const label = document.createElement('label');
					label.htmlFor = 'showReleaseNotes';
					label.textContent = '${nls.localize('showOnUpdate', "Show release notes after an update")}';
					container.appendChild(label);

					const beforeElement = document.querySelector("body > h1")?.nextElementSibling;
					if (beforeElement) {
						document.body.insertBefore(container, beforeElement);
					} else {
						document.body.appendChild(container);
					}

					window.addEventListener('message', event => {
						if (event.data.type === 'showReleaseNotes') {
							input.checked = event.data.value;
						}
					});

					input.addEventListener('change', event => {
						vscode.postMessage({ type: 'showReleaseNotes', value: input.checked }, '*');
					});
				</script>
			</body>
		</html>`;
        }
        onDidChangeConfiguration(e) {
            if (e.affectsConfiguration('update.showReleaseNotes')) {
                this.updateWebview();
            }
        }
        onDidChangeActiveWebviewEditor(input) {
            if (input && input === this._currentReleaseNotes) {
                this.updateWebview();
            }
        }
        updateWebview() {
            if (this._currentReleaseNotes) {
                this._currentReleaseNotes.webview.postMessage({
                    type: 'showReleaseNotes',
                    value: this._configurationService.getValue('update.showReleaseNotes')
                });
            }
        }
    };
    exports.ReleaseNotesManager = ReleaseNotesManager;
    exports.ReleaseNotesManager = ReleaseNotesManager = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, keybinding_1.IKeybindingService),
        __param(2, language_1.ILanguageService),
        __param(3, opener_1.IOpenerService),
        __param(4, request_1.IRequestService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, editorService_1.IEditorService),
        __param(7, editorGroupsService_1.IEditorGroupsService),
        __param(8, webviewWorkbenchService_1.IWebviewWorkbenchService),
        __param(9, extensions_1.IExtensionService),
        __param(10, productService_1.IProductService)
    ], ReleaseNotesManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZU5vdGVzRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi91cGRhdGUvYnJvd3Nlci9yZWxlYXNlTm90ZXNFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOEJ6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFtQjtRQVEvQixZQUNzQixtQkFBeUQsRUFDMUQsa0JBQXVELEVBQ3pELGdCQUFtRCxFQUNyRCxjQUErQyxFQUM5QyxlQUFpRCxFQUMzQyxxQkFBNkQsRUFDcEUsY0FBK0MsRUFDekMsbUJBQTBELEVBQ3RELHdCQUFtRSxFQUMxRSxpQkFBcUQsRUFDdkQsZUFBaUQ7WUFWNUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUN6Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3hDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDcEMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzdCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUMxQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ25ELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUN4Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQ3JDLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDekQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUN0QyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFqQmxELHVCQUFrQixHQUFHLElBQUksR0FBRyxFQUEyQixDQUFDO1lBRWpFLHlCQUFvQixHQUE2QixTQUFTLENBQUM7WUFFbEQsZ0JBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQWVwRCxnQ0FBb0IsQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQzNDLElB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