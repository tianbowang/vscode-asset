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
define(["require", "exports", "vs/base/common/async", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/platform/configuration/common/configuration", "vs/workbench/browser/parts/views/viewPane", "vs/platform/list/browser/listService", "vs/base/browser/ui/list/listView", "vs/workbench/contrib/debug/browser/variablesView", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/debug/browser/debugIcons", "vs/platform/actions/common/actions", "vs/nls", "vs/base/common/codicons", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/contrib/debug/browser/linkDetector"], function (require, exports, async_1, debug_1, debugModel_1, contextView_1, instantiation_1, keybinding_1, baseDebugView_1, configuration_1, viewPane_1, listService_1, listView_1, variablesView_1, contextkey_1, views_1, opener_1, themeService_1, telemetry_1, debugIcons_1, actions_1, nls_1, codicons_1, menuEntryActionViewItem_1, linkDetector_1) {
    "use strict";
    var WatchExpressionsRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.REMOVE_WATCH_EXPRESSIONS_LABEL = exports.REMOVE_WATCH_EXPRESSIONS_COMMAND_ID = exports.ADD_WATCH_LABEL = exports.ADD_WATCH_ID = exports.WatchExpressionsView = void 0;
    const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
    let ignoreViewUpdates = false;
    let useCachedEvaluation = false;
    let WatchExpressionsView = class WatchExpressionsView extends viewPane_1.ViewPane {
        constructor(options, contextMenuService, debugService, keybindingService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, themeService, telemetryService, menuService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.debugService = debugService;
            this.needsRefresh = false;
            this.menu = menuService.createMenu(actions_1.MenuId.DebugWatchContext, contextKeyService);
            this._register(this.menu);
            this.watchExpressionsUpdatedScheduler = new async_1.RunOnceScheduler(() => {
                this.needsRefresh = false;
                this.tree.updateChildren();
            }, 50);
            this.watchExpressionsExist = debug_1.CONTEXT_WATCH_EXPRESSIONS_EXIST.bindTo(contextKeyService);
            this.variableReadonly = debug_1.CONTEXT_VARIABLE_IS_READONLY.bindTo(contextKeyService);
            this.watchExpressionsExist.set(this.debugService.getModel().getWatchExpressions().length > 0);
            this.watchItemType = debug_1.CONTEXT_WATCH_ITEM_TYPE.bindTo(contextKeyService);
        }
        renderBody(container) {
            super.renderBody(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-watch');
            const treeContainer = (0, baseDebugView_1.renderViewTree)(container);
            const expressionsRenderer = this.instantiationService.createInstance(WatchExpressionsRenderer);
            const linkeDetector = this.instantiationService.createInstance(linkDetector_1.LinkDetector);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchAsyncDataTree, 'WatchExpressions', treeContainer, new WatchExpressionsDelegate(), [expressionsRenderer, this.instantiationService.createInstance(variablesView_1.VariablesRenderer, linkeDetector)], new WatchExpressionsDataSource(), {
                accessibilityProvider: new WatchExpressionsAccessibilityProvider(),
                identityProvider: { getId: (element) => element.getId() },
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (e) => {
                        if (e === this.debugService.getViewModel().getSelectedExpression()?.expression) {
                            // Don't filter input box
                            return undefined;
                        }
                        return e.name;
                    }
                },
                dnd: new WatchExpressionsDragAndDrop(this.debugService),
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            this.tree.setInput(this.debugService);
            debug_1.CONTEXT_WATCH_EXPRESSIONS_FOCUSED.bindTo(this.tree.contextKeyService);
            this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
            this._register(this.tree.onMouseDblClick(e => this.onMouseDblClick(e)));
            this._register(this.debugService.getModel().onDidChangeWatchExpressions(async (we) => {
                this.watchExpressionsExist.set(this.debugService.getModel().getWatchExpressions().length > 0);
                if (!this.isBodyVisible()) {
                    this.needsRefresh = true;
                }
                else {
                    if (we && !we.name) {
                        // We are adding a new input box, no need to re-evaluate watch expressions
                        useCachedEvaluation = true;
                    }
                    await this.tree.updateChildren();
                    useCachedEvaluation = false;
                    if (we instanceof debugModel_1.Expression) {
                        this.tree.reveal(we);
                    }
                }
            }));
            this._register(this.debugService.getViewModel().onDidFocusStackFrame(() => {
                if (!this.isBodyVisible()) {
                    this.needsRefresh = true;
                    return;
                }
                if (!this.watchExpressionsUpdatedScheduler.isScheduled()) {
                    this.watchExpressionsUpdatedScheduler.schedule();
                }
            }));
            this._register(this.debugService.getViewModel().onWillUpdateViews(() => {
                if (!ignoreViewUpdates) {
                    this.tree.updateChildren();
                }
            }));
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.needsRefresh) {
                    this.watchExpressionsUpdatedScheduler.schedule();
                }
            }));
            let horizontalScrolling;
            this._register(this.debugService.getViewModel().onDidSelectExpression(e => {
                const expression = e?.expression;
                if (expression instanceof debugModel_1.Expression || (expression instanceof debugModel_1.Variable && e?.settingWatch)) {
                    horizontalScrolling = this.tree.options.horizontalScrolling;
                    if (horizontalScrolling) {
                        this.tree.updateOptions({ horizontalScrolling: false });
                    }
                    if (expression.name) {
                        // Only rerender if the input is already done since otherwise the tree is not yet aware of the new element
                        this.tree.rerender(expression);
                    }
                }
                else if (!expression && horizontalScrolling !== undefined) {
                    this.tree.updateOptions({ horizontalScrolling: horizontalScrolling });
                    horizontalScrolling = undefined;
                }
            }));
            this._register(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
                if (e instanceof debugModel_1.Variable && this.tree.hasNode(e)) {
                    await this.tree.updateChildren(e, false, true);
                    await this.tree.expand(e);
                }
            }));
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.tree.layout(height, width);
        }
        focus() {
            super.focus();
            this.tree.domFocus();
        }
        collapseAll() {
            this.tree.collapseAll();
        }
        onMouseDblClick(e) {
            if (e.browserEvent.target.className.indexOf('twistie') >= 0) {
                // Ignore double click events on twistie
                return;
            }
            const element = e.element;
            // double click on primitive value: open input box to be able to select and copy value.
            const selectedExpression = this.debugService.getViewModel().getSelectedExpression();
            if (element instanceof debugModel_1.Expression && element !== selectedExpression?.expression) {
                this.debugService.getViewModel().setSelectedExpression(element, false);
            }
            else if (!element) {
                // Double click in watch panel triggers to add a new watch expression
                this.debugService.addWatchExpression();
            }
        }
        onContextMenu(e) {
            const element = e.element;
            const selection = this.tree.getSelection();
            this.watchItemType.set(element instanceof debugModel_1.Expression ? 'expression' : element instanceof debugModel_1.Variable ? 'variable' : undefined);
            const actions = [];
            const attributes = element instanceof debugModel_1.Variable ? element.presentationHint?.attributes : undefined;
            this.variableReadonly.set(!!attributes && attributes.indexOf('readOnly') >= 0 || !!element?.presentationHint?.lazy);
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(this.menu, { arg: element, shouldForwardArgs: true }, actions);
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                getActionsContext: () => element && selection.includes(element) ? selection : element ? [element] : [],
            });
        }
    };
    exports.WatchExpressionsView = WatchExpressionsView;
    exports.WatchExpressionsView = WatchExpressionsView = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, debug_1.IDebugService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, opener_1.IOpenerService),
        __param(9, themeService_1.IThemeService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, actions_1.IMenuService)
    ], WatchExpressionsView);
    class WatchExpressionsDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof debugModel_1.Expression) {
                return WatchExpressionsRenderer.ID;
            }
            // Variable
            return variablesView_1.VariablesRenderer.ID;
        }
    }
    function isDebugService(element) {
        return typeof element.getConfigurationManager === 'function';
    }
    class WatchExpressionsDataSource {
        hasChildren(element) {
            return isDebugService(element) || element.hasChildren;
        }
        getChildren(element) {
            if (isDebugService(element)) {
                const debugService = element;
                const watchExpressions = debugService.getModel().getWatchExpressions();
                const viewModel = debugService.getViewModel();
                return Promise.all(watchExpressions.map(we => !!we.name && !useCachedEvaluation
                    ? we.evaluate(viewModel.focusedSession, viewModel.focusedStackFrame, 'watch').then(() => we)
                    : Promise.resolve(we)));
            }
            return element.getChildren();
        }
    }
    let WatchExpressionsRenderer = class WatchExpressionsRenderer extends baseDebugView_1.AbstractExpressionsRenderer {
        static { WatchExpressionsRenderer_1 = this; }
        static { this.ID = 'watchexpression'; }
        constructor(menuService, contextKeyService, debugService, contextViewService) {
            super(debugService, contextViewService);
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
        }
        get templateId() {
            return WatchExpressionsRenderer_1.ID;
        }
        renderElement(node, index, data) {
            super.renderExpressionElement(node.element, node, data);
        }
        renderExpression(expression, data, highlights) {
            const text = typeof expression.value === 'string' ? `${expression.name}:` : expression.name;
            let title;
            if (expression.type) {
                title = expression.type === expression.value ?
                    expression.type :
                    `${expression.type}: ${expression.value}`;
            }
            else {
                title = expression.value;
            }
            data.label.set(text, highlights, title);
            (0, baseDebugView_1.renderExpressionValue)(expression, data.value, {
                showChanged: true,
                maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
                showHover: true,
                colorize: true
            });
        }
        getInputBoxOptions(expression, settingValue) {
            if (settingValue) {
                return {
                    initialValue: expression.value,
                    ariaLabel: (0, nls_1.localize)('typeNewValue', "Type new value"),
                    onFinish: async (value, success) => {
                        if (success && value) {
                            const focusedFrame = this.debugService.getViewModel().focusedStackFrame;
                            if (focusedFrame && (expression instanceof debugModel_1.Variable || expression instanceof debugModel_1.Expression)) {
                                await expression.setExpression(value, focusedFrame);
                                this.debugService.getViewModel().updateViews();
                            }
                        }
                    }
                };
            }
            return {
                initialValue: expression.name ? expression.name : '',
                ariaLabel: (0, nls_1.localize)('watchExpressionInputAriaLabel', "Type watch expression"),
                placeholder: (0, nls_1.localize)('watchExpressionPlaceholder', "Expression to watch"),
                onFinish: (value, success) => {
                    if (success && value) {
                        this.debugService.renameWatchExpression(expression.getId(), value);
                        ignoreViewUpdates = true;
                        this.debugService.getViewModel().updateViews();
                        ignoreViewUpdates = false;
                    }
                    else if (!expression.name) {
                        this.debugService.removeWatchExpressions(expression.getId());
                    }
                }
            };
        }
        renderActionBar(actionBar, expression) {
            const contextKeyService = getContextForWatchExpressionMenu(this.contextKeyService, expression);
            const menu = this.menuService.createMenu(actions_1.MenuId.DebugWatchContext, contextKeyService);
            const primary = [];
            const context = expression;
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { arg: context, shouldForwardArgs: false }, { primary, secondary: [] }, 'inline');
            actionBar.clear();
            actionBar.context = context;
            actionBar.push(primary, { icon: true, label: false });
        }
    };
    WatchExpressionsRenderer = WatchExpressionsRenderer_1 = __decorate([
        __param(0, actions_1.IMenuService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, debug_1.IDebugService),
        __param(3, contextView_1.IContextViewService)
    ], WatchExpressionsRenderer);
    /**
     * Gets a context key overlay that has context for the given expression.
     */
    function getContextForWatchExpressionMenu(parentContext, expression) {
        return parentContext.createOverlay([
            [debug_1.CONTEXT_CAN_VIEW_MEMORY.key, expression.memoryReference !== undefined],
            [debug_1.CONTEXT_WATCH_ITEM_TYPE.key, 'expression']
        ]);
    }
    class WatchExpressionsAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)({ comment: ['Debug is a noun in this context, not a verb.'], key: 'watchAriaTreeLabel' }, "Debug Watch Expressions");
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.Expression) {
                return (0, nls_1.localize)('watchExpressionAriaLabel', "{0}, value {1}", element.name, element.value);
            }
            // Variable
            return (0, nls_1.localize)('watchVariableAriaLabel', "{0}, value {1}", element.name, element.value);
        }
    }
    class WatchExpressionsDragAndDrop {
        constructor(debugService) {
            this.debugService = debugService;
        }
        onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
            if (!(data instanceof listView_1.ElementsDragAndDropData)) {
                return false;
            }
            const expressions = data.elements;
            if (!(expressions.length > 0 && expressions[0] instanceof debugModel_1.Expression)) {
                return false;
            }
            let dropEffectPosition = undefined;
            if (targetIndex === undefined) {
                // Hovering over the list
                dropEffectPosition = "drop-target-after" /* ListDragOverEffectPosition.After */;
                targetIndex = -1;
            }
            else {
                // Hovering over an element
                switch (targetSector) {
                    case 0 /* ListViewTargetSector.TOP */:
                    case 1 /* ListViewTargetSector.CENTER_TOP */:
                        dropEffectPosition = "drop-target-before" /* ListDragOverEffectPosition.Before */;
                        break;
                    case 2 /* ListViewTargetSector.CENTER_BOTTOM */:
                    case 3 /* ListViewTargetSector.BOTTOM */:
                        dropEffectPosition = "drop-target-after" /* ListDragOverEffectPosition.After */;
                        break;
                }
            }
            return { accept: true, effect: { type: 1 /* ListDragOverEffectType.Move */, position: dropEffectPosition }, feedback: [targetIndex] };
        }
        getDragURI(element) {
            if (!(element instanceof debugModel_1.Expression) || element === this.debugService.getViewModel().getSelectedExpression()?.expression) {
                return null;
            }
            return element.getId();
        }
        getDragLabel(elements) {
            if (elements.length === 1) {
                return elements[0].name;
            }
            return undefined;
        }
        drop(data, targetElement, targetIndex, targetSector, originalEvent) {
            if (!(data instanceof listView_1.ElementsDragAndDropData)) {
                return;
            }
            const draggedElement = data.elements[0];
            if (!(draggedElement instanceof debugModel_1.Expression)) {
                throw new Error('Invalid dragged element');
            }
            const watches = this.debugService.getModel().getWatchExpressions();
            const sourcePosition = watches.indexOf(draggedElement);
            let targetPosition;
            if (targetElement instanceof debugModel_1.Expression) {
                targetPosition = watches.indexOf(targetElement);
                switch (targetSector) {
                    case 3 /* ListViewTargetSector.BOTTOM */:
                    case 2 /* ListViewTargetSector.CENTER_BOTTOM */:
                        targetPosition++;
                        break;
                }
                if (sourcePosition < targetPosition) {
                    targetPosition--;
                }
            }
            else {
                targetPosition = watches.length - 1;
            }
            this.debugService.moveWatchExpression(draggedElement.getId(), targetPosition);
        }
        dispose() { }
    }
    (0, actions_1.registerAction2)(class Collapse extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'watch.collapse',
                viewId: debug_1.WATCH_VIEW_ID,
                title: (0, nls_1.localize)('collapse', "Collapse All"),
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                precondition: debug_1.CONTEXT_WATCH_EXPRESSIONS_EXIST,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    order: 30,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', debug_1.WATCH_VIEW_ID)
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
    exports.ADD_WATCH_ID = 'workbench.debug.viewlet.action.addWatchExpression'; // Use old and long id for backwards compatibility
    exports.ADD_WATCH_LABEL = (0, nls_1.localize)('addWatchExpression', "Add Expression");
    (0, actions_1.registerAction2)(class AddWatchExpressionAction extends actions_1.Action2 {
        constructor() {
            super({
                id: exports.ADD_WATCH_ID,
                title: exports.ADD_WATCH_LABEL,
                f1: false,
                icon: debugIcons_1.watchExpressionsAdd,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', debug_1.WATCH_VIEW_ID)
                }
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.addWatchExpression();
        }
    });
    exports.REMOVE_WATCH_EXPRESSIONS_COMMAND_ID = 'workbench.debug.viewlet.action.removeAllWatchExpressions';
    exports.REMOVE_WATCH_EXPRESSIONS_LABEL = (0, nls_1.localize)('removeAllWatchExpressions', "Remove All Expressions");
    (0, actions_1.registerAction2)(class RemoveAllWatchExpressionsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: exports.REMOVE_WATCH_EXPRESSIONS_COMMAND_ID, // Use old and long id for backwards compatibility
                title: exports.REMOVE_WATCH_EXPRESSIONS_LABEL,
                f1: false,
                icon: debugIcons_1.watchExpressionsRemoveAll,
                precondition: debug_1.CONTEXT_WATCH_EXPRESSIONS_EXIST,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    order: 20,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', debug_1.WATCH_VIEW_ID)
                }
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.removeWatchExpressions();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2hFeHByZXNzaW9uc1ZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvd2F0Y2hFeHByZXNzaW9uc1ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW1DaEcsTUFBTSxrQ0FBa0MsR0FBRyxJQUFJLENBQUM7SUFDaEQsSUFBSSxpQkFBaUIsR0FBRyxLQUFLLENBQUM7SUFDOUIsSUFBSSxtQkFBbUIsR0FBRyxLQUFLLENBQUM7SUFFekIsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSxtQkFBUTtRQVVqRCxZQUNDLE9BQTRCLEVBQ1Asa0JBQXVDLEVBQzdDLFlBQTRDLEVBQ3ZDLGlCQUFxQyxFQUNsQyxvQkFBMkMsRUFDMUMscUJBQTZDLEVBQzlDLG9CQUEyQyxFQUM5QyxpQkFBcUMsRUFDekMsYUFBNkIsRUFDOUIsWUFBMkIsRUFDdkIsZ0JBQW1DLEVBQ3hDLFdBQXlCO1lBRXZDLEtBQUssQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBWDNKLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBVnBELGlCQUFZLEdBQUcsS0FBSyxDQUFDO1lBdUI1QixJQUFJLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsZ0JBQU0sQ0FBQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxnQ0FBZ0MsR0FBRyxJQUFJLHdCQUFnQixDQUFDLEdBQUcsRUFBRTtnQkFDakUsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDNUIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ1AsSUFBSSxDQUFDLHFCQUFxQixHQUFHLHVDQUErQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3ZGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxvQ0FBNEIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBdUIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRWtCLFVBQVUsQ0FBQyxTQUFzQjtZQUNuRCxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTVCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN6QyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN2QyxNQUFNLGFBQWEsR0FBRyxJQUFBLDhCQUFjLEVBQUMsU0FBUyxDQUFDLENBQUM7WUFFaEQsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDL0YsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQkFBWSxDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLElBQUksR0FBaUYsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxvQ0FBc0IsRUFBRSxrQkFBa0IsRUFBRSxhQUFhLEVBQUUsSUFBSSx3QkFBd0IsRUFBRSxFQUFFLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxpQ0FBaUIsRUFBRSxhQUFhLENBQUMsQ0FBQyxFQUM5VCxJQUFJLDBCQUEwQixFQUFFLEVBQUU7Z0JBQ2xDLHFCQUFxQixFQUFFLElBQUkscUNBQXFDLEVBQUU7Z0JBQ2xFLGdCQUFnQixFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsT0FBb0IsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUN0RSwrQkFBK0IsRUFBRTtvQkFDaEMsMEJBQTBCLEVBQUUsQ0FBQyxDQUFjLEVBQUUsRUFBRTt3QkFDOUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDOzRCQUNoRix5QkFBeUI7NEJBQ3pCLE9BQU8sU0FBUyxDQUFDO3dCQUNsQixDQUFDO3dCQUVELE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDZixDQUFDO2lCQUNEO2dCQUNELEdBQUcsRUFBRSxJQUFJLDJCQUEyQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQ3ZELGNBQWMsRUFBRTtvQkFDZixjQUFjLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFO2lCQUN6QzthQUNELENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN0Qyx5Q0FBaUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRXRFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLDJCQUEyQixDQUFDLEtBQUssRUFBQyxFQUFFLEVBQUMsRUFBRTtnQkFDbEYsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM5RixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUM7b0JBQzNCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUMxQixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ3BCLDBFQUEwRTt3QkFDMUUsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO29CQUM1QixDQUFDO29CQUNELE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDakMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO29CQUM1QixJQUFJLEVBQUUsWUFBWSx1QkFBVSxFQUFFLENBQUM7d0JBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN0QixDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRTtnQkFDekUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDO29CQUMzQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztvQkFDekIsT0FBTztnQkFDUixDQUFDO2dCQUVELElBQUksQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztvQkFDMUQsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNsRCxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3RFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO29CQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUM1QixDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN2RCxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbEQsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLG1CQUF3QyxDQUFDO1lBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDekUsTUFBTSxVQUFVLEdBQUcsQ0FBQyxFQUFFLFVBQVUsQ0FBQztnQkFDakMsSUFBSSxVQUFVLFlBQVksdUJBQVUsSUFBSSxDQUFDLFVBQVUsWUFBWSxxQkFBUSxJQUFJLENBQUMsRUFBRSxZQUFZLENBQUMsRUFBRSxDQUFDO29CQUM3RixtQkFBbUIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQztvQkFDNUQsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO3dCQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7b0JBQ3pELENBQUM7b0JBRUQsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ3JCLDBHQUEwRzt3QkFDMUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2hDLENBQUM7Z0JBQ0YsQ0FBQztxQkFBTSxJQUFJLENBQUMsVUFBVSxJQUFJLG1CQUFtQixLQUFLLFNBQVMsRUFBRSxDQUFDO29CQUM3RCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLG1CQUFtQixFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQztvQkFDdEUsbUJBQW1CLEdBQUcsU0FBUyxDQUFDO2dCQUNqQyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUU7Z0JBQ3JGLElBQUksQ0FBQyxZQUFZLHFCQUFRLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDbkQsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUMvQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFa0IsVUFBVSxDQUFDLE1BQWMsRUFBRSxLQUFhO1lBQzFELEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRVEsS0FBSztZQUNiLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEIsQ0FBQztRQUVELFdBQVc7WUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3pCLENBQUM7UUFFTyxlQUFlLENBQUMsQ0FBK0I7WUFDdEQsSUFBSyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQXNCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDOUUsd0NBQXdDO2dCQUN4QyxPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDMUIsdUZBQXVGO1lBQ3ZGLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ3BGLElBQUksT0FBTyxZQUFZLHVCQUFVLElBQUksT0FBTyxLQUFLLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxDQUFDO2dCQUNqRixJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4RSxDQUFDO2lCQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDckIscUVBQXFFO2dCQUNyRSxJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDeEMsQ0FBQztRQUNGLENBQUM7UUFFTyxhQUFhLENBQUMsQ0FBcUM7WUFDMUQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUMxQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRTNDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sWUFBWSx1QkFBVSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sWUFBWSxxQkFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVILE1BQU0sT0FBTyxHQUFjLEVBQUUsQ0FBQztZQUM5QixNQUFNLFVBQVUsR0FBRyxPQUFPLFlBQVkscUJBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ2xHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3BILElBQUEsMkRBQWlDLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDakcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztnQkFDdkMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNO2dCQUN6QixVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTztnQkFDekIsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2FBQ3RHLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFBO0lBckxZLG9EQUFvQjttQ0FBcEIsb0JBQW9CO1FBWTlCLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSxxQkFBYSxDQUFBO1FBQ2IsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsOEJBQXNCLENBQUE7UUFDdEIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEsNEJBQWEsQ0FBQTtRQUNiLFlBQUEsNkJBQWlCLENBQUE7UUFDakIsWUFBQSxzQkFBWSxDQUFBO09BdEJGLG9CQUFvQixDQXFMaEM7SUFFRCxNQUFNLHdCQUF3QjtRQUU3QixTQUFTLENBQUMsUUFBcUI7WUFDOUIsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRUQsYUFBYSxDQUFDLE9BQW9CO1lBQ2pDLElBQUksT0FBTyxZQUFZLHVCQUFVLEVBQUUsQ0FBQztnQkFDbkMsT0FBTyx3QkFBd0IsQ0FBQyxFQUFFLENBQUM7WUFDcEMsQ0FBQztZQUVELFdBQVc7WUFDWCxPQUFPLGlDQUFpQixDQUFDLEVBQUUsQ0FBQztRQUM3QixDQUFDO0tBQ0Q7SUFFRCxTQUFTLGNBQWMsQ0FBQyxPQUFZO1FBQ25DLE9BQU8sT0FBTyxPQUFPLENBQUMsdUJBQXVCLEtBQUssVUFBVSxDQUFDO0lBQzlELENBQUM7SUFFRCxNQUFNLDBCQUEwQjtRQUUvQixXQUFXLENBQUMsT0FBb0M7WUFDL0MsT0FBTyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUN2RCxDQUFDO1FBRUQsV0FBVyxDQUFDLE9BQW9DO1lBQy9DLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQzdCLE1BQU0sWUFBWSxHQUFHLE9BQXdCLENBQUM7Z0JBQzlDLE1BQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQ3ZFLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDOUMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsbUJBQW1CO29CQUM5RSxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsY0FBZSxFQUFFLFNBQVMsQ0FBQyxpQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO29CQUM5RixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsQ0FBQztZQUVELE9BQU8sT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzlCLENBQUM7S0FDRDtJQUdELElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsMkNBQTJCOztpQkFFakQsT0FBRSxHQUFHLGlCQUFpQixBQUFwQixDQUFxQjtRQUV2QyxZQUNnQyxXQUF5QixFQUNuQixpQkFBcUMsRUFDM0QsWUFBMkIsRUFDckIsa0JBQXVDO1lBRTVELEtBQUssQ0FBQyxZQUFZLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUxULGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ25CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7UUFLM0UsQ0FBQztRQUVELElBQUksVUFBVTtZQUNiLE9BQU8sMEJBQXdCLENBQUMsRUFBRSxDQUFDO1FBQ3BDLENBQUM7UUFFZSxhQUFhLENBQUMsSUFBd0MsRUFBRSxLQUFhLEVBQUUsSUFBNkI7WUFDbkgsS0FBSyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFUyxnQkFBZ0IsQ0FBQyxVQUF1QixFQUFFLElBQTZCLEVBQUUsVUFBd0I7WUFDMUcsTUFBTSxJQUFJLEdBQUcsT0FBTyxVQUFVLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7WUFDNUYsSUFBSSxLQUFhLENBQUM7WUFDbEIsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3JCLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDN0MsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqQixHQUFHLFVBQVUsQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzVDLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztZQUMxQixDQUFDO1lBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4QyxJQUFBLHFDQUFxQixFQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUM3QyxXQUFXLEVBQUUsSUFBSTtnQkFDakIsY0FBYyxFQUFFLGtDQUFrQztnQkFDbEQsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsUUFBUSxFQUFFLElBQUk7YUFDZCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVMsa0JBQWtCLENBQUMsVUFBdUIsRUFBRSxZQUFxQjtZQUMxRSxJQUFJLFlBQVksRUFBRSxDQUFDO2dCQUNsQixPQUFPO29CQUNOLFlBQVksRUFBRSxVQUFVLENBQUMsS0FBSztvQkFDOUIsU0FBUyxFQUFFLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSxnQkFBZ0IsQ0FBQztvQkFDckQsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFhLEVBQUUsT0FBZ0IsRUFBRSxFQUFFO3dCQUNuRCxJQUFJLE9BQU8sSUFBSSxLQUFLLEVBQUUsQ0FBQzs0QkFDdEIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQzs0QkFDeEUsSUFBSSxZQUFZLElBQUksQ0FBQyxVQUFVLFlBQVkscUJBQVEsSUFBSSxVQUFVLFlBQVksdUJBQVUsQ0FBQyxFQUFFLENBQUM7Z0NBQzFGLE1BQU0sVUFBVSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0NBQ3BELElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7NEJBQ2hELENBQUM7d0JBQ0YsQ0FBQztvQkFDRixDQUFDO2lCQUNELENBQUM7WUFDSCxDQUFDO1lBRUQsT0FBTztnQkFDTixZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDcEQsU0FBUyxFQUFFLElBQUEsY0FBUSxFQUFDLCtCQUErQixFQUFFLHVCQUF1QixDQUFDO2dCQUM3RSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsNEJBQTRCLEVBQUUscUJBQXFCLENBQUM7Z0JBQzFFLFFBQVEsRUFBRSxDQUFDLEtBQWEsRUFBRSxPQUFnQixFQUFFLEVBQUU7b0JBQzdDLElBQUksT0FBTyxJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUN0QixJQUFJLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDbkUsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO3dCQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUMvQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7b0JBQzNCLENBQUM7eUJBQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDN0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztvQkFDOUQsQ0FBQztnQkFDRixDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7UUFFa0IsZUFBZSxDQUFDLFNBQW9CLEVBQUUsVUFBdUI7WUFDL0UsTUFBTSxpQkFBaUIsR0FBRyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDL0YsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsZ0JBQU0sQ0FBQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBRXRGLE1BQU0sT0FBTyxHQUFjLEVBQUUsQ0FBQztZQUM5QixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUM7WUFDM0IsSUFBQSwyREFBaUMsRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUUxSCxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbEIsU0FBUyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDNUIsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7O0lBdEZJLHdCQUF3QjtRQUszQixXQUFBLHNCQUFZLENBQUE7UUFDWixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsaUNBQW1CLENBQUE7T0FSaEIsd0JBQXdCLENBdUY3QjtJQUVEOztPQUVHO0lBQ0gsU0FBUyxnQ0FBZ0MsQ0FBQyxhQUFpQyxFQUFFLFVBQXVCO1FBQ25HLE9BQU8sYUFBYSxDQUFDLGFBQWEsQ0FBQztZQUNsQyxDQUFDLCtCQUF1QixDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQztZQUN2RSxDQUFDLCtCQUF1QixDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUM7U0FDM0MsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0scUNBQXFDO1FBRTFDLGtCQUFrQjtZQUNqQixPQUFPLElBQUEsY0FBUSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsOENBQThDLENBQUMsRUFBRSxHQUFHLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3RJLENBQUM7UUFFRCxZQUFZLENBQUMsT0FBb0I7WUFDaEMsSUFBSSxPQUFPLFlBQVksdUJBQVUsRUFBRSxDQUFDO2dCQUNuQyxPQUFPLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLGdCQUFnQixFQUFlLE9BQVEsQ0FBQyxJQUFJLEVBQWUsT0FBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hILENBQUM7WUFFRCxXQUFXO1lBQ1gsT0FBTyxJQUFBLGNBQVEsRUFBQyx3QkFBd0IsRUFBRSxnQkFBZ0IsRUFBYSxPQUFRLENBQUMsSUFBSSxFQUFhLE9BQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsSCxDQUFDO0tBQ0Q7SUFFRCxNQUFNLDJCQUEyQjtRQUVoQyxZQUFvQixZQUEyQjtZQUEzQixpQkFBWSxHQUFaLFlBQVksQ0FBZTtRQUFJLENBQUM7UUFFcEQsVUFBVSxDQUFDLElBQXNCLEVBQUUsYUFBc0MsRUFBRSxXQUErQixFQUFFLFlBQThDLEVBQUUsYUFBd0I7WUFDbkwsSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLGtDQUF1QixDQUFDLEVBQUUsQ0FBQztnQkFDaEQsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBRUQsTUFBTSxXQUFXLEdBQUksSUFBNkMsQ0FBQyxRQUFRLENBQUM7WUFDNUUsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxZQUFZLHVCQUFVLENBQUMsRUFBRSxDQUFDO2dCQUN2RSxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFFRCxJQUFJLGtCQUFrQixHQUEyQyxTQUFTLENBQUM7WUFDM0UsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQy9CLHlCQUF5QjtnQkFDekIsa0JBQWtCLDZEQUFtQyxDQUFDO2dCQUN0RCxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLDJCQUEyQjtnQkFDM0IsUUFBUSxZQUFZLEVBQUUsQ0FBQztvQkFDdEIsc0NBQThCO29CQUM5Qjt3QkFDQyxrQkFBa0IsK0RBQW9DLENBQUM7d0JBQUMsTUFBTTtvQkFDL0QsZ0RBQXdDO29CQUN4Qzt3QkFDQyxrQkFBa0IsNkRBQW1DLENBQUM7d0JBQUMsTUFBTTtnQkFDL0QsQ0FBQztZQUNGLENBQUM7WUFFRCxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLHFDQUE2QixFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUEyQixDQUFDO1FBQ3hKLENBQUM7UUFFRCxVQUFVLENBQUMsT0FBb0I7WUFDOUIsSUFBSSxDQUFDLENBQUMsT0FBTyxZQUFZLHVCQUFVLENBQUMsSUFBSSxPQUFPLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDO2dCQUMxSCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFFRCxPQUFPLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRUQsWUFBWSxDQUFDLFFBQXVCO1lBQ25DLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3pCLENBQUM7WUFFRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsSUFBSSxDQUFDLElBQXNCLEVBQUUsYUFBMEIsRUFBRSxXQUErQixFQUFFLFlBQThDLEVBQUUsYUFBd0I7WUFDakssSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLGtDQUF1QixDQUFDLEVBQUUsQ0FBQztnQkFDaEQsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLGNBQWMsR0FBSSxJQUE2QyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsQ0FBQyxjQUFjLFlBQVksdUJBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBQzdDLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ25FLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFdkQsSUFBSSxjQUFjLENBQUM7WUFDbkIsSUFBSSxhQUFhLFlBQVksdUJBQVUsRUFBRSxDQUFDO2dCQUN6QyxjQUFjLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFFaEQsUUFBUSxZQUFZLEVBQUUsQ0FBQztvQkFDdEIseUNBQWlDO29CQUNqQzt3QkFDQyxjQUFjLEVBQUUsQ0FBQzt3QkFBQyxNQUFNO2dCQUMxQixDQUFDO2dCQUVELElBQUksY0FBYyxHQUFHLGNBQWMsRUFBRSxDQUFDO29CQUNyQyxjQUFjLEVBQUUsQ0FBQztnQkFDbEIsQ0FBQztZQUNGLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxjQUFjLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDckMsQ0FBQztZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFRCxPQUFPLEtBQVcsQ0FBQztLQUNuQjtJQUVELElBQUEseUJBQWUsRUFBQyxNQUFNLFFBQVMsU0FBUSxxQkFBZ0M7UUFDdEU7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGdCQUFnQjtnQkFDcEIsTUFBTSxFQUFFLHFCQUFhO2dCQUNyQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQztnQkFDM0MsRUFBRSxFQUFFLEtBQUs7Z0JBQ1QsSUFBSSxFQUFFLGtCQUFPLENBQUMsV0FBVztnQkFDekIsWUFBWSxFQUFFLHVDQUErQjtnQkFDN0MsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7b0JBQ3BCLEtBQUssRUFBRSxFQUFFO29CQUNULEtBQUssRUFBRSxZQUFZO29CQUNuQixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLHFCQUFhLENBQUM7aUJBQ2xEO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELFNBQVMsQ0FBQyxTQUEyQixFQUFFLElBQTBCO1lBQ2hFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRVUsUUFBQSxZQUFZLEdBQUcsbURBQW1ELENBQUMsQ0FBQyxrREFBa0Q7SUFDdEgsUUFBQSxlQUFlLEdBQUcsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUVoRixJQUFBLHlCQUFlLEVBQUMsTUFBTSx3QkFBeUIsU0FBUSxpQkFBTztRQUM3RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsb0JBQVk7Z0JBQ2hCLEtBQUssRUFBRSx1QkFBZTtnQkFDdEIsRUFBRSxFQUFFLEtBQUs7Z0JBQ1QsSUFBSSxFQUFFLGdDQUFtQjtnQkFDekIsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7b0JBQ3BCLEtBQUssRUFBRSxZQUFZO29CQUNuQixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLHFCQUFhLENBQUM7aUJBQ2xEO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUEwQjtZQUM3QixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFhLENBQUMsQ0FBQztZQUNqRCxZQUFZLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUNuQyxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRVUsUUFBQSxtQ0FBbUMsR0FBRywwREFBMEQsQ0FBQztJQUNqRyxRQUFBLDhCQUE4QixHQUFHLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDOUcsSUFBQSx5QkFBZSxFQUFDLE1BQU0sK0JBQWdDLFNBQVEsaUJBQU87UUFDcEU7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLDJDQUFtQyxFQUFFLGtEQUFrRDtnQkFDM0YsS0FBSyxFQUFFLHNDQUE4QjtnQkFDckMsRUFBRSxFQUFFLEtBQUs7Z0JBQ1QsSUFBSSxFQUFFLHNDQUF5QjtnQkFDL0IsWUFBWSxFQUFFLHVDQUErQjtnQkFDN0MsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7b0JBQ3BCLEtBQUssRUFBRSxFQUFFO29CQUNULEtBQUssRUFBRSxZQUFZO29CQUNuQixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLHFCQUFhLENBQUM7aUJBQ2xEO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUEwQjtZQUM3QixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFhLENBQUMsQ0FBQztZQUNqRCxZQUFZLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUN2QyxDQUFDO0tBQ0QsQ0FBQyxDQUFDIn0=