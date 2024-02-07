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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/network", "vs/editor/browser/config/editorConfiguration", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/view", "vs/editor/browser/view/viewUserInputEvents", "vs/editor/common/config/editorOptions", "vs/editor/common/core/cursorColumns", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorAction", "vs/editor/common/editorCommon", "vs/editor/common/editorContextKeys", "vs/editor/common/model/textModel", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/colorRegistry", "vs/editor/common/viewModel/viewModelImpl", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/notification/common/notification", "vs/platform/theme/common/themeService", "vs/platform/accessibility/common/accessibility", "vs/editor/common/viewModel/monospaceLineBreaksComputer", "vs/editor/browser/view/domLineBreaksComputer", "vs/editor/common/cursor/cursorWordOperations", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/browser/config/domFontInfo", "vs/editor/common/services/languageFeatures", "vs/editor/browser/widget/codeEditorContributions", "vs/editor/browser/config/tabFocus", "vs/editor/browser/services/markerDecorations", "vs/css!./media/editor"], function (require, exports, nls, dom, errors_1, event_1, hash_1, lifecycle_1, network_1, editorConfiguration_1, editorExtensions_1, codeEditorService_1, view_1, viewUserInputEvents_1, editorOptions_1, cursorColumns_1, position_1, range_1, selection_1, editorAction_1, editorCommon, editorContextKeys_1, textModel_1, editorColorRegistry_1, colorRegistry_1, viewModelImpl_1, commands_1, contextkey_1, instantiation_1, serviceCollection_1, notification_1, themeService_1, accessibility_1, monospaceLineBreaksComputer_1, domLineBreaksComputer_1, cursorWordOperations_1, languageConfigurationRegistry_1, domFontInfo_1, languageFeatures_1, codeEditorContributions_1, tabFocus_1) {
    "use strict";
    var CodeEditorWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorModeContext = exports.BooleanEventEmitter = exports.CodeEditorWidget = void 0;
    let EDITOR_ID = 0;
    class ModelData {
        constructor(model, viewModel, view, hasRealView, listenersToRemove, attachedView) {
            this.model = model;
            this.viewModel = viewModel;
            this.view = view;
            this.hasRealView = hasRealView;
            this.listenersToRemove = listenersToRemove;
            this.attachedView = attachedView;
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.listenersToRemove);
            this.model.onBeforeDetached(this.attachedView);
            if (this.hasRealView) {
                this.view.dispose();
            }
            this.viewModel.dispose();
        }
    }
    let CodeEditorWidget = class CodeEditorWidget extends lifecycle_1.Disposable {
        static { CodeEditorWidget_1 = this; }
        static { this.dropIntoEditorDecorationOptions = textModel_1.ModelDecorationOptions.register({
            description: 'workbench-dnd-target',
            className: 'dnd-target'
        }); }
        //#endregion
        get isSimpleWidget() {
            return this._configuration.isSimpleWidget;
        }
        get contextKeyService() { return this._contextKeyService; }
        constructor(domElement, _options, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService) {
            super();
            this.languageConfigurationService = languageConfigurationService;
            //#region Eventing
            this._deliveryQueue = (0, event_1.createEventDeliveryQueue)();
            this._contributions = this._register(new codeEditorContributions_1.CodeEditorContributions());
            this._onDidDispose = this._register(new event_1.Emitter());
            this.onDidDispose = this._onDidDispose.event;
            this._onDidChangeModelContent = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModelContent = this._onDidChangeModelContent.event;
            this._onDidChangeModelLanguage = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModelLanguage = this._onDidChangeModelLanguage.event;
            this._onDidChangeModelLanguageConfiguration = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModelLanguageConfiguration = this._onDidChangeModelLanguageConfiguration.event;
            this._onDidChangeModelOptions = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModelOptions = this._onDidChangeModelOptions.event;
            this._onDidChangeModelDecorations = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModelDecorations = this._onDidChangeModelDecorations.event;
            this._onDidChangeModelTokens = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModelTokens = this._onDidChangeModelTokens.event;
            this._onDidChangeConfiguration = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this._onWillChangeModel = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onWillChangeModel = this._onWillChangeModel.event;
            this._onDidChangeModel = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeModel = this._onDidChangeModel.event;
            this._onDidChangeCursorPosition = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeCursorPosition = this._onDidChangeCursorPosition.event;
            this._onDidChangeCursorSelection = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeCursorSelection = this._onDidChangeCursorSelection.event;
            this._onDidAttemptReadOnlyEdit = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onDidAttemptReadOnlyEdit = this._onDidAttemptReadOnlyEdit.event;
            this._onDidLayoutChange = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidLayoutChange = this._onDidLayoutChange.event;
            this._editorTextFocus = this._register(new BooleanEventEmitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidFocusEditorText = this._editorTextFocus.onDidChangeToTrue;
            this.onDidBlurEditorText = this._editorTextFocus.onDidChangeToFalse;
            this._editorWidgetFocus = this._register(new BooleanEventEmitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidFocusEditorWidget = this._editorWidgetFocus.onDidChangeToTrue;
            this.onDidBlurEditorWidget = this._editorWidgetFocus.onDidChangeToFalse;
            this._onWillType = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onWillType = this._onWillType.event;
            this._onDidType = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onDidType = this._onDidType.event;
            this._onDidCompositionStart = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onDidCompositionStart = this._onDidCompositionStart.event;
            this._onDidCompositionEnd = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onDidCompositionEnd = this._onDidCompositionEnd.event;
            this._onDidPaste = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onDidPaste = this._onDidPaste.event;
            this._onMouseUp = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseUp = this._onMouseUp.event;
            this._onMouseDown = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseDown = this._onMouseDown.event;
            this._onMouseDrag = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseDrag = this._onMouseDrag.event;
            this._onMouseDrop = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseDrop = this._onMouseDrop.event;
            this._onMouseDropCanceled = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseDropCanceled = this._onMouseDropCanceled.event;
            this._onDropIntoEditor = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onDropIntoEditor = this._onDropIntoEditor.event;
            this._onContextMenu = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onContextMenu = this._onContextMenu.event;
            this._onMouseMove = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseMove = this._onMouseMove.event;
            this._onMouseLeave = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseLeave = this._onMouseLeave.event;
            this._onMouseWheel = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onMouseWheel = this._onMouseWheel.event;
            this._onKeyUp = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onKeyUp = this._onKeyUp.event;
            this._onKeyDown = this._register(new InteractionEmitter(this._contributions, this._deliveryQueue));
            this.onKeyDown = this._onKeyDown.event;
            this._onDidContentSizeChange = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidContentSizeChange = this._onDidContentSizeChange.event;
            this._onDidScrollChange = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidScrollChange = this._onDidScrollChange.event;
            this._onDidChangeViewZones = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeViewZones = this._onDidChangeViewZones.event;
            this._onDidChangeHiddenAreas = this._register(new event_1.Emitter({ deliveryQueue: this._deliveryQueue }));
            this.onDidChangeHiddenAreas = this._onDidChangeHiddenAreas.event;
            this._actions = new Map();
            this._bannerDomNode = null;
            this._dropIntoEditorDecorations = this.createDecorationsCollection();
            codeEditorService.willCreateCodeEditor();
            const options = { ..._options };
            this._domElement = domElement;
            this._overflowWidgetsDomNode = options.overflowWidgetsDomNode;
            delete options.overflowWidgetsDomNode;
            this._id = (++EDITOR_ID);
            this._decorationTypeKeysToIds = {};
            this._decorationTypeSubtypes = {};
            this._telemetryData = codeEditorWidgetOptions.telemetryData;
            this._configuration = this._register(this._createConfiguration(codeEditorWidgetOptions.isSimpleWidget || false, options, accessibilityService));
            this._register(this._configuration.onDidChange((e) => {
                this._onDidChangeConfiguration.fire(e);
                const options = this._configuration.options;
                if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                    const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
                    this._onDidLayoutChange.fire(layoutInfo);
                }
            }));
            this._contextKeyService = this._register(contextKeyService.createScoped(this._domElement));
            this._notificationService = notificationService;
            this._codeEditorService = codeEditorService;
            this._commandService = commandService;
            this._themeService = themeService;
            this._register(new EditorContextKeysManager(this, this._contextKeyService));
            this._register(new EditorModeContext(this, this._contextKeyService, languageFeaturesService));
            this._instantiationService = instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this._contextKeyService]));
            this._modelData = null;
            this._focusTracker = new CodeEditorWidgetFocusTracker(domElement, this._overflowWidgetsDomNode);
            this._register(this._focusTracker.onChange(() => {
                this._editorWidgetFocus.setValue(this._focusTracker.hasFocus());
            }));
            this._contentWidgets = {};
            this._overlayWidgets = {};
            this._glyphMarginWidgets = {};
            let contributions;
            if (Array.isArray(codeEditorWidgetOptions.contributions)) {
                contributions = codeEditorWidgetOptions.contributions;
            }
            else {
                contributions = editorExtensions_1.EditorExtensionsRegistry.getEditorContributions();
            }
            this._contributions.initialize(this, contributions, this._instantiationService);
            for (const action of editorExtensions_1.EditorExtensionsRegistry.getEditorActions()) {
                if (this._actions.has(action.id)) {
                    (0, errors_1.onUnexpectedError)(new Error(`Cannot have two actions with the same id ${action.id}`));
                    continue;
                }
                const internalAction = new editorAction_1.InternalEditorAction(action.id, action.label, action.alias, action.metadata, action.precondition ?? undefined, (args) => {
                    return this._instantiationService.invokeFunction((accessor) => {
                        return Promise.resolve(action.runEditorCommand(accessor, this, args));
                    });
                }, this._contextKeyService);
                this._actions.set(internalAction.id, internalAction);
            }
            const isDropIntoEnabled = () => {
                return !this._configuration.options.get(90 /* EditorOption.readOnly */)
                    && this._configuration.options.get(36 /* EditorOption.dropIntoEditor */).enabled;
            };
            this._register(new dom.DragAndDropObserver(this._domElement, {
                onDragOver: e => {
                    if (!isDropIntoEnabled()) {
                        return;
                    }
                    const target = this.getTargetAtClientPoint(e.clientX, e.clientY);
                    if (target?.position) {
                        this.showDropIndicatorAt(target.position);
                    }
                },
                onDrop: async (e) => {
                    if (!isDropIntoEnabled()) {
                        return;
                    }
                    this.removeDropIndicator();
                    if (!e.dataTransfer) {
                        return;
                    }
                    const target = this.getTargetAtClientPoint(e.clientX, e.clientY);
                    if (target?.position) {
                        this._onDropIntoEditor.fire({ position: target.position, event: e });
                    }
                },
                onDragLeave: () => {
                    this.removeDropIndicator();
                },
                onDragEnd: () => {
                    this.removeDropIndicator();
                },
            }));
            this._codeEditorService.addCodeEditor(this);
        }
        writeScreenReaderContent(reason) {
            this._modelData?.view.writeScreenReaderContent(reason);
        }
        _createConfiguration(isSimpleWidget, options, accessibilityService) {
            return new editorConfiguration_1.EditorConfiguration(isSimpleWidget, options, this._domElement, accessibilityService);
        }
        getId() {
            return this.getEditorType() + ':' + this._id;
        }
        getEditorType() {
            return editorCommon.EditorType.ICodeEditor;
        }
        dispose() {
            this._codeEditorService.removeCodeEditor(this);
            this._focusTracker.dispose();
            this._actions.clear();
            this._contentWidgets = {};
            this._overlayWidgets = {};
            this._removeDecorationTypes();
            this._postDetachModelCleanup(this._detachModel());
            this._onDidDispose.fire();
            super.dispose();
        }
        invokeWithinContext(fn) {
            return this._instantiationService.invokeFunction(fn);
        }
        updateOptions(newOptions) {
            this._configuration.updateOptions(newOptions || {});
        }
        getOptions() {
            return this._configuration.options;
        }
        getOption(id) {
            return this._configuration.options.get(id);
        }
        getRawOptions() {
            return this._configuration.getRawOptions();
        }
        getOverflowWidgetsDomNode() {
            return this._overflowWidgetsDomNode;
        }
        getConfiguredWordAtPosition(position) {
            if (!this._modelData) {
                return null;
            }
            return cursorWordOperations_1.WordOperations.getWordAtPosition(this._modelData.model, this._configuration.options.get(129 /* EditorOption.wordSeparators */), position);
        }
        getValue(options = null) {
            if (!this._modelData) {
                return '';
            }
            const preserveBOM = (options && options.preserveBOM) ? true : false;
            let eolPreference = 0 /* EndOfLinePreference.TextDefined */;
            if (options && options.lineEnding && options.lineEnding === '\n') {
                eolPreference = 1 /* EndOfLinePreference.LF */;
            }
            else if (options && options.lineEnding && options.lineEnding === '\r\n') {
                eolPreference = 2 /* EndOfLinePreference.CRLF */;
            }
            return this._modelData.model.getValue(eolPreference, preserveBOM);
        }
        setValue(newValue) {
            if (!this._modelData) {
                return;
            }
            this._modelData.model.setValue(newValue);
        }
        getModel() {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.model;
        }
        setModel(_model = null) {
            const model = _model;
            if (this._modelData === null && model === null) {
                // Current model is the new model
                return;
            }
            if (this._modelData && this._modelData.model === model) {
                // Current model is the new model
                return;
            }
            const e = {
                oldModelUrl: this._modelData?.model.uri || null,
                newModelUrl: model?.uri || null
            };
            this._onWillChangeModel.fire(e);
            const hasTextFocus = this.hasTextFocus();
            const detachedModel = this._detachModel();
            this._attachModel(model);
            if (hasTextFocus && this.hasModel()) {
                this.focus();
            }
            this._removeDecorationTypes();
            this._onDidChangeModel.fire(e);
            this._postDetachModelCleanup(detachedModel);
            this._contributions.onAfterModelAttached();
        }
        _removeDecorationTypes() {
            this._decorationTypeKeysToIds = {};
            if (this._decorationTypeSubtypes) {
                for (const decorationType in this._decorationTypeSubtypes) {
                    const subTypes = this._decorationTypeSubtypes[decorationType];
                    for (const subType in subTypes) {
                        this._removeDecorationType(decorationType + '-' + subType);
                    }
                }
                this._decorationTypeSubtypes = {};
            }
        }
        getVisibleRanges() {
            if (!this._modelData) {
                return [];
            }
            return this._modelData.viewModel.getVisibleRanges();
        }
        getVisibleRangesPlusViewportAboveBelow() {
            if (!this._modelData) {
                return [];
            }
            return this._modelData.viewModel.getVisibleRangesPlusViewportAboveBelow();
        }
        getWhitespaces() {
            if (!this._modelData) {
                return [];
            }
            return this._modelData.viewModel.viewLayout.getWhitespaces();
        }
        static _getVerticalOffsetAfterPosition(modelData, modelLineNumber, modelColumn, includeViewZones) {
            const modelPosition = modelData.model.validatePosition({
                lineNumber: modelLineNumber,
                column: modelColumn
            });
            const viewPosition = modelData.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
            return modelData.viewModel.viewLayout.getVerticalOffsetAfterLineNumber(viewPosition.lineNumber, includeViewZones);
        }
        getTopForLineNumber(lineNumber, includeViewZones = false) {
            if (!this._modelData) {
                return -1;
            }
            return CodeEditorWidget_1._getVerticalOffsetForPosition(this._modelData, lineNumber, 1, includeViewZones);
        }
        getTopForPosition(lineNumber, column) {
            if (!this._modelData) {
                return -1;
            }
            return CodeEditorWidget_1._getVerticalOffsetForPosition(this._modelData, lineNumber, column, false);
        }
        static _getVerticalOffsetForPosition(modelData, modelLineNumber, modelColumn, includeViewZones = false) {
            const modelPosition = modelData.model.validatePosition({
                lineNumber: modelLineNumber,
                column: modelColumn
            });
            const viewPosition = modelData.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
            return modelData.viewModel.viewLayout.getVerticalOffsetForLineNumber(viewPosition.lineNumber, includeViewZones);
        }
        getBottomForLineNumber(lineNumber, includeViewZones = false) {
            if (!this._modelData) {
                return -1;
            }
            return CodeEditorWidget_1._getVerticalOffsetAfterPosition(this._modelData, lineNumber, 1, includeViewZones);
        }
        setHiddenAreas(ranges, source) {
            this._modelData?.viewModel.setHiddenAreas(ranges.map(r => range_1.Range.lift(r)), source);
        }
        getVisibleColumnFromPosition(rawPosition) {
            if (!this._modelData) {
                return rawPosition.column;
            }
            const position = this._modelData.model.validatePosition(rawPosition);
            const tabSize = this._modelData.model.getOptions().tabSize;
            return cursorColumns_1.CursorColumns.visibleColumnFromColumn(this._modelData.model.getLineContent(position.lineNumber), position.column, tabSize) + 1;
        }
        getStatusbarColumn(rawPosition) {
            if (!this._modelData) {
                return rawPosition.column;
            }
            const position = this._modelData.model.validatePosition(rawPosition);
            const tabSize = this._modelData.model.getOptions().tabSize;
            return cursorColumns_1.CursorColumns.toStatusbarColumn(this._modelData.model.getLineContent(position.lineNumber), position.column, tabSize);
        }
        getPosition() {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.viewModel.getPosition();
        }
        setPosition(position, source = 'api') {
            if (!this._modelData) {
                return;
            }
            if (!position_1.Position.isIPosition(position)) {
                throw new Error('Invalid arguments');
            }
            this._modelData.viewModel.setSelections(source, [{
                    selectionStartLineNumber: position.lineNumber,
                    selectionStartColumn: position.column,
                    positionLineNumber: position.lineNumber,
                    positionColumn: position.column
                }]);
        }
        _sendRevealRange(modelRange, verticalType, revealHorizontal, scrollType) {
            if (!this._modelData) {
                return;
            }
            if (!range_1.Range.isIRange(modelRange)) {
                throw new Error('Invalid arguments');
            }
            const validatedModelRange = this._modelData.model.validateRange(modelRange);
            const viewRange = this._modelData.viewModel.coordinatesConverter.convertModelRangeToViewRange(validatedModelRange);
            this._modelData.viewModel.revealRange('api', revealHorizontal, viewRange, verticalType, scrollType);
        }
        revealLine(lineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLine(lineNumber, 0 /* VerticalRevealType.Simple */, scrollType);
        }
        revealLineInCenter(lineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLine(lineNumber, 1 /* VerticalRevealType.Center */, scrollType);
        }
        revealLineInCenterIfOutsideViewport(lineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLine(lineNumber, 2 /* VerticalRevealType.CenterIfOutsideViewport */, scrollType);
        }
        revealLineNearTop(lineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLine(lineNumber, 5 /* VerticalRevealType.NearTop */, scrollType);
        }
        _revealLine(lineNumber, revealType, scrollType) {
            if (typeof lineNumber !== 'number') {
                throw new Error('Invalid arguments');
            }
            this._sendRevealRange(new range_1.Range(lineNumber, 1, lineNumber, 1), revealType, false, scrollType);
        }
        revealPosition(position, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealPosition(position, 0 /* VerticalRevealType.Simple */, true, scrollType);
        }
        revealPositionInCenter(position, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealPosition(position, 1 /* VerticalRevealType.Center */, true, scrollType);
        }
        revealPositionInCenterIfOutsideViewport(position, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealPosition(position, 2 /* VerticalRevealType.CenterIfOutsideViewport */, true, scrollType);
        }
        revealPositionNearTop(position, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealPosition(position, 5 /* VerticalRevealType.NearTop */, true, scrollType);
        }
        _revealPosition(position, verticalType, revealHorizontal, scrollType) {
            if (!position_1.Position.isIPosition(position)) {
                throw new Error('Invalid arguments');
            }
            this._sendRevealRange(new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column), verticalType, revealHorizontal, scrollType);
        }
        getSelection() {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.viewModel.getSelection();
        }
        getSelections() {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.viewModel.getSelections();
        }
        setSelection(something, source = 'api') {
            const isSelection = selection_1.Selection.isISelection(something);
            const isRange = range_1.Range.isIRange(something);
            if (!isSelection && !isRange) {
                throw new Error('Invalid arguments');
            }
            if (isSelection) {
                this._setSelectionImpl(something, source);
            }
            else if (isRange) {
                // act as if it was an IRange
                const selection = {
                    selectionStartLineNumber: something.startLineNumber,
                    selectionStartColumn: something.startColumn,
                    positionLineNumber: something.endLineNumber,
                    positionColumn: something.endColumn
                };
                this._setSelectionImpl(selection, source);
            }
        }
        _setSelectionImpl(sel, source) {
            if (!this._modelData) {
                return;
            }
            const selection = new selection_1.Selection(sel.selectionStartLineNumber, sel.selectionStartColumn, sel.positionLineNumber, sel.positionColumn);
            this._modelData.viewModel.setSelections(source, [selection]);
        }
        revealLines(startLineNumber, endLineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLines(startLineNumber, endLineNumber, 0 /* VerticalRevealType.Simple */, scrollType);
        }
        revealLinesInCenter(startLineNumber, endLineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLines(startLineNumber, endLineNumber, 1 /* VerticalRevealType.Center */, scrollType);
        }
        revealLinesInCenterIfOutsideViewport(startLineNumber, endLineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLines(startLineNumber, endLineNumber, 2 /* VerticalRevealType.CenterIfOutsideViewport */, scrollType);
        }
        revealLinesNearTop(startLineNumber, endLineNumber, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealLines(startLineNumber, endLineNumber, 5 /* VerticalRevealType.NearTop */, scrollType);
        }
        _revealLines(startLineNumber, endLineNumber, verticalType, scrollType) {
            if (typeof startLineNumber !== 'number' || typeof endLineNumber !== 'number') {
                throw new Error('Invalid arguments');
            }
            this._sendRevealRange(new range_1.Range(startLineNumber, 1, endLineNumber, 1), verticalType, false, scrollType);
        }
        revealRange(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */, revealVerticalInCenter = false, revealHorizontal = true) {
            this._revealRange(range, revealVerticalInCenter ? 1 /* VerticalRevealType.Center */ : 0 /* VerticalRevealType.Simple */, revealHorizontal, scrollType);
        }
        revealRangeInCenter(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealRange(range, 1 /* VerticalRevealType.Center */, true, scrollType);
        }
        revealRangeInCenterIfOutsideViewport(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealRange(range, 2 /* VerticalRevealType.CenterIfOutsideViewport */, true, scrollType);
        }
        revealRangeNearTop(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealRange(range, 5 /* VerticalRevealType.NearTop */, true, scrollType);
        }
        revealRangeNearTopIfOutsideViewport(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealRange(range, 6 /* VerticalRevealType.NearTopIfOutsideViewport */, true, scrollType);
        }
        revealRangeAtTop(range, scrollType = 0 /* editorCommon.ScrollType.Smooth */) {
            this._revealRange(range, 3 /* VerticalRevealType.Top */, true, scrollType);
        }
        _revealRange(range, verticalType, revealHorizontal, scrollType) {
            if (!range_1.Range.isIRange(range)) {
                throw new Error('Invalid arguments');
            }
            this._sendRevealRange(range_1.Range.lift(range), verticalType, revealHorizontal, scrollType);
        }
        setSelections(ranges, source = 'api', reason = 0 /* CursorChangeReason.NotSet */) {
            if (!this._modelData) {
                return;
            }
            if (!ranges || ranges.length === 0) {
                throw new Error('Invalid arguments');
            }
            for (let i = 0, len = ranges.length; i < len; i++) {
                if (!selection_1.Selection.isISelection(ranges[i])) {
                    throw new Error('Invalid arguments');
                }
            }
            this._modelData.viewModel.setSelections(source, ranges, reason);
        }
        getContentWidth() {
            if (!this._modelData) {
                return -1;
            }
            return this._modelData.viewModel.viewLayout.getContentWidth();
        }
        getScrollWidth() {
            if (!this._modelData) {
                return -1;
            }
            return this._modelData.viewModel.viewLayout.getScrollWidth();
        }
        getScrollLeft() {
            if (!this._modelData) {
                return -1;
            }
            return this._modelData.viewModel.viewLayout.getCurrentScrollLeft();
        }
        getContentHeight() {
            if (!this._modelData) {
                return -1;
            }
            return this._modelData.viewModel.viewLayout.getContentHeight();
        }
        getScrollHeight() {
            if (!this._modelData) {
                return -1;
            }
            return this._modelData.viewModel.viewLayout.getScrollHeight();
        }
        getScrollTop() {
            if (!this._modelData) {
                return -1;
            }
            return this._modelData.viewModel.viewLayout.getCurrentScrollTop();
        }
        setScrollLeft(newScrollLeft, scrollType = 1 /* editorCommon.ScrollType.Immediate */) {
            if (!this._modelData) {
                return;
            }
            if (typeof newScrollLeft !== 'number') {
                throw new Error('Invalid arguments');
            }
            this._modelData.viewModel.viewLayout.setScrollPosition({
                scrollLeft: newScrollLeft
            }, scrollType);
        }
        setScrollTop(newScrollTop, scrollType = 1 /* editorCommon.ScrollType.Immediate */) {
            if (!this._modelData) {
                return;
            }
            if (typeof newScrollTop !== 'number') {
                throw new Error('Invalid arguments');
            }
            this._modelData.viewModel.viewLayout.setScrollPosition({
                scrollTop: newScrollTop
            }, scrollType);
        }
        setScrollPosition(position, scrollType = 1 /* editorCommon.ScrollType.Immediate */) {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.viewLayout.setScrollPosition(position, scrollType);
        }
        hasPendingScrollAnimation() {
            if (!this._modelData) {
                return false;
            }
            return this._modelData.viewModel.viewLayout.hasPendingScrollAnimation();
        }
        saveViewState() {
            if (!this._modelData) {
                return null;
            }
            const contributionsState = this._contributions.saveViewState();
            const cursorState = this._modelData.viewModel.saveCursorState();
            const viewState = this._modelData.viewModel.saveState();
            return {
                cursorState: cursorState,
                viewState: viewState,
                contributionsState: contributionsState
            };
        }
        restoreViewState(s) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            const codeEditorState = s;
            if (codeEditorState && codeEditorState.cursorState && codeEditorState.viewState) {
                const cursorState = codeEditorState.cursorState;
                if (Array.isArray(cursorState)) {
                    if (cursorState.length > 0) {
                        this._modelData.viewModel.restoreCursorState(cursorState);
                    }
                }
                else {
                    // Backwards compatibility
                    this._modelData.viewModel.restoreCursorState([cursorState]);
                }
                this._contributions.restoreViewState(codeEditorState.contributionsState || {});
                const reducedState = this._modelData.viewModel.reduceRestoreState(codeEditorState.viewState);
                this._modelData.view.restoreState(reducedState);
            }
        }
        handleInitialized() {
            this._getViewModel()?.visibleLinesStabilized();
        }
        onVisible() {
            this._modelData?.view.refreshFocusState();
        }
        onHide() {
            this._modelData?.view.refreshFocusState();
            this._focusTracker.refreshState();
        }
        getContribution(id) {
            return this._contributions.get(id);
        }
        getActions() {
            return Array.from(this._actions.values());
        }
        getSupportedActions() {
            let result = this.getActions();
            result = result.filter(action => action.isSupported());
            return result;
        }
        getAction(id) {
            return this._actions.get(id) || null;
        }
        trigger(source, handlerId, payload) {
            payload = payload || {};
            switch (handlerId) {
                case "compositionStart" /* editorCommon.Handler.CompositionStart */:
                    this._startComposition();
                    return;
                case "compositionEnd" /* editorCommon.Handler.CompositionEnd */:
                    this._endComposition(source);
                    return;
                case "type" /* editorCommon.Handler.Type */: {
                    const args = payload;
                    this._type(source, args.text || '');
                    return;
                }
                case "replacePreviousChar" /* editorCommon.Handler.ReplacePreviousChar */: {
                    const args = payload;
                    this._compositionType(source, args.text || '', args.replaceCharCnt || 0, 0, 0);
                    return;
                }
                case "compositionType" /* editorCommon.Handler.CompositionType */: {
                    const args = payload;
                    this._compositionType(source, args.text || '', args.replacePrevCharCnt || 0, args.replaceNextCharCnt || 0, args.positionDelta || 0);
                    return;
                }
                case "paste" /* editorCommon.Handler.Paste */: {
                    const args = payload;
                    this._paste(source, args.text || '', args.pasteOnNewLine || false, args.multicursorText || null, args.mode || null);
                    return;
                }
                case "cut" /* editorCommon.Handler.Cut */:
                    this._cut(source);
                    return;
            }
            const action = this.getAction(handlerId);
            if (action) {
                Promise.resolve(action.run(payload)).then(undefined, errors_1.onUnexpectedError);
                return;
            }
            if (!this._modelData) {
                return;
            }
            if (this._triggerEditorCommand(source, handlerId, payload)) {
                return;
            }
            this._triggerCommand(handlerId, payload);
        }
        _triggerCommand(handlerId, payload) {
            this._commandService.executeCommand(handlerId, payload);
        }
        _startComposition() {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.startComposition();
            this._onDidCompositionStart.fire();
        }
        _endComposition(source) {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.endComposition(source);
            this._onDidCompositionEnd.fire();
        }
        _type(source, text) {
            if (!this._modelData || text.length === 0) {
                return;
            }
            if (source === 'keyboard') {
                this._onWillType.fire(text);
            }
            this._modelData.viewModel.type(text, source);
            if (source === 'keyboard') {
                this._onDidType.fire(text);
            }
        }
        _compositionType(source, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.compositionType(text, replacePrevCharCnt, replaceNextCharCnt, positionDelta, source);
        }
        _paste(source, text, pasteOnNewLine, multicursorText, mode) {
            if (!this._modelData || text.length === 0) {
                return;
            }
            const viewModel = this._modelData.viewModel;
            const startPosition = viewModel.getSelection().getStartPosition();
            viewModel.paste(text, pasteOnNewLine, multicursorText, source);
            const endPosition = viewModel.getSelection().getStartPosition();
            if (source === 'keyboard') {
                this._onDidPaste.fire({
                    range: new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column),
                    languageId: mode
                });
            }
        }
        _cut(source) {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.cut(source);
        }
        _triggerEditorCommand(source, handlerId, payload) {
            const command = editorExtensions_1.EditorExtensionsRegistry.getEditorCommand(handlerId);
            if (command) {
                payload = payload || {};
                payload.source = source;
                this._instantiationService.invokeFunction((accessor) => {
                    Promise.resolve(command.runEditorCommand(accessor, this, payload)).then(undefined, errors_1.onUnexpectedError);
                });
                return true;
            }
            return false;
        }
        _getViewModel() {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.viewModel;
        }
        pushUndoStop() {
            if (!this._modelData) {
                return false;
            }
            if (this._configuration.options.get(90 /* EditorOption.readOnly */)) {
                // read only editor => sorry!
                return false;
            }
            this._modelData.model.pushStackElement();
            return true;
        }
        popUndoStop() {
            if (!this._modelData) {
                return false;
            }
            if (this._configuration.options.get(90 /* EditorOption.readOnly */)) {
                // read only editor => sorry!
                return false;
            }
            this._modelData.model.popStackElement();
            return true;
        }
        executeEdits(source, edits, endCursorState) {
            if (!this._modelData) {
                return false;
            }
            if (this._configuration.options.get(90 /* EditorOption.readOnly */)) {
                // read only editor => sorry!
                return false;
            }
            let cursorStateComputer;
            if (!endCursorState) {
                cursorStateComputer = () => null;
            }
            else if (Array.isArray(endCursorState)) {
                cursorStateComputer = () => endCursorState;
            }
            else {
                cursorStateComputer = endCursorState;
            }
            this._modelData.viewModel.executeEdits(source, edits, cursorStateComputer);
            return true;
        }
        executeCommand(source, command) {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.executeCommand(command, source);
        }
        executeCommands(source, commands) {
            if (!this._modelData) {
                return;
            }
            this._modelData.viewModel.executeCommands(commands, source);
        }
        createDecorationsCollection(decorations) {
            return new EditorDecorationsCollection(this, decorations);
        }
        changeDecorations(callback) {
            if (!this._modelData) {
                // callback will not be called
                return null;
            }
            return this._modelData.model.changeDecorations(callback, this._id);
        }
        getLineDecorations(lineNumber) {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.model.getLineDecorations(lineNumber, this._id, (0, editorOptions_1.filterValidationDecorations)(this._configuration.options));
        }
        getDecorationsInRange(range) {
            if (!this._modelData) {
                return null;
            }
            return this._modelData.model.getDecorationsInRange(range, this._id, (0, editorOptions_1.filterValidationDecorations)(this._configuration.options));
        }
        /**
         * @deprecated
         */
        deltaDecorations(oldDecorations, newDecorations) {
            if (!this._modelData) {
                return [];
            }
            if (oldDecorations.length === 0 && newDecorations.length === 0) {
                return oldDecorations;
            }
            return this._modelData.model.deltaDecorations(oldDecorations, newDecorations, this._id);
        }
        removeDecorations(decorationIds) {
            if (!this._modelData || decorationIds.length === 0) {
                return;
            }
            this._modelData.model.changeDecorations((changeAccessor) => {
                changeAccessor.deltaDecorations(decorationIds, []);
            });
        }
        setDecorationsByType(description, decorationTypeKey, decorationOptions) {
            const newDecorationsSubTypes = {};
            const oldDecorationsSubTypes = this._decorationTypeSubtypes[decorationTypeKey] || {};
            this._decorationTypeSubtypes[decorationTypeKey] = newDecorationsSubTypes;
            const newModelDecorations = [];
            for (const decorationOption of decorationOptions) {
                let typeKey = decorationTypeKey;
                if (decorationOption.renderOptions) {
                    // identify custom render options by a hash code over all keys and values
                    // For custom render options register a decoration type if necessary
                    const subType = (0, hash_1.hash)(decorationOption.renderOptions).toString(16);
                    // The fact that `decorationTypeKey` appears in the typeKey has no influence
                    // it is just a mechanism to get predictable and unique keys (repeatable for the same options and unique across clients)
                    typeKey = decorationTypeKey + '-' + subType;
                    if (!oldDecorationsSubTypes[subType] && !newDecorationsSubTypes[subType]) {
                        // decoration type did not exist before, register new one
                        this._registerDecorationType(description, typeKey, decorationOption.renderOptions, decorationTypeKey);
                    }
                    newDecorationsSubTypes[subType] = true;
                }
                const opts = this._resolveDecorationOptions(typeKey, !!decorationOption.hoverMessage);
                if (decorationOption.hoverMessage) {
                    opts.hoverMessage = decorationOption.hoverMessage;
                }
                newModelDecorations.push({ range: decorationOption.range, options: opts });
            }
            // remove decoration sub types that are no longer used, deregister decoration type if necessary
            for (const subType in oldDecorationsSubTypes) {
                if (!newDecorationsSubTypes[subType]) {
                    this._removeDecorationType(decorationTypeKey + '-' + subType);
                }
            }
            // update all decorations
            const oldDecorationsIds = this._decorationTypeKeysToIds[decorationTypeKey] || [];
            this._decorationTypeKeysToIds[decorationTypeKey] = this.deltaDecorations(oldDecorationsIds, newModelDecorations);
        }
        setDecorationsByTypeFast(decorationTypeKey, ranges) {
            // remove decoration sub types that are no longer used, deregister decoration type if necessary
            const oldDecorationsSubTypes = this._decorationTypeSubtypes[decorationTypeKey] || {};
            for (const subType in oldDecorationsSubTypes) {
                this._removeDecorationType(decorationTypeKey + '-' + subType);
            }
            this._decorationTypeSubtypes[decorationTypeKey] = {};
            const opts = textModel_1.ModelDecorationOptions.createDynamic(this._resolveDecorationOptions(decorationTypeKey, false));
            const newModelDecorations = new Array(ranges.length);
            for (let i = 0, len = ranges.length; i < len; i++) {
                newModelDecorations[i] = { range: ranges[i], options: opts };
            }
            // update all decorations
            const oldDecorationsIds = this._decorationTypeKeysToIds[decorationTypeKey] || [];
            this._decorationTypeKeysToIds[decorationTypeKey] = this.deltaDecorations(oldDecorationsIds, newModelDecorations);
        }
        removeDecorationsByType(decorationTypeKey) {
            // remove decorations for type and sub type
            const oldDecorationsIds = this._decorationTypeKeysToIds[decorationTypeKey];
            if (oldDecorationsIds) {
                this.deltaDecorations(oldDecorationsIds, []);
            }
            if (this._decorationTypeKeysToIds.hasOwnProperty(decorationTypeKey)) {
                delete this._decorationTypeKeysToIds[decorationTypeKey];
            }
            if (this._decorationTypeSubtypes.hasOwnProperty(decorationTypeKey)) {
                delete this._decorationTypeSubtypes[decorationTypeKey];
            }
        }
        getLayoutInfo() {
            const options = this._configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            return layoutInfo;
        }
        createOverviewRuler(cssClassName) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return null;
            }
            return this._modelData.view.createOverviewRuler(cssClassName);
        }
        getContainerDomNode() {
            return this._domElement;
        }
        getDomNode() {
            if (!this._modelData || !this._modelData.hasRealView) {
                return null;
            }
            return this._modelData.view.domNode.domNode;
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            this._modelData.view.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            this._modelData.view.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        layout(dimension, postponeRendering = false) {
            this._configuration.observeContainer(dimension);
            if (!postponeRendering) {
                this.render();
            }
        }
        focus() {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            this._modelData.view.focus();
        }
        hasTextFocus() {
            if (!this._modelData || !this._modelData.hasRealView) {
                return false;
            }
            return this._modelData.view.isFocused();
        }
        hasWidgetFocus() {
            return this._focusTracker && this._focusTracker.hasFocus();
        }
        addContentWidget(widget) {
            const widgetData = {
                widget: widget,
                position: widget.getPosition()
            };
            if (this._contentWidgets.hasOwnProperty(widget.getId())) {
                console.warn('Overwriting a content widget with the same id:' + widget.getId());
            }
            this._contentWidgets[widget.getId()] = widgetData;
            if (this._modelData && this._modelData.hasRealView) {
                this._modelData.view.addContentWidget(widgetData);
            }
        }
        layoutContentWidget(widget) {
            const widgetId = widget.getId();
            if (this._contentWidgets.hasOwnProperty(widgetId)) {
                const widgetData = this._contentWidgets[widgetId];
                widgetData.position = widget.getPosition();
                if (this._modelData && this._modelData.hasRealView) {
                    this._modelData.view.layoutContentWidget(widgetData);
                }
            }
        }
        removeContentWidget(widget) {
            const widgetId = widget.getId();
            if (this._contentWidgets.hasOwnProperty(widgetId)) {
                const widgetData = this._contentWidgets[widgetId];
                delete this._contentWidgets[widgetId];
                if (this._modelData && this._modelData.hasRealView) {
                    this._modelData.view.removeContentWidget(widgetData);
                }
            }
        }
        addOverlayWidget(widget) {
            const widgetData = {
                widget: widget,
                position: widget.getPosition()
            };
            if (this._overlayWidgets.hasOwnProperty(widget.getId())) {
                console.warn('Overwriting an overlay widget with the same id.');
            }
            this._overlayWidgets[widget.getId()] = widgetData;
            if (this._modelData && this._modelData.hasRealView) {
                this._modelData.view.addOverlayWidget(widgetData);
            }
        }
        layoutOverlayWidget(widget) {
            const widgetId = widget.getId();
            if (this._overlayWidgets.hasOwnProperty(widgetId)) {
                const widgetData = this._overlayWidgets[widgetId];
                widgetData.position = widget.getPosition();
                if (this._modelData && this._modelData.hasRealView) {
                    this._modelData.view.layoutOverlayWidget(widgetData);
                }
            }
        }
        removeOverlayWidget(widget) {
            const widgetId = widget.getId();
            if (this._overlayWidgets.hasOwnProperty(widgetId)) {
                const widgetData = this._overlayWidgets[widgetId];
                delete this._overlayWidgets[widgetId];
                if (this._modelData && this._modelData.hasRealView) {
                    this._modelData.view.removeOverlayWidget(widgetData);
                }
            }
        }
        addGlyphMarginWidget(widget) {
            const widgetData = {
                widget: widget,
                position: widget.getPosition()
            };
            if (this._glyphMarginWidgets.hasOwnProperty(widget.getId())) {
                console.warn('Overwriting a glyph margin widget with the same id.');
            }
            this._glyphMarginWidgets[widget.getId()] = widgetData;
            if (this._modelData && this._modelData.hasRealView) {
                this._modelData.view.addGlyphMarginWidget(widgetData);
            }
        }
        layoutGlyphMarginWidget(widget) {
            const widgetId = widget.getId();
            if (this._glyphMarginWidgets.hasOwnProperty(widgetId)) {
                const widgetData = this._glyphMarginWidgets[widgetId];
                widgetData.position = widget.getPosition();
                if (this._modelData && this._modelData.hasRealView) {
                    this._modelData.view.layoutGlyphMarginWidget(widgetData);
                }
            }
        }
        removeGlyphMarginWidget(widget) {
            const widgetId = widget.getId();
            if (this._glyphMarginWidgets.hasOwnProperty(widgetId)) {
                const widgetData = this._glyphMarginWidgets[widgetId];
                delete this._glyphMarginWidgets[widgetId];
                if (this._modelData && this._modelData.hasRealView) {
                    this._modelData.view.removeGlyphMarginWidget(widgetData);
                }
            }
        }
        changeViewZones(callback) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            this._modelData.view.change(callback);
        }
        getTargetAtClientPoint(clientX, clientY) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return null;
            }
            return this._modelData.view.getTargetAtClientPoint(clientX, clientY);
        }
        getScrolledVisiblePosition(rawPosition) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return null;
            }
            const position = this._modelData.model.validatePosition(rawPosition);
            const options = this._configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const top = CodeEditorWidget_1._getVerticalOffsetForPosition(this._modelData, position.lineNumber, position.column) - this.getScrollTop();
            const left = this._modelData.view.getOffsetForColumn(position.lineNumber, position.column) + layoutInfo.glyphMarginWidth + layoutInfo.lineNumbersWidth + layoutInfo.decorationsWidth - this.getScrollLeft();
            return {
                top: top,
                left: left,
                height: options.get(66 /* EditorOption.lineHeight */)
            };
        }
        getOffsetForColumn(lineNumber, column) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return -1;
            }
            return this._modelData.view.getOffsetForColumn(lineNumber, column);
        }
        render(forceRedraw = false) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            this._modelData.view.render(true, forceRedraw);
        }
        setAriaOptions(options) {
            if (!this._modelData || !this._modelData.hasRealView) {
                return;
            }
            this._modelData.view.setAriaOptions(options);
        }
        applyFontInfo(target) {
            (0, domFontInfo_1.applyFontInfo)(target, this._configuration.options.get(50 /* EditorOption.fontInfo */));
        }
        setBanner(domNode, domNodeHeight) {
            if (this._bannerDomNode && this._domElement.contains(this._bannerDomNode)) {
                this._domElement.removeChild(this._bannerDomNode);
            }
            this._bannerDomNode = domNode;
            this._configuration.setReservedHeight(domNode ? domNodeHeight : 0);
            if (this._bannerDomNode) {
                this._domElement.prepend(this._bannerDomNode);
            }
        }
        _attachModel(model) {
            if (!model) {
                this._modelData = null;
                return;
            }
            const listenersToRemove = [];
            this._domElement.setAttribute('data-mode-id', model.getLanguageId());
            this._configuration.setIsDominatedByLongLines(model.isDominatedByLongLines());
            this._configuration.setModelLineCount(model.getLineCount());
            const attachedView = model.onBeforeAttached();
            const viewModel = new viewModelImpl_1.ViewModel(this._id, this._configuration, model, domLineBreaksComputer_1.DOMLineBreaksComputerFactory.create(dom.getWindow(this._domElement)), monospaceLineBreaksComputer_1.MonospaceLineBreaksComputerFactory.create(this._configuration.options), (callback) => dom.scheduleAtNextAnimationFrame(dom.getWindow(this._domElement), callback), this.languageConfigurationService, this._themeService, attachedView);
            // Someone might destroy the model from under the editor, so prevent any exceptions by setting a null model
            listenersToRemove.push(model.onWillDispose(() => this.setModel(null)));
            listenersToRemove.push(viewModel.onEvent((e) => {
                switch (e.kind) {
                    case 0 /* OutgoingViewModelEventKind.ContentSizeChanged */:
                        this._onDidContentSizeChange.fire(e);
                        break;
                    case 1 /* OutgoingViewModelEventKind.FocusChanged */:
                        this._editorTextFocus.setValue(e.hasFocus);
                        break;
                    case 2 /* OutgoingViewModelEventKind.ScrollChanged */:
                        this._onDidScrollChange.fire(e);
                        break;
                    case 3 /* OutgoingViewModelEventKind.ViewZonesChanged */:
                        this._onDidChangeViewZones.fire();
                        break;
                    case 4 /* OutgoingViewModelEventKind.HiddenAreasChanged */:
                        this._onDidChangeHiddenAreas.fire();
                        break;
                    case 5 /* OutgoingViewModelEventKind.ReadOnlyEditAttempt */:
                        this._onDidAttemptReadOnlyEdit.fire();
                        break;
                    case 6 /* OutgoingViewModelEventKind.CursorStateChanged */: {
                        if (e.reachedMaxCursorCount) {
                            const multiCursorLimit = this.getOption(79 /* EditorOption.multiCursorLimit */);
                            const message = nls.localize('cursors.maximum', "The number of cursors has been limited to {0}. Consider using [find and replace](https://code.visualstudio.com/docs/editor/codebasics#_find-and-replace) for larger changes or increase the editor multi cursor limit setting.", multiCursorLimit);
                            this._notificationService.prompt(notification_1.Severity.Warning, message, [
                                {
                                    label: 'Find and Replace',
                                    run: () => {
                                        this._commandService.executeCommand('editor.action.startFindReplaceAction');
                                    }
                                },
                                {
                                    label: nls.localize('goToSetting', 'Increase Multi Cursor Limit'),
                                    run: () => {
                                        this._commandService.executeCommand('workbench.action.openSettings2', {
                                            query: 'editor.multiCursorLimit'
                                        });
                                    }
                                }
                            ]);
                        }
                        const positions = [];
                        for (let i = 0, len = e.selections.length; i < len; i++) {
                            positions[i] = e.selections[i].getPosition();
                        }
                        const e1 = {
                            position: positions[0],
                            secondaryPositions: positions.slice(1),
                            reason: e.reason,
                            source: e.source
                        };
                        this._onDidChangeCursorPosition.fire(e1);
                        const e2 = {
                            selection: e.selections[0],
                            secondarySelections: e.selections.slice(1),
                            modelVersionId: e.modelVersionId,
                            oldSelections: e.oldSelections,
                            oldModelVersionId: e.oldModelVersionId,
                            source: e.source,
                            reason: e.reason
                        };
                        this._onDidChangeCursorSelection.fire(e2);
                        break;
                    }
                    case 7 /* OutgoingViewModelEventKind.ModelDecorationsChanged */:
                        this._onDidChangeModelDecorations.fire(e.event);
                        break;
                    case 8 /* OutgoingViewModelEventKind.ModelLanguageChanged */:
                        this._domElement.setAttribute('data-mode-id', model.getLanguageId());
                        this._onDidChangeModelLanguage.fire(e.event);
                        break;
                    case 9 /* OutgoingViewModelEventKind.ModelLanguageConfigurationChanged */:
                        this._onDidChangeModelLanguageConfiguration.fire(e.event);
                        break;
                    case 10 /* OutgoingViewModelEventKind.ModelContentChanged */:
                        this._onDidChangeModelContent.fire(e.event);
                        break;
                    case 11 /* OutgoingViewModelEventKind.ModelOptionsChanged */:
                        this._onDidChangeModelOptions.fire(e.event);
                        break;
                    case 12 /* OutgoingViewModelEventKind.ModelTokensChanged */:
                        this._onDidChangeModelTokens.fire(e.event);
                        break;
                }
            }));
            const [view, hasRealView] = this._createView(viewModel);
            if (hasRealView) {
                this._domElement.appendChild(view.domNode.domNode);
                let keys = Object.keys(this._contentWidgets);
                for (let i = 0, len = keys.length; i < len; i++) {
                    const widgetId = keys[i];
                    view.addContentWidget(this._contentWidgets[widgetId]);
                }
                keys = Object.keys(this._overlayWidgets);
                for (let i = 0, len = keys.length; i < len; i++) {
                    const widgetId = keys[i];
                    view.addOverlayWidget(this._overlayWidgets[widgetId]);
                }
                keys = Object.keys(this._glyphMarginWidgets);
                for (let i = 0, len = keys.length; i < len; i++) {
                    const widgetId = keys[i];
                    view.addGlyphMarginWidget(this._glyphMarginWidgets[widgetId]);
                }
                view.render(false, true);
                view.domNode.domNode.setAttribute('data-uri', model.uri.toString());
            }
            this._modelData = new ModelData(model, viewModel, view, hasRealView, listenersToRemove, attachedView);
        }
        _createView(viewModel) {
            let commandDelegate;
            if (this.isSimpleWidget) {
                commandDelegate = {
                    paste: (text, pasteOnNewLine, multicursorText, mode) => {
                        this._paste('keyboard', text, pasteOnNewLine, multicursorText, mode);
                    },
                    type: (text) => {
                        this._type('keyboard', text);
                    },
                    compositionType: (text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) => {
                        this._compositionType('keyboard', text, replacePrevCharCnt, replaceNextCharCnt, positionDelta);
                    },
                    startComposition: () => {
                        this._startComposition();
                    },
                    endComposition: () => {
                        this._endComposition('keyboard');
                    },
                    cut: () => {
                        this._cut('keyboard');
                    }
                };
            }
            else {
                commandDelegate = {
                    paste: (text, pasteOnNewLine, multicursorText, mode) => {
                        const payload = { text, pasteOnNewLine, multicursorText, mode };
                        this._commandService.executeCommand("paste" /* editorCommon.Handler.Paste */, payload);
                    },
                    type: (text) => {
                        const payload = { text };
                        this._commandService.executeCommand("type" /* editorCommon.Handler.Type */, payload);
                    },
                    compositionType: (text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) => {
                        // Try if possible to go through the existing `replacePreviousChar` command
                        if (replaceNextCharCnt || positionDelta) {
                            // must be handled through the new command
                            const payload = { text, replacePrevCharCnt, replaceNextCharCnt, positionDelta };
                            this._commandService.executeCommand("compositionType" /* editorCommon.Handler.CompositionType */, payload);
                        }
                        else {
                            const payload = { text, replaceCharCnt: replacePrevCharCnt };
                            this._commandService.executeCommand("replacePreviousChar" /* editorCommon.Handler.ReplacePreviousChar */, payload);
                        }
                    },
                    startComposition: () => {
                        this._commandService.executeCommand("compositionStart" /* editorCommon.Handler.CompositionStart */, {});
                    },
                    endComposition: () => {
                        this._commandService.executeCommand("compositionEnd" /* editorCommon.Handler.CompositionEnd */, {});
                    },
                    cut: () => {
                        this._commandService.executeCommand("cut" /* editorCommon.Handler.Cut */, {});
                    }
                };
            }
            const viewUserInputEvents = new viewUserInputEvents_1.ViewUserInputEvents(viewModel.coordinatesConverter);
            viewUserInputEvents.onKeyDown = (e) => this._onKeyDown.fire(e);
            viewUserInputEvents.onKeyUp = (e) => this._onKeyUp.fire(e);
            viewUserInputEvents.onContextMenu = (e) => this._onContextMenu.fire(e);
            viewUserInputEvents.onMouseMove = (e) => this._onMouseMove.fire(e);
            viewUserInputEvents.onMouseLeave = (e) => this._onMouseLeave.fire(e);
            viewUserInputEvents.onMouseDown = (e) => this._onMouseDown.fire(e);
            viewUserInputEvents.onMouseUp = (e) => this._onMouseUp.fire(e);
            viewUserInputEvents.onMouseDrag = (e) => this._onMouseDrag.fire(e);
            viewUserInputEvents.onMouseDrop = (e) => this._onMouseDrop.fire(e);
            viewUserInputEvents.onMouseDropCanceled = (e) => this._onMouseDropCanceled.fire(e);
            viewUserInputEvents.onMouseWheel = (e) => this._onMouseWheel.fire(e);
            const view = new view_1.View(commandDelegate, this._configuration, this._themeService.getColorTheme(), viewModel, viewUserInputEvents, this._overflowWidgetsDomNode, this._instantiationService);
            return [view, true];
        }
        _postDetachModelCleanup(detachedModel) {
            detachedModel?.removeAllDecorationsWithOwnerId(this._id);
        }
        _detachModel() {
            if (!this._modelData) {
                return null;
            }
            const model = this._modelData.model;
            const removeDomNode = this._modelData.hasRealView ? this._modelData.view.domNode.domNode : null;
            this._modelData.dispose();
            this._modelData = null;
            this._domElement.removeAttribute('data-mode-id');
            if (removeDomNode && this._domElement.contains(removeDomNode)) {
                this._domElement.removeChild(removeDomNode);
            }
            if (this._bannerDomNode && this._domElement.contains(this._bannerDomNode)) {
                this._domElement.removeChild(this._bannerDomNode);
            }
            return model;
        }
        _registerDecorationType(description, key, options, parentTypeKey) {
            this._codeEditorService.registerDecorationType(description, key, options, parentTypeKey, this);
        }
        _removeDecorationType(key) {
            this._codeEditorService.removeDecorationType(key);
        }
        _resolveDecorationOptions(typeKey, writable) {
            return this._codeEditorService.resolveDecorationOptions(typeKey, writable);
        }
        getTelemetryData() {
            return this._telemetryData;
        }
        hasModel() {
            return (this._modelData !== null);
        }
        showDropIndicatorAt(position) {
            const newDecorations = [{
                    range: new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                    options: CodeEditorWidget_1.dropIntoEditorDecorationOptions
                }];
            this._dropIntoEditorDecorations.set(newDecorations);
            this.revealPosition(position, 1 /* editorCommon.ScrollType.Immediate */);
        }
        removeDropIndicator() {
            this._dropIntoEditorDecorations.clear();
        }
        setContextValue(key, value) {
            this._contextKeyService.createKey(key, value);
        }
    };
    exports.CodeEditorWidget = CodeEditorWidget;
    exports.CodeEditorWidget = CodeEditorWidget = CodeEditorWidget_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, commands_1.ICommandService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, themeService_1.IThemeService),
        __param(8, notification_1.INotificationService),
        __param(9, accessibility_1.IAccessibilityService),
        __param(10, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(11, languageFeatures_1.ILanguageFeaturesService)
    ], CodeEditorWidget);
    var BooleanEventValue;
    (function (BooleanEventValue) {
        BooleanEventValue[BooleanEventValue["NotSet"] = 0] = "NotSet";
        BooleanEventValue[BooleanEventValue["False"] = 1] = "False";
        BooleanEventValue[BooleanEventValue["True"] = 2] = "True";
    })(BooleanEventValue || (BooleanEventValue = {}));
    class BooleanEventEmitter extends lifecycle_1.Disposable {
        constructor(_emitterOptions) {
            super();
            this._emitterOptions = _emitterOptions;
            this._onDidChangeToTrue = this._register(new event_1.Emitter(this._emitterOptions));
            this.onDidChangeToTrue = this._onDidChangeToTrue.event;
            this._onDidChangeToFalse = this._register(new event_1.Emitter(this._emitterOptions));
            this.onDidChangeToFalse = this._onDidChangeToFalse.event;
            this._value = 0 /* BooleanEventValue.NotSet */;
        }
        setValue(_value) {
            const value = (_value ? 2 /* BooleanEventValue.True */ : 1 /* BooleanEventValue.False */);
            if (this._value === value) {
                return;
            }
            this._value = value;
            if (this._value === 2 /* BooleanEventValue.True */) {
                this._onDidChangeToTrue.fire();
            }
            else if (this._value === 1 /* BooleanEventValue.False */) {
                this._onDidChangeToFalse.fire();
            }
        }
    }
    exports.BooleanEventEmitter = BooleanEventEmitter;
    /**
     * A regular event emitter that also makes sure contributions are instantiated if necessary
     */
    class InteractionEmitter extends event_1.Emitter {
        constructor(_contributions, deliveryQueue) {
            super({ deliveryQueue });
            this._contributions = _contributions;
        }
        fire(event) {
            this._contributions.onBeforeInteractionEvent();
            super.fire(event);
        }
    }
    class EditorContextKeysManager extends lifecycle_1.Disposable {
        constructor(editor, contextKeyService) {
            super();
            this._editor = editor;
            contextKeyService.createKey('editorId', editor.getId());
            this._editorSimpleInput = editorContextKeys_1.EditorContextKeys.editorSimpleInput.bindTo(contextKeyService);
            this._editorFocus = editorContextKeys_1.EditorContextKeys.focus.bindTo(contextKeyService);
            this._textInputFocus = editorContextKeys_1.EditorContextKeys.textInputFocus.bindTo(contextKeyService);
            this._editorTextFocus = editorContextKeys_1.EditorContextKeys.editorTextFocus.bindTo(contextKeyService);
            this._tabMovesFocus = editorContextKeys_1.EditorContextKeys.tabMovesFocus.bindTo(contextKeyService);
            this._editorReadonly = editorContextKeys_1.EditorContextKeys.readOnly.bindTo(contextKeyService);
            this._inDiffEditor = editorContextKeys_1.EditorContextKeys.inDiffEditor.bindTo(contextKeyService);
            this._editorColumnSelection = editorContextKeys_1.EditorContextKeys.columnSelection.bindTo(contextKeyService);
            this._hasMultipleSelections = editorContextKeys_1.EditorContextKeys.hasMultipleSelections.bindTo(contextKeyService);
            this._hasNonEmptySelection = editorContextKeys_1.EditorContextKeys.hasNonEmptySelection.bindTo(contextKeyService);
            this._canUndo = editorContextKeys_1.EditorContextKeys.canUndo.bindTo(contextKeyService);
            this._canRedo = editorContextKeys_1.EditorContextKeys.canRedo.bindTo(contextKeyService);
            this._register(this._editor.onDidChangeConfiguration(() => this._updateFromConfig()));
            this._register(this._editor.onDidChangeCursorSelection(() => this._updateFromSelection()));
            this._register(this._editor.onDidFocusEditorWidget(() => this._updateFromFocus()));
            this._register(this._editor.onDidBlurEditorWidget(() => this._updateFromFocus()));
            this._register(this._editor.onDidFocusEditorText(() => this._updateFromFocus()));
            this._register(this._editor.onDidBlurEditorText(() => this._updateFromFocus()));
            this._register(this._editor.onDidChangeModel(() => this._updateFromModel()));
            this._register(this._editor.onDidChangeConfiguration(() => this._updateFromModel()));
            this._register(tabFocus_1.TabFocus.onDidChangeTabFocus((tabFocusMode) => this._tabMovesFocus.set(tabFocusMode)));
            this._updateFromConfig();
            this._updateFromSelection();
            this._updateFromFocus();
            this._updateFromModel();
            this._editorSimpleInput.set(this._editor.isSimpleWidget);
        }
        _updateFromConfig() {
            const options = this._editor.getOptions();
            this._tabMovesFocus.set(tabFocus_1.TabFocus.getTabFocusMode());
            this._editorReadonly.set(options.get(90 /* EditorOption.readOnly */));
            this._inDiffEditor.set(options.get(61 /* EditorOption.inDiffEditor */));
            this._editorColumnSelection.set(options.get(22 /* EditorOption.columnSelection */));
        }
        _updateFromSelection() {
            const selections = this._editor.getSelections();
            if (!selections) {
                this._hasMultipleSelections.reset();
                this._hasNonEmptySelection.reset();
            }
            else {
                this._hasMultipleSelections.set(selections.length > 1);
                this._hasNonEmptySelection.set(selections.some(s => !s.isEmpty()));
            }
        }
        _updateFromFocus() {
            this._editorFocus.set(this._editor.hasWidgetFocus() && !this._editor.isSimpleWidget);
            this._editorTextFocus.set(this._editor.hasTextFocus() && !this._editor.isSimpleWidget);
            this._textInputFocus.set(this._editor.hasTextFocus());
        }
        _updateFromModel() {
            const model = this._editor.getModel();
            this._canUndo.set(Boolean(model && model.canUndo()));
            this._canRedo.set(Boolean(model && model.canRedo()));
        }
    }
    class EditorModeContext extends lifecycle_1.Disposable {
        constructor(_editor, _contextKeyService, _languageFeaturesService) {
            super();
            this._editor = _editor;
            this._contextKeyService = _contextKeyService;
            this._languageFeaturesService = _languageFeaturesService;
            this._langId = editorContextKeys_1.EditorContextKeys.languageId.bindTo(_contextKeyService);
            this._hasCompletionItemProvider = editorContextKeys_1.EditorContextKeys.hasCompletionItemProvider.bindTo(_contextKeyService);
            this._hasCodeActionsProvider = editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider.bindTo(_contextKeyService);
            this._hasCodeLensProvider = editorContextKeys_1.EditorContextKeys.hasCodeLensProvider.bindTo(_contextKeyService);
            this._hasDefinitionProvider = editorContextKeys_1.EditorContextKeys.hasDefinitionProvider.bindTo(_contextKeyService);
            this._hasDeclarationProvider = editorContextKeys_1.EditorContextKeys.hasDeclarationProvider.bindTo(_contextKeyService);
            this._hasImplementationProvider = editorContextKeys_1.EditorContextKeys.hasImplementationProvider.bindTo(_contextKeyService);
            this._hasTypeDefinitionProvider = editorContextKeys_1.EditorContextKeys.hasTypeDefinitionProvider.bindTo(_contextKeyService);
            this._hasHoverProvider = editorContextKeys_1.EditorContextKeys.hasHoverProvider.bindTo(_contextKeyService);
            this._hasDocumentHighlightProvider = editorContextKeys_1.EditorContextKeys.hasDocumentHighlightProvider.bindTo(_contextKeyService);
            this._hasDocumentSymbolProvider = editorContextKeys_1.EditorContextKeys.hasDocumentSymbolProvider.bindTo(_contextKeyService);
            this._hasReferenceProvider = editorContextKeys_1.EditorContextKeys.hasReferenceProvider.bindTo(_contextKeyService);
            this._hasRenameProvider = editorContextKeys_1.EditorContextKeys.hasRenameProvider.bindTo(_contextKeyService);
            this._hasSignatureHelpProvider = editorContextKeys_1.EditorContextKeys.hasSignatureHelpProvider.bindTo(_contextKeyService);
            this._hasInlayHintsProvider = editorContextKeys_1.EditorContextKeys.hasInlayHintsProvider.bindTo(_contextKeyService);
            this._hasDocumentFormattingProvider = editorContextKeys_1.EditorContextKeys.hasDocumentFormattingProvider.bindTo(_contextKeyService);
            this._hasDocumentSelectionFormattingProvider = editorContextKeys_1.EditorContextKeys.hasDocumentSelectionFormattingProvider.bindTo(_contextKeyService);
            this._hasMultipleDocumentFormattingProvider = editorContextKeys_1.EditorContextKeys.hasMultipleDocumentFormattingProvider.bindTo(_contextKeyService);
            this._hasMultipleDocumentSelectionFormattingProvider = editorContextKeys_1.EditorContextKeys.hasMultipleDocumentSelectionFormattingProvider.bindTo(_contextKeyService);
            this._isInWalkThrough = editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.bindTo(_contextKeyService);
            const update = () => this._update();
            // update when model/mode changes
            this._register(_editor.onDidChangeModel(update));
            this._register(_editor.onDidChangeModelLanguage(update));
            // update when registries change
            this._register(_languageFeaturesService.completionProvider.onDidChange(update));
            this._register(_languageFeaturesService.codeActionProvider.onDidChange(update));
            this._register(_languageFeaturesService.codeLensProvider.onDidChange(update));
            this._register(_languageFeaturesService.definitionProvider.onDidChange(update));
            this._register(_languageFeaturesService.declarationProvider.onDidChange(update));
            this._register(_languageFeaturesService.implementationProvider.onDidChange(update));
            this._register(_languageFeaturesService.typeDefinitionProvider.onDidChange(update));
            this._register(_languageFeaturesService.hoverProvider.onDidChange(update));
            this._register(_languageFeaturesService.documentHighlightProvider.onDidChange(update));
            this._register(_languageFeaturesService.documentSymbolProvider.onDidChange(update));
            this._register(_languageFeaturesService.referenceProvider.onDidChange(update));
            this._register(_languageFeaturesService.renameProvider.onDidChange(update));
            this._register(_languageFeaturesService.documentFormattingEditProvider.onDidChange(update));
            this._register(_languageFeaturesService.documentRangeFormattingEditProvider.onDidChange(update));
            this._register(_languageFeaturesService.signatureHelpProvider.onDidChange(update));
            this._register(_languageFeaturesService.inlayHintsProvider.onDidChange(update));
            update();
        }
        dispose() {
            super.dispose();
        }
        reset() {
            this._contextKeyService.bufferChangeEvents(() => {
                this._langId.reset();
                this._hasCompletionItemProvider.reset();
                this._hasCodeActionsProvider.reset();
                this._hasCodeLensProvider.reset();
                this._hasDefinitionProvider.reset();
                this._hasDeclarationProvider.reset();
                this._hasImplementationProvider.reset();
                this._hasTypeDefinitionProvider.reset();
                this._hasHoverProvider.reset();
                this._hasDocumentHighlightProvider.reset();
                this._hasDocumentSymbolProvider.reset();
                this._hasReferenceProvider.reset();
                this._hasRenameProvider.reset();
                this._hasDocumentFormattingProvider.reset();
                this._hasDocumentSelectionFormattingProvider.reset();
                this._hasSignatureHelpProvider.reset();
                this._isInWalkThrough.reset();
            });
        }
        _update() {
            const model = this._editor.getModel();
            if (!model) {
                this.reset();
                return;
            }
            this._contextKeyService.bufferChangeEvents(() => {
                this._langId.set(model.getLanguageId());
                this._hasCompletionItemProvider.set(this._languageFeaturesService.completionProvider.has(model));
                this._hasCodeActionsProvider.set(this._languageFeaturesService.codeActionProvider.has(model));
                this._hasCodeLensProvider.set(this._languageFeaturesService.codeLensProvider.has(model));
                this._hasDefinitionProvider.set(this._languageFeaturesService.definitionProvider.has(model));
                this._hasDeclarationProvider.set(this._languageFeaturesService.declarationProvider.has(model));
                this._hasImplementationProvider.set(this._languageFeaturesService.implementationProvider.has(model));
                this._hasTypeDefinitionProvider.set(this._languageFeaturesService.typeDefinitionProvider.has(model));
                this._hasHoverProvider.set(this._languageFeaturesService.hoverProvider.has(model));
                this._hasDocumentHighlightProvider.set(this._languageFeaturesService.documentHighlightProvider.has(model));
                this._hasDocumentSymbolProvider.set(this._languageFeaturesService.documentSymbolProvider.has(model));
                this._hasReferenceProvider.set(this._languageFeaturesService.referenceProvider.has(model));
                this._hasRenameProvider.set(this._languageFeaturesService.renameProvider.has(model));
                this._hasSignatureHelpProvider.set(this._languageFeaturesService.signatureHelpProvider.has(model));
                this._hasInlayHintsProvider.set(this._languageFeaturesService.inlayHintsProvider.has(model));
                this._hasDocumentFormattingProvider.set(this._languageFeaturesService.documentFormattingEditProvider.has(model) || this._languageFeaturesService.documentRangeFormattingEditProvider.has(model));
                this._hasDocumentSelectionFormattingProvider.set(this._languageFeaturesService.documentRangeFormattingEditProvider.has(model));
                this._hasMultipleDocumentFormattingProvider.set(this._languageFeaturesService.documentFormattingEditProvider.all(model).length + this._languageFeaturesService.documentRangeFormattingEditProvider.all(model).length > 1);
                this._hasMultipleDocumentSelectionFormattingProvider.set(this._languageFeaturesService.documentRangeFormattingEditProvider.all(model).length > 1);
                this._isInWalkThrough.set(model.uri.scheme === network_1.Schemas.walkThroughSnippet);
            });
        }
    }
    exports.EditorModeContext = EditorModeContext;
    class CodeEditorWidgetFocusTracker extends lifecycle_1.Disposable {
        constructor(domElement, overflowWidgetsDomNode) {
            super();
            this._onChange = this._register(new event_1.Emitter());
            this.onChange = this._onChange.event;
            this._hadFocus = undefined;
            this._hasDomElementFocus = false;
            this._domFocusTracker = this._register(dom.trackFocus(domElement));
            this._overflowWidgetsDomNodeHasFocus = false;
            this._register(this._domFocusTracker.onDidFocus(() => {
                this._hasDomElementFocus = true;
                this._update();
            }));
            this._register(this._domFocusTracker.onDidBlur(() => {
                this._hasDomElementFocus = false;
                this._update();
            }));
            if (overflowWidgetsDomNode) {
                this._overflowWidgetsDomNode = this._register(dom.trackFocus(overflowWidgetsDomNode));
                this._register(this._overflowWidgetsDomNode.onDidFocus(() => {
                    this._overflowWidgetsDomNodeHasFocus = true;
                    this._update();
                }));
                this._register(this._overflowWidgetsDomNode.onDidBlur(() => {
                    this._overflowWidgetsDomNodeHasFocus = false;
                    this._update();
                }));
            }
        }
        _update() {
            const focused = this._hasDomElementFocus || this._overflowWidgetsDomNodeHasFocus;
            if (this._hadFocus !== focused) {
                this._hadFocus = focused;
                this._onChange.fire(undefined);
            }
        }
        hasFocus() {
            return this._hadFocus ?? false;
        }
        refreshState() {
            this._domFocusTracker.refreshState();
            this._overflowWidgetsDomNode?.refreshState?.();
        }
    }
    class EditorDecorationsCollection {
        get length() {
            return this._decorationIds.length;
        }
        constructor(_editor, decorations) {
            this._editor = _editor;
            this._decorationIds = [];
            this._isChangingDecorations = false;
            if (Array.isArray(decorations) && decorations.length > 0) {
                this.set(decorations);
            }
        }
        onDidChange(listener, thisArgs, disposables) {
            return this._editor.onDidChangeModelDecorations((e) => {
                if (this._isChangingDecorations) {
                    return;
                }
                listener.call(thisArgs, e);
            }, disposables);
        }
        getRange(index) {
            if (!this._editor.hasModel()) {
                return null;
            }
            if (index >= this._decorationIds.length) {
                return null;
            }
            return this._editor.getModel().getDecorationRange(this._decorationIds[index]);
        }
        getRanges() {
            if (!this._editor.hasModel()) {
                return [];
            }
            const model = this._editor.getModel();
            const result = [];
            for (const decorationId of this._decorationIds) {
                const range = model.getDecorationRange(decorationId);
                if (range) {
                    result.push(range);
                }
            }
            return result;
        }
        has(decoration) {
            return this._decorationIds.includes(decoration.id);
        }
        clear() {
            if (this._decorationIds.length === 0) {
                // nothing to do
                return;
            }
            this.set([]);
        }
        set(newDecorations) {
            try {
                this._isChangingDecorations = true;
                this._editor.changeDecorations((accessor) => {
                    this._decorationIds = accessor.deltaDecorations(this._decorationIds, newDecorations);
                });
            }
            finally {
                this._isChangingDecorations = false;
            }
            return this._decorationIds;
        }
        append(newDecorations) {
            let newDecorationIds = [];
            try {
                this._isChangingDecorations = true;
                this._editor.changeDecorations((accessor) => {
                    newDecorationIds = accessor.deltaDecorations([], newDecorations);
                    this._decorationIds = this._decorationIds.concat(newDecorationIds);
                });
            }
            finally {
                this._isChangingDecorations = false;
            }
            return newDecorationIds;
        }
    }
    const squigglyStart = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 3' enable-background='new 0 0 6 3' height='3' width='6'><g fill='`);
    const squigglyEnd = encodeURIComponent(`'><polygon points='5.5,0 2.5,3 1.1,3 4.1,0'/><polygon points='4,0 6,2 6,0.6 5.4,0'/><polygon points='0,2 1,3 2.4,3 0,0.6'/></g></svg>`);
    function getSquigglySVGData(color) {
        return squigglyStart + encodeURIComponent(color.toString()) + squigglyEnd;
    }
    const dotdotdotStart = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" height="3" width="12"><g fill="`);
    const dotdotdotEnd = encodeURIComponent(`"><circle cx="1" cy="1" r="1"/><circle cx="5" cy="1" r="1"/><circle cx="9" cy="1" r="1"/></g></svg>`);
    function getDotDotDotSVGData(color) {
        return dotdotdotStart + encodeURIComponent(color.toString()) + dotdotdotEnd;
    }
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const errorForeground = theme.getColor(colorRegistry_1.editorErrorForeground);
        if (errorForeground) {
            collector.addRule(`.monaco-editor .${"squiggly-error" /* ClassName.EditorErrorDecoration */} { background: url("data:image/svg+xml,${getSquigglySVGData(errorForeground)}") repeat-x bottom left; }`);
        }
        const warningForeground = theme.getColor(colorRegistry_1.editorWarningForeground);
        if (warningForeground) {
            collector.addRule(`.monaco-editor .${"squiggly-warning" /* ClassName.EditorWarningDecoration */} { background: url("data:image/svg+xml,${getSquigglySVGData(warningForeground)}") repeat-x bottom left; }`);
        }
        const infoForeground = theme.getColor(colorRegistry_1.editorInfoForeground);
        if (infoForeground) {
            collector.addRule(`.monaco-editor .${"squiggly-info" /* ClassName.EditorInfoDecoration */} { background: url("data:image/svg+xml,${getSquigglySVGData(infoForeground)}") repeat-x bottom left; }`);
        }
        const hintForeground = theme.getColor(colorRegistry_1.editorHintForeground);
        if (hintForeground) {
            collector.addRule(`.monaco-editor .${"squiggly-hint" /* ClassName.EditorHintDecoration */} { background: url("data:image/svg+xml,${getDotDotDotSVGData(hintForeground)}") no-repeat bottom left; }`);
        }
        const unnecessaryForeground = theme.getColor(editorColorRegistry_1.editorUnnecessaryCodeOpacity);
        if (unnecessaryForeground) {
            collector.addRule(`.monaco-editor.showUnused .${"squiggly-inline-unnecessary" /* ClassName.EditorUnnecessaryInlineDecoration */} { opacity: ${unnecessaryForeground.rgba.a}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUVkaXRvcldpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvd2lkZ2V0L2NvZGVFZGl0b3JXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTREaEcsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBd0JsQixNQUFNLFNBQVM7UUFDZCxZQUNpQixLQUFpQixFQUNqQixTQUFvQixFQUNwQixJQUFVLEVBQ1YsV0FBb0IsRUFDcEIsaUJBQWdDLEVBQ2hDLFlBQTJCO1lBTDNCLFVBQUssR0FBTCxLQUFLLENBQVk7WUFDakIsY0FBUyxHQUFULFNBQVMsQ0FBVztZQUNwQixTQUFJLEdBQUosSUFBSSxDQUFNO1lBQ1YsZ0JBQVcsR0FBWCxXQUFXLENBQVM7WUFDcEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFlO1lBQ2hDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1FBRTVDLENBQUM7UUFFTSxPQUFPO1lBQ2IsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQy9DLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3JCLENBQUM7WUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLENBQUM7S0FDRDtJQUVNLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWlCLFNBQVEsc0JBQVU7O2lCQUV2QixvQ0FBK0IsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7WUFDekYsV0FBVyxFQUFFLHNCQUFzQjtZQUNuQyxTQUFTLEVBQUUs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