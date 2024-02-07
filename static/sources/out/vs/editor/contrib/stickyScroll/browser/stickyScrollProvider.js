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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/services/languageFeatures", "vs/base/common/cancellation", "vs/base/common/async", "vs/base/common/arrays", "vs/base/common/event", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/stickyScroll/browser/stickyScrollModelProvider"], function (require, exports, lifecycle_1, languageFeatures_1, cancellation_1, async_1, arrays_1, event_1, languageConfigurationRegistry_1, stickyScrollModelProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StickyLineCandidateProvider = exports.StickyLineCandidate = void 0;
    class StickyLineCandidate {
        constructor(startLineNumber, endLineNumber, nestingDepth) {
            this.startLineNumber = startLineNumber;
            this.endLineNumber = endLineNumber;
            this.nestingDepth = nestingDepth;
        }
    }
    exports.StickyLineCandidate = StickyLineCandidate;
    let StickyLineCandidateProvider = class StickyLineCandidateProvider extends lifecycle_1.Disposable {
        static { this.ID = 'store.contrib.stickyScrollController'; }
        constructor(editor, _languageFeaturesService, _languageConfigurationService) {
            super();
            this._languageFeaturesService = _languageFeaturesService;
            this._languageConfigurationService = _languageConfigurationService;
            this._onDidChangeStickyScroll = this._register(new event_1.Emitter());
            this.onDidChangeStickyScroll = this._onDidChangeStickyScroll.event;
            this._options = null;
            this._model = null;
            this._cts = null;
            this._stickyModelProvider = null;
            this._editor = editor;
            this._sessionStore = this._register(new lifecycle_1.DisposableStore());
            this._updateSoon = this._register(new async_1.RunOnceScheduler(() => this.update(), 50));
            this._register(this._editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(114 /* EditorOption.stickyScroll */)) {
                    this.readConfiguration();
                }
            }));
            this.readConfiguration();
        }
        readConfiguration() {
            this._stickyModelProvider = null;
            this._sessionStore.clear();
            this._options = this._editor.getOption(114 /* EditorOption.stickyScroll */);
            if (!this._options.enabled) {
                return;
            }
            this._stickyModelProvider = this._sessionStore.add(new stickyScrollModelProvider_1.StickyModelProvider(this._editor, this._languageConfigurationService, this._languageFeaturesService, this._options.defaultModel));
            this._sessionStore.add(this._editor.onDidChangeModel(() => {
                // We should not show an old model for a different file, it will always be wrong.
                // So we clear the model here immediately and then trigger an update.
                this._model = null;
                this._onDidChangeStickyScroll.fire();
                this.update();
            }));
            this._sessionStore.add(this._editor.onDidChangeHiddenAreas(() => this.update()));
            this._sessionStore.add(this._editor.onDidChangeModelContent(() => this._updateSoon.schedule()));
            this._sessionStore.add(this._languageFeaturesService.documentSymbolProvider.onDidChange(() => this.update()));
            this.update();
        }
        getVersionId() {
            return this._model?.version;
        }
        async update() {
            this._cts?.dispose(true);
            this._cts = new cancellation_1.CancellationTokenSource();
            await this.updateStickyModel(this._cts.token);
            this._onDidChangeStickyScroll.fire();
        }
        async updateStickyModel(token) {
            if (!this._editor.hasModel() || !this._stickyModelProvider || this._editor.getModel().isTooLargeForTokenization()) {
                this._model = null;
                return;
            }
            const textModel = this._editor.getModel();
            const modelVersionId = textModel.getVersionId();
            const model = await this._stickyModelProvider.update(textModel, modelVersionId, token);
            if (token.isCancellationRequested) {
                // the computation was canceled, so do not overwrite the model
                return;
            }
            this._model = model;
        }
        updateIndex(index) {
            if (index === -1) {
                index = 0;
            }
            else if (index < 0) {
                index = -index - 2;
            }
            return index;
        }
        getCandidateStickyLinesIntersectingFromStickyModel(range, outlineModel, result, depth, lastStartLineNumber) {
            if (outlineModel.children.length === 0) {
                return;
            }
            let lastLine = lastStartLineNumber;
            const childrenStartLines = [];
            for (let i = 0; i < outlineModel.children.length; i++) {
                const child = outlineModel.children[i];
                if (child.range) {
                    childrenStartLines.push(child.range.startLineNumber);
                }
            }
            const lowerBound = this.updateIndex((0, arrays_1.binarySearch)(childrenStartLines, range.startLineNumber, (a, b) => { return a - b; }));
            const upperBound = this.updateIndex((0, arrays_1.binarySearch)(childrenStartLines, range.startLineNumber + depth, (a, b) => { return a - b; }));
            for (let i = lowerBound; i <= upperBound; i++) {
                const child = outlineModel.children[i];
                if (!child) {
                    return;
                }
                if (child.range) {
                    const childStartLine = child.range.startLineNumber;
                    const childEndLine = child.range.endLineNumber;
                    if (range.startLineNumber <= childEndLine + 1 && childStartLine - 1 <= range.endLineNumber && childStartLine !== lastLine) {
                        lastLine = childStartLine;
                        result.push(new StickyLineCandidate(childStartLine, childEndLine - 1, depth + 1));
                        this.getCandidateStickyLinesIntersectingFromStickyModel(range, child, result, depth + 1, childStartLine);
                    }
                }
                else {
                    this.getCandidateStickyLinesIntersectingFromStickyModel(range, child, result, depth, lastStartLineNumber);
                }
            }
        }
        getCandidateStickyLinesIntersecting(range) {
            if (!this._model?.element) {
                return [];
            }
            let stickyLineCandidates = [];
            this.getCandidateStickyLinesIntersectingFromStickyModel(range, this._model.element, stickyLineCandidates, 0, -1);
            const hiddenRanges = this._editor._getViewModel()?.getHiddenAreas();
            if (hiddenRanges) {
                for (const hiddenRange of hiddenRanges) {
                    stickyLineCandidates = stickyLineCandidates.filter(stickyLine => !(stickyLine.startLineNumber >= hiddenRange.startLineNumber && stickyLine.endLineNumber <= hiddenRange.endLineNumber + 1));
                }
            }
            return stickyLineCandidates;
        }
    };
    exports.StickyLineCandidateProvider = StickyLineCandidateProvider;
    exports.StickyLineCandidateProvider = StickyLineCandidateProvider = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], StickyLineCandidateProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5U2Nyb2xsUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3N0aWNreVNjcm9sbC9icm93c2VyL3N0aWNreVNjcm9sbFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWVoRyxNQUFhLG1CQUFtQjtRQUMvQixZQUNpQixlQUF1QixFQUN2QixhQUFxQixFQUNyQixZQUFvQjtZQUZwQixvQkFBZSxHQUFmLGVBQWUsQ0FBUTtZQUN2QixrQkFBYSxHQUFiLGFBQWEsQ0FBUTtZQUNyQixpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUNqQyxDQUFDO0tBQ0w7SUFORCxrREFNQztJQVlNLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTRCLFNBQVEsc0JBQVU7aUJBRTFDLE9BQUUsR0FBRyxzQ0FBc0MsQUFBekMsQ0FBMEM7UUFjNUQsWUFDQyxNQUFtQixFQUNPLHdCQUFtRSxFQUM5RCw2QkFBNkU7WUFFNUcsS0FBSyxFQUFFLENBQUM7WUFIbUMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQUM3QyxrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQStCO1lBZjVGLDZCQUF3QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ2hFLDRCQUF1QixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUM7WUFNdEUsYUFBUSxHQUEwRCxJQUFJLENBQUM7WUFDdkUsV0FBTSxHQUF1QixJQUFJLENBQUM7WUFDbEMsU0FBSSxHQUFtQyxJQUFJLENBQUM7WUFDNUMseUJBQW9CLEdBQWdDLElBQUksQ0FBQztZQVFoRSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FB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