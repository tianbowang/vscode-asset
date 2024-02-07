/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/editor/browser/editorExtensions", "vs/editor/common/services/languageFeatures"], function (require, exports, async_1, cancellation_1, errors_1, editorExtensions_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getHoverPromise = exports.getHover = exports.HoverProviderResult = void 0;
    class HoverProviderResult {
        constructor(provider, hover, ordinal) {
            this.provider = provider;
            this.hover = hover;
            this.ordinal = ordinal;
        }
    }
    exports.HoverProviderResult = HoverProviderResult;
    async function executeProvider(provider, ordinal, model, position, token) {
        try {
            const result = await Promise.resolve(provider.provideHover(model, position, token));
            if (result && isValid(result)) {
                return new HoverProviderResult(provider, result, ordinal);
            }
        }
        catch (err) {
            (0, errors_1.onUnexpectedExternalError)(err);
        }
        return undefined;
    }
    function getHover(registry, model, position, token) {
        const providers = registry.ordered(model);
        const promises = providers.map((provider, index) => executeProvider(provider, index, model, position, token));
        return async_1.AsyncIterableObject.fromPromises(promises).coalesce();
    }
    exports.getHover = getHover;
    function getHoverPromise(registry, model, position, token) {
        return getHover(registry, model, position, token).map(item => item.hover).toPromise();
    }
    exports.getHoverPromise = getHoverPromise;
    (0, editorExtensions_1.registerModelAndPositionCommand)('_executeHoverProvider', (accessor, model, position) => {
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        return getHoverPromise(languageFeaturesService.hoverProvider, model, position, cancellation_1.CancellationToken.None);
    });
    function isValid(result) {
        const hasRange = (typeof result.range !== 'undefined');
        const hasHtmlContent = typeof result.contents !== 'undefined' && result.contents && result.contents.length > 0;
        return hasRange && hasHtmlContent;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0SG92ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2hvdmVyL2Jyb3dzZXIvZ2V0SG92ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQWEsbUJBQW1CO1FBQy9CLFlBQ2lCLFFBQXVCLEVBQ3ZCLEtBQVksRUFDWixPQUFlO1lBRmYsYUFBUSxHQUFSLFFBQVEsQ0FBZTtZQUN2QixVQUFLLEdBQUwsS0FBSyxDQUFPO1lBQ1osWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUM1QixDQUFDO0tBQ0w7SUFORCxrREFNQztJQUVELEtBQUssVUFBVSxlQUFlLENBQUMsUUFBdUIsRUFBRSxPQUFlLEVBQUUsS0FBaUIsRUFBRSxRQUFrQixFQUFFLEtBQXdCO1FBQ3ZJLElBQUksQ0FBQztZQUNKLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNwRixJQUFJLE1BQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsT0FBTyxJQUFJLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDM0QsQ0FBQztRQUNGLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2QsSUFBQSxrQ0FBeUIsRUFBQyxHQUFHLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQUVELFNBQWdCLFFBQVEsQ0FBQyxRQUFnRCxFQUFFLEtBQWlCLEVBQUUsUUFBa0IsRUFBRSxLQUF3QjtRQUN6SSxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDOUcsT0FBTywyQkFBbUIsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDOUQsQ0FBQztJQUpELDRCQUlDO0lBRUQsU0FBZ0IsZUFBZSxDQUFDLFFBQWdELEVBQUUsS0FBaUIsRUFBRSxRQUFrQixFQUFFLEtBQXdCO1FBQ2hKLE9BQU8sUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN2RixDQUFDO0lBRkQsMENBRUM7SUFFRCxJQUFBLGtEQUErQixFQUFDLHVCQUF1QixFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRTtRQUN0RixNQUFNLHVCQUF1QixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMkNBQXdCLENBQUMsQ0FBQztRQUN2RSxPQUFPLGVBQWUsQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RyxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsT0FBTyxDQUFDLE1BQWE7UUFDN0IsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLENBQUM7UUFDdkQsTUFBTSxjQUFjLEdBQUcsT0FBTyxNQUFNLENBQUMsUUFBUSxLQUFLLFdBQVcsSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUMvRyxPQUFPLFFBQVEsSUFBSSxjQUFjLENBQUM7SUFDbkMsQ0FBQyJ9