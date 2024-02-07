define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/search/browser/replaceService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/search/common/notebookSearch", "vs/workbench/contrib/search/browser/notebookSearch/notebookSearchService"], function (require, exports, extensions_1, replaceService_1, platform_1, contributions_1, notebookSearch_1, notebookSearchService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerContributions = void 0;
    function registerContributions() {
        (0, extensions_1.registerSingleton)(notebookSearch_1.INotebookSearchService, notebookSearchService_1.NotebookSearchService, 1 /* InstantiationType.Delayed */);
        platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(replaceService_1.ReplacePreviewContentProvider, 1 /* LifecyclePhase.Starting */);
    }
    exports.registerContributions = registerContributions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tTZWFyY2hDb250cmlidXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9ub3RlYm9va1NlYXJjaC9ub3RlYm9va1NlYXJjaENvbnRyaWJ1dGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVlBLFNBQWdCLHFCQUFxQjtRQUNwQyxJQUFBLDhCQUFpQixFQUFDLHVDQUFzQixFQUFFLDZDQUFxQixvQ0FBNEIsQ0FBQztRQUM1RixtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsOENBQTZCLGtDQUEwQixDQUFDO0lBQ25LLENBQUM7SUFIRCxzREFHQyJ9