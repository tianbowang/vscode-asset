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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/core/wordHelper", "vs/editor/common/services/languageFeatures", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/common/contributions", "vs/workbench/contrib/chat/browser/actions/chatExecuteActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatInputPart", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/browser/contrib/chatDynamicVariables", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatColors", "vs/workbench/contrib/chat/common/chatParserTypes", "vs/workbench/contrib/chat/common/chatRequestParser", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/contrib/chat/common/chatViewModel"], function (require, exports, async_1, lifecycle_1, codeEditorService_1, range_1, wordHelper_1, languageFeatures_1, nls_1, configuration_1, instantiation_1, productService_1, platform_1, colorRegistry_1, themeService_1, contributions_1, chatExecuteActions_1, chat_1, chatInputPart_1, chatWidget_1, chatDynamicVariables_1, chatAgents_1, chatColors_1, chatParserTypes_1, chatRequestParser_1, chatService_1, chatSlashCommands_1, chatVariables_1, chatViewModel_1) {
    "use strict";
    var BuiltinDynamicCompletions_1, VariableCompletions_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const decorationDescription = 'chat';
    const placeholderDecorationType = 'chat-session-detail';
    const slashCommandTextDecorationType = 'chat-session-text';
    const variableTextDecorationType = 'chat-variable-text';
    function agentAndCommandToKey(agent, subcommand) {
        return `${agent}__${subcommand}`;
    }
    let InputEditorDecorations = class InputEditorDecorations extends lifecycle_1.Disposable {
        constructor(widget, instantiationService, codeEditorService, themeService, chatService, chatAgentService) {
            super();
            this.widget = widget;
            this.instantiationService = instantiationService;
            this.codeEditorService = codeEditorService;
            this.themeService = themeService;
            this.chatService = chatService;
            this.chatAgentService = chatAgentService;
            this.id = 'inputEditorDecorations';
            this.previouslyUsedAgents = new Set();
            this.viewModelDisposables = this._register(new lifecycle_1.MutableDisposable());
            this.codeEditorService.registerDecorationType(decorationDescription, placeholderDecorationType, {});
            this._register(this.themeService.onDidColorThemeChange(() => this.updateRegisteredDecorationTypes()));
            this.updateRegisteredDecorationTypes();
            this.updateInputEditorDecorations();
            this._register(this.widget.inputEditor.onDidChangeModelContent(() => this.updateInputEditorDecorations()));
            this._register(this.widget.onDidChangeViewModel(() => {
                this.registerViewModelListeners();
                this.previouslyUsedAgents.clear();
                this.updateInputEditorDecorations();
            }));
            this._register(this.chatService.onDidSubmitAgent((e) => {
                if (e.sessionId === this.widget.viewModel?.sessionId) {
                    this.previouslyUsedAgents.add(agentAndCommandToKey(e.agent.id, e.slashCommand.name));
                }
            }));
            this._register(this.chatAgentService.onDidChangeAgents(() => this.updateInputEditorDecorations()));
            this.registerViewModelListeners();
        }
        registerViewModelListeners() {
            this.viewModelDisposables.value = this.widget.viewModel?.onDidChange(e => {
                if (e?.kind === 'changePlaceholder' || e?.kind === 'initialize') {
                    this.updateInputEditorDecorations();
                }
            });
        }
        updateRegisteredDecorationTypes() {
            this.codeEditorService.removeDecorationType(variableTextDecorationType);
            this.codeEditorService.removeDecorationType(chatDynamicVariables_1.dynamicVariableDecorationType);
            this.codeEditorService.removeDecorationType(slashCommandTextDecorationType);
            const theme = this.themeService.getColorTheme();
            this.codeEditorService.registerDecorationType(decorationDescription, slashCommandTextDecorationType, {
                color: theme.getColor(chatColors_1.chatSlashCommandForeground)?.toString(),
                backgroundColor: theme.getColor(chatColors_1.chatSlashCommandBackground)?.toString(),
                borderRadius: '3px'
            });
            this.codeEditorService.registerDecorationType(decorationDescription, variableTextDecorationType, {
                color: theme.getColor(chatColors_1.chatSlashCommandForeground)?.toString(),
                backgroundColor: theme.getColor(chatColors_1.chatSlashCommandBackground)?.toString(),
                borderRadius: '3px'
            });
            this.codeEditorService.registerDecorationType(decorationDescription, chatDynamicVariables_1.dynamicVariableDecorationType, {
                color: theme.getColor(chatColors_1.chatSlashCommandForeground)?.toString(),
                backgroundColor: theme.getColor(chatColors_1.chatSlashCommandBackground)?.toString(),
                borderRadius: '3px'
            });
            this.updateInputEditorDecorations();
        }
        getPlaceholderColor() {
            const theme = this.themeService.getColorTheme();
            const transparentForeground = theme.getColor(colorRegistry_1.inputPlaceholderForeground);
            return transparentForeground?.toString();
        }
        async updateInputEditorDecorations() {
            const inputValue = this.widget.inputEditor.getValue();
            const viewModel = this.widget.viewModel;
            if (!viewModel) {
                return;
            }
            if (!inputValue) {
                const viewModelPlaceholder = this.widget.viewModel?.inputPlaceholder;
                const placeholder = viewModelPlaceholder ?? '';
                const decoration = [
                    {
                        range: {
                            startLineNumber: 1,
                            endLineNumber: 1,
                            startColumn: 1,
                            endColumn: 1000
                        },
                        renderOptions: {
                            after: {
                                contentText: placeholder,
                                color: this.getPlaceholderColor()
                            }
                        }
                    }
                ];
                this.widget.inputEditor.setDecorationsByType(decorationDescription, placeholderDecorationType, decoration);
                return;
            }
            const parsedRequest = (await this.instantiationService.createInstance(chatRequestParser_1.ChatRequestParser).parseChatRequest(viewModel.sessionId, inputValue)).parts;
            let placeholderDecoration;
            const agentPart = parsedRequest.find((p) => p instanceof chatParserTypes_1.ChatRequestAgentPart);
            const agentSubcommandPart = parsedRequest.find((p) => p instanceof chatParserTypes_1.ChatRequestAgentSubcommandPart);
            const slashCommandPart = parsedRequest.find((p) => p instanceof chatParserTypes_1.ChatRequestSlashCommandPart);
            const exactlyOneSpaceAfterPart = (part) => {
                const partIdx = parsedRequest.indexOf(part);
                if (parsedRequest.length > partIdx + 2) {
                    return false;
                }
                const nextPart = parsedRequest[partIdx + 1];
                return nextPart && nextPart instanceof chatParserTypes_1.ChatRequestTextPart && nextPart.text === ' ';
            };
            const onlyAgentAndWhitespace = agentPart && parsedRequest.every(p => p instanceof chatParserTypes_1.ChatRequestTextPart && !p.text.trim().length || p instanceof chatParserTypes_1.ChatRequestAgentPart);
            if (onlyAgentAndWhitespace) {
                // Agent reference with no other text - show the placeholder
                if (agentPart.agent.metadata.description && exactlyOneSpaceAfterPart(agentPart)) {
                    placeholderDecoration = [{
                            range: {
                                startLineNumber: agentPart.editorRange.startLineNumber,
                                endLineNumber: agentPart.editorRange.endLineNumber,
                                startColumn: agentPart.editorRange.endColumn + 1,
                                endColumn: 1000
                            },
                            renderOptions: {
                                after: {
                                    contentText: agentPart.agent.metadata.description,
                                    color: this.getPlaceholderColor(),
                                }
                            }
                        }];
                }
            }
            const onlyAgentCommandAndWhitespace = agentPart && agentSubcommandPart && parsedRequest.every(p => p instanceof chatParserTypes_1.ChatRequestTextPart && !p.text.trim().length || p instanceof chatParserTypes_1.ChatRequestAgentPart || p instanceof chatParserTypes_1.ChatRequestAgentSubcommandPart);
            if (onlyAgentCommandAndWhitespace) {
                // Agent reference and subcommand with no other text - show the placeholder
                const isFollowupSlashCommand = this.previouslyUsedAgents.has(agentAndCommandToKey(agentPart.agent.id, agentSubcommandPart.command.name));
                const shouldRenderFollowupPlaceholder = isFollowupSlashCommand && agentSubcommandPart.command.followupPlaceholder;
                if (agentSubcommandPart?.command.description && exactlyOneSpaceAfterPart(agentSubcommandPart)) {
                    placeholderDecoration = [{
                            range: {
                                startLineNumber: agentSubcommandPart.editorRange.startLineNumber,
                                endLineNumber: agentSubcommandPart.editorRange.endLineNumber,
                                startColumn: agentSubcommandPart.editorRange.endColumn + 1,
                                endColumn: 1000
                            },
                            renderOptions: {
                                after: {
                                    contentText: shouldRenderFollowupPlaceholder ? agentSubcommandPart.command.followupPlaceholder : agentSubcommandPart.command.description,
                                    color: this.getPlaceholderColor(),
                                }
                            }
                        }];
                }
            }
            const onlySlashCommandAndWhitespace = slashCommandPart && parsedRequest.every(p => p instanceof chatParserTypes_1.ChatRequestTextPart && !p.text.trim().length || p instanceof chatParserTypes_1.ChatRequestSlashCommandPart);
            if (onlySlashCommandAndWhitespace) {
                // Command reference with no other text - show the placeholder
                if (slashCommandPart.slashCommand.detail && exactlyOneSpaceAfterPart(slashCommandPart)) {
                    placeholderDecoration = [{
                            range: {
                                startLineNumber: slashCommandPart.editorRange.startLineNumber,
                                endLineNumber: slashCommandPart.editorRange.endLineNumber,
                                startColumn: slashCommandPart.editorRange.endColumn + 1,
                                endColumn: 1000
                            },
                            renderOptions: {
                                after: {
                                    contentText: slashCommandPart.slashCommand.detail,
                                    color: this.getPlaceholderColor(),
                                }
                            }
                        }];
                }
            }
            this.widget.inputEditor.setDecorationsByType(decorationDescription, placeholderDecorationType, placeholderDecoration ?? []);
            const textDecorations = [];
            if (agentPart) {
                textDecorations.push({ range: agentPart.editorRange });
                if (agentSubcommandPart) {
                    textDecorations.push({ range: agentSubcommandPart.editorRange });
                }
            }
            if (slashCommandPart) {
                textDecorations.push({ range: slashCommandPart.editorRange });
            }
            this.widget.inputEditor.setDecorationsByType(decorationDescription, slashCommandTextDecorationType, textDecorations);
            const varDecorations = [];
            const variableParts = parsedRequest.filter((p) => p instanceof chatParserTypes_1.ChatRequestVariablePart);
            for (const variable of variableParts) {
                varDecorations.push({ range: variable.editorRange });
            }
            this.widget.inputEditor.setDecorationsByType(decorationDescription, variableTextDecorationType, varDecorations);
        }
    };
    InputEditorDecorations = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, codeEditorService_1.ICodeEditorService),
        __param(3, themeService_1.IThemeService),
        __param(4, chatService_1.IChatService),
        __param(5, chatAgents_1.IChatAgentService)
    ], InputEditorDecorations);
    let InputEditorSlashCommandMode = class InputEditorSlashCommandMode extends lifecycle_1.Disposable {
        constructor(widget, chatService) {
            super();
            this.widget = widget;
            this.chatService = chatService;
            this.id = 'InputEditorSlashCommandMode';
            this._register(this.chatService.onDidSubmitAgent(e => {
                if (this.widget.viewModel?.sessionId !== e.sessionId) {
                    return;
                }
                this.repopulateAgentCommand(e.agent, e.slashCommand);
            }));
        }
        async repopulateAgentCommand(agent, slashCommand) {
            if (slashCommand.shouldRepopulate) {
                const value = `${chatParserTypes_1.chatAgentLeader}${agent.id} ${chatParserTypes_1.chatSubcommandLeader}${slashCommand.name} `;
                this.widget.inputEditor.setValue(value);
                this.widget.inputEditor.setPosition({ lineNumber: 1, column: value.length + 1 });
            }
        }
    };
    InputEditorSlashCommandMode = __decorate([
        __param(1, chatService_1.IChatService)
    ], InputEditorSlashCommandMode);
    chatWidget_1.ChatWidget.CONTRIBS.push(InputEditorDecorations, InputEditorSlashCommandMode);
    let SlashCommandCompletions = class SlashCommandCompletions extends lifecycle_1.Disposable {
        constructor(languageFeaturesService, chatWidgetService, instantiationService, chatSlashCommandService) {
            super();
            this.languageFeaturesService = languageFeaturesService;
            this.chatWidgetService = chatWidgetService;
            this.instantiationService = instantiationService;
            this.chatSlashCommandService = chatSlashCommandService;
            this._register(this.languageFeaturesService.completionProvider.register({ scheme: chatInputPart_1.ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'globalSlashCommands',
                triggerCharacters: ['/'],
                provideCompletionItems: async (model, position, _context, _token) => {
                    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                    if (!widget || !widget.viewModel) {
                        return null;
                    }
                    const range = computeCompletionRanges(model, position, /\/\w*/g);
                    if (!range) {
                        return null;
                    }
                    const parsedRequest = (await this.instantiationService.createInstance(chatRequestParser_1.ChatRequestParser).parseChatRequest(widget.viewModel.sessionId, model.getValue())).parts;
                    const usedAgent = parsedRequest.find(p => p instanceof chatParserTypes_1.ChatRequestAgentPart);
                    if (usedAgent) {
                        // No (classic) global slash commands when an agent is used
                        return;
                    }
                    const slashCommands = this.chatSlashCommandService.getCommands();
                    if (!slashCommands) {
                        return null;
                    }
                    return {
                        suggestions: slashCommands.map((c, i) => {
                            const withSlash = `/${c.command}`;
                            return {
                                label: withSlash,
                                insertText: c.executeImmediately ? '' : `${withSlash} `,
                                detail: c.detail,
                                range: new range_1.Range(1, 1, 1, 1),
                                sortText: c.sortText ?? 'a'.repeat(i + 1),
                                kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway,
                                command: c.executeImmediately ? { id: chatExecuteActions_1.SubmitAction.ID, title: withSlash, arguments: [{ widget, inputValue: `${withSlash} ` }] } : undefined,
                            };
                        })
                    };
                }
            }));
        }
    };
    SlashCommandCompletions = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, chat_1.IChatWidgetService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, chatSlashCommands_1.IChatSlashCommandService)
    ], SlashCommandCompletions);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(SlashCommandCompletions, 4 /* LifecyclePhase.Eventually */);
    let AgentCompletions = class AgentCompletions extends lifecycle_1.Disposable {
        constructor(languageFeaturesService, chatWidgetService, chatAgentService, instantiationService) {
            super();
            this.languageFeaturesService = languageFeaturesService;
            this.chatWidgetService = chatWidgetService;
            this.chatAgentService = chatAgentService;
            this.instantiationService = instantiationService;
            this._register(this.languageFeaturesService.completionProvider.register({ scheme: chatInputPart_1.ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatAgent',
                triggerCharacters: ['@'],
                provideCompletionItems: async (model, position, _context, _token) => {
                    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                    if (!widget || !widget.viewModel) {
                        return null;
                    }
                    const parsedRequest = (await this.instantiationService.createInstance(chatRequestParser_1.ChatRequestParser).parseChatRequest(widget.viewModel.sessionId, model.getValue())).parts;
                    const usedAgent = parsedRequest.find(p => p instanceof chatParserTypes_1.ChatRequestAgentPart);
                    if (usedAgent && !range_1.Range.containsPosition(usedAgent.editorRange, position)) {
                        // Only one agent allowed
                        return;
                    }
                    const range = computeCompletionRanges(model, position, /@\w*/g);
                    if (!range) {
                        return null;
                    }
                    const agents = this.chatAgentService.getAgents()
                        .filter(a => !a.metadata.isDefault);
                    return {
                        suggestions: agents.map((c, i) => {
                            const withAt = `@${c.id}`;
                            return {
                                label: withAt,
                                insertText: `${withAt} `,
                                detail: c.metadata.description,
                                range,
                                kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                            };
                        })
                    };
                }
            }));
            this._register(this.languageFeaturesService.completionProvider.register({ scheme: chatInputPart_1.ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatAgentSubcommand',
                triggerCharacters: ['/'],
                provideCompletionItems: async (model, position, _context, token) => {
                    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                    if (!widget || !widget.viewModel) {
                        return;
                    }
                    const range = computeCompletionRanges(model, position, /\/\w*/g);
                    if (!range) {
                        return null;
                    }
                    const parsedRequest = (await this.instantiationService.createInstance(chatRequestParser_1.ChatRequestParser).parseChatRequest(widget.viewModel.sessionId, model.getValue())).parts;
                    const usedAgentIdx = parsedRequest.findIndex((p) => p instanceof chatParserTypes_1.ChatRequestAgentPart);
                    if (usedAgentIdx < 0) {
                        return;
                    }
                    const usedSubcommand = parsedRequest.find(p => p instanceof chatParserTypes_1.ChatRequestAgentSubcommandPart);
                    if (usedSubcommand) {
                        // Only one allowed
                        return;
                    }
                    for (const partAfterAgent of parsedRequest.slice(usedAgentIdx + 1)) {
                        // Could allow text after 'position'
                        if (!(partAfterAgent instanceof chatParserTypes_1.ChatRequestTextPart) || !partAfterAgent.text.trim().match(/^(\/\w*)?$/)) {
                            // No text allowed between agent and subcommand
                            return;
                        }
                    }
                    const usedAgent = parsedRequest[usedAgentIdx];
                    const commands = await usedAgent.agent.provideSlashCommands(token);
                    return {
                        suggestions: commands.map((c, i) => {
                            const withSlash = `/${c.name}`;
                            return {
                                label: withSlash,
                                insertText: `${withSlash} `,
                                detail: c.description,
                                range,
                                kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                            };
                        })
                    };
                }
            }));
            // list subcommands when the query is empty, insert agent+subcommand
            this._register(this.languageFeaturesService.completionProvider.register({ scheme: chatInputPart_1.ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatAgentAndSubcommand',
                triggerCharacters: ['/'],
                provideCompletionItems: async (model, position, _context, token) => {
                    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                    if (!widget) {
                        return;
                    }
                    const range = computeCompletionRanges(model, position, /\/\w*/g);
                    if (!range) {
                        return null;
                    }
                    const agents = this.chatAgentService.getAgents();
                    const all = agents.map(agent => agent.provideSlashCommands(token));
                    const commands = await (0, async_1.raceCancellation)(Promise.all(all), token);
                    if (!commands) {
                        return;
                    }
                    const justAgents = agents
                        .filter(a => !a.metadata.isDefault)
                        .map(agent => {
                        const agentLabel = `${chatParserTypes_1.chatAgentLeader}${agent.id}`;
                        return {
                            label: { label: agentLabel, description: agent.metadata.description },
                            filterText: `${chatParserTypes_1.chatSubcommandLeader}${agent.id}`,
                            insertText: `${agentLabel} `,
                            range: new range_1.Range(1, 1, 1, 1),
                            kind: 18 /* CompletionItemKind.Text */,
                            sortText: `${chatParserTypes_1.chatSubcommandLeader}${agent.id}`,
                        };
                    });
                    return {
                        suggestions: justAgents.concat(agents.flatMap((agent, i) => commands[i].map((c, i) => {
                            const agentLabel = `${chatParserTypes_1.chatAgentLeader}${agent.id}`;
                            const withSlash = `${chatParserTypes_1.chatSubcommandLeader}${c.name}`;
                            return {
                                label: { label: withSlash, description: agentLabel },
                                filterText: `${chatParserTypes_1.chatSubcommandLeader}${agent.id}${c.name}`,
                                commitCharacters: [' '],
                                insertText: `${agentLabel} ${withSlash} `,
                                detail: `(${agentLabel}) ${c.description}`,
                                range: new range_1.Range(1, 1, 1, 1),
                                kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                                sortText: `${chatParserTypes_1.chatSubcommandLeader}${agent.id}${c.name}`,
                            };
                        })))
                    };
                }
            }));
        }
    };
    AgentCompletions = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, chat_1.IChatWidgetService),
        __param(2, chatAgents_1.IChatAgentService),
        __param(3, instantiation_1.IInstantiationService)
    ], AgentCompletions);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(AgentCompletions, 4 /* LifecyclePhase.Eventually */);
    let BuiltinDynamicCompletions = class BuiltinDynamicCompletions extends lifecycle_1.Disposable {
        static { BuiltinDynamicCompletions_1 = this; }
        static { this.VariableNameDef = new RegExp(`${chatParserTypes_1.chatVariableLeader}\\w*`, 'g'); } // MUST be using `g`-flag
        constructor(languageFeaturesService, chatWidgetService, configurationService, productService) {
            super();
            this.languageFeaturesService = languageFeaturesService;
            this.chatWidgetService = chatWidgetService;
            this.configurationService = configurationService;
            this.productService = productService;
            this._register(this.languageFeaturesService.completionProvider.register({ scheme: chatInputPart_1.ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatDynamicCompletions',
                triggerCharacters: [chatParserTypes_1.chatVariableLeader],
                provideCompletionItems: async (model, position, _context, _token) => {
                    const fileVariablesEnabled = this.configurationService.getValue('chat.experimental.fileVariables') ?? this.productService.quality !== 'stable';
                    if (!fileVariablesEnabled) {
                        return;
                    }
                    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                    if (!widget || !widget.supportsFileReferences) {
                        return null;
                    }
                    const range = computeCompletionRanges(model, position, BuiltinDynamicCompletions_1.VariableNameDef);
                    if (!range) {
                        return null;
                    }
                    const afterRange = new range_1.Range(position.lineNumber, range.replace.startColumn, position.lineNumber, range.replace.startColumn + '#file:'.length);
                    return {
                        suggestions: [
                            {
                                label: `${chatParserTypes_1.chatVariableLeader}file`,
                                insertText: `${chatParserTypes_1.chatVariableLeader}file:`,
                                detail: (0, nls_1.localize)('pickFileLabel', "Pick a file"),
                                range,
                                kind: 18 /* CompletionItemKind.Text */,
                                command: { id: chatDynamicVariables_1.SelectAndInsertFileAction.ID, title: chatDynamicVariables_1.SelectAndInsertFileAction.ID, arguments: [{ widget, range: afterRange }] },
                                sortText: 'z'
                            }
                        ]
                    };
                }
            }));
        }
    };
    BuiltinDynamicCompletions = BuiltinDynamicCompletions_1 = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, chat_1.IChatWidgetService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, productService_1.IProductService)
    ], BuiltinDynamicCompletions);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(BuiltinDynamicCompletions, 4 /* LifecyclePhase.Eventually */);
    function computeCompletionRanges(model, position, reg) {
        const varWord = (0, wordHelper_1.getWordAtText)(position.column, reg, model.getLineContent(position.lineNumber), 0);
        if (!varWord && model.getWordUntilPosition(position).word) {
            // inside a "normal" word
            return;
        }
        let insert;
        let replace;
        if (!varWord) {
            insert = replace = range_1.Range.fromPositions(position);
        }
        else {
            insert = new range_1.Range(position.lineNumber, varWord.startColumn, position.lineNumber, position.column);
            replace = new range_1.Range(position.lineNumber, varWord.startColumn, position.lineNumber, varWord.endColumn);
        }
        return { insert, replace, varWord };
    }
    let VariableCompletions = class VariableCompletions extends lifecycle_1.Disposable {
        static { VariableCompletions_1 = this; }
        static { this.VariableNameDef = new RegExp(`${chatParserTypes_1.chatVariableLeader}\\w*`, 'g'); } // MUST be using `g`-flag
        constructor(languageFeaturesService, chatWidgetService, chatVariablesService, configurationService) {
            super();
            this.languageFeaturesService = languageFeaturesService;
            this.chatWidgetService = chatWidgetService;
            this.chatVariablesService = chatVariablesService;
            this.configurationService = configurationService;
            this._register(this.languageFeaturesService.completionProvider.register({ scheme: chatInputPart_1.ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatVariables',
                triggerCharacters: [chatParserTypes_1.chatVariableLeader],
                provideCompletionItems: async (model, position, _context, _token) => {
                    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                    if (!widget) {
                        return null;
                    }
                    const range = computeCompletionRanges(model, position, VariableCompletions_1.VariableNameDef);
                    if (!range) {
                        return null;
                    }
                    const history = widget.viewModel.getItems()
                        .filter(chatViewModel_1.isResponseVM);
                    // TODO@roblourens work out a real API for this- maybe it can be part of the two-step flow that @file will probably use
                    const historyVariablesEnabled = this.configurationService.getValue('chat.experimental.historyVariables');
                    const historyItems = historyVariablesEnabled ? history.map((h, i) => ({
                        label: `${chatParserTypes_1.chatVariableLeader}response:${i + 1}`,
                        detail: h.response.asString(),
                        insertText: `${chatParserTypes_1.chatVariableLeader}response:${String(i + 1).padStart(String(history.length).length, '0')} `,
                        kind: 18 /* CompletionItemKind.Text */,
                        range,
                    })) : [];
                    const variableItems = Array.from(this.chatVariablesService.getVariables()).map(v => {
                        const withLeader = `${chatParserTypes_1.chatVariableLeader}${v.name}`;
                        return {
                            label: withLeader,
                            range,
                            insertText: withLeader + ' ',
                            detail: v.description,
                            kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                            sortText: 'z'
                        };
                    });
                    return {
                        suggestions: [...variableItems, ...historyItems]
                    };
                }
            }));
        }
    };
    VariableCompletions = VariableCompletions_1 = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, chat_1.IChatWidgetService),
        __param(2, chatVariables_1.IChatVariablesService),
        __param(3, configuration_1.IConfigurationService)
    ], VariableCompletions);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(VariableCompletions, 4 /* LifecyclePhase.Eventually */);
    let ChatTokenDeleter = class ChatTokenDeleter extends lifecycle_1.Disposable {
        constructor(widget, instantiationService) {
            super();
            this.widget = widget;
            this.instantiationService = instantiationService;
            this.id = 'chatTokenDeleter';
            const parser = this.instantiationService.createInstance(chatRequestParser_1.ChatRequestParser);
            const inputValue = this.widget.inputEditor.getValue();
            let previousInputValue;
            // A simple heuristic to delete the previous token when the user presses backspace.
            // The sophisticated way to do this would be to have a parse tree that can be updated incrementally.
            this.widget.inputEditor.onDidChangeModelContent(e => {
                if (!previousInputValue) {
                    previousInputValue = inputValue;
                }
                // Don't try to handle multicursor edits right now
                const change = e.changes[0];
                // If this was a simple delete, try to find out whether it was inside a token
                if (!change.text && this.widget.viewModel) {
                    parser.parseChatRequest(this.widget.viewModel.sessionId, previousInputValue).then(previousParsedValue => {
                        // For dynamic variables, this has to happen in ChatDynamicVariableModel with the other bookkeeping
                        const deletableTokens = previousParsedValue.parts.filter(p => p instanceof chatParserTypes_1.ChatRequestAgentPart || p instanceof chatParserTypes_1.ChatRequestAgentSubcommandPart || p instanceof chatParserTypes_1.ChatRequestSlashCommandPart || p instanceof chatParserTypes_1.ChatRequestVariablePart);
                        deletableTokens.forEach(token => {
                            const deletedRangeOfToken = range_1.Range.intersectRanges(token.editorRange, change.range);
                            // Part of this token was deleted, and the deletion range doesn't go off the front of the token, for simpler math
                            if ((deletedRangeOfToken && !deletedRangeOfToken.isEmpty()) && range_1.Range.compareRangesUsingStarts(token.editorRange, change.range) < 0) {
                                // Assume single line tokens
                                const length = deletedRangeOfToken.endColumn - deletedRangeOfToken.startColumn;
                                const rangeToDelete = new range_1.Range(token.editorRange.startLineNumber, token.editorRange.startColumn, token.editorRange.endLineNumber, token.editorRange.endColumn - length);
                                this.widget.inputEditor.executeEdits(this.id, [{
                                        range: rangeToDelete,
                                        text: '',
                                    }]);
                            }
                        });
                    });
                }
                previousInputValue = this.widget.inputEditor.getValue();
            });
        }
    };
    ChatTokenDeleter = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], ChatTokenDeleter);
    chatWidget_1.ChatWidget.CONTRIBS.push(ChatTokenDeleter);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdElucHV0RWRpdG9yQ29udHJpYi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NvbnRyaWIvY2hhdElucHV0RWRpdG9yQ29udHJpYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFvQ2hHLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxDQUFDO0lBQ3JDLE1BQU0seUJBQXlCLEdBQUcscUJBQXFCLENBQUM7SUFDeEQsTUFBTSw4QkFBOEIsR0FBRyxtQkFBbUIsQ0FBQztJQUMzRCxNQUFNLDBCQUEwQixHQUFHLG9CQUFvQixDQUFDO0lBRXhELFNBQVMsb0JBQW9CLENBQUMsS0FBYSxFQUFFLFVBQWtCO1FBQzlELE9BQU8sR0FBRyxLQUFLLEtBQUssVUFBVSxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVELElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsc0JBQVU7UUFROUMsWUFDa0IsTUFBbUIsRUFDYixvQkFBNEQsRUFDL0QsaUJBQXNELEVBQzNELFlBQTRDLEVBQzdDLFdBQTBDLEVBQ3JDLGdCQUFvRDtZQUV2RSxLQUFLLEVBQUUsQ0FBQztZQVBTLFdBQU0sR0FBTixNQUFNLENBQWE7WUFDSSx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzlDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDMUMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDNUIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDcEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQVp4RCxPQUFFLEdBQUcsd0JBQXdCLENBQUM7WUFFN0IseUJBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUV6Qyx5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJB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