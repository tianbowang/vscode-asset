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
define(["require", "exports", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/touch", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput", "vs/platform/opener/common/opener", "vs/editor/common/services/textResourceConfiguration", "vs/editor/browser/widget/codeEditorWidget", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/nls", "vs/platform/storage/common/storage", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/base/common/types", "vs/platform/commands/common/commands", "vs/platform/theme/common/themeService", "vs/base/common/keybindingLabels", "vs/base/common/platform", "vs/base/common/objects", "vs/platform/notification/common/notification", "vs/base/browser/dom", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/welcomeWalkthrough/common/walkThroughUtils", "vs/css!./media/walkThroughPart"], function (require, exports, scrollableElement_1, touch_1, strings, uri_1, lifecycle_1, editorPane_1, telemetry_1, walkThroughInput_1, opener_1, textResourceConfiguration_1, codeEditorWidget_1, instantiation_1, keybinding_1, nls_1, storage_1, contextkey_1, configuration_1, types_1, commands_1, themeService_1, keybindingLabels_1, platform_1, objects_1, notification_1, dom_1, editorGroupsService_1, extensions_1) {
    "use strict";
    var WalkThroughPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WalkThroughPart = exports.WALK_THROUGH_FOCUS = void 0;
    exports.WALK_THROUGH_FOCUS = new contextkey_1.RawContextKey('interactivePlaygroundFocus', false);
    const UNBOUND_COMMAND = (0, nls_1.localize)('walkThrough.unboundCommand', "unbound");
    const WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'walkThroughEditorViewState';
    let WalkThroughPart = class WalkThroughPart extends editorPane_1.EditorPane {
        static { WalkThroughPart_1 = this; }
        static { this.ID = 'workbench.editor.walkThroughPart'; }
        constructor(telemetryService, themeService, textResourceConfigurationService, instantiationService, openerService, keybindingService, storageService, contextKeyService, configurationService, notificationService, extensionService, editorGroupService) {
            super(WalkThroughPart_1.ID, telemetryService, themeService, storageService);
            this.instantiationService = instantiationService;
            this.openerService = openerService;
            this.keybindingService = keybindingService;
            this.contextKeyService = contextKeyService;
            this.configurationService = configurationService;
            this.notificationService = notificationService;
            this.extensionService = extensionService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.contentDisposables = [];
            this.editorFocus = exports.WALK_THROUGH_FOCUS.bindTo(this.contextKeyService);
            this.editorMemento = this.getEditorMemento(editorGroupService, textResourceConfigurationService, WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY);
        }
        createEditor(container) {
            this.content = document.createElement('div');
            this.content.classList.add('welcomePageFocusElement');
            this.content.tabIndex = 0;
            this.content.style.outlineStyle = 'none';
            this.scrollbar = new scrollableElement_1.DomScrollableElement(this.content, {
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                vertical: 1 /* ScrollbarVisibility.Auto */
            });
            this.disposables.add(this.scrollbar);
            container.appendChild(this.scrollbar.getDomNode());
            this.registerFocusHandlers();
            this.registerClickHandler();
            this.disposables.add(this.scrollbar.onScroll(e => this.updatedScrollPosition()));
        }
        updatedScrollPosition() {
            const scrollDimensions = this.scrollbar.getScrollDimensions();
            const scrollPosition = this.scrollbar.getScrollPosition();
            const scrollHeight = scrollDimensions.scrollHeight;
            if (scrollHeight && this.input instanceof walkThroughInput_1.WalkThroughInput) {
                const scrollTop = scrollPosition.scrollTop;
                const height = scrollDimensions.height;
                this.input.relativeScrollPosition(scrollTop / scrollHeight, (scrollTop + height) / scrollHeight);
            }
        }
        onTouchChange(event) {
            event.preventDefault();
            event.stopPropagation();
            const scrollPosition = this.scrollbar.getScrollPosition();
            this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop - event.translationY });
        }
        addEventListener(element, type, listener, useCapture) {
            element.addEventListener(type, listener, useCapture);
            return (0, lifecycle_1.toDisposable)(() => { element.removeEventListener(type, listener, useCapture); });
        }
        registerFocusHandlers() {
            this.disposables.add(this.addEventListener(this.content, 'mousedown', e => {
                this.focus();
            }));
            this.disposables.add(this.addEventListener(this.content, 'focus', e => {
                this.editorFocus.set(true);
            }));
            this.disposables.add(this.addEventListener(this.content, 'blur', e => {
                this.editorFocus.reset();
            }));
            this.disposables.add(this.addEventListener(this.content, 'focusin', (e) => {
                // Work around scrolling as side-effect of setting focus on the offscreen zone widget (#18929)
                if (e.target instanceof HTMLElement && e.target.classList.contains('zone-widget-container')) {
                    const scrollPosition = this.scrollbar.getScrollPosition();
                    this.content.scrollTop = scrollPosition.scrollTop;
                    this.content.scrollLeft = scrollPosition.scrollLeft;
                }
                if (e.target instanceof HTMLElement) {
                    this.lastFocus = e.target;
                }
            }));
        }
        registerClickHandler() {
            this.content.addEventListener('click', event => {
                for (let node = event.target; node; node = node.parentNode) {
                    if (node instanceof HTMLAnchorElement && node.href) {
                        const baseElement = node.ownerDocument.getElementsByTagName('base')[0] || (0, dom_1.getWindow)(node).location;
                        if (baseElement && node.href.indexOf(baseElement.href) >= 0 && node.hash) {
                            const scrollTarget = this.content.querySelector(node.hash);
                            const innerContent = this.content.firstElementChild;
                            if (scrollTarget && innerContent) {
                                const targetTop = scrollTarget.getBoundingClientRect().top - 20;
                                const containerTop = innerContent.getBoundingClientRect().top;
                                this.scrollbar.setScrollPosition({ scrollTop: targetTop - containerTop });
                            }
                        }
                        else {
                            this.open(uri_1.URI.parse(node.href));
                        }
                        event.preventDefault();
                        break;
                    }
                    else if (node instanceof HTMLButtonElement) {
                        const href = node.getAttribute('data-href');
                        if (href) {
                            this.open(uri_1.URI.parse(href));
                        }
                        break;
                    }
                    else if (node === event.currentTarget) {
                        break;
                    }
                }
            });
        }
        open(uri) {
            if (uri.scheme === 'command' && uri.path === 'git.clone' && !commands_1.CommandsRegistry.getCommand('git.clone')) {
                this.notificationService.info((0, nls_1.localize)('walkThrough.gitNotFound', "It looks like Git is not installed on your system."));
                return;
            }
            this.openerService.open(this.addFrom(uri), { allowCommands: true });
        }
        addFrom(uri) {
            if (uri.scheme !== 'command' || !(this.input instanceof walkThroughInput_1.WalkThroughInput)) {
                return uri;
            }
            const query = uri.query ? JSON.parse(uri.query) : {};
            query.from = this.input.getTelemetryFrom();
            return uri.with({ query: JSON.stringify(query) });
        }
        layout(dimension) {
            this.size = dimension;
            (0, dom_1.size)(this.content, dimension.width, dimension.height);
            this.updateSizeClasses();
            this.contentDisposables.forEach(disposable => {
                if (disposable instanceof codeEditorWidget_1.CodeEditorWidget) {
                    disposable.layout();
                }
            });
            const walkthroughInput = this.input instanceof walkThroughInput_1.WalkThroughInput && this.input;
            if (walkthroughInput && walkthroughInput.layout) {
                walkthroughInput.layout(dimension);
            }
            this.scrollbar.scanDomNode();
        }
        updateSizeClasses() {
            const innerContent = this.content.firstElementChild;
            if (this.size && innerContent) {
                innerContent.classList.toggle('max-height-685px', this.size.height <= 685);
            }
        }
        focus() {
            super.focus();
            let active = this.content.ownerDocument.activeElement;
            while (active && active !== this.content) {
                active = active.parentElement;
            }
            if (!active) {
                (this.lastFocus || this.content).focus();
            }
            this.editorFocus.set(true);
        }
        arrowUp() {
            const scrollPosition = this.scrollbar.getScrollPosition();
            this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop - this.getArrowScrollHeight() });
        }
        arrowDown() {
            const scrollPosition = this.scrollbar.getScrollPosition();
            this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop + this.getArrowScrollHeight() });
        }
        getArrowScrollHeight() {
            let fontSize = this.configurationService.getValue('editor.fontSize');
            if (typeof fontSize !== 'number' || fontSize < 1) {
                fontSize = 12;
            }
            return 3 * fontSize;
        }
        pageUp() {
            const scrollDimensions = this.scrollbar.getScrollDimensions();
            const scrollPosition = this.scrollbar.getScrollPosition();
            this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop - scrollDimensions.height });
        }
        pageDown() {
            const scrollDimensions = this.scrollbar.getScrollDimensions();
            const scrollPosition = this.scrollbar.getScrollPosition();
            this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop + scrollDimensions.height });
        }
        setInput(input, options, context, token) {
            const store = new lifecycle_1.DisposableStore();
            this.contentDisposables.push(store);
            this.content.innerText = '';
            return super.setInput(input, options, context, token)
                .then(async () => {
                if (input.resource.path.endsWith('.md')) {
                    await this.extensionService.whenInstalledExtensionsRegistered();
                }
                return input.resolve();
            })
                .then(model => {
                if (token.isCancellationRequested) {
                    return;
                }
                const content = model.main;
                if (!input.resource.path.endsWith('.md')) {
                    (0, dom_1.safeInnerHtml)(this.content, content);
                    this.updateSizeClasses();
                    this.decorateContent();
                    this.contentDisposables.push(this.keybindingService.onDidUpdateKeybindings(() => this.decorateContent()));
                    input.onReady?.(this.content.firstElementChild, store);
                    this.scrollbar.scanDomNode();
                    this.loadTextEditorViewState(input);
                    this.updatedScrollPosition();
                    return;
                }
                const innerContent = document.createElement('div');
                innerContent.classList.add('walkThroughContent'); // only for markdown files
                const markdown = this.expandMacros(content);
                (0, dom_1.safeInnerHtml)(innerContent, markdown);
                this.content.appendChild(innerContent);
                model.snippets.forEach((snippet, i) => {
                    const model = snippet.textEditorModel;
                    if (!model) {
                        return;
                    }
                    const id = `snippet-${model.uri.fragment}`;
                    const div = innerContent.querySelector(`#${id.replace(/[\\.]/g, '\\$&')}`);
                    const options = this.getEditorOptions(model.getLanguageId());
                    const telemetryData = {
                        target: this.input instanceof walkThroughInput_1.WalkThroughInput ? this.input.getTelemetryFrom() : undefined,
                        snippet: i
                    };
                    const editor = this.instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, div, options, {
                        telemetryData: telemetryData
                    });
                    editor.setModel(model);
                    this.contentDisposables.push(editor);
                    const updateHeight = (initial) => {
                        const lineHeight = editor.getOption(66 /* EditorOption.lineHeight */);
                        const height = `${Math.max(model.getLineCount() + 1, 4) * lineHeight}px`;
                        if (div.style.height !== height) {
                            div.style.height = height;
                            editor.layout();
                            if (!initial) {
                                this.scrollbar.scanDomNode();
                            }
                        }
                    };
                    updateHeight(true);
                    this.contentDisposables.push(editor.onDidChangeModelContent(() => updateHeight(false)));
                    this.contentDisposables.push(editor.onDidChangeCursorPosition(e => {
                        const innerContent = this.content.firstElementChild;
                        if (innerContent) {
                            const targetTop = div.getBoundingClientRect().top;
                            const containerTop = innerContent.getBoundingClientRect().top;
                            const lineHeight = editor.getOption(66 /* EditorOption.lineHeight */);
                            const lineTop = (targetTop + (e.position.lineNumber - 1) * lineHeight) - containerTop;
                            const lineBottom = lineTop + lineHeight;
                            const scrollDimensions = this.scrollbar.getScrollDimensions();
                            const scrollPosition = this.scrollbar.getScrollPosition();
                            const scrollTop = scrollPosition.scrollTop;
                            const height = scrollDimensions.height;
                            if (scrollTop > lineTop) {
                                this.scrollbar.setScrollPosition({ scrollTop: lineTop });
                            }
                            else if (scrollTop < lineBottom - height) {
                                this.scrollbar.setScrollPosition({ scrollTop: lineBottom - height });
                            }
                        }
                    }));
                    this.contentDisposables.push(this.configurationService.onDidChangeConfiguration(e => {
                        if (e.affectsConfiguration('editor') && snippet.textEditorModel) {
                            editor.updateOptions(this.getEditorOptions(snippet.textEditorModel.getLanguageId()));
                        }
                    }));
                });
                this.updateSizeClasses();
                this.multiCursorModifier();
                this.contentDisposables.push(this.configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration('editor.multiCursorModifier')) {
                        this.multiCursorModifier();
                    }
                }));
                input.onReady?.(innerContent, store);
                this.scrollbar.scanDomNode();
                this.loadTextEditorViewState(input);
                this.updatedScrollPosition();
                this.contentDisposables.push(touch_1.Gesture.addTarget(innerContent));
                this.contentDisposables.push((0, dom_1.addDisposableListener)(innerContent, touch_1.EventType.Change, e => this.onTouchChange(e)));
            });
        }
        getEditorOptions(language) {
            const config = (0, objects_1.deepClone)(this.configurationService.getValue('editor', { overrideIdentifier: language }));
            return {
                ...(0, types_1.isObject)(config) ? config : Object.create(null),
                scrollBeyondLastLine: false,
                scrollbar: {
                    verticalScrollbarSize: 14,
                    horizontal: 'auto',
                    useShadows: true,
                    verticalHasArrows: false,
                    horizontalHasArrows: false,
                    alwaysConsumeMouseWheel: false
                },
                overviewRulerLanes: 3,
                fixedOverflowWidgets: false,
                lineNumbersMinChars: 1,
                minimap: { enabled: false },
            };
        }
        expandMacros(input) {
            return input.replace(/kb\(([a-z.\d\-]+)\)/gi, (match, kb) => {
                const keybinding = this.keybindingService.lookupKeybinding(kb);
                const shortcut = keybinding ? keybinding.getLabel() || '' : UNBOUND_COMMAND;
                return `<span class="shortcut">${strings.escape(shortcut)}</span>`;
            });
        }
        decorateContent() {
            const keys = this.content.querySelectorAll('.shortcut[data-command]');
            Array.prototype.forEach.call(keys, (key) => {
                const command = key.getAttribute('data-command');
                const keybinding = command && this.keybindingService.lookupKeybinding(command);
                const label = keybinding ? keybinding.getLabel() || '' : UNBOUND_COMMAND;
                while (key.firstChild) {
                    key.removeChild(key.firstChild);
                }
                key.appendChild(document.createTextNode(label));
            });
            const ifkeys = this.content.querySelectorAll('.if_shortcut[data-command]');
            Array.prototype.forEach.call(ifkeys, (key) => {
                const command = key.getAttribute('data-command');
                const keybinding = command && this.keybindingService.lookupKeybinding(command);
                key.style.display = !keybinding ? 'none' : '';
            });
        }
        multiCursorModifier() {
            const labels = keybindingLabels_1.UILabelProvider.modifierLabels[platform_1.OS];
            const value = this.configurationService.getValue('editor.multiCursorModifier');
            const modifier = labels[value === 'ctrlCmd' ? (platform_1.OS === 2 /* OperatingSystem.Macintosh */ ? 'metaKey' : 'ctrlKey') : 'altKey'];
            const keys = this.content.querySelectorAll('.multi-cursor-modifier');
            Array.prototype.forEach.call(keys, (key) => {
                while (key.firstChild) {
                    key.removeChild(key.firstChild);
                }
                key.appendChild(document.createTextNode(modifier));
            });
        }
        saveTextEditorViewState(input) {
            const scrollPosition = this.scrollbar.getScrollPosition();
            if (this.group) {
                this.editorMemento.saveEditorState(this.group, input, {
                    viewState: {
                        scrollTop: scrollPosition.scrollTop,
                        scrollLeft: scrollPosition.scrollLeft
                    }
                });
            }
        }
        loadTextEditorViewState(input) {
            if (this.group) {
                const state = this.editorMemento.loadEditorState(this.group, input);
                if (state) {
                    this.scrollbar.setScrollPosition(state.viewState);
                }
            }
        }
        clearInput() {
            if (this.input instanceof walkThroughInput_1.WalkThroughInput) {
                this.saveTextEditorViewState(this.input);
            }
            this.contentDisposables = (0, lifecycle_1.dispose)(this.contentDisposables);
            super.clearInput();
        }
        saveState() {
            if (this.input instanceof walkThroughInput_1.WalkThroughInput) {
                this.saveTextEditorViewState(this.input);
            }
            super.saveState();
        }
        dispose() {
            this.editorFocus.reset();
            this.contentDisposables = (0, lifecycle_1.dispose)(this.contentDisposables);
            this.disposables.dispose();
            super.dispose();
        }
    };
    exports.WalkThroughPart = WalkThroughPart;
    exports.WalkThroughPart = WalkThroughPart = WalkThroughPart_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, opener_1.IOpenerService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, storage_1.IStorageService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, notification_1.INotificationService),
        __param(10, extensions_1.IExtensionService),
        __param(11, editorGroupsService_1.IEditorGroupsService)
    ], WalkThroughPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Fsa1Rocm91Z2hQYXJ0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWxjb21lV2Fsa3Rocm91Z2gvYnJvd3Nlci93YWxrVGhyb3VnaFBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXFDbkYsUUFBQSxrQkFBa0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFbEcsTUFBTSxlQUFlLEdBQUcsSUFBQSxjQUFRLEVBQUMsNEJBQTRCLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDMUUsTUFBTSw2Q0FBNkMsR0FBRyw0QkFBNEIsQ0FBQztJQVc1RSxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFnQixTQUFRLHVCQUFVOztpQkFFOUIsT0FBRSxHQUFXLGtDQUFrQyxBQUE3QyxDQUE4QztRQVdoRSxZQUNvQixnQkFBbUMsRUFDdkMsWUFBMkIsRUFDUCxnQ0FBbUUsRUFDL0Usb0JBQTRELEVBQ25FLGFBQThDLEVBQzFDLGlCQUFzRCxFQUN6RCxjQUErQixFQUM1QixpQkFBc0QsRUFDbkQsb0JBQTRELEVBQzdELG1CQUEwRCxFQUM3RCxnQkFBb0QsRUFDakQsa0JBQXdDO1lBRTlELEtBQUssQ0FBQyxpQkFBZSxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFWbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNsRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDekIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUVyQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDNUMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUM1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