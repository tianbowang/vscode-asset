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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/linkedList", "vs/platform/contextkey/common/contextkey", "./inlineChat"], function (require, exports, lifecycle_1, event_1, linkedList_1, contextkey_1, inlineChat_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineChatServiceImpl = void 0;
    let InlineChatServiceImpl = class InlineChatServiceImpl {
        get onDidChangeProviders() {
            return this._onDidChangeProviders.event;
        }
        constructor(contextKeyService) {
            this._entries = new linkedList_1.LinkedList();
            this._onDidChangeProviders = new event_1.Emitter();
            this._ctxHasProvider = inlineChat_1.CTX_INLINE_CHAT_HAS_PROVIDER.bindTo(contextKeyService);
        }
        addProvider(provider) {
            const rm = this._entries.push(provider);
            this._ctxHasProvider.set(true);
            this._onDidChangeProviders.fire();
            return (0, lifecycle_1.toDisposable)(() => {
                rm();
                this._ctxHasProvider.set(this._entries.size > 0);
                this._onDidChangeProviders.fire();
            });
        }
        getAllProvider() {
            return [...this._entries].reverse();
        }
    };
    exports.InlineChatServiceImpl = InlineChatServiceImpl;
    exports.InlineChatServiceImpl = InlineChatServiceImpl = __decorate([
        __param(0, contextkey_1.IContextKeyService)
    ], InlineChatServiceImpl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdFNlcnZpY2VJbXBsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9pbmxpbmVDaGF0L2NvbW1vbi9pbmxpbmVDaGF0U2VydmljZUltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBUXpGLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXFCO1FBU2pDLElBQVcsb0JBQW9CO1lBQzlCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQztRQUN6QyxDQUFDO1FBRUQsWUFBZ0MsaUJBQXFDO1lBVHBELGFBQVEsR0FBRyxJQUFJLHVCQUFVLEVBQThCLENBQUM7WUFJeEQsMEJBQXFCLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQU01RCxJQUFJLENBQUMsZUFBZSxHQUFHLHlDQUE0QixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFRCxXQUFXLENBQUMsUUFBb0M7WUFFL0MsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxDQUFDO1lBRWxDLE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDeEIsRUFBRSxFQUFFLENBQUM7Z0JBQ0wsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxjQUFjO1lBQ2IsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3JDLENBQUM7S0FDRCxDQUFBO0lBakNZLHNEQUFxQjtvQ0FBckIscUJBQXFCO1FBYXBCLFdBQUEsK0JBQWtCLENBQUE7T0FibkIscUJBQXFCLENBaUNqQyJ9