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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/filters", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/replModel"], function (require, exports, dom, actionbar_1, highlightedLabel_1, inputBox_1, codicons_1, themables_1, filters_1, functional_1, lifecycle_1, nls_1, contextView_1, defaultStyles_1, debug_1, debugModel_1, replModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractExpressionsRenderer = exports.renderVariable = exports.renderExpressionValue = exports.renderViewTree = void 0;
    const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
    const booleanRegex = /^(true|false)$/i;
    const stringRegex = /^(['"]).*\1$/;
    const $ = dom.$;
    function renderViewTree(container) {
        const treeContainer = $('.');
        treeContainer.classList.add('debug-view-content');
        container.appendChild(treeContainer);
        return treeContainer;
    }
    exports.renderViewTree = renderViewTree;
    function renderExpressionValue(expressionOrValue, container, options) {
        let value = typeof expressionOrValue === 'string' ? expressionOrValue : expressionOrValue.value;
        // remove stale classes
        container.className = 'value';
        // when resolving expressions we represent errors from the server as a variable with name === null.
        if (value === null || ((expressionOrValue instanceof debugModel_1.Expression || expressionOrValue instanceof debugModel_1.Variable || expressionOrValue instanceof replModel_1.ReplEvaluationResult) && !expressionOrValue.available)) {
            container.classList.add('unavailable');
            if (value !== debugModel_1.Expression.DEFAULT_VALUE) {
                container.classList.add('error');
            }
        }
        else {
            if (typeof expressionOrValue !== 'string' && options.showChanged && expressionOrValue.valueChanged && value !== debugModel_1.Expression.DEFAULT_VALUE) {
                // value changed color has priority over other colors.
                container.className = 'value changed';
                expressionOrValue.valueChanged = false;
            }
            if (options.colorize && typeof expressionOrValue !== 'string') {
                if (expressionOrValue.type === 'number' || expressionOrValue.type === 'boolean' || expressionOrValue.type === 'string') {
                    container.classList.add(expressionOrValue.type);
                }
                else if (!isNaN(+value)) {
                    container.classList.add('number');
                }
                else if (booleanRegex.test(value)) {
                    container.classList.add('boolean');
                }
                else if (stringRegex.test(value)) {
                    container.classList.add('string');
                }
            }
        }
        if (options.maxValueLength && value && value.length > options.maxValueLength) {
            value = value.substring(0, options.maxValueLength) + '...';
        }
        if (!value) {
            value = '';
        }
        if (options.linkDetector) {
            container.textContent = '';
            const session = (expressionOrValue instanceof debugModel_1.ExpressionContainer) ? expressionOrValue.getSession() : undefined;
            container.appendChild(options.linkDetector.linkify(value, false, session ? session.root : undefined, true));
        }
        else {
            container.textContent = value;
        }
        if (options.showHover) {
            container.title = value || '';
        }
    }
    exports.renderExpressionValue = renderExpressionValue;
    function renderVariable(variable, data, showChanged, highlights, linkDetector) {
        if (variable.available) {
            let text = variable.name;
            if (variable.value && typeof variable.name === 'string') {
                text += ':';
            }
            data.label.set(text, highlights, variable.type ? variable.type : variable.name);
            data.name.classList.toggle('virtual', variable.presentationHint?.kind === 'virtual');
            data.name.classList.toggle('internal', variable.presentationHint?.visibility === 'internal');
        }
        else if (variable.value && typeof variable.name === 'string' && variable.name) {
            data.label.set(':');
        }
        data.expression.classList.toggle('lazy', !!variable.presentationHint?.lazy);
        renderExpressionValue(variable, data.value, {
            showChanged,
            maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
            showHover: true,
            colorize: true,
            linkDetector
        });
    }
    exports.renderVariable = renderVariable;
    let AbstractExpressionsRenderer = class AbstractExpressionsRenderer {
        constructor(debugService, contextViewService) {
            this.debugService = debugService;
            this.contextViewService = contextViewService;
        }
        renderTemplate(container) {
            const expression = dom.append(container, $('.expression'));
            const name = dom.append(expression, $('span.name'));
            const lazyButton = dom.append(expression, $('span.lazy-button'));
            lazyButton.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.eye));
            lazyButton.title = (0, nls_1.localize)('debug.lazyButton.tooltip', "Click to expand");
            const value = dom.append(expression, $('span.value'));
            const label = new highlightedLabel_1.HighlightedLabel(name);
            const inputBoxContainer = dom.append(expression, $('.inputBoxContainer'));
            const templateDisposable = new lifecycle_1.DisposableStore();
            let actionBar;
            if (this.renderActionBar) {
                dom.append(expression, $('.span.actionbar-spacer'));
                actionBar = templateDisposable.add(new actionbar_1.ActionBar(expression));
            }
            const template = { expression, name, value, label, inputBoxContainer, actionBar, elementDisposable: new lifecycle_1.DisposableStore(), templateDisposable, lazyButton, currentElement: undefined };
            templateDisposable.add(dom.addDisposableListener(lazyButton, dom.EventType.CLICK, () => {
                if (template.currentElement) {
                    this.debugService.getViewModel().evaluateLazyExpression(template.currentElement);
                }
            }));
            return template;
        }
        renderExpressionElement(element, node, data) {
            data.elementDisposable.clear();
            data.currentElement = element;
            this.renderExpression(node.element, data, (0, filters_1.createMatches)(node.filterData));
            if (data.actionBar) {
                this.renderActionBar(data.actionBar, element, data);
            }
            const selectedExpression = this.debugService.getViewModel().getSelectedExpression();
            if (element === selectedExpression?.expression || (element instanceof debugModel_1.Variable && element.errorMessage)) {
                const options = this.getInputBoxOptions(element, !!selectedExpression?.settingWatch);
                if (options) {
                    data.elementDisposable.add(this.renderInputBox(data.name, data.value, data.inputBoxContainer, options));
                }
            }
        }
        renderInputBox(nameElement, valueElement, inputBoxContainer, options) {
            nameElement.style.display = 'none';
            valueElement.style.display = 'none';
            inputBoxContainer.style.display = 'initial';
            dom.clearNode(inputBoxContainer);
            const inputBox = new inputBox_1.InputBox(inputBoxContainer, this.contextViewService, { ...options, inputBoxStyles: defaultStyles_1.defaultInputBoxStyles });
            inputBox.value = options.initialValue;
            inputBox.focus();
            inputBox.select();
            const done = (0, functional_1.createSingleCallFunction)((success, finishEditing) => {
                nameElement.style.display = '';
                valueElement.style.display = '';
                inputBoxContainer.style.display = 'none';
                const value = inputBox.value;
                (0, lifecycle_1.dispose)(toDispose);
                if (finishEditing) {
                    this.debugService.getViewModel().setSelectedExpression(undefined, false);
                    options.onFinish(value, success);
                }
            });
            const toDispose = [
                inputBox,
                dom.addStandardDisposableListener(inputBox.inputElement, dom.EventType.KEY_DOWN, (e) => {
                    const isEscape = e.equals(9 /* KeyCode.Escape */);
                    const isEnter = e.equals(3 /* KeyCode.Enter */);
                    if (isEscape || isEnter) {
                        e.preventDefault();
                        e.stopPropagation();
                        done(isEnter, true);
                    }
                }),
                dom.addDisposableListener(inputBox.inputElement, dom.EventType.BLUR, () => {
                    done(true, true);
                }),
                dom.addDisposableListener(inputBox.inputElement, dom.EventType.CLICK, e => {
                    // Do not expand / collapse selected elements
                    e.preventDefault();
                    e.stopPropagation();
                })
            ];
            return (0, lifecycle_1.toDisposable)(() => {
                done(false, false);
            });
        }
        disposeElement(node, index, templateData) {
            templateData.elementDisposable.clear();
        }
        disposeTemplate(templateData) {
            templateData.elementDisposable.dispose();
            templateData.templateDisposable.dispose();
        }
    };
    exports.AbstractExpressionsRenderer = AbstractExpressionsRenderer;
    exports.AbstractExpressionsRenderer = AbstractExpressionsRenderer = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, contextView_1.IContextViewService)
    ], AbstractExpressionsRenderer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZURlYnVnVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9iYXNlRGVidWdWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXNCaEcsTUFBTSxrQ0FBa0MsR0FBRyxJQUFJLENBQUM7SUFDaEQsTUFBTSxZQUFZLEdBQUcsaUJBQWlCLENBQUM7SUFDdkMsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO0lBQ25DLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFrQmhCLFNBQWdCLGNBQWMsQ0FBQyxTQUFzQjtRQUNwRCxNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNsRCxTQUFTLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sYUFBYSxDQUFDO0lBQ3RCLENBQUM7SUFMRCx3Q0FLQztJQUVELFNBQWdCLHFCQUFxQixDQUFDLGlCQUE0QyxFQUFFLFNBQXNCLEVBQUUsT0FBNEI7UUFDdkksSUFBSSxLQUFLLEdBQUcsT0FBTyxpQkFBaUIsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7UUFFaEcsdUJBQXVCO1FBQ3ZCLFNBQVMsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO1FBQzlCLG1HQUFtRztRQUNuRyxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLGlCQUFpQixZQUFZLHVCQUFVLElBQUksaUJBQWlCLFlBQVkscUJBQVEsSUFBSSxpQkFBaUIsWUFBWSxnQ0FBb0IsQ0FBQyxJQUFJLENBQUMs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