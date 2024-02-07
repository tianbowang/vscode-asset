/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/iterator", "vs/base/common/linkedList", "vs/base/common/types", "vs/base/common/uri", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorBrowser", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/editorWorker", "vs/editor/common/services/resolverService", "vs/editor/contrib/format/browser/formattingEdit", "vs/platform/commands/common/commands", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/languageFeatures", "vs/platform/log/common/log", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, arrays_1, cancellation_1, errors_1, iterator_1, linkedList_1, types_1, uri_1, editorState_1, editorBrowser_1, position_1, range_1, selection_1, editorWorker_1, resolverService_1, formattingEdit_1, commands_1, extensions_1, instantiation_1, languageFeatures_1, log_1, audioCueService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOnTypeFormattingEdits = exports.getDocumentFormattingEditsUntilResult = exports.getDocumentRangeFormattingEditsUntilResult = exports.formatDocumentWithProvider = exports.formatDocumentWithSelectedProvider = exports.formatDocumentRangesWithProvider = exports.formatDocumentRangesWithSelectedProvider = exports.FormattingConflicts = exports.FormattingMode = exports.FormattingKind = exports.getRealAndSyntheticDocumentFormattersOrdered = void 0;
    function getRealAndSyntheticDocumentFormattersOrdered(documentFormattingEditProvider, documentRangeFormattingEditProvider, model) {
        const result = [];
        const seen = new extensions_1.ExtensionIdentifierSet();
        // (1) add all document formatter
        const docFormatter = documentFormattingEditProvider.ordered(model);
        for (const formatter of docFormatter) {
            result.push(formatter);
            if (formatter.extensionId) {
                seen.add(formatter.extensionId);
            }
        }
        // (2) add all range formatter as document formatter (unless the same extension already did that)
        const rangeFormatter = documentRangeFormattingEditProvider.ordered(model);
        for (const formatter of rangeFormatter) {
            if (formatter.extensionId) {
                if (seen.has(formatter.extensionId)) {
                    continue;
                }
                seen.add(formatter.extensionId);
            }
            result.push({
                displayName: formatter.displayName,
                extensionId: formatter.extensionId,
                provideDocumentFormattingEdits(model, options, token) {
                    return formatter.provideDocumentRangeFormattingEdits(model, model.getFullModelRange(), options, token);
                }
            });
        }
        return result;
    }
    exports.getRealAndSyntheticDocumentFormattersOrdered = getRealAndSyntheticDocumentFormattersOrdered;
    var FormattingKind;
    (function (FormattingKind) {
        FormattingKind[FormattingKind["File"] = 1] = "File";
        FormattingKind[FormattingKind["Selection"] = 2] = "Selection";
    })(FormattingKind || (exports.FormattingKind = FormattingKind = {}));
    var FormattingMode;
    (function (FormattingMode) {
        FormattingMode[FormattingMode["Explicit"] = 1] = "Explicit";
        FormattingMode[FormattingMode["Silent"] = 2] = "Silent";
    })(FormattingMode || (exports.FormattingMode = FormattingMode = {}));
    class FormattingConflicts {
        static { this._selectors = new linkedList_1.LinkedList(); }
        static setFormatterSelector(selector) {
            const remove = FormattingConflicts._selectors.unshift(selector);
            return { dispose: remove };
        }
        static async select(formatter, document, mode, kind) {
            if (formatter.length === 0) {
                return undefined;
            }
            const selector = iterator_1.Iterable.first(FormattingConflicts._selectors);
            if (selector) {
                return await selector(formatter, document, mode, kind);
            }
            return undefined;
        }
    }
    exports.FormattingConflicts = FormattingConflicts;
    async function formatDocumentRangesWithSelectedProvider(accessor, editorOrModel, rangeOrRanges, mode, progress, token, userGesture) {
        const instaService = accessor.get(instantiation_1.IInstantiationService);
        const { documentRangeFormattingEditProvider: documentRangeFormattingEditProviderRegistry } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const model = (0, editorBrowser_1.isCodeEditor)(editorOrModel) ? editorOrModel.getModel() : editorOrModel;
        const provider = documentRangeFormattingEditProviderRegistry.ordered(model);
        const selected = await FormattingConflicts.select(provider, model, mode, 2 /* FormattingKind.Selection */);
        if (selected) {
            progress.report(selected);
            await instaService.invokeFunction(formatDocumentRangesWithProvider, selected, editorOrModel, rangeOrRanges, token, userGesture);
        }
    }
    exports.formatDocumentRangesWithSelectedProvider = formatDocumentRangesWithSelectedProvider;
    async function formatDocumentRangesWithProvider(accessor, provider, editorOrModel, rangeOrRanges, token, userGesture) {
        const workerService = accessor.get(editorWorker_1.IEditorWorkerService);
        const logService = accessor.get(log_1.ILogService);
        const audioCueService = accessor.get(audioCueService_1.IAudioCueService);
        let model;
        let cts;
        if ((0, editorBrowser_1.isCodeEditor)(editorOrModel)) {
            model = editorOrModel.getModel();
            cts = new editorState_1.EditorStateCancellationTokenSource(editorOrModel, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */, undefined, token);
        }
        else {
            model = editorOrModel;
            cts = new editorState_1.TextModelCancellationTokenSource(editorOrModel, token);
        }
        // make sure that ranges don't overlap nor touch each other
        const ranges = [];
        let len = 0;
        for (const range of (0, arrays_1.asArray)(rangeOrRanges).sort(range_1.Range.compareRangesUsingStarts)) {
            if (len > 0 && range_1.Range.areIntersectingOrTouching(ranges[len - 1], range)) {
                ranges[len - 1] = range_1.Range.fromPositions(ranges[len - 1].getStartPosition(), range.getEndPosition());
            }
            else {
                len = ranges.push(range);
            }
        }
        const computeEdits = async (range) => {
            logService.trace(`[format][provideDocumentRangeFormattingEdits] (request)`, provider.extensionId?.value, range);
            const result = (await provider.provideDocumentRangeFormattingEdits(model, range, model.getFormattingOptions(), cts.token)) || [];
            logService.trace(`[format][provideDocumentRangeFormattingEdits] (response)`, provider.extensionId?.value, result);
            return result;
        };
        const hasIntersectingEdit = (a, b) => {
            if (!a.length || !b.length) {
                return false;
            }
            // quick exit if the list of ranges are completely unrelated [O(n)]
            const mergedA = a.reduce((acc, val) => { return range_1.Range.plusRange(acc, val.range); }, a[0].range);
            if (!b.some(x => { return range_1.Range.intersectRanges(mergedA, x.range); })) {
                return false;
            }
            // fallback to a complete check [O(n^2)]
            for (const edit of a) {
                for (const otherEdit of b) {
                    if (range_1.Range.intersectRanges(edit.range, otherEdit.range)) {
                        return true;
                    }
                }
            }
            return false;
        };
        const allEdits = [];
        const rawEditsList = [];
        try {
            if (typeof provider.provideDocumentRangesFormattingEdits === 'function') {
                logService.trace(`[format][provideDocumentRangeFormattingEdits] (request)`, provider.extensionId?.value, ranges);
                const result = (await provider.provideDocumentRangesFormattingEdits(model, ranges, model.getFormattingOptions(), cts.token)) || [];
                logService.trace(`[format][provideDocumentRangeFormattingEdits] (response)`, provider.extensionId?.value, result);
                rawEditsList.push(result);
            }
            else {
                for (const range of ranges) {
                    if (cts.token.isCancellationRequested) {
                        return true;
                    }
                    rawEditsList.push(await computeEdits(range));
                }
                for (let i = 0; i < ranges.length; ++i) {
                    for (let j = i + 1; j < ranges.length; ++j) {
                        if (cts.token.isCancellationRequested) {
                            return true;
                        }
                        if (hasIntersectingEdit(rawEditsList[i], rawEditsList[j])) {
                            // Merge ranges i and j into a single range, recompute the associated edits
                            const mergedRange = range_1.Range.plusRange(ranges[i], ranges[j]);
                            const edits = await computeEdits(mergedRange);
                            ranges.splice(j, 1);
                            ranges.splice(i, 1);
                            ranges.push(mergedRange);
                            rawEditsList.splice(j, 1);
                            rawEditsList.splice(i, 1);
                            rawEditsList.push(edits);
                            // Restart scanning
                            i = 0;
                            j = 0;
                        }
                    }
                }
            }
            for (const rawEdits of rawEditsList) {
                if (cts.token.isCancellationRequested) {
                    return true;
                }
                const minimalEdits = await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
                if (minimalEdits) {
                    allEdits.push(...minimalEdits);
                }
            }
        }
        finally {
            cts.dispose();
        }
        if (allEdits.length === 0) {
            return false;
        }
        if ((0, editorBrowser_1.isCodeEditor)(editorOrModel)) {
            // use editor to apply edits
            formattingEdit_1.FormattingEdit.execute(editorOrModel, allEdits, true);
            editorOrModel.revealPositionInCenterIfOutsideViewport(editorOrModel.getPosition(), 1 /* ScrollType.Immediate */);
        }
        else {
            // use model to apply edits
            const [{ range }] = allEdits;
            const initialSelection = new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
            model.pushEditOperations([initialSelection], allEdits.map(edit => {
                return {
                    text: edit.text,
                    range: range_1.Range.lift(edit.range),
                    forceMoveMarkers: true
                };
            }), undoEdits => {
                for (const { range } of undoEdits) {
                    if (range_1.Range.areIntersectingOrTouching(range, initialSelection)) {
                        return [new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)];
                    }
                }
                return null;
            });
        }
        audioCueService.playAudioCue(audioCueService_1.AudioCue.format, { userGesture });
        return true;
    }
    exports.formatDocumentRangesWithProvider = formatDocumentRangesWithProvider;
    async function formatDocumentWithSelectedProvider(accessor, editorOrModel, mode, progress, token, userGesture) {
        const instaService = accessor.get(instantiation_1.IInstantiationService);
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const model = (0, editorBrowser_1.isCodeEditor)(editorOrModel) ? editorOrModel.getModel() : editorOrModel;
        const provider = getRealAndSyntheticDocumentFormattersOrdered(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
        const selected = await FormattingConflicts.select(provider, model, mode, 1 /* FormattingKind.File */);
        if (selected) {
            progress.report(selected);
            await instaService.invokeFunction(formatDocumentWithProvider, selected, editorOrModel, mode, token, userGesture);
        }
    }
    exports.formatDocumentWithSelectedProvider = formatDocumentWithSelectedProvider;
    async function formatDocumentWithProvider(accessor, provider, editorOrModel, mode, token, userGesture) {
        const workerService = accessor.get(editorWorker_1.IEditorWorkerService);
        const audioCueService = accessor.get(audioCueService_1.IAudioCueService);
        let model;
        let cts;
        if ((0, editorBrowser_1.isCodeEditor)(editorOrModel)) {
            model = editorOrModel.getModel();
            cts = new editorState_1.EditorStateCancellationTokenSource(editorOrModel, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */, undefined, token);
        }
        else {
            model = editorOrModel;
            cts = new editorState_1.TextModelCancellationTokenSource(editorOrModel, token);
        }
        let edits;
        try {
            const rawEdits = await provider.provideDocumentFormattingEdits(model, model.getFormattingOptions(), cts.token);
            edits = await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
            if (cts.token.isCancellationRequested) {
                return true;
            }
        }
        finally {
            cts.dispose();
        }
        if (!edits || edits.length === 0) {
            return false;
        }
        if ((0, editorBrowser_1.isCodeEditor)(editorOrModel)) {
            // use editor to apply edits
            formattingEdit_1.FormattingEdit.execute(editorOrModel, edits, mode !== 2 /* FormattingMode.Silent */);
            if (mode !== 2 /* FormattingMode.Silent */) {
                editorOrModel.revealPositionInCenterIfOutsideViewport(editorOrModel.getPosition(), 1 /* ScrollType.Immediate */);
            }
        }
        else {
            // use model to apply edits
            const [{ range }] = edits;
            const initialSelection = new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
            model.pushEditOperations([initialSelection], edits.map(edit => {
                return {
                    text: edit.text,
                    range: range_1.Range.lift(edit.range),
                    forceMoveMarkers: true
                };
            }), undoEdits => {
                for (const { range } of undoEdits) {
                    if (range_1.Range.areIntersectingOrTouching(range, initialSelection)) {
                        return [new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)];
                    }
                }
                return null;
            });
        }
        audioCueService.playAudioCue(audioCueService_1.AudioCue.format, { userGesture });
        return true;
    }
    exports.formatDocumentWithProvider = formatDocumentWithProvider;
    async function getDocumentRangeFormattingEditsUntilResult(workerService, languageFeaturesService, model, range, options, token) {
        const providers = languageFeaturesService.documentRangeFormattingEditProvider.ordered(model);
        for (const provider of providers) {
            const rawEdits = await Promise.resolve(provider.provideDocumentRangeFormattingEdits(model, range, options, token)).catch(errors_1.onUnexpectedExternalError);
            if ((0, arrays_1.isNonEmptyArray)(rawEdits)) {
                return await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
            }
        }
        return undefined;
    }
    exports.getDocumentRangeFormattingEditsUntilResult = getDocumentRangeFormattingEditsUntilResult;
    async function getDocumentFormattingEditsUntilResult(workerService, languageFeaturesService, model, options, token) {
        const providers = getRealAndSyntheticDocumentFormattersOrdered(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
        for (const provider of providers) {
            const rawEdits = await Promise.resolve(provider.provideDocumentFormattingEdits(model, options, token)).catch(errors_1.onUnexpectedExternalError);
            if ((0, arrays_1.isNonEmptyArray)(rawEdits)) {
                return await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
            }
        }
        return undefined;
    }
    exports.getDocumentFormattingEditsUntilResult = getDocumentFormattingEditsUntilResult;
    function getOnTypeFormattingEdits(workerService, languageFeaturesService, model, position, ch, options, token) {
        const providers = languageFeaturesService.onTypeFormattingEditProvider.ordered(model);
        if (providers.length === 0) {
            return Promise.resolve(undefined);
        }
        if (providers[0].autoFormatTriggerCharacters.indexOf(ch) < 0) {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(providers[0].provideOnTypeFormattingEdits(model, position, ch, options, token)).catch(errors_1.onUnexpectedExternalError).then(edits => {
            return workerService.computeMoreMinimalEdits(model.uri, edits);
        });
    }
    exports.getOnTypeFormattingEdits = getOnTypeFormattingEdits;
    commands_1.CommandsRegistry.registerCommand('_executeFormatRangeProvider', async function (accessor, ...args) {
        const [resource, range, options] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(resource));
        (0, types_1.assertType)(range_1.Range.isIRange(range));
        const resolverService = accessor.get(resolverService_1.ITextModelService);
        const workerService = accessor.get(editorWorker_1.IEditorWorkerService);
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const reference = await resolverService.createModelReference(resource);
        try {
            return getDocumentRangeFormattingEditsUntilResult(workerService, languageFeaturesService, reference.object.textEditorModel, range_1.Range.lift(range), options, cancellation_1.CancellationToken.None);
        }
        finally {
            reference.dispose();
        }
    });
    commands_1.CommandsRegistry.registerCommand('_executeFormatDocumentProvider', async function (accessor, ...args) {
        const [resource, options] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(resource));
        const resolverService = accessor.get(resolverService_1.ITextModelService);
        const workerService = accessor.get(editorWorker_1.IEditorWorkerService);
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const reference = await resolverService.createModelReference(resource);
        try {
            return getDocumentFormattingEditsUntilResult(workerService, languageFeaturesService, reference.object.textEditorModel, options, cancellation_1.CancellationToken.None);
        }
        finally {
            reference.dispose();
        }
    });
    commands_1.CommandsRegistry.registerCommand('_executeFormatOnTypeProvider', async function (accessor, ...args) {
        const [resource, position, ch, options] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(resource));
        (0, types_1.assertType)(position_1.Position.isIPosition(position));
        (0, types_1.assertType)(typeof ch === 'string');
        const resolverService = accessor.get(resolverService_1.ITextModelService);
        const workerService = accessor.get(editorWorker_1.IEditorWorkerService);
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const reference = await resolverService.createModelReference(resource);
        try {
            return getOnTypeFormattingEdits(workerService, languageFeaturesService, reference.object.textEditorModel, position_1.Position.lift(position), ch, options, cancellation_1.CancellationToken.None);
        }
        finally {
            reference.dispose();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9mb3JtYXQvYnJvd3Nlci9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBK0JoRyxTQUFnQiw0Q0FBNEMsQ0FDM0QsOEJBQXVGLEVBQ3ZGLG1DQUFpRyxFQUNqRyxLQUFpQjtRQUVqQixNQUFNLE1BQU0sR0FBcUMsRUFBRSxDQUFDO1FBQ3BELE1BQU0sSUFBSSxHQUFHLElBQUksbUNBQXNCLEVBQUUsQ0FBQztRQUUxQyxpQ0FBaUM7UUFDakMsTUFBTSxZQUFZLEdBQUcsOEJBQThCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25FLEtBQUssTUFBTSxTQUFTLElBQUksWUFBWSxFQUFFLENBQUM7WUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDakMsQ0FBQztRQUNGLENBQUM7UUFFRCxpR0FBaUc7UUFDakcsTUFBTSxjQUFjLEdBQUcsbUNBQW1DLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFFLEtBQUssTUFBTSxTQUFTLElBQUksY0FBYyxFQUFFLENBQUM7WUFDeEMsSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzNCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztvQkFDckMsU0FBUztnQkFDVixDQUFDO2dCQUNELElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFD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