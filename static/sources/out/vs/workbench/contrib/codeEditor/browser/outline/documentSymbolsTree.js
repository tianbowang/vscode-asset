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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/common/filters", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/nls", "vs/base/browser/ui/iconLabel/iconLabel", "vs/platform/configuration/common/configuration", "vs/platform/markers/common/markers", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/editor/common/services/textResourceConfiguration", "vs/base/common/themables", "vs/base/browser/window", "vs/css!./documentSymbolsTree", "vs/editor/contrib/symbolIcons/browser/symbolIcons"], function (require, exports, dom, highlightedLabel_1, filters_1, range_1, languages_1, outlineModel_1, nls_1, iconLabel_1, configuration_1, markers_1, themeService_1, colorRegistry_1, textResourceConfiguration_1, themables_1, window_1) {
    "use strict";
    var DocumentSymbolFilter_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentSymbolComparator = exports.DocumentSymbolFilter = exports.DocumentSymbolRenderer = exports.DocumentSymbolGroupRenderer = exports.DocumentSymbolVirtualDelegate = exports.DocumentSymbolIdentityProvider = exports.DocumentSymbolAccessibilityProvider = exports.DocumentSymbolNavigationLabelProvider = void 0;
    class DocumentSymbolNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            if (element instanceof outlineModel_1.OutlineGroup) {
                return element.label;
            }
            else {
                return element.symbol.name;
            }
        }
    }
    exports.DocumentSymbolNavigationLabelProvider = DocumentSymbolNavigationLabelProvider;
    class DocumentSymbolAccessibilityProvider {
        constructor(_ariaLabel) {
            this._ariaLabel = _ariaLabel;
        }
        getWidgetAriaLabel() {
            return this._ariaLabel;
        }
        getAriaLabel(element) {
            if (element instanceof outlineModel_1.OutlineGroup) {
                return element.label;
            }
            else {
                return (0, languages_1.getAriaLabelForSymbol)(element.symbol.name, element.symbol.kind);
            }
        }
    }
    exports.DocumentSymbolAccessibilityProvider = DocumentSymbolAccessibilityProvider;
    class DocumentSymbolIdentityProvider {
        getId(element) {
            return element.id;
        }
    }
    exports.DocumentSymbolIdentityProvider = DocumentSymbolIdentityProvider;
    class DocumentSymbolGroupTemplate {
        static { this.id = 'DocumentSymbolGroupTemplate'; }
        constructor(labelContainer, label) {
            this.labelContainer = labelContainer;
            this.label = label;
        }
    }
    class DocumentSymbolTemplate {
        static { this.id = 'DocumentSymbolTemplate'; }
        constructor(container, iconLabel, iconClass, decoration) {
            this.container = container;
            this.iconLabel = iconLabel;
            this.iconClass = iconClass;
            this.decoration = decoration;
        }
    }
    class DocumentSymbolVirtualDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            return element instanceof outlineModel_1.OutlineGroup
                ? DocumentSymbolGroupTemplate.id
                : DocumentSymbolTemplate.id;
        }
    }
    exports.DocumentSymbolVirtualDelegate = DocumentSymbolVirtualDelegate;
    class DocumentSymbolGroupRenderer {
        constructor() {
            this.templateId = DocumentSymbolGroupTemplate.id;
        }
        renderTemplate(container) {
            const labelContainer = dom.$('.outline-element-label');
            container.classList.add('outline-element');
            dom.append(container, labelContainer);
            return new DocumentSymbolGroupTemplate(labelContainer, new highlightedLabel_1.HighlightedLabel(labelContainer));
        }
        renderElement(node, _index, template) {
            template.label.set(node.element.label, (0, filters_1.createMatches)(node.filterData));
        }
        disposeTemplate(_template) {
            // nothing
        }
    }
    exports.DocumentSymbolGroupRenderer = DocumentSymbolGroupRenderer;
    let DocumentSymbolRenderer = class DocumentSymbolRenderer {
        constructor(_renderMarker, _configurationService, _themeService) {
            this._renderMarker = _renderMarker;
            this._configurationService = _configurationService;
            this._themeService = _themeService;
            this.templateId = DocumentSymbolTemplate.id;
        }
        renderTemplate(container) {
            container.classList.add('outline-element');
            const iconLabel = new iconLabel_1.IconLabel(container, { supportHighlights: true });
            const iconClass = dom.$('.outline-element-icon');
            const decoration = dom.$('.outline-element-decoration');
            container.prepend(iconClass);
            container.appendChild(decoration);
            return new DocumentSymbolTemplate(container, iconLabel, iconClass, decoration);
        }
        renderElement(node, _index, template) {
            const { element } = node;
            const extraClasses = ['nowrap'];
            const options = {
                matches: (0, filters_1.createMatches)(node.filterData),
                labelEscapeNewLines: true,
                extraClasses,
                title: (0, nls_1.localize)('title.template', "{0} ({1})", element.symbol.name, languages_1.symbolKindNames[element.symbol.kind])
            };
            if (this._configurationService.getValue("outline.icons" /* OutlineConfigKeys.icons */)) {
                // add styles for the icons
                template.iconClass.className = '';
                template.iconClass.classList.add('outline-element-icon', 'inline', ...themables_1.ThemeIcon.asClassNameArray(languages_1.SymbolKinds.toIcon(element.symbol.kind)));
            }
            if (element.symbol.tags.indexOf(1 /* SymbolTag.Deprecated */) >= 0) {
                extraClasses.push(`deprecated`);
                options.matches = [];
            }
            template.iconLabel.setLabel(element.symbol.name, element.symbol.detail, options);
            if (this._renderMarker) {
                this._renderMarkerInfo(element, template);
            }
        }
        _renderMarkerInfo(element, template) {
            if (!element.marker) {
                dom.hide(template.decoration);
                template.container.style.removeProperty('--outline-element-color');
                return;
            }
            const { count, topSev } = element.marker;
            const color = this._themeService.getColorTheme().getColor(topSev === markers_1.MarkerSeverity.Error ? colorRegistry_1.listErrorForeground : colorRegistry_1.listWarningForeground);
            const cssColor = color ? color.toString() : 'inherit';
            // color of the label
            const problem = this._configurationService.getValue('problems.visibility');
            const configProblems = this._configurationService.getValue("outline.problems.colors" /* OutlineConfigKeys.problemsColors */);
            if (!problem || !configProblems) {
                template.container.style.removeProperty('--outline-element-color');
            }
            else {
                template.container.style.setProperty('--outline-element-color', cssColor);
            }
            // badge with color/rollup
            if (problem === undefined) {
                return;
            }
            const configBadges = this._configurationService.getValue("outline.problems.badges" /* OutlineConfigKeys.problemsBadges */);
            if (!configBadges || !problem) {
                dom.hide(template.decoration);
            }
            else if (count > 0) {
                dom.show(template.decoration);
                template.decoration.classList.remove('bubble');
                template.decoration.innerText = count < 10 ? count.toString() : '+9';
                template.decoration.title = count === 1 ? (0, nls_1.localize)('1.problem', "1 problem in this element") : (0, nls_1.localize)('N.problem', "{0} problems in this element", count);
                template.decoration.style.setProperty('--outline-element-color', cssColor);
            }
            else {
                dom.show(template.decoration);
                template.decoration.classList.add('bubble');
                template.decoration.innerText = '\uea71';
                template.decoration.title = (0, nls_1.localize)('deep.problem', "Contains elements with problems");
                template.decoration.style.setProperty('--outline-element-color', cssColor);
            }
        }
        disposeTemplate(_template) {
            _template.iconLabel.dispose();
        }
    };
    exports.DocumentSymbolRenderer = DocumentSymbolRenderer;
    exports.DocumentSymbolRenderer = DocumentSymbolRenderer = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, themeService_1.IThemeService)
    ], DocumentSymbolRenderer);
    let DocumentSymbolFilter = class DocumentSymbolFilter {
        static { DocumentSymbolFilter_1 = this; }
        static { this.kindToConfigName = Object.freeze({
            [0 /* SymbolKind.File */]: 'showFiles',
            [1 /* SymbolKind.Module */]: 'showModules',
            [2 /* SymbolKind.Namespace */]: 'showNamespaces',
            [3 /* SymbolKind.Package */]: 'showPackages',
            [4 /* SymbolKind.Class */]: 'showClasses',
            [5 /* SymbolKind.Method */]: 'showMethods',
            [6 /* SymbolKind.Property */]: 'showProperties',
            [7 /* SymbolKind.Field */]: 'showFields',
            [8 /* SymbolKind.Constructor */]: 'showConstructors',
            [9 /* SymbolKind.Enum */]: 'showEnums',
            [10 /* SymbolKind.Interface */]: 'showInterfaces',
            [11 /* SymbolKind.Function */]: 'showFunctions',
            [12 /* SymbolKind.Variable */]: 'showVariables',
            [13 /* SymbolKind.Constant */]: 'showConstants',
            [14 /* SymbolKind.String */]: 'showStrings',
            [15 /* SymbolKind.Number */]: 'showNumbers',
            [16 /* SymbolKind.Boolean */]: 'showBooleans',
            [17 /* SymbolKind.Array */]: 'showArrays',
            [18 /* SymbolKind.Object */]: 'showObjects',
            [19 /* SymbolKind.Key */]: 'showKeys',
            [20 /* SymbolKind.Null */]: 'showNull',
            [21 /* SymbolKind.EnumMember */]: 'showEnumMembers',
            [22 /* SymbolKind.Struct */]: 'showStructs',
            [23 /* SymbolKind.Event */]: 'showEvents',
            [24 /* SymbolKind.Operator */]: 'showOperators',
            [25 /* SymbolKind.TypeParameter */]: 'showTypeParameters',
        }); }
        constructor(_prefix, _textResourceConfigService) {
            this._prefix = _prefix;
            this._textResourceConfigService = _textResourceConfigService;
        }
        filter(element) {
            const outline = outlineModel_1.OutlineModel.get(element);
            if (!(element instanceof outlineModel_1.OutlineElement)) {
                return true;
            }
            const configName = DocumentSymbolFilter_1.kindToConfigName[element.symbol.kind];
            const configKey = `${this._prefix}.${configName}`;
            return this._textResourceConfigService.getValue(outline?.uri, configKey);
        }
    };
    exports.DocumentSymbolFilter = DocumentSymbolFilter;
    exports.DocumentSymbolFilter = DocumentSymbolFilter = DocumentSymbolFilter_1 = __decorate([
        __param(1, textResourceConfiguration_1.ITextResourceConfigurationService)
    ], DocumentSymbolFilter);
    class DocumentSymbolComparator {
        constructor() {
            this._collator = new dom.WindowIdleValue(window_1.mainWindow, () => new Intl.Collator(undefined, { numeric: true }));
        }
        compareByPosition(a, b) {
            if (a instanceof outlineModel_1.OutlineGroup && b instanceof outlineModel_1.OutlineGroup) {
                return a.order - b.order;
            }
            else if (a instanceof outlineModel_1.OutlineElement && b instanceof outlineModel_1.OutlineElement) {
                return range_1.Range.compareRangesUsingStarts(a.symbol.range, b.symbol.range) || this._collator.value.compare(a.symbol.name, b.symbol.name);
            }
            return 0;
        }
        compareByType(a, b) {
            if (a instanceof outlineModel_1.OutlineGroup && b instanceof outlineModel_1.OutlineGroup) {
                return a.order - b.order;
            }
            else if (a instanceof outlineModel_1.OutlineElement && b instanceof outlineModel_1.OutlineElement) {
                return a.symbol.kind - b.symbol.kind || this._collator.value.compare(a.symbol.name, b.symbol.name);
            }
            return 0;
        }
        compareByName(a, b) {
            if (a instanceof outlineModel_1.OutlineGroup && b instanceof outlineModel_1.OutlineGroup) {
                return a.order - b.order;
            }
            else if (a instanceof outlineModel_1.OutlineElement && b instanceof outlineModel_1.OutlineElement) {
                return this._collator.value.compare(a.symbol.name, b.symbol.name) || range_1.Range.compareRangesUsingStarts(a.symbol.range, b.symbol.range);
            }
            return 0;
        }
    }
    exports.DocumentSymbolComparator = DocumentSymbolComparator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRTeW1ib2xzVHJlZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9icm93c2VyL291dGxpbmUvZG9jdW1lbnRTeW1ib2xzVHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBMEJoRyxNQUFhLHFDQUFxQztRQUVqRCwwQkFBMEIsQ0FBQyxPQUEyQjtZQUNyRCxJQUFJLE9BQU8sWUFBWSwyQkFBWSxFQUFFLENBQUM7Z0JBQ3JDLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQztZQUN0QixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUM1QixDQUFDO1FBQ0YsQ0FBQztLQUNEO0lBVEQsc0ZBU0M7SUFFRCxNQUFhLG1DQUFtQztRQUUvQyxZQUE2QixVQUFrQjtZQUFsQixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQUksQ0FBQztRQUVwRCxrQkFBa0I7WUFDakIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3hCLENBQUM7UUFDRCxZQUFZLENBQUMsT0FBMkI7WUFDdkMsSUFBSSxPQUFPLFlBQVksMkJBQVksRUFBRSxDQUFDO2dCQUNyQyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDdEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE9BQU8sSUFBQSxpQ0FBcUIsRUFBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hFLENBQUM7UUFDRixDQUFDO0tBQ0Q7SUFkRCxrRkFjQztJQUVELE1BQWEsOEJBQThCO1FBQzFDLEtBQUssQ0FBQyxPQUEyQjtZQUNoQyxPQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDbkIsQ0FBQztL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