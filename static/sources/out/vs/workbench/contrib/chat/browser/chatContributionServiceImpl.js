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
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/actions/chatClearActions", "vs/workbench/contrib/chat/browser/actions/chatMoveActions", "vs/workbench/contrib/chat/browser/actions/chatQuickInputActions", "vs/workbench/contrib/chat/browser/chatViewPane", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, codicons_1, lifecycle_1, nls_1, actions_1, contextkey_1, descriptors_1, platform_1, viewPaneContainer_1, contributions_1, views_1, chatActions_1, chatClearActions_1, chatMoveActions_1, chatQuickInputActions_1, chatViewPane_1, chatContributionService_1, extensionsRegistry) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatContributionService = exports.ChatExtensionPointHandler = void 0;
    const chatExtensionPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'interactiveSession',
        jsonSchema: {
            description: (0, nls_1.localize)('vscode.extension.contributes.interactiveSession', 'Contributes an Interactive Session provider'),
            type: 'array',
            items: {
                additionalProperties: false,
                type: 'object',
                defaultSnippets: [{ body: { id: '', program: '', runtime: '' } }],
                required: ['id', 'label'],
                properties: {
                    id: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.interactiveSession.id', "Unique identifier for this Interactive Session provider."),
                        type: 'string'
                    },
                    label: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.interactiveSession.label', "Display name for this Interactive Session provider."),
                        type: 'string'
                    },
                    icon: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.interactiveSession.icon', "An icon for this Interactive Session provider."),
                        type: 'string'
                    },
                    when: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.interactiveSession.when', "A condition which must be true to enable this Interactive Session provider."),
                        type: 'string'
                    },
                }
            }
        },
        activationEventsGenerator: (contributions, result) => {
            for (const contrib of contributions) {
                result.push(`onInteractiveSession:${contrib.id}`);
            }
        },
    });
    let ChatExtensionPointHandler = class ChatExtensionPointHandler {
        constructor(_chatContributionService) {
            this._chatContributionService = _chatContributionService;
            this._registrationDisposables = new Map();
            this._viewContainer = this.registerViewContainer();
            this.handleAndRegisterChatExtensions();
        }
        handleAndRegisterChatExtensions() {
            chatExtensionPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionDisposable = new lifecycle_1.DisposableStore();
                    for (const providerDescriptor of extension.value) {
                        this.registerChatProvider(providerDescriptor);
                        this._chatContributionService.registerChatProvider(providerDescriptor);
                    }
                    this._registrationDisposables.set(extension.description.identifier.value, extensionDisposable);
                }
                for (const extension of delta.removed) {
                    const registration = this._registrationDisposables.get(extension.description.identifier.value);
                    if (registration) {
                        registration.dispose();
                        this._registrationDisposables.delete(extension.description.identifier.value);
                    }
                    for (const providerDescriptor of extension.value) {
                        this._chatContributionService.deregisterChatProvider(providerDescriptor.id);
                    }
                }
            });
        }
        registerViewContainer() {
            // Register View Container
            const title = (0, nls_1.localize2)('chat.viewContainer.label', "Chat");
            const icon = codicons_1.Codicon.commentDiscussion;
            const viewContainerId = chatViewPane_1.CHAT_SIDEBAR_PANEL_ID;
            const viewContainer = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: viewContainerId,
                title,
                icon,
                ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [viewContainerId, { mergeViewWithContainerWhenSingleView: true }]),
                storageId: viewContainerId,
                hideIfEmpty: true,
                order: 100,
            }, 0 /* ViewContainerLocation.Sidebar */);
            return viewContainer;
        }
        registerChatProvider(providerDescriptor) {
            // Register View
            const viewId = this._chatContributionService.getViewIdForProvider(providerDescriptor.id);
            const viewDescriptor = [{
                    id: viewId,
                    containerIcon: this._viewContainer.icon,
                    containerTitle: this._viewContainer.title.value,
                    name: { value: providerDescriptor.label, original: providerDescriptor.label },
                    canToggleVisibility: false,
                    canMoveView: true,
                    ctorDescriptor: new descriptors_1.SyncDescriptor(chatViewPane_1.ChatViewPane, [{ providerId: providerDescriptor.id }]),
                    when: contextkey_1.ContextKeyExpr.deserialize(providerDescriptor.when)
                }];
            platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews(viewDescriptor, this._viewContainer);
            // Per-provider actions
            // Actions in view title
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, actions_1.registerAction2)((0, chatActions_1.getHistoryAction)(viewId, providerDescriptor.id)));
            disposables.add((0, actions_1.registerAction2)((0, chatClearActions_1.getNewChatAction)(viewId, providerDescriptor.id)));
            disposables.add((0, actions_1.registerAction2)((0, chatMoveActions_1.getMoveToEditorAction)(viewId, providerDescriptor.id)));
            disposables.add((0, actions_1.registerAction2)((0, chatMoveActions_1.getMoveToNewWindowAction)(viewId, providerDescriptor.id)));
            // "Open Chat" Actions
            disposables.add((0, actions_1.registerAction2)((0, chatActions_1.getOpenChatEditorAction)(providerDescriptor.id, providerDescriptor.label, providerDescriptor.when)));
            disposables.add((0, actions_1.registerAction2)((0, chatQuickInputActions_1.getQuickChatActionForProvider)(providerDescriptor.id, providerDescriptor.label)));
            return {
                dispose: () => {
                    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).deregisterViews(viewDescriptor, this._viewContainer);
                    platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).deregisterViewContainer(this._viewContainer);
                    disposables.dispose();
                }
            };
        }
    };
    exports.ChatExtensionPointHandler = ChatExtensionPointHandler;
    exports.ChatExtensionPointHandler = ChatExtensionPointHandler = __decorate([
        __param(0, chatContributionService_1.IChatContributionService)
    ], ChatExtensionPointHandler);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ChatExtensionPointHandler, 1 /* LifecyclePhase.Starting */);
    class ChatContributionService {
        constructor() {
            this._registeredProviders = new Map();
        }
        getViewIdForProvider(providerId) {
            return chatViewPane_1.ChatViewPane.ID + '.' + providerId;
        }
        registerChatProvider(provider) {
            this._registeredProviders.set(provider.id, provider);
        }
        deregisterChatProvider(providerId) {
            this._registeredProviders.delete(providerId);
        }
        get registeredProviders() {
            return Array.from(this._registeredProviders.values());
        }
    }
    exports.ChatContributionService = ChatContributionService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdENvbnRyaWJ1dGlvblNlcnZpY2VJbXBsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvY2hhdENvbnRyaWJ1dGlvblNlcnZpY2VJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXNCaEcsTUFBTSxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBaUM7UUFDdkgsY0FBYyxFQUFFLG9CQUFvQjtRQUNwQyxVQUFVLEVBQUU7WUFDWCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsaURBQWlELEVBQUUsNkNBQTZDLENBQUM7WUFDdkgsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUU7Z0JBQ04sb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsZUFBZSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0JBQ2pFLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUM7Z0JBQ3pCLFVBQVUsRUFBRTtvQkFDWCxFQUFFLEVBQUU7d0JBQ0gsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLG9EQUFvRCxFQUFFLDBEQUEwRCxDQUFDO3dCQUN2SSxJQUFJLEVBQUUsUUFBUTtxQkFDZDtvQkFDRCxLQUFLLEVBQUU7d0JBQ04sV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHVEQUF1RCxFQUFFLHFEQUFxRCxDQUFDO3dCQUNySSxJQUFJLEVBQUUsUUFBUTtxQkFDZDtvQkFDRCxJQUFJLEVBQUU7d0JBQ0wsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHNEQUFzRCxFQUFF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