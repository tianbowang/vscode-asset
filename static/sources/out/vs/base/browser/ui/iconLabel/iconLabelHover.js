/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/htmlContent", "vs/base/common/iconLabels", "vs/base/common/lifecycle", "vs/base/common/types", "vs/nls"], function (require, exports, dom, async_1, cancellation_1, htmlContent_1, iconLabels_1, lifecycle_1, types_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setupCustomHover = exports.setupNativeHover = void 0;
    function setupNativeHover(htmlElement, tooltip) {
        if ((0, types_1.isString)(tooltip)) {
            // Icons don't render in the native hover so we strip them out
            htmlElement.title = (0, iconLabels_1.stripIcons)(tooltip);
        }
        else if (tooltip?.markdownNotSupportedFallback) {
            htmlElement.title = tooltip.markdownNotSupportedFallback;
        }
        else {
            htmlElement.removeAttribute('title');
        }
    }
    exports.setupNativeHover = setupNativeHover;
    class UpdatableHoverWidget {
        constructor(hoverDelegate, target, fadeInAnimation) {
            this.hoverDelegate = hoverDelegate;
            this.target = target;
            this.fadeInAnimation = fadeInAnimation;
        }
        async update(content, focus, options) {
            if (this._cancellationTokenSource) {
                // there's an computation ongoing, cancel it
                this._cancellationTokenSource.dispose(true);
                this._cancellationTokenSource = undefined;
            }
            if (this.isDisposed) {
                return;
            }
            let resolvedContent;
            if (content === undefined || (0, types_1.isString)(content) || content instanceof HTMLElement) {
                resolvedContent = content;
            }
            else if (!(0, types_1.isFunction)(content.markdown)) {
                resolvedContent = content.markdown ?? content.markdownNotSupportedFallback;
            }
            else {
                // compute the content, potentially long-running
                // show 'Loading' if no hover is up yet
                if (!this._hoverWidget) {
                    this.show((0, nls_1.localize)('iconLabel.loading', "Loading..."), focus);
                }
                // compute the content
                this._cancellationTokenSource = new cancellation_1.CancellationTokenSource();
                const token = this._cancellationTokenSource.token;
                resolvedContent = await content.markdown(token);
                if (resolvedContent === undefined) {
                    resolvedContent = content.markdownNotSupportedFallback;
                }
                if (this.isDisposed || token.isCancellationRequested) {
                    // either the widget has been closed in the meantime
                    // or there has been a new call to `update`
                    return;
                }
            }
            this.show(resolvedContent, focus, options);
        }
        show(content, focus, options) {
            const oldHoverWidget = this._hoverWidget;
            if (this.hasContent(content)) {
                const hoverOptions = {
                    content,
                    target: this.target,
                    appearance: {
                        showPointer: this.hoverDelegate.placement === 'element',
                        skipFadeInAnimation: !this.fadeInAnimation || !!oldHoverWidget, // do not fade in if the hover is already showing
                    },
                    position: {
                        hoverPosition: 2 /* HoverPosition.BELOW */,
                    },
                    ...options
                };
                this._hoverWidget = this.hoverDelegate.showHover(hoverOptions, focus);
            }
            oldHoverWidget?.dispose();
        }
        hasContent(content) {
            if (!content) {
                return false;
            }
            if ((0, htmlContent_1.isMarkdownString)(content)) {
                return !!content.value;
            }
            return true;
        }
        get isDisposed() {
            return this._hoverWidget?.isDisposed;
        }
        dispose() {
            this._hoverWidget?.dispose();
            this._cancellationTokenSource?.dispose(true);
            this._cancellationTokenSource = undefined;
        }
    }
    function setupCustomHover(hoverDelegate, htmlElement, content, options) {
        let hoverPreparation;
        let hoverWidget;
        const hideHover = (disposeWidget, disposePreparation) => {
            const hadHover = hoverWidget !== undefined;
            if (disposeWidget) {
                hoverWidget?.dispose();
                hoverWidget = undefined;
            }
            if (disposePreparation) {
                hoverPreparation?.dispose();
                hoverPreparation = undefined;
            }
            if (hadHover) {
                hoverDelegate.onDidHideHover?.();
            }
        };
        const triggerShowHover = (delay, focus, target) => {
            return new async_1.TimeoutTimer(async () => {
                if (!hoverWidget || hoverWidget.isDisposed) {
                    hoverWidget = new UpdatableHoverWidget(hoverDelegate, target || htmlElement, delay > 0);
                    await hoverWidget.update(content, focus, options);
                }
            }, delay);
        };
        let isMouseDown = false;
        const mouseDownEmitter = dom.addDisposableListener(htmlElement, dom.EventType.MOUSE_DOWN, () => {
            isMouseDown = true;
            hideHover(true, true);
        }, true);
        const mouseUpEmitter = dom.addDisposableListener(htmlElement, dom.EventType.MOUSE_UP, () => {
            isMouseDown = false;
        }, true);
        const mouseLeaveEmitter = dom.addDisposableListener(htmlElement, dom.EventType.MOUSE_LEAVE, (e) => {
            isMouseDown = false;
            hideHover(false, e.fromElement === htmlElement);
        }, true);
        const onMouseOver = () => {
            if (hoverPreparation) {
                return;
            }
            const toDispose = new lifecycle_1.DisposableStore();
            const target = {
                targetElements: [htmlElement],
                dispose: () => { }
            };
            if (hoverDelegate.placement === undefined || hoverDelegate.placement === 'mouse') {
                // track the mouse position
                const onMouseMove = (e) => {
                    target.x = e.x + 10;
                    if ((e.target instanceof HTMLElement) && e.target.classList.contains('action-label')) {
                        hideHover(true, true);
                    }
                };
                toDispose.add(dom.addDisposableListener(htmlElement, dom.EventType.MOUSE_MOVE, onMouseMove, true));
            }
            toDispose.add(triggerShowHover(hoverDelegate.delay, false, target));
            hoverPreparation = toDispose;
        };
        const mouseOverDomEmitter = dom.addDisposableListener(htmlElement, dom.EventType.MOUSE_OVER, onMouseOver, true);
        const onFocus = () => {
            if (isMouseDown || hoverPreparation) {
                return;
            }
            const target = {
                targetElements: [htmlElement],
                dispose: () => { }
            };
            const toDispose = new lifecycle_1.DisposableStore();
            const onBlur = () => hideHover(true, true);
            toDispose.add(dom.addDisposableListener(htmlElement, dom.EventType.BLUR, onBlur, true));
            toDispose.add(triggerShowHover(hoverDelegate.delay, false, target));
            hoverPreparation = toDispose;
        };
        const focusDomEmitter = dom.addDisposableListener(htmlElement, dom.EventType.FOCUS, onFocus, true);
        const hover = {
            show: focus => {
                hideHover(false, true); // terminate a ongoing mouse over preparation
                triggerShowHover(0, focus); // show hover immediately
            },
            hide: () => {
                hideHover(true, true);
            },
            update: async (newContent, hoverOptions) => {
                content = newContent;
                await hoverWidget?.update(content, undefined, hoverOptions);
            },
            dispose: () => {
                mouseOverDomEmitter.dispose();
                mouseLeaveEmitter.dispose();
                mouseDownEmitter.dispose();
                mouseUpEmitter.dispose();
                focusDomEmitter.dispose();
                hideHover(true, true);
            }
        };
        return hover;
    }
    exports.setupCustomHover = setupCustomHover;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbkxhYmVsSG92ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9pY29uTGFiZWwvaWNvbkxhYmVsSG92ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxTQUFnQixnQkFBZ0IsQ0FBQyxXQUF3QixFQUFFLE9BQW9EO1FBQzlHLElBQUksSUFBQSxnQkFBUSxFQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDdkIsOERBQThEO1lBQzlELFdBQVcsQ0FBQyxLQUFLLEdBQUcsSUFBQSx1QkFBVSxFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLENBQUM7YUFBTSxJQUFJLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxDQUFDO1lBQ2xELFdBQVcsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDO1FBQzFELENBQUM7YUFBTSxDQUFDO1lBQ1AsV0FBVyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0QyxDQUFDO0lBQ0YsQ0FBQztJQVRELDRDQVNDO0lBd0NELE1BQU0sb0JBQW9CO1FBS3pCLFlBQW9CLGFBQTZCLEVBQVUsTUFBMEMsRUFBVSxlQUF3QjtZQUFuSCxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFvQztZQUFVLG9CQUFlLEdBQWYsZUFBZSxDQUFTO1FBQ3ZJLENBQUM7UUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQXNCLEVBQUUsS0FBZSxFQUFFLE9BQWdDO1lBQ3JGLElBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQ25DLDRDQUE0QztnQkFDNUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLFNBQVMsQ0FBQztZQUMzQyxD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