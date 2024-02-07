/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/common/services/modelService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, platform_1, uri_1, modelService_1, configuration_1, testConfigurationService_1, contextkey_1, mockKeybindingService_1, themeService_1, testThemeService_1, notebookEditorServiceImpl_1, editorGroupsService_1, editorService_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addToSearchResult = exports.stubNotebookEditorService = exports.stubModelService = exports.getRootName = exports.createFileUriFromPathFromRoot = void 0;
    function createFileUriFromPathFromRoot(path) {
        const rootName = getRootName();
        if (path) {
            return uri_1.URI.file(`${rootName}${path}`);
        }
        else {
            if (platform_1.isWindows) {
                return uri_1.URI.file(`${rootName}/`);
            }
            else {
                return uri_1.URI.file(rootName);
            }
        }
    }
    exports.createFileUriFromPathFromRoot = createFileUriFromPathFromRoot;
    function getRootName() {
        if (platform_1.isWindows) {
            return 'c:';
        }
        else {
            return '';
        }
    }
    exports.getRootName = getRootName;
    function stubModelService(instantiationService, addDisposable) {
        instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
        const config = new testConfigurationService_1.TestConfigurationService();
        config.setUserConfiguration('search', { searchOnType: true });
        instantiationService.stub(configuration_1.IConfigurationService, config);
        const modelService = instantiationService.createInstance(modelService_1.ModelService);
        addDisposable(modelService);
        return modelService;
    }
    exports.stubModelService = stubModelService;
    function stubNotebookEditorService(instantiationService, addDisposable) {
        instantiationService.stub(editorGroupsService_1.IEditorGroupsService, new workbenchTestServices_1.TestEditorGroupsService());
        instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
        const es = new workbenchTestServices_1.TestEditorService();
        addDisposable(es);
        instantiationService.stub(editorService_1.IEditorService, es);
        const notebookEditorWidgetService = instantiationService.createInstance(notebookEditorServiceImpl_1.NotebookEditorWidgetService);
        addDisposable(notebookEditorWidgetService);
        return notebookEditorWidgetService;
    }
    exports.stubNotebookEditorService = stubNotebookEditorService;
    function addToSearchResult(searchResult, allRaw, searchInstanceID = '') {
        searchResult.add(allRaw, searchInstanceID);
    }
    exports.addToSearchResult = addToSearchResult;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoVGVzdENvbW1vbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL3Rlc3QvYnJvd3Nlci9zZWFyY2hUZXN0Q29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXNCaEcsU0FBZ0IsNkJBQTZCLENBQUMsSUFBYTtRQUMxRCxNQUFNLFFBQVEsR0FBRyxXQUFXLEVBQUUsQ0FBQztRQUMvQixJQUFJLElBQUksRUFBRSxDQUFDO1lBQ1YsT0FBTyxTQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdkMsQ0FBQzthQUFNLENBQUM7WUFDUCxJQUFJLG9CQUFTLEVBQUUsQ0FBQztnQkFDZixPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0IsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0lBWEQsc0VBV0M7SUFFRCxTQUFnQixXQUFXO1FBQzFCLElBQUksb0JBQVMsRUFBRSxDQUFDO1lBQ2YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO2FBQU0sQ0FBQztZQUNQLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztJQUNGLENBQUM7SUFORCxrQ0FNQztJQUVELFNBQWdCLGdCQUFnQixDQUFDLG9CQUE4QyxFQUFFLGFBQXVDO1FBQ3ZILG9CQUFvQixDQUFDLElBQUksQ0FBQyw0QkFBYSxFQUFFLElBQUksbUNBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sTUFBTSxHQUFHLElBQUksbURBQXdCLEVBQUUsQ0FBQztRQUM5QyxNQUFNLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDOUQsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHFDQUFxQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELE1BQU0sWUFBWSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQkFBWSxDQUFDLENBQUM7UUFDdkUsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVCLE9BQU8sWUFBWSxDQUFDO0lBQ3JCLENBQUM7SUFSRCw0Q0FRQztJQUVELFNBQWdCLHlCQUF5QixDQUFDLG9CQUE4QyxFQUFFLGFBQXVDO1FBQ2hJLG9CQUFvQixDQUFDLElBQUksQ0FBQywwQ0FBb0IsRUFBRSxJQUFJLCtDQUF1QixFQUFFLENBQUMsQ0FBQztRQUMvRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsK0JBQWtCLEVBQUUsSUFBSSw2Q0FBcUIsRUFBRSxDQUFDLENBQUM7UUFDM0UsTUFBTSxFQUFFLEdBQUcsSUFBSSx5Q0FBaUIsRUFBRSxDQUFDO1FBQ25DLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsQixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsOEJBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QyxNQUFNLDJCQUEyQixHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx1REFBMkIsQ0FBQyxDQUFDO1FBQ3JHLGFBQWEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQzNDLE9BQU8sMkJBQTJCLENBQUM7SUFDcEMsQ0FBQztJQVRELDhEQVNDO0lBRUQsU0FBZ0IsaUJBQWlCLENBQUMsWUFBMEIsRUFBRSxNQUFvQixFQUFFLGdCQUFnQixHQUFHLEVBQUU7UUFDeEcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRkQsOENBRUMifQ==