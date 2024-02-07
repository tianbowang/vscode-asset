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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/fastDomNode", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/notebookBrowser"], function (require, exports, browser, fastDomNode_1, themeService_1, notebookBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookOverviewRuler = void 0;
    let NotebookOverviewRuler = class NotebookOverviewRuler extends themeService_1.Themable {
        constructor(notebookEditor, container, themeService) {
            super(themeService);
            this.notebookEditor = notebookEditor;
            this._lanes = 3;
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('canvas'));
            this._domNode.setPosition('relative');
            this._domNode.setLayerHinting(true);
            this._domNode.setContain('strict');
            container.appendChild(this._domNode.domNode);
            this._register(notebookEditor.onDidChangeDecorations(() => {
                this.layout();
            }));
            this._register(browser.PixelRatio.onDidChange(() => {
                this.layout();
            }));
        }
        layout() {
            const width = 10;
            const layoutInfo = this.notebookEditor.getLayoutInfo();
            const scrollHeight = layoutInfo.scrollHeight;
            const height = layoutInfo.height;
            const ratio = browser.PixelRatio.value;
            this._domNode.setWidth(width);
            this._domNode.setHeight(height);
            this._domNode.domNode.width = width * ratio;
            this._domNode.domNode.height = height * ratio;
            const ctx = this._domNode.domNode.getContext('2d');
            ctx.clearRect(0, 0, width * ratio, height * ratio);
            this._render(ctx, width * ratio, height * ratio, scrollHeight * ratio, ratio);
        }
        _render(ctx, width, height, scrollHeight, ratio) {
            const viewModel = this.notebookEditor.getViewModel();
            const fontInfo = this.notebookEditor.getLayoutInfo().fontInfo;
            const laneWidth = width / this._lanes;
            let currentFrom = 0;
            if (viewModel) {
                for (let i = 0; i < viewModel.viewCells.length; i++) {
                    const viewCell = viewModel.viewCells[i];
                    const textBuffer = viewCell.textBuffer;
                    const decorations = viewCell.getCellDecorations();
                    const cellHeight = (viewCell.layoutInfo.totalHeight / scrollHeight) * ratio * height;
                    decorations.filter(decoration => decoration.overviewRuler).forEach(decoration => {
                        const overviewRuler = decoration.overviewRuler;
                        const fillStyle = this.getColor(overviewRuler.color) ?? '#000000';
                        const lineHeight = Math.min(fontInfo.lineHeight, (viewCell.layoutInfo.editorHeight / scrollHeight / textBuffer.getLineCount()) * ratio * height);
                        const lineNumbers = overviewRuler.modelRanges.map(range => range.startLineNumber).reduce((previous, current) => {
                            if (previous.length === 0) {
                                previous.push(current);
                            }
                            else {
                                const last = previous[previous.length - 1];
                                if (last !== current) {
                                    previous.push(current);
                                }
                            }
                            return previous;
                        }, []);
                        let x = 0;
                        switch (overviewRuler.position) {
                            case notebookBrowser_1.NotebookOverviewRulerLane.Left:
                                x = 0;
                                break;
                            case notebookBrowser_1.NotebookOverviewRulerLane.Center:
                                x = laneWidth;
                                break;
                            case notebookBrowser_1.NotebookOverviewRulerLane.Right:
                                x = laneWidth * 2;
                                break;
                            default:
                                break;
                        }
                        const width = overviewRuler.position === notebookBrowser_1.NotebookOverviewRulerLane.Full ? laneWidth * 3 : laneWidth;
                        for (let i = 0; i < lineNumbers.length; i++) {
                            ctx.fillStyle = fillStyle;
                            const lineNumber = lineNumbers[i];
                            const offset = (lineNumber - 1) * lineHeight;
                            ctx.fillRect(x, currentFrom + offset, width, lineHeight);
                        }
                        if (overviewRuler.includeOutput) {
                            ctx.fillStyle = fillStyle;
                            const outputOffset = (viewCell.layoutInfo.editorHeight / scrollHeight) * ratio * height;
                            const decorationHeight = (fontInfo.lineHeight / scrollHeight) * ratio * height;
                            ctx.fillRect(laneWidth, currentFrom + outputOffset, laneWidth, decorationHeight);
                        }
                    });
                    currentFrom += cellHeight;
                }
            }
        }
    };
    exports.NotebookOverviewRuler = NotebookOverviewRuler;
    exports.NotebookOverviewRuler = NotebookOverviewRuler = __decorate([
        __param(2, themeService_1.IThemeService)
    ], NotebookOverviewRuler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tPdmVydmlld1J1bGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXdQYXJ0cy9ub3RlYm9va092ZXJ2aWV3UnVsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBT3pGLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsdUJBQVE7UUFJbEQsWUFBcUIsY0FBdUMsRUFBRSxTQUFzQixFQUFpQixZQUEyQjtZQUMvSCxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFEQSxtQkFBYyxHQUFkLGNBQWMsQ0FBeUI7WUFGcEQsV0FBTSxHQUFHLENBQUMsQ0FBQztZQUlsQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUEsK0JBQWlCLEVBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRW5DLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU3QyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3pELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtnQkFDbEQsSUFB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