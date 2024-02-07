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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/common/core/editorColorRegistry", "vs/editor/common/editorContextKeys", "vs/editor/common/model", "vs/editor/contrib/find/browser/findModel", "vs/editor/contrib/find/browser/findOptionsWidget", "vs/editor/contrib/find/browser/findState", "vs/editor/contrib/find/browser/findWidget", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService"], function (require, exports, async_1, lifecycle_1, strings, editorExtensions_1, editorColorRegistry_1, editorContextKeys_1, model_1, findModel_1, findOptionsWidget_1, findState_1, findWidget_1, nls, actions_1, clipboardService_1, contextkey_1, contextView_1, keybinding_1, notification_1, quickInput_1, storage_1, themeService_1) {
    "use strict";
    var CommonFindController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StartFindReplaceAction = exports.PreviousSelectionMatchFindAction = exports.NextSelectionMatchFindAction = exports.SelectionMatchFindAction = exports.MoveToMatchFindAction = exports.PreviousMatchFindAction = exports.NextMatchFindAction = exports.MatchFindAction = exports.StartFindWithSelectionAction = exports.StartFindWithArgsAction = exports.StartFindAction = exports.FindController = exports.CommonFindController = exports.FindStartFocusAction = exports.getSelectionSearchString = void 0;
    const SEARCH_STRING_MAX_LENGTH = 524288;
    function getSelectionSearchString(editor, seedSearchStringFromSelection = 'single', seedSearchStringFromNonEmptySelection = false) {
        if (!editor.hasModel()) {
            return null;
        }
        const selection = editor.getSelection();
        // if selection spans multiple lines, default search string to empty
        if ((seedSearchStringFromSelection === 'single' && selection.startLineNumber === selection.endLineNumber)
            || seedSearchStringFromSelection === 'multiple') {
            if (selection.isEmpty()) {
                const wordAtPosition = editor.getConfiguredWordAtPosition(selection.getStartPosition());
                if (wordAtPosition && (false === seedSearchStringFromNonEmptySelection)) {
                    return wordAtPosition.word;
                }
            }
            else {
                if (editor.getModel().getValueLengthInRange(selection) < SEARCH_STRING_MAX_LENGTH) {
                    return editor.getModel().getValueInRange(selection);
                }
            }
        }
        return null;
    }
    exports.getSelectionSearchString = getSelectionSearchString;
    var FindStartFocusAction;
    (function (FindStartFocusAction) {
        FindStartFocusAction[FindStartFocusAction["NoFocusChange"] = 0] = "NoFocusChange";
        FindStartFocusAction[FindStartFocusAction["FocusFindInput"] = 1] = "FocusFindInput";
        FindStartFocusAction[FindStartFocusAction["FocusReplaceInput"] = 2] = "FocusReplaceInput";
    })(FindStartFocusAction || (exports.FindStartFocusAction = FindStartFocusAction = {}));
    let CommonFindController = class CommonFindController extends lifecycle_1.Disposable {
        static { CommonFindController_1 = this; }
        static { this.ID = 'editor.contrib.findController'; }
        get editor() {
            return this._editor;
        }
        static get(editor) {
            return editor.getContribution(CommonFindController_1.ID);
        }
        constructor(editor, contextKeyService, storageService, clipboardService, notificationService) {
            super();
            this._editor = editor;
            this._findWidgetVisible = findModel_1.CONTEXT_FIND_WIDGET_VISIBLE.bindTo(contextKeyService);
            this._contextKeyService = contextKeyService;
            this._storageService = storageService;
            this._clipboardService = clipboardService;
            this._notificationService = notificationService;
            this._updateHistoryDelayer = new async_1.Delayer(500);
            this._state = this._register(new findState_1.FindReplaceState());
            this.loadQueryState();
            this._register(this._state.onFindReplaceStateChange((e) => this._onStateChanged(e)));
            this._model = null;
            this._register(this._editor.onDidChangeModel(() => {
                const shouldRestartFind = (this._editor.getModel() && this._state.isRevealed);
                this.disposeModel();
                this._state.change({
                    searchScope: null,
                    matchCase: this._storageService.getBoolean('editor.matchCase', 1 /* StorageScope.WORKSPACE */, false),
                    wholeWord: this._storageService.getBoolean('editor.wholeWord', 1 /* StorageScope.WORKSPACE */, false),
                    isRegex: this._storageService.getBoolean('editor.isRegex', 1 /* StorageScope.WORKSPACE */, false),
                    preserveCase: this._storageService.getBoolean('editor.preserveCase', 1 /* StorageScope.WORKSPACE */, false)
                }, false);
                if (shouldRestartFind) {
                    this._start({
                        forceRevealReplace: false,
                        seedSearchStringFromSelection: 'none',
                        seedSearchStringFromNonEmptySelection: false,
                        seedSearchStringFromGlobalClipboard: false,
                        shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                        shouldAnimate: false,
                        updateSearchScope: false,
                        loop: this._editor.getOption(41 /* EditorOption.find */).loop
                    });
                }
            }));
        }
        dispose() {
            this.disposeModel();
            super.dispose();
        }
        disposeModel() {
            if (this._model) {
                this._model.dispose();
                this._model = null;
            }
        }
        _onStateChanged(e) {
            this.saveQueryState(e);
            if (e.isRevealed) {
                if (this._state.isRevealed) {
                    this._findWidgetVisible.set(true);
                }
                else {
                    this._findWidgetVisible.reset();
                    this.disposeModel();
                }
            }
            if (e.searchString) {
                this.setGlobalBufferTerm(this._state.searchString);
            }
        }
        saveQueryState(e) {
            if (e.isRegex) {
                this._storageService.store('editor.isRegex', this._state.actualIsRegex, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            if (e.wholeWord) {
                this._storageService.store('editor.wholeWord', this._state.actualWholeWord, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            if (e.matchCase) {
                this._storageService.store('editor.matchCase', this._state.actualMatchCase, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            if (e.preserveCase) {
                this._storageService.store('editor.preserveCase', this._state.actualPreserveCase, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        loadQueryState() {
            this._state.change({
                matchCase: this._storageService.getBoolean('editor.matchCase', 1 /* StorageScope.WORKSPACE */, this._state.matchCase),
                wholeWord: this._storageService.getBoolean('editor.wholeWord', 1 /* StorageScope.WORKSPACE */, this._state.wholeWord),
                isRegex: this._storageService.getBoolean('editor.isRegex', 1 /* StorageScope.WORKSPACE */, this._state.isRegex),
                preserveCase: this._storageService.getBoolean('editor.preserveCase', 1 /* StorageScope.WORKSPACE */, this._state.preserveCase)
            }, false);
        }
        isFindInputFocused() {
            return !!findModel_1.CONTEXT_FIND_INPUT_FOCUSED.getValue(this._contextKeyService);
        }
        getState() {
            return this._state;
        }
        closeFindWidget() {
            this._state.change({
                isRevealed: false,
                searchScope: null
            }, false);
            this._editor.focus();
        }
        toggleCaseSensitive() {
            this._state.change({ matchCase: !this._state.matchCase }, false);
            if (!this._state.isRevealed) {
                this.highlightFindOptions();
            }
        }
        toggleWholeWords() {
            this._state.change({ wholeWord: !this._state.wholeWord }, false);
            if (!this._state.isRevealed) {
                this.highlightFindOptions();
            }
        }
        toggleRegex() {
            this._state.change({ isRegex: !this._state.isRegex }, false);
            if (!this._state.isRevealed) {
                this.highlightFindOptions();
            }
        }
        togglePreserveCase() {
            this._state.change({ preserveCase: !this._state.preserveCase }, false);
            if (!this._state.isRevealed) {
                this.highlightFindOptions();
            }
        }
        toggleSearchScope() {
            if (this._state.searchScope) {
                this._state.change({ searchScope: null }, true);
            }
            else {
                if (this._editor.hasModel()) {
                    const selections = this._editor.getSelections();
                    selections.map(selection => {
                        if (selection.endColumn === 1 && selection.endLineNumber > selection.startLineNumber) {
                            selection = selection.setEndPosition(selection.endLineNumber - 1, this._editor.getModel().getLineMaxColumn(selection.endLineNumber - 1));
                        }
                        if (!selection.isEmpty()) {
                            return selection;
                        }
                        return null;
                    }).filter(element => !!element);
                    if (selections.length) {
                        this._state.change({ searchScope: selections }, true);
                    }
                }
            }
        }
        setSearchString(searchString) {
            if (this._state.isRegex) {
                searchString = strings.escapeRegExpCharacters(searchString);
            }
            this._state.change({ searchString: searchString }, false);
        }
        highlightFindOptions(ignoreWhenVisible = false) {
            // overwritten in subclass
        }
        async _start(opts, newState) {
            this.disposeModel();
            if (!this._editor.hasModel()) {
                // cannot do anything with an editor that doesn't have a model...
                return;
            }
            const stateChanges = {
                ...newState,
                isRevealed: true
            };
            if (opts.seedSearchStringFromSelection === 'single') {
                const selectionSearchString = getSelectionSearchString(this._editor, opts.seedSearchStringFromSelection, opts.seedSearchStringFromNonEmptySelection);
                if (selectionSearchString) {
                    if (this._state.isRegex) {
                        stateChanges.searchString = strings.escapeRegExpCharacters(selectionSearchString);
                    }
                    else {
                        stateChanges.searchString = selectionSearchString;
                    }
                }
            }
            else if (opts.seedSearchStringFromSelection === 'multiple' && !opts.updateSearchScope) {
                const selectionSearchString = getSelectionSearchString(this._editor, opts.seedSearchStringFromSelection);
                if (selectionSearchString) {
                    stateChanges.searchString = selectionSearchString;
                }
            }
            if (!stateChanges.searchString && opts.seedSearchStringFromGlobalClipboard) {
                const selectionSearchString = await this.getGlobalBufferTerm();
                if (!this._editor.hasModel()) {
                    // the editor has lost its model in the meantime
                    return;
                }
                if (selectionSearchString) {
                    stateChanges.searchString = selectionSearchString;
                }
            }
            // Overwrite isReplaceRevealed
            if (opts.forceRevealReplace || stateChanges.isReplaceRevealed) {
                stateChanges.isReplaceRevealed = true;
            }
            else if (!this._findWidgetVisible.get()) {
                stateChanges.isReplaceRevealed = false;
            }
            if (opts.updateSearchScope) {
                const currentSelections = this._editor.getSelections();
                if (currentSelections.some(selection => !selection.isEmpty())) {
                    stateChanges.searchScope = currentSelections;
                }
            }
            stateChanges.loop = opts.loop;
            this._state.change(stateChanges, false);
            if (!this._model) {
                this._model = new findModel_1.FindModelBoundToEditorModel(this._editor, this._state);
            }
        }
        start(opts, newState) {
            return this._start(opts, newState);
        }
        moveToNextMatch() {
            if (this._model) {
                this._model.moveToNextMatch();
                return true;
            }
            return false;
        }
        moveToPrevMatch() {
            if (this._model) {
                this._model.moveToPrevMatch();
                return true;
            }
            return false;
        }
        goToMatch(index) {
            if (this._model) {
                this._model.moveToMatch(index);
                return true;
            }
            return false;
        }
        replace() {
            if (this._model) {
                this._model.replace();
                return true;
            }
            return false;
        }
        replaceAll() {
            if (this._model) {
                if (this._editor.getModel()?.isTooLargeForHeapOperation()) {
                    this._notificationService.warn(nls.localize('too.large.for.replaceall', "The file is too large to perform a replace all operation."));
                    return false;
                }
                this._model.replaceAll();
                return true;
            }
            return false;
        }
        selectAllMatches() {
            if (this._model) {
                this._model.selectAllMatches();
                this._editor.focus();
                return true;
            }
            return false;
        }
        async getGlobalBufferTerm() {
            if (this._editor.getOption(41 /* EditorOption.find */).globalFindClipboard
                && this._editor.hasModel()
                && !this._editor.getModel().isTooLargeForSyncing()) {
                return this._clipboardService.readFindText();
            }
            return '';
        }
        setGlobalBufferTerm(text) {
            if (this._editor.getOption(41 /* EditorOption.find */).globalFindClipboard
                && this._editor.hasModel()
                && !this._editor.getModel().isTooLargeForSyncing()) {
                // intentionally not awaited
                this._clipboardService.writeFindText(text);
            }
        }
    };
    exports.CommonFindController = CommonFindController;
    exports.CommonFindController = CommonFindController = CommonFindController_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, storage_1.IStorageService),
        __param(3, clipboardService_1.IClipboardService),
        __param(4, notification_1.INotificationService)
    ], CommonFindController);
    let FindController = class FindController extends CommonFindController {
        constructor(editor, _contextViewService, _contextKeyService, _keybindingService, _themeService, notificationService, _storageService, clipboardService) {
            super(editor, _contextKeyService, _storageService, clipboardService, notificationService);
            this._contextViewService = _contextViewService;
            this._keybindingService = _keybindingService;
            this._themeService = _themeService;
            this._widget = null;
            this._findOptionsWidget = null;
        }
        async _start(opts, newState) {
            if (!this._widget) {
                this._createFindWidget();
            }
            const selection = this._editor.getSelection();
            let updateSearchScope = false;
            switch (this._editor.getOption(41 /* EditorOption.find */).autoFindInSelection) {
                case 'always':
                    updateSearchScope = true;
                    break;
                case 'never':
                    updateSearchScope = false;
                    break;
                case 'multiline': {
                    const isSelectionMultipleLine = !!selection && selection.startLineNumber !== selection.endLineNumber;
                    updateSearchScope = isSelectionMultipleLine;
                    break;
                }
                default:
                    break;
            }
            opts.updateSearchScope = opts.updateSearchScope || updateSearchScope;
            await super._start(opts, newState);
            if (this._widget) {
                if (opts.shouldFocus === 2 /* FindStartFocusAction.FocusReplaceInput */) {
                    this._widget.focusReplaceInput();
                }
                else if (opts.shouldFocus === 1 /* FindStartFocusAction.FocusFindInput */) {
                    this._widget.focusFindInput();
                }
            }
        }
        highlightFindOptions(ignoreWhenVisible = false) {
            if (!this._widget) {
                this._createFindWidget();
            }
            if (this._state.isRevealed && !ignoreWhenVisible) {
                this._widget.highlightFindOptions();
            }
            else {
                this._findOptionsWidget.highlightFindOptions();
            }
        }
        _createFindWidget() {
            this._widget = this._register(new findWidget_1.FindWidget(this._editor, this, this._state, this._contextViewService, this._keybindingService, this._contextKeyService, this._themeService, this._storageService, this._notificationService));
            this._findOptionsWidget = this._register(new findOptionsWidget_1.FindOptionsWidget(this._editor, this._state, this._keybindingService));
        }
        saveViewState() {
            return this._widget?.getViewState();
        }
        restoreViewState(state) {
            this._widget?.setViewState(state);
        }
    };
    exports.FindController = FindController;
    exports.FindController = FindController = __decorate([
        __param(1, contextView_1.IContextViewService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, themeService_1.IThemeService),
        __param(5, notification_1.INotificationService),
        __param(6, storage_1.IStorageService),
        __param(7, clipboardService_1.IClipboardService)
    ], FindController);
    exports.StartFindAction = (0, editorExtensions_1.registerMultiEditorAction)(new editorExtensions_1.MultiEditorAction({
        id: findModel_1.FIND_IDS.StartFindAction,
        label: nls.localize('startFindAction', "Find"),
        alias: 'Find',
        precondition: contextkey_1.ContextKeyExpr.or(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.ContextKeyExpr.has('editorIsOpen')),
        kbOpts: {
            kbExpr: null,
            primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
            weight: 100 /* KeybindingWeight.EditorContrib */
        },
        menuOpts: {
            menuId: actions_1.MenuId.MenubarEditMenu,
            group: '3_find',
            title: nls.localize({ key: 'miFind', comment: ['&& denotes a mnemonic'] }, "&&Find"),
            order: 1
        }
    }));
    exports.StartFindAction.addImplementation(0, (accessor, editor, args) => {
        const controller = CommonFindController.get(editor);
        if (!controller) {
            return false;
        }
        return controller.start({
            forceRevealReplace: false,
            seedSearchStringFromSelection: editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection !== 'never' ? 'single' : 'none',
            seedSearchStringFromNonEmptySelection: editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection === 'selection',
            seedSearchStringFromGlobalClipboard: editor.getOption(41 /* EditorOption.find */).globalFindClipboard,
            shouldFocus: 1 /* FindStartFocusAction.FocusFindInput */,
            shouldAnimate: true,
            updateSearchScope: false,
            loop: editor.getOption(41 /* EditorOption.find */).loop
        });
    });
    const findArgDescription = {
        description: 'Open a new In-Editor Find Widget.',
        args: [{
                name: 'Open a new In-Editor Find Widget args',
                schema: {
                    properties: {
                        searchString: { type: 'string' },
                        replaceString: { type: 'string' },
                        isRegex: { type: 'boolean' },
                        matchWholeWord: { type: 'boolean' },
                        isCaseSensitive: { type: 'boolean' },
                        preserveCase: { type: 'boolean' },
                        findInSelection: { type: 'boolean' },
                    }
                }
            }]
    };
    class StartFindWithArgsAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.StartFindWithArgs,
                label: nls.localize('startFindWithArgsAction', "Find With Arguments"),
                alias: 'Find With Arguments',
                precondition: undefined,
                kbOpts: {
                    kbExpr: null,
                    primary: 0,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                metadata: findArgDescription
            });
        }
        async run(accessor, editor, args) {
            const controller = CommonFindController.get(editor);
            if (controller) {
                const newState = args ? {
                    searchString: args.searchString,
                    replaceString: args.replaceString,
                    isReplaceRevealed: args.replaceString !== undefined,
                    isRegex: args.isRegex,
                    // isRegexOverride: args.regexOverride,
                    wholeWord: args.matchWholeWord,
                    // wholeWordOverride: args.wholeWordOverride,
                    matchCase: args.isCaseSensitive,
                    // matchCaseOverride: args.matchCaseOverride,
                    preserveCase: args.preserveCase,
                    // preserveCaseOverride: args.preserveCaseOverride,
                } : {};
                await controller.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: (controller.getState().searchString.length === 0) && editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection !== 'never' ? 'single' : 'none',
                    seedSearchStringFromNonEmptySelection: editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection === 'selection',
                    seedSearchStringFromGlobalClipboard: true,
                    shouldFocus: 1 /* FindStartFocusAction.FocusFindInput */,
                    shouldAnimate: true,
                    updateSearchScope: args?.findInSelection || false,
                    loop: editor.getOption(41 /* EditorOption.find */).loop
                }, newState);
                controller.setGlobalBufferTerm(controller.getState().searchString);
            }
        }
    }
    exports.StartFindWithArgsAction = StartFindWithArgsAction;
    class StartFindWithSelectionAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.StartFindWithSelection,
                label: nls.localize('startFindWithSelectionAction', "Find With Selection"),
                alias: 'Find With Selection',
                precondition: undefined,
                kbOpts: {
                    kbExpr: null,
                    primary: 0,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */,
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(accessor, editor) {
            const controller = CommonFindController.get(editor);
            if (controller) {
                await controller.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: 'multiple',
                    seedSearchStringFromNonEmptySelection: false,
                    seedSearchStringFromGlobalClipboard: false,
                    shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                    shouldAnimate: true,
                    updateSearchScope: false,
                    loop: editor.getOption(41 /* EditorOption.find */).loop
                });
                controller.setGlobalBufferTerm(controller.getState().searchString);
            }
        }
    }
    exports.StartFindWithSelectionAction = StartFindWithSelectionAction;
    class MatchFindAction extends editorExtensions_1.EditorAction {
        async run(accessor, editor) {
            const controller = CommonFindController.get(editor);
            if (controller && !this._run(controller)) {
                await controller.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: (controller.getState().searchString.length === 0) && editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection !== 'never' ? 'single' : 'none',
                    seedSearchStringFromNonEmptySelection: editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection === 'selection',
                    seedSearchStringFromGlobalClipboard: true,
                    shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                    shouldAnimate: true,
                    updateSearchScope: false,
                    loop: editor.getOption(41 /* EditorOption.find */).loop
                });
                this._run(controller);
            }
        }
    }
    exports.MatchFindAction = MatchFindAction;
    class NextMatchFindAction extends MatchFindAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.NextMatchFindAction,
                label: nls.localize('findNextMatchAction', "Find Next"),
                alias: 'Find Next',
                precondition: undefined,
                kbOpts: [{
                        kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                        primary: 61 /* KeyCode.F3 */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, secondary: [61 /* KeyCode.F3 */] },
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }, {
                        kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, findModel_1.CONTEXT_FIND_INPUT_FOCUSED),
                        primary: 3 /* KeyCode.Enter */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }]
            });
        }
        _run(controller) {
            const result = controller.moveToNextMatch();
            if (result) {
                controller.editor.pushUndoStop();
                return true;
            }
            return false;
        }
    }
    exports.NextMatchFindAction = NextMatchFindAction;
    class PreviousMatchFindAction extends MatchFindAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.PreviousMatchFindAction,
                label: nls.localize('findPreviousMatchAction', "Find Previous"),
                alias: 'Find Previous',
                precondition: undefined,
                kbOpts: [{
                        kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                        primary: 1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 37 /* KeyCode.KeyG */, secondary: [1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */] },
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }, {
                        kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, findModel_1.CONTEXT_FIND_INPUT_FOCUSED),
                        primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }
                ]
            });
        }
        _run(controller) {
            return controller.moveToPrevMatch();
        }
    }
    exports.PreviousMatchFindAction = PreviousMatchFindAction;
    class MoveToMatchFindAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.GoToMatchFindAction,
                label: nls.localize('findMatchAction.goToMatch', "Go to Match..."),
                alias: 'Go to Match...',
                precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE
            });
            this._highlightDecorations = [];
        }
        run(accessor, editor, args) {
            const controller = CommonFindController.get(editor);
            if (!controller) {
                return;
            }
            const matchesCount = controller.getState().matchesCount;
            if (matchesCount < 1) {
                const notificationService = accessor.get(notification_1.INotificationService);
                notificationService.notify({
                    severity: notification_1.Severity.Warning,
                    message: nls.localize('findMatchAction.noResults', "No matches. Try searching for something else.")
                });
                return;
            }
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const inputBox = quickInputService.createInputBox();
            inputBox.placeholder = nls.localize('findMatchAction.inputPlaceHolder', "Type a number to go to a specific match (between 1 and {0})", matchesCount);
            const toFindMatchIndex = (value) => {
                const index = parseInt(value);
                if (isNaN(index)) {
                    return undefined;
                }
                const matchCount = controller.getState().matchesCount;
                if (index > 0 && index <= matchCount) {
                    return index - 1; // zero based
                }
                else if (index < 0 && index >= -matchCount) {
                    return matchCount + index;
                }
                return undefined;
            };
            const updatePickerAndEditor = (value) => {
                const index = toFindMatchIndex(value);
                if (typeof index === 'number') {
                    // valid
                    inputBox.validationMessage = undefined;
                    controller.goToMatch(index);
                    const currentMatch = controller.getState().currentMatch;
                    if (currentMatch) {
                        this.addDecorations(editor, currentMatch);
                    }
                }
                else {
                    inputBox.validationMessage = nls.localize('findMatchAction.inputValidationMessage', "Please type a number between 1 and {0}", controller.getState().matchesCount);
                    this.clearDecorations(editor);
                }
            };
            inputBox.onDidChangeValue(value => {
                updatePickerAndEditor(value);
            });
            inputBox.onDidAccept(() => {
                const index = toFindMatchIndex(inputBox.value);
                if (typeof index === 'number') {
                    controller.goToMatch(index);
                    inputBox.hide();
                }
                else {
                    inputBox.validationMessage = nls.localize('findMatchAction.inputValidationMessage', "Please type a number between 1 and {0}", controller.getState().matchesCount);
                }
            });
            inputBox.onDidHide(() => {
                this.clearDecorations(editor);
                inputBox.dispose();
            });
            inputBox.show();
        }
        clearDecorations(editor) {
            editor.changeDecorations(changeAccessor => {
                this._highlightDecorations = changeAccessor.deltaDecorations(this._highlightDecorations, []);
            });
        }
        addDecorations(editor, range) {
            editor.changeDecorations(changeAccessor => {
                this._highlightDecorations = changeAccessor.deltaDecorations(this._highlightDecorations, [
                    {
                        range,
                        options: {
                            description: 'find-match-quick-access-range-highlight',
                            className: 'rangeHighlight',
                            isWholeLine: true
                        }
                    },
                    {
                        range,
                        options: {
                            description: 'find-match-quick-access-range-highlight-overview',
                            overviewRuler: {
                                color: (0, themeService_1.themeColorFromId)(editorColorRegistry_1.overviewRulerRangeHighlight),
                                position: model_1.OverviewRulerLane.Full
                            }
                        }
                    }
                ]);
            });
        }
    }
    exports.MoveToMatchFindAction = MoveToMatchFindAction;
    class SelectionMatchFindAction extends editorExtensions_1.EditorAction {
        async run(accessor, editor) {
            const controller = CommonFindController.get(editor);
            if (!controller) {
                return;
            }
            const selectionSearchString = getSelectionSearchString(editor, 'single', false);
            if (selectionSearchString) {
                controller.setSearchString(selectionSearchString);
            }
            if (!this._run(controller)) {
                await controller.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: 'none',
                    seedSearchStringFromNonEmptySelection: false,
                    seedSearchStringFromGlobalClipboard: false,
                    shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                    shouldAnimate: true,
                    updateSearchScope: false,
                    loop: editor.getOption(41 /* EditorOption.find */).loop
                });
                this._run(controller);
            }
        }
    }
    exports.SelectionMatchFindAction = SelectionMatchFindAction;
    class NextSelectionMatchFindAction extends SelectionMatchFindAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.NextSelectionMatchFindAction,
                label: nls.localize('nextSelectionMatchFindAction', "Find Next Selection"),
                alias: 'Find Next Selection',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 61 /* KeyCode.F3 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        _run(controller) {
            return controller.moveToNextMatch();
        }
    }
    exports.NextSelectionMatchFindAction = NextSelectionMatchFindAction;
    class PreviousSelectionMatchFindAction extends SelectionMatchFindAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.PreviousSelectionMatchFindAction,
                label: nls.localize('previousSelectionMatchFindAction', "Find Previous Selection"),
                alias: 'Find Previous Selection',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        _run(controller) {
            return controller.moveToPrevMatch();
        }
    }
    exports.PreviousSelectionMatchFindAction = PreviousSelectionMatchFindAction;
    exports.StartFindReplaceAction = (0, editorExtensions_1.registerMultiEditorAction)(new editorExtensions_1.MultiEditorAction({
        id: findModel_1.FIND_IDS.StartFindReplaceAction,
        label: nls.localize('startReplace', "Replace"),
        alias: 'Replace',
        precondition: contextkey_1.ContextKeyExpr.or(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.ContextKeyExpr.has('editorIsOpen')),
        kbOpts: {
            kbExpr: null,
            primary: 2048 /* KeyMod.CtrlCmd */ | 38 /* KeyCode.KeyH */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */ },
            weight: 100 /* KeybindingWeight.EditorContrib */
        },
        menuOpts: {
            menuId: actions_1.MenuId.MenubarEditMenu,
            group: '3_find',
            title: nls.localize({ key: 'miReplace', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
            order: 2
        }
    }));
    exports.StartFindReplaceAction.addImplementation(0, (accessor, editor, args) => {
        if (!editor.hasModel() || editor.getOption(90 /* EditorOption.readOnly */)) {
            return false;
        }
        const controller = CommonFindController.get(editor);
        if (!controller) {
            return false;
        }
        const currentSelection = editor.getSelection();
        const findInputFocused = controller.isFindInputFocused();
        // we only seed search string from selection when the current selection is single line and not empty,
        // + the find input is not focused
        const seedSearchStringFromSelection = !currentSelection.isEmpty()
            && currentSelection.startLineNumber === currentSelection.endLineNumber
            && (editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection !== 'never')
            && !findInputFocused;
        /*
        * if the existing search string in find widget is empty and we don't seed search string from selection, it means the Find Input is still empty, so we should focus the Find Input instead of Replace Input.
    
        * findInputFocused true -> seedSearchStringFromSelection false, FocusReplaceInput
        * findInputFocused false, seedSearchStringFromSelection true FocusReplaceInput
        * findInputFocused false seedSearchStringFromSelection false FocusFindInput
        */
        const shouldFocus = (findInputFocused || seedSearchStringFromSelection) ?
            2 /* FindStartFocusAction.FocusReplaceInput */ : 1 /* FindStartFocusAction.FocusFindInput */;
        return controller.start({
            forceRevealReplace: true,
            seedSearchStringFromSelection: seedSearchStringFromSelection ? 'single' : 'none',
            seedSearchStringFromNonEmptySelection: editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection === 'selection',
            seedSearchStringFromGlobalClipboard: editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection !== 'never',
            shouldFocus: shouldFocus,
            shouldAnimate: true,
            updateSearchScope: false,
            loop: editor.getOption(41 /* EditorOption.find */).loop
        });
    });
    (0, editorExtensions_1.registerEditorContribution)(CommonFindController.ID, FindController, 0 /* EditorContributionInstantiation.Eager */); // eager because it uses `saveViewState`/`restoreViewState`
    (0, editorExtensions_1.registerEditorAction)(StartFindWithArgsAction);
    (0, editorExtensions_1.registerEditorAction)(StartFindWithSelectionAction);
    (0, editorExtensions_1.registerEditorAction)(NextMatchFindAction);
    (0, editorExtensions_1.registerEditorAction)(PreviousMatchFindAction);
    (0, editorExtensions_1.registerEditorAction)(MoveToMatchFindAction);
    (0, editorExtensions_1.registerEditorAction)(NextSelectionMatchFindAction);
    (0, editorExtensions_1.registerEditorAction)(PreviousSelectionMatchFindAction);
    const FindCommand = editorExtensions_1.EditorCommand.bindToContribution(CommonFindController.get);
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.CloseFindWidgetCommand,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: x => x.closeFindWidget(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.ContextKeyExpr.not('isComposing')),
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ToggleCaseSensitiveCommand,
        precondition: undefined,
        handler: x => x.toggleCaseSensitive(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.ToggleCaseSensitiveKeybinding.primary,
            mac: findModel_1.ToggleCaseSensitiveKeybinding.mac,
            win: findModel_1.ToggleCaseSensitiveKeybinding.win,
            linux: findModel_1.ToggleCaseSensitiveKeybinding.linux
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ToggleWholeWordCommand,
        precondition: undefined,
        handler: x => x.toggleWholeWords(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.ToggleWholeWordKeybinding.primary,
            mac: findModel_1.ToggleWholeWordKeybinding.mac,
            win: findModel_1.ToggleWholeWordKeybinding.win,
            linux: findModel_1.ToggleWholeWordKeybinding.linux
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ToggleRegexCommand,
        precondition: undefined,
        handler: x => x.toggleRegex(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.ToggleRegexKeybinding.primary,
            mac: findModel_1.ToggleRegexKeybinding.mac,
            win: findModel_1.ToggleRegexKeybinding.win,
            linux: findModel_1.ToggleRegexKeybinding.linux
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ToggleSearchScopeCommand,
        precondition: undefined,
        handler: x => x.toggleSearchScope(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.ToggleSearchScopeKeybinding.primary,
            mac: findModel_1.ToggleSearchScopeKeybinding.mac,
            win: findModel_1.ToggleSearchScopeKeybinding.win,
            linux: findModel_1.ToggleSearchScopeKeybinding.linux
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.TogglePreserveCaseCommand,
        precondition: undefined,
        handler: x => x.togglePreserveCase(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.TogglePreserveCaseKeybinding.primary,
            mac: findModel_1.TogglePreserveCaseKeybinding.mac,
            win: findModel_1.TogglePreserveCaseKeybinding.win,
            linux: findModel_1.TogglePreserveCaseKeybinding.linux
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ReplaceOneAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: x => x.replace(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 22 /* KeyCode.Digit1 */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ReplaceOneAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: x => x.replace(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, findModel_1.CONTEXT_REPLACE_INPUT_FOCUSED),
            primary: 3 /* KeyCode.Enter */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ReplaceAllAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: x => x.replaceAll(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ReplaceAllAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: x => x.replaceAll(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, findModel_1.CONTEXT_REPLACE_INPUT_FOCUSED),
            primary: undefined,
            mac: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
            }
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.SelectAllMatchesAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: x => x.selectAllMatches(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
        }
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2ZpbmQvYnJvd3Nlci9maW5kQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBOEJoRyxNQUFNLHdCQUF3QixHQUFHLE1BQU0sQ0FBQztJQUV4QyxTQUFnQix3QkFBd0IsQ0FBQyxNQUFtQixFQUFFLGdDQUF1RCxRQUFRLEVBQUUsd0NBQWlELEtBQUs7UUFDcEwsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO1lBQ3hCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN4QyxvRUFBb0U7UUFFcEUsSUFBSSxDQUFDLDZCQUE2QixLQUFLLFFBQVEsSUFBSSxTQUFTLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQyxhQUFhLENBQUM7ZUFDckcsNkJBQTZCLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDbEQsSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztnQkFDekIsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7Z0JBQ3hGLElBQUksY0FBYyxJQUFJLENBQUMsS0FBSyxLQUFLLHFDQUFxQyxDQUFDLEVBQUUsQ0FBQztvQkFDekUsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDO2dCQUM1QixDQUFDO1lBQ0YsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxHQUFHLHdCQUF3QixFQUFFLENBQUM7b0JBQ25GLE9BQU8sTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDckQsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBdkJELDREQXVCQztJQUVELElBQWtCLG9CQUlqQjtJQUpELFdBQWtCLG9CQUFvQjtRQUNyQyxpRkFBYSxDQUFBO1FBQ2IsbUZBQWMsQ0FBQTtRQUNkLHlGQUFpQixDQUFBO0lBQ2xCLENBQUMsRUFKaUIsb0JBQW9CLG9DQUFwQixvQkFBb0IsUUFJckM7SUF1Qk0sSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSxzQkFBVTs7aUJBRTVCLE9BQUUsR0FBRywrQkFBK0IsQUFBbEMsQ0FBbUM7UUFZNUQsSUFBSSxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JCLENBQUM7UUFFTSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQW1CO1lBQ3BDLE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBdUIsc0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVELFlBQ0MsTUFBbUIsRUFDQyxpQkFBcUMsRUFDeEMsY0FBK0IsRUFDN0IsZ0JBQW1DLEVBQ2hDLG1CQUF5QztZQUUvRCxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyx1Q0FBMkIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsa0JBQWtCLEdBQUcsaUJBQWlCLENBQUM7WUFDNUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7WUFDdEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1lBQzFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQztZQUVoRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxlQUFPLENBQU8sR0FBRyxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNEJBQWdCLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXJGLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBRW5CLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pELE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRTlFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFFcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7b0JBQ2xCLFdBQVcsRUFBRSxJQUFJO29CQUNqQixTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLGtDQUEwQixLQUFLLENBQUM7b0JBQzdGLFNBQVMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0Isa0NBQTBCLEtBQUssQ0FBQztvQkFDN0YsT0FBTyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLGdCQUFnQixrQ0FBMEIsS0FBSyxDQUFDO29CQUN6RixZQUFZLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMscUJBQXFCLGtDQUEwQixLQUFLLENBQUM7aUJBQ25HLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRVYsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO29CQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDO3dCQUNYLGtCQUFrQixFQUFFLEtBQUs7d0JBQ3pCLDZCQUE2QixFQUFFLE1BQU07d0JBQ3JDLHFDQUFxQyxFQUFFLEtBQUs7d0JBQzVDLG1DQUFtQyxFQUFFLEtBQUs7d0JBQzFDLFdBQVcsNENBQW9DO3dCQUMvQyxhQUFhLEVBQUUsS0FBSzt3QkFDcEIsaUJBQWlCLEVBQUUsS0FBSzt3QkFDeEIsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyxJQUFJO3FCQUNwRCxDQUFDLENBQUM7Z0JBQ0osQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRWUsT0FBTztZQUN0QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDcEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFTyxZQUFZO1lBQ25CLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNwQixDQUFDO1FBQ0YsQ0FBQztRQUVPLGVBQWUsQ0FBQyxDQUErQjtZQUN0RCxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXZCLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNsQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzVCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2hDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDckIsQ0FBQztZQUNGLENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDcEQsQ0FBQztRQUNGLENBQUM7UUFFTyxjQUFjLENBQUMsQ0FBK0I7WUFDckQsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLGdFQUFnRCxDQUFDO1lBQ3hILENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLGdFQUFnRCxDQUFDO1lBQzVILENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLGdFQUFnRCxDQUFDO1lBQzVILENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsZ0VBQWdELENBQUM7WUFDbEksQ0FBQztRQUNGLENBQUM7UUFFTyxjQUFjO1lBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNsQixTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLGtDQUEwQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztnQkFDN0csU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLGtCQUFrQixrQ0FBMEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7Z0JBQzdHLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0Isa0NBQTBCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO2dCQUN2RyxZQUFZLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMscUJBQXFCLGtDQUEwQixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQzthQUN0SCxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQUVNLGtCQUFrQjtZQUN4QixPQUFPLENBQUMsQ0FBQyxzQ0FBMEIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVNLFFBQVE7WUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEIsQ0FBQztRQUVNLGVBQWU7WUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ2xCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixXQUFXLEVBQUUsSUFBSTthQUNqQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRU0sbUJBQW1CO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDN0IsQ0FBQztRQUNGLENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM3QixDQUFDO1FBQ0YsQ0FBQztRQUVNLFdBQVc7WUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM3QixDQUFDO1FBQ0YsQ0FBQztRQUVNLGtCQUFrQjtZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzdCLENBQUM7UUFDRixDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDakQsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO29CQUM3QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUNoRCxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUMxQixJQUFJLFNBQVMsQ0FBQyxTQUFTLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDLGVBQWUsRUFBRSxDQUFDOzRCQUN0RixTQUFTLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FDbkMsU0FBUyxDQUFDLGFBQWEsR0FBRyxDQUFDLEVBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFHLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FDdEUsQ0FBQzt3QkFDSCxDQUFDO3dCQUNELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQzs0QkFDMUIsT0FBTyxTQUFTLENBQUM7d0JBQ2xCLENBQUM7d0JBQ0QsT0FBTyxJQUFJLENBQUM7b0JBQ2IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUVoQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3ZELENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRU0sZUFBZSxDQUFDLFlBQW9CO1lBQzFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDekIsWUFBWSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM3RCxDQUFDO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVNLG9CQUFvQixDQUFDLG9CQUE2QixLQUFLO1lBQzdELDBCQUEwQjtRQUMzQixDQUFDO1FBRVMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUF1QixFQUFFLFFBQStCO1lBQzlFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUVwQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO2dCQUM5QixpRUFBaUU7Z0JBQ2pFLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxZQUFZLEdBQXlCO2dCQUMxQyxHQUFHLFFBQVE7Z0JBQ1gsVUFBVSxFQUFFLElBQUk7YUFDaEIsQ0FBQztZQUVGLElBQUksSUFBSSxDQUFDLDZCQUE2QixLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUNyRCxNQUFNLHFCQUFxQixHQUFHLHdCQUF3QixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO2dCQUNySixJQUFJLHFCQUFxQixFQUFFLENBQUM7b0JBQzNCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDekIsWUFBWSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMscUJBQXFCLENBQUMsQ0FBQztvQkFDbkYsQ0FBQzt5QkFBTSxDQUFDO3dCQUNQLFlBQVksQ0FBQyxZQUFZLEdBQUcscUJBQXFCLENBQUM7b0JBQ25ELENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7aUJBQU0sSUFBSSxJQUFJLENBQUMsNkJBQTZCLEtBQUssVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3pGLE1BQU0scUJBQXFCLEdBQUcsd0JBQXdCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztnQkFDekcsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO29CQUMzQixZQUFZLENBQUMsWUFBWSxHQUFHLHFCQUFxQixDQUFDO2dCQUNuRCxDQUFDO1lBQ0YsQ0FBQztZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDO2dCQUM1RSxNQUFNLHFCQUFxQixHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBRS9ELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7b0JBQzlCLGdEQUFnRDtvQkFDaEQsT0FBTztnQkFDUixDQUFDO2dCQUVELElBQUkscUJBQXFCLEVBQUUsQ0FBQztvQkFDM0IsWUFBWSxDQUFDLFlBQVksR0FBRyxxQkFBcUIsQ0FBQztnQkFDbkQsQ0FBQztZQUNGLENBQUM7WUFFRCw4QkFBOEI7WUFDOUIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQy9ELFlBQVksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDdkMsQ0FBQztpQkFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7Z0JBQzNDLFlBQVksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFDeEMsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQzVCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDdkQsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7b0JBQy9ELFlBQVksQ0FBQyxXQUFXLEdBQUcsaUJBQWlCLENBQUM7Z0JBQzlDLENBQUM7WUFDRixDQUFDO1lBRUQsWUFBWSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBRTlCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV4QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksdUNBQTJCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUUsQ0FBQztRQUNGLENBQUM7UUFFTSxLQUFLLENBQUMsSUFBdUIsRUFBRSxRQUErQjtZQUNwRSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFTSxlQUFlO1lBQ3JCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUM5QixPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTSxlQUFlO1lBQ3JCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUM5QixPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTSxTQUFTLENBQUMsS0FBYTtZQUM3QixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQy9CLE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVNLE9BQU87WUFDYixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdEIsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sVUFBVTtZQUNoQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUEwQixFQUFFLEVBQUUsQ0FBQztvQkFDM0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLDJEQUEyRCxDQUFDLENBQUMsQ0FBQztvQkFDdEksT0FBTyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQztnQkFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN6QixPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDckIsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQjtZQUMvQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyxtQkFBbUI7bUJBQzdELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO21CQUN2QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsb0JBQW9CLEVBQUUsRUFDakQsQ0FBQztnQkFDRixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUM5QyxDQUFDO1lBQ0QsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRU0sbUJBQW1CLENBQUMsSUFBWTtZQUN0QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyxtQkFBbUI7bUJBQzdELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO21CQUN2QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsb0JBQW9CLEVBQUUsRUFDakQsQ0FBQztnQkFDRiw0QkFBNEI7Z0JBQzVCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUMsQ0FBQztRQUNGLENBQUM7O0lBelZXLG9EQUFvQjttQ0FBcEIsb0JBQW9CO1FBd0I5QixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsb0NBQWlCLENBQUE7UUFDakIsV0FBQSxtQ0FBb0IsQ0FBQTtPQTNCVixvQkFBb0IsQ0EwVmhDO0lBRU0sSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLG9CQUFvQjtRQUt2RCxZQUNDLE1BQW1CLEVBQ21CLG1CQUF3QyxFQUMxRCxrQkFBc0MsRUFDckIsa0JBQXNDLEVBQzNDLGFBQTRCLEVBQ3RDLG1CQUF5QyxFQUM5QyxlQUFnQyxFQUM5QixnQkFBbUM7WUFFdEQsS0FBSyxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQVJwRCx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBRXpDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDM0Msa0JBQWEsR0FBYixhQUFhLENBQWU7WUFNNUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDcEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztRQUNoQyxDQUFDO1FBRWtCLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBdUIsRUFBRSxRQUErQjtZQUN2RixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNuQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMxQixDQUFDO1lBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUM5QyxJQUFJLGlCQUFpQixHQUFHLEtBQUssQ0FBQztZQUU5QixRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUN2RSxLQUFLLFFBQVE7b0JBQ1osaUJBQWlCLEdBQUcsSUFBSSxDQUFDO29CQUN6QixNQUFNO2dCQUNQLEtBQUssT0FBTztvQkFDWCxpQkFBaUIsR0FBRyxLQUFLLENBQUM7b0JBQzFCLE1BQU07Z0JBQ1AsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUNsQixNQUFNLHVCQUF1QixHQUFHLENBQUMsQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLGVBQWUsS0FBSyxTQUFTLENBQUMsYUFBYSxDQUFDO29CQUNyRyxpQkFBaUIsR0FBRyx1QkFBdUIsQ0FBQztvQkFDNUMsTUFBTTtnQkFDUCxDQUFDO2dCQUNEO29CQUNDLE1BQU07WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxpQkFBaUIsQ0FBQztZQUVyRSxNQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRW5DLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNsQixJQUFJLElBQUksQ0FBQyxXQUFXLG1EQUEyQyxFQUFFLENBQUM7b0JBQ2pFLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQztxQkFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLGdEQUF3QyxFQUFFLENBQUM7b0JBQ3JFLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQy9CLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVlLG9CQUFvQixDQUFDLG9CQUE2QixLQUFLO1lBQ3RFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzFCLENBQUM7WUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLE9BQVEsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQ3RDLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsa0JBQW1CLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNqRCxDQUFDO1FBQ0YsQ0FBQztRQUVPLGlCQUFpQjtZQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx1QkFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDaE8sSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxxQ0FBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUNySCxDQUFDO1FBRUQsYUFBYTtZQUNaLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsQ0FBQztRQUNyQyxDQUFDO1FBRUQsZ0JBQWdCLENBQUMsS0FBVTtZQUMxQixJQUFJLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxDQUFDO0tBQ0QsQ0FBQTtJQWhGWSx3Q0FBYzs2QkFBZCxjQUFjO1FBT3hCLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsNEJBQWEsQ0FBQTtRQUNiLFdBQUEsbUNBQW9CLENBQUE7UUFDcEIsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSxvQ0FBaUIsQ0FBQTtPQWJQLGNBQWMsQ0FnRjFCO0lBRVksUUFBQSxlQUFlLEdBQUcsSUFBQSw0Q0FBeUIsRUFBQyxJQUFJLG9DQUFpQixDQUFDO1FBQzlFLEVBQUUsRUFBRSxvQkFBUSxDQUFDLGVBQWU7UUFDNUIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDO1FBQzlDLEtBQUssRUFBRSxNQUFNO1FBQ2IsWUFBWSxFQUFFLDJCQUFjLENBQUMsRUFBRSxDQUFDLHFDQUFpQixDQUFDLEtBQUssRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM1RixNQUFNLEVBQUU7WUFDUCxNQUFNLEVBQUUsSUFBSTtZQUNaLE9BQU8sRUFBRSxpREFBNkI7WUFDdEMsTUFBTSwwQ0FBZ0M7U0FDdEM7UUFDRCxRQUFRLEVBQUU7WUFDVCxNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxlQUFlO1lBQzlCLEtBQUssRUFBRSxRQUFRO1lBQ2YsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUM7WUFDcEYsS0FBSyxFQUFFLENBQUM7U0FDUjtLQUNELENBQUMsQ0FBQyxDQUFDO0lBRUosdUJBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUEwQixFQUFFLE1BQW1CLEVBQUUsSUFBUyxFQUEyQixFQUFFO1FBQzVILE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDakIsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBQ3ZCLGtCQUFrQixFQUFFLEtBQUs7WUFDekIsNkJBQTZCLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsNkJBQTZCLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU07WUFDaEkscUNBQXFDLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsNkJBQTZCLEtBQUssV0FBVztZQUN4SCxtQ0FBbUMsRUFBRSxNQUFNLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyxtQkFBbUI7WUFDNUYsV0FBVyw2Q0FBcUM7WUFDaEQsYUFBYSxFQUFFLElBQUk7WUFDbkIsaUJBQWlCLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsSUFBSTtTQUM5QyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sa0JBQWtCLEdBQUc7UUFDMUIsV0FBVyxFQUFFLG1DQUFtQztRQUNoRCxJQUFJLEVBQUUsQ0FBQztnQkFDTixJQUFJLEVBQUUsdUNBQXVDO2dCQUM3QyxNQUFNLEVBQUU7b0JBQ1AsVUFBVSxFQUFFO3dCQUNYLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7d0JBQ2hDLGFBQWEsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7d0JBQ2pDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7d0JBQzVCLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7d0JBQ25DLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7d0JBQ3BDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7d0JBQ2pDLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7cUJBQ3BDO2lCQUNEO2FBQ0QsQ0FBQztLQUNPLENBQUM7SUFFWCxNQUFhLHVCQUF3QixTQUFRLCtCQUFZO1FBRXhEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxvQkFBUSxDQUFDLGlCQUFpQjtnQkFDOUIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUUscUJBQXFCLENBQUM7Z0JBQ3JFLEtBQUssRUFBRSxxQkFBcUI7Z0JBQzVCLFlBQVksRUFBRSxTQUFTO2dCQUN2QixNQUFNLEVBQUU7b0JBQ1AsTUFBTSxFQUFFLElBQUk7b0JBQ1osT0FBTyxFQUFFLENBQUM7b0JBQ1YsTUFBTSwwQ0FBZ0M7aUJBQ3RDO2dCQUNELFFBQVEsRUFBRSxrQkFBa0I7YUFDNUIsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBaUMsRUFBRSxNQUFtQixFQUFFLElBQTBCO1lBQ2xHLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNoQixNQUFNLFFBQVEsR0FBeUIsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDN0MsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO29CQUMvQixhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7b0JBQ2pDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUztvQkFDbkQsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO29CQUNyQix1Q0FBdUM7b0JBQ3ZDLFNBQVMsRUFBRSxJQUFJLENBQUMsY0FBYztvQkFDOUIsNkNBQTZDO29CQUM3QyxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWU7b0JBQy9CLDZDQUE2QztvQkFDN0MsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO29CQUMvQixtREFBbUQ7aUJBQ25ELENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFFUCxNQUFNLFVBQVUsQ0FBQyxLQUFLLENBQUM7b0JBQ3RCLGtCQUFrQixFQUFFLEtBQUs7b0JBQ3pCLDZCQUE2QixFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsNkJBQTZCLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU07b0JBQ3JMLHFDQUFxQyxFQUFFLE1BQU0sQ0FBQyxTQUFTLDRCQUFtQixDQUFDLDZCQUE2QixLQUFLLFdBQVc7b0JBQ3hILG1DQUFtQyxFQUFFLElBQUk7b0JBQ3pDLFdBQVcsNkNBQXFDO29CQUNoRCxhQUFhLEVBQUUsSUFBSTtvQkFDbkIsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLGVBQWUsSUFBSSxLQUFLO29CQUNqRCxJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsSUFBSTtpQkFDOUMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFFYixVQUFVLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3BFLENBQUM7UUFDRixDQUFDO0tBQ0Q7SUFoREQsMERBZ0RDO0lBRUQsTUFBYSw0QkFBNkIsU0FBUSwrQkFBWTtRQUU3RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsb0JBQVEsQ0FBQyxzQkFBc0I7Z0JBQ25DLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLHFCQUFxQixDQUFDO2dCQUMxRSxLQUFLLEVBQUUscUJBQXFCO2dCQUM1QixZQUFZLEVBQUUsU0FBUztnQkFDdkIsTUFBTSxFQUFFO29CQUNQLE1BQU0sRUFBRSxJQUFJO29CQUNaLE9BQU8sRUFBRSxDQUFDO29CQUNWLEdBQUcsRUFBRTt3QkFDSixPQUFPLEVBQUUsaURBQTZCO3FCQUN0QztvQkFDRCxNQUFNLDBDQUFnQztpQkFDdEM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFpQyxFQUFFLE1BQW1CO1lBQ3RFLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNoQixNQUFNLFVBQVUsQ0FBQyxLQUFLLENBQUM7b0JBQ3RCLGtCQUFrQixFQUFFLEtBQUs7b0JBQ3pCLDZCQUE2QixFQUFFLFVBQVU7b0JBQ3pDLHFDQUFxQyxFQUFFLEtBQUs7b0JBQzVDLG1DQUFtQyxFQUFFLEtBQUs7b0JBQzFDLFdBQVcsNENBQW9DO29CQUMvQyxhQUFhLEVBQUUsSUFBSTtvQkFDbkIsaUJBQWlCLEVBQUUsS0FBSztvQkFDeEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxTQUFTLDRCQUFtQixDQUFDLElBQUk7aUJBQzlDLENBQUMsQ0FBQztnQkFFSCxVQUFVLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3BFLENBQUM7UUFDRixDQUFDO0tBQ0Q7SUFwQ0Qsb0VBb0NDO0lBQ0QsTUFBc0IsZUFBZ0IsU0FBUSwrQkFBWTtRQUNsRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQWlDLEVBQUUsTUFBbUI7WUFDdEUsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BELElBQUksVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO2dCQUMxQyxNQUFNLFVBQVUsQ0FBQyxLQUFLLENBQUM7b0JBQ3RCLGtCQUFrQixFQUFFLEtBQUs7b0JBQ3pCLDZCQUE2QixFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsNkJBQTZCLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU07b0JBQ3JMLHFDQUFxQyxFQUFFLE1BQU0sQ0FBQyxTQUFTLDRCQUFtQixDQUFDLDZCQUE2QixLQUFLLFdBQVc7b0JBQ3hILG1DQUFtQyxFQUFFLElBQUk7b0JBQ3pDLFdBQVcsNENBQW9DO29CQUMvQyxhQUFhLEVBQUUsSUFBSTtvQkFDbkIsaUJBQWlCLEVBQUUsS0FBSztvQkFDeEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxTQUFTLDRCQUFtQixDQUFDLElBQUk7aUJBQzlDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZCLENBQUM7UUFDRixDQUFDO0tBR0Q7SUFuQkQsMENBbUJDO0lBRUQsTUFBYSxtQkFBb0IsU0FBUSxlQUFlO1FBRXZEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxvQkFBUSxDQUFDLG1CQUFtQjtnQkFDaEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsV0FBVyxDQUFDO2dCQUN2RCxLQUFLLEVBQUUsV0FBVztnQkFDbEIsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLE1BQU0sRUFBRSxDQUFDO3dCQUNSLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLO3dCQUMvQixPQUFPLHFCQUFZO3dCQUNuQixHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsaURBQTZCLEVBQUUsU0FBUyxFQUFFLHFCQUFZLEVBQUU7d0JBQ3hFLE1BQU0sMENBQWdDO3FCQUN0QyxFQUFFO3dCQUNGLE1BQU0sRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxxQ0FBaUIsQ0FBQyxLQUFLLEVBQUUsc0NBQTBCLENBQUM7d0JBQy9FLE9BQU8sdUJBQWU7d0JBQ3RCLE1BQU0sMENBQWdDO3FCQUN0QyxDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVTLElBQUksQ0FBQyxVQUFnQztZQUM5QyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDNUMsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDWixVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNqQyxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7S0FDRDtJQTlCRCxrREE4QkM7SUFHRCxNQUFhLHVCQUF3QixTQUFRLGVBQWU7UUFFM0Q7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLG9CQUFRLENBQUMsdUJBQXVCO2dCQUNwQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxlQUFlLENBQUM7Z0JBQy9ELEtBQUssRUFBRSxlQUFlO2dCQUN0QixZQUFZLEVBQUUsU0FBUztnQkFDdkIsTUFBTSxFQUFFLENBQUM7d0JBQ1IsTUFBTSxFQUFFLHFDQUFpQixDQUFDLEtBQUs7d0JBQy9CLE9BQU8sRUFBRSw2Q0FBeUI7d0JBQ2xDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxtREFBNkIsd0JBQWUsRUFBRSxTQUFTLEVBQUUsQ0FBQyw2Q0FBeUIsQ0FBQyxFQUFFO3dCQUN0RyxNQUFNLDBDQUFnQztxQkFDdEMsRUFBRTt3QkFDRixNQUFNLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMscUNBQWlCLENBQUMsS0FBSyxFQUFFLHNDQUEwQixDQUFDO3dCQUMvRSxPQUFPLEVBQUUsK0NBQTRCO3dCQUNyQyxNQUFNLDBDQUFnQztxQkFDdEM7aUJBQ0E7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVMsSUFBSSxDQUFDLFVBQWdDO1lBQzlDLE9BQU8sVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JDLENBQUM7S0FDRDtJQXpCRCwwREF5QkM7SUFFRCxNQUFhLHFCQUFzQixTQUFRLCtCQUFZO1FBR3REO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxvQkFBUSxDQUFDLG1CQUFtQjtnQkFDaEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsZ0JBQWdCLENBQUM7Z0JBQ2xFLEtBQUssRUFBRSxnQkFBZ0I7Z0JBQ3ZCLFlBQVksRUFBRSx1Q0FBMkI7YUFDekMsQ0FBQyxDQUFDO1lBUEksMEJBQXFCLEdBQWEsRUFBRSxDQUFDO1FBUTdDLENBQUM7UUFFTSxHQUFHLENBQUMsUUFBMEIsRUFBRSxNQUFtQixFQUFFLElBQVM7WUFDcEUsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDakIsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxDQUFDO1lBQ3hELElBQUksWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN0QixNQUFNLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUNBQW9CLENBQUMsQ0FBQztnQkFDL0QsbUJBQW1CLENBQUMsTUFBTSxDQUFDO29CQUMxQixRQUFRLEVBQUUsdUJBQVEsQ0FBQyxPQUFPO29CQUMxQixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSwrQ0FBK0MsQ0FBQztpQkFDbkcsQ0FBQyxDQUFDO2dCQUNILE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7WUFDM0QsTUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDcEQsUUFBUSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLDZEQUE2RCxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBRXJKLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxLQUFhLEVBQXNCLEVBQUU7Z0JBQzlELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDbEIsT0FBTyxTQUFTLENBQUM7Z0JBQ2xCLENBQUM7Z0JBRUQsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQztnQkFDdEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxVQUFVLEVBQUUsQ0FBQztvQkFDdEMsT0FBTyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYTtnQkFDaEMsQ0FBQztxQkFBTSxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzlDLE9BQU8sVUFBVSxHQUFHLEtBQUssQ0FBQztnQkFDM0IsQ0FBQztnQkFFRCxPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDLENBQUM7WUFFRixNQUFNLHFCQUFxQixHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUU7Z0JBQy9DLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUMvQixRQUFRO29CQUNSLFFBQVEsQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7b0JBQ3ZDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzVCLE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUM7b0JBQ3hELElBQUksWUFBWSxFQUFFLENBQUM7d0JBQ2xCLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUMzQyxDQUFDO2dCQUNGLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxRQUFRLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0MsRUFBRSx3Q0FBd0MsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ2xLLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0IsQ0FBQztZQUNGLENBQUMsQ0FBQztZQUNGLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDakMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7WUFFSCxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtnQkFDekIsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUMvQixVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM1QixRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2pCLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxRQUFRLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0MsRUFBRSx3Q0FBd0MsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ25LLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUN2QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlCLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNwQixDQUFDLENBQUMsQ0FBQztZQUVILFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRU8sZ0JBQWdCLENBQUMsTUFBbUI7WUFDM0MsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUN6QyxJQUFJLENBQUMscUJBQXFCLEdBQUcsY0FBYyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM5RixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyxjQUFjLENBQUMsTUFBbUIsRUFBRSxLQUFhO1lBQ3hELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDekMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUU7b0JBQ3hGO3dCQUNDLEtBQUs7d0JBQ0wsT0FBTyxFQUFFOzRCQUNSLFdBQVcsRUFBRSx5Q0FBeUM7NEJBQ3RELFNBQVMsRUFBRSxnQkFBZ0I7NEJBQzNCLFdBQVcsRUFBRSxJQUFJO3lCQUNqQjtxQkFDRDtvQkFDRDt3QkFDQyxLQUFLO3dCQUNMLE9BQU8sRUFBRTs0QkFDUixXQUFXLEVBQUUsa0RBQWtEOzRCQUMvRCxhQUFhLEVBQUU7Z0NBQ2QsS0FBSyxFQUFFLElBQUEsK0JBQWdCLEVBQUMsaURBQTJCLENBQUM7Z0NBQ3BELFFBQVEsRUFBRSx5QkFBaUIsQ0FBQyxJQUFJOzZCQUNoQzt5QkFDRDtxQkFDRDtpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQW5IRCxzREFtSEM7SUFFRCxNQUFzQix3QkFBeUIsU0FBUSwrQkFBWTtRQUMzRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQWlDLEVBQUUsTUFBbUI7WUFDdEUsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDakIsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLHFCQUFxQixHQUFHLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEYsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO2dCQUMzQixVQUFVLENBQUMsZUFBZSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDbkQsQ0FBQztZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLE1BQU0sVUFBVSxDQUFDLEtBQUssQ0FBQztvQkFDdEIsa0JBQWtCLEVBQUUsS0FBSztvQkFDekIsNkJBQTZCLEVBQUUsTUFBTTtvQkFDckMscUNBQXFDLEVBQUUsS0FBSztvQkFDNUMsbUNBQW1DLEVBQUUsS0FBSztvQkFDMUMsV0FBVyw0Q0FBb0M7b0JBQy9DLGFBQWEsRUFBRSxJQUFJO29CQUNuQixpQkFBaUIsRUFBRSxLQUFLO29CQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsSUFBSTtpQkFDOUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkIsQ0FBQztRQUNGLENBQUM7S0FHRDtJQTNCRCw0REEyQkM7SUFFRCxNQUFhLDRCQUE2QixTQUFRLHdCQUF3QjtRQUV6RTtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsb0JBQVEsQ0FBQyw0QkFBNEI7Z0JBQ3pDLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLHFCQUFxQixDQUFDO2dCQUMxRSxLQUFLLEVBQUUscUJBQXFCO2dCQUM1QixZQUFZLEVBQUUsU0FBUztnQkFDdkIsTUFBTSxFQUFFO29CQUNQLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLO29CQUMvQixPQUFPLEVBQUUsK0NBQTJCO29CQUNwQyxNQUFNLDBDQUFnQztpQkFDdEM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVMsSUFBSSxDQUFDLFVBQWdDO1lBQzlDLE9BQU8sVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JDLENBQUM7S0FDRDtJQW5CRCxvRUFtQkM7SUFFRCxNQUFhLGdDQUFpQyxTQUFRLHdCQUF3QjtRQUU3RTtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsb0JBQVEsQ0FBQyxnQ0FBZ0M7Z0JBQzdDLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLHlCQUF5QixDQUFDO2dCQUNsRixLQUFLLEVBQUUseUJBQXlCO2dCQUNoQyxZQUFZLEVBQUUsU0FBUztnQkFDdkIsTUFBTSxFQUFFO29CQUNQLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLO29CQUMvQixPQUFPLEVBQUUsbURBQTZCLHNCQUFhO29CQUNuRCxNQUFNLDBDQUFnQztpQkFDdEM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVMsSUFBSSxDQUFDLFVBQWdDO1lBQzlDLE9BQU8sVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JDLENBQUM7S0FDRDtJQW5CRCw0RUFtQkM7SUFFWSxRQUFBLHNCQUFzQixHQUFHLElBQUEsNENBQXlCLEVBQUMsSUFBSSxvQ0FBaUIsQ0FBQztRQUNyRixFQUFFLEVBQUUsb0JBQVEsQ0FBQyxzQkFBc0I7UUFDbkMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQztRQUM5QyxLQUFLLEVBQUUsU0FBUztRQUNoQixZQUFZLEVBQUUsMkJBQWMsQ0FBQyxFQUFFLENBQUMscUNBQWlCLENBQUMsS0FBSyxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzVGLE1BQU0sRUFBRTtZQUNQLE1BQU0sRUFBRSxJQUFJO1lBQ1osT0FBTyxFQUFFLGlEQUE2QjtZQUN0QyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsZ0RBQTJCLHdCQUFlLEVBQUU7WUFDNUQsTUFBTSwwQ0FBZ0M7U0FDdEM7UUFDRCxRQUFRLEVBQUU7WUFDVCxNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxlQUFlO1lBQzlCLEtBQUssRUFBRSxRQUFRO1lBQ2YsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUM7WUFDMUYsS0FBSyxFQUFFLENBQUM7U0FDUjtLQUNELENBQUMsQ0FBQyxDQUFDO0lBRUosOEJBQXNCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBMEIsRUFBRSxNQUFtQixFQUFFLElBQVMsRUFBMkIsRUFBRTtRQUNuSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLE1BQU0sQ0FBQyxTQUFTLGdDQUF1QixFQUFFLENBQUM7WUFDbkUsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNqQixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUMvQyxNQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3pELHFHQUFxRztRQUNyRyxrQ0FBa0M7UUFDbEMsTUFBTSw2QkFBNkIsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRTtlQUM3RCxnQkFBZ0IsQ0FBQyxlQUFlLEtBQUssZ0JBQWdCLENBQUMsYUFBYTtlQUNuRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLDRCQUFtQixDQUFDLDZCQUE2QixLQUFLLE9BQU8sQ0FBQztlQUMvRSxDQUFDLGdCQUFnQixDQUFDO1FBQ3RCOzs7Ozs7VUFNRTtRQUNGLE1BQU0sV0FBVyxHQUFHLENBQUMsZ0JBQWdCLElBQUksNkJBQTZCLENBQUMsQ0FBQyxDQUFDOzJEQUNqQyxDQUFDLDRDQUFvQyxDQUFDO1FBRTlFLE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQztZQUN2QixrQkFBa0IsRUFBRSxJQUFJO1lBQ3hCLDZCQUE2QixFQUFFLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU07WUFDaEYscUNBQXFDLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsNkJBQTZCLEtBQUssV0FBVztZQUN4SCxtQ0FBbUMsRUFBRSxNQUFNLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyw2QkFBNkIsS0FBSyxPQUFPO1lBQ2xILFdBQVcsRUFBRSxXQUFXO1lBQ3hCLGFBQWEsRUFBRSxJQUFJO1lBQ25CLGlCQUFpQixFQUFFLEtBQUs7WUFDeEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxTQUFTLDRCQUFtQixDQUFDLElBQUk7U0FDOUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFBLDZDQUEwQixFQUFDLG9CQUFvQixDQUFDLEVBQUUsRUFBRSxjQUFjLGdEQUF3QyxDQUFDLENBQUMsMkRBQTJEO0lBRXZLLElBQUEsdUNBQW9CLEVBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUM5QyxJQUFBLHVDQUFvQixFQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDbkQsSUFBQSx1Q0FBb0IsRUFBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQzFDLElBQUEsdUNBQW9CLEVBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUM5QyxJQUFBLHVDQUFvQixFQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDNUMsSUFBQSx1Q0FBb0IsRUFBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQ25ELElBQUEsdUNBQW9CLEVBQUMsZ0NBQWdDLENBQUMsQ0FBQztJQUV2RCxNQUFNLFdBQVcsR0FBRyxnQ0FBYSxDQUFDLGtCQUFrQixDQUF1QixvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVyRyxJQUFBLHdDQUFxQixFQUFDLElBQUksV0FBVyxDQUFDO1FBQ3JDLEVBQUUsRUFBRSxvQkFBUSxDQUFDLHNCQUFzQjtRQUNuQyxZQUFZLEVBQUUsdUNBQTJCO1FBQ3pDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUU7UUFDakMsTUFBTSxFQUFFO1lBQ1AsTUFBTSxFQUFFLDJDQUFpQyxDQUFDO1lBQzFDLE1BQU0sRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxxQ0FBaUIsQ0FBQyxLQUFLLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdEYsT0FBTyx3QkFBZ0I7WUFDdkIsU0FBUyxFQUFFLENBQUMsZ0RBQTZCLENBQUM7U0FDMUM7S0FDRCxDQUFDLENBQUMsQ0FBQztJQUVKLElBQUEsd0NBQXFCLEVBQUMsSUFBSSxXQUFXLENBQUM7UUFDckMsRUFBRSxFQUFFLG9CQUFRLENBQUMsMEJBQTBCO1FBQ3ZDLFlBQVksRUFBRSxTQUFTO1FBQ3ZCLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRTtRQUNyQyxNQUFNLEVBQUU7WUFDUCxNQUFNLEVBQUUsMkNBQWlDLENBQUM7WUFDMUMsTUFBTSxFQUFFLHFDQUFpQixDQUFDLEtBQUs7WUFDL0IsT0FBTyxFQUFFLHlDQUE2QixDQUFDLE9BQU87WUFDOUMsR0FBRyxFQUFFLHlDQUE2QixDQUFDLEdBQUc7WUFDdEMsR0FBRyxFQUFFLHlDQUE2QixDQUFDLEdBQUc7WUFDdEMsS0FBSyxFQUFFLHlDQUE2QixDQUFDLEtBQUs7U0FDMUM7S0FDRCxDQUFDLENBQUMsQ0FBQztJQUVKLElBQUEsd0NBQXFCLEVBQUMsSUFBSSxXQUFXLENBQUM7UUFDckMsRUFBRSxFQUFFLG9CQUFRLENBQUMsc0JBQXNCO1FBQ25DLFlBQVksRUFBRSxTQUFTO1FBQ3ZCLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRTtRQUNsQyxNQUFNLEVBQUU7WUFDUCxNQUFNLEVBQUUsMkNBQWlDLENBQUM7WUFDMUMsTUFBTSxFQUFFLHFDQUFpQixDQUFDLEtBQUs7WUFDL0IsT0FBTyxFQUFFLHFDQUF5QixDQUFDLE9BQU87WUFDMUMsR0FBRyxFQUFFLHFDQUF5QixDQUFDLEdBQUc7WUFDbEMsR0FBRyxFQUFFLHFDQUF5QixDQUFDLEdBQUc7WUFDbEMsS0FBSyxFQUFFLHFDQUF5QixDQUFDLEtBQUs7U0FDdEM7S0FDRCxDQUFDLENBQUMsQ0FBQztJQUVKLElBQUEsd0NBQXFCLEVBQUMsSUFBSSxXQUFXLENBQUM7UUFDckMsRUFBRSxFQUFFLG9CQUFRLENBQUMsa0JBQWtCO1FBQy9CLFlBQVksRUFBRSxTQUFTO1FBQ3ZCLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7UUFDN0IsTUFBTSxFQUFFO1lBQ1AsTUFBTSxFQUFFLDJDQUFpQyxDQUFDO1lBQzFDLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLO1lBQy9CLE9BQU8sRUFBRSxpQ0FBcUIsQ0FBQyxPQUFPO1lBQ3RDLEdBQUcsRUFBRSxpQ0FBcUIsQ0FBQyxHQUFHO1lBQzlCLEdBQUcsRUFBRSxpQ0FBcUIsQ0FBQyxHQUFHO1lBQzlCLEtBQUssRUFBRSxpQ0FBcUIsQ0FBQyxLQUFLO1NBQ2xDO0tBQ0QsQ0FBQyxDQUFDLENBQUM7SUFFSixJQUFBLHdDQUFxQixFQUFDLElBQUksV0FBVyxDQUFDO1FBQ3JDLEVBQUUsRUFBRSxvQkFBUSxDQUFDLHdCQUF3QjtRQUNyQyxZQUFZLEVBQUUsU0FBUztRQUN2QixPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEVBQUU7UUFDbkMsTUFBTSxFQUFFO1lBQ1AsTUFBTSxFQUFFLDJDQUFpQyxDQUFDO1lBQzFDLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLO1lBQy9CLE9BQU8sRUFBRSx1Q0FBMkIsQ0FBQyxPQUFPO1lBQzVDLEdBQUcsRUFBRSx1Q0FBMkIsQ0FBQyxHQUFHO1lBQ3BDLEdBQUcsRUFBRSx1Q0FBMkIsQ0FBQyxHQUFHO1lBQ3BDLEtBQUssRUFBRSx1Q0FBMkIsQ0FBQyxLQUFLO1NBQ3hDO0tBQ0QsQ0FBQyxDQUFDLENBQUM7SUFFSixJQUFBLHdDQUFxQixFQUFDLElBQUksV0FBVyxDQUFDO1FBQ3JDLEVBQUUsRUFBRSxvQkFBUSxDQUFDLHlCQUF5QjtRQUN0QyxZQUFZLEVBQUUsU0FBUztRQUN2QixPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLEVBQUU7UUFDcEMsTUFBTSxFQUFFO1lBQ1AsTUFBTSxFQUFFLDJDQUFpQyxDQUFDO1lBQzFDLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLO1lBQy9CLE9BQU8sRUFBRSx3Q0FBNEIsQ0FBQyxPQUFPO1lBQzdDLEdBQUcsRUFBRSx3Q0FBNEIsQ0FBQyxHQUFHO1lBQ3JDLEdBQUcsRUFBRSx3Q0FBNEIsQ0FBQyxHQUFHO1lBQ3JDLEtBQUssRUFBRSx3Q0FBNEIsQ0FBQyxLQUFLO1NBQ3pDO0tBQ0QsQ0FBQyxDQUFDLENBQUM7SUFFSixJQUFBLHdDQUFxQixFQUFDLElBQUksV0FBVyxDQUFDO1FBQ3JDLEVBQUUsRUFBRSxvQkFBUSxDQUFDLGdCQUFnQjtRQUM3QixZQUFZLEVBQUUsdUNBQTJCO1FBQ3pDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUU7UUFDekIsTUFBTSxFQUFFO1lBQ1AsTUFBTSxFQUFFLDJDQUFpQyxDQUFDO1lBQzFDLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLO1lBQy9CLE9BQU8sRUFBRSxtREFBNkIsMEJBQWlCO1NBQ3ZEO0tBQ0QsQ0FBQyxDQUFDLENBQUM7SUFFSixJQUFBLHdDQUFxQixFQUFDLElBQUksV0FBVyxDQUFDO1FBQ3JDLEVBQUUsRUFBRSxvQkFBUSxDQUFDLGdCQUFnQjtRQUM3QixZQUFZLEVBQUUsdUNBQTJCO1FBQ3pDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUU7UUFDekIsTUFBTSxFQUFFO1lBQ1AsTUFBTSxFQUFFLDJDQUFpQyxDQUFDO1lBQzFDLE1BQU0sRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxxQ0FBaUIsQ0FBQyxLQUFLLEVBQUUseUNBQTZCLENBQUM7WUFDbEYsT0FBTyx1QkFBZTtTQUN0QjtLQUNELENBQUMsQ0FBQyxDQUFDO0lBRUosSUFBQSx3Q0FBcUIsRUFBQyxJQUFJLFdBQVcsQ0FBQztRQUNyQyxFQUFFLEVBQUUsb0JBQVEsQ0FBQyxnQkFBZ0I7UUFDN0IsWUFBWSxFQUFFLHVDQUEyQjtRQUN6QyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFO1FBQzVCLE1BQU0sRUFBRTtZQUNQLE1BQU0sRUFBRSwyQ0FBaUMsQ0FBQztZQUMxQyxNQUFNLEVBQUUscUNBQWlCLENBQUMsS0FBSztZQUMvQixPQUFPLEVBQUUsZ0RBQTJCLHdCQUFnQjtTQUNwRDtLQUNELENBQUMsQ0FBQyxDQUFDO0lBRUosSUFBQSx3Q0FBcUIsRUFBQyxJQUFJLFdBQVcsQ0FBQztRQUNyQyxFQUFFLEVBQUUsb0JBQVEsQ0FBQyxnQkFBZ0I7UUFDN0IsWUFBWSxFQUFFLHVDQUEyQjtRQUN6QyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFO1FBQzVCLE1BQU0sRUFBRTtZQUNQLE1BQU0sRUFBRSwyQ0FBaUMsQ0FBQztZQUMxQyxNQUFNLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMscUNBQWlCLENBQUMsS0FBSyxFQUFFLHlDQUE2QixDQUFDO1lBQ2xGLE9BQU8sRUFBRSxTQUFTO1lBQ2xCLEdBQUcsRUFBRTtnQkFDSixPQUFPLEVBQUUsaURBQThCO2FBQ3ZDO1NBQ0Q7S0FDRCxDQUFDLENBQUMsQ0FBQztJQUVKLElBQUEsd0NBQXFCLEVBQUMsSUFBSSxXQUFXLENBQUM7UUFDckMsRUFBRSxFQUFFLG9CQUFRLENBQUMsc0JBQXNCO1FBQ25DLFlBQVksRUFBRSx1Q0FBMkI7UUFDekMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFO1FBQ2xDLE1BQU0sRUFBRTtZQUNQLE1BQU0sRUFBRSwyQ0FBaUMsQ0FBQztZQUMxQyxNQUFNLEVBQUUscUNBQWlCLENBQUMsS0FBSztZQUMvQixPQUFPLEVBQUUsNENBQTBCO1NBQ25DO0tBQ0QsQ0FBQyxDQUFDLENBQUMifQ==