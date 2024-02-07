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
define(["require", "exports", "vs/nls", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/editor/common/services/getIconClasses", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/instantiation", "vs/platform/markers/common/markers", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/browser/notebookEditor", "vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineProvider", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/outline/browser/outline", "vs/editor/common/core/range", "vs/base/browser/window", "vs/base/browser/dom"], function (require, exports, nls_1, iconLabel_1, event_1, filters_1, lifecycle_1, themables_1, getIconClasses_1, configuration_1, configurationRegistry_1, instantiation_1, markers_1, platform_1, colorRegistry_1, themeService_1, contributions_1, notebookEditor_1, notebookOutlineProvider_1, notebookCommon_1, editorService_1, outline_1, range_1, window_1, dom_1) {
    "use strict";
    var NotebookCellOutline_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookOutlineCreator = exports.NotebookCellOutline = void 0;
    class NotebookOutlineTemplate {
        static { this.templateId = 'NotebookOutlineRenderer'; }
        constructor(container, iconClass, iconLabel, decoration) {
            this.container = container;
            this.iconClass = iconClass;
            this.iconLabel = iconLabel;
            this.decoration = decoration;
        }
    }
    let NotebookOutlineRenderer = class NotebookOutlineRenderer {
        constructor(_themeService, _configurationService) {
            this._themeService = _themeService;
            this._configurationService = _configurationService;
            this.templateId = NotebookOutlineTemplate.templateId;
        }
        renderTemplate(container) {
            container.classList.add('notebook-outline-element', 'show-file-icons');
            const iconClass = document.createElement('div');
            container.append(iconClass);
            const iconLabel = new iconLabel_1.IconLabel(container, { supportHighlights: true });
            const decoration = document.createElement('div');
            decoration.className = 'element-decoration';
            container.append(decoration);
            return new NotebookOutlineTemplate(container, iconClass, iconLabel, decoration);
        }
        renderElement(node, _index, template, _height) {
            const extraClasses = [];
            const options = {
                matches: (0, filters_1.createMatches)(node.filterData),
                labelEscapeNewLines: true,
                extraClasses,
            };
            if (node.element.cell.cellKind === notebookCommon_1.CellKind.Code && this._themeService.getFileIconTheme().hasFileIcons && !node.element.isExecuting) {
                template.iconClass.className = '';
                extraClasses.push(...(0, getIconClasses_1.getIconClassesForLanguageId)(node.element.cell.language ?? ''));
            }
            else {
                template.iconClass.className = 'element-icon ' + themables_1.ThemeIcon.asClassNameArray(node.element.icon).join(' ');
            }
            template.iconLabel.setLabel(node.element.label, undefined, options);
            const { markerInfo } = node.element;
            template.container.style.removeProperty('--outline-element-color');
            template.decoration.innerText = '';
            if (markerInfo) {
                const problem = this._configurationService.getValue('problems.visibility');
                const useBadges = this._configurationService.getValue("outline.problems.badges" /* OutlineConfigKeys.problemsBadges */);
                if (!useBadges || !problem) {
                    template.decoration.classList.remove('bubble');
                    template.decoration.innerText = '';
                }
                else if (markerInfo.count === 0) {
                    template.decoration.classList.add('bubble');
                    template.decoration.innerText = '\uea71';
                }
                else {
                    template.decoration.classList.remove('bubble');
                    template.decoration.innerText = markerInfo.count > 9 ? '9+' : String(markerInfo.count);
                }
                const color = this._themeService.getColorTheme().getColor(markerInfo.topSev === markers_1.MarkerSeverity.Error ? colorRegistry_1.listErrorForeground : colorRegistry_1.listWarningForeground);
                if (problem === undefined) {
                    return;
                }
                const useColors = this._configurationService.getValue("outline.problems.colors" /* OutlineConfigKeys.problemsColors */);
                if (!useColors || !problem) {
                    template.container.style.removeProperty('--outline-element-color');
                    template.decoration.style.setProperty('--outline-element-color', color?.toString() ?? 'inherit');
                }
                else {
                    template.container.style.setProperty('--outline-element-color', color?.toString() ?? 'inherit');
                }
            }
        }
        disposeTemplate(templateData) {
            templateData.iconLabel.dispose();
        }
    };
    NotebookOutlineRenderer = __decorate([
        __param(0, themeService_1.IThemeService),
        __param(1, configuration_1.IConfigurationService)
    ], NotebookOutlineRenderer);
    class NotebookOutlineAccessibility {
        getAriaLabel(element) {
            return element.label;
        }
        getWidgetAriaLabel() {
            return '';
        }
    }
    class NotebookNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            return element.label;
        }
    }
    class NotebookOutlineVirtualDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(_element) {
            return NotebookOutlineTemplate.templateId;
        }
    }
    let NotebookQuickPickProvider = class NotebookQuickPickProvider {
        constructor(_getEntries, _themeService) {
            this._getEntries = _getEntries;
            this._themeService = _themeService;
        }
        getQuickPickElements() {
            const bucket = [];
            for (const entry of this._getEntries()) {
                entry.asFlatList(bucket);
            }
            const result = [];
            const { hasFileIcons } = this._themeService.getFileIconTheme();
            for (const element of bucket) {
                const useFileIcon = hasFileIcons && !element.symbolKind;
                // todo@jrieken it is fishy that codicons cannot be used with iconClasses
                // but file icons can...
                result.push({
                    element,
                    label: useFileIcon ? element.label : `$(${element.icon.id}) ${element.label}`,
                    ariaLabel: element.label,
                    iconClasses: useFileIcon ? (0, getIconClasses_1.getIconClassesForLanguageId)(element.cell.language ?? '') : undefined,
                });
            }
            return result;
        }
    };
    NotebookQuickPickProvider = __decorate([
        __param(1, themeService_1.IThemeService)
    ], NotebookQuickPickProvider);
    class NotebookComparator {
        constructor() {
            this._collator = new dom_1.WindowIdleValue(window_1.mainWindow, () => new Intl.Collator(undefined, { numeric: true }));
        }
        compareByPosition(a, b) {
            return a.index - b.index;
        }
        compareByType(a, b) {
            return a.cell.cellKind - b.cell.cellKind || this._collator.value.compare(a.label, b.label);
        }
        compareByName(a, b) {
            return this._collator.value.compare(a.label, b.label);
        }
    }
    let NotebookCellOutline = NotebookCellOutline_1 = class NotebookCellOutline {
        get entries() {
            return this._outlineProvider?.entries ?? [];
        }
        get activeElement() {
            return this._outlineProvider?.activeElement;
        }
        constructor(_editor, _target, instantiationService, _editorService, _configurationService) {
            this._editor = _editor;
            this._editorService = _editorService;
            this._dispoables = new lifecycle_1.DisposableStore();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._entriesDisposables = new lifecycle_1.DisposableStore();
            this.outlineKind = 'notebookCells';
            this._localDisposables = new lifecycle_1.DisposableStore();
            const installSelectionListener = () => {
                const notebookEditor = _editor.getControl();
                if (!notebookEditor?.hasModel()) {
                    this._outlineProvider?.dispose();
                    this._outlineProvider = undefined;
                    this._localDisposables.clear();
                }
                else {
                    this._outlineProvider?.dispose();
                    this._localDisposables.clear();
                    this._outlineProvider = instantiationService.createInstance(notebookOutlineProvider_1.NotebookCellOutlineProvider, notebookEditor, _target);
                    this._localDisposables.add(this._outlineProvider.onDidChange(e => {
                        this._onDidChange.fire(e);
                    }));
                }
            };
            this._dispoables.add(_editor.onDidChangeModel(() => {
                installSelectionListener();
            }));
            installSelectionListener();
            const treeDataSource = { getChildren: parent => parent instanceof NotebookCellOutline_1 ? (this._outlineProvider?.entries ?? []) : parent.children };
            const delegate = new NotebookOutlineVirtualDelegate();
            const renderers = [instantiationService.createInstance(NotebookOutlineRenderer)];
            const comparator = new NotebookComparator();
            const options = {
                collapseByDefault: _target === 2 /* OutlineTarget.Breadcrumbs */ || (_target === 1 /* OutlineTarget.OutlinePane */ && _configurationService.getValue("outline.collapseItems" /* OutlineConfigKeys.collapseItems */) === "alwaysCollapse" /* OutlineConfigCollapseItemsValues.Collapsed */),
                expandOnlyOnTwistieClick: true,
                multipleSelectionSupport: false,
                accessibilityProvider: new NotebookOutlineAccessibility(),
                identityProvider: { getId: element => element.cell.uri.toString() },
                keyboardNavigationLabelProvider: new NotebookNavigationLabelProvider()
            };
            this.config = {
                breadcrumbsDataSource: {
                    getBreadcrumbElements: () => {
                        const result = [];
                        let candidate = this.activeElement;
                        while (candidate) {
                            result.unshift(candidate);
                            candidate = candidate.parent;
                        }
                        return result;
                    }
                },
                quickPickDataSource: instantiationService.createInstance(NotebookQuickPickProvider, () => (this._outlineProvider?.entries ?? [])),
                treeDataSource,
                delegate,
                renderers,
                comparator,
                options
            };
        }
        async setFullSymbols(cancelToken) {
            await this._outlineProvider?.setFullSymbols(cancelToken);
        }
        get uri() {
            return this._outlineProvider?.uri;
        }
        get isEmpty() {
            return this._outlineProvider?.isEmpty ?? true;
        }
        async reveal(entry, options, sideBySide) {
            await this._editorService.openEditor({
                resource: entry.cell.uri,
                options: {
                    ...options,
                    override: this._editor.input?.editorId,
                    cellRevealType: 5 /* CellRevealType.NearTopIfOutsideViewport */,
                    selection: entry.position
                },
            }, sideBySide ? editorService_1.SIDE_GROUP : undefined);
        }
        preview(entry) {
            const widget = this._editor.getControl();
            if (!widget) {
                return lifecycle_1.Disposable.None;
            }
            if (entry.range) {
                const range = range_1.Range.lift(entry.range);
                widget.revealRangeInCenterIfOutsideViewportAsync(entry.cell, range);
            }
            else {
                widget.revealInCenterIfOutsideViewport(entry.cell);
            }
            const ids = widget.deltaCellDecorations([], [{
                    handle: entry.cell.handle,
                    options: { className: 'nb-symbolHighlight', outputClassName: 'nb-symbolHighlight' }
                }]);
            let editorDecorations;
            widget.changeModelDecorations(accessor => {
                if (entry.range) {
                    const decorations = [
                        {
                            range: entry.range, options: {
                                description: 'document-symbols-outline-range-highlight',
                                className: 'rangeHighlight',
                                isWholeLine: true
                            }
                        }
                    ];
                    const deltaDecoration = {
                        ownerId: entry.cell.handle,
                        decorations: decorations
                    };
                    editorDecorations = accessor.deltaDecorations([], [deltaDecoration]);
                }
            });
            return (0, lifecycle_1.toDisposable)(() => {
                widget.deltaCellDecorations(ids, []);
                if (editorDecorations?.length) {
                    widget.changeModelDecorations(accessor => {
                        accessor.deltaDecorations(editorDecorations, []);
                    });
                }
            });
        }
        captureViewState() {
            const widget = this._editor.getControl();
            const viewState = widget?.getEditorViewState();
            return (0, lifecycle_1.toDisposable)(() => {
                if (viewState) {
                    widget?.restoreListViewState(viewState);
                }
            });
        }
        dispose() {
            this._onDidChange.dispose();
            this._dispoables.dispose();
            this._entriesDisposables.dispose();
            this._outlineProvider?.dispose();
            this._localDisposables.dispose();
        }
    };
    exports.NotebookCellOutline = NotebookCellOutline;
    exports.NotebookCellOutline = NotebookCellOutline = NotebookCellOutline_1 = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, editorService_1.IEditorService),
        __param(4, configuration_1.IConfigurationService)
    ], NotebookCellOutline);
    let NotebookOutlineCreator = class NotebookOutlineCreator {
        constructor(outlineService, _instantiationService, _configurationService) {
            this._instantiationService = _instantiationService;
            this._configurationService = _configurationService;
            const reg = outlineService.registerOutlineCreator(this);
            this.dispose = () => reg.dispose();
        }
        matches(candidate) {
            return candidate.getId() === notebookEditor_1.NotebookEditor.ID;
        }
        async createOutline(editor, target, cancelToken) {
            const outline = this._instantiationService.createInstance(NotebookCellOutline, editor, target);
            const showAllSymbols = this._configurationService.getValue(notebookCommon_1.NotebookSetting.gotoSymbolsAllSymbols);
            if (target === 4 /* OutlineTarget.QuickPick */ && showAllSymbols) {
                await outline.setFullSymbols(cancelToken);
            }
            return outline;
        }
    };
    exports.NotebookOutlineCreator = NotebookOutlineCreator;
    exports.NotebookOutlineCreator = NotebookOutlineCreator = __decorate([
        __param(0, outline_1.IOutlineService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService)
    ], NotebookOutlineCreator);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(NotebookOutlineCreator, 4 /* LifecyclePhase.Eventually */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.outline.showCodeCells': {
                type: 'boolean',
                default: false,
                markdownDescription: (0, nls_1.localize)('outline.showCodeCells', "When enabled notebook outline shows code cells.")
            },
            'notebook.breadcrumbs.showCodeCells': {
                type: 'boolean',
                default: true,
                markdownDescription: (0, nls_1.localize)('breadcrumbs.showCodeCells', "When enabled notebook breadcrumbs contain code cells.")
            },
            [notebookCommon_1.NotebookSetting.gotoSymbolsAllSymbols]: {
                type: 'boolean',
                default: true,
                markdownDescription: (0, nls_1.localize)('notebook.gotoSymbols.showAllSymbols', "When enabled the Go to Symbol Quick Pick will display full code symbols from the notebook, as well as Markdown headers.")
            },
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tPdXRsaW5lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyaWIvb3V0bGluZS9ub3RlYm9va091dGxpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXNDaEcsTUFBTSx1QkFBdUI7aUJBRVosZUFBVSxHQUFHLHlCQUF5QixDQUFDO1FBRXZELFlBQ1UsU0FBc0IsRUFDdEIsU0FBc0IsRUFDdEIsU0FBb0IsRUFDcEIsVUFBdUI7WUFIdkIsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQUN0QixjQUFTLEdBQVQsU0FBUyxDQUFhO1lBQ3RCLGNBQVMsR0FBVCxTQUFTLENBQVc7WUFDcEIsZUFBVSxHQUFWLFVBQVUsQ0FBYTtRQUM3QixDQUFDOztJQUdOLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXVCO1FBSTVCLFlBQ2dCLGFBQTZDLEVBQ3JDLHFCQUE2RDtZQURwRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUNwQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBSnJGLGVBQVUsR0FBVyx1QkFBdUIsQ0FBQyxVQUFVLENBQUM7UUFLcEQsQ0FBQztRQUVMLGNBQWMsQ0FBQyxTQUFzQjtZQUNwQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEQsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1QixNQUFNLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQUMsU0FBUyxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN4RSxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pELFVBQVUsQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUM7WUFDNUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM3QixPQUFPLElBQUksdUJBQXVCLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDakYsQ0FBQztRQUVELGFBQWEsQ0FBQyxJQUF5QyxFQUFFLE1BQWMsRUFBRSxRQUFpQyxFQUFFLE9BQTJCO1lBQ3RJLE1BQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztZQUNsQyxNQUFNLE9BQU8sR0FBMkI7Z0JBQ3ZDLE9BQU8sRUFBRSxJQUFBLHVCQUFhLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFDdkMsbUJBQW1CLEVBQUUsSUFBSTtnQkFDekIsWUFBWTthQUNaLENBQUM7WUFFRixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyx5QkFBUSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDckksUUFBUSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO2dCQUNsQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBQSw0Q0FBMkIsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsUUFBUSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsZUFBZSxHQUFHLHFCQUFTLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUcsQ0FBQztZQUVELFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVwRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUVwQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUNuRSxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDbkMsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDaEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUMzRSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxrRUFBa0MsQ0FBQztnQkFFeEYsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUM1QixRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQy9DLFFBQVEsQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztnQkFDcEMsQ0FBQztxQkFBTSxJQUFJLFVBQVUsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQ25DLFFBQVEsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDNUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO2dCQUMxQyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMvQyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4RixDQUFDO2dCQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssd0JBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLG1DQUFtQixDQUFDLENBQUMsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO2dCQUNwSixJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztvQkFDM0IsT0FBTztnQkFDUixDQUFDO2dCQUNELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLGtFQUFrQyxDQUFDO2dCQUN4RixJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzVCLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO29CQUNuRSxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMseUJBQXlCLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLFNBQVMsQ0FBQyxDQUFDO2dCQUNsRyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLHlCQUF5QixFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxTQUFTLENBQUMsQ0FBQztnQkFDakcsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRUQsZUFBZSxDQUFDLFlBQXFDO1lBQ3BELFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbEMsQ0FBQztLQUNELENBQUE7SUF4RUssdUJBQXVCO1FBSzFCLFdBQUEsNEJBQWEsQ0FBQTtRQUNiLFdBQUEscUNBQXFCLENBQUE7T0FObEIsdUJBQXVCLENBd0U1QjtJQUVELE1BQU0sNEJBQTRCO1FBQ2pDLFlBQVksQ0FBQyxPQUFxQjtZQUNqQyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQztRQUNELGtCQUFrQjtZQUNqQixPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7S0FDRDtJQUVELE1BQU0sK0JBQStCO1FBQ3BDLDBCQUEwQixDQUFDLE9BQXFCO1lBQy9DLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO0tBQ0Q7SUFFRCxNQUFNLDhCQUE4QjtRQUVuQyxTQUFTLENBQUMsUUFBc0I7WUFDL0IsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRUQsYUFBYSxDQUFDLFFBQXNCO1lBQ25DLE9BQU8sdUJBQXVCLENBQUMsVUFBVSxDQUFDO1FBQzNDLENBQUM7S0FDRDtJQUVELElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQXlCO1FBRTlCLFlBQ1MsV0FBaUMsRUFDVCxhQUE0QjtZQURwRCxnQkFBVyxHQUFYLFdBQVcsQ0FBc0I7WUFDVCxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUN6RCxDQUFDO1FBRUwsb0JBQW9CO1lBQ25CLE1BQU0sTUFBTSxHQUFtQixFQUFFLENBQUM7WUFDbEMsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztnQkFDeEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQixDQUFDO1lBQ0QsTUFBTSxNQUFNLEdBQTZDLEVBQUUsQ0FBQztZQUM1RCxNQUFNLEVBQUUsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRS9ELEtBQUssTUFBTSxPQUFPLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQzlCLE1BQU0sV0FBVyxHQUFHLFlBQVksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7Z0JBQ3hELHlFQUF5RTtnQkFDekUsd0JBQXdCO2dCQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDO29CQUNYLE9BQU87b0JBQ1AsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsS0FBSyxFQUFFO29CQUM3RSxTQUFTLEVBQUUsT0FBTyxDQUFDLEtBQUs7b0JBQ3hCLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUEsNENBQTJCLEVBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7aUJBQy9GLENBQUMsQ0FBQztZQUNKLENBQUM7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7S0FDRCxDQUFBO0lBNUJLLHlCQUF5QjtRQUk1QixXQUFBLDRCQUFhLENBQUE7T0FKVix5QkFBeUIsQ0E0QjlCO0lBRUQsTUFBTSxrQkFBa0I7UUFBeEI7WUFFa0IsY0FBUyxHQUFHLElBQUkscUJBQWUsQ0FBZ0IsbUJBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQVdwSSxDQUFDO1FBVEEsaUJBQWlCLENBQUMsQ0FBZSxFQUFFLENBQWU7WUFDakQsT0FBTyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDMUIsQ0FBQztRQUNELGFBQWEsQ0FBQyxDQUFlLEVBQUUsQ0FBZTtZQUM3QyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1RixDQUFDO1FBQ0QsYUFBYSxDQUFDLENBQWUsRUFBRSxDQUFlO1lBQzdDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZELENBQUM7S0FDRDtJQUVNLElBQU0sbUJBQW1CLDJCQUF6QixNQUFNLG1CQUFtQjtRQVEvQixJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDO1FBQzdDLENBQUM7UUFRRCxJQUFJLGFBQWE7WUFDaEIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDO1FBQzdDLENBQUM7UUFLRCxZQUNrQixPQUE0QixFQUM3QyxPQUFzQixFQUNDLG9CQUEyQyxFQUNsRCxjQUErQyxFQUN4QyxxQkFBNEM7WUFKbEQsWUFBTyxHQUFQLE9BQU8sQ0FBcUI7WUFHWixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUEzQi9DLGdCQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFcEMsaUJBQVksR0FBRyxJQUFJLGVBQU8sRUFBc0IsQ0FBQztZQUV6RCxnQkFBVyxHQUE4QixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQU16RCx3QkFBbUIsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUlwRCxnQkFBVyxHQUFHLGVBQWUsQ0FBQztZQU90QixzQkFBaUIsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQVMxRCxNQUFNLHdCQUF3QixHQUFHLEdBQUcsRUFBRTtnQkFDckMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUM1QyxJQUFJLENBQUMsY0FBYyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUM7b0JBQ2pDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsQ0FBQztvQkFDakMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztvQkFDbEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNoQyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsSUFBSSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxDQUFDO29CQUNqQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQy9CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMscURBQTJCLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUNsSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQ2hFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUM7WUFDRixDQUFDLENBQUM7WUFFRixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFO2dCQUNsRCx3QkFBd0IsRUFBRSxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSix3QkFBd0IsRUFBRSxDQUFDO1lBQzNCLE1BQU0sY0FBYyxHQUFvQyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sWUFBWSxxQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEwsTUFBTSxRQUFRLEdBQUcsSUFBSSw4QkFBOEIsRUFBRSxDQUFDO1lBQ3RELE1BQU0sU0FBUyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztZQUNqRixNQUFNLFVBQVUsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7WUFFNUMsTUFBTSxPQUFPLEdBQXdEO2dCQUNwRSxpQkFBaUIsRUFBRSxPQUFPLHNDQUE4QixJQUFJLENBQUMsT0FBTyxzQ0FBOEIsSUFBSSxxQkFBcUIsQ0FBQyxRQUFRLCtEQUFpQyxzRUFBK0MsQ0FBQztnQkFDck4sd0JBQXdCLEVBQUUsSUFBSTtnQkFDOUIsd0JBQXdCLEVBQUUsS0FBSztnQkFDL0IscUJBQXFCLEVBQUUsSUFBSSw0QkFBNEIsRUFBRTtnQkFDekQsZ0JBQWdCLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDbkUsK0JBQStCLEVBQUUsSUFBSSwrQkFBK0IsRUFBRTthQUN0RSxDQUFDO1lBRUYsSUFBSSxDQUFDLE1BQU0sR0FBRztnQkFDYixxQkFBcUIsRUFBRTtvQkFDdEIscUJBQXFCLEVBQUUsR0FBRyxFQUFFO3dCQUMzQixNQUFNLE1BQU0sR0FBbUIsRUFBRSxDQUFDO3dCQUNsQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO3dCQUNuQyxPQUFPLFNBQVMsRUFBRSxDQUFDOzRCQUNsQixNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUMxQixTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQzt3QkFDOUIsQ0FBQzt3QkFDRCxPQUFPLE1BQU0sQ0FBQztvQkFDZixDQUFDO2lCQUNEO2dCQUNELG1CQUFtQixFQUFFLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ2pJLGNBQWM7Z0JBQ2QsUUFBUTtnQkFDUixTQUFTO2dCQUNULFVBQVU7Z0JBQ1YsT0FBTzthQUNQLENBQUM7UUFDSCxDQUFDO1FBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxXQUE4QjtZQUNsRCxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVELElBQUksR0FBRztZQUNOLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsSUFBSSxPQUFPO1lBQ1YsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQztRQUMvQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFtQixFQUFFLE9BQXVCLEVBQUUsVUFBbUI7WUFDN0UsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQztnQkFDcEMsUUFBUSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRztnQkFDeEIsT0FBTyxFQUFFO29CQUNSLEdBQUcsT0FBTztvQkFDVixRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUTtvQkFDdEMsY0FBYyxpREFBeUM7b0JBQ3ZELFNBQVMsRUFBRSxLQUFLLENBQUMsUUFBUTtpQkFDQzthQUMzQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsMEJBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELE9BQU8sQ0FBQyxLQUFtQjtZQUMxQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDYixPQUFPLHNCQUFVLENBQUMsSUFBSSxDQUFDO1lBQ3hCLENBQUM7WUFHRCxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxLQUFLLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyx5Q0FBeUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JFLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxNQUFNLENBQUMsK0JBQStCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BELENBQUM7WUFFRCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzVDLE1BQU0sRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU07b0JBQ3pCLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsRUFBRSxlQUFlLEVBQUUsb0JBQW9CLEVBQUU7aUJBQ25GLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxpQkFBMEMsQ0FBQztZQUMvQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3hDLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNqQixNQUFNLFdBQVcsR0FBNEI7d0JBQzVDOzRCQUNDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRTtnQ0FDNUIsV0FBVyxFQUFFLDBDQUEwQztnQ0FDdkQsU0FBUyxFQUFFLGdCQUFnQjtnQ0FDM0IsV0FBVyxFQUFFLElBQUk7NkJBQ2pCO3lCQUNEO3FCQUNELENBQUM7b0JBQ0YsTUFBTSxlQUFlLEdBQStCO3dCQUNuRCxPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNO3dCQUMxQixXQUFXLEVBQUUsV0FBVztxQkFDeEIsQ0FBQztvQkFFRixpQkFBaUIsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFDdEUsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN4QixNQUFNLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxDQUFDO29CQUMvQixNQUFNLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLEVBQUU7d0JBQ3hDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDbEQsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUosQ0FBQztRQUVELGdCQUFnQjtZQUNmLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDekMsTUFBTSxTQUFTLEdBQUcsTUFBTSxFQUFFLGtCQUFrQixFQUFFLENBQUM7WUFDL0MsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN4QixJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNmLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDekMsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbEMsQ0FBQztLQUNELENBQUE7SUFsTFksa0RBQW1CO2tDQUFuQixtQkFBbUI7UUE0QjdCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSw4QkFBYyxDQUFBO1FBQ2QsV0FBQSxxQ0FBcUIsQ0FBQTtPQTlCWCxtQkFBbUIsQ0FrTC9CO0lBRU0sSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBc0I7UUFJbEMsWUFDa0IsY0FBK0IsRUFDUixxQkFBNEMsRUFDNUMscUJBQTRDO1lBRDVDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUVwRixNQUFNLEdBQUcsR0FBRyxjQUFjLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDcEMsQ0FBQztRQUVELE9BQU8sQ0FBQyxTQUFzQjtZQUM3QixPQUFPLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSywrQkFBYyxDQUFDLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFzQixFQUFFLE1BQXFCLEVBQUUsV0FBOEI7WUFDaEcsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFL0YsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBVSxnQ0FBZSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDM0csSUFBSSxNQUFNLG9DQUE0QixJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUMxRCxNQUFNLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDM0MsQ0FBQztZQUNELE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7S0FDRCxDQUFBO0lBMUJZLHdEQUFzQjtxQ0FBdEIsc0JBQXNCO1FBS2hDLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxxQ0FBcUIsQ0FBQTtPQVBYLHNCQUFzQixDQTBCbEM7SUFFRCxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsc0JBQXNCLG9DQUE0QixDQUFDO0lBRzdKLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztRQUNoRyxFQUFFLEVBQUUsVUFBVTtRQUNkLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLFFBQVE7UUFDZCxZQUFZLEVBQUU7WUFDYixnQ0FBZ0MsRUFBRTtnQkFDakMsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsbUJBQW1CLEVBQUUsSUFBQSxjQUFRLEVBQUMsdUJBQXVCLEVBQUUsaURBQWlELENBQUM7YUFDekc7WUFDRCxvQ0FBb0MsRUFBRTtnQkFDckMsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsbUJBQW1CLEVBQUUsSUFBQSxjQUFRLEVBQUMsMkJBQTJCLEVBQUUsdURBQXVELENBQUM7YUFDbkg7WUFDRCxDQUFDLGdDQUFlLENBQUMscUJBQXFCLENBQUMsRUFBRTtnQkFDeEMsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsbUJBQW1CLEVBQUUsSUFBQSxjQUFRLEVBQUMscUNBQXFDLEVBQUUseUhBQXlILENBQUM7YUFDL0w7U0FDRDtLQUNELENBQUMsQ0FBQyJ9