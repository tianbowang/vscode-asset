/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration", "vs/nls", "vs/platform/registry/common/platform"], function (require, exports, configurationRegistry_1, configuration_1, nls, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateContributedOpeners = exports.externalUriOpenersConfigurationNode = exports.externalUriOpenersSettingId = exports.defaultExternalUriOpenerId = void 0;
    exports.defaultExternalUriOpenerId = 'default';
    exports.externalUriOpenersSettingId = 'workbench.externalUriOpeners';
    const externalUriOpenerIdSchemaAddition = {
        type: 'string',
        enum: []
    };
    const exampleUriPatterns = `
- \`https://microsoft.com\`: Matches this specific domain using https
- \`https://microsoft.com:8080\`: Matches this specific domain on this port using https
- \`https://microsoft.com:*\`: Matches this specific domain on any port using https
- \`https://microsoft.com/foo\`: Matches \`https://microsoft.com/foo\` and \`https://microsoft.com/foo/bar\`, but not \`https://microsoft.com/foobar\` or \`https://microsoft.com/bar\`
- \`https://*.microsoft.com\`: Match all domains ending in \`microsoft.com\` using https
- \`microsoft.com\`: Match this specific domain using either http or https
- \`*.microsoft.com\`: Match all domains ending in \`microsoft.com\` using either http or https
- \`http://192.168.0.1\`: Matches this specific IP using http
- \`http://192.168.0.*\`: Matches all IP's with this prefix using http
- \`*\`: Match all domains using either http or https`;
    exports.externalUriOpenersConfigurationNode = {
        ...configuration_1.workbenchConfigurationNodeBase,
        properties: {
            [exports.externalUriOpenersSettingId]: {
                type: 'object',
                markdownDescription: nls.localize('externalUriOpeners', "Configure the opener to use for external URIs (http, https)."),
                defaultSnippets: [{
                        body: {
                            'example.com': '$1'
                        }
                    }],
                additionalProperties: {
                    anyOf: [
                        {
                            type: 'string',
                            markdownDescription: nls.localize('externalUriOpeners.uri', "Map URI pattern to an opener id.\nExample patterns: \n{0}", exampleUriPatterns),
                        },
                        {
                            type: 'string',
                            markdownDescription: nls.localize('externalUriOpeners.uri', "Map URI pattern to an opener id.\nExample patterns: \n{0}", exampleUriPatterns),
                            enum: [exports.defaultExternalUriOpenerId],
                            enumDescriptions: [nls.localize('externalUriOpeners.defaultId', "Open using VS Code's standard opener.")],
                        },
                        externalUriOpenerIdSchemaAddition
                    ]
                }
            }
        }
    };
    function updateContributedOpeners(enumValues, enumDescriptions) {
        externalUriOpenerIdSchemaAddition.enum = enumValues;
        externalUriOpenerIdSchemaAddition.enumDescriptions = enumDescriptions;
        platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
            .notifyConfigurationSchemaUpdated(exports.externalUriOpenersConfigurationNode);
    }
    exports.updateContributedOpeners = updateContributedOpeners;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZXJuYWxVcmlPcGVuZXIvY29tbW9uL2NvbmZpZ3VyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUW5GLFFBQUEsMEJBQTBCLEdBQUcsU0FBUyxDQUFDO0lBRXZDLFFBQUEsMkJBQTJCLEdBQUcsOEJBQThCLENBQUM7SUFNMUUsTUFBTSxpQ0FBaUMsR0FBZ0I7UUFDdEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxJQUFJLEVBQUUsRUFBRTtLQUNSLENBQUM7SUFFRixNQUFNLGtCQUFrQixHQUFHOzs7Ozs7Ozs7O3NEQVUyQixDQUFDO0lBRTFDLFFBQUEsbUNBQW1DLEdBQXVCO1FBQ3RFLEdBQUcsOENBQThCO1FBQ2pDLFVBQVUsRUFBRTtZQUNYLENBQUMsbUNBQTJCLENBQUMsRUFBRTtnQkFDOUIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSw4REFBOEQsQ0FBQztnQkFDdkgsZUFBZSxFQUFFLENBQUM7d0JBQ2pCLElBQUksRUFBRTs0QkFDTCxhQUFhLEVBQUUsSUFBSTt5QkFDbkI7cUJBQ0QsQ0FBQztnQkFDRixvQkFBb0IsRUFBRTtvQkFDckIsS0FBSyxFQUFFO3dCQUNOOzRCQUNDLElBQUksRUFBRSxRQUFROzRCQUNkLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsMkRBQTJELEVBQUUsa0JBQWtCLENBQUM7eUJBQzVJO3dCQUNEOzRCQUNDLElBQUksRUFBRSxRQUFROzRCQUNkLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsMkRBQTJELEVBQUUsa0JBQWtCLENBQUM7NEJBQzVJLElBQUksRUFBRSxDQUFDLGtDQUEwQixDQUFDOzRCQUNsQyxnQkFBZ0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsOEJBQThCLEVBQUUsdUNBQXVDLENBQUMsQ0FBQzt5QkFDekc7d0JBQ0QsaUNBQWlDO3FCQUNqQztpQkFDRDthQUNEO1NBQ0Q7S0FDRCxDQUFDO0lBRUYsU0FBZ0Isd0JBQXdCLENBQUMsVUFBb0IsRUFBRSxnQkFBMEI7UUFDeEYsaUNBQWlDLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztRQUNwRCxpQ0FBaUMsQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUV0RSxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQVUsQ0FBQyxhQUFhLENBQUM7YUFDM0QsZ0NBQWdDLENBQUMsMkNBQW1DLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBTkQsNERBTUMifQ==