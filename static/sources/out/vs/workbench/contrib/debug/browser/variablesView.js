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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/browser/linkDetector", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugContext", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugVisualizers", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions"], function (require, exports, dom, highlightedLabel_1, actions_1, arrays_1, async_1, cancellation_1, codicons_1, filters_1, lifecycle_1, themables_1, nls_1, menuEntryActionViewItem_1, actions_2, clipboardService_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, listService_1, notification_1, opener_1, progress_1, telemetry_1, themeService_1, viewPane_1, views_1, baseDebugView_1, linkDetector_1, debug_1, debugContext_1, debugModel_1, debugVisualizers_1, editorService_1, extensions_1) {
    "use strict";
    var VariablesRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ADD_TO_WATCH_ID = exports.COPY_EVALUATE_PATH_ID = exports.BREAK_WHEN_VALUE_IS_READ_ID = exports.BREAK_WHEN_VALUE_IS_ACCESSED_ID = exports.BREAK_WHEN_VALUE_CHANGES_ID = exports.VIEW_MEMORY_ID = exports.COPY_VALUE_ID = exports.SET_VARIABLE_ID = exports.VariablesRenderer = exports.openContextMenuForVariableTreeElement = exports.VariablesView = void 0;
    const $ = dom.$;
    let forgetScopes = true;
    let variableInternalContext;
    let dataBreakpointInfoResponse;
    let VariablesView = class VariablesView extends viewPane_1.ViewPane {
        constructor(options, contextMenuService, debugService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, telemetryService, menuService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.debugService = debugService;
            this.menuService = menuService;
            this.needsRefresh = false;
            this.savedViewState = new Map();
            this.autoExpandedScopes = new Set();
            // Use scheduler to prevent unnecessary flashing
            this.updateTreeScheduler = new async_1.RunOnceScheduler(async () => {
                const stackFrame = this.debugService.getViewModel().focusedStackFrame;
                this.needsRefresh = false;
                const input = this.tree.getInput();
                if (input) {
                    this.savedViewState.set(input.getId(), this.tree.getViewState());
                }
                if (!stackFrame) {
                    await this.tree.setInput(null);
                    return;
                }
                const viewState = this.savedViewState.get(stackFrame.getId());
                await this.tree.setInput(stackFrame, viewState);
                // Automatically expand the first non-expensive scope
                const scopes = await stackFrame.getScopes();
                const toExpand = scopes.find(s => !s.expensive);
                // A race condition could be present causing the scopes here to be different from the scopes that the tree just retrieved.
                // If that happened, don't try to reveal anything, it will be straightened out on the next update
                if (toExpand && this.tree.hasNode(toExpand)) {
                    this.autoExpandedScopes.add(toExpand.getId());
                    await this.tree.expand(toExpand);
                }
            }, 400);
        }
        renderBody(container) {
            super.renderBody(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-variables');
            const treeContainer = (0, baseDebugView_1.renderViewTree)(container);
            const linkeDetector = this.instantiationService.createInstance(linkDetector_1.LinkDetector);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchAsyncDataTree, 'VariablesView', treeContainer, new VariablesDelegate(), [this.instantiationService.createInstance(VariablesRenderer, linkeDetector), new ScopesRenderer(), new ScopeErrorRenderer()], new VariablesDataSource(), {
                accessibilityProvider: new VariablesAccessibilityProvider(),
                identityProvider: { getId: (element) => element.getId() },
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.name },
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            this.tree.setInput(this.debugService.getViewModel().focusedStackFrame ?? null);
            debug_1.CONTEXT_VARIABLES_FOCUSED.bindTo(this.tree.contextKeyService);
            this._register(this.debugService.getViewModel().onDidFocusStackFrame(sf => {
                if (!this.isBodyVisible()) {
                    this.needsRefresh = true;
                    return;
                }
                // Refresh the tree immediately if the user explictly changed stack frames.
                // Otherwise postpone the refresh until user stops stepping.
                const timeout = sf.explicit ? 0 : undefined;
                this.updateTreeScheduler.schedule(timeout);
            }));
            this._register(this.debugService.getViewModel().onWillUpdateViews(() => {
                const stackFrame = this.debugService.getViewModel().focusedStackFrame;
                if (stackFrame && forgetScopes) {
                    stackFrame.forgetScopes();
                }
                forgetScopes = true;
                this.tree.updateChildren();
            }));
            this._register(this.tree);
            this._register(this.tree.onMouseDblClick(e => this.onMouseDblClick(e)));
            this._register(this.tree.onContextMenu(async (e) => await this.onContextMenu(e)));
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.needsRefresh) {
                    this.updateTreeScheduler.schedule();
                }
            }));
            let horizontalScrolling;
            this._register(this.debugService.getViewModel().onDidSelectExpression(e => {
                const variable = e?.expression;
                if (variable instanceof debugModel_1.Variable && !e?.settingWatch) {
                    horizontalScrolling = this.tree.options.horizontalScrolling;
                    if (horizontalScrolling) {
                        this.tree.updateOptions({ horizontalScrolling: false });
                    }
                    this.tree.rerender(variable);
                }
                else if (!e && horizontalScrolling !== undefined) {
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
            this._register(this.debugService.onDidEndSession(() => {
                this.savedViewState.clear();
                this.autoExpandedScopes.clear();
            }));
        }
        layoutBody(width, height) {
            super.layoutBody(height, width);
            this.tree.layout(width, height);
        }
        focus() {
            super.focus();
            this.tree.domFocus();
        }
        collapseAll() {
            this.tree.collapseAll();
        }
        onMouseDblClick(e) {
            const session = this.debugService.getViewModel().focusedSession;
            if (session && e.element instanceof debugModel_1.Variable && session.capabilities.supportsSetVariable && !e.element.presentationHint?.attributes?.includes('readOnly') && !e.element.presentationHint?.lazy) {
                this.debugService.getViewModel().setSelectedExpression(e.element, false);
            }
        }
        async onContextMenu(e) {
            const variable = e.element;
            if (!(variable instanceof debugModel_1.Variable) || !variable.value) {
                return;
            }
            return openContextMenuForVariableTreeElement(this.contextKeyService, this.menuService, this.contextMenuService, actions_2.MenuId.DebugVariablesContext, e);
        }
    };
    exports.VariablesView = VariablesView;
    exports.VariablesView = VariablesView = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, debug_1.IDebugService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, views_1.IViewDescriptorService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, opener_1.IOpenerService),
        __param(9, themeService_1.IThemeService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, actions_2.IMenuService)
    ], VariablesView);
    async function openContextMenuForVariableTreeElement(parentContextKeyService, menuService, contextMenuService, menuId, e) {
        const variable = e.element;
        if (!(variable instanceof debugModel_1.Variable) || !variable.value) {
            return;
        }
        const toDispose = new lifecycle_1.DisposableStore();
        try {
            const contextKeyService = await getContextForVariableMenuWithDataAccess(parentContextKeyService, variable);
            const menu = toDispose.add(menuService.createMenu(menuId, contextKeyService));
            const context = getVariablesContext(variable);
            const secondary = [];
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { arg: context, shouldForwardArgs: false }, { primary: [], secondary }, 'inline');
            contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => secondary
            });
        }
        finally {
            toDispose.dispose();
        }
    }
    exports.openContextMenuForVariableTreeElement = openContextMenuForVariableTreeElement;
    const getVariablesContext = (variable) => ({
        sessionId: variable.getSession()?.getId(),
        container: variable.parent instanceof debugModel_1.Expression
            ? { expression: variable.parent.name }
            : variable.parent.toDebugProtocolObject(),
        variable: variable.toDebugProtocolObject()
    });
    /**
     * Gets a context key overlay that has context for the given variable, including data access info.
     */
    async function getContextForVariableMenuWithDataAccess(parentContext, variable) {
        const session = variable.getSession();
        if (!session || !session.capabilities.supportsDataBreakpoints) {
            return getContextForVariableMenuBase(parentContext, variable);
        }
        const contextKeys = [];
        dataBreakpointInfoResponse = await session.dataBreakpointInfo(variable.name, variable.parent.reference);
        const dataBreakpointId = dataBreakpointInfoResponse?.dataId;
        const dataBreakpointAccessTypes = dataBreakpointInfoResponse?.accessTypes;
        if (!dataBreakpointAccessTypes) {
            contextKeys.push([debug_1.CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED.key, !!dataBreakpointId]);
        }
        else {
            for (const accessType of dataBreakpointAccessTypes) {
                switch (accessType) {
                    case 'read':
                        contextKeys.push([debug_1.CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED.key, !!dataBreakpointId]);
                        break;
                    case 'write':
                        contextKeys.push([debug_1.CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED.key, !!dataBreakpointId]);
                        break;
                    case 'readWrite':
                        contextKeys.push([debug_1.CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED.key, !!dataBreakpointId]);
                        break;
                }
            }
        }
        return getContextForVariableMenuBase(parentContext, variable, contextKeys);
    }
    /**
     * Gets a context key overlay that has context for the given variable.
     */
    function getContextForVariableMenuBase(parentContext, variable, additionalContext = []) {
        variableInternalContext = variable;
        return (0, debugContext_1.getContextForVariable)(parentContext, variable, additionalContext);
    }
    function isStackFrame(obj) {
        return obj instanceof debugModel_1.StackFrame;
    }
    class VariablesDataSource {
        hasChildren(element) {
            if (!element) {
                return false;
            }
            if (isStackFrame(element)) {
                return true;
            }
            return element.hasChildren;
        }
        getChildren(element) {
            if (isStackFrame(element)) {
                return element.getScopes();
            }
            return element.getChildren();
        }
    }
    class VariablesDelegate {
        getHeight(element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof debugModel_1.ErrorScope) {
                return ScopeErrorRenderer.ID;
            }
            if (element instanceof debugModel_1.Scope) {
                return ScopesRenderer.ID;
            }
            return VariablesRenderer.ID;
        }
    }
    class ScopesRenderer {
        static { this.ID = 'scope'; }
        get templateId() {
            return ScopesRenderer.ID;
        }
        renderTemplate(container) {
            const name = dom.append(container, $('.scope'));
            const label = new highlightedLabel_1.HighlightedLabel(name);
            return { name, label };
        }
        renderElement(element, index, templateData) {
            templateData.label.set(element.element.name, (0, filters_1.createMatches)(element.filterData));
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    class ScopeErrorRenderer {
        static { this.ID = 'scopeError'; }
        get templateId() {
            return ScopeErrorRenderer.ID;
        }
        renderTemplate(container) {
            const wrapper = dom.append(container, $('.scope'));
            const error = dom.append(wrapper, $('.error'));
            return { error };
        }
        renderElement(element, index, templateData) {
            templateData.error.innerText = element.element.name;
        }
        disposeTemplate() {
            // noop
        }
    }
    let VariablesRenderer = class VariablesRenderer extends baseDebugView_1.AbstractExpressionsRenderer {
        static { VariablesRenderer_1 = this; }
        static { this.ID = 'variable'; }
        constructor(linkDetector, menuService, contextKeyService, visualization, contextMenuService, debugService, contextViewService) {
            super(debugService, contextViewService);
            this.linkDetector = linkDetector;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this.visualization = visualization;
            this.contextMenuService = contextMenuService;
        }
        get templateId() {
            return VariablesRenderer_1.ID;
        }
        renderExpression(expression, data, highlights) {
            (0, baseDebugView_1.renderVariable)(expression, data, true, highlights, this.linkDetector);
        }
        renderElement(node, index, data) {
            super.renderExpressionElement(node.element, node, data);
        }
        getInputBoxOptions(expression) {
            const variable = expression;
            return {
                initialValue: expression.value,
                ariaLabel: (0, nls_1.localize)('variableValueAriaLabel', "Type new variable value"),
                validationOptions: {
                    validation: () => variable.errorMessage ? ({ content: variable.errorMessage }) : null
                },
                onFinish: (value, success) => {
                    variable.errorMessage = undefined;
                    const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
                    if (success && variable.value !== value && focusedStackFrame) {
                        variable.setVariable(value, focusedStackFrame)
                            // Need to force watch expressions and variables to update since a variable change can have an effect on both
                            .then(() => {
                            // Do not refresh scopes due to a node limitation #15520
                            forgetScopes = false;
                            this.debugService.getViewModel().updateViews();
                        });
                    }
                }
            };
        }
        renderActionBar(actionBar, expression, data) {
            const variable = expression;
            const contextKeyService = getContextForVariableMenuBase(this.contextKeyService, variable);
            const menu = this.menuService.createMenu(actions_2.MenuId.DebugVariablesContext, contextKeyService);
            const primary = [];
            const context = getVariablesContext(variable);
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { arg: context, shouldForwardArgs: false }, { primary, secondary: [] }, 'inline');
            actionBar.clear();
            actionBar.context = context;
            actionBar.push(primary, { icon: true, label: false });
            const cts = new cancellation_1.CancellationTokenSource();
            data.elementDisposable.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
            this.visualization.getApplicableFor(expression, cts.token).then(result => {
                data.elementDisposable.add(result);
                const actions = result.object.map(v => new actions_1.Action('debugViz', v.name, v.iconClass || 'debug-viz-icon', undefined, this.useVisualizer(v, cts.token)));
                if (actions.length === 0) {
                    // no-op
                }
                else if (actions.length === 1) {
                    actionBar.push(actions[0], { icon: true, label: false });
                }
                else {
                    actionBar.push(new actions_1.Action('debugViz', (0, nls_1.localize)('useVisualizer', 'Visualize Variable...'), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.eye), undefined, () => this.pickVisualizer(actions, expression, data)), { icon: true, label: false });
                }
            });
        }
        pickVisualizer(actions, expression, data) {
            this.contextMenuService.showContextMenu({
                getAnchor: () => data.actionBar.getContainer(),
                getActions: () => actions,
            });
        }
        useVisualizer(viz, token) {
            return async () => {
                const resolved = await viz.resolve(token);
                if (token.isCancellationRequested) {
                    return;
                }
                if (resolved.type === 0 /* DebugVisualizationType.Command */) {
                    viz.execute();
                }
                else {
                    throw new Error('not implemented, yet');
                }
            };
        }
    };
    exports.VariablesRenderer = VariablesRenderer;
    exports.VariablesRenderer = VariablesRenderer = VariablesRenderer_1 = __decorate([
        __param(1, actions_2.IMenuService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, debugVisualizers_1.IDebugVisualizerService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, debug_1.IDebugService),
        __param(6, contextView_1.IContextViewService)
    ], VariablesRenderer);
    class VariablesAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('variablesAriaTreeLabel', "Debug Variables");
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.Scope) {
                return (0, nls_1.localize)('variableScopeAriaLabel', "Scope {0}", element.name);
            }
            if (element instanceof debugModel_1.Variable) {
                return (0, nls_1.localize)({ key: 'variableAriaLabel', comment: ['Placeholders are variable name and variable value respectivly. They should not be translated.'] }, "{0}, value {1}", element.name, element.value);
            }
            return null;
        }
    }
    exports.SET_VARIABLE_ID = 'debug.setVariable';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SET_VARIABLE_ID,
        handler: (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.getViewModel().setSelectedExpression(variableInternalContext, false);
        }
    });
    exports.COPY_VALUE_ID = 'workbench.debug.viewlet.action.copyValue';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.COPY_VALUE_ID,
        handler: async (accessor, arg, ctx) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            let elementContext = '';
            let elements;
            if (arg instanceof debugModel_1.Variable || arg instanceof debugModel_1.Expression) {
                elementContext = 'watch';
                elements = ctx ? ctx : [];
            }
            else {
                elementContext = 'variables';
                elements = variableInternalContext ? [variableInternalContext] : [];
            }
            const stackFrame = debugService.getViewModel().focusedStackFrame;
            const session = debugService.getViewModel().focusedSession;
            if (!stackFrame || !session || elements.length === 0) {
                return;
            }
            const evalContext = session.capabilities.supportsClipboardContext ? 'clipboard' : elementContext;
            const toEvaluate = elements.map(element => element instanceof debugModel_1.Variable ? (element.evaluateName || element.value) : element.name);
            try {
                const evaluations = await Promise.all(toEvaluate.map(expr => session.evaluate(expr, stackFrame.frameId, evalContext)));
                const result = (0, arrays_1.coalesce)(evaluations).map(evaluation => evaluation.body.result);
                if (result.length) {
                    clipboardService.writeText(result.join('\n'));
                }
            }
            catch (e) {
                const result = elements.map(element => element.value);
                clipboardService.writeText(result.join('\n'));
            }
        }
    });
    exports.VIEW_MEMORY_ID = 'workbench.debug.viewlet.action.viewMemory';
    const HEX_EDITOR_EXTENSION_ID = 'ms-vscode.hexeditor';
    const HEX_EDITOR_EDITOR_ID = 'hexEditor.hexedit';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.VIEW_MEMORY_ID,
        handler: async (accessor, arg, ctx) => {
            const debugService = accessor.get(debug_1.IDebugService);
            let sessionId;
            let memoryReference;
            if ('sessionId' in arg) { // IVariablesContext
                if (!arg.sessionId || !arg.variable.memoryReference) {
                    return;
                }
                sessionId = arg.sessionId;
                memoryReference = arg.variable.memoryReference;
            }
            else { // IExpression
                if (!arg.memoryReference) {
                    return;
                }
                const focused = debugService.getViewModel().focusedSession;
                if (!focused) {
                    return;
                }
                sessionId = focused.getId();
                memoryReference = arg.memoryReference;
            }
            const commandService = accessor.get(commands_1.ICommandService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const notifications = accessor.get(notification_1.INotificationService);
            const progressService = accessor.get(progress_1.IProgressService);
            const extensionService = accessor.get(extensions_1.IExtensionService);
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            const ext = await extensionService.getExtension(HEX_EDITOR_EXTENSION_ID);
            if (ext || await tryInstallHexEditor(notifications, progressService, extensionService, commandService)) {
                /* __GDPR__
                    "debug/didViewMemory" : {
                        "owner": "connor4312",
                        "debugType" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                telemetryService.publicLog('debug/didViewMemory', {
                    debugType: debugService.getModel().getSession(sessionId)?.configuration.type,
                });
                await editorService.openEditor({
                    resource: (0, debugModel_1.getUriForDebugMemory)(sessionId, memoryReference),
                    options: {
                        revealIfOpened: true,
                        override: HEX_EDITOR_EDITOR_ID,
                    },
                }, editorService_1.SIDE_GROUP);
            }
        }
    });
    function tryInstallHexEditor(notifications, progressService, extensionService, commandService) {
        return new Promise(resolve => {
            let installing = false;
            const handle = notifications.prompt(notification_1.Severity.Info, (0, nls_1.localize)("viewMemory.prompt", "Inspecting binary data requires the Hex Editor extension. Would you like to install it now?"), [
                {
                    label: (0, nls_1.localize)("cancel", "Cancel"),
                    run: () => resolve(false),
                },
                {
                    label: (0, nls_1.localize)("install", "Install"),
                    run: async () => {
                        installing = true;
                        try {
                            await progressService.withProgress({
                                location: 15 /* ProgressLocation.Notification */,
                                title: (0, nls_1.localize)("viewMemory.install.progress", "Installing the Hex Editor..."),
                            }, async () => {
                                await commandService.executeCommand('workbench.extensions.installExtension', HEX_EDITOR_EXTENSION_ID);
                                // it seems like the extension is not registered immediately on install --
                                // wait for it to appear before returning.
                                while (!(await extensionService.getExtension(HEX_EDITOR_EXTENSION_ID))) {
                                    await (0, async_1.timeout)(30);
                                }
                            });
                            resolve(true);
                        }
                        catch (e) {
                            notifications.error(e);
                            resolve(false);
                        }
                    }
                },
            ], { sticky: true });
            handle.onDidClose(e => {
                if (!installing) {
                    resolve(false);
                }
            });
        });
    }
    exports.BREAK_WHEN_VALUE_CHANGES_ID = 'debug.breakWhenValueChanges';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.BREAK_WHEN_VALUE_CHANGES_ID,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (dataBreakpointInfoResponse) {
                await debugService.addDataBreakpoint(dataBreakpointInfoResponse.description, dataBreakpointInfoResponse.dataId, !!dataBreakpointInfoResponse.canPersist, dataBreakpointInfoResponse.accessTypes, 'write');
            }
        }
    });
    exports.BREAK_WHEN_VALUE_IS_ACCESSED_ID = 'debug.breakWhenValueIsAccessed';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.BREAK_WHEN_VALUE_IS_ACCESSED_ID,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (dataBreakpointInfoResponse) {
                await debugService.addDataBreakpoint(dataBreakpointInfoResponse.description, dataBreakpointInfoResponse.dataId, !!dataBreakpointInfoResponse.canPersist, dataBreakpointInfoResponse.accessTypes, 'readWrite');
            }
        }
    });
    exports.BREAK_WHEN_VALUE_IS_READ_ID = 'debug.breakWhenValueIsRead';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.BREAK_WHEN_VALUE_IS_READ_ID,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (dataBreakpointInfoResponse) {
                await debugService.addDataBreakpoint(dataBreakpointInfoResponse.description, dataBreakpointInfoResponse.dataId, !!dataBreakpointInfoResponse.canPersist, dataBreakpointInfoResponse.accessTypes, 'read');
            }
        }
    });
    exports.COPY_EVALUATE_PATH_ID = 'debug.copyEvaluatePath';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.COPY_EVALUATE_PATH_ID,
        handler: async (accessor, context) => {
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            await clipboardService.writeText(context.variable.evaluateName);
        }
    });
    exports.ADD_TO_WATCH_ID = 'debug.addToWatchExpressions';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.ADD_TO_WATCH_ID,
        handler: async (accessor, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.addWatchExpression(context.variable.evaluateName);
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'variables.collapse',
                viewId: debug_1.VARIABLES_VIEW_ID,
                title: (0, nls_1.localize)('collapse', "Collapse All"),
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', debug_1.VARIABLES_VIEW_ID)
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFibGVzVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci92YXJpYWJsZXNWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE2Q2hHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEIsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBRXhCLElBQUksdUJBQTZDLENBQUM7SUFDbEQsSUFBSSwwQkFBbUUsQ0FBQztJQVFqRSxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEsbUJBQVE7UUFRMUMsWUFDQyxPQUE0QixFQUNQLGtCQUF1QyxFQUM3QyxZQUE0QyxFQUN2QyxpQkFBcUMsRUFDbEMsb0JBQTJDLEVBQzNDLG9CQUEyQyxFQUMxQyxxQkFBNkMsRUFDakQsaUJBQXFDLEVBQ3pDLGFBQTZCLEVBQzlCLFlBQTJCLEVBQ3ZCLGdCQUFtQyxFQUN4QyxXQUEwQztZQUV4RCxLQUFLLENBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQVgzSixpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQVM1QixnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQWpCakQsaUJBQVksR0FBRyxLQUFLLENBQUM7WUFFckIsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBbUMsQ0FBQztZQUM1RCx1QkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBa0I5QyxnREFBZ0Q7WUFDaEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksd0JBQWdCLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JB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