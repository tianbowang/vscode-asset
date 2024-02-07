/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, errors_1, lifecycle_1, position_1, range_1, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.asCommandLink = exports.InlayHintsFragments = exports.InlayHintItem = exports.InlayHintAnchor = void 0;
    class InlayHintAnchor {
        constructor(range, direction) {
            this.range = range;
            this.direction = direction;
        }
    }
    exports.InlayHintAnchor = InlayHintAnchor;
    class InlayHintItem {
        constructor(hint, anchor, provider) {
            this.hint = hint;
            this.anchor = anchor;
            this.provider = provider;
            this._isResolved = false;
        }
        with(delta) {
            const result = new InlayHintItem(this.hint, delta.anchor, this.provider);
            result._isResolved = this._isResolved;
            result._currentResolve = this._currentResolve;
            return result;
        }
        async resolve(token) {
            if (typeof this.provider.resolveInlayHint !== 'function') {
                return;
            }
            if (this._currentResolve) {
                // wait for an active resolve operation and try again
                // when that's done.
                await this._currentResolve;
                if (token.isCancellationRequested) {
                    return;
                }
                return this.resolve(token);
            }
            if (!this._isResolved) {
                this._currentResolve = this._doResolve(token)
                    .finally(() => this._currentResolve = undefined);
            }
            await this._currentResolve;
        }
        async _doResolve(token) {
            try {
                const newHint = await Promise.resolve(this.provider.resolveInlayHint(this.hint, token));
                this.hint.tooltip = newHint?.tooltip ?? this.hint.tooltip;
                this.hint.label = newHint?.label ?? this.hint.label;
                this.hint.textEdits = newHint?.textEdits ?? this.hint.textEdits;
                this._isResolved = true;
            }
            catch (err) {
                (0, errors_1.onUnexpectedExternalError)(err);
                this._isResolved = false;
            }
        }
    }
    exports.InlayHintItem = InlayHintItem;
    class InlayHintsFragments {
        static { this._emptyInlayHintList = Object.freeze({ dispose() { }, hints: [] }); }
        static async create(registry, model, ranges, token) {
            const data = [];
            const promises = registry.ordered(model).reverse().map(provider => ranges.map(async (range) => {
                try {
                    const result = await provider.provideInlayHints(model, range, token);
                    if (result?.hints.length || provider.onDidChangeInlayHints) {
                        data.push([result ?? InlayHintsFragments._emptyInlayHintList, provider]);
                    }
                }
                catch (err) {
                    (0, errors_1.onUnexpectedExternalError)(err);
                }
            }));
            await Promise.all(promises.flat());
            if (token.isCancellationRequested || model.isDisposed()) {
                throw new errors_1.CancellationError();
            }
            return new InlayHintsFragments(ranges, data, model);
        }
        constructor(ranges, data, model) {
            this._disposables = new lifecycle_1.DisposableStore();
            this.ranges = ranges;
            this.provider = new Set();
            const items = [];
            for (const [list, provider] of data) {
                this._disposables.add(list);
                this.provider.add(provider);
                for (const hint of list.hints) {
                    // compute the range to which the item should be attached to
                    const position = model.validatePosition(hint.position);
                    let direction = 'before';
                    const wordRange = InlayHintsFragments._getRangeAtPosition(model, position);
                    let range;
                    if (wordRange.getStartPosition().isBefore(position)) {
                        range = range_1.Range.fromPositions(wordRange.getStartPosition(), position);
                        direction = 'after';
                    }
                    else {
                        range = range_1.Range.fromPositions(position, wordRange.getEndPosition());
                        direction = 'before';
                    }
                    items.push(new InlayHintItem(hint, new InlayHintAnchor(range, direction), provider));
                }
            }
            this.items = items.sort((a, b) => position_1.Position.compare(a.hint.position, b.hint.position));
        }
        dispose() {
            this._disposables.dispose();
        }
        static _getRangeAtPosition(model, position) {
            const line = position.lineNumber;
            const word = model.getWordAtPosition(position);
            if (word) {
                // always prefer the word range
                return new range_1.Range(line, word.startColumn, line, word.endColumn);
            }
            model.tokenization.tokenizeIfCheap(line);
            const tokens = model.tokenization.getLineTokens(line);
            const offset = position.column - 1;
            const idx = tokens.findTokenIndexAtOffset(offset);
            let start = tokens.getStartOffset(idx);
            let end = tokens.getEndOffset(idx);
            if (end - start === 1) {
                // single character token, when at its end try leading/trailing token instead
                if (start === offset && idx > 1) {
                    // leading token
                    start = tokens.getStartOffset(idx - 1);
                    end = tokens.getEndOffset(idx - 1);
                }
                else if (end === offset && idx < tokens.getCount() - 1) {
                    // trailing token
                    start = tokens.getStartOffset(idx + 1);
                    end = tokens.getEndOffset(idx + 1);
                }
            }
            return new range_1.Range(line, start + 1, line, end + 1);
        }
    }
    exports.InlayHintsFragments = InlayHintsFragments;
    function asCommandLink(command) {
        return uri_1.URI.from({
            scheme: network_1.Schemas.command,
            path: command.id,
            query: command.arguments && encodeURIComponent(JSON.stringify(command.arguments))
        }).toString();
    }
    exports.asCommandLink = asCommandLink;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5sYXlIaW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaW5sYXlIaW50cy9icm93c2VyL2lubGF5SGludHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQWEsZUFBZTtRQUMzQixZQUFxQixLQUFZLEVBQVcsU0FBNkI7WUFBcEQsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUFXLGNBQVMsR0FBVCxTQUFTLENBQW9CO1FBQUksQ0FBQztLQUM5RTtJQUZELDBDQUVDO0lBRUQsTUFBYSxhQUFhO1FBS3pCLFlBQXFCLElBQWUsRUFBVyxNQUF1QixFQUFXLFFBQTRCO1lBQXhGLFNBQUksR0FBSixJQUFJLENBQVc7WUFBVyxXQUFNLEdBQU4sTUFBTSxDQUFpQjtZQUFXLGFBQVEsR0FBUixRQUFRLENBQW9CO1lBSHJHLGdCQUFXLEdBQVksS0FBSyxDQUFDO1FBRzRFLENBQUM7UUFFbEgsSUFBSSxDQUFDLEtBQWtDO1lBQ3RDLE1BQU0sTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekUsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUM5QyxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQXdCO1lBQ3JDLElBQUksT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixLQUFLLFVBQVUsRUFBRSxDQUFDO2dCQUMxRCxPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUMxQixxREFB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