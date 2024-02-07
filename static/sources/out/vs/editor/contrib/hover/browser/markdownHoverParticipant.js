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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/contrib/hover/browser/getHover", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/editor/common/services/languageFeatures"], function (require, exports, dom, arrays_1, async_1, htmlContent_1, lifecycle_1, markdownRenderer_1, position_1, range_1, language_1, getHover_1, nls, configuration_1, opener_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderMarkdownHovers = exports.MarkdownHoverParticipant = exports.MarkdownHover = void 0;
    const $ = dom.$;
    class MarkdownHover {
        constructor(owner, range, contents, isBeforeContent, ordinal) {
            this.owner = owner;
            this.range = range;
            this.contents = contents;
            this.isBeforeContent = isBeforeContent;
            this.ordinal = ordinal;
        }
        isValidForHoverAnchor(anchor) {
            return (anchor.type === 1 /* HoverAnchorType.Range */
                && this.range.startColumn <= anchor.range.startColumn
                && this.range.endColumn >= anchor.range.endColumn);
        }
    }
    exports.MarkdownHover = MarkdownHover;
    let MarkdownHoverParticipant = class MarkdownHoverParticipant {
        constructor(_editor, _languageService, _openerService, _configurationService, _languageFeaturesService) {
            this._editor = _editor;
            this._languageService = _languageService;
            this._openerService = _openerService;
            this._configurationService = _configurationService;
            this._languageFeaturesService = _languageFeaturesService;
            this.hoverOrdinal = 3;
        }
        createLoadingMessage(anchor) {
            return new MarkdownHover(this, anchor.range, [new htmlContent_1.MarkdownString().appendText(nls.localize('modesContentHover.loading', "Loading..."))], false, 2000);
        }
        computeSync(anchor, lineDecorations) {
            if (!this._editor.hasModel() || anchor.type !== 1 /* HoverAnchorType.Range */) {
                return [];
            }
            const model = this._editor.getModel();
            const lineNumber = anchor.range.startLineNumber;
            const maxColumn = model.getLineMaxColumn(lineNumber);
            const result = [];
            let index = 1000;
            const lineLength = model.getLineLength(lineNumber);
            const languageId = model.getLanguageIdAtPosition(anchor.range.startLineNumber, anchor.range.startColumn);
            const stopRenderingLineAfter = this._editor.getOption(116 /* EditorOption.stopRenderingLineAfter */);
            const maxTokenizationLineLength = this._configurationService.getValue('editor.maxTokenizationLineLength', {
                overrideIdentifier: languageId
            });
            let stopRenderingMessage = false;
            if (stopRenderingLineAfter >= 0 && lineLength > stopRenderingLineAfter && anchor.range.startColumn >= stopRenderingLineAfter) {
                stopRenderingMessage = true;
                result.push(new MarkdownHover(this, anchor.range, [{
                        value: nls.localize('stopped rendering', "Rendering paused for long line for performance reasons. This can be configured via `editor.stopRenderingLineAfter`.")
                    }], false, index++));
            }
            if (!stopRenderingMessage && typeof maxTokenizationLineLength === 'number' && lineLength >= maxTokenizationLineLength) {
                result.push(new MarkdownHover(this, anchor.range, [{
                        value: nls.localize('too many characters', "Tokenization is skipped for long lines for performance reasons. This can be configured via `editor.maxTokenizationLineLength`.")
                    }], false, index++));
            }
            let isBeforeContent = false;
            for (const d of lineDecorations) {
                const startColumn = (d.range.startLineNumber === lineNumber) ? d.range.startColumn : 1;
                const endColumn = (d.range.endLineNumber === lineNumber) ? d.range.endColumn : maxColumn;
                const hoverMessage = d.options.hoverMessage;
                if (!hoverMessage || (0, htmlContent_1.isEmptyMarkdownString)(hoverMessage)) {
                    continue;
                }
                if (d.options.beforeContentClassName) {
                    isBeforeContent = true;
                }
                const range = new range_1.Range(anchor.range.startLineNumber, startColumn, anchor.range.startLineNumber, endColumn);
                result.push(new MarkdownHover(this, range, (0, arrays_1.asArray)(hoverMessage), isBeforeContent, index++));
            }
            return result;
        }
        computeAsync(anchor, lineDecorations, token) {
            if (!this._editor.hasModel() || anchor.type !== 1 /* HoverAnchorType.Range */) {
                return async_1.AsyncIterableObject.EMPTY;
            }
            const model = this._editor.getModel();
            if (!this._languageFeaturesService.hoverProvider.has(model)) {
                return async_1.AsyncIterableObject.EMPTY;
            }
            const position = new position_1.Position(anchor.range.startLineNumber, anchor.range.startColumn);
            return (0, getHover_1.getHover)(this._languageFeaturesService.hoverProvider, model, position, token)
                .filter(item => !(0, htmlContent_1.isEmptyMarkdownString)(item.hover.contents))
                .map(item => {
                const rng = item.hover.range ? range_1.Range.lift(item.hover.range) : anchor.range;
                return new MarkdownHover(this, rng, item.hover.contents, false, item.ordinal);
            });
        }
        renderHoverParts(context, hoverParts) {
            return renderMarkdownHovers(context, hoverParts, this._editor, this._languageService, this._openerService);
        }
    };
    exports.MarkdownHoverParticipant = MarkdownHoverParticipant;
    exports.MarkdownHoverParticipant = MarkdownHoverParticipant = __decorate([
        __param(1, language_1.ILanguageService),
        __param(2, opener_1.IOpenerService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, languageFeatures_1.ILanguageFeaturesService)
    ], MarkdownHoverParticipant);
    function renderMarkdownHovers(context, hoverParts, editor, languageService, openerService) {
        // Sort hover parts to keep them stable since they might come in async, out-of-order
        hoverParts.sort((a, b) => a.ordinal - b.ordinal);
        const disposables = new lifecycle_1.DisposableStore();
        for (const hoverPart of hoverParts) {
            for (const contents of hoverPart.contents) {
                if ((0, htmlContent_1.isEmptyMarkdownString)(contents)) {
                    continue;
                }
                const markdownHoverElement = $('div.hover-row.markdown-hover');
                const hoverContentsElement = dom.append(markdownHoverElement, $('div.hover-contents'));
                const renderer = disposables.add(new markdownRenderer_1.MarkdownRenderer({ editor }, languageService, openerService));
                disposables.add(renderer.onDidRenderAsync(() => {
                    hoverContentsElement.className = 'hover-contents code-hover-contents';
                    context.onContentsChanged();
                }));
                const renderedContents = disposables.add(renderer.render(contents));
                hoverContentsElement.appendChild(renderedContents.element);
                context.fragment.appendChild(markdownHoverElement);
            }
        }
        return disposables;
    }
    exports.renderMarkdownHovers = renderMarkdownHovers;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd25Ib3ZlclBhcnRpY2lwYW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9ob3Zlci9icm93c2VyL21hcmtkb3duSG92ZXJQYXJ0aWNpcGFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsTUFBYSxhQUFhO1FBRXpCLFlBQ2lCLEtBQTZDLEVBQzdDLEtBQVksRUFDWixRQUEyQixFQUMzQixlQUF3QixFQUN4QixPQUFlO1lBSmYsVUFBSyxHQUFMLEtBQUssQ0FBd0M7WUFDN0MsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUNaLGFBQVEsR0FBUixRQUFRLENBQW1CO1lBQzNCLG9CQUFlLEdBQWYsZUFBZSxDQUFTO1lBQ3hCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDNUIsQ0FBQztRQUVFLHFCQUFxQixDQUFDLE1BQW1CO1lBQy9DLE9BQU8sQ0FDTixNQUFNLENBQUMsSUFBSSxrQ0FBMEI7bUJBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVzttQkFDbEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQ2pELENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUFqQkQsc0NBaUJDO0lBRU0sSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBd0I7UUFJcEMsWUFDb0IsT0FBb0IsRUFDckIsZ0JBQW1ELEVBQ3JELGNBQStDLEVBQ3hDLHFCQUE2RCxFQUMxRCx3QkFBcUU7WUFKNUUsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUNKLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDcEMsbUJBQWMsR0FBZCxjQUFj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