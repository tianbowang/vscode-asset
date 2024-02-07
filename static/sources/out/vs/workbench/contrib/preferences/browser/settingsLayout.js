/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.knownTermMappings = exports.knownAcronyms = exports.tocData = exports.getCommonlyUsedData = void 0;
    const defaultCommonlyUsedSettings = [
        'files.autoSave',
        'editor.fontSize',
        'editor.fontFamily',
        'editor.tabSize',
        'editor.renderWhitespace',
        'editor.cursorStyle',
        'editor.multiCursorModifier',
        'editor.insertSpaces',
        'editor.wordWrap',
        'files.exclude',
        'files.associations',
        'workbench.editor.enablePreview'
    ];
    function getCommonlyUsedData(toggleData) {
        return {
            id: 'commonlyUsed',
            label: (0, nls_1.localize)('commonlyUsed', "Commonly Used"),
            settings: toggleData?.commonlyUsed ?? defaultCommonlyUsedSettings
        };
    }
    exports.getCommonlyUsedData = getCommonlyUsedData;
    exports.tocData = {
        id: 'root',
        label: 'root',
        children: [
            {
                id: 'editor',
                label: (0, nls_1.localize)('textEditor', "Text Editor"),
                settings: ['editor.*'],
                children: [
                    {
                        id: 'editor/cursor',
                        label: (0, nls_1.localize)('cursor', "Cursor"),
                        settings: ['editor.cursor*']
                    },
                    {
                        id: 'editor/find',
                        label: (0, nls_1.localize)('find', "Find"),
                        settings: ['editor.find.*']
                    },
                    {
                        id: 'editor/font',
                        label: (0, nls_1.localize)('font', "Font"),
                        settings: ['editor.font*']
                    },
                    {
                        id: 'editor/format',
                        label: (0, nls_1.localize)('formatting', "Formatting"),
                        settings: ['editor.format*']
                    },
                    {
                        id: 'editor/diffEditor',
                        label: (0, nls_1.localize)('diffEditor', "Diff Editor"),
                        settings: ['diffEditor.*']
                    },
                    {
                        id: 'editor/multiDiffEditor',
                        label: (0, nls_1.localize)('multiDiffEditor', "Multi-File Diff Editor"),
                        settings: ['multiDiffEditor.*']
                    },
                    {
                        id: 'editor/minimap',
                        label: (0, nls_1.localize)('minimap', "Minimap"),
                        settings: ['editor.minimap.*']
                    },
                    {
                        id: 'editor/suggestions',
                        label: (0, nls_1.localize)('suggestions', "Suggestions"),
                        settings: ['editor.*suggest*']
                    },
                    {
                        id: 'editor/files',
                        label: (0, nls_1.localize)('files', "Files"),
                        settings: ['files.*']
                    }
                ]
            },
            {
                id: 'workbench',
                label: (0, nls_1.localize)('workbench', "Workbench"),
                settings: ['workbench.*'],
                children: [
                    {
                        id: 'workbench/appearance',
                        label: (0, nls_1.localize)('appearance', "Appearance"),
                        settings: ['workbench.activityBar.*', 'workbench.*color*', 'workbench.fontAliasing', 'workbench.iconTheme', 'workbench.sidebar.location', 'workbench.*.visible', 'workbench.tips.enabled', 'workbench.tree.*', 'workbench.view.*']
                    },
                    {
                        id: 'workbench/breadcrumbs',
                        label: (0, nls_1.localize)('breadcrumbs', "Breadcrumbs"),
                        settings: ['breadcrumbs.*']
                    },
                    {
                        id: 'workbench/editor',
                        label: (0, nls_1.localize)('editorManagement', "Editor Management"),
                        settings: ['workbench.editor.*']
                    },
                    {
                        id: 'workbench/settings',
                        label: (0, nls_1.localize)('settings', "Settings Editor"),
                        settings: ['workbench.settings.*']
                    },
                    {
                        id: 'workbench/zenmode',
                        label: (0, nls_1.localize)('zenMode', "Zen Mode"),
                        settings: ['zenmode.*']
                    },
                    {
                        id: 'workbench/screencastmode',
                        label: (0, nls_1.localize)('screencastMode', "Screencast Mode"),
                        settings: ['screencastMode.*']
                    }
                ]
            },
            {
                id: 'window',
                label: (0, nls_1.localize)('window', "Window"),
                settings: ['window.*'],
                children: [
                    {
                        id: 'window/newWindow',
                        label: (0, nls_1.localize)('newWindow', "New Window"),
                        settings: ['window.*newwindow*']
                    }
                ]
            },
            {
                id: 'features',
                label: (0, nls_1.localize)('features', "Features"),
                children: [
                    {
                        id: 'features/accessibility',
                        label: (0, nls_1.localize)('accessibility', "Accessibility"),
                        settings: ['accessibility.*']
                    },
                    {
                        id: 'features/explorer',
                        label: (0, nls_1.localize)('fileExplorer', "Explorer"),
                        settings: ['explorer.*', 'outline.*']
                    },
                    {
                        id: 'features/search',
                        label: (0, nls_1.localize)('search', "Search"),
                        settings: ['search.*']
                    },
                    {
                        id: 'features/debug',
                        label: (0, nls_1.localize)('debug', "Debug"),
                        settings: ['debug.*', 'launch']
                    },
                    {
                        id: 'features/testing',
                        label: (0, nls_1.localize)('testing', "Testing"),
                        settings: ['testing.*']
                    },
                    {
                        id: 'features/scm',
                        label: (0, nls_1.localize)('scm', "Source Control"),
                        settings: ['scm.*']
                    },
                    {
                        id: 'features/extensions',
                        label: (0, nls_1.localize)('extensions', "Extensions"),
                        settings: ['extensions.*']
                    },
                    {
                        id: 'features/terminal',
                        label: (0, nls_1.localize)('terminal', "Terminal"),
                        settings: ['terminal.*']
                    },
                    {
                        id: 'features/task',
                        label: (0, nls_1.localize)('task', "Task"),
                        settings: ['task.*']
                    },
                    {
                        id: 'features/problems',
                        label: (0, nls_1.localize)('problems', "Problems"),
                        settings: ['problems.*']
                    },
                    {
                        id: 'features/output',
                        label: (0, nls_1.localize)('output', "Output"),
                        settings: ['output.*']
                    },
                    {
                        id: 'features/comments',
                        label: (0, nls_1.localize)('comments', "Comments"),
                        settings: ['comments.*']
                    },
                    {
                        id: 'features/remote',
                        label: (0, nls_1.localize)('remote', "Remote"),
                        settings: ['remote.*']
                    },
                    {
                        id: 'features/timeline',
                        label: (0, nls_1.localize)('timeline', "Timeline"),
                        settings: ['timeline.*']
                    },
                    {
                        id: 'features/notebook',
                        label: (0, nls_1.localize)('notebook', 'Notebook'),
                        settings: ['notebook.*', 'interactiveWindow.*']
                    },
                    {
                        id: 'features/audioCues',
                        label: (0, nls_1.localize)('audioCues', 'Audio Cues'),
                        settings: ['audioCues.*']
                    },
                    {
                        id: 'features/mergeEditor',
                        label: (0, nls_1.localize)('mergeEditor', 'Merge Editor'),
                        settings: ['mergeEditor.*']
                    },
                    {
                        id: 'features/chat',
                        label: (0, nls_1.localize)('chat', 'Chat'),
                        settings: ['chat.*', 'inlineChat.*']
                    }
                ]
            },
            {
                id: 'application',
                label: (0, nls_1.localize)('application', "Application"),
                children: [
                    {
                        id: 'application/http',
                        label: (0, nls_1.localize)('proxy', "Proxy"),
                        settings: ['http.*']
                    },
                    {
                        id: 'application/keyboard',
                        label: (0, nls_1.localize)('keyboard', "Keyboard"),
                        settings: ['keyboard.*']
                    },
                    {
                        id: 'application/update',
                        label: (0, nls_1.localize)('update', "Update"),
                        settings: ['update.*']
                    },
                    {
                        id: 'application/telemetry',
                        label: (0, nls_1.localize)('telemetry', "Telemetry"),
                        settings: ['telemetry.*']
                    },
                    {
                        id: 'application/settingsSync',
                        label: (0, nls_1.localize)('settingsSync', "Settings Sync"),
                        settings: ['settingsSync.*']
                    },
                    {
                        id: 'application/experimental',
                        label: (0, nls_1.localize)('experimental', "Experimental"),
                        settings: ['application.experimental.*']
                    },
                    {
                        id: 'application/other',
                        label: (0, nls_1.localize)('other', "Other"),
                        settings: ['application.*']
                    }
                ]
            },
            {
                id: 'security',
                label: (0, nls_1.localize)('security', "Security"),
                settings: ['security.*'],
                children: [
                    {
                        id: 'security/workspace',
                        label: (0, nls_1.localize)('workspace', "Workspace"),
                        settings: ['security.workspace.*']
                    }
                ]
            }
        ]
    };
    exports.knownAcronyms = new Set();
    [
        'css',
        'html',
        'scss',
        'less',
        'json',
        'js',
        'ts',
        'ie',
        'id',
        'php',
        'scm',
    ].forEach(str => exports.knownAcronyms.add(str));
    exports.knownTermMappings = new Map();
    exports.knownTermMappings.set('power shell', 'PowerShell');
    exports.knownTermMappings.set('powershell', 'PowerShell');
    exports.knownTermMappings.set('javascript', 'JavaScript');
    exports.knownTermMappings.set('typescript', 'TypeScript');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NMYXlvdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3ByZWZlcmVuY2VzL2Jyb3dzZXIvc2V0dGluZ3NMYXlvdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQU0sMkJBQTJCLEdBQWE7UUFDN0MsZ0JBQWdCO1FBQ2hCLGlCQUFpQjtRQUNqQixtQkFBbUI7UUFDbkIsZ0JBQWdCO1FBQ2hCLHlCQUF5QjtRQUN6QixvQkFBb0I7UUFDcEIsNEJBQTRCO1FBQzVCLHFCQUFxQjtRQUNyQixpQkFBaUI7UUFDakIsZUFBZTtRQUNmLG9CQUFvQjtRQUNwQixnQ0FBZ0M7S0FDaEMsQ0FBQztJQUVGLFNBQWdCLG1CQUFtQixDQUFDLFVBQTJDO1FBQzlFLE9BQU87WUFDTixFQUFFLEVBQUUsY0FBYztZQUNsQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQztZQUNoRCxRQUFRLEVBQUUsVUFBVSxFQUFFLFlBQVksSUFBSSwyQkFBMkI7U0FDakUsQ0FBQztJQUNILENBQUM7SUFORCxrREFNQztJQUVZLFFBQUEsT0FBTyxHQUFzQjtRQUN6QyxFQUFFLEVBQUUsTUFBTTtRQUNWLEtBQUssRUFBRSxNQUFNO1FBQ2IsUUFBUSxFQUFFO1lBQ1Q7Z0JBQ0MsRUFBRSxFQUFFLFFBQVE7Z0JBQ1osS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxhQUFhLENBQUM7Z0JBQzVDLFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQztnQkFDdEIsUUFBUSxFQUFFO29CQUNUO3dCQUNDLEVBQUUsRUFBRSxlQUFlO3dCQUNuQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQzt3QkFDbkMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQUM7cUJBQzVCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxhQUFhO3dCQUNqQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQzt3QkFDL0IsUUFBUSxFQUFFLENBQUMsZUFBZSxDQUFDO3FCQUMzQjtvQkFDRDt3QkFDQyxFQUFFLEVBQUUsYUFBYTt3QkFDakIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7d0JBQy9CLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQztxQkFDMUI7b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLGVBQWU7d0JBQ25CLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsWUFBWSxDQUFDO3dCQUMzQyxRQUFRLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztxQkFDNUI7b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLG1CQUFtQjt3QkFDdkIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxhQUFhLENBQUM7d0JBQzVDLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQztxQkFDMUI7b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLHdCQUF3Qjt3QkFDNUIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGlCQUFpQixFQUFFLHdCQUF3QixDQUFDO3dCQUM1RCxRQUFRLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztxQkFDL0I7b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLGdCQUFnQjt3QkFDcEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7d0JBQ3JDLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixDQUFDO3FCQUM5QjtvQkFDRDt3QkFDQyxFQUFFLEVBQUUsb0JBQW9CO3dCQUN4QixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQzt3QkFDN0MsUUFBUSxFQUFFLENBQUMsa0JBQWtCLENBQUM7cUJBQzlCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxjQUFjO3dCQUNsQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQzt3QkFDakMsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDO3FCQUNyQjtpQkFDRDthQUNEO1lBQ0Q7Z0JBQ0MsRUFBRSxFQUFFLFdBQVc7Z0JBQ2YsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7Z0JBQ3pDLFFBQVEsRUFBRSxDQUFDLGFBQWEsQ0FBQztnQkFDekIsUUFBUSxFQUFFO29CQUNUO3dCQUNDLEVBQUUsRUFBRSxzQkFBc0I7d0JBQzFCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsWUFBWSxDQUFDO3dCQUMzQyxRQUFRLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxtQkFBbUIsRUFBRSx3QkFBd0IsRUFBRSxxQkFBcUIsRUFBRSw0QkFBNEIsRUFBRSxxQkFBcUIsRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsQ0FBQztxQkFDbE87b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLHVCQUF1Qjt3QkFDM0IsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSxhQUFhLENBQUM7d0JBQzdDLFFBQVEsRUFBRSxDQUFDLGVBQWUsQ0FBQztxQkFDM0I7b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLGtCQUFrQjt3QkFDdEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLG1CQUFtQixDQUFDO3dCQUN4RCxRQUFRLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDaEM7b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLG9CQUFvQjt3QkFDeEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQzt3QkFDOUMsUUFBUSxFQUFFLENBQUMsc0JBQXNCLENBQUM7cUJBQ2xDO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxtQkFBbUI7d0JBQ3ZCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO3dCQUN0QyxRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUM7cUJBQ3ZCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSwwQkFBMEI7d0JBQzlCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQzt3QkFDcEQsUUFBUSxFQUFFLENBQUMsa0JBQWtCLENBQUM7cUJBQzlCO2lCQUNEO2FBQ0Q7WUFDRDtnQkFDQyxFQUFFLEVBQUUsUUFBUTtnQkFDWixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQztnQkFDbkMsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDO2dCQUN0QixRQUFRLEVBQUU7b0JBQ1Q7d0JBQ0MsRUFBRSxFQUFFLGtCQUFrQjt3QkFDdEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxZQUFZLENBQUM7d0JBQzFDLFFBQVEsRUFBRSxDQUFDLG9CQUFvQixDQUFDO3FCQUNoQztpQkFDRDthQUNEO1lBQ0Q7Z0JBQ0MsRUFBRSxFQUFFLFVBQVU7Z0JBQ2QsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSxVQUFVLENBQUM7Z0JBQ3ZDLFFBQVEsRUFBRTtvQkFDVDt3QkFDQyxFQUFFLEVBQUUsd0JBQXdCO3dCQUM1QixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQzt3QkFDakQsUUFBUSxFQUFFLENBQUMsaUJBQWlCLENBQUM7cUJBQzdCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxtQkFBbUI7d0JBQ3ZCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsVUFBVSxDQUFDO3dCQUMzQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDO3FCQUNyQztvQkFDRDt3QkFDQyxFQUFFLEVBQUUsaUJBQWlCO3dCQUNyQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQzt3QkFDbkMsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDO3FCQUN0QjtvQkFDRDt3QkFDQyxFQUFFLEVBQUUsZ0JBQWdCO3dCQUNwQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQzt3QkFDakMsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQztxQkFDL0I7b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLGtCQUFrQjt3QkFDdEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7d0JBQ3JDLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQztxQkFDdkI7b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLGNBQWM7d0JBQ2xCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUM7d0JBQ3hDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQztxQkFDbkI7b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLHFCQUFxQjt3QkFDekIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxZQUFZLENBQUM7d0JBQzNDLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQztxQkFDMUI7b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLG1CQUFtQjt3QkFDdkIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSxVQUFVLENBQUM7d0JBQ3ZDLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQztxQkFDeEI7b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLGVBQWU7d0JBQ25CLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO3dCQUMvQixRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUM7cUJBQ3BCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxtQkFBbUI7d0JBQ3ZCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsVUFBVSxDQUFDO3dCQUN2QyxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUM7cUJBQ3hCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxpQkFBaUI7d0JBQ3JCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO3dCQUNuQyxRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUM7cUJBQ3RCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxtQkFBbUI7d0JBQ3ZCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsVUFBVSxDQUFDO3dCQUN2QyxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUM7cUJBQ3hCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxpQkFBaUI7d0JBQ3JCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO3dCQUNuQyxRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUM7cUJBQ3RCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxtQkFBbUI7d0JBQ3ZCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsVUFBVSxDQUFDO3dCQUN2QyxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUM7cUJBQ3hCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxtQkFBbUI7d0JBQ3ZCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsVUFBVSxDQUFDO3dCQUN2QyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUscUJBQXFCLENBQUM7cUJBQy9DO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxvQkFBb0I7d0JBQ3hCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxXQUFXLEVBQUUsWUFBWSxDQUFDO3dCQUMxQyxRQUFRLEVBQUUsQ0FBQyxhQUFhLENBQUM7cUJBQ3pCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxzQkFBc0I7d0JBQzFCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsY0FBYyxDQUFDO3dCQUM5QyxRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUM7cUJBQzNCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxlQUFlO3dCQUNuQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQzt3QkFDL0IsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQztxQkFDcEM7aUJBQ0Q7YUFDRDtZQUNEO2dCQUNDLEVBQUUsRUFBRSxhQUFhO2dCQUNqQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQztnQkFDN0MsUUFBUSxFQUFFO29CQUNUO3dCQUNDLEVBQUUsRUFBRSxrQkFBa0I7d0JBQ3RCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO3dCQUNqQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUM7cUJBQ3BCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxzQkFBc0I7d0JBQzFCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsVUFBVSxDQUFDO3dCQUN2QyxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUM7cUJBQ3hCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxvQkFBb0I7d0JBQ3hCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO3dCQUNuQyxRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUM7cUJBQ3RCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSx1QkFBdUI7d0JBQzNCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxXQUFXLEVBQUUsV0FBVyxDQUFDO3dCQUN6QyxRQUFRLEVBQUUsQ0FBQyxhQUFhLENBQUM7cUJBQ3pCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSwwQkFBMEI7d0JBQzlCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsZUFBZSxDQUFDO3dCQUNoRCxRQUFRLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztxQkFDNUI7b0JBQ0Q7d0JBQ0MsRUFBRSxFQUFFLDBCQUEwQjt3QkFDOUIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSxjQUFjLENBQUM7d0JBQy9DLFFBQVEsRUFBRSxDQUFDLDRCQUE0QixDQUFDO3FCQUN4QztvQkFDRDt3QkFDQyxFQUFFLEVBQUUsbUJBQW1CO3dCQUN2QixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQzt3QkFDakMsUUFBUSxFQUFFLENBQUMsZUFBZSxDQUFDO3FCQUMzQjtpQkFDRDthQUNEO1lBQ0Q7Z0JBQ0MsRUFBRSxFQUFFLFVBQVU7Z0JBQ2QsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSxVQUFVLENBQUM7Z0JBQ3ZDLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQztnQkFDeEIsUUFBUSxFQUFFO29CQUNUO3dCQUNDLEVBQUUsRUFBRSxvQkFBb0I7d0JBQ3hCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxXQUFXLEVBQUUsV0FBVyxDQUFDO3dCQUN6QyxRQUFRLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztxQkFDbEM7aUJBQ0Q7YUFDRDtTQUNEO0tBQ0QsQ0FBQztJQUVXLFFBQUEsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7SUFDL0M7UUFDQyxLQUFLO1FBQ0wsTUFBTTtRQUNOLE1BQU07UUFDTixNQUFNO1FBQ04sTUFBTTtRQUNOLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixLQUFLO1FBQ0wsS0FBSztLQUNMLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMscUJBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUU1QixRQUFBLGlCQUFpQixHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBQzNELHlCQUFpQixDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDbkQseUJBQWlCLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNsRCx5QkFBaUIsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ2xELHlCQUFpQixDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUMifQ==