(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/glob", "vs/base/common/iterator", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/notebook/common/notebookDocumentService"], function (require, exports, buffer_1, glob, iterator_1, mime_1, network_1, path_1, platform_1, contextkey_1, notebookDocumentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MOVE_CURSOR_1_LINE_COMMAND = exports.compressOutputItemStreams = exports.isTextStreamMime = exports.NotebookWorkingCopyTypeIdentifier = exports.CellStatusbarAlignment = exports.NotebookSetting = exports.notebookDocumentFilterMatch = exports.isDocumentExcludePattern = exports.NotebookEditorPriority = exports.NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY = exports.NOTEBOOK_EDITOR_CURSOR_BOUNDARY = exports.diff = exports.MimeTypeDisplayOrder = exports.CellUri = exports.CellEditType = exports.SelectionStateType = exports.NotebookCellsChangeType = exports.RendererMessagingSpec = exports.NotebookRendererMatch = exports.NotebookExecutionState = exports.NotebookCellExecutionState = exports.NotebookRunState = exports.RENDERER_NOT_AVAILABLE = exports.RENDERER_EQUIVALENT_EXTENSIONS = exports.ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER = exports.NOTEBOOK_DISPLAY_ORDER = exports.CellKind = exports.INTERACTIVE_WINDOW_EDITOR_ID = exports.NOTEBOOK_DIFF_EDITOR_ID = exports.NOTEBOOK_EDITOR_ID = void 0;
    exports.NOTEBOOK_EDITOR_ID = 'workbench.editor.notebook';
    exports.NOTEBOOK_DIFF_EDITOR_ID = 'workbench.editor.notebookTextDiffEditor';
    exports.INTERACTIVE_WINDOW_EDITOR_ID = 'workbench.editor.interactive';
    var CellKind;
    (function (CellKind) {
        CellKind[CellKind["Markup"] = 1] = "Markup";
        CellKind[CellKind["Code"] = 2] = "Code";
    })(CellKind || (exports.CellKind = CellKind = {}));
    exports.NOTEBOOK_DISPLAY_ORDER = [
        'application/json',
        'application/javascript',
        'text/html',
        'image/svg+xml',
        mime_1.Mimes.latex,
        mime_1.Mimes.markdown,
        'image/png',
        'image/jpeg',
        mime_1.Mimes.text
    ];
    exports.ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER = [
        mime_1.Mimes.latex,
        mime_1.Mimes.markdown,
        'application/json',
        'text/html',
        'image/svg+xml',
        'image/png',
        'image/jpeg',
        mime_1.Mimes.text,
    ];
    /**
     * A mapping of extension IDs who contain renderers, to notebook ids who they
     * should be treated as the same in the renderer selection logic. This is used
     * to prefer the 1st party Jupyter renderers even though they're in a separate
     * extension, for instance. See #136247.
     */
    exports.RENDERER_EQUIVALENT_EXTENSIONS = new Map([
        ['ms-toolsai.jupyter', new Set(['jupyter-notebook', 'interactive'])],
        ['ms-toolsai.jupyter-renderers', new Set(['jupyter-notebook', 'interactive'])],
    ]);
    exports.RENDERER_NOT_AVAILABLE = '_notAvailable';
    var NotebookRunState;
    (function (NotebookRunState) {
        NotebookRunState[NotebookRunState["Running"] = 1] = "Running";
        NotebookRunState[NotebookRunState["Idle"] = 2] = "Idle";
    })(NotebookRunState || (exports.NotebookRunState = NotebookRunState = {}));
    var NotebookCellExecutionState;
    (function (NotebookCellExecutionState) {
        NotebookCellExecutionState[NotebookCellExecutionState["Unconfirmed"] = 1] = "Unconfirmed";
        NotebookCellExecutionState[NotebookCellExecutionState["Pending"] = 2] = "Pending";
        NotebookCellExecutionState[NotebookCellExecutionState["Executing"] = 3] = "Executing";
    })(NotebookCellExecutionState || (exports.NotebookCellExecutionState = NotebookCellExecutionState = {}));
    var NotebookExecutionState;
    (function (NotebookExecutionState) {
        NotebookExecutionState[NotebookExecutionState["Unconfirmed"] = 1] = "Unconfirmed";
        NotebookExecutionState[NotebookExecutionState["Pending"] = 2] = "Pending";
        NotebookExecutionState[NotebookExecutionState["Executing"] = 3] = "Executing";
    })(NotebookExecutionState || (exports.NotebookExecutionState = NotebookExecutionState = {}));
    /** Note: enum values are used for sorting */
    var NotebookRendererMatch;
    (function (NotebookRendererMatch) {
        /** Renderer has a hard dependency on an available kernel */
        NotebookRendererMatch[NotebookRendererMatch["WithHardKernelDependency"] = 0] = "WithHardKernelDependency";
        /** Renderer works better with an available kernel */
        NotebookRendererMatch[NotebookRendererMatch["WithOptionalKernelDependency"] = 1] = "WithOptionalKernelDependency";
        /** Renderer is kernel-agnostic */
        NotebookRendererMatch[NotebookRendererMatch["Pure"] = 2] = "Pure";
        /** Renderer is for a different mimeType or has a hard dependency which is unsatisfied */
        NotebookRendererMatch[NotebookRendererMatch["Never"] = 3] = "Never";
    })(NotebookRendererMatch || (exports.NotebookRendererMatch = NotebookRendererMatch = {}));
    /**
     * Renderer messaging requirement. While this allows for 'optional' messaging,
     * VS Code effectively treats it the same as true right now. "Partial
     * activation" of extensions is a very tricky problem, which could allow
     * solving this. But for now, optional is mostly only honored for aznb.
     */
    var RendererMessagingSpec;
    (function (RendererMessagingSpec) {
        RendererMessagingSpec["Always"] = "always";
        RendererMessagingSpec["Never"] = "never";
        RendererMessagingSpec["Optional"] = "optional";
    })(RendererMessagingSpec || (exports.RendererMessagingSpec = RendererMessagingSpec = {}));
    var NotebookCellsChangeType;
    (function (NotebookCellsChangeType) {
        NotebookCellsChangeType[NotebookCellsChangeType["ModelChange"] = 1] = "ModelChange";
        NotebookCellsChangeType[NotebookCellsChangeType["Move"] = 2] = "Move";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellLanguage"] = 5] = "ChangeCellLanguage";
        NotebookCellsChangeType[NotebookCellsChangeType["Initialize"] = 6] = "Initialize";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellMetadata"] = 7] = "ChangeCellMetadata";
        NotebookCellsChangeType[NotebookCellsChangeType["Output"] = 8] = "Output";
        NotebookCellsChangeType[NotebookCellsChangeType["OutputItem"] = 9] = "OutputItem";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellContent"] = 10] = "ChangeCellContent";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeDocumentMetadata"] = 11] = "ChangeDocumentMetadata";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellInternalMetadata"] = 12] = "ChangeCellInternalMetadata";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellMime"] = 13] = "ChangeCellMime";
        NotebookCellsChangeType[NotebookCellsChangeType["Unknown"] = 100] = "Unknown";
    })(NotebookCellsChangeType || (exports.NotebookCellsChangeType = NotebookCellsChangeType = {}));
    var SelectionStateType;
    (function (SelectionStateType) {
        SelectionStateType[SelectionStateType["Handle"] = 0] = "Handle";
        SelectionStateType[SelectionStateType["Index"] = 1] = "Index";
    })(SelectionStateType || (exports.SelectionStateType = SelectionStateType = {}));
    var CellEditType;
    (function (CellEditType) {
        CellEditType[CellEditType["Replace"] = 1] = "Replace";
        CellEditType[CellEditType["Output"] = 2] = "Output";
        CellEditType[CellEditType["Metadata"] = 3] = "Metadata";
        CellEditType[CellEditType["CellLanguage"] = 4] = "CellLanguage";
        CellEditType[CellEditType["DocumentMetadata"] = 5] = "DocumentMetadata";
        CellEditType[CellEditType["Move"] = 6] = "Move";
        CellEditType[CellEditType["OutputItems"] = 7] = "OutputItems";
        CellEditType[CellEditType["PartialMetadata"] = 8] = "PartialMetadata";
        CellEditType[CellEditType["PartialInternalMetadata"] = 9] = "PartialInternalMetadata";
    })(CellEditType || (exports.CellEditType = CellEditType = {}));
    var CellUri;
    (function (CellUri) {
        CellUri.scheme = network_1.Schemas.vscodeNotebookCell;
        function generate(notebook, handle) {
            return (0, notebookDocumentService_1.generate)(notebook, handle);
        }
        CellUri.generate = generate;
        function parse(cell) {
            return (0, notebookDocumentService_1.parse)(cell);
        }
        CellUri.parse = parse;
        function generateCellOutputUri(notebook, outputId) {
            return notebook.with({
                scheme: network_1.Schemas.vscodeNotebookCellOutput,
                fragment: `op${outputId ?? ''},${notebook.scheme !== network_1.Schemas.file ? notebook.scheme : ''}`
            });
        }
        CellUri.generateCellOutputUri = generateCellOutputUri;
        function parseCellOutputUri(uri) {
            if (uri.scheme !== network_1.Schemas.vscodeNotebookCellOutput) {
                return;
            }
            const match = /^op([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?\,(.*)$/i.exec(uri.fragment);
            if (!match) {
                return undefined;
            }
            const outputId = (match[1] && match[1] !== '') ? match[1] : undefined;
            const scheme = match[2];
            return {
                outputId,
                notebook: uri.with({
                    scheme: scheme || network_1.Schemas.file,
                    fragment: null
                })
            };
        }
        CellUri.parseCellOutputUri = parseCellOutputUri;
        function generateCellPropertyUri(notebook, handle, scheme) {
            return CellUri.generate(notebook, handle).with({ scheme: scheme });
        }
        CellUri.generateCellPropertyUri = generateCellPropertyUri;
        function parseCellPropertyUri(uri, propertyScheme) {
            if (uri.scheme !== propertyScheme) {
                return undefined;
            }
            return CellUri.parse(uri.with({ scheme: CellUri.scheme }));
        }
        CellUri.parseCellPropertyUri = parseCellPropertyUri;
    })(CellUri || (exports.CellUri = CellUri = {}));
    const normalizeSlashes = (str) => platform_1.isWindows ? str.replace(/\//g, '\\') : str;
    class MimeTypeDisplayOrder {
        constructor(initialValue = [], defaultOrder = exports.NOTEBOOK_DISPLAY_ORDER) {
            this.defaultOrder = defaultOrder;
            this.order = [...new Set(initialValue)].map(pattern => ({
                pattern,
                matches: glob.parse(normalizeSlashes(pattern))
            }));
        }
        /**
         * Returns a sorted array of the input mimetypes.
         */
        sort(mimetypes) {
            const remaining = new Map(iterator_1.Iterable.map(mimetypes, m => [m, normalizeSlashes(m)]));
            let sorted = [];
            for (const { matches } of this.order) {
                for (const [original, normalized] of remaining) {
                    if (matches(normalized)) {
                        sorted.push(original);
                        remaining.delete(original);
                        break;
                    }
                }
            }
            if (remaining.size) {
                sorted = sorted.concat([...remaining.keys()].sort((a, b) => this.defaultOrder.indexOf(a) - this.defaultOrder.indexOf(b)));
            }
            return sorted;
        }
        /**
         * Records that the user selected the given mimetype over the other
         * possible mimetypes, prioritizing it for future reference.
         */
        prioritize(chosenMimetype, otherMimetypes) {
            const chosenIndex = this.findIndex(chosenMimetype);
            if (chosenIndex === -1) {
                // always first, nothing more to do
                this.order.unshift({ pattern: chosenMimetype, matches: glob.parse(normalizeSlashes(chosenMimetype)) });
                return;
            }
            // Get the other mimetypes that are before the chosenMimetype. Then, move
            // them after it, retaining order.
            const uniqueIndicies = new Set(otherMimetypes.map(m => this.findIndex(m, chosenIndex)));
            uniqueIndicies.delete(-1);
            const otherIndices = Array.from(uniqueIndicies).sort();
            this.order.splice(chosenIndex + 1, 0, ...otherIndices.map(i => this.order[i]));
            for (let oi = otherIndices.length - 1; oi >= 0; oi--) {
                this.order.splice(otherIndices[oi], 1);
            }
        }
        /**
         * Gets an array of in-order mimetype preferences.
         */
        toArray() {
            return this.order.map(o => o.pattern);
        }
        findIndex(mimeType, maxIndex = this.order.length) {
            const normalized = normalizeSlashes(mimeType);
            for (let i = 0; i < maxIndex; i++) {
                if (this.order[i].matches(normalized)) {
                    return i;
                }
            }
            return -1;
        }
    }
    exports.MimeTypeDisplayOrder = MimeTypeDisplayOrder;
    function diff(before, after, contains, equal = (a, b) => a === b) {
        const result = [];
        function pushSplice(start, deleteCount, toInsert) {
            if (deleteCount === 0 && toInsert.length === 0) {
                return;
            }
            const latest = result[result.length - 1];
            if (latest && latest.start + latest.deleteCount === start) {
                latest.deleteCount += deleteCount;
                latest.toInsert.push(...toInsert);
            }
            else {
                result.push({ start, deleteCount, toInsert });
            }
        }
        let beforeIdx = 0;
        let afterIdx = 0;
        while (true) {
            if (beforeIdx === before.length) {
                pushSplice(beforeIdx, 0, after.slice(afterIdx));
                break;
            }
            if (afterIdx === after.length) {
                pushSplice(beforeIdx, before.length - beforeIdx, []);
                break;
            }
            const beforeElement = before[beforeIdx];
            const afterElement = after[afterIdx];
            if (equal(beforeElement, afterElement)) {
                // equal
                beforeIdx += 1;
                afterIdx += 1;
                continue;
            }
            if (contains(afterElement)) {
                // `afterElement` exists before, which means some elements before `afterElement` are deleted
                pushSplice(beforeIdx, 1, []);
                beforeIdx += 1;
            }
            else {
                // `afterElement` added
                pushSplice(beforeIdx, 0, [afterElement]);
                afterIdx += 1;
            }
        }
        return result;
    }
    exports.diff = diff;
    exports.NOTEBOOK_EDITOR_CURSOR_BOUNDARY = new contextkey_1.RawContextKey('notebookEditorCursorAtBoundary', 'none');
    exports.NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY = new contextkey_1.RawContextKey('notebookEditorCursorAtLineBoundary', 'none');
    var NotebookEditorPriority;
    (function (NotebookEditorPriority) {
        NotebookEditorPriority["default"] = "default";
        NotebookEditorPriority["option"] = "option";
    })(NotebookEditorPriority || (exports.NotebookEditorPriority = NotebookEditorPriority = {}));
    //TODO@rebornix test
    function isDocumentExcludePattern(filenamePattern) {
        const arg = filenamePattern;
        if ((typeof arg.include === 'string' || glob.isRelativePattern(arg.include))
            && (typeof arg.exclude === 'string' || glob.isRelativePattern(arg.exclude))) {
            return true;
        }
        return false;
    }
    exports.isDocumentExcludePattern = isDocumentExcludePattern;
    function notebookDocumentFilterMatch(filter, viewType, resource) {
        if (Array.isArray(filter.viewType) && filter.viewType.indexOf(viewType) >= 0) {
            return true;
        }
        if (filter.viewType === viewType) {
            return true;
        }
        if (filter.filenamePattern) {
            const filenamePattern = isDocumentExcludePattern(filter.filenamePattern) ? filter.filenamePattern.include : filter.filenamePattern;
            const excludeFilenamePattern = isDocumentExcludePattern(filter.filenamePattern) ? filter.filenamePattern.exclude : undefined;
            if (glob.match(filenamePattern, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                if (excludeFilenamePattern) {
                    if (glob.match(excludeFilenamePattern, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                        // should exclude
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
    exports.notebookDocumentFilterMatch = notebookDocumentFilterMatch;
    exports.NotebookSetting = {
        displayOrder: 'notebook.displayOrder',
        cellToolbarLocation: 'notebook.cellToolbarLocation',
        cellToolbarVisibility: 'notebook.cellToolbarVisibility',
        showCellStatusBar: 'notebook.showCellStatusBar',
        textDiffEditorPreview: 'notebook.diff.enablePreview',
        diffOverviewRuler: 'notebook.diff.overviewRuler',
        experimentalInsertToolbarAlignment: 'notebook.experimental.insertToolbarAlignment',
        compactView: 'notebook.compactView',
        focusIndicator: 'notebook.cellFocusIndicator',
        insertToolbarLocation: 'notebook.insertToolbarLocation',
        globalToolbar: 'notebook.globalToolbar',
        stickyScrollEnabled: 'notebook.stickyScroll.enabled',
        stickyScrollMode: 'notebook.stickyScroll.mode',
        undoRedoPerCell: 'notebook.undoRedoPerCell',
        consolidatedOutputButton: 'notebook.consolidatedOutputButton',
        showFoldingControls: 'notebook.showFoldingControls',
        dragAndDropEnabled: 'notebook.dragAndDropEnabled',
        cellEditorOptionsCustomizations: 'notebook.editorOptionsCustomizations',
        consolidatedRunButton: 'notebook.consolidatedRunButton',
        openGettingStarted: 'notebook.experimental.openGettingStarted',
        globalToolbarShowLabel: 'notebook.globalToolbarShowLabel',
        markupFontSize: 'notebook.markup.fontSize',
        interactiveWindowCollapseCodeCells: 'interactiveWindow.collapseCellInputCode',
        outputScrollingDeprecated: 'notebook.experimental.outputScrolling',
        outputScrolling: 'notebook.output.scrolling',
        textOutputLineLimit: 'notebook.output.textLineLimit',
        LinkifyOutputFilePaths: 'notebook.output.linkifyFilePaths',
        formatOnSave: 'notebook.formatOnSave.enabled',
        insertFinalNewline: 'notebook.insertFinalNewline',
        formatOnCellExecution: 'notebook.formatOnCellExecution',
        codeActionsOnSave: 'notebook.codeActionsOnSave',
        outputWordWrap: 'notebook.output.wordWrap',
        outputLineHeightDeprecated: 'notebook.outputLineHeight',
        outputLineHeight: 'notebook.output.lineHeight',
        outputFontSizeDeprecated: 'notebook.outputFontSize',
        outputFontSize: 'notebook.output.fontSize',
        outputFontFamilyDeprecated: 'notebook.outputFontFamily',
        outputFontFamily: 'notebook.output.fontFamily',
        findScope: 'notebook.find.scope',
        logging: 'notebook.logging',
        confirmDeleteRunningCell: 'notebook.confirmDeleteRunningCell',
        remoteSaving: 'notebook.experimental.remoteSave',
        gotoSymbolsAllSymbols: 'notebook.gotoSymbols.showAllSymbols',
        scrollToRevealCell: 'notebook.scrolling.revealNextCellOnExecute',
        anchorToFocusedCell: 'notebook.scrolling.experimental.anchorToFocusedCell',
        cellChat: 'notebook.experimental.cellChat',
        notebookVariablesView: 'notebook.experimental.variablesView'
    };
    var CellStatusbarAlignment;
    (function (CellStatusbarAlignment) {
        CellStatusbarAlignment[CellStatusbarAlignment["Left"] = 1] = "Left";
        CellStatusbarAlignment[CellStatusbarAlignment["Right"] = 2] = "Right";
    })(CellStatusbarAlignment || (exports.CellStatusbarAlignment = CellStatusbarAlignment = {}));
    class NotebookWorkingCopyTypeIdentifier {
        static { this._prefix = 'notebook/'; }
        static create(viewType) {
            return `${NotebookWorkingCopyTypeIdentifier._prefix}${viewType}`;
        }
        static parse(candidate) {
            if (candidate.startsWith(NotebookWorkingCopyTypeIdentifier._prefix)) {
                return candidate.substring(NotebookWorkingCopyTypeIdentifier._prefix.length);
            }
            return undefined;
        }
    }
    exports.NotebookWorkingCopyTypeIdentifier = NotebookWorkingCopyTypeIdentifier;
    /**
     * Whether the provided mime type is a text stream like `stdout`, `stderr`.
     */
    function isTextStreamMime(mimeType) {
        return ['application/vnd.code.notebook.stdout', 'application/vnd.code.notebook.stderr'].includes(mimeType);
    }
    exports.isTextStreamMime = isTextStreamMime;
    const textDecoder = new TextDecoder();
    /**
     * Given a stream of individual stdout outputs, this function will return the compressed lines, escaping some of the common terminal escape codes.
     * E.g. some terminal escape codes would result in the previous line getting cleared, such if we had 3 lines and
     * last line contained such a code, then the result string would be just the first two lines.
     * @returns a single VSBuffer with the concatenated and compressed data, and whether any compression was done.
     */
    function compressOutputItemStreams(outputs) {
        const buffers = [];
        let startAppending = false;
        // Pick the first set of outputs with the same mime type.
        for (const output of outputs) {
            if ((buffers.length === 0 || startAppending)) {
                buffers.push(output);
                startAppending = true;
            }
        }
        let didCompression = compressStreamBuffer(buffers);
        const concatenated = buffer_1.VSBuffer.concat(buffers.map(buffer => buffer_1.VSBuffer.wrap(buffer)));
        const data = formatStreamText(concatenated);
        didCompression = didCompression || data.byteLength !== concatenated.byteLength;
        return { data, didCompression };
    }
    exports.compressOutputItemStreams = compressOutputItemStreams;
    exports.MOVE_CURSOR_1_LINE_COMMAND = `${String.fromCharCode(27)}[A`;
    const MOVE_CURSOR_1_LINE_COMMAND_BYTES = exports.MOVE_CURSOR_1_LINE_COMMAND.split('').map(c => c.charCodeAt(0));
    const LINE_FEED = 10;
    function compressStreamBuffer(streams) {
        let didCompress = false;
        streams.forEach((stream, index) => {
            if (index === 0 || stream.length < exports.MOVE_CURSOR_1_LINE_COMMAND.length) {
                return;
            }
            const previousStream = streams[index - 1];
            // Remove the previous line if required.
            const command = stream.subarray(0, exports.MOVE_CURSOR_1_LINE_COMMAND.length);
            if (command[0] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[0] && command[1] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[1] && command[2] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[2]) {
                const lastIndexOfLineFeed = previousStream.lastIndexOf(LINE_FEED);
                if (lastIndexOfLineFeed === -1) {
                    return;
                }
                didCompress = true;
                streams[index - 1] = previousStream.subarray(0, lastIndexOfLineFeed);
                streams[index] = stream.subarray(exports.MOVE_CURSOR_1_LINE_COMMAND.length);
            }
        });
        return didCompress;
    }
    /**
     * Took this from jupyter/notebook
     * https://github.com/jupyter/notebook/blob/b8b66332e2023e83d2ee04f83d8814f567e01a4e/notebook/static/base/js/utils.js
     * Remove characters that are overridden by backspace characters
     */
    function fixBackspace(txt) {
        let tmp = txt;
        do {
            txt = tmp;
            // Cancel out anything-but-newline followed by backspace
            tmp = txt.replace(/[^\n]\x08/gm, '');
        } while (tmp.length < txt.length);
        return txt;
    }
    /**
     * Remove chunks that should be overridden by the effect of carriage return characters
     * From https://github.com/jupyter/notebook/blob/master/notebook/static/base/js/utils.js
     */
    function fixCarriageReturn(txt) {
        txt = txt.replace(/\r+\n/gm, '\n'); // \r followed by \n --> newline
        while (txt.search(/\r[^$]/g) > -1) {
            const base = txt.match(/^(.*)\r+/m)[1];
            let insert = txt.match(/\r+(.*)$/m)[1];
            insert = insert + base.slice(insert.length, base.length);
            txt = txt.replace(/\r+.*$/m, '\r').replace(/^.*\r/m, insert);
        }
        return txt;
    }
    const BACKSPACE_CHARACTER = '\b'.charCodeAt(0);
    const CARRIAGE_RETURN_CHARACTER = '\r'.charCodeAt(0);
    function formatStreamText(buffer) {
        // We have special handling for backspace and carriage return characters.
        // Don't unnecessary decode the bytes if we don't need to perform any processing.
        if (!buffer.buffer.includes(BACKSPACE_CHARACTER) && !buffer.buffer.includes(CARRIAGE_RETURN_CHARACTER)) {
            return buffer;
        }
        // Do the same thing jupyter is doing
        return buffer_1.VSBuffer.fromString(fixCarriageReturn(fixBackspace(textDecoder.decode(buffer.buffer))));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tDb21tb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2NvbW1vbi9ub3RlYm9va0NvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQ25GLFFBQUEsa0JBQWtCLEdBQUcsMkJBQTJCLENBQUM7SUFDakQsUUFBQSx1QkFBdUIsR0FBRyx5Q0FBeUMsQ0FBQztJQUNwRSxRQUFBLDRCQUE0QixHQUFHLDhCQUE4QixDQUFDO0lBRzNFLElBQVksUUFHWDtJQUhELFdBQVksUUFBUTtRQUNuQiwyQ0FBVSxDQUFBO1FBQ1YsdUNBQVEsQ0FBQTtJQUNULENBQUMsRUFIVyxRQUFRLHdCQUFSLFFBQVEsUUFHbkI7SUFFWSxRQUFBLHNCQUFzQixHQUFzQjtRQUN4RCxrQkFBa0I7UUFDbEIsd0JBQXdCO1FBQ3hCLFdBQVc7UUFDWCxlQUFlO1FBQ2YsWUFBSyxDQUFDLEtBQUs7UUFDWCxZQUFLLENBQUMsUUFBUTtRQUNkLFdBQVc7UUFDWCxZQUFZO1FBQ1osWUFBSyxDQUFDLElBQUk7S0FDVixDQUFDO0lBRVcsUUFBQSxpQ0FBaUMsR0FBc0I7UUFDbkUsWUFBSyxDQUFDLEtBQUs7UUFDWCxZQUFLLENBQUMsUUFBUTtRQUNkLGtCQUFrQjtRQUNsQixXQUFXO1FBQ1gsZUFBZTtRQUNmLFdBQVc7UUFDWCxZQUFZO1FBQ1osWUFBSyxDQUFDLElBQUk7S0FDVixDQUFDO0lBRUY7Ozs7O09BS0c7SUFDVSxRQUFBLDhCQUE4QixHQUE2QyxJQUFJLEdBQUcsQ0FBQztRQUMvRixDQUFDLG9CQUFvQixFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUNwRSxDQUFDLDhCQUE4QixFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsa0JBQWtCLEVB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
//# sourceURL=../../../vs/workbench/contrib/notebook/common/notebookCommon.js
})