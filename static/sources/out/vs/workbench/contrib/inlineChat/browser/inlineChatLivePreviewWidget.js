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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/types", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/editor/common/core/lineRange", "vs/editor/common/core/position", "vs/editor/browser/editorExtensions", "vs/platform/log/common/log", "vs/workbench/contrib/inlineChat/browser/utils", "vs/workbench/browser/labels", "vs/platform/files/common/files", "vs/editor/contrib/folding/browser/folding", "vs/platform/accessibility/common/accessibility", "vs/base/common/uuid", "vs/editor/common/services/resolverService", "vs/base/browser/ui/button/button", "vs/platform/theme/browser/defaultStyles", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/platform/contextview/browser/contextView", "vs/base/common/actions", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/codicons", "vs/workbench/common/theme", "vs/nls", "vs/base/common/event"], function (require, exports, dom_1, lifecycle_1, types_1, embeddedCodeEditorWidget_1, zoneWidget_1, instantiation_1, colorRegistry, editorColorRegistry, themeService_1, inlineChat_1, lineRange_1, position_1, editorExtensions_1, log_1, utils_1, labels_1, files_1, folding_1, accessibility_1, uuid_1, resolverService_1, button_1, defaultStyles_1, editor_1, editorService_1, contextView_1, actions_1, iconLabels_1, codicons_1, theme_1, nls_1, event_1) {
    "use strict";
    var InlineChatFileCreatePreviewWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineChatFileCreatePreviewWidget = exports.InlineChatLivePreviewWidget = void 0;
    let InlineChatLivePreviewWidget = class InlineChatLivePreviewWidget extends zoneWidget_1.ZoneWidget {
        constructor(editor, _session, options, onDidChangeDiff, instantiationService, themeService, _logService, accessibilityService) {
            super(editor, { showArrow: false, showFrame: false, isResizeable: false, isAccessible: true, allowUnlimitedHeight: true, showInHiddenAreas: true, keepEditorSelection: true, ordinal: 10000 + 1 });
            this._session = _session;
            this._logService = _logService;
            this.accessibilityService = accessibilityService;
            this._hideId = `overlayDiff:${(0, uuid_1.generateUuid)()}`;
            this._elements = (0, dom_1.h)('div.inline-chat-diff-widget@domNode');
            this._isVisible = false;
            super.create();
            (0, types_1.assertType)(editor.hasModel());
            this._decorationCollection = editor.createDecorationsCollection();
            const diffContributions = editorExtensions_1.EditorExtensionsRegistry
                .getEditorContributions()
                .filter(c => c.id !== inlineChat_1.INLINE_CHAT_ID && c.id !== folding_1.FoldingController.ID);
            this._diffEditor = instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget, this._elements.domNode, {
                scrollbar: { useShadows: false, alwaysConsumeMouseWheel: false, ignoreHorizontalScrollbarInContentHeight: true, },
                scrollBeyondLastLine: false,
                renderMarginRevertIcon: true,
                renderOverviewRuler: false,
                rulers: undefined,
                overviewRulerBorder: undefined,
                overviewRulerLanes: 0,
                diffAlgorithm: 'advanced',
                splitViewDefaultRatio: 0.35,
                padding: { top: 0, bottom: 0 },
                folding: false,
                diffCodeLens: false,
                stickyScroll: { enabled: false },
                minimap: { enabled: false },
                isInEmbeddedEditor: true,
                useInlineViewWhenSpaceIsLimited: false,
                overflowWidgetsDomNode: editor.getOverflowWidgetsDomNode(),
                onlyShowAccessibleDiffViewer: this.accessibilityService.isScreenReaderOptimized(),
                ...options
            }, {
                originalEditor: { contributions: diffContributions },
                modifiedEditor: { contributions: diffContributions }
            }, editor);
            this._disposables.add(this._diffEditor);
            this._diffEditor.setModel({ original: this._session.textModel0, modified: editor.getModel() });
            this._diffEditor.updateOptions({
                lineDecorationsWidth: editor.getLayoutInfo().decorationsWidth
            });
            if (onDidChangeDiff) {
                this._disposables.add(this._diffEditor.onDidUpdateDiff(() => { onDidChangeDiff(); }));
                const render = this._disposables.add(new lifecycle_1.MutableDisposable());
                this._disposables.add(this._diffEditor.onDidContentSizeChange(e => {
                    if (!this._isVisible || !e.contentHeightChanged) {
                        return;
                    }
                    render.value = (0, dom_1.runAtThisOrScheduleAtNextAnimationFrame)((0, dom_1.getWindow)(this._diffEditor.getContainerDomNode()), () => {
                        const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
                        const heightInLines = e.contentHeight / lineHeight;
                        this._logService.debug(`[IE] relaying with ${heightInLines} lines height`);
                        this._relayout(heightInLines);
                    });
                }));
            }
            const doStyle = () => {
                const theme = themeService.getColorTheme();
                const overrides = [
                    [colorRegistry.editorBackground, inlineChat_1.inlineChatRegionHighlight],
                    [editorColorRegistry.editorGutter, inlineChat_1.inlineChatRegionHighlight],
                    [colorRegistry.diffInsertedLine, inlineChat_1.inlineChatDiffInserted],
                    [colorRegistry.diffInserted, inlineChat_1.inlineChatDiffInserted],
                    [colorRegistry.diffRemovedLine, inlineChat_1.inlineChatDiffRemoved],
                    [colorRegistry.diffRemoved, inlineChat_1.inlineChatDiffRemoved],
                ];
                for (const [target, source] of overrides) {
                    const value = theme.getColor(source);
                    if (value) {
                        this._elements.domNode.style.setProperty(colorRegistry.asCssVariableName(target), String(value));
                    }
                }
            };
            doStyle();
            this._disposables.add(themeService.onDidColorThemeChange(doStyle));
        }
        _fillContainer(container) {
            container.appendChild(this._elements.domNode);
        }
        // --- show / hide --------------------
        get isVisible() {
            return this._isVisible;
        }
        hide() {
            this._decorationCollection.clear();
            this._cleanupFullDiff();
            super.hide();
            this._isVisible = false;
        }
        show() {
            throw new Error('use showForChanges');
        }
        showForChanges(hunk) {
            const hasFocus = this._diffEditor.hasTextFocus();
            this._isVisible = true;
            const onlyInserts = hunk.isInsertion();
            if (onlyInserts || this._session.textModel0.getValueLength() === 0) {
                // no change or changes to an empty file
                this._logService.debug('[IE] livePreview-mode: no diff');
                this._cleanupFullDiff();
                this._renderInsertWithHighlight(hunk);
            }
            else {
                // complex changes
                this._logService.debug('[IE] livePreview-mode: full diff');
                this._decorationCollection.clear();
                this._renderChangesWithFullDiff(hunk);
            }
            // TODO@jrieken find a better fix for this. this is the challenge:
            // the `_updateFromChanges` method invokes show of the zone widget which removes and adds the
            // zone and overlay parts. this dettaches and reattaches the dom nodes which means they lose
            // focus
            if (hasFocus) {
                this._diffEditor.focus();
            }
        }
        _renderInsertWithHighlight(hunk) {
            (0, types_1.assertType)(this.editor.hasModel());
            const options = {
                description: 'inline-chat-insert',
                showIfCollapsed: false,
                isWholeLine: true,
                className: 'inline-chat-lines-inserted-range',
            };
            this._decorationCollection.set([{
                    range: hunk.getRangesN()[0],
                    options
                }]);
        }
        // --- full diff
        _renderChangesWithFullDiff(hunk) {
            (0, types_1.assertType)(this.editor.hasModel());
            const ranges = this._computeHiddenRanges(this._session.textModelN, hunk);
            this._hideEditorRanges(this.editor, [ranges.modifiedHidden]);
            this._hideEditorRanges(this._diffEditor.getOriginalEditor(), ranges.originalDiffHidden);
            this._hideEditorRanges(this._diffEditor.getModifiedEditor(), ranges.modifiedDiffHidden);
            // this._diffEditor.revealLine(ranges.modifiedHidden.startLineNumber, ScrollType.Immediate);
            const lineCountModified = ranges.modifiedHidden.length;
            const lineCountOriginal = ranges.originalHidden.length;
            const heightInLines = Math.max(lineCountModified, lineCountOriginal);
            super.show(ranges.anchor, heightInLines);
            this._logService.debug(`[IE] diff SHOWING at ${ranges.anchor} with ${heightInLines} (approx) lines height`);
        }
        _cleanupFullDiff() {
            this.editor.setHiddenAreas([], this._hideId);
            this._diffEditor.getOriginalEditor().setHiddenAreas([], this._hideId);
            this._diffEditor.getModifiedEditor().setHiddenAreas([], this._hideId);
            super.hide();
            this._isVisible = false;
        }
        _computeHiddenRanges(model, hunk) {
            const modifiedLineRange = lineRange_1.LineRange.fromRangeInclusive(hunk.getRangesN()[0]);
            let originalLineRange = lineRange_1.LineRange.fromRangeInclusive(hunk.getRanges0()[0]);
            if (originalLineRange.isEmpty) {
                originalLineRange = new lineRange_1.LineRange(originalLineRange.startLineNumber, originalLineRange.endLineNumberExclusive + 1);
            }
            const originalDiffHidden = (0, utils_1.invertLineRange)(originalLineRange, this._session.textModel0);
            const modifiedDiffHidden = (0, utils_1.invertLineRange)(modifiedLineRange, model);
            return {
                originalHidden: originalLineRange,
                originalDiffHidden,
                modifiedHidden: modifiedLineRange,
                modifiedDiffHidden,
                anchor: new position_1.Position(modifiedLineRange.startLineNumber - 1, 1)
            };
        }
        _hideEditorRanges(editor, lineRanges) {
            (0, types_1.assertType)(editor.hasModel());
            lineRanges = lineRanges.filter(range => !range.isEmpty);
            if (lineRanges.length === 0) {
                // todo?
                this._logService.debug(`[IE] diff NOTHING to hide for ${editor.getId()} with ${String(editor.getModel()?.uri)}`);
                return;
            }
            let hiddenRanges;
            const hiddenLinesCount = lineRanges.reduce((p, c) => p + c.length, 0); // assumes no overlap
            if (hiddenLinesCount >= editor.getModel().getLineCount()) {
                // TODO: not every line can be hidden, keep the first line around
                hiddenRanges = [editor.getModel().getFullModelRange().delta(1)];
            }
            else {
                hiddenRanges = lineRanges.map(lr => (0, utils_1.asRange)(lr, editor.getModel()));
            }
            editor.setHiddenAreas(hiddenRanges, this._hideId);
            this._logService.debug(`[IE] diff HIDING ${hiddenRanges} for ${editor.getId()} with ${String(editor.getModel()?.uri)}`);
        }
        revealRange(range, isLastLine) {
            // ignore
        }
        // --- layout -------------------------
        _onWidth(widthInPixel) {
            if (this._dim) {
                this._doLayout(this._dim.height, widthInPixel);
            }
        }
        _doLayout(heightInPixel, widthInPixel) {
            const newDim = new dom_1.Dimension(widthInPixel, heightInPixel);
            if (!dom_1.Dimension.equals(this._dim, newDim)) {
                this._dim = newDim;
                this._diffEditor.layout(this._dim.with(undefined, this._dim.height));
                this._logService.debug('[IE] diff LAYOUT', this._dim);
            }
        }
    };
    exports.InlineChatLivePreviewWidget = InlineChatLivePreviewWidget;
    exports.InlineChatLivePreviewWidget = InlineChatLivePreviewWidget = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, themeService_1.IThemeService),
        __param(6, log_1.ILogService),
        __param(7, accessibility_1.IAccessibilityService)
    ], InlineChatLivePreviewWidget);
    let InlineChatFileCreatePreviewWidget = class InlineChatFileCreatePreviewWidget extends zoneWidget_1.ZoneWidget {
        static { InlineChatFileCreatePreviewWidget_1 = this; }
        static { this.TitleHeight = 35; }
        constructor(parentEditor, instaService, themeService, _textModelResolverService, _editorService) {
            super(parentEditor, {
                showArrow: false,
                showFrame: true,
                frameColor: colorRegistry.asCssVariable(theme_1.TAB_ACTIVE_MODIFIED_BORDER),
                frameWidth: 1,
                isResizeable: true,
                isAccessible: true,
                showInHiddenAreas: true,
                ordinal: 10000 + 2
            });
            this._textModelResolverService = _textModelResolverService;
            this._editorService = _editorService;
            this._elements = (0, dom_1.h)('div.inline-chat-newfile-widget@domNode', [
                (0, dom_1.h)('div.title@title', [
                    (0, dom_1.h)('span.name.show-file-icons@name'),
                    (0, dom_1.h)('span.detail@detail'),
                ]),
                (0, dom_1.h)('div.editor@editor'),
            ]);
            this._previewStore = new lifecycle_1.MutableDisposable();
            super.create();
            this._name = instaService.createInstance(labels_1.ResourceLabel, this._elements.name, { supportIcons: true });
            this._elements.detail.appendChild((0, iconLabels_1.renderIcon)(codicons_1.Codicon.circleFilled));
            const contributions = editorExtensions_1.EditorExtensionsRegistry
                .getEditorContributions()
                .filter(c => c.id !== inlineChat_1.INLINE_CHAT_ID);
            this._previewEditor = instaService.createInstance(embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget, this._elements.editor, {
                scrollBeyondLastLine: false,
                stickyScroll: { enabled: false },
                minimap: { enabled: false },
                scrollbar: { alwaysConsumeMouseWheel: false, useShadows: true, ignoreHorizontalScrollbarInContentHeight: true, },
            }, { isSimpleWidget: true, contributions }, parentEditor);
            const doStyle = () => {
                const theme = themeService.getColorTheme();
                const overrides = [
                    [colorRegistry.editorBackground, inlineChat_1.inlineChatRegionHighlight],
                    [editorColorRegistry.editorGutter, inlineChat_1.inlineChatRegionHighlight],
                ];
                for (const [target, source] of overrides) {
                    const value = theme.getColor(source);
                    if (value) {
                        this._elements.domNode.style.setProperty(colorRegistry.asCssVariableName(target), String(value));
                    }
                }
            };
            doStyle();
            this._disposables.add(themeService.onDidColorThemeChange(doStyle));
            this._buttonBar = instaService.createInstance(ButtonBarWidget);
            this._elements.title.appendChild(this._buttonBar.domNode);
        }
        dispose() {
            this._name.dispose();
            this._buttonBar.dispose();
            this._previewEditor.dispose();
            this._previewStore.dispose();
            super.dispose();
        }
        _fillContainer(container) {
            container.appendChild(this._elements.domNode);
        }
        show() {
            throw new Error('Use showFileCreation');
        }
        async showCreation(where, untitledTextModel) {
            const store = new lifecycle_1.DisposableStore();
            this._previewStore.value = store;
            this._name.element.setFile(untitledTextModel.resource, {
                fileKind: files_1.FileKind.FILE,
                fileDecorations: { badges: true, colors: true }
            });
            const actionSave = (0, actions_1.toAction)({
                id: '1',
                label: (0, nls_1.localize)('save', "Create"),
                run: () => untitledTextModel.save({ reason: 1 /* SaveReason.EXPLICIT */ })
            });
            const actionSaveAs = (0, actions_1.toAction)({
                id: '2',
                label: (0, nls_1.localize)('saveAs', "Create As"),
                run: async () => {
                    const ids = this._editorService.findEditors(untitledTextModel.resource, { supportSideBySide: editor_1.SideBySideEditor.ANY });
                    await this._editorService.save(ids.slice(), { saveAs: true, reason: 1 /* SaveReason.EXPLICIT */ });
                }
            });
            this._buttonBar.update([
                [actionSave, actionSaveAs],
                [((0, actions_1.toAction)({ id: '3', label: (0, nls_1.localize)('discard', "Discard"), run: () => untitledTextModel.revert() }))]
            ]);
            store.add(event_1.Event.any(untitledTextModel.onDidRevert, untitledTextModel.onDidSave, untitledTextModel.onDidChangeDirty, untitledTextModel.onWillDispose)(() => this.hide()));
            await untitledTextModel.resolve();
            const ref = await this._textModelResolverService.createModelReference(untitledTextModel.resource);
            store.add(ref);
            const model = ref.object.textEditorModel;
            this._previewEditor.setModel(model);
            const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
            this._elements.title.style.height = `${InlineChatFileCreatePreviewWidget_1.TitleHeight}px`;
            const titleHightInLines = InlineChatFileCreatePreviewWidget_1.TitleHeight / lineHeight;
            const maxLines = Math.max(4, Math.floor((this.editor.getLayoutInfo().height / lineHeight) * .33));
            const lines = Math.min(maxLines, model.getLineCount());
            super.show(where, titleHightInLines + lines);
        }
        hide() {
            this._previewStore.clear();
            super.hide();
        }
        // --- layout
        revealRange(range, isLastLine) {
            // ignore
        }
        _onWidth(widthInPixel) {
            if (this._dim) {
                this._doLayout(this._dim.height, widthInPixel);
            }
        }
        _doLayout(heightInPixel, widthInPixel) {
            const { lineNumbersLeft } = this.editor.getLayoutInfo();
            this._elements.title.style.marginLeft = `${lineNumbersLeft}px`;
            const newDim = new dom_1.Dimension(widthInPixel, heightInPixel);
            if (!dom_1.Dimension.equals(this._dim, newDim)) {
                this._dim = newDim;
                this._previewEditor.layout(this._dim.with(undefined, this._dim.height - InlineChatFileCreatePreviewWidget_1.TitleHeight));
            }
        }
    };
    exports.InlineChatFileCreatePreviewWidget = InlineChatFileCreatePreviewWidget;
    exports.InlineChatFileCreatePreviewWidget = InlineChatFileCreatePreviewWidget = InlineChatFileCreatePreviewWidget_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, themeService_1.IThemeService),
        __param(3, resolverService_1.ITextModelService),
        __param(4, editorService_1.IEditorService)
    ], InlineChatFileCreatePreviewWidget);
    let ButtonBarWidget = class ButtonBarWidget {
        constructor(_contextMenuService) {
            this._contextMenuService = _contextMenuService;
            this._domNode = (0, dom_1.h)('div.buttonbar-widget');
            this._store = new lifecycle_1.DisposableStore();
            this._buttonBar = new button_1.ButtonBar(this.domNode);
        }
        update(allActions) {
            this._buttonBar.clear();
            let secondary = false;
            for (const actions of allActions) {
                let btn;
                const [first, ...rest] = actions;
                if (!first) {
                    continue;
                }
                else if (rest.length === 0) {
                    // single action
                    btn = this._buttonBar.addButton({ ...defaultStyles_1.defaultButtonStyles, secondary });
                }
                else {
                    btn = this._buttonBar.addButtonWithDropdown({
                        ...defaultStyles_1.defaultButtonStyles,
                        addPrimaryActionToDropdown: false,
                        actions: rest,
                        contextMenuProvider: this._contextMenuService
                    });
                }
                btn.label = first.label;
                this._store.add(btn.onDidClick(() => first.run()));
                secondary = true;
            }
        }
        dispose() {
            this._buttonBar.dispose();
            this._store.dispose();
        }
        get domNode() {
            return this._domNode.root;
        }
    };
    ButtonBarWidget = __decorate([
        __param(0, contextView_1.IContextMenuService)
    ], ButtonBarWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdExpdmVQcmV2aWV3V2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9pbmxpbmVDaGF0L2Jyb3dzZXIvaW5saW5lQ2hhdExpdmVQcmV2aWV3V2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEyQ3pGLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTRCLFNBQVEsdUJBQVU7UUFZMUQsWUFDQyxNQUFtQixFQUNGLFFBQWlCLEVBQ2xDLE9BQTJCLEVBQzNCLGVBQXlDLEVBQ2xCLG9CQUEyQyxFQUNuRCxZQUEyQixFQUM3QixXQUF5QyxFQUMvQixvQkFBNEQ7WUFFbkYsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBUmxMLGFBQVEsR0FBUixRQUFRLENBQVM7WUFLSixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUNkLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFsQm5FLFlBQU8sR0FBRyxlQUFlLElBQUEsbUJBQVksR0FBRSxFQUFFLENBQUM7WUFFMUMsY0FBUyxHQUFHLElBQUEsT0FBQyxFQUFDLHFDQUFxQyxDQUFDLENBQUM7WUFNOUQsZUFBVSxHQUFZLEtBQUssQ0FBQztZQWFuQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZixJQUFBLGtCQUFVLEVBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7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