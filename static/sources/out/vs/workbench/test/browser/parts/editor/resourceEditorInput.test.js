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
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/common/editor/resourceEditorInput", "vs/platform/label/common/label", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/base/test/common/utils", "vs/editor/common/services/textResourceConfiguration"], function (require, exports, assert, uri_1, workbenchTestServices_1, resourceEditorInput_1, label_1, files_1, lifecycle_1, filesConfigurationService_1, utils_1, textResourceConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ResourceEditorInput', () => {
        const disposables = new lifecycle_1.DisposableStore();
        let instantiationService;
        let TestResourceEditorInput = class TestResourceEditorInput extends resourceEditorInput_1.AbstractResourceEditorInput {
            constructor(resource, labelService, fileService, filesConfigurationService, textResourceConfigurationService) {
                super(resource, resource, labelService, fileService, filesConfigurationService, textResourceConfigurationService);
                this.typeId = 'test.typeId';
            }
        };
        TestResourceEditorInput = __decorate([
            __param(1, label_1.ILabelService),
            __param(2, files_1.IFileService),
            __param(3, filesConfigurationService_1.IFilesConfigurationService),
            __param(4, textResourceConfiguration_1.ITextResourceConfigurationService)
        ], TestResourceEditorInput);
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
        });
        teardown(() => {
            disposables.clear();
        });
        test('basics', async () => {
            const resource = uri_1.URI.from({ scheme: 'testResource', path: 'thePath/of/the/resource.txt' });
            const input = disposables.add(instantiationService.createInstance(TestResourceEditorInput, resource));
            assert.ok(input.getName().length > 0);
            assert.ok(input.getDescription(0 /* Verbosity.SHORT */).length > 0);
            assert.ok(input.getDescription(1 /* Verbosity.MEDIUM */).length > 0);
            assert.ok(input.getDescription(2 /* Verbosity.LONG */).length > 0);
            assert.ok(input.getTitle(0 /* Verbosity.SHORT */).length > 0);
            assert.ok(input.getTitle(1 /* Verbosity.MEDIUM */).length > 0);
            assert.ok(input.getTitle(2 /* Verbosity.LONG */).length > 0);
            assert.strictEqual(input.hasCapability(2 /* EditorInputCapabilities.Readonly */), false);
            assert.strictEqual(input.isReadonly(), false);
            assert.strictEqual(input.hasCapability(4 /* EditorInputCapabilities.Untitled */), true);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VFZGl0b3JJbnB1dC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvdGVzdC9icm93c2VyL3BhcnRzL2VkaXRvci9yZXNvdXJjZUVkaXRvcklucHV0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFlaEcsS0FBSyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtRQUVqQyxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUMxQyxJQUFJLG9CQUEyQyxDQUFDO1FBRWhELElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXdCLFNBQVEsaURBQTJCO1lBSWhFLFlBQ0MsUUFBYSxFQUNFLFlBQTJCLEVBQzVCLFdBQXlCLEVBQ1gseUJBQXFELEVBQzlDLGdDQUFtRTtnQkFFdEcsS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSx5QkFBeUIsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO2dCQVQxRyxXQUFNLEdBQUcsYUFBYSxDQUFDO1lBVWhDLENBQUM7U0FDRCxDQUFBO1FBYkssdUJBQXVCO1lBTTFCLFdBQUEscUJBQWEsQ0FBQTtZQUNiLFdBQUEsb0JBQVksQ0FBQTtZQUNaLFdBQUEsc0RBQTBCLENBQUE7WUFDMUIsV0FBQSw2REFBaUMsQ0FBQTtXQVQ5Qix1QkFBdUIsQ0FhNUI7UUFFRCxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1Ysb0JBQW9CLEdBQUcsSUFBQSxxREFBNkIsRUFBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDOUUsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLElBQUksRUFBRTtZQUN6QixNQUFNLFFBQVEsR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsNkJBQTZCLEVBQUUsQ0FBQyxDQUFDO1lBRTNGLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVCQUF1QixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFFdEcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXRDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMseUJBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsMEJBQW1CLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsd0JBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRTVELE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEseUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsMEJBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsd0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXJELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGFBQWEsMENBQWtDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsYUFBYSwwQ0FBa0MsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQyJ9