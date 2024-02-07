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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/platform/hover/browser/hover", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/editor/browser/widget/hoverWidget/hoverWidget", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/base/browser/keyboardEvent", "vs/platform/accessibility/common/accessibility", "vs/platform/layout/browser/layoutService", "vs/base/browser/window"], function (require, exports, extensions_1, themeService_1, colorRegistry_1, hover_1, contextView_1, instantiation_1, hoverWidget_1, lifecycle_1, dom_1, keybinding_1, keyboardEvent_1, accessibility_1, layoutService_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HoverService = void 0;
    let HoverService = class HoverService {
        constructor(_instantiationService, _contextViewService, contextMenuService, _keybindingService, _layoutService, _accessibilityService) {
            this._instantiationService = _instantiationService;
            this._contextViewService = _contextViewService;
            this._keybindingService = _keybindingService;
            this._layoutService = _layoutService;
            this._accessibilityService = _accessibilityService;
            contextMenuService.onDidShowContextMenu(() => this.hideHover());
        }
        showHover(options, focus, skipLastFocusedUpdate) {
            if (getHoverOptionsIdentity(this._currentHoverOptions) === getHoverOptionsIdentity(options)) {
                return undefined;
            }
            if (this._currentHover && this._currentHoverOptions?.persistence?.sticky) {
                return undefined;
            }
            this._currentHoverOptions = options;
            this._lastHoverOptions = options;
            const trapFocus = options.trapFocus || this._accessibilityService.isScreenReaderOptimized();
            const activeElement = (0, dom_1.getActiveElement)();
            // HACK, remove this check when #189076 is fixed
            if (!skipLastFocusedUpdate) {
                if (trapFocus && activeElement) {
                    this._lastFocusedElementBeforeOpen = activeElement;
                }
                else {
                    this._lastFocusedElementBeforeOpen = undefined;
                }
            }
            const hoverDisposables = new lifecycle_1.DisposableStore();
            const hover = this._instantiationService.createInstance(hoverWidget_1.HoverWidget, options);
            if (options.persistence?.sticky) {
                hover.isLocked = true;
            }
            hover.onDispose(() => {
                const hoverWasFocused = this._currentHover?.domNode && (0, dom_1.isAncestorOfActiveElement)(this._currentHover.domNode);
                if (hoverWasFocused) {
                    // Required to handle cases such as closing the hover with the escape key
                    this._lastFocusedElementBeforeOpen?.focus();
                }
                // Only clear the current options if it's the current hover, the current options help
                // reduce flickering when the same hover is shown multiple times
                if (this._currentHoverOptions === options) {
                    this._currentHoverOptions = undefined;
                }
                hoverDisposables.dispose();
            });
            // Set the container explicitly to enable aux window support
            if (!options.container) {
                const targetElement = options.target instanceof HTMLElement ? options.target : options.target.targetElements[0];
                options.container = this._layoutService.getContainer((0, dom_1.getWindow)(targetElement));
            }
            const provider = this._contextViewService;
            provider.showContextView(new HoverContextViewDelegate(hover, focus), options.container);
            hover.onRequestLayout(() => provider.layout());
            if (options.persistence?.sticky) {
                hoverDisposables.add((0, dom_1.addDisposableListener)((0, dom_1.getWindow)(options.container).document, dom_1.EventType.MOUSE_DOWN, e => {
                    if (!(0, dom_1.isAncestor)(e.target, hover.domNode)) {
                        this.doHideHover();
                    }
                }));
            }
            else {
                if ('targetElements' in options.target) {
                    for (const element of options.target.targetElements) {
                        hoverDisposables.add((0, dom_1.addDisposableListener)(element, dom_1.EventType.CLICK, () => this.hideHover()));
                    }
                }
                else {
                    hoverDisposables.add((0, dom_1.addDisposableListener)(options.target, dom_1.EventType.CLICK, () => this.hideHover()));
                }
                const focusedElement = (0, dom_1.getActiveElement)();
                if (focusedElement) {
                    const focusedElementDocument = (0, dom_1.getWindow)(focusedElement).document;
                    hoverDisposables.add((0, dom_1.addDisposableListener)(focusedElement, dom_1.EventType.KEY_DOWN, e => this._keyDown(e, hover, !!options.persistence?.hideOnKeyDown)));
                    hoverDisposables.add((0, dom_1.addDisposableListener)(focusedElementDocument, dom_1.EventType.KEY_DOWN, e => this._keyDown(e, hover, !!options.persistence?.hideOnKeyDown)));
                    hoverDisposables.add((0, dom_1.addDisposableListener)(focusedElement, dom_1.EventType.KEY_UP, e => this._keyUp(e, hover)));
                    hoverDisposables.add((0, dom_1.addDisposableListener)(focusedElementDocument, dom_1.EventType.KEY_UP, e => this._keyUp(e, hover)));
                }
            }
            if ('IntersectionObserver' in window_1.mainWindow) {
                const observer = new IntersectionObserver(e => this._intersectionChange(e, hover), { threshold: 0 });
                const firstTargetElement = 'targetElements' in options.target ? options.target.targetElements[0] : options.target;
                observer.observe(firstTargetElement);
                hoverDisposables.add((0, lifecycle_1.toDisposable)(() => observer.disconnect()));
            }
            this._currentHover = hover;
            return hover;
        }
        hideHover() {
            if (this._currentHover?.isLocked || !this._currentHoverOptions) {
                return;
            }
            this.doHideHover();
        }
        doHideHover() {
            this._currentHover = undefined;
            this._currentHoverOptions = undefined;
            this._contextViewService.hideContextView();
        }
        _intersectionChange(entries, hover) {
            const entry = entries[entries.length - 1];
            if (!entry.isIntersecting) {
                hover.dispose();
            }
        }
        showAndFocusLastHover() {
            if (!this._lastHoverOptions) {
                return;
            }
            this.showHover(this._lastHoverOptions, true, true);
        }
        _keyDown(e, hover, hideOnKeyDown) {
            if (e.key === 'Alt') {
                hover.isLocked = true;
                return;
            }
            const event = new keyboardEvent_1.StandardKeyboardEvent(e);
            const keybinding = this._keybindingService.resolveKeyboardEvent(event);
            if (keybinding.getSingleModifierDispatchChords().some(value => !!value) || this._keybindingService.softDispatch(event, event.target).kind !== 0 /* ResultKind.NoMatchingKb */) {
                return;
            }
            if (hideOnKeyDown && (!this._currentHoverOptions?.trapFocus || e.key !== 'Tab')) {
                this.hideHover();
                this._lastFocusedElementBeforeOpen?.focus();
            }
        }
        _keyUp(e, hover) {
            if (e.key === 'Alt') {
                hover.isLocked = false;
                // Hide if alt is released while the mouse is not over hover/target
                if (!hover.isMouseIn) {
                    this.hideHover();
                    this._lastFocusedElementBeforeOpen?.focus();
                }
            }
        }
    };
    exports.HoverService = HoverService;
    exports.HoverService = HoverService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextView_1.IContextViewService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, layoutService_1.ILayoutService),
        __param(5, accessibility_1.IAccessibilityService)
    ], HoverService);
    function getHoverOptionsIdentity(options) {
        if (options === undefined) {
            return undefined;
        }
        return options?.id ?? options;
    }
    class HoverContextViewDelegate {
        get anchorPosition() {
            return this._hover.anchor;
        }
        constructor(_hover, _focus = false) {
            this._hover = _hover;
            this._focus = _focus;
        }
        render(container) {
            this._hover.render(container);
            if (this._focus) {
                this._hover.focus();
            }
            return this._hover;
        }
        getAnchor() {
            return {
                x: this._hover.x,
                y: this._hover.y
            };
        }
        layout() {
            this._hover.layout();
        }
    }
    (0, extensions_1.registerSingleton)(hover_1.IHoverService, HoverService, 1 /* InstantiationType.Delayed */);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const hoverBorder = theme.getColor(colorRegistry_1.editorHoverBorder);
        if (hoverBorder) {
            collector.addRule(`.monaco-workbench .workbench-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
            collector.addRule(`.monaco-workbench .workbench-hover hr { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci9zZXJ2aWNlcy9ob3ZlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0J6RixJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFZO1FBU3hCLFlBQ3lDLHFCQUE0QyxFQUM5QyxtQkFBd0MsRUFDekQsa0JBQXVDLEVBQ3ZCLGtCQUFzQyxFQUMxQyxjQUE4QixFQUN2QixxQkFBNEM7WUFMNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUM5Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBRXpDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDMUMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQ3ZCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFFcEYsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELFNBQVMsQ0FBQyxPQUFzQixFQUFFLEtBQWUsRUFBRSxxQkFBK0I7WUFDakYsSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUM3RixPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDO1lBQ0QsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQzFFLE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUM7WUFDRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsT0FBTyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLENBQUM7WUFDakMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUM1RixNQUFNLGFBQWEsR0FBRyxJQUFBLHNCQUFnQixHQUFFLENBQUM7WUFDekMsZ0RBQWdEO1lBQ2hELElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUM1QixJQUFJLFNBQVMsSUFBSSxhQUFhLEVBQUUsQ0FBQztvQkFDaEMsSUFBSSxDQUFDLDZCQUE2QixHQUFHLGFBQTRCLENBQUM7Z0JBQ25FLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxJQUFJLENBQUMsNkJBQTZCLEdBQUcsU0FBUyxDQUFDO2dCQUNoRCxDQUFDO1lBQ0YsQ0FBQztZQUNELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDL0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyx5QkFBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzlFLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQztnQkFDakMsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDdkIsQ0FBQztZQUNELEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUNwQixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLE9BQU8sSUFBSSxJQUFBLCtCQUF5QixFQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBUSxDQUFDLENBQUM7Z0JBQzlHLElBQUksZUFBZSxFQUFFLENBQUM7b0JBQ3JCLHlFQUF5RTtvQkFDekUsSUFBSSxDQUFDLDZCQUE2QixFQUFFLEtBQUssRUFBRSxDQUFDO2dCQUM3QyxDQUFDO2dCQUVELHFGQUFxRjtnQkFDckYsZ0VBQWdFO2dCQUNoRSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsS0FBSyxPQUFPLEVBQUUsQ0FBQztvQkFDM0MsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQztnQkFDdkMsQ0FBQztnQkFDRCxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztZQUNILDREQUE0RDtZQUM1RCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUN4QixNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxZQUFZLFdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hILE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBQSxlQUFTLEVBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNoRixDQUFDO1lBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUEyQyxDQUFDO1lBQ2xFLFFBQVEsQ0FBQyxlQUFlLENBQ3ZCLElBQUksd0JBQXdCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUMxQyxPQUFPLENBQUMsU0FBUyxDQUNqQixDQUFDO1lBQ0YsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUMvQyxJQUFJLE9BQU8sQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQ2pDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFBLDJCQUFxQixFQUFDLElBQUEsZUFBUyxFQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsZUFBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRTtvQkFDM0csSUFBSSxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUFDLENBQUMsTUFBcUIsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQzt3QkFDekQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUNwQixDQUFDO2dCQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxnQkFBZ0IsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ3hDLEtBQUssTUFBTSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDckQsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsT0FBTyxFQUFFLGVBQVMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDL0YsQ0FBQztnQkFDRixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxlQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RHLENBQUM7Z0JBQ0QsTUFBTSxjQUFjLEdBQUcsSUFBQSxzQkFBZ0IsR0FBRSxDQUFDO2dCQUMxQyxJQUFJLGNBQWMsRUFBRSxDQUFDO29CQUNwQixNQUFNLHNCQUFzQixHQUFHLElBQUEsZUFBUyxFQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztvQkFDbEUsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsY0FBYyxFQUFFLGVBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwSixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxzQkFBc0IsRUFBRSxlQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUosZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsY0FBYyxFQUFFLGVBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFBLDJCQUFxQixFQUFDLHNCQUFzQixFQUFFLGVBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25ILENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxzQkFBc0IsSUFBSSxtQkFBVSxFQUFFLENBQUM7Z0JBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUksb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3JHLE1BQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQ2xILFFBQVEsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDckMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLENBQUM7WUFFRCxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztZQUUzQixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxTQUFTO1lBQ1IsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUNoRSxPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRU8sV0FBVztZQUNsQixJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztZQUMvQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM1QyxDQUFDO1FBRU8sbUJBQW1CLENBQUMsT0FBb0MsRUFBRSxLQUFrQjtZQUNuRixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUMzQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakIsQ0FBQztRQUNGLENBQUM7UUFFRCxxQkFBcUI7WUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRU8sUUFBUSxDQUFDLENBQWdCLEVBQUUsS0FBa0IsRUFBRSxhQUFzQjtZQUM1RSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssS0FBSyxFQUFFLENBQUM7Z0JBQ3JCLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixPQUFPO1lBQ1IsQ0FBQztZQUNELE1BQU0sS0FBSyxHQUFHLElBQUkscUNBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZFLElBQUksVUFBVSxDQUFDLCtCQUErQixFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLG9DQUE0QixFQUFFLENBQUM7Z0JBQ3ZLLE9BQU87WUFDUixDQUFDO1lBQ0QsSUFBSSxhQUFhLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNqRixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUM3QyxDQUFDO1FBQ0YsQ0FBQztRQUVPLE1BQU0sQ0FBQyxDQUFnQixFQUFFLEtBQWtCO1lBQ2xELElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxLQUFLLEVBQUUsQ0FBQztnQkFDckIsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQ3ZCLG1FQUFtRTtnQkFDbkUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDdEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNqQixJQUFJLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxFQUFFLENBQUM7Z0JBQzdDLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztLQUNELENBQUE7SUE5Slksb0NBQVk7MkJBQVosWUFBWTtRQVV0QixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsOEJBQWMsQ0FBQTtRQUNkLFdBQUEscUNBQXFCLENBQUE7T0FmWCxZQUFZLENBOEp4QjtJQUVELFNBQVMsdUJBQXVCLENBQUMsT0FBa0M7UUFDbEUsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDM0IsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUNELE9BQU8sT0FBTyxFQUFFLEVBQUUsSUFBSSxPQUFPLENBQUM7SUFDL0IsQ0FBQztJQUVELE1BQU0sd0JBQXdCO1FBRTdCLElBQUksY0FBYztZQUNqQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzNCLENBQUM7UUFFRCxZQUNrQixNQUFtQixFQUNuQixTQUFrQixLQUFLO1lBRHZCLFdBQU0sR0FBTixNQUFNLENBQWE7WUFDbkIsV0FBTSxHQUFOLE1BQU0sQ0FBaUI7UUFFekMsQ0FBQztRQUVELE1BQU0sQ0FBQyxTQUFzQjtZQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNyQixDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxTQUFTO1lBQ1IsT0FBTztnQkFDTixDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNoQixDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ2hCLENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTTtZQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdEIsQ0FBQztLQUNEO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyxxQkFBYSxFQUFFLFlBQVksb0NBQTRCLENBQUM7SUFFMUUsSUFBQSx5Q0FBMEIsRUFBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFBRTtRQUMvQyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLGlDQUFpQixDQUFDLENBQUM7UUFDdEQsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUNqQixTQUFTLENBQUMsT0FBTyxDQUFDLHVHQUF1RyxXQUFXLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1SixTQUFTLENBQUMsT0FBTyxDQUFDLGlFQUFpRSxXQUFXLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2SCxDQUFDO0lBQ0YsQ0FBQyxDQUFDLENBQUMifQ==