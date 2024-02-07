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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/base/common/arrays", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/platform/notification/common/notification", "vs/nls", "vs/base/common/event", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig"], function (require, exports, extensionManagement_1, arrays_1, extensionRecommendations_1, notification_1, nls_1, event_1, workspaceExtensionsConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceRecommendations = void 0;
    let WorkspaceRecommendations = class WorkspaceRecommendations extends extensionRecommendations_1.ExtensionRecommendations {
        get recommendations() { return this._recommendations; }
        get ignoredRecommendations() { return this._ignoredRecommendations; }
        constructor(workspaceExtensionsConfigService, notificationService) {
            super();
            this.workspaceExtensionsConfigService = workspaceExtensionsConfigService;
            this.notificationService = notificationService;
            this._recommendations = [];
            this._onDidChangeRecommendations = this._register(new event_1.Emitter());
            this.onDidChangeRecommendations = this._onDidChangeRecommendations.event;
            this._ignoredRecommendations = [];
        }
        async doActivate() {
            await this.fetch();
            this._register(this.workspaceExtensionsConfigService.onDidChangeExtensionsConfigs(() => this.onDidChangeExtensionsConfigs()));
        }
        /**
         * Parse all extensions.json files, fetch workspace recommendations, filter out invalid and unwanted ones
         */
        async fetch() {
            const extensionsConfigs = await this.workspaceExtensionsConfigService.getExtensionsConfigs();
            const { invalidRecommendations, message } = await this.validateExtensions(extensionsConfigs);
            if (invalidRecommendations.length) {
                this.notificationService.warn(`The ${invalidRecommendations.length} extension(s) below, in workspace recommendations have issues:\n${message}`);
            }
            this._recommendations = [];
            this._ignoredRecommendations = [];
            for (const extensionsConfig of extensionsConfigs) {
                if (extensionsConfig.unwantedRecommendations) {
                    for (const unwantedRecommendation of extensionsConfig.unwantedRecommendations) {
                        if (invalidRecommendations.indexOf(unwantedRecommendation) === -1) {
                            this._ignoredRecommendations.push(unwantedRecommendation);
                        }
                    }
                }
                if (extensionsConfig.recommendations) {
                    for (const extensionId of extensionsConfig.recommendations) {
                        if (invalidRecommendations.indexOf(extensionId) === -1) {
                            this._recommendations.push({
                                extensionId,
                                reason: {
                                    reasonId: 0 /* ExtensionRecommendationReason.Workspace */,
                                    reasonText: (0, nls_1.localize)('workspaceRecommendation', "This extension is recommended by users of the current workspace.")
                                }
                            });
                        }
                    }
                }
            }
        }
        async validateExtensions(contents) {
            const validExtensions = [];
            const invalidExtensions = [];
            let message = '';
            const allRecommendations = (0, arrays_1.distinct)((0, arrays_1.flatten)(contents.map(({ recommendations }) => recommendations || [])));
            const regEx = new RegExp(extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN);
            for (const extensionId of allRecommendations) {
                if (regEx.test(extensionId)) {
                    validExtensions.push(extensionId);
                }
                else {
                    invalidExtensions.push(extensionId);
                    message += `${extensionId} (bad format) Expected: <provider>.<name>\n`;
                }
            }
            return { validRecommendations: validExtensions, invalidRecommendations: invalidExtensions, message };
        }
        async onDidChangeExtensionsConfigs() {
            await this.fetch();
            this._onDidChangeRecommendations.fire();
        }
    };
    exports.WorkspaceRecommendations = WorkspaceRecommendations;
    exports.WorkspaceRecommendations = WorkspaceRecommendations = __decorate([
        __param(0, workspaceExtensionsConfig_1.IWorkspaceExtensionsConfigService),
        __param(1, notification_1.INotificationService)
    ], WorkspaceRecommendations);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlUmVjb21tZW5kYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvd29ya3NwYWNlUmVjb21tZW5kYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVd6RixJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLG1EQUF3QjtRQUdyRSxJQUFJLGVBQWUsS0FBNkMsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBTS9GLElBQUksc0JBQXNCLEtBQTRCLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztRQUU1RixZQUNvQyxnQ0FBb0YsRUFDakcsbUJBQTBEO1lBRWhGLEtBQUssRUFBRSxDQUFDO1lBSDRDLHFDQUFnQyxHQUFoQyxnQ0FBZ0MsQ0FBbUM7WUFDaEYsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQVh6RSxxQkFBZ0IsR0FBOEIsRUFBRSxDQUFDO1lBR2pELGdDQUEyQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ2pFLCtCQUEwQixHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLENBQUM7WUFFckUsNEJBQXVCLEdBQWEsRUFBRSxDQUFDO1FBUS9DLENBQUM7UUFFUyxLQUFLLENBQUMsVUFBVTtZQUN6QixNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0gsQ0FBQztRQUVEOztXQUVHO1FBQ0ss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