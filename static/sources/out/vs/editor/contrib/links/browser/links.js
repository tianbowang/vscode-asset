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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/stopwatch", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/editor/common/model/textModel", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture", "vs/editor/contrib/links/browser/getLinks", "vs/nls", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/css!./links"], function (require, exports, async_1, cancellation_1, errors_1, htmlContent_1, lifecycle_1, network_1, platform, resources, stopwatch_1, uri_1, editorExtensions_1, textModel_1, languageFeatureDebounce_1, languageFeatures_1, clickLinkGesture_1, getLinks_1, nls, notification_1, opener_1) {
    "use strict";
    var LinkDetector_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinkDetector = void 0;
    let LinkDetector = class LinkDetector extends lifecycle_1.Disposable {
        static { LinkDetector_1 = this; }
        static { this.ID = 'editor.linkDetector'; }
        static get(editor) {
            return editor.getContribution(LinkDetector_1.ID);
        }
        constructor(editor, openerService, notificationService, languageFeaturesService, languageFeatureDebounceService) {
            super();
            this.editor = editor;
            this.openerService = openerService;
            this.notificationService = notificationService;
            this.languageFeaturesService = languageFeaturesService;
            this.providers = this.languageFeaturesService.linkProvider;
            this.debounceInformation = languageFeatureDebounceService.for(this.providers, 'Links', { min: 1000, max: 4000 });
            this.computeLinks = this._register(new async_1.RunOnceScheduler(() => this.computeLinksNow(), 1000));
            this.computePromise = null;
            this.activeLinksList = null;
            this.currentOccurrences = {};
            this.activeLinkDecorationId = null;
            const clickLinkGesture = this._register(new clickLinkGesture_1.ClickLinkGesture(editor));
            this._register(clickLinkGesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, keyboardEvent]) => {
                this._onEditorMouseMove(mouseEvent, keyboardEvent);
            }));
            this._register(clickLinkGesture.onExecute((e) => {
                this.onEditorMouseUp(e);
            }));
            this._register(clickLinkGesture.onCancel((e) => {
                this.cleanUpActiveLinkDecoration();
            }));
            this._register(editor.onDidChangeConfiguration((e) => {
                if (!e.hasChanged(70 /* EditorOption.links */)) {
                    return;
                }
                // Remove any links (for the getting disabled case)
                this.updateDecorations([]);
                // Stop any computation (for the getting disabled case)
                this.stop();
                // Start computing (for the getting enabled case)
                this.computeLinks.schedule(0);
            }));
            this._register(editor.onDidChangeModelContent((e) => {
                if (!this.editor.hasModel()) {
                    return;
                }
                this.computeLinks.schedule(this.debounceInformation.get(this.editor.getModel()));
            }));
            this._register(editor.onDidChangeModel((e) => {
                this.currentOccurrences = {};
                this.activeLinkDecorationId = null;
                this.stop();
                this.computeLinks.schedule(0);
            }));
            this._register(editor.onDidChangeModelLanguage((e) => {
                this.stop();
                this.computeLinks.schedule(0);
            }));
            this._register(this.providers.onDidChange((e) => {
                this.stop();
                this.computeLinks.schedule(0);
            }));
            this.computeLinks.schedule(0);
        }
        async computeLinksNow() {
            if (!this.editor.hasModel() || !this.editor.getOption(70 /* EditorOption.links */)) {
                return;
            }
            const model = this.editor.getModel();
            if (model.isTooLargeForSyncing()) {
                return;
            }
            if (!this.providers.has(model)) {
                return;
            }
            if (this.activeLinksList) {
                this.activeLinksList.dispose();
                this.activeLinksList = null;
            }
            this.computePromise = (0, async_1.createCancelablePromise)(token => (0, getLinks_1.getLinks)(this.providers, model, token));
            try {
                const sw = new stopwatch_1.StopWatch(false);
                this.activeLinksList = await this.computePromise;
                this.debounceInformation.update(model, sw.elapsed());
                if (model.isDisposed()) {
                    return;
                }
                this.updateDecorations(this.activeLinksList.links);
            }
            catch (err) {
                (0, errors_1.onUnexpectedError)(err);
            }
            finally {
                this.computePromise = null;
            }
        }
        updateDecorations(links) {
            const useMetaKey = (this.editor.getOption(77 /* EditorOption.multiCursorModifier */) === 'altKey');
            const oldDecorations = [];
            const keys = Object.keys(this.currentOccurrences);
            for (const decorationId of keys) {
                const occurence = this.currentOccurrences[decorationId];
                oldDecorations.push(occurence.decorationId);
            }
            const newDecorations = [];
            if (links) {
                // Not sure why this is sometimes null
                for (const link of links) {
                    newDecorations.push(LinkOccurrence.decoration(link, useMetaKey));
                }
            }
            this.editor.changeDecorations((changeAccessor) => {
                const decorations = changeAccessor.deltaDecorations(oldDecorations, newDecorations);
                this.currentOccurrences = {};
                this.activeLinkDecorationId = null;
                for (let i = 0, len = decorations.length; i < len; i++) {
                    const occurence = new LinkOccurrence(links[i], decorations[i]);
                    this.currentOccurrences[occurence.decorationId] = occurence;
                }
            });
        }
        _onEditorMouseMove(mouseEvent, withKey) {
            const useMetaKey = (this.editor.getOption(77 /* EditorOption.multiCursorModifier */) === 'altKey');
            if (this.isEnabled(mouseEvent, withKey)) {
                this.cleanUpActiveLinkDecoration(); // always remove previous link decoration as their can only be one
                const occurrence = this.getLinkOccurrence(mouseEvent.target.position);
                if (occurrence) {
                    this.editor.changeDecorations((changeAccessor) => {
                        occurrence.activate(changeAccessor, useMetaKey);
                        this.activeLinkDecorationId = occurrence.decorationId;
                    });
                }
            }
            else {
                this.cleanUpActiveLinkDecoration();
            }
        }
        cleanUpActiveLinkDecoration() {
            const useMetaKey = (this.editor.getOption(77 /* EditorOption.multiCursorModifier */) === 'altKey');
            if (this.activeLinkDecorationId) {
                const occurrence = this.currentOccurrences[this.activeLinkDecorationId];
                if (occurrence) {
                    this.editor.changeDecorations((changeAccessor) => {
                        occurrence.deactivate(changeAccessor, useMetaKey);
                    });
                }
                this.activeLinkDecorationId = null;
            }
        }
        onEditorMouseUp(mouseEvent) {
            if (!this.isEnabled(mouseEvent)) {
                return;
            }
            const occurrence = this.getLinkOccurrence(mouseEvent.target.position);
            if (!occurrence) {
                return;
            }
            this.openLinkOccurrence(occurrence, mouseEvent.hasSideBySideModifier, true /* from user gesture */);
        }
        openLinkOccurrence(occurrence, openToSide, fromUserGesture = false) {
            if (!this.openerService) {
                return;
            }
            const { link } = occurrence;
            link.resolve(cancellation_1.CancellationToken.None).then(uri => {
                // Support for relative file URIs of the shape file://./relativeFile.txt or file:///./relativeFile.txt
                if (typeof uri === 'string' && this.editor.hasModel()) {
                    const modelUri = this.editor.getModel().uri;
                    if (modelUri.scheme === network_1.Schemas.file && uri.startsWith(`${network_1.Schemas.file}:`)) {
                        const parsedUri = uri_1.URI.parse(uri);
                        if (parsedUri.scheme === network_1.Schemas.file) {
                            const fsPath = resources.originalFSPath(parsedUri);
                            let relativePath = null;
                            if (fsPath.startsWith('/./')) {
                                relativePath = `.${fsPath.substr(1)}`;
                            }
                            else if (fsPath.startsWith('//./')) {
                                relativePath = `.${fsPath.substr(2)}`;
                            }
                            if (relativePath) {
                                uri = resources.joinPath(modelUri, relativePath);
                            }
                        }
                    }
                }
                return this.openerService.open(uri, { openToSide, fromUserGesture, allowContributedOpeners: true, allowCommands: true, fromWorkspace: true });
            }, err => {
                const messageOrError = err instanceof Error ? err.message : err;
                // different error cases
                if (messageOrError === 'invalid') {
                    this.notificationService.warn(nls.localize('invalid.url', 'Failed to open this link because it is not well-formed: {0}', link.url.toString()));
                }
                else if (messageOrError === 'missing') {
                    this.notificationService.warn(nls.localize('missing.url', 'Failed to open this link because its target is missing.'));
                }
                else {
                    (0, errors_1.onUnexpectedError)(err);
                }
            });
        }
        getLinkOccurrence(position) {
            if (!this.editor.hasModel() || !position) {
                return null;
            }
            const decorations = this.editor.getModel().getDecorationsInRange({
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            }, 0, true);
            for (const decoration of decorations) {
                const currentOccurrence = this.currentOccurrences[decoration.id];
                if (currentOccurrence) {
                    return currentOccurrence;
                }
            }
            return null;
        }
        isEnabled(mouseEvent, withKey) {
            return Boolean((mouseEvent.target.type === 6 /* MouseTargetType.CONTENT_TEXT */)
                && (mouseEvent.hasTriggerModifier || (withKey && withKey.keyCodeIsTriggerKey)));
        }
        stop() {
            this.computeLinks.cancel();
            if (this.activeLinksList) {
                this.activeLinksList?.dispose();
                this.activeLinksList = null;
            }
            if (this.computePromise) {
                this.computePromise.cancel();
                this.computePromise = null;
            }
        }
        dispose() {
            super.dispose();
            this.stop();
        }
    };
    exports.LinkDetector = LinkDetector;
    exports.LinkDetector = LinkDetector = LinkDetector_1 = __decorate([
        __param(1, opener_1.IOpenerService),
        __param(2, notification_1.INotificationService),
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, languageFeatureDebounce_1.ILanguageFeatureDebounceService)
    ], LinkDetector);
    const decoration = {
        general: textModel_1.ModelDecorationOptions.register({
            description: 'detected-link',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            collapseOnReplaceEdit: true,
            inlineClassName: 'detected-link'
        }),
        active: textModel_1.ModelDecorationOptions.register({
            description: 'detected-link-active',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            collapseOnReplaceEdit: true,
            inlineClassName: 'detected-link-active'
        })
    };
    class LinkOccurrence {
        static decoration(link, useMetaKey) {
            return {
                range: link.range,
                options: LinkOccurrence._getOptions(link, useMetaKey, false)
            };
        }
        static _getOptions(link, useMetaKey, isActive) {
            const options = { ...(isActive ? decoration.active : decoration.general) };
            options.hoverMessage = getHoverMessage(link, useMetaKey);
            return options;
        }
        constructor(link, decorationId) {
            this.link = link;
            this.decorationId = decorationId;
        }
        activate(changeAccessor, useMetaKey) {
            changeAccessor.changeDecorationOptions(this.decorationId, LinkOccurrence._getOptions(this.link, useMetaKey, true));
        }
        deactivate(changeAccessor, useMetaKey) {
            changeAccessor.changeDecorationOptions(this.decorationId, LinkOccurrence._getOptions(this.link, useMetaKey, false));
        }
    }
    function getHoverMessage(link, useMetaKey) {
        const executeCmd = link.url && /^command:/i.test(link.url.toString());
        const label = link.tooltip
            ? link.tooltip
            : executeCmd
                ? nls.localize('links.navigate.executeCmd', 'Execute command')
                : nls.localize('links.navigate.follow', 'Follow link');
        const kb = useMetaKey
            ? platform.isMacintosh
                ? nls.localize('links.navigate.kb.meta.mac', "cmd + click")
                : nls.localize('links.navigate.kb.meta', "ctrl + click")
            : platform.isMacintosh
                ? nls.localize('links.navigate.kb.alt.mac', "option + click")
                : nls.localize('links.navigate.kb.alt', "alt + click");
        if (link.url) {
            let nativeLabel = '';
            if (/^command:/i.test(link.url.toString())) {
                // Don't show complete command arguments in the native tooltip
                const match = link.url.toString().match(/^command:([^?#]+)/);
                if (match) {
                    const commandId = match[1];
                    nativeLabel = nls.localize('tooltip.explanation', "Execute command {0}", commandId);
                }
            }
            const hoverMessage = new htmlContent_1.MarkdownString('', true)
                .appendLink(link.url.toString(true).replace(/ /g, '%20'), label, nativeLabel)
                .appendMarkdown(` (${kb})`);
            return hoverMessage;
        }
        else {
            return new htmlContent_1.MarkdownString().appendText(`${label} (${kb})`);
        }
    }
    class OpenLinkAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.openLink',
                label: nls.localize('label', "Open Link"),
                alias: 'Open Link',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            const linkDetector = LinkDetector.get(editor);
            if (!linkDetector) {
                return;
            }
            if (!editor.hasModel()) {
                return;
            }
            const selections = editor.getSelections();
            for (const sel of selections) {
                const link = linkDetector.getLinkOccurrence(sel.getEndPosition());
                if (link) {
                    linkDetector.openLinkOccurrence(link, false);
                }
            }
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(LinkDetector.ID, LinkDetector, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.registerEditorAction)(OpenLinkAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2xpbmtzL2Jyb3dzZXIvbGlua3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQThCekYsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBYSxTQUFRLHNCQUFVOztpQkFFcEIsT0FBRSxHQUFXLHFCQUFxQixBQUFoQyxDQUFpQztRQUVuRCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQW1CO1lBQ3BDLE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBZSxjQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQVVELFlBQ2tCLE1BQW1CLEVBQ0gsYUFBNkIsRUFDdkIsbUJBQXlDLEVBQ3JDLHVCQUFpRCxFQUMzRCw4QkFBK0Q7WUFFaEcsS0FBSyxFQUFFLENBQUM7WUFOUyxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBQ0gsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ3ZCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDckMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUs1RixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUM7WUFDM0QsSUFBSSxDQUFDLG1CQUFtQixHQUFHLDhCQUE4QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDakgsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksd0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDN0Ys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