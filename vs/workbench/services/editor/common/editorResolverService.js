(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/nls", "vs/workbench/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform"], function (require, exports, glob, network_1, path_1, resources_1, nls_1, configuration_1, configurationRegistry_1, instantiation_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.globMatchesResource = exports.priorityToRank = exports.ResolvedStatus = exports.RegisteredEditorPriority = exports.editorsAssociationsSettingId = exports.IEditorResolverService = void 0;
    exports.IEditorResolverService = (0, instantiation_1.createDecorator)('editorResolverService');
    exports.editorsAssociationsSettingId = 'workbench.editorAssociations';
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const editorAssociationsConfigurationNode = {
        ...configuration_1.workbenchConfigurationNodeBase,
        properties: {
            'workbench.editorAssociations': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)('editor.editorAssociations', "Configure [glob patterns](https://aka.ms/vscode-glob-patterns) to editors (for example `\"*.hex\": \"hexEditor.hexedit\"`). These have precedence over the default behavior."),
                additionalProperties: {
                    type: 'string'
                }
            }
        }
    };
    configurationRegistry.registerConfiguration(editorAssociationsConfigurationNode);
    //#endregion
    //#region EditorResolverService types
    var RegisteredEditorPriority;
    (function (RegisteredEditorPriority) {
        RegisteredEditorPriority["builtin"] = "builtin";
        RegisteredEditorPriority["option"] = "option";
        RegisteredEditorPriority["exclusive"] = "exclusive";
        RegisteredEditorPriority["default"] = "default";
    })(RegisteredEditorPriority || (exports.RegisteredEditorPriority = RegisteredEditorPriority = {}));
    /**
     * If we didn't resolve an editor dictates what to do with the opening state
     * ABORT = Do not continue with opening the editor
     * NONE = Continue as if the resolution has been disabled as the service could not resolve one
     */
    var ResolvedStatus;
    (function (ResolvedStatus) {
        ResolvedStatus[ResolvedStatus["ABORT"] = 1] = "ABORT";
        ResolvedStatus[ResolvedStatus["NONE"] = 2] = "NONE";
    })(ResolvedStatus || (exports.ResolvedStatus = ResolvedStatus = {}));
    //#endregion
    //#region Util functions
    function priorityToRank(priority) {
        switch (priority) {
            case RegisteredEditorPriority.exclusive:
                return 5;
            case RegisteredEditorPriority.default:
                return 4;
            case RegisteredEditorPriority.builtin:
                return 3;
            // Text editor is priority 2
            case RegisteredEditorPriority.option:
            default:
                return 1;
        }
    }
    exports.priorityToRank = priorityToRank;
    function globMatchesResource(globPattern, resource) {
        const excludedSchemes = new Set([
            network_1.Schemas.extension,
            network_1.Schemas.webviewPanel,
            network_1.Schemas.vscodeWorkspaceTrust,
            network_1.Schemas.vscodeSettings
        ]);
        // We want to say that the above schemes match no glob patterns
        if (excludedSchemes.has(resource.scheme)) {
            return false;
        }
        const matchOnPath = typeof globPattern === 'string' && globPattern.indexOf(path_1.posix.sep) >= 0;
        const target = matchOnPath ? `${resource.scheme}:${resource.path}` : (0, resources_1.basename)(resource);
        return glob.match(typeof globPattern === 'string' ? globPattern.toLowerCase() : globPattern, target.toLowerCase());
    }
    exports.globMatchesResource = globMatchesResource;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUmVzb2x2ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZWRpdG9yL2NvbW1vbi9lZGl0b3JSZXNvbHZlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0JuRixRQUFBLHNCQUFzQixHQUFHLElBQUEsK0JBQWUsRUFBeUIsdUJBQXVCLENBQUMsQ0FBQztJQWExRixRQUFBLDRCQUE0QixHQUFHLDhCQUE4QixDQUFDO0lBRTNFLE1BQU0scUJBQXFCLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUF1QixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRXpHLE1BQU0sbUNBQW1DLEdBQXVCO1FBQy9ELEdBQUcsOENBQThCO1FBQ2pDLFVBQVUsRUFBRTtZQUNYLDhCQUE4QixFQUFFO2dCQUMvQixJQUFJLEVBQUUsUUFBUTtnQkFDZCxtQkFBbUIsRUFBRSxJQUFBLGNBQVEsRUFBQywyQkFBMkIsRUFBRSw4S0FBOEssQ0FBQztnQkFDMU8sb0JBQW9CLEVBQUU7b0JBQ3JCLElBQUksRUFBRSxRQUFRO2lCQUNkO2FBQ0Q7U0FDRDtLQUNELENBQUM7SUFRRixxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBQ2pGLFlBQVk7SUFFWixxQ0FBcUM7SUFDckMsSUFBWSx3QkFLWDtJQUxELFdBQVksd0JBQXdCO1FBQ25DLCtDQUFtQixDQUFBO1FBQ25CLDZDQUFpQixDQUFBO1FBQ2pCLG1EQUF1QixDQUFBO1FBQ3ZCLCtDQUFtQixDQUFBO0lBQ3BCLENBQUMsRUFMVyx3QkFBd0Isd0NBQXhCLHdCQUF3QixRQUtuQztJQUVEOzs7O09BSUc7SUFDSCxJQUFrQixjQUdqQjtJQUhELFdBQWtCLGNBQWM7UUFDL0IscURBQVMsQ0FBQTtRQUNULG1EQUFRLENBQUE7SUFDVCxDQUFDLEVBSGlCLGNBQWMsOEJBQWQsY0FBYyxRQUcvQjtJQWlIRCxZQUFZO0lBRVosd0JBQXdCO0lBQ3hCLFNBQWdCLGNBQWMsQ0FBQyxRQUFrQztRQUNoRSxRQUFRLFFBQVEsRUFBRSxDQUFDO1lBQ2xCLEtBQUssd0JBQXdCLENBQUMsU0FBUztnQkFDdEMsT0FBTyxDQUFDLENBQUM7WUFDVixLQUFLLHdCQUF3QixDQUFDLE9BQU87Z0JBQ3BDLE9BQU8sQ0FBQyxDQUFDO1lBQ1YsS0FBSyx3QkFBd0IsQ0FBQyxPQUFPO2dCQUNwQyxPQUFPLENBQUMsQ0FBQztZQUNWLDRCQUE0QjtZQUM1QixLQUFLLHdCQUF3QixDQUFDLE1BQU0sQ0FBQztZQUNyQztnQkFDQyxPQUFPLENBQUMsQ0FBQztRQUNYLENBQUM7SUFDRixDQUFDO0lBYkQsd0NBYUM7SUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxXQUEyQyxFQUFFLFFBQWE7UUFDN0YsTUFBTSxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQUM7WUFDL0IsaUJBQU8sQ0FBQyxTQUFTO1lBQ2pCLGlCQUFPLENBQUMsWUFBWTtZQUNwQixpQkFBTyxDQUFDLG9CQUFvQjtZQUM1QixpQkFBTyxDQUFDLGNBQWM7U0FDdEIsQ0FBQyxDQUFDO1FBQ0gsK0RBQStEO1FBQy9ELElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUMxQyxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxNQUFNLFdBQVcsR0FBRyxPQUFPLFdBQVcsS0FBSyxRQUFRLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxZQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNGLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBQSxvQkFBUSxFQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hGLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLFdBQVcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ3BILENBQUM7SUFkRCxrREFjQzs7QUFDRCxZQUFZIn0=
//# sourceURL=../../../vs/workbench/services/editor/common/editorResolverService.js
})