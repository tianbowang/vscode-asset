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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/services/textMate/browser/textMateTokenizationFeature", "vs/workbench/services/textMate/browser/textMateTokenizationFeatureImpl", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, extensions_1, textMateTokenizationFeature_1, textMateTokenizationFeatureImpl_1, platform_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Makes sure the ITextMateTokenizationService is instantiated
     */
    let TextMateTokenizationInstantiator = class TextMateTokenizationInstantiator {
        constructor(_textMateTokenizationService) { }
    };
    TextMateTokenizationInstantiator = __decorate([
        __param(0, textMateTokenizationFeature_1.ITextMateTokenizationService)
    ], TextMateTokenizationInstantiator);
    (0, extensions_1.registerSingleton)(textMateTokenizationFeature_1.ITextMateTokenizationService, textMateTokenizationFeatureImpl_1.TextMateTokenizationFeature, 0 /* InstantiationType.Eager */);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(TextMateTokenizationInstantiator, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1hdGVUb2tlbml6YXRpb25GZWF0dXJlLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RleHRNYXRlL2Jyb3dzZXIvdGV4dE1hdGVUb2tlbml6YXRpb25GZWF0dXJlLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQVNoRzs7T0FFRztJQUNILElBQU0sZ0NBQWdDLEdBQXRDLE1BQU0sZ0NBQWdDO1FBQ3JDLFlBQytCLDRCQUEwRCxJQUNyRixDQUFDO0tBQ0wsQ0FBQTtJQUpLLGdDQUFnQztRQUVuQyxXQUFBLDBEQUE0QixDQUFBO09BRnpCLGdDQUFnQyxDQUlyQztJQUVELElBQUEsOEJBQWlCLEVBQUMsMERBQTRCLEVBQUUsNkRBQTJCLGtDQUEwQixDQUFDO0lBRXRHLE1BQU0saUJBQWlCLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0YsaUJBQWlCLENBQUMsNkJBQTZCLENBQUMsZ0NBQWdDLCtCQUF1QixDQUFDIn0=