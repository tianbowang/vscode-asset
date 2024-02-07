define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/search/browser/replace", "vs/workbench/contrib/search/browser/replaceService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, extensions_1, replace_1, replaceService_1, platform_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerContributions = void 0;
    function registerContributions() {
        (0, extensions_1.registerSingleton)(replace_1.IReplaceService, replaceService_1.ReplaceService, 1 /* InstantiationType.Delayed */);
        platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(replaceService_1.ReplacePreviewContentProvider, 1 /* LifecyclePhase.Starting */);
    }
    exports.registerContributions = registerContributions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZUNvbnRyaWJ1dGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9icm93c2VyL3JlcGxhY2VDb250cmlidXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFXQSxTQUFnQixxQkFBcUI7UUFDcEMsSUFBQSw4QkFBaUIsRUFBQyx5QkFBZSxFQUFFLCtCQUFjLG9DQUE0QixDQUFDO1FBQzlFLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyw4Q0FBNkIsa0NBQTBCLENBQUM7SUFDbkssQ0FBQztJQUhELHNEQUdDIn0=