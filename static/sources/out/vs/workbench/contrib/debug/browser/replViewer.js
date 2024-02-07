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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/list/list", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/severity", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/platform/label/common/label", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/browser/debugANSIHandling", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/replModel", "vs/workbench/services/editor/common/editorService"], function (require, exports, dom, countBadge_1, highlightedLabel_1, list_1, filters_1, lifecycle_1, path_1, severity_1, nls_1, contextView_1, label_1, defaultStyles_1, themeService_1, themables_1, baseDebugView_1, debugANSIHandling_1, debugIcons_1, debug_1, debugModel_1, replModel_1, editorService_1) {
    "use strict";
    var ReplGroupRenderer_1, ReplOutputElementRenderer_1, ReplVariablesRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplAccessibilityProvider = exports.ReplDataSource = exports.ReplDelegate = exports.ReplRawObjectsRenderer = exports.ReplVariablesRenderer = exports.ReplOutputElementRenderer = exports.ReplEvaluationResultsRenderer = exports.ReplGroupRenderer = exports.ReplEvaluationInputsRenderer = void 0;
    const $ = dom.$;
    class ReplEvaluationInputsRenderer {
        static { this.ID = 'replEvaluationInput'; }
        get templateId() {
            return ReplEvaluationInputsRenderer.ID;
        }
        renderTemplate(container) {
            dom.append(container, $('span.arrow' + themables_1.ThemeIcon.asCSSSelector(debugIcons_1.debugConsoleEvaluationInput)));
            const input = dom.append(container, $('.expression'));
            const label = new highlightedLabel_1.HighlightedLabel(input);
            return { label };
        }
        renderElement(element, index, templateData) {
            const evaluation = element.element;
            templateData.label.set(evaluation.value, (0, filters_1.createMatches)(element.filterData));
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    exports.ReplEvaluationInputsRenderer = ReplEvaluationInputsRenderer;
    let ReplGroupRenderer = class ReplGroupRenderer {
        static { ReplGroupRenderer_1 = this; }
        static { this.ID = 'replGroup'; }
        constructor(linkDetector, themeService) {
            this.linkDetector = linkDetector;
            this.themeService = themeService;
        }
        get templateId() {
            return ReplGroupRenderer_1.ID;
        }
        renderTemplate(container) {
            const label = dom.append(container, $('.expression'));
            return { label };
        }
        renderElement(element, _index, templateData) {
            const replGroup = element.element;
            dom.clearNode(templateData.label);
            const result = (0, debugANSIHandling_1.handleANSIOutput)(replGroup.name, this.linkDetector, this.themeService, undefined);
            templateData.label.appendChild(result);
        }
        disposeTemplate(_templateData) {
            // noop
        }
    };
    exports.ReplGroupRenderer = ReplGroupRenderer;
    exports.ReplGroupRenderer = ReplGroupRenderer = ReplGroupRenderer_1 = __decorate([
        __param(1, themeService_1.IThemeService)
    ], ReplGroupRenderer);
    class ReplEvaluationResultsRenderer {
        static { this.ID = 'replEvaluationResult'; }
        get templateId() {
            return ReplEvaluationResultsRenderer.ID;
        }
        constructor(linkDetector) {
            this.linkDetector = linkDetector;
        }
        renderTemplate(container) {
            const output = dom.append(container, $('.evaluation-result.expression'));
            const value = dom.append(output, $('span.value'));
            return { value };
        }
        renderElement(element, index, templateData) {
            const expression = element.element;
            (0, baseDebugView_1.renderExpressionValue)(expression, templateData.value, {
                showHover: false,
                colorize: true,
                linkDetector: this.linkDetector
            });
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    exports.ReplEvaluationResultsRenderer = ReplEvaluationResultsRenderer;
    let ReplOutputElementRenderer = class ReplOutputElementRenderer {
        static { ReplOutputElementRenderer_1 = this; }
        static { this.ID = 'outputReplElement'; }
        constructor(linkDetector, editorService, labelService, themeService) {
            this.linkDetector = linkDetector;
            this.editorService = editorService;
            this.labelService = labelService;
            this.themeService = themeService;
        }
        get templateId() {
            return ReplOutputElementRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            container.classList.add('output');
            const expression = dom.append(container, $('.output.expression.value-and-source'));
            data.container = container;
            data.countContainer = dom.append(expression, $('.count-badge-wrapper'));
            data.count = new countBadge_1.CountBadge(data.countContainer, {}, defaultStyles_1.defaultCountBadgeStyles);
            data.value = dom.append(expression, $('span.value'));
            data.source = dom.append(expression, $('.source'));
            data.toDispose = [];
            data.toDispose.push(dom.addDisposableListener(data.source, 'click', e => {
                e.preventDefault();
                e.stopPropagation();
                const source = data.getReplElementSource();
                if (source) {
                    source.source.openInEditor(this.editorService, {
                        startLineNumber: source.lineNumber,
                        startColumn: source.column,
                        endLineNumber: source.lineNumber,
                        endColumn: source.column
                    });
                }
            }));
            return data;
        }
        renderElement({ element }, index, templateData) {
            this.setElementCount(element, templateData);
            templateData.elementListener = element.onDidChangeCount(() => this.setElementCount(element, templateData));
            // value
            dom.clearNode(templateData.value);
            // Reset classes to clear ansi decorations since templates are reused
            templateData.value.className = 'value';
            templateData.value.appendChild((0, debugANSIHandling_1.handleANSIOutput)(element.value, this.linkDetector, this.themeService, element.session.root));
            templateData.value.classList.add((element.severity === severity_1.default.Warning) ? 'warn' : (element.severity === severity_1.default.Error) ? 'error' : (element.severity === severity_1.default.Ignore) ? 'ignore' : 'info');
            templateData.source.textContent = element.sourceData ? `${(0, path_1.basename)(element.sourceData.source.name)}:${element.sourceData.lineNumber}` : '';
            templateData.source.title = element.sourceData ? `${this.labelService.getUriLabel(element.sourceData.source.uri)}:${element.sourceData.lineNumber}` : '';
            templateData.getReplElementSource = () => element.sourceData;
        }
        setElementCount(element, templateData) {
            if (element.count >= 2) {
                templateData.count.setCount(element.count);
                templateData.countContainer.hidden = false;
            }
            else {
                templateData.countContainer.hidden = true;
            }
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
        disposeElement(_element, _index, templateData) {
            templateData.elementListener.dispose();
        }
    };
    exports.ReplOutputElementRenderer = ReplOutputElementRenderer;
    exports.ReplOutputElementRenderer = ReplOutputElementRenderer = ReplOutputElementRenderer_1 = __decorate([
        __param(1, editorService_1.IEditorService),
        __param(2, label_1.ILabelService),
        __param(3, themeService_1.IThemeService)
    ], ReplOutputElementRenderer);
    let ReplVariablesRenderer = class ReplVariablesRenderer extends baseDebugView_1.AbstractExpressionsRenderer {
        static { ReplVariablesRenderer_1 = this; }
        static { this.ID = 'replVariable'; }
        get templateId() {
            return ReplVariablesRenderer_1.ID;
        }
        constructor(linkDetector, debugService, contextViewService) {
            super(debugService, contextViewService);
            this.linkDetector = linkDetector;
        }
        renderElement(node, _index, data) {
            const element = node.element;
            super.renderExpressionElement(element instanceof replModel_1.ReplVariableElement ? element.expression : element, node, data);
        }
        renderExpression(expression, data, highlights) {
            const isReplVariable = expression instanceof replModel_1.ReplVariableElement;
            if (isReplVariable || !expression.name) {
                data.label.set('');
                (0, baseDebugView_1.renderExpressionValue)(isReplVariable ? expression.expression : expression, data.value, { showHover: false, colorize: true, linkDetector: this.linkDetector });
                data.expression.classList.remove('nested-variable');
            }
            else {
                (0, baseDebugView_1.renderVariable)(expression, data, true, highlights, this.linkDetector);
                data.expression.classList.toggle('nested-variable', isNestedVariable(expression));
            }
        }
        getInputBoxOptions(expression) {
            return undefined;
        }
    };
    exports.ReplVariablesRenderer = ReplVariablesRenderer;
    exports.ReplVariablesRenderer = ReplVariablesRenderer = ReplVariablesRenderer_1 = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, contextView_1.IContextViewService)
    ], ReplVariablesRenderer);
    class ReplRawObjectsRenderer {
        static { this.ID = 'rawObject'; }
        constructor(linkDetector) {
            this.linkDetector = linkDetector;
        }
        get templateId() {
            return ReplRawObjectsRenderer.ID;
        }
        renderTemplate(container) {
            container.classList.add('output');
            const expression = dom.append(container, $('.output.expression'));
            const name = dom.append(expression, $('span.name'));
            const label = new highlightedLabel_1.HighlightedLabel(name);
            const value = dom.append(expression, $('span.value'));
            return { container, expression, name, label, value };
        }
        renderElement(node, index, templateData) {
            // key
            const element = node.element;
            templateData.label.set(element.name ? `${element.name}:` : '', (0, filters_1.createMatches)(node.filterData));
            if (element.name) {
                templateData.name.textContent = `${element.name}:`;
            }
            else {
                templateData.name.textContent = '';
            }
            // value
            (0, baseDebugView_1.renderExpressionValue)(element.value, templateData.value, {
                showHover: false,
                linkDetector: this.linkDetector
            });
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    exports.ReplRawObjectsRenderer = ReplRawObjectsRenderer;
    function isNestedVariable(element) {
        return element instanceof debugModel_1.Variable && (element.parent instanceof replModel_1.ReplEvaluationResult || element.parent instanceof debugModel_1.Variable);
    }
    class ReplDelegate extends list_1.CachedListVirtualDelegate {
        constructor(configurationService, replOptions) {
            super();
            this.configurationService = configurationService;
            this.replOptions = replOptions;
        }
        getHeight(element) {
            const config = this.configurationService.getValue('debug');
            if (!config.console.wordWrap) {
                return this.estimateHeight(element, true);
            }
            return super.getHeight(element);
        }
        /**
         * With wordWrap enabled, this is an estimate. With wordWrap disabled, this is the real height that the list will use.
         */
        estimateHeight(element, ignoreValueLength = false) {
            const lineHeight = this.replOptions.replConfiguration.lineHeight;
            const countNumberOfLines = (str) => str.match(/\n/g)?.length ?? 0;
            const hasValue = (e) => typeof e.value === 'string';
            if (hasValue(element) && !isNestedVariable(element)) {
                const value = element.value;
                const valueRows = countNumberOfLines(value)
                    + (ignoreValueLength ? 0 : Math.floor(value.length / 70)) // Make an estimate for wrapping
                    + (element instanceof replModel_1.ReplOutputElement ? 0 : 1); // A SimpleReplElement ends in \n if it's a complete line
                return Math.max(valueRows, 1) * lineHeight;
            }
            return lineHeight;
        }
        getTemplateId(element) {
            if (element instanceof debugModel_1.Variable || element instanceof replModel_1.ReplVariableElement) {
                return ReplVariablesRenderer.ID;
            }
            if (element instanceof replModel_1.ReplEvaluationResult) {
                return ReplEvaluationResultsRenderer.ID;
            }
            if (element instanceof replModel_1.ReplEvaluationInput) {
                return ReplEvaluationInputsRenderer.ID;
            }
            if (element instanceof replModel_1.ReplOutputElement) {
                return ReplOutputElementRenderer.ID;
            }
            if (element instanceof replModel_1.ReplGroup) {
                return ReplGroupRenderer.ID;
            }
            return ReplRawObjectsRenderer.ID;
        }
        hasDynamicHeight(element) {
            if (isNestedVariable(element)) {
                // Nested variables should always be in one line #111843
                return false;
            }
            // Empty elements should not have dynamic height since they will be invisible
            return element.toString().length > 0;
        }
    }
    exports.ReplDelegate = ReplDelegate;
    function isDebugSession(obj) {
        return typeof obj.getReplElements === 'function';
    }
    class ReplDataSource {
        hasChildren(element) {
            if (isDebugSession(element)) {
                return true;
            }
            return !!element.hasChildren;
        }
        getChildren(element) {
            if (isDebugSession(element)) {
                return Promise.resolve(element.getReplElements());
            }
            return Promise.resolve(element.getChildren());
        }
    }
    exports.ReplDataSource = ReplDataSource;
    class ReplAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('debugConsole', "Debug Console");
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.Variable) {
                return (0, nls_1.localize)('replVariableAriaLabel', "Variable {0}, value {1}", element.name, element.value);
            }
            if (element instanceof replModel_1.ReplOutputElement || element instanceof replModel_1.ReplEvaluationInput || element instanceof replModel_1.ReplEvaluationResult) {
                return element.value + (element instanceof replModel_1.ReplOutputElement && element.count > 1 ? (0, nls_1.localize)({ key: 'occurred', comment: ['Front will the value of the debug console element. Placeholder will be replaced by a number which represents occurrance count.'] }, ", occurred {0} times", element.count) : '');
            }
            if (element instanceof replModel_1.RawObjectReplElement) {
                return (0, nls_1.localize)('replRawObjectAriaLabel', "Debug console variable {0}, value {1}", element.name, element.value);
            }
            if (element instanceof replModel_1.ReplGroup) {
                return (0, nls_1.localize)('replGroup', "Debug console group {0}", element.name);
            }
            return '';
        }
    }
    exports.ReplAccessibilityProvider = ReplAccessibilityProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbFZpZXdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9yZXBsVmlld2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE0QmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFpQ2hCLE1BQWEsNEJBQTRCO2lCQUN4QixPQUFFLEdBQUcscUJBQXFCLENBQUM7UUFFM0MsSUFBSSxVQUFVO1lBQ2IsT0FBTyw0QkFBNEIsQ0FBQyxFQUFFLENBQUM7UUFDeEMsQ0FBQztRQUVELGNBQWMsQ0FBQyxTQUFzQjtZQUNwQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsWUFBWSxHQUFHLHFCQUFTLENBQUMsYUFBYSxDQUFDLHdDQUEyQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlGLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sS0FBSyxHQUFHLElBQUksbUNBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFRCxhQUFhLENBQUMsT0FBbUQsRUFBRSxLQUFhLEVBQUUsWUFBOEM7WUFDL0gsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztZQUNuQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUEsdUJBQWEsRUFBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUM3RSxDQUFDO1FBRUQsZUFBZSxDQUFDLFlBQThDO1lBQzdELE9BQU87UUFDUixDQUFDOztJQXJC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