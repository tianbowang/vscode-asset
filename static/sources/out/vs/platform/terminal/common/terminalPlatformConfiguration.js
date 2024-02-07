/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/platform", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/terminal/common/terminalProfiles"], function (require, exports, codicons_1, platform_1, nls_1, configurationRegistry_1, platform_2, terminalProfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerTerminalDefaultProfileConfiguration = exports.registerTerminalPlatformConfiguration = exports.terminalIconSchema = exports.terminalColorSchema = void 0;
    exports.terminalColorSchema = {
        type: ['string', 'null'],
        enum: [
            'terminal.ansiBlack',
            'terminal.ansiRed',
            'terminal.ansiGreen',
            'terminal.ansiYellow',
            'terminal.ansiBlue',
            'terminal.ansiMagenta',
            'terminal.ansiCyan',
            'terminal.ansiWhite'
        ],
        default: null
    };
    exports.terminalIconSchema = {
        type: 'string',
        enum: Array.from((0, codicons_1.getAllCodicons)(), icon => icon.id),
        markdownEnumDescriptions: Array.from((0, codicons_1.getAllCodicons)(), icon => `$(${icon.id})`),
    };
    const terminalProfileBaseProperties = {
        args: {
            description: (0, nls_1.localize)('terminalProfile.args', 'An optional set of arguments to run the shell executable with.'),
            type: 'array',
            items: {
                type: 'string'
            }
        },
        overrideName: {
            description: (0, nls_1.localize)('terminalProfile.overrideName', 'Whether or not to replace the dynamic terminal title that detects what program is running with the static profile name.'),
            type: 'boolean'
        },
        icon: {
            description: (0, nls_1.localize)('terminalProfile.icon', 'A codicon ID to associate with the terminal icon.'),
            ...exports.terminalIconSchema
        },
        color: {
            description: (0, nls_1.localize)('terminalProfile.color', 'A theme color ID to associate with the terminal icon.'),
            ...exports.terminalColorSchema
        },
        env: {
            markdownDescription: (0, nls_1.localize)('terminalProfile.env', "An object with environment variables that will be added to the terminal profile process. Set to `null` to delete environment variables from the base environment."),
            type: 'object',
            additionalProperties: {
                type: ['string', 'null']
            },
            default: {}
        }
    };
    const terminalProfileSchema = {
        type: 'object',
        required: ['path'],
        properties: {
            path: {
                description: (0, nls_1.localize)('terminalProfile.path', 'A single path to a shell executable or an array of paths that will be used as fallbacks when one fails.'),
                type: ['string', 'array'],
                items: {
                    type: 'string'
                }
            },
            ...terminalProfileBaseProperties
        }
    };
    const terminalAutomationProfileSchema = {
        type: 'object',
        required: ['path'],
        properties: {
            path: {
                description: (0, nls_1.localize)('terminalAutomationProfile.path', 'A single path to a shell executable.'),
                type: ['string'],
                items: {
                    type: 'string'
                }
            },
            ...terminalProfileBaseProperties
        }
    };
    function createTerminalProfileMarkdownDescription(platform) {
        const key = platform === 2 /* Platform.Linux */ ? 'linux' : platform === 1 /* Platform.Mac */ ? 'osx' : 'windows';
        return (0, nls_1.localize)({
            key: 'terminal.integrated.profile',
            comment: ['{0} is the platform, {1} is a code block, {2} and {3} are a link start and end']
        }, "A set of terminal profile customizations for {0} which allows adding, removing or changing how terminals are launched. Profiles are made up of a mandatory path, optional arguments and other presentation options.\n\nTo override an existing profile use its profile name as the key, for example:\n\n{1}\n\n{2}Read more about configuring profiles{3}.", (0, platform_1.PlatformToString)(platform), '```json\n"terminal.integrated.profile.' + key + '": {\n  "bash": null\n}\n```', '[', '](https://code.visualstudio.com/docs/terminal/profiles)');
    }
    const terminalPlatformConfiguration = {
        id: 'terminal',
        order: 100,
        title: (0, nls_1.localize)('terminalIntegratedConfigurationTitle', "Integrated Terminal"),
        type: 'object',
        properties: {
            ["terminal.integrated.automationProfile.linux" /* TerminalSettingId.AutomationProfileLinux */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.automationProfile.linux', "The terminal profile to use on Linux for automation-related terminal usage like tasks and debug."),
                type: ['object', 'null'],
                default: null,
                'anyOf': [
                    { type: 'null' },
                    terminalAutomationProfileSchema
                ],
                defaultSnippets: [
                    {
                        body: {
                            path: '${1}',
                            icon: '${2}'
                        }
                    }
                ]
            },
            ["terminal.integrated.automationProfile.osx" /* TerminalSettingId.AutomationProfileMacOs */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.automationProfile.osx', "The terminal profile to use on macOS for automation-related terminal usage like tasks and debug."),
                type: ['object', 'null'],
                default: null,
                'anyOf': [
                    { type: 'null' },
                    terminalAutomationProfileSchema
                ],
                defaultSnippets: [
                    {
                        body: {
                            path: '${1}',
                            icon: '${2}'
                        }
                    }
                ]
            },
            ["terminal.integrated.automationProfile.windows" /* TerminalSettingId.AutomationProfileWindows */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.automationProfile.windows', "The terminal profile to use for automation-related terminal usage like tasks and debug. This setting will currently be ignored if {0} (now deprecated) is set.", '`terminal.integrated.automationShell.windows`'),
                type: ['object', 'null'],
                default: null,
                'anyOf': [
                    { type: 'null' },
                    terminalAutomationProfileSchema
                ],
                defaultSnippets: [
                    {
                        body: {
                            path: '${1}',
                            icon: '${2}'
                        }
                    }
                ]
            },
            ["terminal.integrated.profiles.windows" /* TerminalSettingId.ProfilesWindows */]: {
                restricted: true,
                markdownDescription: createTerminalProfileMarkdownDescription(3 /* Platform.Windows */),
                type: 'object',
                default: {
                    'PowerShell': {
                        source: 'PowerShell',
                        icon: 'terminal-powershell'
                    },
                    'Command Prompt': {
                        path: [
                            '${env:windir}\\Sysnative\\cmd.exe',
                            '${env:windir}\\System32\\cmd.exe'
                        ],
                        args: [],
                        icon: 'terminal-cmd'
                    },
                    'Git Bash': {
                        source: 'Git Bash'
                    }
                },
                additionalProperties: {
                    'anyOf': [
                        {
                            type: 'object',
                            required: ['source'],
                            properties: {
                                source: {
                                    description: (0, nls_1.localize)('terminalProfile.windowsSource', 'A profile source that will auto detect the paths to the shell. Note that non-standard executable locations are not supported and must be created manually in a new profile.'),
                                    enum: ['PowerShell', 'Git Bash']
                                },
                                ...terminalProfileBaseProperties
                            }
                        },
                        {
                            type: 'object',
                            required: ['extensionIdentifier', 'id', 'title'],
                            properties: {
                                extensionIdentifier: {
                                    description: (0, nls_1.localize)('terminalProfile.windowsExtensionIdentifier', 'The extension that contributed this profile.'),
                                    type: 'string'
                                },
                                id: {
                                    description: (0, nls_1.localize)('terminalProfile.windowsExtensionId', 'The id of the extension terminal'),
                                    type: 'string'
                                },
                                title: {
                                    description: (0, nls_1.localize)('terminalProfile.windowsExtensionTitle', 'The name of the extension terminal'),
                                    type: 'string'
                                },
                                ...terminalProfileBaseProperties
                            }
                        },
                        { type: 'null' },
                        terminalProfileSchema
                    ]
                }
            },
            ["terminal.integrated.profiles.osx" /* TerminalSettingId.ProfilesMacOs */]: {
                restricted: true,
                markdownDescription: createTerminalProfileMarkdownDescription(1 /* Platform.Mac */),
                type: 'object',
                default: {
                    'bash': {
                        path: 'bash',
                        args: ['-l'],
                        icon: 'terminal-bash'
                    },
                    'zsh': {
                        path: 'zsh',
                        args: ['-l']
                    },
                    'fish': {
                        path: 'fish',
                        args: ['-l']
                    },
                    'tmux': {
                        path: 'tmux',
                        icon: 'terminal-tmux'
                    },
                    'pwsh': {
                        path: 'pwsh',
                        icon: 'terminal-powershell'
                    }
                },
                additionalProperties: {
                    'anyOf': [
                        {
                            type: 'object',
                            required: ['extensionIdentifier', 'id', 'title'],
                            properties: {
                                extensionIdentifier: {
                                    description: (0, nls_1.localize)('terminalProfile.osxExtensionIdentifier', 'The extension that contributed this profile.'),
                                    type: 'string'
                                },
                                id: {
                                    description: (0, nls_1.localize)('terminalProfile.osxExtensionId', 'The id of the extension terminal'),
                                    type: 'string'
                                },
                                title: {
                                    description: (0, nls_1.localize)('terminalProfile.osxExtensionTitle', 'The name of the extension terminal'),
                                    type: 'string'
                                },
                                ...terminalProfileBaseProperties
                            }
                        },
                        { type: 'null' },
                        terminalProfileSchema
                    ]
                }
            },
            ["terminal.integrated.profiles.linux" /* TerminalSettingId.ProfilesLinux */]: {
                restricted: true,
                markdownDescription: createTerminalProfileMarkdownDescription(2 /* Platform.Linux */),
                type: 'object',
                default: {
                    'bash': {
                        path: 'bash',
                        icon: 'terminal-bash'
                    },
                    'zsh': {
                        path: 'zsh'
                    },
                    'fish': {
                        path: 'fish'
                    },
                    'tmux': {
                        path: 'tmux',
                        icon: 'terminal-tmux'
                    },
                    'pwsh': {
                        path: 'pwsh',
                        icon: 'terminal-powershell'
                    }
                },
                additionalProperties: {
                    'anyOf': [
                        {
                            type: 'object',
                            required: ['extensionIdentifier', 'id', 'title'],
                            properties: {
                                extensionIdentifier: {
                                    description: (0, nls_1.localize)('terminalProfile.linuxExtensionIdentifier', 'The extension that contributed this profile.'),
                                    type: 'string'
                                },
                                id: {
                                    description: (0, nls_1.localize)('terminalProfile.linuxExtensionId', 'The id of the extension terminal'),
                                    type: 'string'
                                },
                                title: {
                                    description: (0, nls_1.localize)('terminalProfile.linuxExtensionTitle', 'The name of the extension terminal'),
                                    type: 'string'
                                },
                                ...terminalProfileBaseProperties
                            }
                        },
                        { type: 'null' },
                        terminalProfileSchema
                    ]
                }
            },
            ["terminal.integrated.useWslProfiles" /* TerminalSettingId.UseWslProfiles */]: {
                description: (0, nls_1.localize)('terminal.integrated.useWslProfiles', 'Controls whether or not WSL distros are shown in the terminal dropdown'),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.inheritEnv" /* TerminalSettingId.InheritEnv */]: {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                description: (0, nls_1.localize)('terminal.integrated.inheritEnv', "Whether new shells should inherit their environment from VS Code, which may source a login shell to ensure $PATH and other development variables are initialized. This has no effect on Windows."),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.persistentSessionScrollback" /* TerminalSettingId.PersistentSessionScrollback */]: {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.persistentSessionScrollback', "Controls the maximum amount of lines that will be restored when reconnecting to a persistent terminal session. Increasing this will restore more lines of scrollback at the cost of more memory and increase the time it takes to connect to terminals on start up. This setting requires a restart to take effect and should be set to a value less than or equal to `#terminal.integrated.scrollback#`."),
                type: 'number',
                default: 100
            },
            ["terminal.integrated.showLinkHover" /* TerminalSettingId.ShowLinkHover */]: {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                description: (0, nls_1.localize)('terminal.integrated.showLinkHover', "Whether to show hovers for links in the terminal output."),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.ignoreProcessNames" /* TerminalSettingId.IgnoreProcessNames */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.confirmIgnoreProcesses', "A set of process names to ignore when using the {0} setting.", '`#terminal.integrated.confirmOnKill#`'),
                type: 'array',
                items: {
                    type: 'string',
                    uniqueItems: true
                },
                default: [
                    // Popular prompt programs, these should not count as child processes
                    'starship',
                    'oh-my-posh',
                    // Git bash may runs a subprocess of itself (bin\bash.exe -> usr\bin\bash.exe)
                    'bash',
                    'zsh',
                ]
            }
        }
    };
    /**
     * Registers terminal configurations required by shared process and remote server.
     */
    function registerTerminalPlatformConfiguration() {
        platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration(terminalPlatformConfiguration);
        registerTerminalDefaultProfileConfiguration();
    }
    exports.registerTerminalPlatformConfiguration = registerTerminalPlatformConfiguration;
    let defaultProfilesConfiguration;
    function registerTerminalDefaultProfileConfiguration(detectedProfiles, extensionContributedProfiles) {
        const registry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
        let profileEnum;
        if (detectedProfiles) {
            profileEnum = (0, terminalProfiles_1.createProfileSchemaEnums)(detectedProfiles?.profiles, extensionContributedProfiles);
        }
        const oldDefaultProfilesConfiguration = defaultProfilesConfiguration;
        defaultProfilesConfiguration = {
            id: 'terminal',
            order: 100,
            title: (0, nls_1.localize)('terminalIntegratedConfigurationTitle', "Integrated Terminal"),
            type: 'object',
            properties: {
                ["terminal.integrated.defaultProfile.linux" /* TerminalSettingId.DefaultProfileLinux */]: {
                    restricted: true,
                    markdownDescription: (0, nls_1.localize)('terminal.integrated.defaultProfile.linux', "The default terminal profile on Linux."),
                    type: ['string', 'null'],
                    default: null,
                    enum: detectedProfiles?.os === 3 /* OperatingSystem.Linux */ ? profileEnum?.values : undefined,
                    markdownEnumDescriptions: detectedProfiles?.os === 3 /* OperatingSystem.Linux */ ? profileEnum?.markdownDescriptions : undefined
                },
                ["terminal.integrated.defaultProfile.osx" /* TerminalSettingId.DefaultProfileMacOs */]: {
                    restricted: true,
                    markdownDescription: (0, nls_1.localize)('terminal.integrated.defaultProfile.osx', "The default terminal profile on macOS."),
                    type: ['string', 'null'],
                    default: null,
                    enum: detectedProfiles?.os === 2 /* OperatingSystem.Macintosh */ ? profileEnum?.values : undefined,
                    markdownEnumDescriptions: detectedProfiles?.os === 2 /* OperatingSystem.Macintosh */ ? profileEnum?.markdownDescriptions : undefined
                },
                ["terminal.integrated.defaultProfile.windows" /* TerminalSettingId.DefaultProfileWindows */]: {
                    restricted: true,
                    markdownDescription: (0, nls_1.localize)('terminal.integrated.defaultProfile.windows', "The default terminal profile on Windows."),
                    type: ['string', 'null'],
                    default: null,
                    enum: detectedProfiles?.os === 1 /* OperatingSystem.Windows */ ? profileEnum?.values : undefined,
                    markdownEnumDescriptions: detectedProfiles?.os === 1 /* OperatingSystem.Windows */ ? profileEnum?.markdownDescriptions : undefined
                },
            }
        };
        registry.updateConfigurations({ add: [defaultProfilesConfiguration], remove: oldDefaultProfilesConfiguration ? [oldDefaultProfilesConfiguration] : [] });
    }
    exports.registerTerminalDefaultProfileConfiguration = registerTerminalDefaultProfileConfiguration;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQbGF0Zm9ybUNvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Rlcm1pbmFsL2NvbW1vbi90ZXJtaW5hbFBsYXRmb3JtQ29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXbkYsUUFBQSxtQkFBbUIsR0FBZ0I7UUFDL0MsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztRQUN4QixJQUFJLEVBQUU7WUFDTCxvQkFBb0I7WUFDcEIsa0JBQWtCO1lBQ2xCLG9CQUFvQjtZQUNwQixxQkFBcUI7WUFDckIsbUJBQW1CO1lBQ25CLHNCQUFzQjtZQUN0QixtQkFBbUI7WUFDbkIsb0JBQW9CO1NBQ3BCO1FBQ0QsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO0lBRVcsUUFBQSxrQkFBa0IsR0FBZ0I7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFBLHlCQUFjLEdBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDbkQsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFBLHlCQUFjLEdBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDO0tBQy9FLENBQUM7SUFFRixNQUFNLDZCQUE2QixHQUFtQjtRQUNyRCxJQUFJLEVBQUU7WUFDTCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUsZ0VBQWdFLENBQUM7WUFDL0csSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLFFBQVE7YUFDZDtTQUNEO1FBQ0QsWUFBWSxFQUFFO1lBQ2IsV0FBVyxFQUFFLElB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