/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/dompurify/dompurify", "vs/base/browser/event", "vs/base/browser/formattedTextRenderer", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/iconLabels", "vs/base/common/idGenerator", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/marked/marked", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uri"], function (require, exports, DOM, dompurify, event_1, formattedTextRenderer_1, keyboardEvent_1, mouseEvent_1, iconLabels_1, errors_1, event_2, htmlContent_1, iconLabels_2, idGenerator_1, lazy_1, lifecycle_1, marked_1, marshalling_1, network_1, objects_1, resources_1, strings_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fillInIncompleteTokens = exports.renderMarkdownAsPlaintext = exports.renderStringAsPlaintext = exports.allowedMarkdownAttr = exports.renderMarkdown = void 0;
    const defaultMarkedRenderers = Object.freeze({
        image: (href, title, text) => {
            let dimensions = [];
            let attributes = [];
            if (href) {
                ({ href, dimensions } = (0, htmlContent_1.parseHrefAndDimensions)(href));
                attributes.push(`src="${(0, htmlContent_1.escapeDoubleQuotes)(href)}"`);
            }
            if (text) {
                attributes.push(`alt="${(0, htmlContent_1.escapeDoubleQuotes)(text)}"`);
            }
            if (title) {
                attributes.push(`title="${(0, htmlContent_1.escapeDoubleQuotes)(title)}"`);
            }
            if (dimensions.length) {
                attributes = attributes.concat(dimensions);
            }
            return '<img ' + attributes.join(' ') + '>';
        },
        paragraph: (text) => {
            return `<p>${text}</p>`;
        },
        link: (href, title, text) => {
            if (typeof href !== 'string') {
                return '';
            }
            // Remove markdown escapes. Workaround for https://github.com/chjj/marked/issues/829
            if (href === text) { // raw link case
                text = (0, htmlContent_1.removeMarkdownEscapes)(text);
            }
            title = typeof title === 'string' ? (0, htmlContent_1.escapeDoubleQuotes)((0, htmlContent_1.removeMarkdownEscapes)(title)) : '';
            href = (0, htmlContent_1.removeMarkdownEscapes)(href);
            // HTML Encode href
            href = href.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
            return `<a href="${href}" title="${title || href}" draggable="false">${text}</a>`;
        },
    });
    /**
     * Low-level way create a html element from a markdown string.
     *
     * **Note** that for most cases you should be using [`MarkdownRenderer`](./src/vs/editor/contrib/markdownRenderer/browser/markdownRenderer.ts)
     * which comes with support for pretty code block rendering and which uses the default way of handling links.
     */
    function renderMarkdown(markdown, options = {}, markedOptions = {}) {
        const disposables = new lifecycle_1.DisposableStore();
        let isDisposed = false;
        const element = (0, formattedTextRenderer_1.createElement)(options);
        const _uriMassage = function (part) {
            let data;
            try {
                data = (0, marshalling_1.parse)(decodeURIComponent(part));
            }
            catch (e) {
                // ignore
            }
            if (!data) {
                return part;
            }
            data = (0, objects_1.cloneAndChange)(data, value => {
                if (markdown.uris && markdown.uris[value]) {
                    return uri_1.URI.revive(markdown.uris[value]);
                }
                else {
                    return undefined;
                }
            });
            return encodeURIComponent(JSON.stringify(data));
        };
        const _href = function (href, isDomUri) {
            const data = markdown.uris && markdown.uris[href];
            let uri = uri_1.URI.revive(data);
            if (isDomUri) {
                if (href.startsWith(network_1.Schemas.data + ':')) {
                    return href;
                }
                if (!uri) {
                    uri = uri_1.URI.parse(href);
                }
                // this URI will end up as "src"-attribute of a dom node
                // and because of that special rewriting needs to be done
                // so that the URI uses a protocol that's understood by
                // browsers (like http or https)
                return network_1.FileAccess.uriToBrowserUri(uri).toString(true);
            }
            if (!uri) {
                return href;
            }
            if (uri_1.URI.parse(href).toString() === uri.toString()) {
                return href; // no transformation performed
            }
            if (uri.query) {
                uri = uri.with({ query: _uriMassage(uri.query) });
            }
            return uri.toString();
        };
        const renderer = new marked_1.marked.Renderer();
        renderer.image = defaultMarkedRenderers.image;
        renderer.link = defaultMarkedRenderers.link;
        renderer.paragraph = defaultMarkedRenderers.paragraph;
        // Will collect [id, renderedElement] tuples
        const codeBlocks = [];
        const syncCodeBlocks = [];
        if (options.codeBlockRendererSync) {
            renderer.code = (code, lang) => {
                const id = idGenerator_1.defaultGenerator.nextId();
                const value = options.codeBlockRendererSync(postProcessCodeBlockLanguageId(lang), code);
                syncCodeBlocks.push([id, value]);
                return `<div class="code" data-code="${id}">${(0, strings_1.escape)(code)}</div>`;
            };
        }
        else if (options.codeBlockRenderer) {
            renderer.code = (code, lang) => {
                const id = idGenerator_1.defaultGenerator.nextId();
                const value = options.codeBlockRenderer(postProcessCodeBlockLanguageId(lang), code);
                codeBlocks.push(value.then(element => [id, element]));
                return `<div class="code" data-code="${id}">${(0, strings_1.escape)(code)}</div>`;
            };
        }
        if (options.actionHandler) {
            const _activateLink = function (event) {
                let target = event.target;
                if (target.tagName !== 'A') {
                    target = target.parentElement;
                    if (!target || target.tagName !== 'A') {
                        return;
                    }
                }
                try {
                    let href = target.dataset['href'];
                    if (href) {
                        if (markdown.baseUri) {
                            href = resolveWithBaseUri(uri_1.URI.from(markdown.baseUri), href);
                        }
                        options.actionHandler.callback(href, event);
                    }
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
                finally {
                    event.preventDefault();
                }
            };
            const onClick = options.actionHandler.disposables.add(new event_1.DomEmitter(element, 'click'));
            const onAuxClick = options.actionHandler.disposables.add(new event_1.DomEmitter(element, 'auxclick'));
            options.actionHandler.disposables.add(event_2.Event.any(onClick.event, onAuxClick.event)(e => {
                const mouseEvent = new mouseEvent_1.StandardMouseEvent(DOM.getWindow(element), e);
                if (!mouseEvent.leftButton && !mouseEvent.middleButton) {
                    return;
                }
                _activateLink(mouseEvent);
            }));
            options.actionHandler.disposables.add(DOM.addDisposableListener(element, 'keydown', (e) => {
                const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (!keyboardEvent.equals(10 /* KeyCode.Space */) && !keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                    return;
                }
                _activateLink(keyboardEvent);
            }));
        }
        if (!markdown.supportHtml) {
            // TODO: Can we deprecated this in favor of 'supportHtml'?
            // Use our own sanitizer so that we can let through only spans.
            // Otherwise, we'd be letting all html be rendered.
            // If we want to allow markdown permitted tags, then we can delete sanitizer and sanitize.
            // We always pass the output through dompurify after this so that we don't rely on
            // marked for sanitization.
            markedOptions.sanitizer = (html) => {
                const match = markdown.isTrusted ? html.match(/^(<span[^>]+>)|(<\/\s*span>)$/) : undefined;
                return match ? html : '';
            };
            markedOptions.sanitize = true;
            markedOptions.silent = true;
        }
        markedOptions.renderer = renderer;
        // values that are too long will freeze the UI
        let value = markdown.value ?? '';
        if (value.length > 100000) {
            value = `${value.substr(0, 100000)}…`;
        }
        // escape theme icons
        if (markdown.supportThemeIcons) {
            value = (0, iconLabels_2.markdownEscapeEscapedIcons)(value);
        }
        let renderedMarkdown;
        if (options.fillInIncompleteTokens) {
            // The defaults are applied by parse but not lexer()/parser(), and they need to be present
            const opts = {
                ...marked_1.marked.defaults,
                ...markedOptions
            };
            const tokens = marked_1.marked.lexer(value, opts);
            const newTokens = fillInIncompleteTokens(tokens);
            renderedMarkdown = marked_1.marked.parser(newTokens, opts);
        }
        else {
            renderedMarkdown = marked_1.marked.parse(value, markedOptions);
        }
        // Rewrite theme icons
        if (markdown.supportThemeIcons) {
            const elements = (0, iconLabels_1.renderLabelWithIcons)(renderedMarkdown);
            renderedMarkdown = elements.map(e => typeof e === 'string' ? e : e.outerHTML).join('');
        }
        const htmlParser = new DOMParser();
        const markdownHtmlDoc = htmlParser.parseFromString(sanitizeRenderedMarkdown(markdown, renderedMarkdown), 'text/html');
        markdownHtmlDoc.body.querySelectorAll('img')
            .forEach(img => {
            const src = img.getAttribute('src'); // Get the raw 'src' attribute value as text, not the resolved 'src'
            if (src) {
                let href = src;
                try {
                    if (markdown.baseUri) { // absolute or relative local path, or file: uri
                        href = resolveWithBaseUri(uri_1.URI.from(markdown.baseUri), href);
                    }
                }
                catch (err) { }
                img.src = _href(href, true);
            }
        });
        markdownHtmlDoc.body.querySelectorAll('a')
            .forEach(a => {
            const href = a.getAttribute('href'); // Get the raw 'href' attribute value as text, not the resolved 'href'
            a.setAttribute('href', ''); // Clear out href. We use the `data-href` for handling clicks instead
            if (!href
                || /^data:|javascript:/i.test(href)
                || (/^command:/i.test(href) && !markdown.isTrusted)
                || /^command:(\/\/\/)?_workbench\.downloadResource/i.test(href)) {
                // drop the link
                a.replaceWith(...a.childNodes);
            }
            else {
                let resolvedHref = _href(href, false);
                if (markdown.baseUri) {
                    resolvedHref = resolveWithBaseUri(uri_1.URI.from(markdown.baseUri), href);
                }
                a.dataset.href = resolvedHref;
            }
        });
        element.innerHTML = sanitizeRenderedMarkdown(markdown, markdownHtmlDoc.body.innerHTML);
        if (codeBlocks.length > 0) {
            Promise.all(codeBlocks).then((tuples) => {
                if (isDisposed) {
                    return;
                }
                const renderedElements = new Map(tuples);
                const placeholderElements = element.querySelectorAll(`div[data-code]`);
                for (const placeholderElement of placeholderElements) {
                    const renderedElement = renderedElements.get(placeholderElement.dataset['code'] ?? '');
                    if (renderedElement) {
                        DOM.reset(placeholderElement, renderedElement);
                    }
                }
                options.asyncRenderCallback?.();
            });
        }
        else if (syncCodeBlocks.length > 0) {
            const renderedElements = new Map(syncCodeBlocks);
            const placeholderElements = element.querySelectorAll(`div[data-code]`);
            for (const placeholderElement of placeholderElements) {
                const renderedElement = renderedElements.get(placeholderElement.dataset['code'] ?? '');
                if (renderedElement) {
                    DOM.reset(placeholderElement, renderedElement);
                }
            }
        }
        // signal size changes for image tags
        if (options.asyncRenderCallback) {
            for (const img of element.getElementsByTagName('img')) {
                const listener = disposables.add(DOM.addDisposableListener(img, 'load', () => {
                    listener.dispose();
                    options.asyncRenderCallback();
                }));
            }
        }
        return {
            element,
            dispose: () => {
                isDisposed = true;
                disposables.dispose();
            }
        };
    }
    exports.renderMarkdown = renderMarkdown;
    function postProcessCodeBlockLanguageId(lang) {
        if (!lang) {
            return '';
        }
        const parts = lang.split(/[\s+|:|,|\{|\?]/, 1);
        if (parts.length) {
            return parts[0];
        }
        return lang;
    }
    function resolveWithBaseUri(baseUri, href) {
        const hasScheme = /^\w[\w\d+.-]*:/.test(href);
        if (hasScheme) {
            return href;
        }
        if (baseUri.path.endsWith('/')) {
            return (0, resources_1.resolvePath)(baseUri, href).toString();
        }
        else {
            return (0, resources_1.resolvePath)((0, resources_1.dirname)(baseUri), href).toString();
        }
    }
    function sanitizeRenderedMarkdown(options, renderedMarkdown) {
        const { config, allowedSchemes } = getSanitizerOptions(options);
        dompurify.addHook('uponSanitizeAttribute', (element, e) => {
            if (e.attrName === 'style' || e.attrName === 'class') {
                if (element.tagName === 'SPAN') {
                    if (e.attrName === 'style') {
                        e.keepAttr = /^(color\:(#[0-9a-fA-F]+|var\(--vscode(-[a-zA-Z]+)+\));)?(background-color\:(#[0-9a-fA-F]+|var\(--vscode(-[a-zA-Z]+)+\));)?$/.test(e.attrValue);
                        return;
                    }
                    else if (e.attrName === 'class') {
                        e.keepAttr = /^codicon codicon-[a-z\-]+( codicon-modifier-[a-z\-]+)?$/.test(e.attrValue);
                        return;
                    }
                }
                e.keepAttr = false;
                return;
            }
            else if (element.tagName === 'INPUT' && element.attributes.getNamedItem('type')?.value === 'checkbox') {
                if ((e.attrName === 'type' && e.attrValue === 'checkbox') || e.attrName === 'disabled' || e.attrName === 'checked') {
                    e.keepAttr = true;
                    return;
                }
                e.keepAttr = false;
            }
        });
        dompurify.addHook('uponSanitizeElement', (element, e) => {
            if (e.tagName === 'input') {
                if (element.attributes.getNamedItem('type')?.value === 'checkbox') {
                    element.setAttribute('disabled', '');
                }
                else {
                    element.parentElement?.removeChild(element);
                }
            }
        });
        const hook = DOM.hookDomPurifyHrefAndSrcSanitizer(allowedSchemes);
        try {
            return dompurify.sanitize(renderedMarkdown, { ...config, RETURN_TRUSTED_TYPE: true });
        }
        finally {
            dompurify.removeHook('uponSanitizeAttribute');
            hook.dispose();
        }
    }
    exports.allowedMarkdownAttr = [
        'align',
        'autoplay',
        'alt',
        'checked',
        'class',
        'controls',
        'data-code',
        'data-href',
        'disabled',
        'draggable',
        'height',
        'href',
        'loop',
        'muted',
        'playsinline',
        'poster',
        'src',
        'style',
        'target',
        'title',
        'type',
        'width',
        'start',
    ];
    function getSanitizerOptions(options) {
        const allowedSchemes = [
            network_1.Schemas.http,
            network_1.Schemas.https,
            network_1.Schemas.mailto,
            network_1.Schemas.data,
            network_1.Schemas.file,
            network_1.Schemas.vscodeFileResource,
            network_1.Schemas.vscodeRemote,
            network_1.Schemas.vscodeRemoteResource,
        ];
        if (options.isTrusted) {
            allowedSchemes.push(network_1.Schemas.command);
        }
        return {
            config: {
                // allowedTags should included everything that markdown renders to.
                // Since we have our own sanitize function for marked, it's possible we missed some tag so let dompurify make sure.
                // HTML tags that can result from markdown are from reading https://spec.commonmark.org/0.29/
                // HTML table tags that can result from markdown are from https://github.github.com/gfm/#tables-extension-
                ALLOWED_TAGS: [...DOM.basicMarkupHtmlTags],
                ALLOWED_ATTR: exports.allowedMarkdownAttr,
                ALLOW_UNKNOWN_PROTOCOLS: true,
            },
            allowedSchemes
        };
    }
    /**
     * Strips all markdown from `string`, if it's an IMarkdownString. For example
     * `# Header` would be output as `Header`. If it's not, the string is returned.
     */
    function renderStringAsPlaintext(string) {
        return typeof string === 'string' ? string : renderMarkdownAsPlaintext(string);
    }
    exports.renderStringAsPlaintext = renderStringAsPlaintext;
    /**
     * Strips all markdown from `markdown`. For example `# Header` would be output as `Header`.
     */
    function renderMarkdownAsPlaintext(markdown) {
        // values that are too long will freeze the UI
        let value = markdown.value ?? '';
        if (value.length > 100000) {
            value = `${value.substr(0, 100000)}…`;
        }
        const html = marked_1.marked.parse(value, { renderer: plainTextRenderer.value }).replace(/&(#\d+|[a-zA-Z]+);/g, m => unescapeInfo.get(m) ?? m);
        return sanitizeRenderedMarkdown({ isTrusted: false }, html).toString();
    }
    exports.renderMarkdownAsPlaintext = renderMarkdownAsPlaintext;
    const unescapeInfo = new Map([
        ['&quot;', '"'],
        ['&nbsp;', ' '],
        ['&amp;', '&'],
        ['&#39;', '\''],
        ['&lt;', '<'],
        ['&gt;', '>'],
    ]);
    const plainTextRenderer = new lazy_1.Lazy(() => {
        const renderer = new marked_1.marked.Renderer();
        renderer.code = (code) => {
            return code;
        };
        renderer.blockquote = (quote) => {
            return quote;
        };
        renderer.html = (_html) => {
            return '';
        };
        renderer.heading = (text, _level, _raw) => {
            return text + '\n';
        };
        renderer.hr = () => {
            return '';
        };
        renderer.list = (body, _ordered) => {
            return body;
        };
        renderer.listitem = (text) => {
            return text + '\n';
        };
        renderer.paragraph = (text) => {
            return text + '\n';
        };
        renderer.table = (header, body) => {
            return header + body + '\n';
        };
        renderer.tablerow = (content) => {
            return content;
        };
        renderer.tablecell = (content, _flags) => {
            return content + ' ';
        };
        renderer.strong = (text) => {
            return text;
        };
        renderer.em = (text) => {
            return text;
        };
        renderer.codespan = (code) => {
            return code;
        };
        renderer.br = () => {
            return '\n';
        };
        renderer.del = (text) => {
            return text;
        };
        renderer.image = (_href, _title, _text) => {
            return '';
        };
        renderer.text = (text) => {
            return text;
        };
        renderer.link = (_href, _title, text) => {
            return text;
        };
        return renderer;
    });
    function mergeRawTokenText(tokens) {
        let mergedTokenText = '';
        tokens.forEach(token => {
            mergedTokenText += token.raw;
        });
        return mergedTokenText;
    }
    function completeSingleLinePattern(token) {
        for (let i = 0; i < token.tokens.length; i++) {
            const subtoken = token.tokens[i];
            if (subtoken.type === 'text') {
                const lines = subtoken.raw.split('\n');
                const lastLine = lines[lines.length - 1];
                if (lastLine.includes('`')) {
                    return completeCodespan(token);
                }
                else if (lastLine.includes('**')) {
                    return completeDoublestar(token);
                }
                else if (lastLine.match(/\*\w/)) {
                    return completeStar(token);
                }
                else if (lastLine.match(/(^|\s)__\w/)) {
                    return completeDoubleUnderscore(token);
                }
                else if (lastLine.match(/(^|\s)_\w/)) {
                    return completeUnderscore(token);
                }
                else if (lastLine.match(/(^|\s)\[.*\]\(\w*/)) {
                    const nextTwoSubTokens = token.tokens.slice(i + 1);
                    if (nextTwoSubTokens[0]?.type === 'link' && nextTwoSubTokens[1]?.type === 'text' && nextTwoSubTokens[1].raw.match(/^ *"[^"]*$/)) {
                        // A markdown link can look like
                        // [link text](https://microsoft.com "more text")
                        // Where "more text" is a title for the link or an argument to a vscode command link
                        return completeLinkTargetArg(token);
                    }
                    return completeLinkTarget(token);
                }
                else if (lastLine.match(/(^|\s)\[\w/)) {
                    return completeLinkText(token);
                }
            }
        }
        return undefined;
    }
    // function completeListItemPattern(token: marked.Tokens.List): marked.Tokens.List | undefined {
    // 	// Patch up this one list item
    // 	const lastItem = token.items[token.items.length - 1];
    // 	const newList = completeSingleLinePattern(lastItem);
    // 	if (!newList || newList.type !== 'list') {
    // 		// Nothing to fix, or not a pattern we were expecting
    // 		return;
    // 	}
    // 	// Re-parse the whole list with the last item replaced
    // 	const completeList = marked.lexer(mergeRawTokenText(token.items.slice(0, token.items.length - 1)) + newList.items[0].raw);
    // 	if (completeList.length === 1 && completeList[0].type === 'list') {
    // 		return completeList[0];
    // 	}
    // 	// Not a pattern we were expecting
    // 	return undefined;
    // }
    function fillInIncompleteTokens(tokens) {
        let i;
        let newTokens;
        for (i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.type === 'paragraph' && token.raw.match(/(\n|^)```/)) {
                // If the code block was complete, it would be in a type='code'
                newTokens = completeCodeBlock(tokens.slice(i));
                break;
            }
            if (token.type === 'paragraph' && token.raw.match(/(\n|^)\|/)) {
                newTokens = completeTable(tokens.slice(i));
                break;
            }
            // if (i === tokens.length - 1 && token.type === 'list') {
            // 	const newListToken = completeListItemPattern(token);
            // 	if (newListToken) {
            // 		newTokens = [newListToken];
            // 		break;
            // 	}
            // }
            if (i === tokens.length - 1 && token.type === 'paragraph') {
                // Only operates on a single token, because any newline that follows this should break these patterns
                const newToken = completeSingleLinePattern(token);
                if (newToken) {
                    newTokens = [newToken];
                    break;
                }
            }
        }
        if (newTokens) {
            const newTokensList = [
                ...tokens.slice(0, i),
                ...newTokens
            ];
            newTokensList.links = tokens.links;
            return newTokensList;
        }
        return tokens;
    }
    exports.fillInIncompleteTokens = fillInIncompleteTokens;
    function completeCodeBlock(tokens) {
        const mergedRawText = mergeRawTokenText(tokens);
        return marked_1.marked.lexer(mergedRawText + '\n```');
    }
    function completeCodespan(token) {
        return completeWithString(token, '`');
    }
    function completeStar(tokens) {
        return completeWithString(tokens, '*');
    }
    function completeUnderscore(tokens) {
        return completeWithString(tokens, '_');
    }
    function completeLinkTarget(tokens) {
        return completeWithString(tokens, ')');
    }
    function completeLinkTargetArg(tokens) {
        return completeWithString(tokens, '")');
    }
    function completeLinkText(tokens) {
        return completeWithString(tokens, '](about:blank)');
    }
    function completeDoublestar(tokens) {
        return completeWithString(tokens, '**');
    }
    function completeDoubleUnderscore(tokens) {
        return completeWithString(tokens, '__');
    }
    function completeWithString(tokens, closingString) {
        const mergedRawText = mergeRawTokenText(Array.isArray(tokens) ? tokens : [tokens]);
        // If it was completed correctly, this should be a single token.
        // Expecting either a Paragraph or a List
        return marked_1.marked.lexer(mergedRawText + closingString)[0];
    }
    function completeTable(tokens) {
        const mergedRawText = mergeRawTokenText(tokens);
        const lines = mergedRawText.split('\n');
        let numCols; // The number of line1 col headers
        let hasSeparatorRow = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (typeof numCols === 'undefined' && line.match(/^\s*\|/)) {
                const line1Matches = line.match(/(\|[^\|]+)(?=\||$)/g);
                if (line1Matches) {
                    numCols = line1Matches.length;
                }
            }
            else if (typeof numCols === 'number') {
                if (line.match(/^\s*\|/)) {
                    if (i !== lines.length - 1) {
                        // We got the line1 header row, and the line2 separator row, but there are more lines, and it wasn't parsed as a table!
                        // That's strange and means that the table is probably malformed in the source, so I won't try to patch it up.
                        return undefined;
                    }
                    // Got a line2 separator row- partial or complete, doesn't matter, we'll replace it with a correct one
                    hasSeparatorRow = true;
                }
                else {
                    // The line after the header row isn't a valid separator row, so the table is malformed, don't fix it up
                    return undefined;
                }
            }
        }
        if (typeof numCols === 'number' && numCols > 0) {
            const prefixText = hasSeparatorRow ? lines.slice(0, -1).join('\n') : mergedRawText;
            const line1EndsInPipe = !!prefixText.match(/\|\s*$/);
            const newRawText = prefixText + (line1EndsInPipe ? '' : '|') + `\n|${' --- |'.repeat(numCols)}`;
            return marked_1.marked.lexer(newRawText);
        }
        return undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd25SZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL21hcmtkb3duUmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0NoRyxNQUFNLHNCQUFzQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDNUMsS0FBSyxFQUFFLENBQUMsSUFBbUIsRUFBRSxLQUFvQixFQUFFLElBQVksRUFBVSxFQUFFO1lBQzFFLElBQUksVUFBVSxHQUFhLEVBQUUsQ0FBQztZQUM5QixJQUFJLFVBQVUsR0FBYSxFQUFFLENBQUM7WUFDOUIsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUEsb0NBQXNCLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdEQsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUEsZ0NBQWtCLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RELENBQUM7WUFDRCxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNWLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFBLGdDQUFrQixFQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0RCxDQUFDO1lBQ0QsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDWCxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBQSxnQ0FBa0IsRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekQsQ0FBQztZQUNELElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN2QixVQUFVLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBQ0QsT0FBTyxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxH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