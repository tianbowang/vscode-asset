var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arraysFind", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/observableInternal/derived", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/stableEditorScroll", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/browser/widget/diffEditor/components/accessibleDiffViewer", "vs/editor/browser/widget/diffEditor/components/diffEditorDecorations", "vs/editor/browser/widget/diffEditor/components/diffEditorSash", "vs/editor/browser/widget/diffEditor/features/hideUnchangedRegionsFeature", "vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/diffEditorViewZones", "vs/editor/browser/widget/diffEditor/features/movedBlocksLinesFeature", "vs/editor/browser/widget/diffEditor/features/overviewRulerFeature", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorCommon", "vs/editor/common/editorContextKeys", "vs/platform/audioCues/browser/audioCueService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/progress/common/progress", "./delegatingEditorImpl", "./components/diffEditorEditors", "./diffEditorOptions", "./diffEditorViewModel", "vs/editor/browser/widget/diffEditor/features/revertButtonsFeature", "vs/css!./style"], function (require, exports, dom_1, arraysFind_1, errors_1, event_1, lifecycle_1, observable_1, derived_1, editorExtensions_1, codeEditorService_1, stableEditorScroll_1, codeEditorWidget_1, accessibleDiffViewer_1, diffEditorDecorations_1, diffEditorSash_1, hideUnchangedRegionsFeature_1, diffEditorViewZones_1, movedBlocksLinesFeature_1, overviewRulerFeature_1, utils_1, position_1, range_1, editorCommon_1, editorContextKeys_1, audioCueService_1, contextkey_1, instantiation_1, serviceCollection_1, progress_1, delegatingEditorImpl_1, diffEditorEditors_1, diffEditorOptions_1, diffEditorViewModel_1, revertButtonsFeature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffEditorWidget = void 0;
    let DiffEditorWidget = class DiffEditorWidget extends delegatingEditorImpl_1.DelegatingEditor {
        static { this.ENTIRE_DIFF_OVERVIEW_WIDTH = overviewRulerFeature_1.OverviewRulerFeature.ENTIRE_DIFF_OVERVIEW_WIDTH; }
        get onDidContentSizeChange() { return this._editors.onDidContentSizeChange; }
        get collapseUnchangedRegions() { return this._options.hideUnchangedRegions.get(); }
        constructor(_domElement, options, codeEditorWidgetOptions, _parentContextKeyService, _parentInstantiationService, codeEditorService, _audioCueService, _editorProgressService) {
            super();
            this._domElement = _domElement;
            this._parentContextKeyService = _parentContextKeyService;
            this._parentInstantiationService = _parentInstantiationService;
            this._audioCueService = _audioCueService;
            this._editorProgressService = _editorProgressService;
            this.elements = (0, dom_1.h)('div.monaco-diff-editor.side-by-side', { style: { position: 'relative', height: '100%' } }, [
                (0, dom_1.h)('div.noModificationsOverlay@overlay', { style: { position: 'absolute', height: '100%', visibility: 'hidden', } }, [(0, dom_1.$)('span', {}, 'No Changes')]),
                (0, dom_1.h)('div.editor.original@original', { style: { position: 'absolute', height: '100%' } }),
                (0, dom_1.h)('div.editor.modified@modified', { style: { position: 'absolute', height: '100%' } }),
                (0, dom_1.h)('div.accessibleDiffViewer@accessibleDiffViewer', { style: { position: 'absolute', height: '100%' } }),
            ]);
            this._diffModel = (0, observable_1.observableValue)(this, undefined);
            this._shouldDisposeDiffModel = false;
            this.onDidChangeModel = event_1.Event.fromObservableLight(this._diffModel);
            this._contextKeyService = this._register(this._parentContextKeyService.createScoped(this._domElement));
            this._instantiationService = this._parentInstantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this._contextKeyService]));
            this._boundarySashes = (0, observable_1.observableValue)(this, undefined);
            this._accessibleDiffViewerShouldBeVisible = (0, observable_1.observableValue)(this, false);
            this._accessibleDiffViewerVisible = (0, observable_1.derived)(this, reader => this._options.onlyShowAccessibleDiffViewer.read(reader)
                ? true
                : this._accessibleDiffViewerShouldBeVisible.read(reader));
            this._movedBlocksLinesPart = (0, observable_1.observableValue)(this, undefined);
            this._layoutInfo = (0, observable_1.derived)(this, reader => {
                const width = this._rootSizeObserver.width.read(reader);
                const height = this._rootSizeObserver.height.read(reader);
                const sashLeft = this._sash.read(reader)?.sashLeft.read(reader);
                const originalWidth = sashLeft ?? Math.max(5, this._editors.original.getLayoutInfo().decorationsLeft);
                const modifiedWidth = width - originalWidth - (this._overviewRulerPart.read(reader)?.width ?? 0);
                const movedBlocksLinesWidth = this._movedBlocksLinesPart.read(reader)?.width.read(reader) ?? 0;
                const originalWidthWithoutMovedBlockLines = originalWidth - movedBlocksLinesWidth;
                this.elements.original.style.width = originalWidthWithoutMovedBlockLines + 'px';
                this.elements.original.style.left = '0px';
                this.elements.modified.style.width = modifiedWidth + 'px';
                this.elements.modified.style.left = originalWidth + 'px';
                this._editors.original.layout({ width: originalWidthWithoutMovedBlockLines, height }, true);
                this._editors.modified.layout({ width: modifiedWidth, height }, true);
                return {
                    modifiedEditor: this._editors.modified.getLayoutInfo(),
                    originalEditor: this._editors.original.getLayoutInfo(),
                };
            });
            this._diffValue = this._diffModel.map((m, r) => m?.diff.read(r));
            this.onDidUpdateDiff = event_1.Event.fromObservableLight(this._diffValue);
            codeEditorService.willCreateDiffEditor();
            this._contextKeyService.createKey('isInDiffEditor', true);
            this._domElement.appendChild(this.elements.root);
            this._register((0, lifecycle_1.toDisposable)(() => this._domElement.removeChild(this.elements.root)));
            this._rootSizeObserver = this._register(new utils_1.ObservableElementSizeObserver(this.elements.root, options.dimension));
            this._rootSizeObserver.setAutomaticLayout(options.automaticLayout ?? false);
            this._options = new diffEditorOptions_1.DiffEditorOptions(options);
            this._register((0, observable_1.autorun)(reader => {
                this._options.setWidth(this._rootSizeObserver.width.read(reader));
            }));
            this._contextKeyService.createKey(editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.key, false);
            this._register((0, utils_1.bindContextKey)(editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor, this._contextKeyService, reader => this._options.isInEmbeddedEditor.read(reader)));
            this._register((0, utils_1.bindContextKey)(editorContextKeys_1.EditorContextKeys.comparingMovedCode, this._contextKeyService, reader => !!this._diffModel.read(reader)?.movedTextToCompare.read(reader)));
            this._register((0, utils_1.bindContextKey)(editorContextKeys_1.EditorContextKeys.diffEditorRenderSideBySideInlineBreakpointReached, this._contextKeyService, reader => this._options.couldShowInlineViewBecauseOfSize.read(reader)));
            this._register((0, utils_1.bindContextKey)(editorContextKeys_1.EditorContextKeys.hasChanges, this._contextKeyService, reader => (this._diffModel.read(reader)?.diff.read(reader)?.mappings.length ?? 0) > 0));
            this._editors = this._register(this._instantiationService.createInstance(diffEditorEditors_1.DiffEditorEditors, this.elements.original, this.elements.modified, this._options, codeEditorWidgetOptions, (i, c, o, o2) => this._createInnerEditor(i, c, o, o2)));
            this._overviewRulerPart = (0, derived_1.derivedDisposable)(this, reader => !this._options.renderOverviewRuler.read(reader)
                ? undefined
                : this._instantiationService.createInstance((0, utils_1.readHotReloadableExport)(overviewRulerFeature_1.OverviewRulerFeature, reader), this._editors, this.elements.root, this._diffModel, this._rootSizeObserver.width, this._rootSizeObserver.height, this._layoutInfo.map(i => i.modifiedEditor))).recomputeInitiallyAndOnChange(this._store);
            this._sash = (0, derived_1.derivedDisposable)(this, reader => {
                const showSash = this._options.renderSideBySide.read(reader);
                this.elements.root.classList.toggle('side-by-side', showSash);
                return !showSash ? undefined : new diffEditorSash_1.DiffEditorSash(this._options, this.elements.root, {
                    height: this._rootSizeObserver.height,
                    width: this._rootSizeObserver.width.map((w, reader) => w - (this._overviewRulerPart.read(reader)?.width ?? 0)),
                }, this._boundarySashes);
            }).recomputeInitiallyAndOnChange(this._store);
            const unchangedRangesFeature = (0, derived_1.derivedDisposable)(this, reader => /** @description UnchangedRangesFeature */ this._instantiationService.createInstance((0, utils_1.readHotReloadableExport)(hideUnchangedRegionsFeature_1.HideUnchangedRegionsFeature, reader), this._editors, this._diffModel, this._options)).recomputeInitiallyAndOnChange(this._store);
            (0, derived_1.derivedDisposable)(this, reader => /** @description DiffEditorDecorations */ this._instantiationService.createInstance((0, utils_1.readHotReloadableExport)(diffEditorDecorations_1.DiffEditorDecorations, reader), this._editors, this._diffModel, this._options, this)).recomputeInitiallyAndOnChange(this._store);
            const origViewZoneIdsToIgnore = new Set();
            const modViewZoneIdsToIgnore = new Set();
            let isUpdatingViewZones = false;
            const viewZoneManager = (0, derived_1.derivedDisposable)(this, reader => /** @description ViewZoneManager */ this._instantiationService.createInstance((0, utils_1.readHotReloadableExport)(diffEditorViewZones_1.DiffEditorViewZones, reader), (0, dom_1.getWindow)(this._domElement), this._editors, this._diffModel, this._options, this, () => isUpdatingViewZones || unchangedRangesFeature.get().isUpdatingHiddenAreas, origViewZoneIdsToIgnore, modViewZoneIdsToIgnore)).recomputeInitiallyAndOnChange(this._store);
            const originalViewZones = (0, observable_1.derived)(this, (reader) => {
                const orig = viewZoneManager.read(reader).viewZones.read(reader).orig;
                const orig2 = unchangedRangesFeature.read(reader).viewZones.read(reader).origViewZones;
                return orig.concat(orig2);
            });
            const modifiedViewZones = (0, observable_1.derived)(this, (reader) => {
                const mod = viewZoneManager.read(reader).viewZones.read(reader).mod;
                const mod2 = unchangedRangesFeature.read(reader).viewZones.read(reader).modViewZones;
                return mod.concat(mod2);
            });
            this._register((0, utils_1.applyViewZones)(this._editors.original, originalViewZones, isUpdatingOrigViewZones => {
                isUpdatingViewZones = isUpdatingOrigViewZones;
            }, origViewZoneIdsToIgnore));
            let scrollState;
            this._register((0, utils_1.applyViewZones)(this._editors.modified, modifiedViewZones, isUpdatingModViewZones => {
                isUpdatingViewZones = isUpdatingModViewZones;
                if (isUpdatingViewZones) {
                    scrollState = stableEditorScroll_1.StableEditorScrollState.capture(this._editors.modified);
                }
                else {
                    scrollState?.restore(this._editors.modified);
                    scrollState = undefined;
                }
            }, modViewZoneIdsToIgnore));
            this._accessibleDiffViewer = (0, derived_1.derivedDisposable)(this, reader => this._instantiationService.createInstance((0, utils_1.readHotReloadableExport)(accessibleDiffViewer_1.AccessibleDiffViewer, reader), this.elements.accessibleDiffViewer, this._accessibleDiffViewerVisible, (visible, tx) => this._accessibleDiffViewerShouldBeVisible.set(visible, tx), this._options.onlyShowAccessibleDiffViewer.map(v => !v), this._rootSizeObserver.width, this._rootSizeObserver.height, this._diffModel.map((m, r) => m?.diff.read(r)?.mappings.map(m => m.lineRangeMapping)), this._editors)).recomputeInitiallyAndOnChange(this._store);
            const visibility = this._accessibleDiffViewerVisible.map(v => v ? 'hidden' : 'visible');
            this._register((0, utils_1.applyStyle)(this.elements.modified, { visibility }));
            this._register((0, utils_1.applyStyle)(this.elements.original, { visibility }));
            this._createDiffEditorContributions();
            codeEditorService.addDiffEditor(this);
            this._register((0, observable_1.recomputeInitiallyAndOnChange)(this._layoutInfo));
            (0, derived_1.derivedDisposable)(this, reader => /** @description MovedBlocksLinesPart */ new ((0, utils_1.readHotReloadableExport)(movedBlocksLinesFeature_1.MovedBlocksLinesFeature, reader))(this.elements.root, this._diffModel, this._layoutInfo.map(i => i.originalEditor), this._layoutInfo.map(i => i.modifiedEditor), this._editors)).recomputeInitiallyAndOnChange(this._store, value => {
                // This is to break the layout info <-> moved blocks lines part dependency cycle.
                this._movedBlocksLinesPart.set(value, undefined);
            });
            this._register((0, utils_1.applyStyle)(this.elements.overlay, {
                width: this._layoutInfo.map((i, r) => i.originalEditor.width + (this._options.renderSideBySide.read(r) ? 0 : i.modifiedEditor.width)),
                visibility: (0, observable_1.derived)(reader => /** @description visibility */ (this._options.hideUnchangedRegions.read(reader) && this._diffModel.read(reader)?.diff.read(reader)?.mappings.length === 0)
                    ? 'visible' : 'hidden'),
            }));
            this._register(event_1.Event.runAndSubscribe(this._editors.modified.onDidChangeCursorPosition, (e) => {
                if (e?.reason === 3 /* CursorChangeReason.Explicit */) {
                    const diff = this._diffModel.get()?.diff.get()?.mappings.find(m => m.lineRangeMapping.modified.contains(e.position.lineNumber));
                    if (diff?.lineRangeMapping.modified.isEmpty) {
                        this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineDeleted, { source: 'diffEditor.cursorPositionChanged' });
                    }
                    else if (diff?.lineRangeMapping.original.isEmpty) {
                        this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineInserted, { source: 'diffEditor.cursorPositionChanged' });
                    }
                    else if (diff) {
                        this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineModified, { source: 'diffEditor.cursorPositionChanged' });
                    }
                }
            }));
            const isInitializingDiff = this._diffModel.map(this, (m, reader) => {
                /** @isInitializingDiff isDiffUpToDate */
                if (!m) {
                    return undefined;
                }
                return m.diff.read(reader) === undefined && !m.isDiffUpToDate.read(reader);
            });
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description DiffEditorWidgetHelper.ShowProgress */
                if (isInitializingDiff.read(reader) === true) {
                    const r = this._editorProgressService.show(true, 1000);
                    store.add((0, lifecycle_1.toDisposable)(() => r.done()));
                }
            }));
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (this._shouldDisposeDiffModel) {
                    this._diffModel.get()?.dispose();
                }
            }));
            this._register(new revertButtonsFeature_1.RevertButtonsFeature(this._editors, this._diffModel, this._options, this));
        }
        getViewWidth() {
            return this._rootSizeObserver.width.get();
        }
        getContentHeight() {
            return this._editors.modified.getContentHeight();
        }
        _createInnerEditor(instantiationService, container, options, editorWidgetOptions) {
            const editor = instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, container, options, editorWidgetOptions);
            return editor;
        }
        _createDiffEditorContributions() {
            const contributions = editorExtensions_1.EditorExtensionsRegistry.getDiffEditorContributions();
            for (const desc of contributions) {
                try {
                    this._register(this._instantiationService.createInstance(desc.ctor, this));
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
            }
        }
        get _targetEditor() { return this._editors.modified; }
        getEditorType() { return editorCommon_1.EditorType.IDiffEditor; }
        onVisible() {
            // TODO: Only compute diffs when diff editor is visible
            this._editors.original.onVisible();
            this._editors.modified.onVisible();
        }
        onHide() {
            this._editors.original.onHide();
            this._editors.modified.onHide();
        }
        layout(dimension) {
            this._rootSizeObserver.observe(dimension);
        }
        hasTextFocus() { return this._editors.original.hasTextFocus() || this._editors.modified.hasTextFocus(); }
        saveViewState() {
            const originalViewState = this._editors.original.saveViewState();
            const modifiedViewState = this._editors.modified.saveViewState();
            return {
                original: originalViewState,
                modified: modifiedViewState,
                modelState: this._diffModel.get()?.serializeState(),
            };
        }
        restoreViewState(s) {
            if (s && s.original && s.modified) {
                const diffEditorState = s;
                this._editors.original.restoreViewState(diffEditorState.original);
                this._editors.modified.restoreViewState(diffEditorState.modified);
                if (diffEditorState.modelState) {
                    this._diffModel.get()?.restoreSerializedState(diffEditorState.modelState);
                }
            }
        }
        handleInitialized() {
            this._editors.original.handleInitialized();
            this._editors.modified.handleInitialized();
        }
        createViewModel(model) {
            return this._instantiationService.createInstance(diffEditorViewModel_1.DiffEditorViewModel, model, this._options);
        }
        getModel() { return this._diffModel.get()?.model ?? null; }
        setModel(model, tx) {
            if (!model && this._diffModel.get()) {
                // Transitioning from a model to no-model
                this._accessibleDiffViewer.get().close();
            }
            const vm = model ? ('model' in model) ? { model, shouldDispose: false } : { model: this.createViewModel(model), shouldDispose: true } : undefined;
            if (this._diffModel.get() !== vm?.model) {
                (0, observable_1.subtransaction)(tx, tx => {
                    /** @description DiffEditorWidget.setModel */
                    observable_1.observableFromEvent.batchEventsGlobally(tx, () => {
                        this._editors.original.setModel(vm ? vm.model.model.original : null);
                        this._editors.modified.setModel(vm ? vm.model.model.modified : null);
                    });
                    const prevValue = this._diffModel.get();
                    const shouldDispose = this._shouldDisposeDiffModel;
                    this._shouldDisposeDiffModel = vm?.shouldDispose ?? false;
                    this._diffModel.set(vm?.model, tx);
                    if (shouldDispose) {
                        prevValue?.dispose();
                    }
                });
            }
        }
        /**
         * @param changedOptions Only has values for top-level options that have actually changed.
         */
        updateOptions(changedOptions) {
            this._options.updateOptions(changedOptions);
        }
        getContainerDomNode() { return this._domElement; }
        getOriginalEditor() { return this._editors.original; }
        getModifiedEditor() { return this._editors.modified; }
        setBoundarySashes(sashes) {
            this._boundarySashes.set(sashes, undefined);
        }
        get ignoreTrimWhitespace() { return this._options.ignoreTrimWhitespace.get(); }
        get maxComputationTime() { return this._options.maxComputationTimeMs.get(); }
        get renderSideBySide() { return this._options.renderSideBySide.get(); }
        /**
         * @deprecated Use `this.getDiffComputationResult().changes2` instead.
         */
        getLineChanges() {
            const diffState = this._diffModel.get()?.diff.get();
            if (!diffState) {
                return null;
            }
            return toLineChanges(diffState);
        }
        getDiffComputationResult() {
            const diffState = this._diffModel.get()?.diff.get();
            if (!diffState) {
                return null;
            }
            return {
                changes: this.getLineChanges(),
                changes2: diffState.mappings.map(m => m.lineRangeMapping),
                identical: diffState.identical,
                quitEarly: diffState.quitEarly,
            };
        }
        revert(diff) {
            if (diff.innerChanges) {
                this.revertRangeMappings(diff.innerChanges);
                return;
            }
            const model = this._diffModel.get();
            if (!model || !model.isDiffUpToDate.get()) {
                return;
            }
            this._editors.modified.executeEdits('diffEditor', [
                {
                    range: diff.modified.toExclusiveRange(),
                    text: model.model.original.getValueInRange(diff.original.toExclusiveRange())
                }
            ]);
        }
        revertRangeMappings(diffs) {
            const model = this._diffModel.get();
            if (!model || !model.isDiffUpToDate.get()) {
                return;
            }
            const changes = diffs.map(c => ({
                range: c.modifiedRange,
                text: model.model.original.getValueInRange(c.originalRange)
            }));
            this._editors.modified.executeEdits('diffEditor', changes);
        }
        _goTo(diff) {
            this._editors.modified.setPosition(new position_1.Position(diff.lineRangeMapping.modified.startLineNumber, 1));
            this._editors.modified.revealRangeInCenter(diff.lineRangeMapping.modified.toExclusiveRange());
        }
        goToDiff(target) {
            const diffs = this._diffModel.get()?.diff.get()?.mappings;
            if (!diffs || diffs.length === 0) {
                return;
            }
            const curLineNumber = this._editors.modified.getPosition().lineNumber;
            let diff;
            if (target === 'next') {
                diff = diffs.find(d => d.lineRangeMapping.modified.startLineNumber > curLineNumber) ?? diffs[0];
            }
            else {
                diff = (0, arraysFind_1.findLast)(diffs, d => d.lineRangeMapping.modified.startLineNumber < curLineNumber) ?? diffs[diffs.length - 1];
            }
            this._goTo(diff);
            if (diff.lineRangeMapping.modified.isEmpty) {
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineDeleted, { source: 'diffEditor.goToDiff' });
            }
            else if (diff.lineRangeMapping.original.isEmpty) {
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineInserted, { source: 'diffEditor.goToDiff' });
            }
            else if (diff) {
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineModified, { source: 'diffEditor.goToDiff' });
            }
        }
        revealFirstDiff() {
            const diffModel = this._diffModel.get();
            if (!diffModel) {
                return;
            }
            // wait for the diff computation to finish
            this.waitForDiff().then(() => {
                const diffs = diffModel.diff.get()?.mappings;
                if (!diffs || diffs.length === 0) {
                    return;
                }
                this._goTo(diffs[0]);
            });
        }
        accessibleDiffViewerNext() { this._accessibleDiffViewer.get().next(); }
        accessibleDiffViewerPrev() { this._accessibleDiffViewer.get().prev(); }
        async waitForDiff() {
            const diffModel = this._diffModel.get();
            if (!diffModel) {
                return;
            }
            await diffModel.waitForDiff();
        }
        mapToOtherSide() {
            const isModifiedFocus = this._editors.modified.hasWidgetFocus();
            const source = isModifiedFocus ? this._editors.modified : this._editors.original;
            const destination = isModifiedFocus ? this._editors.original : this._editors.modified;
            let destinationSelection;
            const sourceSelection = source.getSelection();
            if (sourceSelection) {
                const mappings = this._diffModel.get()?.diff.get()?.mappings.map(m => isModifiedFocus ? m.lineRangeMapping.flip() : m.lineRangeMapping);
                if (mappings) {
                    const newRange1 = (0, utils_1.translatePosition)(sourceSelection.getStartPosition(), mappings);
                    const newRange2 = (0, utils_1.translatePosition)(sourceSelection.getEndPosition(), mappings);
                    destinationSelection = range_1.Range.plusRange(newRange1, newRange2);
                }
            }
            return { destination, destinationSelection };
        }
        switchSide() {
            const { destination, destinationSelection } = this.mapToOtherSide();
            destination.focus();
            if (destinationSelection) {
                destination.setSelection(destinationSelection);
            }
        }
        exitCompareMove() {
            const model = this._diffModel.get();
            if (!model) {
                return;
            }
            model.movedTextToCompare.set(undefined, undefined);
        }
        collapseAllUnchangedRegions() {
            const unchangedRegions = this._diffModel.get()?.unchangedRegions.get();
            if (!unchangedRegions) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                for (const region of unchangedRegions) {
                    region.collapseAll(tx);
                }
            });
        }
        showAllUnchangedRegions() {
            const unchangedRegions = this._diffModel.get()?.unchangedRegions.get();
            if (!unchangedRegions) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                for (const region of unchangedRegions) {
                    region.showAll(tx);
                }
            });
        }
    };
    exports.DiffEditorWidget = DiffEditorWidget;
    exports.DiffEditorWidget = DiffEditorWidget = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, codeEditorService_1.ICodeEditorService),
        __param(6, audioCueService_1.IAudioCueService),
        __param(7, progress_1.IEditorProgressService)
    ], DiffEditorWidget);
    function toLineChanges(state) {
        return state.mappings.map(x => {
            const m = x.lineRangeMapping;
            let originalStartLineNumber;
            let originalEndLineNumber;
            let modifiedStartLineNumber;
            let modifiedEndLineNumber;
            let innerChanges = m.innerChanges;
            if (m.original.isEmpty) {
                // Insertion
                originalStartLineNumber = m.original.startLineNumber - 1;
                originalEndLineNumber = 0;
                innerChanges = undefined;
            }
            else {
                originalStartLineNumber = m.original.startLineNumber;
                originalEndLineNumber = m.original.endLineNumberExclusive - 1;
            }
            if (m.modified.isEmpty) {
                // Deletion
                modifiedStartLineNumber = m.modified.startLineNumber - 1;
                modifiedEndLineNumber = 0;
                innerChanges = undefined;
            }
            else {
                modifiedStartLineNumber = m.modified.startLineNumber;
                modifiedEndLineNumber = m.modified.endLineNumberExclusive - 1;
            }
            return {
                originalStartLineNumber,
                originalEndLineNumber,
                modifiedStartLineNumber,
                modifiedEndLineNumber,
                charChanges: innerChanges?.map(m => ({
                    originalStartLineNumber: m.originalRange.startLineNumber,
                    originalStartColumn: m.originalRange.startColumn,
                    originalEndLineNumber: m.originalRange.endLineNumber,
                    originalEndColumn: m.originalRange.endColumn,
                    modifiedStartLineNumber: m.modifiedRange.startLineNumber,
                    modifiedStartColumn: m.modifiedRange.startColumn,
                    modifiedEndLineNumber: m.modifiedRange.endLineNumber,
                    modifiedEndColumn: m.modifiedRange.endColumn,
                }))
            };
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvcldpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvd2lkZ2V0L2RpZmZFZGl0b3IvZGlmZkVkaXRvcldpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBcURPLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWlCLFNBQVEsdUNBQWdCO2lCQUN2QywrQkFBMEIsR0FBRywyQ0FBb0IsQ0FBQywwQkFBMEIsQUFBbEQsQ0FBbUQ7UUFZM0YsSUFBVyxzQkFBc0IsS0FBSyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1FBd0JwRixJQUFXLHdCQUF3QixLQUFLLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFMUYsWUFDa0IsV0FBd0IsRUFDekMsT0FBaUQsRUFDakQsdUJBQXFELEVBQ2pDLHdCQUE2RCxFQUMxRCwyQkFBbUUsRUFDdEUsaUJBQXFDLEVBQ3ZDLGdCQUFtRCxFQUM3QyxzQkFBK0Q7WUFFdkYsS0FBSyxFQUFFLENBQUM7WUFUUyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUdKLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBb0I7WUFDekMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUF1QjtZQUV2RCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQzVCLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7WUE1Q3ZFLGFBQVEsR0FBRyxJQUFBLE9BQUMsRUFBQyxxQ0FBcUMsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7Z0JBQ3pILElBQUEsT0FBQyxFQUFDLG9DQUFvQyxFQUFFLEVBQUUsS0FBSyxF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