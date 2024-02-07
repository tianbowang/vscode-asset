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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/log/common/log", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/memento", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/common/chatService"], function (require, exports, cancellation_1, lifecycle_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, keybinding_1, log_1, opener_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, viewPane_1, memento_1, theme_1, views_1, chatWidget_1, chatService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatViewPane = exports.CHAT_SIDEBAR_PANEL_ID = void 0;
    exports.CHAT_SIDEBAR_PANEL_ID = 'workbench.panel.chatSidebar';
    let ChatViewPane = class ChatViewPane extends viewPane_1.ViewPane {
        static { this.ID = 'workbench.panel.chat.view'; }
        get widget() { return this._widget; }
        constructor(chatViewOptions, options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, storageService, chatService, logService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.chatViewOptions = chatViewOptions;
            this.storageService = storageService;
            this.chatService = chatService;
            this.logService = logService;
            this.modelDisposables = this._register(new lifecycle_1.DisposableStore());
            this.didProviderRegistrationFail = false;
            // View state for the ViewPane is currently global per-provider basically, but some other strictly per-model state will require a separate memento.
            this.memento = new memento_1.Memento('interactive-session-view-' + this.chatViewOptions.providerId, this.storageService);
            this.viewState = this.memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this._register(this.chatService.onDidRegisterProvider(({ providerId }) => {
                if (providerId === this.chatViewOptions.providerId && !this._widget?.viewModel) {
                    const sessionId = this.getSessionId();
                    const model = sessionId ? this.chatService.getOrRestoreSession(sessionId) : undefined;
                    // The widget may be hidden at this point, because welcome views were allowed. Use setVisible to
                    // avoid doing a render while the widget is hidden. This is changing the condition in `shouldShowWelcome`
                    // so it should fire onDidChangeViewWelcomeState.
                    try {
                        this._widget.setVisible(false);
                        this.updateModel(model);
                        this._onDidChangeViewWelcomeState.fire();
                    }
                    finally {
                        this.widget.setVisible(true);
                    }
                }
            }));
        }
        updateModel(model, viewState) {
            this.modelDisposables.clear();
            model = model ?? (this.chatService.transferredSessionData?.sessionId
                ? this.chatService.getOrRestoreSession(this.chatService.transferredSessionData.sessionId)
                : this.chatService.startSession(this.chatViewOptions.providerId, cancellation_1.CancellationToken.None));
            if (!model) {
                throw new Error('Could not start chat session');
            }
            this._widget.setModel(model, { ...(viewState ?? this.viewState) });
            this.viewState.sessionId = model.sessionId;
        }
        shouldShowWelcome() {
            const noPersistedSessions = !this.chatService.hasSessions(this.chatViewOptions.providerId);
            return !this._widget?.viewModel && (noPersistedSessions || this.didProviderRegistrationFail);
        }
        getSessionId() {
            let sessionId;
            if (this.chatService.transferredSessionData) {
                sessionId = this.chatService.transferredSessionData.sessionId;
                this.viewState.inputValue = this.chatService.transferredSessionData.inputValue;
            }
            else {
                sessionId = this.viewState.sessionId;
            }
            return sessionId;
        }
        renderBody(parent) {
            try {
                super.renderBody(parent);
                const scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService]));
                this._widget = this._register(scopedInstantiationService.createInstance(chatWidget_1.ChatWidget, { viewId: this.id }, { supportsFileReferences: true }, {
                    listForeground: theme_1.SIDE_BAR_FOREGROUND,
                    listBackground: this.getBackgroundColor(),
                    inputEditorBackground: this.getBackgroundColor(),
                    resultEditorBackground: colorRegistry_1.editorBackground
                }));
                this._register(this.onDidChangeBodyVisibility(visible => {
                    this._widget.setVisible(visible);
                }));
                this._register(this._widget.onDidClear(() => this.clear()));
                this._widget.render(parent);
                const sessionId = this.getSessionId();
                // Render the welcome view if this session gets disposed at any point,
                // including if the provider registration fails
                const disposeListener = sessionId ? this._register(this.chatService.onDidDisposeSession((e) => {
                    if (e.reason === 'initializationFailed' && e.providerId === this.chatViewOptions.providerId) {
                        this.didProviderRegistrationFail = true;
                        disposeListener?.dispose();
                        this._onDidChangeViewWelcomeState.fire();
                    }
                })) : undefined;
                const model = sessionId ? this.chatService.getOrRestoreSession(sessionId) : undefined;
                this.updateModel(model);
            }
            catch (e) {
                this.logService.error(e);
                throw e;
            }
        }
        acceptInput(query) {
            this._widget.acceptInput(query);
        }
        async clear() {
            if (this.widget.viewModel) {
                this.chatService.clearSession(this.widget.viewModel.sessionId);
            }
            this.updateModel(undefined, { ...this.viewState, inputValue: undefined });
        }
        loadSession(sessionId) {
            if (this.widget.viewModel) {
                this.chatService.clearSession(this.widget.viewModel.sessionId);
            }
            const newModel = this.chatService.getOrRestoreSession(sessionId);
            this.updateModel(newModel);
        }
        focusInput() {
            this._widget.focusInput();
        }
        focus() {
            super.focus();
            this._widget.focusInput();
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this._widget.layout(height, width);
        }
        saveState() {
            if (this._widget) {
                // Since input history is per-provider, this is handled by a separate service and not the memento here.
                // TODO multiple chat views will overwrite each other
                this._widget.saveState();
                const widgetViewState = this._widget.getViewState();
                this.viewState.inputValue = widgetViewState.inputValue;
                this.viewState.inputState = widgetViewState.inputState;
                this.memento.saveMemento();
            }
            super.saveState();
        }
    };
    exports.ChatViewPane = ChatViewPane;
    exports.ChatViewPane = ChatViewPane = __decorate([
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, views_1.IViewDescriptorService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, opener_1.IOpenerService),
        __param(9, themeService_1.IThemeService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, storage_1.IStorageService),
        __param(12, chatService_1.IChatService),
        __param(13, log_1.ILogService)
    ], ChatViewPane);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFZpZXdQYW5lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvY2hhdFZpZXdQYW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlDbkYsUUFBQSxxQkFBcUIsR0FBRyw2QkFBNkIsQ0FBQztJQUM1RCxJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsbUJBQVE7aUJBQ2xDLE9BQUUsR0FBRywyQkFBMkIsQUFBOUIsQ0FBK0I7UUFHeEMsSUFBSSxNQUFNLEtBQWlCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFPakQsWUFDa0IsZUFBaUMsRUFDbEQsT0FBeUIsRUFDTCxpQkFBcUMsRUFDcEMsa0JBQXVDLEVBQ3JDLG9CQUEyQyxFQUM5QyxpQkFBcUMsRUFDakMscUJBQTZDLEVBQzlDLG9CQUEyQyxFQUNsRCxhQUE2QixFQUM5QixZQUEyQixFQUN2QixnQkFBbUMsRUFDckMsY0FBZ0QsRUFDbkQsV0FBMEMsRUFDM0MsVUFBd0M7WUFFckQsS0FBSyxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFmMUssb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBV2hCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNsQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUMxQixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBbkI5QyxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFHekQsZ0NBQTJCLEdBQUcsS0FBSyxDQUFDO1lB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