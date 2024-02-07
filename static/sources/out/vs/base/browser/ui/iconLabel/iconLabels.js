/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/themables"], function (require, exports, dom, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderIcon = exports.renderLabelWithIcons = void 0;
    const labelWithIconsRegex = new RegExp(`(\\\\)?\\$\\((${themables_1.ThemeIcon.iconNameExpression}(?:${themables_1.ThemeIcon.iconModifierExpression})?)\\)`, 'g');
    function renderLabelWithIcons(text) {
        const elements = new Array();
        let match;
        let textStart = 0, textStop = 0;
        while ((match = labelWithIconsRegex.exec(text)) !== null) {
            textStop = match.index || 0;
            if (textStart < textStop) {
                elements.push(text.substring(textStart, textStop));
            }
            textStart = (match.index || 0) + match[0].length;
            const [, escaped, codicon] = match;
            elements.push(escaped ? `$(${codicon})` : renderIcon({ id: codicon }));
        }
        if (textStart < text.length) {
            elements.push(text.substring(textStart));
        }
        return elements;
    }
    exports.renderLabelWithIcons = renderLabelWithIcons;
    function renderIcon(icon) {
        const node = dom.$(`span`);
        node.classList.add(...themables_1.ThemeIcon.asClassNameArray(icon));
        return node;
    }
    exports.renderIcon = renderIcon;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbkxhYmVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2ljb25MYWJlbC9pY29uTGFiZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxNQUFNLG1CQUFtQixHQUFHLElBQUksTUFBTSxDQUFDLGlCQUFpQixxQkFBUyxDQUFDLGtCQUFrQixNQUFNLHFCQUFTLENBQUMsc0JBQXNCLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN6SSxTQUFnQixvQkFBb0IsQ0FBQyxJQUFZO1FBQ2hELE1BQU0sUUFBUSxHQUFHLElBQUksS0FBSyxFQUE0QixDQUFDO1FBQ3ZELElBQUksS0FBNkIsQ0FBQztRQUVsQyxJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUUsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNoQyxPQUFPLENBQUMsS0FBSyxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQzFELFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztZQUM1QixJQUFJLFNBQVMsR0FBRyxRQUFRLEVBQUUsQ0FBQztnQkFDMUIsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3BELENBQUM7WUFDRCxTQUFTLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFFakQsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNuQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNqQixDQUFDO0lBcEJELG9EQW9CQztJQUVELFNBQWdCLFVBQVUsQ0FBQyxJQUFlO1FBQ3pDLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxxQkFBUyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDeEQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBSkQsZ0NBSUMifQ==