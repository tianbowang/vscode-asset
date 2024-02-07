"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.findValidUriInText = exports.shouldInsertMarkdownLinkByDefault = exports.registerPasteUrlSupport = exports.PasteUrlAsMarkdownLink = void 0;
const vscode = require("vscode");
const mimes_1 = require("../../util/mimes");
const shared_1 = require("./shared");
const schemes_1 = require("../../util/schemes");
var PasteUrlAsMarkdownLink;
(function (PasteUrlAsMarkdownLink) {
    PasteUrlAsMarkdownLink["Always"] = "always";
    PasteUrlAsMarkdownLink["SmartWithSelection"] = "smartWithSelection";
    PasteUrlAsMarkdownLink["Smart"] = "smart";
    PasteUrlAsMarkdownLink["Never"] = "never";
})(PasteUrlAsMarkdownLink || (exports.PasteUrlAsMarkdownLink = PasteUrlAsMarkdownLink = {}));
function getPasteUrlAsFormattedLinkSetting(document) {
    return vscode.workspace.getConfiguration('markdown', document)
        .get('editor.pasteUrlAsFormattedLink.enabled', PasteUrlAsMarkdownLink.SmartWithSelection);
}
/**
 * Adds support for pasting text uris to create markdown links.
 *
 * This only applies to `text/plain`. Other mimes like `text/uri-list` are handled by ResourcePasteOrDropProvider.
 */
class PasteUrlEditProvider {
    constructor(_parser) {
        this._parser = _parser;
    }
    async provideDocumentPasteEdits(document, ranges, dataTransfer, token) {
        const pasteUrlSetting = getPasteUrlAsFormattedLinkSetting(document);
        if (pasteUrlSetting === PasteUrlAsMarkdownLink.Never) {
            return;
        }
        const item = dataTransfer.get(mimes_1.Mime.textPlain);
        const text = await item?.asString();
        if (token.isCancellationRequested || !text) {
            return;
        }
        const uriText = findValidUriInText(text);
        if (!uriText) {
            return;
        }
        const edit = (0, shared_1.createInsertUriListEdit)(document, ranges, uriText);
        if (!edit) {
            return;
        }
        const pasteEdit = new vscode.DocumentPasteEdit('', edit.label);
        const workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.set(document.uri, edit.edits);
        pasteEdit.additionalEdit = workspaceEdit;
        if (!(await shouldInsertMarkdownLinkByDefault(this._parser, document, pasteUrlSetting, ranges, token))) {
            pasteEdit.yieldTo = [{ mimeType: mimes_1.Mime.textPlain }];
        }
        return pasteEdit;
    }
}
PasteUrlEditProvider.id = 'insertMarkdownLink';
PasteUrlEditProvider.pasteMimeTypes = [mimes_1.Mime.textPlain];
function registerPasteUrlSupport(selector, parser) {
    return vscode.languages.registerDocumentPasteEditProvider(selector, new PasteUrlEditProvider(parser), {
        id: PasteUrlEditProvider.id,
        pasteMimeTypes: PasteUrlEditProvider.pasteMimeTypes,
    });
}
exports.registerPasteUrlSupport = registerPasteUrlSupport;
const smartPasteLineRegexes = [
    { regex: /(\[[^\[\]]*](?:\([^\(\)]*\)|\[[^\[\]]*]))/g }, // In a Markdown link
    { regex: /\$\$[\s\S]*?\$\$/gm }, // In a fenced math block
    { regex: /`[^`]*`/g }, // In inline code
    { regex: /\$[^$]*\$/g }, // In inline math
    { regex: /^[ ]{0,3}\[\w+\]:\s.*$/g }, // Block link definition (needed as tokens are not generated for these)
];
async function shouldInsertMarkdownLinkByDefault(parser, document, pasteUrlSetting, ranges, token) {
    switch (pasteUrlSetting) {
        case PasteUrlAsMarkdownLink.Always: {
            return true;
        }
        case PasteUrlAsMarkdownLink.Smart: {
            return checkSmart();
        }
        case PasteUrlAsMarkdownLink.SmartWithSelection: {
            // At least one range must not be empty
            if (!ranges.some(range => document.getText(range).trim().length > 0)) {
                return false;
            }
            // And all ranges must be smart
            return checkSmart();
        }
        default: {
            return false;
        }
    }
    async function checkSmart() {
        return (await Promise.all(ranges.map(range => shouldSmartPasteForSelection(parser, document, range, token)))).every(x => x);
    }
}
exports.shouldInsertMarkdownLinkByDefault = shouldInsertMarkdownLinkByDefault;
async function shouldSmartPasteForSelection(parser, document, selectedRange, token) {
    // Disable for multi-line selections
    if (selectedRange.start.line !== selectedRange.end.line) {
        return false;
    }
    const rangeText = document.getText(selectedRange);
    // Disable when the selection is already a link
    if (findValidUriInText(rangeText)) {
        return false;
    }
    if (/\[.*\]\(.*\)/.test(rangeText) || /!\[.*\]\(.*\)/.test(rangeText)) {
        return false;
    }
    // Check if selection is inside a special block level element using markdown engine
    const tokens = await parser.tokenize(document);
    if (token.isCancellationRequested) {
        return false;
    }
    for (const token of tokens) {
        if (token.map && token.map[0] <= selectedRange.start.line && token.map[1] > selectedRange.start.line) {
            if (!['paragraph_open', 'inline', 'heading_open', 'ordered_list_open', 'bullet_list_open', 'list_item_open', 'blockquote_open'].includes(token.type)) {
                return false;
            }
        }
    }
    // Run additional regex checks on the current line to check if we are inside an inline element
    const line = document.getText(new vscode.Range(selectedRange.start.line, 0, selectedRange.start.line, Number.MAX_SAFE_INTEGER));
    for (const regex of smartPasteLineRegexes) {
        for (const match of line.matchAll(regex.regex)) {
            if (match.index !== undefined && selectedRange.start.character >= match.index && selectedRange.start.character <= match.index + match[0].length) {
                return false;
            }
        }
    }
    return true;
}
const externalUriSchemes = new Set([
    schemes_1.Schemes.http,
    schemes_1.Schemes.https,
    schemes_1.Schemes.mailto,
    schemes_1.Schemes.file,
]);
function findValidUriInText(text) {
    const trimmedUrlList = text.trim();
    // Uri must consist of a single sequence of characters without spaces
    if (!/^\S+$/.test(trimmedUrlList)) {
        return;
    }
    let uri;
    try {
        uri = vscode.Uri.parse(trimmedUrlList);
    }
    catch {
        // Could not parse
        return;
    }
    if (!externalUriSchemes.has(uri.scheme.toLowerCase()) || uri.authority.length <= 1) {
        return;
    }
    return trimmedUrlList;
}
exports.findValidUriInText = findValidUriInText;
//# sourceMappingURL=pasteUrlProvider.js.map