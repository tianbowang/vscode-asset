/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/config/editorConfigurationSchema", "vs/editor/common/editorFeatures", "vs/editor/contrib/dropOrPasteInto/browser/defaultProviders", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "./dropIntoEditorController"], function (require, exports, editorExtensions_1, editorConfigurationSchema_1, editorFeatures_1, defaultProviders_1, nls, configurationRegistry_1, platform_1, dropIntoEditorController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.registerEditorContribution)(dropIntoEditorController_1.DropIntoEditorController.ID, dropIntoEditorController_1.DropIntoEditorController, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.registerEditorCommand)(new class extends editorExtensions_1.EditorCommand {
        constructor() {
            super({
                id: dropIntoEditorController_1.changeDropTypeCommandId,
                precondition: dropIntoEditorController_1.dropWidgetVisibleCtx,
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */,
                }
            });
        }
        runEditorCommand(_accessor, editor, _args) {
            dropIntoEditorController_1.DropIntoEditorController.get(editor)?.changeDropType();
        }
    });
    (0, editorFeatures_1.registerEditorFeature)(defaultProviders_1.DefaultDropProvidersFeature);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        ...editorConfigurationSchema_1.editorConfigurationBaseNode,
        properties: {
            [dropIntoEditorController_1.defaultProviderConfig]: {
                type: 'object',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                description: nls.localize('defaultProviderDescription', "Configures the default drop provider to use for content of a given mime type."),
                default: {},
                additionalProperties: {
                    type: 'string',
                },
            },
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcEludG9FZGl0b3JDb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2Ryb3BPclBhc3RlSW50by9icm93c2VyL2Ryb3BJbnRvRWRpdG9yQ29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBY2hHLElBQUEsNkNBQTBCLEVBQUMsbURBQXdCLENBQUMsRUFBRSxFQUFFLG1EQUF3QixpRUFBeUQsQ0FBQztJQUUxSSxJQUFBLHdDQUFxQixFQUFDLElBQUksS0FBTSxTQUFRLGdDQUFhO1FBQ3BEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxrREFBdUI7Z0JBQzNCLFlBQVksRUFBRSwrQ0FBb0I7Z0JBQ2xDLE1BQU0sRUFBRTtvQkFDUCxNQUFNLDBDQUFnQztvQkFDdEMsT0FBTyxFQUFFLG1EQUErQjtpQkFDeEM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRWUsZ0JBQWdCLENBQUMsU0FBa0MsRUFBRSxNQUFtQixFQUFFLEtBQVU7WUFDbkcsbURBQXdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLGNBQWMsRUFBRSxDQUFDO1FBQ3hELENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxJQUFBLHNDQUFxQixFQUFDLDhDQUEyQixDQUFDLENBQUM7SUFFbkQsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUF1QixDQUFDLGFBQWEsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1FBQ2hHLEdBQUcsdURBQTJCO1FBQzlCLFVBQVUsRUFBRTtZQUNYLENBQUMsZ0RBQXFCLENBQUMsRUFBRTtnQkFDeEIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsS0FBSyxpREFBeUM7Z0JBQzlDLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDRCQUE0QixFQUFFLCtFQUErRSxDQUFDO2dCQUN4SSxPQUFPLEVBQUUsRUFBRTtnQkFDWCxvQkFBb0IsRUFBRTtvQkFDckIsSUFBSSxFQUFFLFFBQVE7aUJBQ2Q7YUFDRDtTQUNEO0tBQ0QsQ0FBQyxDQUFDIn0=