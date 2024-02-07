/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/language/common/languageService"], function (require, exports, nls, languageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.codeActionsExtensionPointDescriptor = void 0;
    var CodeActionExtensionPointFields;
    (function (CodeActionExtensionPointFields) {
        CodeActionExtensionPointFields["languages"] = "languages";
        CodeActionExtensionPointFields["actions"] = "actions";
        CodeActionExtensionPointFields["kind"] = "kind";
        CodeActionExtensionPointFields["title"] = "title";
        CodeActionExtensionPointFields["description"] = "description";
    })(CodeActionExtensionPointFields || (CodeActionExtensionPointFields = {}));
    const codeActionsExtensionPointSchema = Object.freeze({
        type: 'array',
        markdownDescription: nls.localize('contributes.codeActions', "Configure which editor to use for a resource."),
        items: {
            type: 'object',
            required: [CodeActionExtensionPointFields.languages, CodeActionExtensionPointFields.actions],
            properties: {
                [CodeActionExtensionPointFields.languages]: {
                    type: 'array',
                    description: nls.localize('contributes.codeActions.languages', "Language modes that the code actions are enabled for."),
                    items: { type: 'string' }
                },
                [CodeActionExtensionPointFields.actions]: {
                    type: 'object',
                    required: [CodeActionExtensionPointFields.kind, CodeActionExtensionPointFields.title],
                    properties: {
                        [CodeActionExtensionPointFields.kind]: {
                            type: 'string',
                            markdownDescription: nls.localize('contributes.codeActions.kind', "`CodeActionKind` of the contributed code action."),
                        },
                        [CodeActionExtensionPointFields.title]: {
                            type: 'string',
                            description: nls.localize('contributes.codeActions.title', "Label for the code action used in the UI."),
                        },
                        [CodeActionExtensionPointFields.description]: {
                            type: 'string',
                            description: nls.localize('contributes.codeActions.description', "Description of what the code action does."),
                        },
                    }
                }
            }
        }
    });
    exports.codeActionsExtensionPointDescriptor = {
        extensionPoint: 'codeActions',
        deps: [languageService_1.languagesExtPoint],
        jsonSchema: codeActionsExtensionPointSchema
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbnNFeHRlbnNpb25Qb2ludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUFjdGlvbnMvY29tbW9uL2NvZGVBY3Rpb25zRXh0ZW5zaW9uUG9pbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLElBQUssOEJBTUo7SUFORCxXQUFLLDhCQUE4QjtRQUNsQyx5REFBdUIsQ0FBQTtRQUN2QixxREFBbUIsQ0FBQTtRQUNuQiwrQ0FBYSxDQUFBO1FBQ2IsaURBQWUsQ0FBQTtRQUNmLDZEQUEyQixDQUFBO0lBQzVCLENBQUMsRUFOSSw4QkFBOEIsS0FBOUIsOEJBQThCLFFBTWxDO0lBYUQsTUFBTSwrQkFBK0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUErQjtRQUNuRixJQUFJLEVBQUUsT0FBTztRQUNiLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUUsK0NBQStDLENBQUM7UUFDN0csS0FBSyxFQUFFO1lBQ04sSUFBSSxFQUFFLFFBQVE7WUFDZCxRQUFRLEVBQUUsQ0FBQyw4QkFBOEIsQ0FBQyxTQUFTLEVBQUUsOEJBQThCLENBQUMsT0FBTyxDQUFDO1lBQzVGLFVBQVUsRUFBRTtnQkFDWCxDQUFDLDhCQUE4QixDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUMzQyxJQUFJLEVBQUUsT0FBTztvQkFDYixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQ0FBbUMsRUFBRSx1REFBdUQsQ0FBQztvQkFDdkgsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtpQkFDekI7Z0JBQ0QsQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDekMsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsUUFBUSxFQUFFLENBQUMsOEJBQThCLENBQUMsSUFBSSxFQUFFLDhCQUE4QixDQUFDLEtBQUssQ0FBQztvQkFDckYsVUFBVSxFQUFFO3dCQUNYLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLEVBQUU7NEJBQ3RDLElBQUksRUFBRSxRQUFROzRCQUNkLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsOEJBQThCLEVBQUUsa0RBQWtELENBQUM7eUJBQ3JIO3dCQUNELENBQUMsOEJBQThCLENBQUMsS0FBSyxDQUFDLEVBQUU7NEJBQ3ZDLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLCtCQUErQixFQUFFLDJDQUEyQyxDQUFDO3lCQUN2Rzt3QkFDRCxDQUFDLDhCQUE4QixDQUFDLFdBQVcsQ0FBQyxFQUFFOzRCQUM3QyxJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSwyQ0FBMkMsQ0FBQzt5QkFDN0c7cUJBQ0Q7aUJBQ0Q7YUFDRDtTQUNEO0tBQ0QsQ0FBQyxDQUFDO0lBRVUsUUFBQSxtQ0FBbUMsR0FBRztRQUNsRCxjQUFjLEVBQUUsYUFBYTtRQUM3QixJQUFJLEVBQUUsQ0FBQyxtQ0FBaUIsQ0FBQztRQUN6QixVQUFVLEVBQUUsK0JBQStCO0tBQzNDLENBQUMifQ==