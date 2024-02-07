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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/color", "vs/base/common/event", "vs/base/common/objects", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/css!./media/peekViewWidget"], function (require, exports, dom, actionbar_1, actions_1, codicons_1, themables_1, color_1, event_1, objects, editorExtensions_1, codeEditorService_1, embeddedCodeEditorWidget_1, zoneWidget_1, nls, menuEntryActionViewItem_1, contextkey_1, extensions_1, instantiation_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.peekViewEditorMatchHighlightBorder = exports.peekViewEditorMatchHighlight = exports.peekViewResultsMatchHighlight = exports.peekViewEditorStickyScrollBackground = exports.peekViewEditorGutterBackground = exports.peekViewEditorBackground = exports.peekViewResultsSelectionForeground = exports.peekViewResultsSelectionBackground = exports.peekViewResultsFileForeground = exports.peekViewResultsMatchForeground = exports.peekViewResultsBackground = exports.peekViewBorder = exports.peekViewTitleInfoForeground = exports.peekViewTitleForeground = exports.peekViewTitleBackground = exports.PeekViewWidget = exports.getOuterEditor = exports.PeekContext = exports.IPeekViewService = void 0;
    exports.IPeekViewService = (0, instantiation_1.createDecorator)('IPeekViewService');
    (0, extensions_1.registerSingleton)(exports.IPeekViewService, class {
        constructor() {
            this._widgets = new Map();
        }
        addExclusiveWidget(editor, widget) {
            const existing = this._widgets.get(editor);
            if (existing) {
                existing.listener.dispose();
                existing.widget.dispose();
            }
            const remove = () => {
                const data = this._widgets.get(editor);
                if (data && data.widget === widget) {
                    data.listener.dispose();
                    this._widgets.delete(editor);
                }
            };
            this._widgets.set(editor, { widget, listener: widget.onDidClose(remove) });
        }
    }, 1 /* InstantiationType.Delayed */);
    var PeekContext;
    (function (PeekContext) {
        PeekContext.inPeekEditor = new contextkey_1.RawContextKey('inReferenceSearchEditor', true, nls.localize('inReferenceSearchEditor', "Whether the current code editor is embedded inside peek"));
        PeekContext.notInPeekEditor = PeekContext.inPeekEditor.toNegated();
    })(PeekContext || (exports.PeekContext = PeekContext = {}));
    let PeekContextController = class PeekContextController {
        static { this.ID = 'editor.contrib.referenceController'; }
        constructor(editor, contextKeyService) {
            if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
                PeekContext.inPeekEditor.bindTo(contextKeyService);
            }
        }
        dispose() { }
    };
    PeekContextController = __decorate([
        __param(1, contextkey_1.IContextKeyService)
    ], PeekContextController);
    (0, editorExtensions_1.registerEditorContribution)(PeekContextController.ID, PeekContextController, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to define a context key
    function getOuterEditor(accessor) {
        const editor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
        if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
            return editor.getParentEditor();
        }
        return editor;
    }
    exports.getOuterEditor = getOuterEditor;
    const defaultOptions = {
        headerBackgroundColor: color_1.Color.white,
        primaryHeadingColor: color_1.Color.fromHex('#333333'),
        secondaryHeadingColor: color_1.Color.fromHex('#6c6c6cb3')
    };
    let PeekViewWidget = class PeekViewWidget extends zoneWidget_1.ZoneWidget {
        constructor(editor, options, instantiationService) {
            super(editor, options);
            this.instantiationService = instantiationService;
            this._onDidClose = new event_1.Emitter();
            this.onDidClose = this._onDidClose.event;
            objects.mixin(this.options, defaultOptions, false);
        }
        dispose() {
            if (!this.disposed) {
                this.disposed = true; // prevent consumers who dispose on onDidClose from looping
                super.dispose();
                this._onDidClose.fire(this);
            }
        }
        style(styles) {
            const options = this.options;
            if (styles.headerBackgroundColor) {
                options.headerBackgroundColor = styles.headerBackgroundColor;
            }
            if (styles.primaryHeadingColor) {
                options.primaryHeadingColor = styles.primaryHeadingColor;
            }
            if (styles.secondaryHeadingColor) {
                options.secondaryHeadingColor = styles.secondaryHeadingColor;
            }
            super.style(styles);
        }
        _applyStyles() {
            super._applyStyles();
            const options = this.options;
            if (this._headElement && options.headerBackgroundColor) {
                this._headElement.style.backgroundColor = options.headerBackgroundColor.toString();
            }
            if (this._primaryHeading && options.primaryHeadingColor) {
                this._primaryHeading.style.color = options.primaryHeadingColor.toString();
            }
            if (this._secondaryHeading && options.secondaryHeadingColor) {
                this._secondaryHeading.style.color = options.secondaryHeadingColor.toString();
            }
            if (this._bodyElement && options.frameColor) {
                this._bodyElement.style.borderColor = options.frameColor.toString();
            }
        }
        _fillContainer(container) {
            this.setCssClass('peekview-widget');
            this._headElement = dom.$('.head');
            this._bodyElement = dom.$('.body');
            this._fillHead(this._headElement);
            this._fillBody(this._bodyElement);
            container.appendChild(this._headElement);
            container.appendChild(this._bodyElement);
        }
        _fillHead(container, noCloseAction) {
            this._titleElement = dom.$('.peekview-title');
            if (this.options.supportOnTitleClick) {
                this._titleElement.classList.add('clickable');
                dom.addStandardDisposableListener(this._titleElement, 'click', event => this._onTitleClick(event));
            }
            dom.append(this._headElement, this._titleElement);
            this._fillTitleIcon(this._titleElement);
            this._primaryHeading = dom.$('span.filename');
            this._secondaryHeading = dom.$('span.dirname');
            this._metaHeading = dom.$('span.meta');
            dom.append(this._titleElement, this._primaryHeading, this._secondaryHeading, this._metaHeading);
            const actionsContainer = dom.$('.peekview-actions');
            dom.append(this._headElement, actionsContainer);
            const actionBarOptions = this._getActionBarOptions();
            this._actionbarWidget = new actionbar_1.ActionBar(actionsContainer, actionBarOptions);
            this._disposables.add(this._actionbarWidget);
            if (!noCloseAction) {
                this._actionbarWidget.push(new actions_1.Action('peekview.close', nls.localize('label.close', "Close"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close), true, () => {
                    this.dispose();
                    return Promise.resolve();
                }), { label: false, icon: true });
            }
        }
        _fillTitleIcon(container) {
        }
        _getActionBarOptions() {
            return {
                actionViewItemProvider: menuEntryActionViewItem_1.createActionViewItem.bind(undefined, this.instantiationService),
                orientation: 0 /* ActionsOrientation.HORIZONTAL */
            };
        }
        _onTitleClick(event) {
            // implement me if supportOnTitleClick option is set
        }
        setTitle(primaryHeading, secondaryHeading) {
            if (this._primaryHeading && this._secondaryHeading) {
                this._primaryHeading.innerText = primaryHeading;
                this._primaryHeading.setAttribute('title', primaryHeading);
                if (secondaryHeading) {
                    this._secondaryHeading.innerText = secondaryHeading;
                }
                else {
                    dom.clearNode(this._secondaryHeading);
                }
            }
        }
        setMetaTitle(value) {
            if (this._metaHeading) {
                if (value) {
                    this._metaHeading.innerText = value;
                    dom.show(this._metaHeading);
                }
                else {
                    dom.hide(this._metaHeading);
                }
            }
        }
        _doLayout(heightInPixel, widthInPixel) {
            if (!this._isShowing && heightInPixel < 0) {
                // Looks like the view zone got folded away!
                this.dispose();
                return;
            }
            const headHeight = Math.ceil(this.editor.getOption(66 /* EditorOption.lineHeight */) * 1.2);
            const bodyHeight = Math.round(heightInPixel - (headHeight + 2 /* the border-top/bottom width*/));
            this._doLayoutHead(headHeight, widthInPixel);
            this._doLayoutBody(bodyHeight, widthInPixel);
        }
        _doLayoutHead(heightInPixel, widthInPixel) {
            if (this._headElement) {
                this._headElement.style.height = `${heightInPixel}px`;
                this._headElement.style.lineHeight = this._headElement.style.height;
            }
        }
        _doLayoutBody(heightInPixel, widthInPixel) {
            if (this._bodyElement) {
                this._bodyElement.style.height = `${heightInPixel}px`;
            }
        }
    };
    exports.PeekViewWidget = PeekViewWidget;
    exports.PeekViewWidget = PeekViewWidget = __decorate([
        __param(2, instantiation_1.IInstantiationService)
    ], PeekViewWidget);
    exports.peekViewTitleBackground = (0, colorRegistry_1.registerColor)('peekViewTitle.background', { dark: '#252526', light: '#F3F3F3', hcDark: color_1.Color.black, hcLight: color_1.Color.white }, nls.localize('peekViewTitleBackground', 'Background color of the peek view title area.'));
    exports.peekViewTitleForeground = (0, colorRegistry_1.registerColor)('peekViewTitleLabel.foreground', { dark: color_1.Color.white, light: color_1.Color.black, hcDark: color_1.Color.white, hcLight: colorRegistry_1.editorForeground }, nls.localize('peekViewTitleForeground', 'Color of the peek view title.'));
    exports.peekViewTitleInfoForeground = (0, colorRegistry_1.registerColor)('peekViewTitleDescription.foreground', { dark: '#ccccccb3', light: '#616161', hcDark: '#FFFFFF99', hcLight: '#292929' }, nls.localize('peekViewTitleInfoForeground', 'Color of the peek view title info.'));
    exports.peekViewBorder = (0, colorRegistry_1.registerColor)('peekView.border', { dark: colorRegistry_1.editorInfoForeground, light: colorRegistry_1.editorInfoForeground, hcDark: colorRegistry_1.contrastBorder, hcLight: colorRegistry_1.contrastBorder }, nls.localize('peekViewBorder', 'Color of the peek view borders and arrow.'));
    exports.peekViewResultsBackground = (0, colorRegistry_1.registerColor)('peekViewResult.background', { dark: '#252526', light: '#F3F3F3', hcDark: color_1.Color.black, hcLight: color_1.Color.white }, nls.localize('peekViewResultsBackground', 'Background color of the peek view result list.'));
    exports.peekViewResultsMatchForeground = (0, colorRegistry_1.registerColor)('peekViewResult.lineForeground', { dark: '#bbbbbb', light: '#646465', hcDark: color_1.Color.white, hcLight: colorRegistry_1.editorForeground }, nls.localize('peekViewResultsMatchForeground', 'Foreground color for line nodes in the peek view result list.'));
    exports.peekViewResultsFileForeground = (0, colorRegistry_1.registerColor)('peekViewResult.fileForeground', { dark: color_1.Color.white, light: '#1E1E1E', hcDark: color_1.Color.white, hcLight: colorRegistry_1.editorForeground }, nls.localize('peekViewResultsFileForeground', 'Foreground color for file nodes in the peek view result list.'));
    exports.peekViewResultsSelectionBackground = (0, colorRegistry_1.registerColor)('peekViewResult.selectionBackground', { dark: '#3399ff33', light: '#3399ff33', hcDark: null, hcLight: null }, nls.localize('peekViewResultsSelectionBackground', 'Background color of the selected entry in the peek view result list.'));
    exports.peekViewResultsSelectionForeground = (0, colorRegistry_1.registerColor)('peekViewResult.selectionForeground', { dark: color_1.Color.white, light: '#6C6C6C', hcDark: color_1.Color.white, hcLight: colorRegistry_1.editorForeground }, nls.localize('peekViewResultsSelectionForeground', 'Foreground color of the selected entry in the peek view result list.'));
    exports.peekViewEditorBackground = (0, colorRegistry_1.registerColor)('peekViewEditor.background', { dark: '#001F33', light: '#F2F8FC', hcDark: color_1.Color.black, hcLight: color_1.Color.white }, nls.localize('peekViewEditorBackground', 'Background color of the peek view editor.'));
    exports.peekViewEditorGutterBackground = (0, colorRegistry_1.registerColor)('peekViewEditorGutter.background', { dark: exports.peekViewEditorBackground, light: exports.peekViewEditorBackground, hcDark: exports.peekViewEditorBackground, hcLight: exports.peekViewEditorBackground }, nls.localize('peekViewEditorGutterBackground', 'Background color of the gutter in the peek view editor.'));
    exports.peekViewEditorStickyScrollBackground = (0, colorRegistry_1.registerColor)('peekViewEditorStickyScroll.background', { dark: exports.peekViewEditorBackground, light: exports.peekViewEditorBackground, hcDark: exports.peekViewEditorBackground, hcLight: exports.peekViewEditorBackground }, nls.localize('peekViewEditorStickScrollBackground', 'Background color of sticky scroll in the peek view editor.'));
    exports.peekViewResultsMatchHighlight = (0, colorRegistry_1.registerColor)('peekViewResult.matchHighlightBackground', { dark: '#ea5c004d', light: '#ea5c004d', hcDark: null, hcLight: null }, nls.localize('peekViewResultsMatchHighlight', 'Match highlight color in the peek view result list.'));
    exports.peekViewEditorMatchHighlight = (0, colorRegistry_1.registerColor)('peekViewEditor.matchHighlightBackground', { dark: '#ff8f0099', light: '#f5d802de', hcDark: null, hcLight: null }, nls.localize('peekViewEditorMatchHighlight', 'Match highlight color in the peek view editor.'));
    exports.peekViewEditorMatchHighlightBorder = (0, colorRegistry_1.registerColor)('peekViewEditor.matchHighlightBorder', { dark: null, light: null, hcDark: colorRegistry_1.activeContrastBorder, hcLight: colorRegistry_1.activeContrastBorder }, nls.localize('peekViewEditorMatchHighlightBorder', 'Match highlight border in the peek view editor.'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVla1ZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3BlZWtWaWV3L2Jyb3dzZXIvcGVla1ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMkJuRixRQUFBLGdCQUFnQixHQUFHLElBQUEsK0JBQWUsRUFBbUIsa0JBQWtCLENBQUMsQ0FBQztJQU10RixJQUFBLDhCQUFpQixFQUFDLHdCQUFnQixFQUFFO1FBQUE7WUFHbEIsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFrRSxDQUFDO1FBaUJ2RyxDQUFDO1FBZkEsa0JBQWtCLENBQUMsTUFBbUIsRUFBRSxNQUFzQjtZQUM3RCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNkLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzVCLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0IsQ0FBQztZQUNELE1BQU0sTUFBTSxHQUFHLEdBQUcsRUFBRTtnQkFDbkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFLENBQUM7b0JBQ3BDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QixDQUFDO1lBQ0YsQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxF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