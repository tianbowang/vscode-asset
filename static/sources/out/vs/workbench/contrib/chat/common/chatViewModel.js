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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/contrib/chat/common/chatWordCounter"], function (require, exports, event_1, lifecycle_1, instantiation_1, log_1, chatModel_1, chatWordCounter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatResponseViewModel = exports.ChatRequestViewModel = exports.ChatViewModel = exports.isWelcomeVM = exports.isResponseVM = exports.isRequestVM = void 0;
    function isRequestVM(item) {
        return !!item && typeof item === 'object' && 'message' in item;
    }
    exports.isRequestVM = isRequestVM;
    function isResponseVM(item) {
        return !!item && typeof item.setVote !== 'undefined';
    }
    exports.isResponseVM = isResponseVM;
    function isWelcomeVM(item) {
        return !!item && typeof item === 'object' && 'content' in item;
    }
    exports.isWelcomeVM = isWelcomeVM;
    let ChatViewModel = class ChatViewModel extends lifecycle_1.Disposable {
        get inputPlaceholder() {
            return this._inputPlaceholder ?? this._model.inputPlaceholder;
        }
        setInputPlaceholder(text) {
            this._inputPlaceholder = text;
            this._onDidChange.fire({ kind: 'changePlaceholder' });
        }
        resetInputPlaceholder() {
            this._inputPlaceholder = undefined;
            this._onDidChange.fire({ kind: 'changePlaceholder' });
        }
        get sessionId() {
            return this._model.sessionId;
        }
        get requestInProgress() {
            return this._model.requestInProgress;
        }
        get providerId() {
            return this._model.providerId;
        }
        get initState() {
            return this._model.initState;
        }
        constructor(_model, instantiationService) {
            super();
            this._model = _model;
            this.instantiationService = instantiationService;
            this._onDidDisposeModel = this._register(new event_1.Emitter());
            this.onDidDisposeModel = this._onDidDisposeModel.event;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._items = [];
            this._inputPlaceholder = undefined;
            _model.getRequests().forEach((request, i) => {
                this._items.push(new ChatRequestViewModel(request));
                if (request.response) {
                    this.onAddResponse(request.response);
                }
            });
            this._register(_model.onDidDispose(() => this._onDidDisposeModel.fire()));
            this._register(_model.onDidChange(e => {
                if (e.kind === 'addRequest') {
                    this._items.push(new ChatRequestViewModel(e.request));
                    if (e.request.response) {
                        this.onAddResponse(e.request.response);
                    }
                }
                else if (e.kind === 'addResponse') {
                    this.onAddResponse(e.response);
                }
                else if (e.kind === 'removeRequest') {
                    const requestIdx = this._items.findIndex(item => isRequestVM(item) && item.id === e.requestId);
                    if (requestIdx >= 0) {
                        this._items.splice(requestIdx, 1);
                    }
                    const responseIdx = e.responseId && this._items.findIndex(item => isResponseVM(item) && item.id === e.responseId);
                    if (typeof responseIdx === 'number' && responseIdx >= 0) {
                        const items = this._items.splice(responseIdx, 1);
                        const item = items[0];
                        if (isResponseVM(item)) {
                            item.dispose();
                        }
                    }
                }
                const modelEventToVmEvent = e.kind === 'addRequest' ? { kind: 'addRequest' } :
                    e.kind === 'initialize' ? { kind: 'initialize' } :
                        null;
                this._onDidChange.fire(modelEventToVmEvent);
            }));
        }
        onAddResponse(responseModel) {
            const response = this.instantiationService.createInstance(ChatResponseViewModel, responseModel);
            this._register(response.onDidChange(() => this._onDidChange.fire(null)));
            this._items.push(response);
        }
        getItems() {
            return [...(this._model.welcomeMessage ? [this._model.welcomeMessage] : []), ...this._items];
        }
        dispose() {
            super.dispose();
            this._items
                .filter((item) => item instanceof ChatResponseViewModel)
                .forEach((item) => item.dispose());
        }
    };
    exports.ChatViewModel = ChatViewModel;
    exports.ChatViewModel = ChatViewModel = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], ChatViewModel);
    class ChatRequestViewModel {
        get id() {
            return this._model.id;
        }
        get dataId() {
            return this.id + `_${chatModel_1.ChatModelInitState[this._model.session.initState]}`;
        }
        get sessionId() {
            return this._model.session.sessionId;
        }
        get username() {
            return this._model.username;
        }
        get avatarIconUri() {
            return this._model.avatarIconUri;
        }
        get message() {
            return this._model.message;
        }
        get messageText() {
            return 'kind' in this.message ? this.message.message : this.message.text;
        }
        constructor(_model) {
            this._model = _model;
        }
    }
    exports.ChatRequestViewModel = ChatRequestViewModel;
    let ChatResponseViewModel = class ChatResponseViewModel extends lifecycle_1.Disposable {
        get id() {
            return this._model.id;
        }
        get dataId() {
            return this._model.id + `_${this._modelChangeCount}` + `_${chatModel_1.ChatModelInitState[this._model.session.initState]}`;
        }
        get providerId() {
            return this._model.providerId;
        }
        get sessionId() {
            return this._model.session.sessionId;
        }
        get username() {
            return this._model.username;
        }
        get avatarIconUri() {
            return this._model.avatarIconUri;
        }
        get agent() {
            return this._model.agent;
        }
        get slashCommand() {
            return this._model.slashCommand;
        }
        get response() {
            return this._model.response;
        }
        get usedContext() {
            return this._model.usedContext;
        }
        get contentReferences() {
            return this._model.contentReferences;
        }
        get progressMessages() {
            return this._model.progressMessages;
        }
        get isComplete() {
            return this._model.isComplete;
        }
        get isCanceled() {
            return this._model.isCanceled;
        }
        get replyFollowups() {
            return this._model.followups?.filter((f) => f.kind === 'reply');
        }
        get commandFollowups() {
            return this._model.followups?.filter((f) => f.kind === 'command');
        }
        get errorDetails() {
            return this._model.errorDetails;
        }
        get vote() {
            return this._model.vote;
        }
        get requestId() {
            return this._model.requestId;
        }
        get usedReferencesExpanded() {
            if (typeof this._usedReferencesExpanded === 'boolean') {
                return this._usedReferencesExpanded;
            }
            return this.response.value.length === 0;
        }
        set usedReferencesExpanded(v) {
            this._usedReferencesExpanded = v;
        }
        get vulnerabilitiesListExpanded() {
            return this._vulnerabilitiesListExpanded;
        }
        set vulnerabilitiesListExpanded(v) {
            this._vulnerabilitiesListExpanded = v;
        }
        get contentUpdateTimings() {
            return this._contentUpdateTimings;
        }
        constructor(_model, logService) {
            super();
            this._model = _model;
            this.logService = logService;
            this._modelChangeCount = 0;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.renderData = undefined;
            this._vulnerabilitiesListExpanded = false;
            this._contentUpdateTimings = undefined;
            if (!_model.isComplete) {
                this._contentUpdateTimings = {
                    loadingStartTime: Date.now(),
                    lastUpdateTime: Date.now(),
                    impliedWordLoadRate: 0,
                    lastWordCount: 0
                };
            }
            this._register(_model.onDidChange(() => {
                if (this._contentUpdateTimings) {
                    // This should be true, if the model is changing
                    const now = Date.now();
                    const wordCount = (0, chatWordCounter_1.countWords)(_model.response.asString());
                    const timeDiff = now - this._contentUpdateTimings.loadingStartTime;
                    const impliedWordLoadRate = this._contentUpdateTimings.lastWordCount / (timeDiff / 1000);
                    this.trace('onDidChange', `Update- got ${this._contentUpdateTimings.lastWordCount} words over ${timeDiff}ms = ${impliedWordLoadRate} words/s. ${wordCount} words are now available.`);
                    this._contentUpdateTimings = {
                        loadingStartTime: this._contentUpdateTimings.loadingStartTime,
                        lastUpdateTime: now,
                        impliedWordLoadRate,
                        lastWordCount: wordCount
                    };
                }
                else {
                    this.logService.warn('ChatResponseViewModel#onDidChange: got model update but contentUpdateTimings is not initialized');
                }
                // new data -> new id, new content to render
                this._modelChangeCount++;
                this._onDidChange.fire();
            }));
        }
        trace(tag, message) {
            this.logService.trace(`ChatResponseViewModel#${tag}: ${message}`);
        }
        setVote(vote) {
            this._modelChangeCount++;
            this._model.setVote(vote);
        }
    };
    exports.ChatResponseViewModel = ChatResponseViewModel;
    exports.ChatResponseViewModel = ChatResponseViewModel = __decorate([
        __param(1, log_1.ILogService)
    ], ChatResponseViewModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFZpZXdNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9jb21tb24vY2hhdFZpZXdNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhaEcsU0FBZ0IsV0FBVyxDQUFDLElBQWE7UUFDeEMsT0FBTyxDQUFDLENBQUMsSUFBSSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDO0lBQ2hFLENBQUM7SUFGRCxrQ0FFQztJQUVELFNBQWdCLFlBQVksQ0FBQyxJQUFhO1FBQ3pDLE9BQU8sQ0FBQyxDQUFDLElBQUksSUFBSSxPQUFRLElBQStCLENBQUMsT0FBTyxLQUFLLFdBQVcsQ0FBQztJQUNsRixDQUFDO0lBRkQsb0NBRUM7SUFFRCxTQUFnQixXQUFXLENBQUMsSUFBYTtRQUN4QyxPQUFPLENBQUMsQ0FBQyxJQUFJLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUM7SUFDaEUsQ0FBQztJQUZELGtDQUVDO0lBMkdNLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxzQkFBVTtRQVU1QyxJQUFJLGdCQUFnQjtZQUNuQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBQy9ELENBQUM7UUFFRCxtQkFBbUIsQ0FBQyxJQUFZO1lBQy9CLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDOUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxxQkFBcUI7WUFDcEIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFNBQVMs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