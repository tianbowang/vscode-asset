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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/common/color", "vs/base/common/lifecycle", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService"], function (require, exports, browser, DOM, fastDomNode_1, color_1, lifecycle_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookDiffOverviewRuler = void 0;
    const MINIMUM_SLIDER_SIZE = 20;
    let NotebookDiffOverviewRuler = class NotebookDiffOverviewRuler extends themeService_1.Themable {
        constructor(notebookEditor, width, container, themeService) {
            super(themeService);
            this.notebookEditor = notebookEditor;
            this.width = width;
            this._diffElementViewModels = [];
            this._lanes = 2;
            this._insertColor = null;
            this._removeColor = null;
            this._insertColorHex = null;
            this._removeColorHex = null;
            this._disposables = this._register(new lifecycle_1.DisposableStore());
            this._renderAnimationFrame = null;
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('canvas'));
            this._domNode.setPosition('relative');
            this._domNode.setLayerHinting(true);
            this._domNode.setContain('strict');
            container.appendChild(this._domNode.domNode);
            this._overviewViewportDomElement = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._overviewViewportDomElement.setClassName('diffViewport');
            this._overviewViewportDomElement.setPosition('absolute');
            this._overviewViewportDomElement.setWidth(width);
            container.appendChild(this._overviewViewportDomElement.domNode);
            this._register(browser.PixelRatio.onDidChange(() => {
                this._scheduleRender();
            }));
            this._register(this.themeService.onDidColorThemeChange(e => {
                const colorChanged = this.applyColors(e);
                if (colorChanged) {
                    this._scheduleRender();
                }
            }));
            this.applyColors(this.themeService.getColorTheme());
            this._register(this.notebookEditor.onDidScroll(() => {
                this._renderOverviewViewport();
            }));
            this._register(DOM.addStandardDisposableListener(container, DOM.EventType.POINTER_DOWN, (e) => {
                this.notebookEditor.delegateVerticalScrollbarPointerDown(e);
            }));
        }
        applyColors(theme) {
            const newInsertColor = theme.getColor(colorRegistry_1.diffOverviewRulerInserted) || (theme.getColor(colorRegistry_1.diffInserted) || colorRegistry_1.defaultInsertColor).transparent(2);
            const newRemoveColor = theme.getColor(colorRegistry_1.diffOverviewRulerRemoved) || (theme.getColor(colorRegistry_1.diffRemoved) || colorRegistry_1.defaultRemoveColor).transparent(2);
            const hasChanges = !newInsertColor.equals(this._insertColor) || !newRemoveColor.equals(this._removeColor);
            this._insertColor = newInsertColor;
            this._removeColor = newRemoveColor;
            if (this._insertColor) {
                this._insertColorHex = color_1.Color.Format.CSS.formatHexA(this._insertColor);
            }
            if (this._removeColor) {
                this._removeColorHex = color_1.Color.Format.CSS.formatHexA(this._removeColor);
            }
            return hasChanges;
        }
        layout() {
            this._layoutNow();
        }
        updateViewModels(elements, eventDispatcher) {
            this._disposables.clear();
            this._diffElementViewModels = elements;
            if (eventDispatcher) {
                this._disposables.add(eventDispatcher.onDidChangeLayout(() => {
                    this._scheduleRender();
                }));
                this._disposables.add(eventDispatcher.onDidChangeCellLayout(() => {
                    this._scheduleRender();
                }));
            }
            this._scheduleRender();
        }
        _scheduleRender() {
            if (this._renderAnimationFrame === null) {
                this._renderAnimationFrame = DOM.runAtThisOrScheduleAtNextAnimationFrame(DOM.getWindow(this._domNode.domNode), this._onRenderScheduled.bind(this), 16);
            }
        }
        _onRenderScheduled() {
            this._renderAnimationFrame = null;
            this._layoutNow();
        }
        _layoutNow() {
            const layoutInfo = this.notebookEditor.getLayoutInfo();
            const height = layoutInfo.height;
            const contentHeight = this._diffElementViewModels.map(view => view.layoutInfo.totalHeight).reduce((a, b) => a + b, 0);
            const ratio = browser.PixelRatio.value;
            this._domNode.setWidth(this.width);
            this._domNode.setHeight(height);
            this._domNode.domNode.width = this.width * ratio;
            this._domNode.domNode.height = height * ratio;
            const ctx = this._domNode.domNode.getContext('2d');
            ctx.clearRect(0, 0, this.width * ratio, height * ratio);
            this._renderCanvas(ctx, this.width * ratio, height * ratio, contentHeight * ratio, ratio);
            this._renderOverviewViewport();
        }
        _renderOverviewViewport() {
            const layout = this._computeOverviewViewport();
            if (!layout) {
                this._overviewViewportDomElement.setTop(0);
                this._overviewViewportDomElement.setHeight(0);
            }
            else {
                this._overviewViewportDomElement.setTop(layout.top);
                this._overviewViewportDomElement.setHeight(layout.height);
            }
        }
        _computeOverviewViewport() {
            const layoutInfo = this.notebookEditor.getLayoutInfo();
            if (!layoutInfo) {
                return null;
            }
            const scrollTop = this.notebookEditor.getScrollTop();
            const scrollHeight = this.notebookEditor.getScrollHeight();
            const computedAvailableSize = Math.max(0, layoutInfo.height);
            const computedRepresentableSize = Math.max(0, computedAvailableSize - 2 * 0);
            const visibleSize = layoutInfo.height;
            const computedSliderSize = Math.round(Math.max(MINIMUM_SLIDER_SIZE, Math.floor(visibleSize * computedRepresentableSize / scrollHeight)));
            const computedSliderRatio = (computedRepresentableSize - computedSliderSize) / (scrollHeight - visibleSize);
            const computedSliderPosition = Math.round(scrollTop * computedSliderRatio);
            return {
                height: computedSliderSize,
                top: computedSliderPosition
            };
        }
        _renderCanvas(ctx, width, height, scrollHeight, ratio) {
            if (!this._insertColorHex || !this._removeColorHex) {
                // no op when colors are not yet known
                return;
            }
            const laneWidth = width / this._lanes;
            let currentFrom = 0;
            for (let i = 0; i < this._diffElementViewModels.length; i++) {
                const element = this._diffElementViewModels[i];
                const cellHeight = Math.round((element.layoutInfo.totalHeight / scrollHeight) * ratio * height);
                switch (element.type) {
                    case 'insert':
                        ctx.fillStyle = this._insertColorHex;
                        ctx.fillRect(laneWidth, currentFrom, laneWidth, cellHeight);
                        break;
                    case 'delete':
                        ctx.fillStyle = this._removeColorHex;
                        ctx.fillRect(0, currentFrom, laneWidth, cellHeight);
                        break;
                    case 'unchanged':
                        break;
                    case 'modified':
                        ctx.fillStyle = this._removeColorHex;
                        ctx.fillRect(0, currentFrom, laneWidth, cellHeight);
                        ctx.fillStyle = this._insertColorHex;
                        ctx.fillRect(laneWidth, currentFrom, laneWidth, cellHeight);
                        break;
                }
                currentFrom += cellHeight;
            }
        }
        dispose() {
            if (this._renderAnimationFrame !== null) {
                this._renderAnimationFrame.dispose();
                this._renderAnimationFrame = null;
            }
            super.dispose();
        }
    };
    exports.NotebookDiffOverviewRuler = NotebookDiffOverviewRuler;
    exports.NotebookDiffOverviewRuler = NotebookDiffOverviewRuler = __decorate([
        __param(3, themeService_1.IThemeService)
    ], NotebookDiffOverviewRuler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tEaWZmT3ZlcnZpZXdSdWxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9kaWZmL25vdGVib29rRGlmZk92ZXJ2aWV3UnVsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYWhHLE1BQU0sbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0lBRXhCLElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQTBCLFNBQVEsdUJBQVE7UUFldEQsWUFBcUIsY0FBdUMsRUFBVyxLQUFhLEVBQUUsU0FBc0IsRUFBaUIsWUFBMkI7WUFDdkosS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBREEsbUJBQWMsR0FBZCxjQUFjLENBQXlCO1lBQVcsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQVg1RSwyQkFBc0IsR0FBK0IsRUFBRSxDQUFDO1lBQ3hELFdBQU0sR0FBRyxDQUFDLENBQUM7WUFZbEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDNUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDNUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUEsK0JBQWlCLEVBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFD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