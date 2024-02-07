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
define(["require", "exports", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/configuration", "vs/workbench/contrib/speech/common/speechService", "vs/base/common/lifecycle", "vs/base/common/event"], function (require, exports, nls_1, configurationRegistry_1, platform_1, contextkey_1, configuration_1, speechService_1, lifecycle_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DynamicSpeechAccessibilityConfiguration = exports.SpeechTimeoutDefault = exports.AccessibilityVoiceSettingId = exports.registerAccessibilityConfiguration = exports.accessibilityConfigurationNodeBase = exports.AccessibleViewProviderId = exports.AccessibilityVerbositySettingId = exports.ViewDimUnfocusedOpacityProperties = exports.AccessibilityWorkbenchSettingId = exports.accessibleViewCurrentProviderId = exports.accessibleViewOnLastLine = exports.accessibleViewGoToSymbolSupported = exports.accessibleViewVerbosityEnabled = exports.accessibleViewSupportsNavigation = exports.accessibleViewIsShown = exports.accessibilityHelpIsShown = void 0;
    exports.accessibilityHelpIsShown = new contextkey_1.RawContextKey('accessibilityHelpIsShown', false, true);
    exports.accessibleViewIsShown = new contextkey_1.RawContextKey('accessibleViewIsShown', false, true);
    exports.accessibleViewSupportsNavigation = new contextkey_1.RawContextKey('accessibleViewSupportsNavigation', false, true);
    exports.accessibleViewVerbosityEnabled = new contextkey_1.RawContextKey('accessibleViewVerbosityEnabled', false, true);
    exports.accessibleViewGoToSymbolSupported = new contextkey_1.RawContextKey('accessibleViewGoToSymbolSupported', false, true);
    exports.accessibleViewOnLastLine = new contextkey_1.RawContextKey('accessibleViewOnLastLine', false, true);
    exports.accessibleViewCurrentProviderId = new contextkey_1.RawContextKey('accessibleViewCurrentProviderId', undefined, undefined);
    /**
     * Miscellaneous settings tagged with accessibility and implemented in the accessibility contrib but
     * were better to live under workbench for discoverability.
     */
    var AccessibilityWorkbenchSettingId;
    (function (AccessibilityWorkbenchSettingId) {
        AccessibilityWorkbenchSettingId["DimUnfocusedEnabled"] = "accessibility.dimUnfocused.enabled";
        AccessibilityWorkbenchSettingId["DimUnfocusedOpacity"] = "accessibility.dimUnfocused.opacity";
        AccessibilityWorkbenchSettingId["HideAccessibleView"] = "accessibility.hideAccessibleView";
        AccessibilityWorkbenchSettingId["AccessibleViewCloseOnKeyPress"] = "accessibility.accessibleView.closeOnKeyPress";
    })(AccessibilityWorkbenchSettingId || (exports.AccessibilityWorkbenchSettingId = AccessibilityWorkbenchSettingId = {}));
    var ViewDimUnfocusedOpacityProperties;
    (function (ViewDimUnfocusedOpacityProperties) {
        ViewDimUnfocusedOpacityProperties[ViewDimUnfocusedOpacityProperties["Default"] = 0.75] = "Default";
        ViewDimUnfocusedOpacityProperties[ViewDimUnfocusedOpacityProperties["Minimum"] = 0.2] = "Minimum";
        ViewDimUnfocusedOpacityProperties[ViewDimUnfocusedOpacityProperties["Maximum"] = 1] = "Maximum";
    })(ViewDimUnfocusedOpacityProperties || (exports.ViewDimUnfocusedOpacityProperties = ViewDimUnfocusedOpacityProperties = {}));
    var AccessibilityVerbositySettingId;
    (function (AccessibilityVerbositySettingId) {
        AccessibilityVerbositySettingId["Terminal"] = "accessibility.verbosity.terminal";
        AccessibilityVerbositySettingId["DiffEditor"] = "accessibility.verbosity.diffEditor";
        AccessibilityVerbositySettingId["Chat"] = "accessibility.verbosity.panelChat";
        AccessibilityVerbositySettingId["InlineChat"] = "accessibility.verbosity.inlineChat";
        AccessibilityVerbositySettingId["InlineCompletions"] = "accessibility.verbosity.inlineCompletions";
        AccessibilityVerbositySettingId["KeybindingsEditor"] = "accessibility.verbosity.keybindingsEditor";
        AccessibilityVerbositySettingId["Notebook"] = "accessibility.verbosity.notebook";
        AccessibilityVerbositySettingId["Editor"] = "accessibility.verbosity.editor";
        AccessibilityVerbositySettingId["Hover"] = "accessibility.verbosity.hover";
        AccessibilityVerbositySettingId["Notification"] = "accessibility.verbosity.notification";
        AccessibilityVerbositySettingId["EmptyEditorHint"] = "accessibility.verbosity.emptyEditorHint";
        AccessibilityVerbositySettingId["Comments"] = "accessibility.verbosity.comments";
    })(AccessibilityVerbositySettingId || (exports.AccessibilityVerbositySettingId = AccessibilityVerbositySettingId = {}));
    var AccessibleViewProviderId;
    (function (AccessibleViewProviderId) {
        AccessibleViewProviderId["Terminal"] = "terminal";
        AccessibleViewProviderId["TerminalHelp"] = "terminal-help";
        AccessibleViewProviderId["DiffEditor"] = "diffEditor";
        AccessibleViewProviderId["Chat"] = "panelChat";
        AccessibleViewProviderId["InlineChat"] = "inlineChat";
        AccessibleViewProviderId["InlineCompletions"] = "inlineCompletions";
        AccessibleViewProviderId["KeybindingsEditor"] = "keybindingsEditor";
        AccessibleViewProviderId["Notebook"] = "notebook";
        AccessibleViewProviderId["Editor"] = "editor";
        AccessibleViewProviderId["Hover"] = "hover";
        AccessibleViewProviderId["Notification"] = "notification";
        AccessibleViewProviderId["EmptyEditorHint"] = "emptyEditorHint";
        AccessibleViewProviderId["Comments"] = "comments";
    })(AccessibleViewProviderId || (exports.AccessibleViewProviderId = AccessibleViewProviderId = {}));
    const baseProperty = {
        type: 'boolean',
        default: true,
        tags: ['accessibility']
    };
    exports.accessibilityConfigurationNodeBase = Object.freeze({
        id: 'accessibility',
        title: (0, nls_1.localize)('accessibilityConfigurationTitle', "Accessibility"),
        type: 'object'
    });
    const configuration = {
        ...exports.accessibilityConfigurationNodeBase,
        properties: {
            ["accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */]: {
                description: (0, nls_1.localize)('verbosity.terminal.description', 'Provide information about how to access the terminal accessibility help menu when the terminal is focused.'),
                ...baseProperty
            },
            ["accessibility.verbosity.diffEditor" /* AccessibilityVerbositySettingId.DiffEditor */]: {
                description: (0, nls_1.localize)('verbosity.diffEditor.description', 'Provide information about how to navigate changes in the diff editor when it is focused.'),
                ...baseProperty
            },
            ["accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */]: {
                description: (0, nls_1.localize)('verbosity.chat.description', 'Provide information about how to access the chat help menu when the chat input is focused.'),
                ...baseProperty
            },
            ["accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */]: {
                description: (0, nls_1.localize)('verbosity.interactiveEditor.description', 'Provide information about how to access the inline editor chat accessibility help menu and alert with hints that describe how to use the feature when the input is focused.'),
                ...baseProperty
            },
            ["accessibility.verbosity.inlineCompletions" /* AccessibilityVerbositySettingId.InlineCompletions */]: {
                description: (0, nls_1.localize)('verbosity.inlineCompletions.description', 'Provide information about how to access the inline completions hover and Accessible View.'),
                ...baseProperty
            },
            ["accessibility.verbosity.keybindingsEditor" /* AccessibilityVerbositySettingId.KeybindingsEditor */]: {
                description: (0, nls_1.localize)('verbosity.keybindingsEditor.description', 'Provide information about how to change a keybinding in the keybindings editor when a row is focused.'),
                ...baseProperty
            },
            ["accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */]: {
                description: (0, nls_1.localize)('verbosity.notebook', 'Provide information about how to focus the cell container or inner editor when a notebook cell is focused.'),
                ...baseProperty
            },
            ["accessibility.verbosity.hover" /* AccessibilityVerbositySettingId.Hover */]: {
                description: (0, nls_1.localize)('verbosity.hover', 'Provide information about how to open the hover in an Accessible View.'),
                ...baseProperty
            },
            ["accessibility.verbosity.notification" /* AccessibilityVerbositySettingId.Notification */]: {
                description: (0, nls_1.localize)('verbosity.notification', 'Provide information about how to open the notification in an Accessible View.'),
                ...baseProperty
            },
            ["accessibility.verbosity.emptyEditorHint" /* AccessibilityVerbositySettingId.EmptyEditorHint */]: {
                description: (0, nls_1.localize)('verbosity.emptyEditorHint', 'Provide information about relevant actions in an empty text editor.'),
                ...baseProperty
            },
            ["accessibility.verbosity.comments" /* AccessibilityVerbositySettingId.Comments */]: {
                description: (0, nls_1.localize)('verbosity.comments', 'Provide information about actions that can be taken in the comment widget or in a file which contains comments.'),
                ...baseProperty
            },
            ["accessibility.alert.save" /* AccessibilityAlertSettingId.Save */]: {
                'markdownDescription': (0, nls_1.localize)('alert.save', "Alerts when a file is saved. Also see {0}.", '`#audioCues.save#`'),
                'enum': ['userGesture', 'always', 'never'],
                'default': 'always',
                'enumDescriptions': [
                    (0, nls_1.localize)('alert.save.userGesture', "Alerts when a file is saved via user gesture."),
                    (0, nls_1.localize)('alert.save.always', "Alerts whenever is a file is saved, including auto save."),
                    (0, nls_1.localize)('alert.save.never', "Never alerts.")
                ],
                tags: ['accessibility']
            },
            ["accessibility.alert.clear" /* AccessibilityAlertSettingId.Clear */]: {
                'markdownDescription': (0, nls_1.localize)('alert.clear', "Alerts when a feature is cleared (for example, the terminal, Debug Console, or Output channel). Also see {0}.", '`#audioCues.clear#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.format" /* AccessibilityAlertSettingId.Format */]: {
                'markdownDescription': (0, nls_1.localize)('alert.format', "Alerts when a file or notebook cell is formatted. Also see {0}.", '`#audioCues.format#`'),
                'type': 'string',
                'enum': ['userGesture', 'always', 'never'],
                'default': 'always',
                'enumDescriptions': [
                    (0, nls_1.localize)('alert.format.userGesture', "Alerts when a file is formatted via user gesture."),
                    (0, nls_1.localize)('alert.format.always', "Alerts whenever is a file is formatted, including auto save, on cell execution, and more."),
                    (0, nls_1.localize)('alert.format.never', "Never alerts.")
                ],
                tags: ['accessibility']
            },
            ["accessibility.alert.breakpoint" /* AccessibilityAlertSettingId.Breakpoint */]: {
                'markdownDescription': (0, nls_1.localize)('alert.breakpoint', "Alerts when the active line has a breakpoint. Also see {0}.", '`#audioCues.onDebugBreak#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.error" /* AccessibilityAlertSettingId.Error */]: {
                'markdownDescription': (0, nls_1.localize)('alert.error', "Alerts when the active line has an error. Also see {0}.", '`#audioCues.lineHasError#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.warning" /* AccessibilityAlertSettingId.Warning */]: {
                'markdownDescription': (0, nls_1.localize)('alert.warning', "Alerts when the active line has a warning. Also see {0}.", '`#audioCues.lineHasWarning#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.foldedArea" /* AccessibilityAlertSettingId.FoldedArea */]: {
                'markdownDescription': (0, nls_1.localize)('alert.foldedArea', "Alerts when the active line has a folded area that can be unfolded. Also see {0}.", '`#audioCues.lineHasFoldedArea#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.terminalQuickFix" /* AccessibilityAlertSettingId.TerminalQuickFix */]: {
                'markdownDescription': (0, nls_1.localize)('alert.terminalQuickFix', "Alerts when there is an available terminal quick fix. Also see {0}.", '`#audioCues.terminalQuickFix#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.terminalBell" /* AccessibilityAlertSettingId.TerminalBell */]: {
                'markdownDescription': (0, nls_1.localize)('alert.terminalBell', "Alerts when the terminal bell is activated."),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.terminalCommandFailed" /* AccessibilityAlertSettingId.TerminalCommandFailed */]: {
                'markdownDescription': (0, nls_1.localize)('alert.terminalCommandFailed', "Alerts when a terminal command fails (non-zero exit code). Also see {0}.", '`#audioCues.terminalCommandFailed#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.taskFailed" /* AccessibilityAlertSettingId.TaskFailed */]: {
                'markdownDescription': (0, nls_1.localize)('alert.taskFailed', "Alerts when a task fails (non-zero exit code). Also see {0}.", '`#audioCues.taskFailed#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.taskCompleted" /* AccessibilityAlertSettingId.TaskCompleted */]: {
                'markdownDescription': (0, nls_1.localize)('alert.taskCompleted', "Alerts when a task completes successfully (zero exit code). Also see {0}.", '`#audioCues.taskCompleted#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.chatRequestSent" /* AccessibilityAlertSettingId.ChatRequestSent */]: {
                'markdownDescription': (0, nls_1.localize)('alert.chatRequestSent', "Alerts when a chat request is sent. Also see {0}.", '`#audioCues.chatRequestSent#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.chatResponsePending" /* AccessibilityAlertSettingId.ChatResponsePending */]: {
                'markdownDescription': (0, nls_1.localize)('alert.chatResponsePending', "Alerts when a chat response is pending. Also see {0}.", '`#audioCues.chatResponsePending#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.noInlayHints" /* AccessibilityAlertSettingId.NoInlayHints */]: {
                'markdownDescription': (0, nls_1.localize)('alert.noInlayHints', "Alerts when there are no inlay hints. Also see {0}.", '`#audioCues.noInlayHints#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.lineHasBreakpoint" /* AccessibilityAlertSettingId.LineHasBreakpoint */]: {
                'markdownDescription': (0, nls_1.localize)('alert.lineHasBreakpoint', "Alerts when on a line with a breakpoint. Also see {0}.", '`#audioCues.lineHasBreakpoint#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.notebookCellCompleted" /* AccessibilityAlertSettingId.NotebookCellCompleted */]: {
                'markdownDescription': (0, nls_1.localize)('alert.notebookCellCompleted', "Alerts when a notebook cell completes successfully. Also see {0}.", '`#audioCues.notebookCellCompleted#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.notebookCellFailed" /* AccessibilityAlertSettingId.NotebookCellFailed */]: {
                'markdownDescription': (0, nls_1.localize)('alert.notebookCellFailed', "Alerts when a notebook cell fails. Also see {0}.", '`#audioCues.notebookCellFailed#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.alert.onDebugBreak" /* AccessibilityAlertSettingId.OnDebugBreak */]: {
                'markdownDescription': (0, nls_1.localize)('alert.onDebugBreak', "Alerts when the debugger breaks. Also see {0}.", '`#audioCues.onDebugBreak#`'),
                'type': 'boolean',
                'default': true,
                tags: ['accessibility']
            },
            ["accessibility.accessibleView.closeOnKeyPress" /* AccessibilityWorkbenchSettingId.AccessibleViewCloseOnKeyPress */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.accessibleView.closeOnKeyPress', "On keypress, close the Accessible View and focus the element from which it was invoked."),
                type: 'boolean',
                default: true
            },
        }
    };
    function registerAccessibilityConfiguration() {
        const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        registry.registerConfiguration(configuration);
        registry.registerConfiguration({
            ...configuration_1.workbenchConfigurationNodeBase,
            properties: {
                ["accessibility.dimUnfocused.enabled" /* AccessibilityWorkbenchSettingId.DimUnfocusedEnabled */]: {
                    description: (0, nls_1.localize)('dimUnfocusedEnabled', 'Whether to dim unfocused editors and terminals, which makes it more clear where typed input will go to. This works with the majority of editors with the notable exceptions of those that utilize iframes like notebooks and extension webview editors.'),
                    type: 'boolean',
                    default: false,
                    tags: ['accessibility'],
                    scope: 1 /* ConfigurationScope.APPLICATION */,
                },
                ["accessibility.dimUnfocused.opacity" /* AccessibilityWorkbenchSettingId.DimUnfocusedOpacity */]: {
                    markdownDescription: (0, nls_1.localize)('dimUnfocusedOpacity', 'The opacity fraction (0.2 to 1.0) to use for unfocused editors and terminals. This will only take effect when {0} is enabled.', `\`#${"accessibility.dimUnfocused.enabled" /* AccessibilityWorkbenchSettingId.DimUnfocusedEnabled */}#\``),
                    type: 'number',
                    minimum: 0.2 /* ViewDimUnfocusedOpacityProperties.Minimum */,
                    maximum: 1 /* ViewDimUnfocusedOpacityProperties.Maximum */,
                    default: 0.75 /* ViewDimUnfocusedOpacityProperties.Default */,
                    tags: ['accessibility'],
                    scope: 1 /* ConfigurationScope.APPLICATION */,
                },
                ["accessibility.hideAccessibleView" /* AccessibilityWorkbenchSettingId.HideAccessibleView */]: {
                    description: (0, nls_1.localize)('accessibility.hideAccessibleView', "Controls whether the Accessible View is hidden."),
                    type: 'boolean',
                    default: false,
                    tags: ['accessibility']
                }
            }
        });
    }
    exports.registerAccessibilityConfiguration = registerAccessibilityConfiguration;
    var AccessibilityVoiceSettingId;
    (function (AccessibilityVoiceSettingId) {
        AccessibilityVoiceSettingId["SpeechTimeout"] = "accessibility.voice.speechTimeout";
    })(AccessibilityVoiceSettingId || (exports.AccessibilityVoiceSettingId = AccessibilityVoiceSettingId = {}));
    exports.SpeechTimeoutDefault = 1200;
    let DynamicSpeechAccessibilityConfiguration = class DynamicSpeechAccessibilityConfiguration extends lifecycle_1.Disposable {
        constructor(speechService) {
            super();
            this.speechService = speechService;
            this._register(event_1.Event.runAndSubscribe(speechService.onDidRegisterSpeechProvider, () => this.updateConfiguration()));
        }
        updateConfiguration() {
            if (!this.speechService.hasSpeechProvider) {
                return; // these settings require a speech provider
            }
            const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            registry.registerConfiguration({
                ...exports.accessibilityConfigurationNodeBase,
                properties: {
                    ["accessibility.voice.speechTimeout" /* AccessibilityVoiceSettingId.SpeechTimeout */]: {
                        'markdownDescription': (0, nls_1.localize)('voice.speechTimeout', "The duration in milliseconds that voice speech recognition remains active after you stop speaking. For example in a chat session, the transcribed text is submitted automatically after the timeout is met. Set to `0` to disable this feature."),
                        'type': 'number',
                        'default': exports.SpeechTimeoutDefault,
                        'minimum': 0,
                        'tags': ['accessibility']
                    }
                }
            });
        }
    };
    exports.DynamicSpeechAccessibilityConfiguration = DynamicSpeechAccessibilityConfiguration;
    exports.DynamicSpeechAccessibilityConfiguration = DynamicSpeechAccessibilityConfiguration = __decorate([
        __param(0, speechService_1.ISpeechService)
    ], DynamicSpeechAccessibilityConfiguration);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJpbGl0eUNvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2FjY2Vzc2liaWxpdHkvYnJvd3Nlci9hY2Nlc3NpYmlsaXR5Q29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhbkYsUUFBQSx3QkFBd0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9GLFFBQUEscUJBQXFCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHVCQUF1QixFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN6RixRQUFBLGdDQUFnQyxHQUFHLElBQUksMEJBQWEsQ0FBVSxrQ0FBa0MsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0csUUFBQSw4QkFBOEIsR0FBRyxJQUFJLDBCQUFhLENBQVUsZ0NBQWdDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNHLFFBQUEsaUNBQWlDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLG1DQUFtQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqSCxRQUFBLHdCQUF3QixHQUFHLElBQUksMEJBQWEsQ0FBVSwwQkFBMEIsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0YsUUFBQSwrQkFBK0IsR0FBRyxJQUFJLDBCQUFhLENBQVMsaUNBQWlDLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBRWxJOzs7T0FHRztJQUNILElBQWtCLCtCQUtqQjtJQUxELFdBQWtCLCtCQUErQjtRQUNoRCw2RkFBMEQsQ0FBQTtRQUMxRCw2RkFBMEQsQ0FBQTtRQUMxRCwwRkFBdUQsQ0FBQTtRQUN2RCxpSEFBOEUsQ0FBQTtJ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