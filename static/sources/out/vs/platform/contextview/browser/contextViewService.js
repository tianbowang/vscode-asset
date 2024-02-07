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
define(["require", "exports", "vs/base/browser/ui/contextview/contextview", "vs/base/common/lifecycle", "vs/platform/layout/browser/layoutService", "vs/base/browser/dom"], function (require, exports, contextview_1, lifecycle_1, layoutService_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContextViewService = void 0;
    let ContextViewService = class ContextViewService extends lifecycle_1.Disposable {
        constructor(layoutService) {
            super();
            this.layoutService = layoutService;
            this.currentViewDisposable = lifecycle_1.Disposable.None;
            this.contextView = this._register(new contextview_1.ContextView(this.layoutService.mainContainer, 1 /* ContextViewDOMPosition.ABSOLUTE */));
            this.layout();
            this._register(layoutService.onDidLayoutContainer(() => this.layout()));
        }
        // ContextView
        showContextView(delegate, container, shadowRoot) {
            let domPosition;
            if (container) {
                if (container === this.layoutService.getContainer((0, dom_1.getWindow)(container))) {
                    domPosition = 1 /* ContextViewDOMPosition.ABSOLUTE */;
                }
                else if (shadowRoot) {
                    domPosition = 3 /* ContextViewDOMPosition.FIXED_SHADOW */;
                }
                else {
                    domPosition = 2 /* ContextViewDOMPosition.FIXED */;
                }
            }
            else {
                domPosition = 1 /* ContextViewDOMPosition.ABSOLUTE */;
            }
            this.contextView.setContainer(container ?? this.layoutService.activeContainer, domPosition);
            this.contextView.show(delegate);
            const disposable = (0, lifecycle_1.toDisposable)(() => {
                if (this.currentViewDisposable === disposable) {
                    this.hideContextView();
                }
            });
            this.currentViewDisposable = disposable;
            return disposable;
        }
        getContextViewElement() {
            return this.contextView.getViewElement();
        }
        layout() {
            this.contextView.layout();
        }
        hideContextView(data) {
            this.contextView.hide(data);
        }
        dispose() {
            super.dispose();
            this.currentViewDisposable.dispose();
            this.currentViewDisposable = lifecycle_1.Disposable.None;
        }
    };
    exports.ContextViewService = ContextViewService;
    exports.ContextViewService = ContextViewService = __decorate([
        __param(0, layoutService_1.ILayoutService)
    ], ContextViewService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dFZpZXdTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9jb250ZXh0dmlldy9icm93c2VyL2NvbnRleHRWaWV3U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFRekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQU9qRCxZQUNpQixhQUE4QztZQUU5RCxLQUFLLEVBQUUsQ0FBQztZQUZ5QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFKdkQsMEJBQXFCLEdBQWdCLHNCQUFVLENBQUMsSUFBSSxDQUFDO1lBQzVDLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHlCQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLDBDQUFrQyxDQUFDLENBQUM7WUFPakksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsY0FBYztRQUVkLGVBQWUsQ0FBQyxRQUE4QixFQUFFLFNBQXVCLEVBQUUsVUFBb0I7WUFDNUYsSUFBSSxXQUFtQyxDQUFDO1lBQ3hDLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQ2YsSUFBSSxTQUFTLEtBQUssSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBQSxlQUFTLEVBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUN6RSxXQUFXLDBDQUFrQyxDQUFDO2dCQUMvQyxDQUFDO3FCQUFNLElBQUksVUFBVSxFQUFFLENBQUM7b0JBQ3ZCLFdBQVcsOENBQXNDLENBQUM7Z0JBQ25ELENBQUM7cUJBQU0sQ0FBQztvQkFDUCxXQUFXLHVDQUErQixDQUFDO2dCQUM1QyxDQUFDO1lBQ0YsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLFdBQVcsMENBQWtDLENBQUM7WUFDL0MsQ0FBQztZQUVELElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUU1RixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVoQyxNQUFNLFVBQVUsR0FBRyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUNwQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsS0FBSyxVQUFVLEVBQUUsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN4QixDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMscUJBQXFCLEdBQUcsVUFBVSxDQUFDO1lBQ3hDLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFFRCxxQkFBcUI7WUFDcEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzFDLENBQUM7UUFFRCxNQUFNO1lBQ0wsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRUQsZUFBZSxDQUFDLElBQVU7WUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVRLE9BQU87WUFDZixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFaEIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxzQkFBVSxDQUFDLElBQUksQ0FBQztRQUM5QyxDQUFDO0tBQ0QsQ0FBQTtJQWhFWSxnREFBa0I7aUNBQWxCLGtCQUFrQjtRQVE1QixXQUFBLDhCQUFjLENBQUE7T0FSSixrQkFBa0IsQ0FnRTlCIn0=