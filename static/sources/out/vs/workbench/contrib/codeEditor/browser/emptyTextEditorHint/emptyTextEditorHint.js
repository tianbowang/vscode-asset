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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/nls", "vs/workbench/browser/parts/editor/editorStatus", "vs/platform/commands/common/commands", "vs/editor/common/languages/modesRegistry", "vs/base/common/network", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/editor/browser/editorExtensions", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/formattedTextRenderer", "vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets", "vs/workbench/contrib/inlineChat/browser/inlineChatSessionService", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/platform/telemetry/common/telemetry", "vs/platform/product/common/productService", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/common/platform", "vs/base/browser/ui/aria/aria", "vs/platform/registry/common/platform", "vs/workbench/common/configuration", "vs/workbench/services/output/common/output", "vs/workbench/services/search/common/search", "vs/css!./emptyTextEditorHint"], function (require, exports, dom, lifecycle_1, nls_1, editorStatus_1, commands_1, modesRegistry_1, network_1, event_1, configuration_1, editorExtensions_1, keybinding_1, editorGroupsService_1, formattedTextRenderer_1, fileTemplateSnippets_1, inlineChatSessionService_1, inlineChat_1, telemetry_1, productService_1, keybindingLabel_1, platform_1, aria_1, platform_2, configuration_2, output_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmptyTextEditorHintContribution = exports.emptyTextEditorHintSetting = void 0;
    const $ = dom.$;
    // TODO@joyceerhl remove this after a few iterations
    platform_2.Registry.as(configuration_2.Extensions.ConfigurationMigration)
        .registerConfigurationMigrations([{
            key: 'workbench.editor.untitled.hint',
            migrateFn: (value, _accessor) => ([
                [exports.emptyTextEditorHintSetting, { value }],
                ['workbench.editor.untitled.hint', { value: undefined }]
            ])
        },
        {
            key: 'accessibility.verbosity.untitledHint',
            migrateFn: (value, _accessor) => ([
                ["accessibility.verbosity.emptyEditorHint" /* AccessibilityVerbositySettingId.EmptyEditorHint */, { value }],
                ['accessibility.verbosity.untitledHint', { value: undefined }]
            ])
        }]);
    exports.emptyTextEditorHintSetting = 'workbench.editor.empty.hint';
    let EmptyTextEditorHintContribution = class EmptyTextEditorHintContribution {
        static { this.ID = 'editor.contrib.emptyTextEditorHint'; }
        constructor(editor, editorGroupsService, commandService, configurationService, keybindingService, inlineChatSessionService, inlineChatService, telemetryService, productService) {
            this.editor = editor;
            this.editorGroupsService = editorGroupsService;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this.inlineChatSessionService = inlineChatSessionService;
            this.inlineChatService = inlineChatService;
            this.telemetryService = telemetryService;
            this.productService = productService;
            this.toDispose = [];
            this.toDispose.push(this.editor.onDidChangeModel(() => this.update()));
            this.toDispose.push(this.editor.onDidChangeModelLanguage(() => this.update()));
            this.toDispose.push(this.editor.onDidChangeModelContent(() => this.update()));
            this.toDispose.push(this.inlineChatService.onDidChangeProviders(() => this.update()));
            this.toDispose.push(this.editor.onDidChangeModelDecorations(() => this.update()));
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(exports.emptyTextEditorHintSetting)) {
                    this.update();
                }
            }));
            this.toDispose.push(inlineChatSessionService.onWillStartSession(editor => {
                if (this.editor === editor) {
                    this.textHintContentWidget?.dispose();
                }
            }));
            this.toDispose.push(inlineChatSessionService.onDidEndSession(e => {
                if (this.editor === e.editor) {
                    this.update();
                }
            }));
        }
        _getOptions() {
            return { clickable: true };
        }
        _shouldRenderHint() {
            const configValue = this.configurationService.getValue(exports.emptyTextEditorHintSetting);
            if (configValue === 'hidden') {
                return false;
            }
            if (this.editor.getOption(90 /* EditorOption.readOnly */)) {
                return false;
            }
            const model = this.editor.getModel();
            const languageId = model?.getLanguageId();
            if (!model || languageId === output_1.OUTPUT_MODE_ID || languageId === output_1.LOG_MODE_ID || languageId === search_1.SEARCH_RESULT_LANGUAGE_ID) {
                return false;
            }
            if (this.inlineChatSessionService.getSession(this.editor, model.uri)) {
                return false;
            }
            if (this.editor.getModel()?.getValueLength()) {
                return false;
            }
            const hasConflictingDecorations = Boolean(this.editor.getLineDecorations(1)?.find((d) => d.options.beforeContentClassName
                || d.options.afterContentClassName
                || d.options.before?.content
                || d.options.after?.content));
            if (hasConflictingDecorations) {
                return false;
            }
            const inlineChatProviders = [...this.inlineChatService.getAllProvider()];
            const shouldRenderDefaultHint = model?.uri.scheme === network_1.Schemas.untitled && languageId === modesRegistry_1.PLAINTEXT_LANGUAGE_ID && !inlineChatProviders.length;
            return inlineChatProviders.length > 0 || shouldRenderDefaultHint;
        }
        update() {
            const shouldRenderHint = this._shouldRenderHint();
            if (shouldRenderHint && !this.textHintContentWidget) {
                this.textHintContentWidget = new EmptyTextEditorHintContentWidget(this.editor, this._getOptions(), this.editorGroupsService, this.commandService, this.configurationService, this.keybindingService, this.inlineChatService, this.telemetryService, this.productService);
            }
            else if (!shouldRenderHint && this.textHintContentWidget) {
                this.textHintContentWidget.dispose();
                this.textHintContentWidget = undefined;
            }
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.toDispose);
            this.textHintContentWidget?.dispose();
        }
    };
    exports.EmptyTextEditorHintContribution = EmptyTextEditorHintContribution;
    exports.EmptyTextEditorHintContribution = EmptyTextEditorHintContribution = __decorate([
        __param(1, editorGroupsService_1.IEditorGroupsService),
        __param(2, commands_1.ICommandService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, inlineChatSessionService_1.IInlineChatSessionService),
        __param(6, inlineChat_1.IInlineChatService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, productService_1.IProductService)
    ], EmptyTextEditorHintContribution);
    class EmptyTextEditorHintContentWidget {
        static { this.ID = 'editor.widget.emptyHint'; }
        constructor(editor, options, editorGroupsService, commandService, configurationService, keybindingService, inlineChatService, telemetryService, productService) {
            this.editor = editor;
            this.options = options;
            this.editorGroupsService = editorGroupsService;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this.inlineChatService = inlineChatService;
            this.telemetryService = telemetryService;
            this.productService = productService;
            this.isVisible = false;
            this.ariaLabel = '';
            this.toDispose = new lifecycle_1.DisposableStore();
            this.toDispose.add(this.editor.onDidChangeConfiguration((e) => {
                if (this.domNode && e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this.editor.applyFontInfo(this.domNode);
                }
            }));
            const onDidFocusEditorText = event_1.Event.debounce(this.editor.onDidFocusEditorText, () => undefined, 500);
            this.toDispose.add(onDidFocusEditorText(() => {
                if (this.editor.hasTextFocus() && this.isVisible && this.ariaLabel && this.configurationService.getValue("accessibility.verbosity.emptyEditorHint" /* AccessibilityVerbositySettingId.EmptyEditorHint */)) {
                    (0, aria_1.status)(this.ariaLabel);
                }
            }));
            this.editor.addContentWidget(this);
        }
        getId() {
            return EmptyTextEditorHintContentWidget.ID;
        }
        _getHintInlineChat(providers) {
            const providerName = (providers.length === 1 ? providers[0].label : undefined) ?? this.productService.nameShort;
            const inlineChatId = 'inlineChat.start';
            let ariaLabel = `Ask ${providerName} something or start typing to dismiss.`;
            const handleClick = () => {
                this.telemetryService.publicLog2('workbenchActionExecuted', {
                    id: 'inlineChat.hintAction',
                    from: 'hint'
                });
                void this.commandService.executeCommand(inlineChatId, { from: 'hint' });
            };
            const hintHandler = {
                disposables: this.toDispose,
                callback: (index, _event) => {
                    switch (index) {
                        case '0':
                            handleClick();
                            break;
                    }
                }
            };
            const hintElement = $('empty-hint-text');
            hintElement.style.display = 'block';
            const keybindingHint = this.keybindingService.lookupKeybinding(inlineChatId);
            const keybindingHintLabel = keybindingHint?.getLabel();
            if (keybindingHint && keybindingHintLabel) {
                const actionPart = (0, nls_1.localize)('emptyHintText', 'Press {0} to ask {1} to do something. ', keybindingHintLabel, providerName);
                const [before, after] = actionPart.split(keybindingHintLabel).map((fragment) => {
                    if (this.options.clickable) {
                        const hintPart = $('a', undefined, fragment);
                        hintPart.style.fontStyle = 'italic';
                        hintPart.style.cursor = 'pointer';
                        hintPart.onclick = handleClick;
                        return hintPart;
                    }
                    else {
                        const hintPart = $('span', undefined, fragment);
                        hintPart.style.fontStyle = 'italic';
                        return hintPart;
                    }
                });
                hintElement.appendChild(before);
                const label = new keybindingLabel_1.KeybindingLabel(hintElement, platform_1.OS);
                label.set(keybindingHint);
                label.element.style.width = 'min-content';
                label.element.style.display = 'inline';
                if (this.options.clickable) {
                    label.element.style.cursor = 'pointer';
                    label.element.onclick = handleClick;
                }
                hintElement.appendChild(after);
                const typeToDismiss = (0, nls_1.localize)('emptyHintTextDismiss', 'Start typing to dismiss.');
                const textHint2 = $('span', undefined, typeToDismiss);
                textHint2.style.fontStyle = 'italic';
                hintElement.appendChild(textHint2);
                ariaLabel = actionPart.concat(typeToDismiss);
            }
            else {
                const hintMsg = (0, nls_1.localize)({
                    key: 'inlineChatHint',
                    comment: [
                        'Preserve double-square brackets and their order',
                    ]
                }, '[[Ask {0} to do something]] or start typing to dismiss.', providerName);
                const rendered = (0, formattedTextRenderer_1.renderFormattedText)(hintMsg, { actionHandler: hintHandler });
                hintElement.appendChild(rendered);
            }
            return { ariaLabel, hintHandler, hintElement };
        }
        _getHintDefault() {
            const hintHandler = {
                disposables: this.toDispose,
                callback: (index, event) => {
                    switch (index) {
                        case '0':
                            languageOnClickOrTap(event.browserEvent);
                            break;
                        case '1':
                            snippetOnClickOrTap(event.browserEvent);
                            break;
                        case '2':
                            chooseEditorOnClickOrTap(event.browserEvent);
                            break;
                        case '3':
                            dontShowOnClickOrTap();
                            break;
                    }
                }
            };
            // the actual command handlers...
            const languageOnClickOrTap = async (e) => {
                e.stopPropagation();
                // Need to focus editor before so current editor becomes active and the command is properly executed
                this.editor.focus();
                this.telemetryService.publicLog2('workbenchActionExecuted', {
                    id: editorStatus_1.ChangeLanguageAction.ID,
                    from: 'hint'
                });
                await this.commandService.executeCommand(editorStatus_1.ChangeLanguageAction.ID, { from: 'hint' });
                this.editor.focus();
            };
            const snippetOnClickOrTap = async (e) => {
                e.stopPropagation();
                this.telemetryService.publicLog2('workbenchActionExecuted', {
                    id: fileTemplateSnippets_1.ApplyFileSnippetAction.Id,
                    from: 'hint'
                });
                await this.commandService.executeCommand(fileTemplateSnippets_1.ApplyFileSnippetAction.Id);
            };
            const chooseEditorOnClickOrTap = async (e) => {
                e.stopPropagation();
                const activeEditorInput = this.editorGroupsService.activeGroup.activeEditor;
                this.telemetryService.publicLog2('workbenchActionExecuted', {
                    id: 'welcome.showNewFileEntries',
                    from: 'hint'
                });
                const newEditorSelected = await this.commandService.executeCommand('welcome.showNewFileEntries', { from: 'hint' });
                // Close the active editor as long as it is untitled (swap the editors out)
                if (newEditorSelected && activeEditorInput !== null && activeEditorInput.resource?.scheme === network_1.Schemas.untitled) {
                    this.editorGroupsService.activeGroup.closeEditor(activeEditorInput, { preserveFocus: true });
                }
            };
            const dontShowOnClickOrTap = () => {
                this.configurationService.updateValue(exports.emptyTextEditorHintSetting, 'hidden');
                this.dispose();
                this.editor.focus();
            };
            const hintMsg = (0, nls_1.localize)({
                key: 'message',
                comment: [
                    'Preserve double-square brackets and their order',
                    'language refers to a programming language'
                ]
            }, '[[Select a language]], or [[fill with template]], or [[open a different editor]] to get started.\nStart typing to dismiss or [[don\'t show]] this again.');
            const hintElement = (0, formattedTextRenderer_1.renderFormattedText)(hintMsg, {
                actionHandler: hintHandler,
                renderCodeSegments: false,
            });
            hintElement.style.fontStyle = 'italic';
            // ugly way to associate keybindings...
            const keybindingsLookup = [editorStatus_1.ChangeLanguageAction.ID, fileTemplateSnippets_1.ApplyFileSnippetAction.Id, 'welcome.showNewFileEntries'];
            const keybindingLabels = keybindingsLookup.map((id) => this.keybindingService.lookupKeybinding(id)?.getLabel() ?? id);
            const ariaLabel = (0, nls_1.localize)('defaultHintAriaLabel', 'Execute {0} to select a language, execute {1} to fill with template, or execute {2} to open a different editor and get started. Start typing to dismiss.', ...keybindingLabels);
            for (const anchor of hintElement.querySelectorAll('a')) {
                anchor.style.cursor = 'pointer';
                const id = keybindingsLookup.shift();
                const title = id && this.keybindingService.lookupKeybinding(id)?.getLabel();
                anchor.title = title ?? '';
            }
            return { hintElement, ariaLabel };
        }
        getDomNode() {
            if (!this.domNode) {
                this.domNode = $('.empty-editor-hint');
                this.domNode.style.width = 'max-content';
                this.domNode.style.paddingLeft = '4px';
                const inlineChatProviders = [...this.inlineChatService.getAllProvider()];
                const { hintElement, ariaLabel } = !inlineChatProviders.length ? this._getHintDefault() : this._getHintInlineChat(inlineChatProviders);
                this.domNode.append(hintElement);
                this.ariaLabel = ariaLabel.concat((0, nls_1.localize)('disableHint', ' Toggle {0} in settings to disable this hint.', "accessibility.verbosity.emptyEditorHint" /* AccessibilityVerbositySettingId.EmptyEditorHint */));
                this.toDispose.add(dom.addDisposableListener(this.domNode, 'click', () => {
                    this.editor.focus();
                }));
                this.editor.applyFontInfo(this.domNode);
            }
            return this.domNode;
        }
        getPosition() {
            return {
                position: { lineNumber: 1, column: 1 },
                preference: [0 /* ContentWidgetPositionPreference.EXACT */]
            };
        }
        dispose() {
            this.editor.removeContentWidget(this);
            (0, lifecycle_1.dispose)(this.toDispose);
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(EmptyTextEditorHintContribution.ID, EmptyTextEditorHintContribution, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to render a help message
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1wdHlUZXh0RWRpdG9ySGludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9icm93c2VyL2VtcHR5VGV4dEVkaXRvckhpbnQvZW1wdHlUZXh0RWRpdG9ySGludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQ2hHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsb0RBQW9EO0lBQ3BELG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBVSxDQUFDLHNCQUFzQixDQUFDO1NBQzdFLCtCQUErQixDQUFDLENBQUM7WUFDakMsR0FBRyxFQUFFLGdDQUFnQztZQUNyQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDLGtDQUEwQixFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUM7Z0JBQ3ZDLENBQUMsZ0NBQWdDLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7YUFDeEQsQ0FBQztTQUNGO1FBQ0Q7WUFDQyxHQUFHLEVBQUUsc0NBQXNDO1lBQzNDLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ2pDLGtHQUFrRCxFQUFFLEtBQUssRUFBRSxDQUFDO2dCQUM1RCxDQUFDLHNDQUFzQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO2FBQzlELENBQUM7U0FDRixDQUFDLENBQUMsQ0FBQztJQU1RLFFBQUEsMEJBQTBCLEdBQUcsNkJBQTZCLENBQUM7SUFDakUsSUFBTSwrQkFBK0IsR0FBckMsTUFBTSwrQkFBK0I7aUJBRXBCLE9BQUUsR0FBRyxvQ0FBb0MsQUFBdkMsQ0FBd0M7UUFLakUsWUFDb0IsTUFBbUIsRUFD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