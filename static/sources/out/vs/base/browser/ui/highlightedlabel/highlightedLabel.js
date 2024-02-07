/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/objects"], function (require, exports, dom, iconLabels_1, objects) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HighlightedLabel = void 0;
    /**
     * A widget which can render a label with substring highlights, often
     * originating from a filter function like the fuzzy matcher.
     */
    class HighlightedLabel {
        /**
         * Create a new {@link HighlightedLabel}.
         *
         * @param container The parent container to append to.
         */
        constructor(container, options) {
            this.text = '';
            this.title = '';
            this.highlights = [];
            this.didEverRender = false;
            this.supportIcons = options?.supportIcons ?? false;
            this.domNode = dom.append(container, dom.$('span.monaco-highlighted-label'));
        }
        /**
         * The label's DOM node.
         */
        get element() {
            return this.domNode;
        }
        /**
         * Set the label and highlights.
         *
         * @param text The label to display.
         * @param highlights The ranges to highlight.
         * @param title An optional title for the hover tooltip.
         * @param escapeNewLines Whether to escape new lines.
         * @returns
         */
        set(text, highlights = [], title = '', escapeNewLines) {
            if (!text) {
                text = '';
            }
            if (escapeNewLines) {
                // adjusts highlights inplace
                text = HighlightedLabel.escapeNewLines(text, highlights);
            }
            if (this.didEverRender && this.text === text && this.title === title && objects.equals(this.highlights, highlights)) {
                return;
            }
            this.text = text;
            this.title = title;
            this.highlights = highlights;
            this.render();
        }
        render() {
            const children = [];
            let pos = 0;
            for (const highlight of this.highlights) {
                if (highlight.end === highlight.start) {
                    continue;
                }
                if (pos < highlight.start) {
                    const substring = this.text.substring(pos, highlight.start);
                    if (this.supportIcons) {
                        children.push(...(0, iconLabels_1.renderLabelWithIcons)(substring));
                    }
                    else {
                        children.push(substring);
                    }
                    pos = highlight.start;
                }
                const substring = this.text.substring(pos, highlight.end);
                const element = dom.$('span.highlight', undefined, ...this.supportIcons ? (0, iconLabels_1.renderLabelWithIcons)(substring) : [substring]);
                if (highlight.extraClasses) {
                    element.classList.add(...highlight.extraClasses);
                }
                children.push(element);
                pos = highlight.end;
            }
            if (pos < this.text.length) {
                const substring = this.text.substring(pos);
                if (this.supportIcons) {
                    children.push(...(0, iconLabels_1.renderLabelWithIcons)(substring));
                }
                else {
                    children.push(substring);
                }
            }
            dom.reset(this.domNode, ...children);
            if (this.title) {
                this.domNode.title = this.title;
            }
            else {
                this.domNode.removeAttribute('title');
            }
            this.didEverRender = true;
        }
        static escapeNewLines(text, highlights) {
            let total = 0;
            let extra = 0;
            return text.replace(/\r\n|\r|\n/g, (match, offset) => {
                extra = match === '\r\n' ? -1 : 0;
                offset += total;
                for (const highlight of highlights) {
                    if (highlight.end <= offset) {
                        continue;
                    }
                    if (highlight.start >= offset) {
                        highlight.start += extra;
                    }
                    if (highlight.end >= offset) {
                        highlight.end += extra;
                    }
                }
                total += extra;
                return '\u23CE';
            });
        }
    }
    exports.HighlightedLabel = HighlightedLabel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlnaGxpZ2h0ZWRMYWJlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2hpZ2hsaWdodGVkbGFiZWwvaGlnaGxpZ2h0ZWRMYWJlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1QmhHOzs7T0FHRztJQUNILE1BQWEsZ0JBQWdCO1FBUzVCOzs7O1dBSUc7UUFDSCxZQUFZLFNBQXNCLEVBQUUsT0FBa0M7WUFYOUQsU0FBSSxHQUFXLEVBQUUsQ0FBQztZQUNsQixVQUFLLEdBQVcsRUFBRSxDQUFDO1lBQ25CLGVBQVUsR0FBMEIsRUFBRSxDQUFDO1lBRXZDLGtCQUFhLEdBQVksS0FBSyxDQUFDO1lBUXRDLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxFQUFFLFlBQVksSUFBSSxLQUFLLENBQUM7WUFDbkQsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckIsQ0FBQztRQUVEOzs7Ozs7OztXQVFHO1FBQ0gsR0FBRyxDQUFDLElBQXdCLEVBQUUsYUFBb0MsRUFBRSxFQUFFLFFBQWdCLEVBQUUsRUFBRSxjQUF3QjtZQUNqSCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1gsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFFRCxJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUNwQiw2QkFBNkI7Z0JBQzdCLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzFELENBQUM7WUFFRCxJQUFJLElBQUksQ0FB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