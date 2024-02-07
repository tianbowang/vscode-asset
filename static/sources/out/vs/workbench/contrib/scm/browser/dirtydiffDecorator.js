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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/resolverService", "vs/editor/common/services/editorWorker", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/scm/common/scm", "vs/editor/common/model/textModel", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/editor/common/core/position", "vs/base/common/numbers", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/base/common/actions", "vs/platform/keybinding/common/keybinding", "vs/base/common/resources", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/editor/common/model", "vs/base/common/arrays", "vs/editor/browser/services/codeEditorService", "vs/base/browser/dom", "vs/workbench/services/textfile/common/textfiles", "vs/platform/theme/common/iconRegistry", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/errors", "vs/workbench/common/contextkeys", "vs/platform/progress/common/progress", "vs/base/common/color", "vs/base/common/map", "vs/workbench/services/editor/common/editorService", "vs/platform/audioCues/browser/audioCueService", "vs/platform/accessibility/common/accessibility", "vs/workbench/contrib/scm/common/quickDiff", "vs/workbench/contrib/scm/browser/dirtyDiffSwitcher", "vs/css!./media/dirtydiffDecorator"], function (require, exports, nls, async_1, lifecycle_1, event_1, instantiation_1, resolverService_1, editorWorker_1, configuration_1, scm_1, textModel_1, themeService_1, colorRegistry_1, editorBrowser_1, editorExtensions_1, peekView_1, contextkey_1, editorContextKeys_1, position_1, numbers_1, keybindingsRegistry_1, embeddedCodeEditorWidget_1, actions_1, keybinding_1, resources_1, actions_2, menuEntryActionViewItem_1, model_1, arrays_1, codeEditorService_1, dom, textfiles_1, iconRegistry_1, codicons_1, themables_1, errors_1, contextkeys_1, progress_1, color_1, map_1, editorService_1, audioCueService_1, accessibility_1, quickDiff_1, dirtyDiffSwitcher_1) {
    "use strict";
    var DirtyDiffController_1, DirtyDiffDecorator_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DirtyDiffWorkbenchController = exports.DirtyDiffModel = exports.getOriginalResource = exports.DirtyDiffController = exports.GotoNextChangeAction = exports.GotoPreviousChangeAction = exports.ShowNextChangeAction = exports.ShowPreviousChangeAction = exports.isDirtyDiffVisible = void 0;
    class DiffActionRunner extends actions_1.ActionRunner {
        runAction(action, context) {
            if (action instanceof actions_2.MenuItemAction) {
                return action.run(...context);
            }
            return super.runAction(action, context);
        }
    }
    exports.isDirtyDiffVisible = new contextkey_1.RawContextKey('dirtyDiffVisible', false);
    function getChangeHeight(change) {
        const modified = change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1;
        const original = change.originalEndLineNumber - change.originalStartLineNumber + 1;
        if (change.originalEndLineNumber === 0) {
            return modified;
        }
        else if (change.modifiedEndLineNumber === 0) {
            return original;
        }
        else {
            return modified + original;
        }
    }
    function getModifiedEndLineNumber(change) {
        if (change.modifiedEndLineNumber === 0) {
            return change.modifiedStartLineNumber === 0 ? 1 : change.modifiedStartLineNumber;
        }
        else {
            return change.modifiedEndLineNumber;
        }
    }
    function lineIntersectsChange(lineNumber, change) {
        // deletion at the beginning of the file
        if (lineNumber === 1 && change.modifiedStartLineNumber === 0 && change.modifiedEndLineNumber === 0) {
            return true;
        }
        return lineNumber >= change.modifiedStartLineNumber && lineNumber <= (change.modifiedEndLineNumber || change.modifiedStartLineNumber);
    }
    let UIEditorAction = class UIEditorAction extends actions_1.Action {
        constructor(editor, action, cssClass, keybindingService, instantiationService) {
            const keybinding = keybindingService.lookupKeybinding(action.id);
            const label = action.label + (keybinding ? ` (${keybinding.getLabel()})` : '');
            super(action.id, label, cssClass);
            this.instantiationService = instantiationService;
            this.action = action;
            this.editor = editor;
        }
        run() {
            return Promise.resolve(this.instantiationService.invokeFunction(accessor => this.action.run(accessor, this.editor, null)));
        }
    };
    UIEditorAction = __decorate([
        __param(3, keybinding_1.IKeybindingService),
        __param(4, instantiation_1.IInstantiationService)
    ], UIEditorAction);
    var ChangeType;
    (function (ChangeType) {
        ChangeType[ChangeType["Modify"] = 0] = "Modify";
        ChangeType[ChangeType["Add"] = 1] = "Add";
        ChangeType[ChangeType["Delete"] = 2] = "Delete";
    })(ChangeType || (ChangeType = {}));
    function getChangeType(change) {
        if (change.originalEndLineNumber === 0) {
            return ChangeType.Add;
        }
        else if (change.modifiedEndLineNumber === 0) {
            return ChangeType.Delete;
        }
        else {
            return ChangeType.Modify;
        }
    }
    function getChangeTypeColor(theme, changeType) {
        switch (changeType) {
            case ChangeType.Modify: return theme.getColor(editorGutterModifiedBackground);
            case ChangeType.Add: return theme.getColor(editorGutterAddedBackground);
            case ChangeType.Delete: return theme.getColor(editorGutterDeletedBackground);
        }
    }
    function getOuterEditorFromDiffEditor(accessor) {
        const diffEditors = accessor.get(codeEditorService_1.ICodeEditorService).listDiffEditors();
        for (const diffEditor of diffEditors) {
            if (diffEditor.hasTextFocus() && diffEditor instanceof embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget) {
                return diffEditor.getParentEditor();
            }
        }
        return (0, peekView_1.getOuterEditor)(accessor);
    }
    let DirtyDiffWidget = class DirtyDiffWidget extends peekView_1.PeekViewWidget {
        constructor(editor, model, themeService, instantiationService, menuService, contextKeyService) {
            super(editor, { isResizeable: true, frameWidth: 1, keepEditorSelection: true, className: 'dirty-diff' }, instantiationService);
            this.model = model;
            this.themeService = themeService;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this._index = 0;
            this._provider = '';
            this.height = undefined;
            this._disposables.add(themeService.onDidColorThemeChange(this._applyTheme, this));
            this._applyTheme(themeService.getColorTheme());
            if (this.model.original.length > 0) {
                contextKeyService = contextKeyService.createOverlay([['originalResourceScheme', this.model.original[0].uri.scheme], ['originalResourceSchemes', this.model.original.map(original => original.uri.scheme)]]);
            }
            this.create();
            if (editor.hasModel()) {
                this.title = (0, resources_1.basename)(editor.getModel().uri);
            }
            else {
                this.title = '';
            }
            this.setTitle(this.title);
        }
        get provider() {
            return this._provider;
        }
        get index() {
            return this._index;
        }
        get visibleRange() {
            const visibleRanges = this.diffEditor.getModifiedEditor().getVisibleRanges();
            return visibleRanges.length >= 0 ? visibleRanges[0] : undefined;
        }
        showChange(index, usePosition = true) {
            const labeledChange = this.model.changes[index];
            const change = labeledChange.change;
            this._index = index;
            this.contextKeyService.createKey('originalResourceScheme', this.model.changes[index].uri.scheme);
            this.updateActions();
            this._provider = labeledChange.label;
            this.change = change;
            const originalModel = this.model.original;
            if (!originalModel) {
                return;
            }
            const onFirstDiffUpdate = event_1.Event.once(this.diffEditor.onDidUpdateDiff);
            // TODO@joao TODO@alex need this setTimeout probably because the
            // non-side-by-side diff still hasn't created the view zones
            onFirstDiffUpdate(() => setTimeout(() => this.revealChange(change), 0));
            const diffEditorModel = this.model.getDiffEditorModel(labeledChange.uri.toString());
            if (!diffEditorModel) {
                return;
            }
            this.diffEditor.setModel(diffEditorModel);
            this.dropdown?.setSelection(labeledChange.label);
            const position = new position_1.Position(getModifiedEndLineNumber(change), 1);
            const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
            const editorHeight = this.editor.getLayoutInfo().height;
            const editorHeightInLines = Math.floor(editorHeight / lineHeight);
            const height = Math.min(getChangeHeight(change) + /* padding */ 8, Math.floor(editorHeightInLines / 3));
            this.renderTitle(labeledChange.label);
            const changeType = getChangeType(change);
            const changeTypeColor = getChangeTypeColor(this.themeService.getColorTheme(), changeType);
            this.style({ frameColor: changeTypeColor, arrowColor: changeTypeColor });
            const providerSpecificChanges = [];
            let contextIndex = index;
            for (const change of this.model.changes) {
                if (change.label === this.model.changes[this._index].label) {
                    providerSpecificChanges.push(change.change);
                    if (labeledChange === change) {
                        contextIndex = providerSpecificChanges.length - 1;
                    }
                }
            }
            this._actionbarWidget.context = [diffEditorModel.modified.uri, providerSpecificChanges, contextIndex];
            if (usePosition) {
                this.show(position, height);
            }
            this.editor.setPosition(position);
            this.editor.focus();
        }
        renderTitle(label) {
            const providerChanges = this.model.mapChanges.get(label);
            const providerIndex = providerChanges.indexOf(this._index);
            let detail;
            if (!this.shouldUseDropdown()) {
                detail = this.model.changes.length > 1
                    ? nls.localize('changes', "{0} - {1} of {2} changes", label, providerIndex + 1, providerChanges.length)
                    : nls.localize('change', "{0} - {1} of {2} change", label, providerIndex + 1, providerChanges.length);
                this.dropdownContainer.style.display = 'none';
            }
            else {
                detail = this.model.changes.length > 1
                    ? nls.localize('multiChanges', "{0} of {1} changes", providerIndex + 1, providerChanges.length)
                    : nls.localize('multiChange', "{0} of {1} change", providerIndex + 1, providerChanges.length);
                this.dropdownContainer.style.display = 'inherit';
            }
            this.setTitle(this.title, detail);
        }
        switchQuickDiff(event) {
            const newProvider = event?.provider;
            if (newProvider === this.model.changes[this._index].label) {
                return;
            }
            let closestGreaterIndex = this._index < this.model.changes.length - 1 ? this._index + 1 : 0;
            for (let i = closestGreaterIndex; i !== this._index; i < this.model.changes.length - 1 ? i++ : i = 0) {
                if (this.model.changes[i].label === newProvider) {
                    closestGreaterIndex = i;
                    break;
                }
            }
            let closestLesserIndex = this._index > 0 ? this._index - 1 : this.model.changes.length - 1;
            for (let i = closestLesserIndex; i !== this._index; i >= 0 ? i-- : i = this.model.changes.length - 1) {
                if (this.model.changes[i].label === newProvider) {
                    closestLesserIndex = i;
                    break;
                }
            }
            const closestIndex = Math.abs(this.model.changes[closestGreaterIndex].change.modifiedEndLineNumber - this.model.changes[this._index].change.modifiedEndLineNumber)
                < Math.abs(this.model.changes[closestLesserIndex].change.modifiedEndLineNumber - this.model.changes[this._index].change.modifiedEndLineNumber)
                ? closestGreaterIndex : closestLesserIndex;
            this.showChange(closestIndex, false);
        }
        shouldUseDropdown() {
            let providersWithChangesCount = 0;
            if (this.model.mapChanges.size > 1) {
                const keys = Array.from(this.model.mapChanges.keys());
                for (let i = 0; (i < keys.length) && (providersWithChangesCount <= 1); i++) {
                    if (this.model.mapChanges.get(keys[i]).length > 0) {
                        providersWithChangesCount++;
                    }
                }
            }
            return providersWithChangesCount >= 2;
        }
        updateActions() {
            if (!this._actionbarWidget) {
                return;
            }
            const previous = this.instantiationService.createInstance(UIEditorAction, this.editor, new ShowPreviousChangeAction(this.editor), themables_1.ThemeIcon.asClassName(iconRegistry_1.gotoPreviousLocation));
            const next = this.instantiationService.createInstance(UIEditorAction, this.editor, new ShowNextChangeAction(this.editor), themables_1.ThemeIcon.asClassName(iconRegistry_1.gotoNextLocation));
            this._disposables.add(previous);
            this._disposables.add(next);
            const actions = [];
            if (this.menu) {
                this.menu.dispose();
            }
            this.menu = this.menuService.createMenu(actions_2.MenuId.SCMChangeContext, this.contextKeyService);
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { shouldForwardArgs: true }, actions);
            this._actionbarWidget.clear();
            this._actionbarWidget.push(actions.reverse(), { label: false, icon: true });
            this._actionbarWidget.push([next, previous], { label: false, icon: true });
            this._actionbarWidget.push(new actions_1.Action('peekview.close', nls.localize('label.close', "Close"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close), true, () => this.dispose()), { label: false, icon: true });
        }
        _fillHead(container) {
            super._fillHead(container, true);
            this.dropdownContainer = dom.prepend(this._titleElement, dom.$('.dropdown'));
            this.dropdown = this.instantiationService.createInstance(dirtyDiffSwitcher_1.SwitchQuickDiffViewItem, new dirtyDiffSwitcher_1.SwitchQuickDiffBaseAction((event) => this.switchQuickDiff(event)), this.model.quickDiffs.map(quickDiffer => quickDiffer.label), this.model.changes[this._index].label);
            this.dropdown.render(this.dropdownContainer);
            this.updateActions();
        }
        _getActionBarOptions() {
            const actionRunner = new DiffActionRunner();
            // close widget on successful action
            actionRunner.onDidRun(e => {
                if (!(e.action instanceof UIEditorAction) && !e.error) {
                    this.dispose();
                }
            });
            return {
                ...super._getActionBarOptions(),
                actionRunner
            };
        }
        _fillBody(container) {
            const options = {
                scrollBeyondLastLine: true,
                scrollbar: {
                    verticalScrollbarSize: 14,
                    horizontal: 'auto',
                    useShadows: true,
                    verticalHasArrows: false,
                    horizontalHasArrows: false
                },
                overviewRulerLanes: 2,
                fixedOverflowWidgets: true,
                minimap: { enabled: false },
                renderSideBySide: false,
                readOnly: false,
                renderIndicators: false,
                diffAlgorithm: 'advanced',
                ignoreTrimWhitespace: false,
                stickyScroll: { enabled: false }
            };
            this.diffEditor = this.instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget, container, options, {}, this.editor);
            this._disposables.add(this.diffEditor);
        }
        _onWidth(width) {
            if (typeof this.height === 'undefined') {
                return;
            }
            this.diffEditor.layout({ height: this.height, width });
        }
        _doLayoutBody(height, width) {
            super._doLayoutBody(height, width);
            this.diffEditor.layout({ height, width });
            if (typeof this.height === 'undefined' && this.change) {
                this.revealChange(this.change);
            }
            this.height = height;
        }
        revealChange(change) {
            let start, end;
            if (change.modifiedEndLineNumber === 0) { // deletion
                start = change.modifiedStartLineNumber;
                end = change.modifiedStartLineNumber + 1;
            }
            else if (change.originalEndLineNumber > 0) { // modification
                start = change.modifiedStartLineNumber - 1;
                end = change.modifiedEndLineNumber + 1;
            }
            else { // insertion
                start = change.modifiedStartLineNumber;
                end = change.modifiedEndLineNumber;
            }
            this.diffEditor.revealLinesInCenter(start, end, 1 /* ScrollType.Immediate */);
        }
        _applyTheme(theme) {
            const borderColor = theme.getColor(peekView_1.peekViewBorder) || color_1.Color.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor,
                headerBackgroundColor: theme.getColor(peekView_1.peekViewTitleBackground) || color_1.Color.transparent,
                primaryHeadingColor: theme.getColor(peekView_1.peekViewTitleForeground),
                secondaryHeadingColor: theme.getColor(peekView_1.peekViewTitleInfoForeground)
            });
        }
        revealRange(range) {
            this.editor.revealLineInCenterIfOutsideViewport(range.endLineNumber, 0 /* ScrollType.Smooth */);
        }
        hasFocus() {
            return this.diffEditor.hasTextFocus();
        }
        dispose() {
            super.dispose();
            this.menu?.dispose();
        }
    };
    DirtyDiffWidget = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, actions_2.IMenuService),
        __param(5, contextkey_1.IContextKeyService)
    ], DirtyDiffWidget);
    class ShowPreviousChangeAction extends editorExtensions_1.EditorAction {
        constructor(outerEditor) {
            super({
                id: 'editor.action.dirtydiff.previous',
                label: nls.localize('show previous change', "Show Previous Change"),
                alias: 'Show Previous Change',
                precondition: contextkeys_1.TextCompareEditorActiveContext.toNegated(),
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus, primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
            });
            this.outerEditor = outerEditor;
        }
        run(accessor) {
            const outerEditor = this.outerEditor ?? getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            const controller = DirtyDiffController.get(outerEditor);
            if (!controller) {
                return;
            }
            if (!controller.canNavigate()) {
                return;
            }
            controller.previous();
        }
    }
    exports.ShowPreviousChangeAction = ShowPreviousChangeAction;
    (0, editorExtensions_1.registerEditorAction)(ShowPreviousChangeAction);
    class ShowNextChangeAction extends editorExtensions_1.EditorAction {
        constructor(outerEditor) {
            super({
                id: 'editor.action.dirtydiff.next',
                label: nls.localize('show next change', "Show Next Change"),
                alias: 'Show Next Change',
                precondition: contextkeys_1.TextCompareEditorActiveContext.toNegated(),
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus, primary: 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
            });
            this.outerEditor = outerEditor;
        }
        run(accessor) {
            const outerEditor = this.outerEditor ?? getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            const controller = DirtyDiffController.get(outerEditor);
            if (!controller) {
                return;
            }
            if (!controller.canNavigate()) {
                return;
            }
            controller.next();
        }
    }
    exports.ShowNextChangeAction = ShowNextChangeAction;
    (0, editorExtensions_1.registerEditorAction)(ShowNextChangeAction);
    // Go to menu
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarGoMenu, {
        group: '7_change_nav',
        command: {
            id: 'editor.action.dirtydiff.next',
            title: nls.localize({ key: 'miGotoNextChange', comment: ['&& denotes a mnemonic'] }, "Next &&Change")
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarGoMenu, {
        group: '7_change_nav',
        command: {
            id: 'editor.action.dirtydiff.previous',
            title: nls.localize({ key: 'miGotoPreviousChange', comment: ['&& denotes a mnemonic'] }, "Previous &&Change")
        },
        order: 2
    });
    class GotoPreviousChangeAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'workbench.action.editor.previousChange',
                label: nls.localize('move to previous change', "Go to Previous Change"),
                alias: 'Go to Previous Change',
                precondition: contextkeys_1.TextCompareEditorActiveContext.toNegated(),
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus, primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
            });
        }
        async run(accessor) {
            const outerEditor = getOuterEditorFromDiffEditor(accessor);
            const audioCueService = accessor.get(audioCueService_1.IAudioCueService);
            const accessibilityService = accessor.get(accessibility_1.IAccessibilityService);
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            if (!outerEditor || !outerEditor.hasModel()) {
                return;
            }
            const controller = DirtyDiffController.get(outerEditor);
            if (!controller || !controller.modelRegistry) {
                return;
            }
            const lineNumber = outerEditor.getPosition().lineNumber;
            const model = controller.modelRegistry.getModel(outerEditor.getModel(), outerEditor);
            if (!model || model.changes.length === 0) {
                return;
            }
            const index = model.findPreviousClosestChange(lineNumber, false);
            const change = model.changes[index];
            await playAudioCueForChange(change.change, audioCueService);
            setPositionAndSelection(change.change, outerEditor, accessibilityService, codeEditorService);
        }
    }
    exports.GotoPreviousChangeAction = GotoPreviousChangeAction;
    (0, editorExtensions_1.registerEditorAction)(GotoPreviousChangeAction);
    class GotoNextChangeAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'workbench.action.editor.nextChange',
                label: nls.localize('move to next change', "Go to Next Change"),
                alias: 'Go to Next Change',
                precondition: contextkeys_1.TextCompareEditorActiveContext.toNegated(),
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus, primary: 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
            });
        }
        async run(accessor) {
            const audioCueService = accessor.get(audioCueService_1.IAudioCueService);
            const outerEditor = getOuterEditorFromDiffEditor(accessor);
            const accessibilityService = accessor.get(accessibility_1.IAccessibilityService);
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            if (!outerEditor || !outerEditor.hasModel()) {
                return;
            }
            const controller = DirtyDiffController.get(outerEditor);
            if (!controller || !controller.modelRegistry) {
                return;
            }
            const lineNumber = outerEditor.getPosition().lineNumber;
            const model = controller.modelRegistry.getModel(outerEditor.getModel(), outerEditor);
            if (!model || model.changes.length === 0) {
                return;
            }
            const index = model.findNextClosestChange(lineNumber, false);
            const change = model.changes[index].change;
            await playAudioCueForChange(change, audioCueService);
            setPositionAndSelection(change, outerEditor, accessibilityService, codeEditorService);
        }
    }
    exports.GotoNextChangeAction = GotoNextChangeAction;
    function setPositionAndSelection(change, editor, accessibilityService, codeEditorService) {
        const position = new position_1.Position(change.modifiedStartLineNumber, 1);
        editor.setPosition(position);
        editor.revealPositionInCenter(position);
        if (accessibilityService.isScreenReaderOptimized()) {
            editor.setSelection({ startLineNumber: change.modifiedStartLineNumber, startColumn: 0, endLineNumber: change.modifiedStartLineNumber, endColumn: Number.MAX_VALUE });
            codeEditorService.getActiveCodeEditor()?.writeScreenReaderContent('diff-navigation');
        }
    }
    async function playAudioCueForChange(change, audioCueService) {
        const changeType = getChangeType(change);
        switch (changeType) {
            case ChangeType.Add:
                audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineInserted, { allowManyInParallel: true, source: 'dirtyDiffDecoration' });
                break;
            case ChangeType.Delete:
                audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineDeleted, { allowManyInParallel: true, source: 'dirtyDiffDecoration' });
                break;
            case ChangeType.Modify:
                audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineModified, { allowManyInParallel: true, source: 'dirtyDiffDecoration' });
                break;
        }
    }
    (0, editorExtensions_1.registerEditorAction)(GotoNextChangeAction);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'closeDirtyDiff',
        weight: 100 /* KeybindingWeight.EditorContrib */ + 50,
        primary: 9 /* KeyCode.Escape */,
        secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
        when: contextkey_1.ContextKeyExpr.and(exports.isDirtyDiffVisible),
        handler: (accessor) => {
            const outerEditor = getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            const controller = DirtyDiffController.get(outerEditor);
            if (!controller) {
                return;
            }
            controller.close();
        }
    });
    let DirtyDiffController = class DirtyDiffController extends lifecycle_1.Disposable {
        static { DirtyDiffController_1 = this; }
        static { this.ID = 'editor.contrib.dirtydiff'; }
        static get(editor) {
            return editor.getContribution(DirtyDiffController_1.ID);
        }
        constructor(editor, contextKeyService, configurationService, instantiationService) {
            super();
            this.editor = editor;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.modelRegistry = null;
            this.model = null;
            this.widget = null;
            this.session = lifecycle_1.Disposable.None;
            this.mouseDownInfo = null;
            this.enabled = false;
            this.gutterActionDisposables = new lifecycle_1.DisposableStore();
            this.enabled = !contextKeyService.getContextKeyValue('isInDiffEditor');
            this.stylesheet = dom.createStyleSheet(undefined, undefined, this._store);
            if (this.enabled) {
                this.isDirtyDiffVisible = exports.isDirtyDiffVisible.bindTo(contextKeyService);
                this._register(editor.onDidChangeModel(() => this.close()));
                const onDidChangeGutterAction = event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterAction'));
                this._register(onDidChangeGutterAction(this.onDidChangeGutterAction, this));
                this.onDidChangeGutterAction();
            }
        }
        onDidChangeGutterAction() {
            const gutterAction = this.configurationService.getValue('scm.diffDecorationsGutterAction');
            this.gutterActionDisposables.clear();
            if (gutterAction === 'diff') {
                this.gutterActionDisposables.add(this.editor.onMouseDown(e => this.onEditorMouseDown(e)));
                this.gutterActionDisposables.add(this.editor.onMouseUp(e => this.onEditorMouseUp(e)));
                this.stylesheet.textContent = `
				.monaco-editor .dirty-diff-glyph {
					cursor: pointer;
				}

				.monaco-editor .margin-view-overlays .dirty-diff-glyph:hover::before {
					height: 100%;
					width: 6px;
					left: -6px;
				}

				.monaco-editor .margin-view-overlays .dirty-diff-deleted:hover::after {
					bottom: 0;
					border-top-width: 0;
					border-bottom-width: 0;
				}
			`;
            }
            else {
                this.stylesheet.textContent = ``;
            }
        }
        canNavigate() {
            return !this.widget || (this.widget?.index === -1) || (!!this.model && this.model.changes.length > 1);
        }
        refresh() {
            this.widget?.showChange(this.widget.index, false);
        }
        next(lineNumber) {
            if (!this.assertWidget()) {
                return;
            }
            if (!this.widget || !this.model) {
                return;
            }
            let index;
            if (this.editor.hasModel() && (typeof lineNumber === 'number' || !this.widget.provider)) {
                index = this.model.findNextClosestChange(typeof lineNumber === 'number' ? lineNumber : this.editor.getPosition().lineNumber, true, this.widget.provider);
            }
            else {
                const providerChanges = this.model.mapChanges.get(this.widget.provider) ?? this.model.mapChanges.values().next().value;
                const mapIndex = providerChanges.findIndex(value => value === this.widget.index);
                index = providerChanges[(0, numbers_1.rot)(mapIndex + 1, providerChanges.length)];
            }
            this.widget.showChange(index);
        }
        previous(lineNumber) {
            if (!this.assertWidget()) {
                return;
            }
            if (!this.widget || !this.model) {
                return;
            }
            let index;
            if (this.editor.hasModel() && (typeof lineNumber === 'number')) {
                index = this.model.findPreviousClosestChange(typeof lineNumber === 'number' ? lineNumber : this.editor.getPosition().lineNumber, true, this.widget.provider);
            }
            else {
                const providerChanges = this.model.mapChanges.get(this.widget.provider) ?? this.model.mapChanges.values().next().value;
                const mapIndex = providerChanges.findIndex(value => value === this.widget.index);
                index = providerChanges[(0, numbers_1.rot)(mapIndex - 1, providerChanges.length)];
            }
            this.widget.showChange(index);
        }
        close() {
            this.session.dispose();
            this.session = lifecycle_1.Disposable.None;
        }
        assertWidget() {
            if (!this.enabled) {
                return false;
            }
            if (this.widget) {
                if (!this.model || this.model.changes.length === 0) {
                    this.close();
                    return false;
                }
                return true;
            }
            if (!this.modelRegistry) {
                return false;
            }
            const editorModel = this.editor.getModel();
            if (!editorModel) {
                return false;
            }
            const model = this.modelRegistry.getModel(editorModel, this.editor);
            if (!model) {
                return false;
            }
            if (model.changes.length === 0) {
                return false;
            }
            this.model = model;
            this.widget = this.instantiationService.createInstance(DirtyDiffWidget, this.editor, model);
            this.isDirtyDiffVisible.set(true);
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(event_1.Event.once(this.widget.onDidClose)(this.close, this));
            const onDidModelChange = event_1.Event.chain(model.onDidChange, $ => $.filter(e => e.diff.length > 0)
                .map(e => e.diff));
            onDidModelChange(this.onDidModelChange, this, disposables);
            disposables.add(this.widget);
            disposables.add((0, lifecycle_1.toDisposable)(() => {
                this.model = null;
                this.widget = null;
                this.isDirtyDiffVisible.set(false);
                this.editor.focus();
            }));
            this.session = disposables;
            return true;
        }
        onDidModelChange(splices) {
            if (!this.model || !this.widget || this.widget.hasFocus()) {
                return;
            }
            for (const splice of splices) {
                if (splice.start <= this.widget.index) {
                    this.next();
                    return;
                }
            }
            this.refresh();
        }
        onEditorMouseDown(e) {
            this.mouseDownInfo = null;
            const range = e.target.range;
            if (!range) {
                return;
            }
            if (!e.event.leftButton) {
                return;
            }
            if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
                return;
            }
            if (!e.target.element) {
                return;
            }
            if (e.target.element.className.indexOf('dirty-diff-glyph') < 0) {
                return;
            }
            const data = e.target.detail;
            const offsetLeftInGutter = e.target.element.offsetLeft;
            const gutterOffsetX = data.offsetX - offsetLeftInGutter;
            // TODO@joao TODO@alex TODO@martin this is such that we don't collide with folding
            if (gutterOffsetX < -3 || gutterOffsetX > 3) { // dirty diff decoration on hover is 6px wide
                return;
            }
            this.mouseDownInfo = { lineNumber: range.startLineNumber };
        }
        onEditorMouseUp(e) {
            if (!this.mouseDownInfo) {
                return;
            }
            const { lineNumber } = this.mouseDownInfo;
            this.mouseDownInfo = null;
            const range = e.target.range;
            if (!range || range.startLineNumber !== lineNumber) {
                return;
            }
            if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
                return;
            }
            if (!this.modelRegistry) {
                return;
            }
            const editorModel = this.editor.getModel();
            if (!editorModel) {
                return;
            }
            const model = this.modelRegistry.getModel(editorModel, this.editor);
            if (!model) {
                return;
            }
            const index = model.changes.findIndex(change => lineIntersectsChange(lineNumber, change.change));
            if (index < 0) {
                return;
            }
            if (index === this.widget?.index) {
                this.close();
            }
            else {
                this.next(lineNumber);
            }
        }
        getChanges() {
            if (!this.modelRegistry) {
                return [];
            }
            if (!this.editor.hasModel()) {
                return [];
            }
            const model = this.modelRegistry.getModel(this.editor.getModel(), this.editor);
            if (!model) {
                return [];
            }
            return model.changes.map(change => change.change);
        }
        dispose() {
            this.gutterActionDisposables.dispose();
            super.dispose();
        }
    };
    exports.DirtyDiffController = DirtyDiffController;
    exports.DirtyDiffController = DirtyDiffController = DirtyDiffController_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, instantiation_1.IInstantiationService)
    ], DirtyDiffController);
    const editorGutterModifiedBackground = (0, colorRegistry_1.registerColor)('editorGutter.modifiedBackground', {
        dark: '#1B81A8',
        light: '#2090D3',
        hcDark: '#1B81A8',
        hcLight: '#2090D3'
    }, nls.localize('editorGutterModifiedBackground', "Editor gutter background color for lines that are modified."));
    const editorGutterAddedBackground = (0, colorRegistry_1.registerColor)('editorGutter.addedBackground', {
        dark: '#487E02',
        light: '#48985D',
        hcDark: '#487E02',
        hcLight: '#48985D'
    }, nls.localize('editorGutterAddedBackground', "Editor gutter background color for lines that are added."));
    const editorGutterDeletedBackground = (0, colorRegistry_1.registerColor)('editorGutter.deletedBackground', {
        dark: colorRegistry_1.editorErrorForeground,
        light: colorRegistry_1.editorErrorForeground,
        hcDark: colorRegistry_1.editorErrorForeground,
        hcLight: colorRegistry_1.editorErrorForeground
    }, nls.localize('editorGutterDeletedBackground', "Editor gutter background color for lines that are deleted."));
    const minimapGutterModifiedBackground = (0, colorRegistry_1.registerColor)('minimapGutter.modifiedBackground', {
        dark: editorGutterModifiedBackground,
        light: editorGutterModifiedBackground,
        hcDark: editorGutterModifiedBackground,
        hcLight: editorGutterModifiedBackground
    }, nls.localize('minimapGutterModifiedBackground', "Minimap gutter background color for lines that are modified."));
    const minimapGutterAddedBackground = (0, colorRegistry_1.registerColor)('minimapGutter.addedBackground', {
        dark: editorGutterAddedBackground,
        light: editorGutterAddedBackground,
        hcDark: editorGutterAddedBackground,
        hcLight: editorGutterAddedBackground
    }, nls.localize('minimapGutterAddedBackground', "Minimap gutter background color for lines that are added."));
    const minimapGutterDeletedBackground = (0, colorRegistry_1.registerColor)('minimapGutter.deletedBackground', {
        dark: editorGutterDeletedBackground,
        light: editorGutterDeletedBackground,
        hcDark: editorGutterDeletedBackground,
        hcLight: editorGutterDeletedBackground
    }, nls.localize('minimapGutterDeletedBackground', "Minimap gutter background color for lines that are deleted."));
    const overviewRulerModifiedForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.modifiedForeground', { dark: (0, colorRegistry_1.transparent)(editorGutterModifiedBackground, 0.6), light: (0, colorRegistry_1.transparent)(editorGutterModifiedBackground, 0.6), hcDark: (0, colorRegistry_1.transparent)(editorGutterModifiedBackground, 0.6), hcLight: (0, colorRegistry_1.transparent)(editorGutterModifiedBackground, 0.6) }, nls.localize('overviewRulerModifiedForeground', 'Overview ruler marker color for modified content.'));
    const overviewRulerAddedForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.addedForeground', { dark: (0, colorRegistry_1.transparent)(editorGutterAddedBackground, 0.6), light: (0, colorRegistry_1.transparent)(editorGutterAddedBackground, 0.6), hcDark: (0, colorRegistry_1.transparent)(editorGutterAddedBackground, 0.6), hcLight: (0, colorRegistry_1.transparent)(editorGutterAddedBackground, 0.6) }, nls.localize('overviewRulerAddedForeground', 'Overview ruler marker color for added content.'));
    const overviewRulerDeletedForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.deletedForeground', { dark: (0, colorRegistry_1.transparent)(editorGutterDeletedBackground, 0.6), light: (0, colorRegistry_1.transparent)(editorGutterDeletedBackground, 0.6), hcDark: (0, colorRegistry_1.transparent)(editorGutterDeletedBackground, 0.6), hcLight: (0, colorRegistry_1.transparent)(editorGutterDeletedBackground, 0.6) }, nls.localize('overviewRulerDeletedForeground', 'Overview ruler marker color for deleted content.'));
    let DirtyDiffDecorator = DirtyDiffDecorator_1 = class DirtyDiffDecorator extends lifecycle_1.Disposable {
        static createDecoration(className, tooltip, options) {
            const decorationOptions = {
                description: 'dirty-diff-decoration',
                isWholeLine: options.isWholeLine,
            };
            if (options.gutter) {
                decorationOptions.linesDecorationsClassName = `dirty-diff-glyph ${className}`;
                decorationOptions.linesDecorationsTooltip = tooltip;
            }
            if (options.overview.active) {
                decorationOptions.overviewRuler = {
                    color: (0, themeService_1.themeColorFromId)(options.overview.color),
                    position: model_1.OverviewRulerLane.Left
                };
            }
            if (options.minimap.active) {
                decorationOptions.minimap = {
                    color: (0, themeService_1.themeColorFromId)(options.minimap.color),
                    position: model_1.MinimapPosition.Gutter
                };
            }
            return textModel_1.ModelDecorationOptions.createDynamic(decorationOptions);
        }
        constructor(editorModel, codeEditor, model, configurationService) {
            super();
            this.codeEditor = codeEditor;
            this.model = model;
            this.configurationService = configurationService;
            this.editorModel = editorModel;
            const decorations = configurationService.getValue('scm.diffDecorations');
            const gutter = decorations === 'all' || decorations === 'gutter';
            const overview = decorations === 'all' || decorations === 'overview';
            const minimap = decorations === 'all' || decorations === 'minimap';
            const diffAdded = nls.localize('diffAdded', 'Added lines');
            this.addedOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-added', diffAdded, {
                gutter,
                overview: { active: overview, color: overviewRulerAddedForeground },
                minimap: { active: minimap, color: minimapGutterAddedBackground },
                isWholeLine: true
            });
            this.addedPatternOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-added-pattern', diffAdded, {
                gutter,
                overview: { active: overview, color: overviewRulerAddedForeground },
                minimap: { active: minimap, color: minimapGutterAddedBackground },
                isWholeLine: true
            });
            const diffModified = nls.localize('diffModified', 'Changed lines');
            this.modifiedOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-modified', diffModified, {
                gutter,
                overview: { active: overview, color: overviewRulerModifiedForeground },
                minimap: { active: minimap, color: minimapGutterModifiedBackground },
                isWholeLine: true
            });
            this.modifiedPatternOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-modified-pattern', diffModified, {
                gutter,
                overview: { active: overview, color: overviewRulerModifiedForeground },
                minimap: { active: minimap, color: minimapGutterModifiedBackground },
                isWholeLine: true
            });
            this.deletedOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-deleted', nls.localize('diffDeleted', 'Removed lines'), {
                gutter,
                overview: { active: overview, color: overviewRulerDeletedForeground },
                minimap: { active: minimap, color: minimapGutterDeletedBackground },
                isWholeLine: false
            });
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('scm.diffDecorationsGutterPattern')) {
                    this.onDidChange();
                }
            }));
            this._register(model.onDidChange(this.onDidChange, this));
        }
        onDidChange() {
            if (!this.editorModel) {
                return;
            }
            const pattern = this.configurationService.getValue('scm.diffDecorationsGutterPattern');
            const decorations = this.model.changes.map((labeledChange) => {
                const change = labeledChange.change;
                const changeType = getChangeType(change);
                const startLineNumber = change.modifiedStartLineNumber;
                const endLineNumber = change.modifiedEndLineNumber || startLineNumber;
                switch (changeType) {
                    case ChangeType.Add:
                        return {
                            range: {
                                startLineNumber: startLineNumber, startColumn: 1,
                                endLineNumber: endLineNumber, endColumn: 1
                            },
                            options: pattern.added ? this.addedPatternOptions : this.addedOptions
                        };
                    case ChangeType.Delete:
                        return {
                            range: {
                                startLineNumber: startLineNumber, startColumn: Number.MAX_VALUE,
                                endLineNumber: startLineNumber, endColumn: Number.MAX_VALUE
                            },
                            options: this.deletedOptions
                        };
                    case ChangeType.Modify:
                        return {
                            range: {
                                startLineNumber: startLineNumber, startColumn: 1,
                                endLineNumber: endLineNumber, endColumn: 1
                            },
                            options: pattern.modified ? this.modifiedPatternOptions : this.modifiedOptions
                        };
                }
            });
            if (!this.decorationsCollection) {
                this.decorationsCollection = this.codeEditor.createDecorationsCollection(decorations);
            }
            else {
                this.decorationsCollection.set(decorations);
            }
        }
        dispose() {
            super.dispose();
            if (this.decorationsCollection) {
                this.decorationsCollection?.clear();
            }
            this.editorModel = null;
            this.decorationsCollection = undefined;
        }
    };
    DirtyDiffDecorator = DirtyDiffDecorator_1 = __decorate([
        __param(3, configuration_1.IConfigurationService)
    ], DirtyDiffDecorator);
    function compareChanges(a, b) {
        let result = a.modifiedStartLineNumber - b.modifiedStartLineNumber;
        if (result !== 0) {
            return result;
        }
        result = a.modifiedEndLineNumber - b.modifiedEndLineNumber;
        if (result !== 0) {
            return result;
        }
        result = a.originalStartLineNumber - b.originalStartLineNumber;
        if (result !== 0) {
            return result;
        }
        return a.originalEndLineNumber - b.originalEndLineNumber;
    }
    async function getOriginalResource(quickDiffService, uri, language, isSynchronized) {
        const quickDiffs = await quickDiffService.getQuickDiffs(uri, language, isSynchronized);
        return quickDiffs.length > 0 ? quickDiffs[0].originalResource : null;
    }
    exports.getOriginalResource = getOriginalResource;
    let DirtyDiffModel = class DirtyDiffModel extends lifecycle_1.Disposable {
        get original() { return this._originalTextModels; }
        get changes() { return this._changes; }
        get mapChanges() { return this._mapChanges; }
        constructor(textFileModel, scmService, quickDiffService, editorWorkerService, configurationService, textModelResolverService, progressService) {
            super();
            this.scmService = scmService;
            this.quickDiffService = quickDiffService;
            this.editorWorkerService = editorWorkerService;
            this.configurationService = configurationService;
            this.textModelResolverService = textModelResolverService;
            this.progressService = progressService;
            this._quickDiffs = [];
            this._originalModels = new Map(); // key is uri.toString()
            this._originalTextModels = [];
            this.diffDelayer = new async_1.ThrottledDelayer(200);
            this.repositoryDisposables = new Set();
            this.originalModelDisposables = this._register(new lifecycle_1.DisposableStore());
            this._disposed = false;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._changes = [];
            this._mapChanges = new Map(); // key is the quick diff name, value is the index of the change in this._changes
            this._model = textFileModel;
            this._register(textFileModel.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
            this._register(event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsIgnoreTrimWhitespace') || e.affectsConfiguration('diffEditor.ignoreTrimWhitespace'))(this.triggerDiff, this));
            this._register(scmService.onDidAddRepository(this.onDidAddRepository, this));
            for (const r of scmService.repositories) {
                this.onDidAddRepository(r);
            }
            this._register(this._model.onDidChangeEncoding(() => {
                this.diffDelayer.cancel();
                this._quickDiffs = [];
                this._originalModels.clear();
                this._originalTextModels = [];
                this._quickDiffsPromise = undefined;
                this.setChanges([], new Map());
                this.triggerDiff();
            }));
            this._register(this.quickDiffService.onDidChangeQuickDiffProviders(() => this.triggerDiff()));
            this.triggerDiff();
        }
        get quickDiffs() {
            return this._quickDiffs;
        }
        getDiffEditorModel(originalUri) {
            if (!this._originalModels.has(originalUri)) {
                return;
            }
            const original = this._originalModels.get(originalUri);
            return {
                modified: this._model.textEditorModel,
                original: original.textEditorModel
            };
        }
        onDidAddRepository(repository) {
            const disposables = new lifecycle_1.DisposableStore();
            this.repositoryDisposables.add(disposables);
            disposables.add((0, lifecycle_1.toDisposable)(() => this.repositoryDisposables.delete(disposables)));
            const onDidChange = event_1.Event.any(repository.provider.onDidChange, repository.provider.onDidChangeResources);
            disposables.add(onDidChange(this.triggerDiff, this));
            const onDidRemoveThis = event_1.Event.filter(this.scmService.onDidRemoveRepository, r => r === repository);
            disposables.add(onDidRemoveThis(() => (0, lifecycle_1.dispose)(disposables), null));
            this.triggerDiff();
        }
        triggerDiff() {
            if (!this.diffDelayer) {
                return Promise.resolve(null);
            }
            return this.diffDelayer
                .trigger(() => this.diff())
                .then((result) => {
                const originalModels = Array.from(this._originalModels.values());
                if (!result || this._disposed || this._model.isDisposed() || originalModels.some(originalModel => originalModel.isDisposed())) {
                    return; // disposed
                }
                if (originalModels.every(originalModel => originalModel.textEditorModel.getValueLength() === 0)) {
                    result.changes = [];
                }
                if (!result.changes) {
                    result.changes = [];
                }
                this.setChanges(result.changes, result.mapChanges);
            }, (err) => (0, errors_1.onUnexpectedError)(err));
        }
        setChanges(changes, mapChanges) {
            const diff = (0, arrays_1.sortedDiff)(this._changes, changes, (a, b) => compareChanges(a.change, b.change));
            this._changes = changes;
            this._mapChanges = mapChanges;
            this._onDidChange.fire({ changes, diff });
        }
        diff() {
            return this.progressService.withProgress({ location: 3 /* ProgressLocation.Scm */, delay: 250 }, async () => {
                const originalURIs = await this.getQuickDiffsPromise();
                if (this._disposed || this._model.isDisposed() || (originalURIs.length === 0)) {
                    return Promise.resolve({ changes: [], mapChanges: new Map() }); // disposed
                }
                const filteredToDiffable = originalURIs.filter(quickDiff => this.editorWorkerService.canComputeDirtyDiff(quickDiff.originalResource, this._model.resource));
                if (filteredToDiffable.length === 0) {
                    return Promise.resolve({ changes: [], mapChanges: new Map() }); // All files are too large
                }
                const ignoreTrimWhitespaceSetting = this.configurationService.getValue('scm.diffDecorationsIgnoreTrimWhitespace');
                const ignoreTrimWhitespace = ignoreTrimWhitespaceSetting === 'inherit'
                    ? this.configurationService.getValue('diffEditor.ignoreTrimWhitespace')
                    : ignoreTrimWhitespaceSetting !== 'false';
                const allDiffs = [];
                for (const quickDiff of filteredToDiffable) {
                    const dirtyDiff = await this.editorWorkerService.computeDirtyDiff(quickDiff.originalResource, this._model.resource, ignoreTrimWhitespace);
                    if (dirtyDiff) {
                        for (const diff of dirtyDiff) {
                            if (diff) {
                                allDiffs.push({ change: diff, label: quickDiff.label, uri: quickDiff.originalResource });
                            }
                        }
                    }
                }
                const sorted = allDiffs.sort((a, b) => compareChanges(a.change, b.change));
                const map = new Map();
                for (let i = 0; i < sorted.length; i++) {
                    const label = sorted[i].label;
                    if (!map.has(label)) {
                        map.set(label, []);
                    }
                    map.get(label).push(i);
                }
                return { changes: sorted, mapChanges: map };
            });
        }
        getQuickDiffsPromise() {
            if (this._quickDiffsPromise) {
                return this._quickDiffsPromise;
            }
            this._quickDiffsPromise = this.getOriginalResource().then(async (quickDiffs) => {
                if (this._disposed) { // disposed
                    return [];
                }
                if (quickDiffs.length === 0) {
                    this._quickDiffs = [];
                    this._originalModels.clear();
                    this._originalTextModels = [];
                    return [];
                }
                if ((0, arrays_1.equals)(this._quickDiffs, quickDiffs, (a, b) => a.originalResource.toString() === b.originalResource.toString() && a.label === b.label)) {
                    return quickDiffs;
                }
                this.originalModelDisposables.clear();
                this._originalModels.clear();
                this._originalTextModels = [];
                this._quickDiffs = quickDiffs;
                return (await Promise.all(quickDiffs.map(async (quickDiff) => {
                    try {
                        const ref = await this.textModelResolverService.createModelReference(quickDiff.originalResource);
                        if (this._disposed) { // disposed
                            ref.dispose();
                            return [];
                        }
                        this._originalModels.set(quickDiff.originalResource.toString(), ref.object);
                        this._originalTextModels.push(ref.object.textEditorModel);
                        if ((0, textfiles_1.isTextFileEditorModel)(ref.object)) {
                            const encoding = this._model.getEncoding();
                            if (encoding) {
                                ref.object.setEncoding(encoding, 1 /* EncodingMode.Decode */);
                            }
                        }
                        this.originalModelDisposables.add(ref);
                        this.originalModelDisposables.add(ref.object.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
                        return quickDiff;
                    }
                    catch (error) {
                        return []; // possibly invalid reference
                    }
                }))).flat();
            });
            return this._quickDiffsPromise.finally(() => {
                this._quickDiffsPromise = undefined;
            });
        }
        async getOriginalResource() {
            if (this._disposed) {
                return Promise.resolve([]);
            }
            const uri = this._model.resource;
            return this.quickDiffService.getQuickDiffs(uri, this._model.getLanguageId(), this._model.textEditorModel ? (0, model_1.shouldSynchronizeModel)(this._model.textEditorModel) : undefined);
        }
        findNextClosestChange(lineNumber, inclusive = true, provider) {
            let preferredProvider;
            if (!provider && inclusive) {
                preferredProvider = this.quickDiffs.find(value => value.isSCM)?.label;
            }
            const possibleChanges = [];
            for (let i = 0; i < this.changes.length; i++) {
                if (provider && this.changes[i].label !== provider) {
                    continue;
                }
                const change = this.changes[i];
                const possibleChangesLength = possibleChanges.length;
                if (inclusive) {
                    if (getModifiedEndLineNumber(change.change) >= lineNumber) {
                        if (preferredProvider && change.label !== preferredProvider) {
                            possibleChanges.push(i);
                        }
                        else {
                            return i;
                        }
                    }
                }
                else {
                    if (change.change.modifiedStartLineNumber > lineNumber) {
                        return i;
                    }
                }
                if ((possibleChanges.length > 0) && (possibleChanges.length === possibleChangesLength)) {
                    return possibleChanges[0];
                }
            }
            return possibleChanges.length > 0 ? possibleChanges[0] : 0;
        }
        findPreviousClosestChange(lineNumber, inclusive = true, provider) {
            for (let i = this.changes.length - 1; i >= 0; i--) {
                if (provider && this.changes[i].label !== provider) {
                    continue;
                }
                const change = this.changes[i].change;
                if (inclusive) {
                    if (change.modifiedStartLineNumber <= lineNumber) {
                        return i;
                    }
                }
                else {
                    if (getModifiedEndLineNumber(change) < lineNumber) {
                        return i;
                    }
                }
            }
            return this.changes.length - 1;
        }
        dispose() {
            super.dispose();
            this._disposed = true;
            this._quickDiffs = [];
            this._originalModels.clear();
            this._originalTextModels = [];
            this.diffDelayer.cancel();
            this.repositoryDisposables.forEach(d => (0, lifecycle_1.dispose)(d));
            this.repositoryDisposables.clear();
        }
    };
    exports.DirtyDiffModel = DirtyDiffModel;
    exports.DirtyDiffModel = DirtyDiffModel = __decorate([
        __param(1, scm_1.ISCMService),
        __param(2, quickDiff_1.IQuickDiffService),
        __param(3, editorWorker_1.IEditorWorkerService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, resolverService_1.ITextModelService),
        __param(6, progress_1.IProgressService)
    ], DirtyDiffModel);
    class DirtyDiffItem {
        constructor(model, decorator) {
            this.model = model;
            this.decorator = decorator;
        }
        dispose() {
            this.decorator.dispose();
            this.model.dispose();
        }
    }
    let DirtyDiffWorkbenchController = class DirtyDiffWorkbenchController extends lifecycle_1.Disposable {
        constructor(editorService, instantiationService, configurationService, textFileService) {
            super();
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.textFileService = textFileService;
            this.enabled = false;
            this.viewState = { width: 3, visibility: 'always' };
            this.items = new map_1.ResourceMap(); // resource -> editor id -> DirtyDiffItem
            this.transientDisposables = this._register(new lifecycle_1.DisposableStore());
            this.stylesheet = dom.createStyleSheet(undefined, undefined, this._store);
            const onDidChangeConfiguration = event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorations'));
            this._register(onDidChangeConfiguration(this.onDidChangeConfiguration, this));
            this.onDidChangeConfiguration();
            const onDidChangeDiffWidthConfiguration = event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterWidth'));
            onDidChangeDiffWidthConfiguration(this.onDidChangeDiffWidthConfiguration, this);
            this.onDidChangeDiffWidthConfiguration();
            const onDidChangeDiffVisibilityConfiguration = event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterVisibility'));
            onDidChangeDiffVisibilityConfiguration(this.onDidChangeDiffVisibiltiyConfiguration, this);
            this.onDidChangeDiffVisibiltiyConfiguration();
        }
        onDidChangeConfiguration() {
            const enabled = this.configurationService.getValue('scm.diffDecorations') !== 'none';
            if (enabled) {
                this.enable();
            }
            else {
                this.disable();
            }
        }
        onDidChangeDiffWidthConfiguration() {
            let width = this.configurationService.getValue('scm.diffDecorationsGutterWidth');
            if (isNaN(width) || width <= 0 || width > 5) {
                width = 3;
            }
            this.setViewState({ ...this.viewState, width });
        }
        onDidChangeDiffVisibiltiyConfiguration() {
            const visibility = this.configurationService.getValue('scm.diffDecorationsGutterVisibility');
            this.setViewState({ ...this.viewState, visibility });
        }
        setViewState(state) {
            this.viewState = state;
            this.stylesheet.textContent = `
			.monaco-editor .dirty-diff-added,
			.monaco-editor .dirty-diff-modified {
				border-left-width:${state.width}px;
			}
			.monaco-editor .dirty-diff-added-pattern,
			.monaco-editor .dirty-diff-added-pattern:before,
			.monaco-editor .dirty-diff-modified-pattern,
			.monaco-editor .dirty-diff-modified-pattern:before {
				background-size: ${state.width}px ${state.width}px;
			}
			.monaco-editor .dirty-diff-added,
			.monaco-editor .dirty-diff-added-pattern,
			.monaco-editor .dirty-diff-modified,
			.monaco-editor .dirty-diff-modified-pattern,
			.monaco-editor .dirty-diff-deleted {
				opacity: ${state.visibility === 'always' ? 1 : 0};
			}
		`;
        }
        enable() {
            if (this.enabled) {
                this.disable();
            }
            this.transientDisposables.add(event_1.Event.any(this.editorService.onDidCloseEditor, this.editorService.onDidVisibleEditorsChange)(() => this.onEditorsChanged()));
            this.onEditorsChanged();
            this.enabled = true;
        }
        disable() {
            if (!this.enabled) {
                return;
            }
            this.transientDisposables.clear();
            for (const [, dirtyDiff] of this.items) {
                (0, lifecycle_1.dispose)(dirtyDiff.values());
            }
            this.items.clear();
            this.enabled = false;
        }
        onEditorsChanged() {
            for (const editor of this.editorService.visibleTextEditorControls) {
                if ((0, editorBrowser_1.isCodeEditor)(editor)) {
                    const textModel = editor.getModel();
                    const controller = DirtyDiffController.get(editor);
                    if (controller) {
                        controller.modelRegistry = this;
                    }
                    if (textModel && (!this.items.has(textModel.uri) || !this.items.get(textModel.uri).has(editor.getId()))) {
                        const textFileModel = this.textFileService.files.get(textModel.uri);
                        if (textFileModel?.isResolved()) {
                            const dirtyDiffModel = this.instantiationService.createInstance(DirtyDiffModel, textFileModel);
                            const decorator = new DirtyDiffDecorator(textFileModel.textEditorModel, editor, dirtyDiffModel, this.configurationService);
                            if (!this.items.has(textModel.uri)) {
                                this.items.set(textModel.uri, new Map());
                            }
                            this.items.get(textModel.uri)?.set(editor.getId(), new DirtyDiffItem(dirtyDiffModel, decorator));
                        }
                    }
                }
            }
            for (const [uri, item] of this.items) {
                for (const editorId of item.keys()) {
                    if (!this.editorService.visibleTextEditorControls.find(editor => (0, editorBrowser_1.isCodeEditor)(editor) && editor.getModel()?.uri.toString() === uri.toString() && editor.getId() === editorId)) {
                        if (item.has(editorId)) {
                            const dirtyDiffItem = item.get(editorId);
                            dirtyDiffItem?.dispose();
                            item.delete(editorId);
                            if (item.size === 0) {
                                this.items.delete(uri);
                            }
                        }
                    }
                }
            }
        }
        getModel(editorModel, codeEditor) {
            return this.items.get(editorModel.uri)?.get(codeEditor.getId())?.model;
        }
        dispose() {
            this.disable();
            super.dispose();
        }
    };
    exports.DirtyDiffWorkbenchController = DirtyDiffWorkbenchController;
    exports.DirtyDiffWorkbenchController = DirtyDiffWorkbenchController = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, textfiles_1.ITextFileService)
    ], DirtyDiffWorkbenchController);
    (0, editorExtensions_1.registerEditorContribution)(DirtyDiffController.ID, DirtyDiffController, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlydHlkaWZmRGVjb3JhdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zY20vYnJvd3Nlci9kaXJ0eWRpZmZEZWNvcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTBEaEcsTUFBTSxnQkFBaUIsU0FBUSxzQkFBWTtRQUV2QixTQUFTLENBQUMsTUFBZSxFQUFFLE9BQVk7WUFDekQsSUFBSSxNQUFNLFlBQVksd0JBQWMsRUFBRSxDQUFDO2dCQUN0QyxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztZQUMvQixDQUFDO1lBRUQsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQ0Q7SUFVWSxRQUFBLGtCQUFrQixHQUFHLElBQUksMEJBQWEsQ0FBVSxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUV4RixTQUFTLGVBQWUsQ0FBQyxNQUFlO1FBQ3ZDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxNQUFNLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO1FBQ25GLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxNQUFNLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO1FBRW5GLElBQUksTUFBTSxDQUFDLHFCQUFxQixLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3hDLE9BQU8sUUFBUSxDQUFDO1FBQ2pCLENBQUM7YUFBTSxJQUFJLE1BQU0sQ0FBQyxxQkFBcUIsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMvQyxPQUFPLFFBQVEsQ0FBQztRQUNqQixDQUFDO2FBQU0sQ0FBQztZQUNQLE9BQU8sUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUM1QixD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