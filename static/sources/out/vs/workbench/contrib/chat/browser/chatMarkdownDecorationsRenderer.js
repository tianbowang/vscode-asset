/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/htmlContent", "vs/base/common/marshalling", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/workbench/contrib/chat/common/chatParserTypes"], function (require, exports, dom, htmlContent_1, marshalling_1, resources_1, uri_1, keybinding_1, label_1, chatParserTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.annotateSpecialMarkdownContent = exports.extractVulnerabilitiesFromText = exports.walkTreeAndAnnotateReferenceLinks = exports.convertParsedRequestToMarkdown = void 0;
    const variableRefUrl = 'http://_vscodedecoration_';
    function convertParsedRequestToMarkdown(accessor, parsedRequest) {
        let result = '';
        for (const part of parsedRequest.parts) {
            if (part instanceof chatParserTypes_1.ChatRequestTextPart) {
                result += part.text;
            }
            else {
                const labelService = accessor.get(label_1.ILabelService);
                const uri = part instanceof chatParserTypes_1.ChatRequestDynamicVariablePart && part.data.map(d => d.value).find((d) => d instanceof uri_1.URI)
                    || undefined;
                const title = uri ? labelService.getUriLabel(uri, { relative: true }) : '';
                result += `[${part.text}](${variableRefUrl}${title})`;
            }
        }
        return result;
    }
    exports.convertParsedRequestToMarkdown = convertParsedRequestToMarkdown;
    function walkTreeAndAnnotateReferenceLinks(accessor, element) {
        const keybindingService = accessor.get(keybinding_1.IKeybindingService);
        element.querySelectorAll('a').forEach(a => {
            const href = a.getAttribute('data-href');
            if (href) {
                if (href.startsWith(variableRefUrl)) {
                    const title = href.slice(variableRefUrl.length);
                    a.parentElement.replaceChild(renderResourceWidget(a.textContent, title), a);
                }
                else if (href.startsWith(contentRefUrl)) {
                    renderFileWidget(href, a);
                }
                else if (href.startsWith('command:')) {
                    injectKeybindingHint(a, href, keybindingService);
                }
            }
        });
    }
    exports.walkTreeAndAnnotateReferenceLinks = walkTreeAndAnnotateReferenceLinks;
    function injectKeybindingHint(a, href, keybindingService) {
        const command = href.match(/command:([^\)]+)/)?.[1];
        if (command) {
            const kb = keybindingService.lookupKeybinding(command);
            if (kb) {
                const keybinding = kb.getLabel();
                if (keybinding) {
                    a.textContent = `${a.textContent} (${keybinding})`;
                }
            }
        }
    }
    function renderResourceWidget(name, title) {
        const container = dom.$('span.chat-resource-widget');
        const alias = dom.$('span', undefined, name);
        alias.title = title;
        container.appendChild(alias);
        return container;
    }
    function renderFileWidget(href, a) {
        // TODO this can be a nicer FileLabel widget with an icon. Do a simple link for now.
        const fullUri = uri_1.URI.parse(href);
        const location = (0, marshalling_1.revive)(JSON.parse(fullUri.fragment));
        const fragment = location.range ? `${location.range.startLineNumber}-${location.range.endLineNumber}` : '';
        a.setAttribute('data-href', location.uri.with({ fragment }).toString());
    }
    function extractVulnerabilitiesFromText(text) {
        const vulnerabilities = [];
        let newText = text;
        let match;
        while ((match = /<vscode_annotation details="(.*?)">(.*?)<\/vscode_annotation>/ms.exec(newText)) !== null) {
            const [full, details, content] = match;
            const start = match.index;
            const textBefore = newText.substring(0, start);
            const linesBefore = textBefore.split('\n').length - 1;
            const linesInside = content.split('\n').length - 1;
            const previousNewlineIdx = textBefore.lastIndexOf('\n');
            const startColumn = start - (previousNewlineIdx + 1) + 1;
            const endPreviousNewlineIdx = (textBefore + content).lastIndexOf('\n');
            const endColumn = start + content.length - (endPreviousNewlineIdx + 1) + 1;
            try {
                const vulnDetails = JSON.parse(decodeURIComponent(details));
                vulnDetails.forEach(({ title, description }) => vulnerabilities.push({
                    title, description, range: { startLineNumber: linesBefore + 1, startColumn, endLineNumber: linesBefore + linesInside + 1, endColumn }
                }));
            }
            catch (err) {
                // Something went wrong with encoding this text, just ignore it
            }
            newText = newText.substring(0, start) + content + newText.substring(start + full.length);
        }
        return { newText, vulnerabilities };
    }
    exports.extractVulnerabilitiesFromText = extractVulnerabilitiesFromText;
    const contentRefUrl = 'http://_vscodecontentref_'; // must be lowercase for URI
    function annotateSpecialMarkdownContent(response) {
        const result = [];
        for (const item of response) {
            const previousItem = result[result.length - 1];
            if (item.kind === 'inlineReference') {
                const location = 'uri' in item.inlineReference ? item.inlineReference : { uri: item.inlineReference };
                const printUri = uri_1.URI.parse(contentRefUrl).with({ fragment: JSON.stringify(location) });
                const markdownText = `[${item.name || (0, resources_1.basename)(location.uri)}](${printUri.toString()})`;
                if (previousItem?.kind === 'markdownContent') {
                    result[result.length - 1] = { content: new htmlContent_1.MarkdownString(previousItem.content.value + markdownText, { isTrusted: previousItem.content.isTrusted }), kind: 'markdownContent' };
                }
                else {
                    result.push({ content: new htmlContent_1.MarkdownString(markdownText), kind: 'markdownContent' });
                }
            }
            else if (item.kind === 'markdownContent' && previousItem?.kind === 'markdownContent') {
                result[result.length - 1] = { content: new htmlContent_1.MarkdownString(previousItem.content.value + item.content.value, { isTrusted: previousItem.content.isTrusted }), kind: 'markdownContent' };
            }
            else if (item.kind === 'markdownVuln') {
                const vulnText = encodeURIComponent(JSON.stringify(item.vulnerabilities));
                const markdownText = `<vscode_annotation details="${vulnText}">${item.content.value}</vscode_annotation>`;
                if (previousItem?.kind === 'markdownContent') {
                    result[result.length - 1] = { content: new htmlContent_1.MarkdownString(previousItem.content.value + markdownText, { isTrusted: previousItem.content.isTrusted }), kind: 'markdownContent' };
                }
                else {
                    result.push({ content: new htmlContent_1.MarkdownString(markdownText), kind: 'markdownContent' });
                }
            }
            else {
                result.push(item);
            }
        }
        return result;
    }
    exports.annotateSpecialMarkdownContent = annotateSpecialMarkdownContent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdE1hcmtkb3duRGVjb3JhdGlvbnNSZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NoYXRNYXJrZG93bkRlY29yYXRpb25zUmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JoRyxNQUFNLGNBQWMsR0FBRywyQkFBMkIsQ0FBQztJQUVuRCxTQUFnQiw4QkFBOEIsQ0FBQyxRQUEwQixFQUFFLGFBQWlDO1FBQzNHLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixLQUFLLE1BQU0sSUFBSSxJQUFJLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN4QyxJQUFJLElBQUksWUFBWSxxQ0FBbUIsRUFBRSxDQUFDO2dCQUN6QyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztZQUNyQixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7Z0JBQ2pELE1BQU0sR0FBRyxHQUFHLElBQUksWUFBWSxnREFBOEIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQVksRUFBRSxDQUFDLENBQUMsWUFBWSxTQUFHLENBQUM7dUJBQzdILFNBQVMsQ0FBQztnQkFDZCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFFM0UsTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLElB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