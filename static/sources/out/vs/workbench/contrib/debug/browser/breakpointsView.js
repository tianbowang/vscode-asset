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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/themables", "vs/editor/browser/editorBrowser", "vs/editor/common/languages/language", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/hover/browser/hover", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, dom, touch_1, actionbar_1, iconLabel_1, inputBox_1, actions_1, arrays_1, async_1, codicons_1, htmlContent_1, lifecycle_1, resources, themables_1, editorBrowser_1, language_1, nls_1, menuEntryActionViewItem_1, actions_2, configuration_1, contextkey_1, contextView_1, hover_1, instantiation_1, keybinding_1, label_1, listService_1, opener_1, telemetry_1, defaultStyles_1, themeService_1, viewPane_1, views_1, icons, debug_1, debugModel_1, disassemblyViewInput_1, editorService_1) {
    "use strict";
    var BreakpointsRenderer_1, FunctionBreakpointsRenderer_1, DataBreakpointsRenderer_1, InstructionBreakpointsRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getBreakpointMessageAndIcon = exports.openBreakpointSource = exports.BreakpointsView = exports.getExpandedBodySize = void 0;
    const $ = dom.$;
    function createCheckbox(disposables) {
        const checkbox = $('input');
        checkbox.type = 'checkbox';
        checkbox.tabIndex = -1;
        disposables.push(touch_1.Gesture.ignoreTarget(checkbox));
        return checkbox;
    }
    const MAX_VISIBLE_BREAKPOINTS = 9;
    function getExpandedBodySize(model, sessionId, countLimit) {
        const length = model.getBreakpoints().length + model.getExceptionBreakpointsForSession(sessionId).length + model.getFunctionBreakpoints().length + model.getDataBreakpoints().length + model.getInstructionBreakpoints().length;
        return Math.min(countLimit, length) * 22;
    }
    exports.getExpandedBodySize = getExpandedBodySize;
    let BreakpointsView = class BreakpointsView extends viewPane_1.ViewPane {
        constructor(options, contextMenuService, debugService, keybindingService, instantiationService, themeService, editorService, contextViewService, configurationService, viewDescriptorService, contextKeyService, openerService, telemetryService, labelService, menuService, hoverService, languageService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.debugService = debugService;
            this.editorService = editorService;
            this.contextViewService = contextViewService;
            this.labelService = labelService;
            this.hoverService = hoverService;
            this.languageService = languageService;
            this.needsRefresh = false;
            this.needsStateChange = false;
            this.ignoreLayout = false;
            this.autoFocusedIndex = -1;
            this.menu = menuService.createMenu(actions_2.MenuId.DebugBreakpointsContext, contextKeyService);
            this._register(this.menu);
            this.breakpointItemType = debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.bindTo(contextKeyService);
            this.breakpointSupportsCondition = debug_1.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION.bindTo(contextKeyService);
            this.breakpointInputFocused = debug_1.CONTEXT_BREAKPOINT_INPUT_FOCUSED.bindTo(contextKeyService);
            this._register(this.debugService.getModel().onDidChangeBreakpoints(() => this.onBreakpointsChange()));
            this._register(this.debugService.getViewModel().onDidFocusSession(() => this.onBreakpointsChange()));
            this._register(this.debugService.onDidChangeState(() => this.onStateChange()));
            this.hintDelayer = this._register(new async_1.RunOnceScheduler(() => this.updateBreakpointsHint(true), 4000));
        }
        renderBody(container) {
            super.renderBody(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-breakpoints');
            const delegate = new BreakpointsDelegate(this);
            this.list = this.instantiationService.createInstance(listService_1.WorkbenchList, 'Breakpoints', container, delegate, [
                this.instantiationService.createInstance(BreakpointsRenderer, this.menu, this.breakpointSupportsCondition, this.breakpointItemType),
                new ExceptionBreakpointsRenderer(this.menu, this.breakpointSupportsCondition, this.breakpointItemType, this.debugService),
                new ExceptionBreakpointInputRenderer(this, this.debugService, this.contextViewService),
                this.instantiationService.createInstance(FunctionBreakpointsRenderer, this.menu, this.breakpointSupportsCondition, this.breakpointItemType),
                new FunctionBreakpointInputRenderer(this, this.debugService, this.contextViewService, this.labelService),
                this.instantiationService.createInstance(DataBreakpointsRenderer, this.menu, this.breakpointSupportsCondition, this.breakpointItemType),
                new DataBreakpointInputRenderer(this, this.debugService, this.contextViewService, this.labelService),
                this.instantiationService.createInstance(InstructionBreakpointsRenderer),
            ], {
                identityProvider: { getId: (element) => element.getId() },
                multipleSelectionSupport: false,
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e },
                accessibilityProvider: new BreakpointsAccessibilityProvider(this.debugService, this.labelService),
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            debug_1.CONTEXT_BREAKPOINTS_FOCUSED.bindTo(this.list.contextKeyService);
            this._register(this.list.onContextMenu(this.onListContextMenu, this));
            this.list.onMouseMiddleClick(async ({ element }) => {
                if (element instanceof debugModel_1.Breakpoint) {
                    await this.debugService.removeBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.FunctionBreakpoint) {
                    await this.debugService.removeFunctionBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.DataBreakpoint) {
                    await this.debugService.removeDataBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.InstructionBreakpoint) {
                    await this.debugService.removeInstructionBreakpoints(element.instructionReference, element.offset);
                }
            });
            this._register(this.list.onDidOpen(async (e) => {
                if (!e.element) {
                    return;
                }
                if (dom.isMouseEvent(e.browserEvent) && e.browserEvent.button === 1) { // middle click
                    return;
                }
                if (e.element instanceof debugModel_1.Breakpoint) {
                    openBreakpointSource(e.element, e.sideBySide, e.editorOptions.preserveFocus || false, e.editorOptions.pinned || !e.editorOptions.preserveFocus, this.debugService, this.editorService);
                }
                if (e.element instanceof debugModel_1.InstructionBreakpoint) {
                    const disassemblyView = await this.editorService.openEditor(disassemblyViewInput_1.DisassemblyViewInput.instance);
                    // Focus on double click
                    disassemblyView.goToInstructionAndOffset(e.element.instructionReference, e.element.offset, dom.isMouseEvent(e.browserEvent) && e.browserEvent.detail === 2);
                }
                if (dom.isMouseEvent(e.browserEvent) && e.browserEvent.detail === 2 && e.element instanceof debugModel_1.FunctionBreakpoint && e.element !== this.inputBoxData?.breakpoint) {
                    // double click
                    this.renderInputBox({ breakpoint: e.element, type: 'name' });
                }
            }));
            this.list.splice(0, this.list.length, this.elements);
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible) {
                    if (this.needsRefresh) {
                        this.onBreakpointsChange();
                    }
                    if (this.needsStateChange) {
                        this.onStateChange();
                    }
                }
            }));
            const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
            this._register(containerModel.onDidChangeAllViewDescriptors(() => {
                this.updateSize();
            }));
        }
        renderHeaderTitle(container, title) {
            super.renderHeaderTitle(container, title);
            const iconLabelContainer = dom.append(container, $('span.breakpoint-warning'));
            this.hintContainer = this._register(new iconLabel_1.IconLabel(iconLabelContainer, {
                supportIcons: true, hoverDelegate: {
                    showHover: (options, focus) => this.hoverService.showHover({ content: options.content, target: this.hintContainer.element }, focus),
                    delay: this.configurationService.getValue('workbench.hover.delay')
                }
            }));
            dom.hide(this.hintContainer.element);
        }
        focus() {
            super.focus();
            this.list?.domFocus();
        }
        renderInputBox(data) {
            this._inputBoxData = data;
            this.onBreakpointsChange();
            this._inputBoxData = undefined;
        }
        get inputBoxData() {
            return this._inputBoxData;
        }
        layoutBody(height, width) {
            if (this.ignoreLayout) {
                return;
            }
            super.layoutBody(height, width);
            this.list?.layout(height, width);
            try {
                this.ignoreLayout = true;
                this.updateSize();
            }
            finally {
                this.ignoreLayout = false;
            }
        }
        onListContextMenu(e) {
            const element = e.element;
            const type = element instanceof debugModel_1.Breakpoint ? 'breakpoint' : element instanceof debugModel_1.ExceptionBreakpoint ? 'exceptionBreakpoint' :
                element instanceof debugModel_1.FunctionBreakpoint ? 'functionBreakpoint' : element instanceof debugModel_1.DataBreakpoint ? 'dataBreakpoint' :
                    element instanceof debugModel_1.InstructionBreakpoint ? 'instructionBreakpoint' : undefined;
            this.breakpointItemType.set(type);
            const session = this.debugService.getViewModel().focusedSession;
            const conditionSupported = element instanceof debugModel_1.ExceptionBreakpoint ? element.supportsCondition : (!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.breakpointSupportsCondition.set(conditionSupported);
            const secondary = [];
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(this.menu, { arg: e.element, shouldForwardArgs: false }, { primary: [], secondary }, 'inline');
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => secondary,
                getActionsContext: () => element
            });
        }
        updateSize() {
            const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
            // Adjust expanded body size
            const sessionId = this.debugService.getViewModel().focusedSession?.getId();
            this.minimumBodySize = this.orientation === 0 /* Orientation.VERTICAL */ ? getExpandedBodySize(this.debugService.getModel(), sessionId, MAX_VISIBLE_BREAKPOINTS) : 170;
            this.maximumBodySize = this.orientation === 0 /* Orientation.VERTICAL */ && containerModel.visibleViewDescriptors.length > 1 ? getExpandedBodySize(this.debugService.getModel(), sessionId, Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
        }
        updateBreakpointsHint(delayed = false) {
            if (!this.hintContainer) {
                return;
            }
            const currentType = this.debugService.getViewModel().focusedSession?.configuration.type;
            const dbg = currentType ? this.debugService.getAdapterManager().getDebugger(currentType) : undefined;
            const message = dbg?.strings?.[debug_1.DebuggerString.UnverifiedBreakpoints];
            const debuggerHasUnverifiedBps = message && this.debugService.getModel().getBreakpoints().filter(bp => {
                if (bp.verified || !bp.enabled) {
                    return false;
                }
                const langId = this.languageService.guessLanguageIdByFilepathOrFirstLine(bp.uri);
                return langId && dbg.interestedInLanguage(langId);
            });
            if (message && debuggerHasUnverifiedBps?.length && this.debugService.getModel().areBreakpointsActivated()) {
                if (delayed) {
                    const mdown = new htmlContent_1.MarkdownString(undefined, { isTrusted: true }).appendMarkdown(message);
                    this.hintContainer.setLabel('$(warning)', undefined, { title: { markdown: mdown, markdownNotSupportedFallback: message } });
                    dom.show(this.hintContainer.element);
                }
                else {
                    this.hintDelayer.schedule();
                }
            }
            else {
                dom.hide(this.hintContainer.element);
            }
        }
        onBreakpointsChange() {
            if (this.isBodyVisible()) {
                this.updateSize();
                if (this.list) {
                    const lastFocusIndex = this.list.getFocus()[0];
                    // Check whether focused element was removed
                    const needsRefocus = lastFocusIndex && !this.elements.includes(this.list.element(lastFocusIndex));
                    this.list.splice(0, this.list.length, this.elements);
                    this.needsRefresh = false;
                    if (needsRefocus) {
                        this.list.focusNth(Math.min(lastFocusIndex, this.list.length - 1));
                    }
                }
                this.updateBreakpointsHint();
            }
            else {
                this.needsRefresh = true;
            }
        }
        onStateChange() {
            if (this.isBodyVisible()) {
                this.needsStateChange = false;
                const thread = this.debugService.getViewModel().focusedThread;
                let found = false;
                if (thread && thread.stoppedDetails && thread.stoppedDetails.hitBreakpointIds && thread.stoppedDetails.hitBreakpointIds.length > 0) {
                    const hitBreakpointIds = thread.stoppedDetails.hitBreakpointIds;
                    const elements = this.elements;
                    const index = elements.findIndex(e => {
                        const id = e.getIdFromAdapter(thread.session.getId());
                        return typeof id === 'number' && hitBreakpointIds.indexOf(id) !== -1;
                    });
                    if (index >= 0) {
                        this.list.setFocus([index]);
                        this.list.setSelection([index]);
                        found = true;
                        this.autoFocusedIndex = index;
                    }
                }
                if (!found) {
                    // Deselect breakpoint in breakpoint view when no longer stopped on it #125528
                    const focus = this.list.getFocus();
                    const selection = this.list.getSelection();
                    if (this.autoFocusedIndex >= 0 && (0, arrays_1.equals)(focus, selection) && focus.indexOf(this.autoFocusedIndex) >= 0) {
                        this.list.setFocus([]);
                        this.list.setSelection([]);
                    }
                    this.autoFocusedIndex = -1;
                }
                this.updateBreakpointsHint();
            }
            else {
                this.needsStateChange = true;
            }
        }
        get elements() {
            const model = this.debugService.getModel();
            const sessionId = this.debugService.getViewModel().focusedSession?.getId();
            const elements = model.getExceptionBreakpointsForSession(sessionId).concat(model.getFunctionBreakpoints()).concat(model.getDataBreakpoints()).concat(model.getBreakpoints()).concat(model.getInstructionBreakpoints());
            return elements;
        }
    };
    exports.BreakpointsView = BreakpointsView;
    exports.BreakpointsView = BreakpointsView = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, debug_1.IDebugService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, themeService_1.IThemeService),
        __param(6, editorService_1.IEditorService),
        __param(7, contextView_1.IContextViewService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, views_1.IViewDescriptorService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, opener_1.IOpenerService),
        __param(12, telemetry_1.ITelemetryService),
        __param(13, label_1.ILabelService),
        __param(14, actions_2.IMenuService),
        __param(15, hover_1.IHoverService),
        __param(16, language_1.ILanguageService)
    ], BreakpointsView);
    class BreakpointsDelegate {
        constructor(view) {
            this.view = view;
            // noop
        }
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof debugModel_1.Breakpoint) {
                return BreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.FunctionBreakpoint) {
                const inputBoxBreakpoint = this.view.inputBoxData?.breakpoint;
                if (!element.name || (inputBoxBreakpoint && inputBoxBreakpoint.getId() === element.getId())) {
                    return FunctionBreakpointInputRenderer.ID;
                }
                return FunctionBreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.ExceptionBreakpoint) {
                const inputBoxBreakpoint = this.view.inputBoxData?.breakpoint;
                if (inputBoxBreakpoint && inputBoxBreakpoint.getId() === element.getId()) {
                    return ExceptionBreakpointInputRenderer.ID;
                }
                return ExceptionBreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.DataBreakpoint) {
                const inputBoxBreakpoint = this.view.inputBoxData?.breakpoint;
                if (inputBoxBreakpoint && inputBoxBreakpoint.getId() === element.getId()) {
                    return DataBreakpointInputRenderer.ID;
                }
                return DataBreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.InstructionBreakpoint) {
                return InstructionBreakpointsRenderer.ID;
            }
            return '';
        }
    }
    const breakpointIdToActionBarDomeNode = new Map();
    let BreakpointsRenderer = class BreakpointsRenderer {
        static { BreakpointsRenderer_1 = this; }
        constructor(menu, breakpointSupportsCondition, breakpointItemType, debugService, labelService) {
            this.menu = menu;
            this.breakpointSupportsCondition = breakpointSupportsCondition;
            this.breakpointItemType = breakpointItemType;
            this.debugService = debugService;
            this.labelService = labelService;
            // noop
        }
        static { this.ID = 'breakpoints'; }
        get templateId() {
            return BreakpointsRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = [];
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.filePath = dom.append(data.breakpoint, $('span.file-path'));
            data.actionBar = new actionbar_1.ActionBar(data.breakpoint);
            data.toDispose.push(data.actionBar);
            const lineNumberContainer = dom.append(data.breakpoint, $('.line-number-container'));
            data.lineNumber = dom.append(lineNumberContainer, $('span.line-number.monaco-count-badge'));
            return data;
        }
        renderElement(breakpoint, index, data) {
            data.context = breakpoint;
            data.breakpoint.classList.toggle('disabled', !this.debugService.getModel().areBreakpointsActivated());
            data.name.textContent = resources.basenameOrAuthority(breakpoint.uri);
            data.lineNumber.textContent = breakpoint.lineNumber.toString();
            if (breakpoint.column) {
                data.lineNumber.textContent += `:${breakpoint.column}`;
            }
            data.filePath.textContent = this.labelService.getUriLabel(resources.dirname(breakpoint.uri), { relative: true });
            data.checkbox.checked = breakpoint.enabled;
            const { message, icon } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), breakpoint, this.labelService, this.debugService.getModel());
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.breakpoint.title = breakpoint.message || message || '';
            const debugActive = this.debugService.state === 3 /* State.Running */ || this.debugService.state === 2 /* State.Stopped */;
            if (debugActive && !breakpoint.verified) {
                data.breakpoint.classList.add('disabled');
            }
            const primary = [];
            const session = this.debugService.getViewModel().focusedSession;
            this.breakpointSupportsCondition.set(!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.breakpointItemType.set('breakpoint');
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { arg: breakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline');
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(breakpoint.getId(), data.actionBar.domNode);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    BreakpointsRenderer = BreakpointsRenderer_1 = __decorate([
        __param(3, debug_1.IDebugService),
        __param(4, label_1.ILabelService)
    ], BreakpointsRenderer);
    class ExceptionBreakpointsRenderer {
        constructor(menu, breakpointSupportsCondition, breakpointItemType, debugService) {
            this.menu = menu;
            this.breakpointSupportsCondition = breakpointSupportsCondition;
            this.breakpointItemType = breakpointItemType;
            this.debugService = debugService;
            // noop
        }
        static { this.ID = 'exceptionbreakpoints'; }
        get templateId() {
            return ExceptionBreakpointsRenderer.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = [];
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.condition = dom.append(data.breakpoint, $('span.condition'));
            data.breakpoint.classList.add('exception');
            data.actionBar = new actionbar_1.ActionBar(data.breakpoint);
            data.toDispose.push(data.actionBar);
            return data;
        }
        renderElement(exceptionBreakpoint, index, data) {
            data.context = exceptionBreakpoint;
            data.name.textContent = exceptionBreakpoint.label || `${exceptionBreakpoint.filter} exceptions`;
            data.breakpoint.title = exceptionBreakpoint.verified ? (exceptionBreakpoint.description || data.name.textContent) : exceptionBreakpoint.message || (0, nls_1.localize)('unverifiedExceptionBreakpoint', "Unverified Exception Breakpoint");
            data.breakpoint.classList.toggle('disabled', !exceptionBreakpoint.verified);
            data.checkbox.checked = exceptionBreakpoint.enabled;
            data.condition.textContent = exceptionBreakpoint.condition || '';
            data.condition.title = (0, nls_1.localize)('expressionCondition', "Expression condition: {0}", exceptionBreakpoint.condition);
            const primary = [];
            this.breakpointSupportsCondition.set(exceptionBreakpoint.supportsCondition);
            this.breakpointItemType.set('exceptionBreakpoint');
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { arg: exceptionBreakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline');
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(exceptionBreakpoint.getId(), data.actionBar.domNode);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    }
    let FunctionBreakpointsRenderer = class FunctionBreakpointsRenderer {
        static { FunctionBreakpointsRenderer_1 = this; }
        constructor(menu, breakpointSupportsCondition, breakpointItemType, debugService, labelService) {
            this.menu = menu;
            this.breakpointSupportsCondition = breakpointSupportsCondition;
            this.breakpointItemType = breakpointItemType;
            this.debugService = debugService;
            this.labelService = labelService;
            // noop
        }
        static { this.ID = 'functionbreakpoints'; }
        get templateId() {
            return FunctionBreakpointsRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = [];
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.condition = dom.append(data.breakpoint, $('span.condition'));
            data.actionBar = new actionbar_1.ActionBar(data.breakpoint);
            data.toDispose.push(data.actionBar);
            return data;
        }
        renderElement(functionBreakpoint, _index, data) {
            data.context = functionBreakpoint;
            data.name.textContent = functionBreakpoint.name;
            const { icon, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), functionBreakpoint, this.labelService, this.debugService.getModel());
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = functionBreakpoint.enabled;
            data.breakpoint.title = message ? message : '';
            if (functionBreakpoint.condition && functionBreakpoint.hitCondition) {
                data.condition.textContent = (0, nls_1.localize)('expressionAndHitCount', "Condition: {0} | Hit Count: {1}", functionBreakpoint.condition, functionBreakpoint.hitCondition);
            }
            else {
                data.condition.textContent = functionBreakpoint.condition || functionBreakpoint.hitCondition || '';
            }
            // Mark function breakpoints as disabled if deactivated or if debug type does not support them #9099
            const session = this.debugService.getViewModel().focusedSession;
            data.breakpoint.classList.toggle('disabled', (session && !session.capabilities.supportsFunctionBreakpoints) || !this.debugService.getModel().areBreakpointsActivated());
            if (session && !session.capabilities.supportsFunctionBreakpoints) {
                data.breakpoint.title = (0, nls_1.localize)('functionBreakpointsNotSupported', "Function breakpoints are not supported by this debug type");
            }
            const primary = [];
            this.breakpointSupportsCondition.set(!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.breakpointItemType.set('functionBreakpoint');
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { arg: functionBreakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline');
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(functionBreakpoint.getId(), data.actionBar.domNode);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    FunctionBreakpointsRenderer = FunctionBreakpointsRenderer_1 = __decorate([
        __param(3, debug_1.IDebugService),
        __param(4, label_1.ILabelService)
    ], FunctionBreakpointsRenderer);
    let DataBreakpointsRenderer = class DataBreakpointsRenderer {
        static { DataBreakpointsRenderer_1 = this; }
        constructor(menu, breakpointSupportsCondition, breakpointItemType, debugService, labelService) {
            this.menu = menu;
            this.breakpointSupportsCondition = breakpointSupportsCondition;
            this.breakpointItemType = breakpointItemType;
            this.debugService = debugService;
            this.labelService = labelService;
            // noop
        }
        static { this.ID = 'databreakpoints'; }
        get templateId() {
            return DataBreakpointsRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.toDispose = [];
            data.icon = $('.icon');
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.accessType = dom.append(data.breakpoint, $('span.access-type'));
            data.condition = dom.append(data.breakpoint, $('span.condition'));
            data.actionBar = new actionbar_1.ActionBar(data.breakpoint);
            data.toDispose.push(data.actionBar);
            return data;
        }
        renderElement(dataBreakpoint, _index, data) {
            data.context = dataBreakpoint;
            data.name.textContent = dataBreakpoint.description;
            const { icon, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), dataBreakpoint, this.labelService, this.debugService.getModel());
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = dataBreakpoint.enabled;
            data.breakpoint.title = message ? message : '';
            // Mark data breakpoints as disabled if deactivated or if debug type does not support them
            const session = this.debugService.getViewModel().focusedSession;
            data.breakpoint.classList.toggle('disabled', (session && !session.capabilities.supportsDataBreakpoints) || !this.debugService.getModel().areBreakpointsActivated());
            if (session && !session.capabilities.supportsDataBreakpoints) {
                data.breakpoint.title = (0, nls_1.localize)('dataBreakpointsNotSupported', "Data breakpoints are not supported by this debug type");
            }
            if (dataBreakpoint.accessType) {
                const accessType = dataBreakpoint.accessType === 'read' ? (0, nls_1.localize)('read', "Read") : dataBreakpoint.accessType === 'write' ? (0, nls_1.localize)('write', "Write") : (0, nls_1.localize)('access', "Access");
                data.accessType.textContent = accessType;
            }
            else {
                data.accessType.textContent = '';
            }
            if (dataBreakpoint.condition && dataBreakpoint.hitCondition) {
                data.condition.textContent = (0, nls_1.localize)('expressionAndHitCount', "Condition: {0} | Hit Count: {1}", dataBreakpoint.condition, dataBreakpoint.hitCondition);
            }
            else {
                data.condition.textContent = dataBreakpoint.condition || dataBreakpoint.hitCondition || '';
            }
            const primary = [];
            this.breakpointSupportsCondition.set(!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.breakpointItemType.set('dataBreakpoint');
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { arg: dataBreakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline');
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(dataBreakpoint.getId(), data.actionBar.domNode);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    DataBreakpointsRenderer = DataBreakpointsRenderer_1 = __decorate([
        __param(3, debug_1.IDebugService),
        __param(4, label_1.ILabelService)
    ], DataBreakpointsRenderer);
    let InstructionBreakpointsRenderer = class InstructionBreakpointsRenderer {
        static { InstructionBreakpointsRenderer_1 = this; }
        constructor(debugService, labelService) {
            this.debugService = debugService;
            this.labelService = labelService;
            // noop
        }
        static { this.ID = 'instructionBreakpoints'; }
        get templateId() {
            return InstructionBreakpointsRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = [];
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = createCheckbox(data.toDispose);
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.address = dom.append(data.breakpoint, $('span.file-path'));
            data.actionBar = new actionbar_1.ActionBar(data.breakpoint);
            data.toDispose.push(data.actionBar);
            return data;
        }
        renderElement(breakpoint, index, data) {
            data.context = breakpoint;
            data.breakpoint.classList.toggle('disabled', !this.debugService.getModel().areBreakpointsActivated());
            data.name.textContent = '0x' + breakpoint.address.toString(16);
            data.name.title = `Decimal address: breakpoint.address.toString()`;
            data.checkbox.checked = breakpoint.enabled;
            const { message, icon } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), breakpoint, this.labelService, this.debugService.getModel());
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.breakpoint.title = breakpoint.message || message || '';
            const debugActive = this.debugService.state === 3 /* State.Running */ || this.debugService.state === 2 /* State.Stopped */;
            if (debugActive && !breakpoint.verified) {
                data.breakpoint.classList.add('disabled');
            }
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    InstructionBreakpointsRenderer = InstructionBreakpointsRenderer_1 = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, label_1.ILabelService)
    ], InstructionBreakpointsRenderer);
    class FunctionBreakpointInputRenderer {
        constructor(view, debugService, contextViewService, labelService) {
            this.view = view;
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            this.labelService = labelService;
        }
        static { this.ID = 'functionbreakpointinput'; }
        get templateId() {
            return FunctionBreakpointInputRenderer.ID;
        }
        renderTemplate(container) {
            const template = Object.create(null);
            const toDispose = [];
            const breakpoint = dom.append(container, $('.breakpoint'));
            template.icon = $('.icon');
            template.checkbox = createCheckbox(toDispose);
            dom.append(breakpoint, template.icon);
            dom.append(breakpoint, template.checkbox);
            this.view.breakpointInputFocused.set(true);
            const inputBoxContainer = dom.append(breakpoint, $('.inputBoxContainer'));
            const inputBox = new inputBox_1.InputBox(inputBoxContainer, this.contextViewService, { inputBoxStyles: defaultStyles_1.defaultInputBoxStyles });
            const wrapUp = (success) => {
                template.updating = true;
                try {
                    this.view.breakpointInputFocused.set(false);
                    const id = template.breakpoint.getId();
                    if (success) {
                        if (template.type === 'name') {
                            this.debugService.updateFunctionBreakpoint(id, { name: inputBox.value });
                        }
                        if (template.type === 'condition') {
                            this.debugService.updateFunctionBreakpoint(id, { condition: inputBox.value });
                        }
                        if (template.type === 'hitCount') {
                            this.debugService.updateFunctionBreakpoint(id, { hitCondition: inputBox.value });
                        }
                    }
                    else {
                        if (template.type === 'name' && !template.breakpoint.name) {
                            this.debugService.removeFunctionBreakpoints(id);
                        }
                        else {
                            this.view.renderInputBox(undefined);
                        }
                    }
                }
                finally {
                    template.updating = false;
                }
            };
            toDispose.push(dom.addStandardDisposableListener(inputBox.inputElement, 'keydown', (e) => {
                const isEscape = e.equals(9 /* KeyCode.Escape */);
                const isEnter = e.equals(3 /* KeyCode.Enter */);
                if (isEscape || isEnter) {
                    e.preventDefault();
                    e.stopPropagation();
                    wrapUp(isEnter);
                }
            }));
            toDispose.push(dom.addDisposableListener(inputBox.inputElement, 'blur', () => {
                if (!template.updating) {
                    wrapUp(!!inputBox.value);
                }
            }));
            template.inputBox = inputBox;
            template.toDispose = toDispose;
            return template;
        }
        renderElement(functionBreakpoint, _index, data) {
            data.breakpoint = functionBreakpoint;
            data.type = this.view.inputBoxData?.type || 'name'; // If there is no type set take the 'name' as the default
            const { icon, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), functionBreakpoint, this.labelService, this.debugService.getModel());
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = functionBreakpoint.enabled;
            data.checkbox.disabled = true;
            data.inputBox.value = functionBreakpoint.name || '';
            let placeholder = (0, nls_1.localize)('functionBreakpointPlaceholder', "Function to break on");
            let ariaLabel = (0, nls_1.localize)('functionBreakPointInputAriaLabel', "Type function breakpoint.");
            if (data.type === 'condition') {
                data.inputBox.value = functionBreakpoint.condition || '';
                placeholder = (0, nls_1.localize)('functionBreakpointExpressionPlaceholder', "Break when expression evaluates to true");
                ariaLabel = (0, nls_1.localize)('functionBreakPointExpresionAriaLabel', "Type expression. Function breakpoint will break when expression evaluates to true");
            }
            else if (data.type === 'hitCount') {
                data.inputBox.value = functionBreakpoint.hitCondition || '';
                placeholder = (0, nls_1.localize)('functionBreakpointHitCountPlaceholder', "Break when hit count is met");
                ariaLabel = (0, nls_1.localize)('functionBreakPointHitCountAriaLabel', "Type hit count. Function breakpoint will break when hit count is met.");
            }
            data.inputBox.setAriaLabel(ariaLabel);
            data.inputBox.setPlaceHolder(placeholder);
            setTimeout(() => {
                data.inputBox.focus();
                data.inputBox.select();
            }, 0);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    }
    class DataBreakpointInputRenderer {
        constructor(view, debugService, contextViewService, labelService) {
            this.view = view;
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            this.labelService = labelService;
        }
        static { this.ID = 'databreakpointinput'; }
        get templateId() {
            return DataBreakpointInputRenderer.ID;
        }
        renderTemplate(container) {
            const template = Object.create(null);
            const toDispose = [];
            const breakpoint = dom.append(container, $('.breakpoint'));
            template.icon = $('.icon');
            template.checkbox = createCheckbox(toDispose);
            dom.append(breakpoint, template.icon);
            dom.append(breakpoint, template.checkbox);
            this.view.breakpointInputFocused.set(true);
            const inputBoxContainer = dom.append(breakpoint, $('.inputBoxContainer'));
            const inputBox = new inputBox_1.InputBox(inputBoxContainer, this.contextViewService, { inputBoxStyles: defaultStyles_1.defaultInputBoxStyles });
            const wrapUp = (success) => {
                template.updating = true;
                try {
                    this.view.breakpointInputFocused.set(false);
                    const id = template.breakpoint.getId();
                    if (success) {
                        if (template.type === 'condition') {
                            this.debugService.updateDataBreakpoint(id, { condition: inputBox.value });
                        }
                        if (template.type === 'hitCount') {
                            this.debugService.updateDataBreakpoint(id, { hitCondition: inputBox.value });
                        }
                    }
                    else {
                        this.view.renderInputBox(undefined);
                    }
                }
                finally {
                    template.updating = false;
                }
            };
            toDispose.push(dom.addStandardDisposableListener(inputBox.inputElement, 'keydown', (e) => {
                const isEscape = e.equals(9 /* KeyCode.Escape */);
                const isEnter = e.equals(3 /* KeyCode.Enter */);
                if (isEscape || isEnter) {
                    e.preventDefault();
                    e.stopPropagation();
                    wrapUp(isEnter);
                }
            }));
            toDispose.push(dom.addDisposableListener(inputBox.inputElement, 'blur', () => {
                if (!template.updating) {
                    wrapUp(!!inputBox.value);
                }
            }));
            template.inputBox = inputBox;
            template.toDispose = toDispose;
            return template;
        }
        renderElement(dataBreakpoint, _index, data) {
            data.breakpoint = dataBreakpoint;
            data.type = this.view.inputBoxData?.type || 'condition'; // If there is no type set take the 'condition' as the default
            const { icon, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), dataBreakpoint, this.labelService, this.debugService.getModel());
            data.icon.className = themables_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = dataBreakpoint.enabled;
            data.checkbox.disabled = true;
            data.inputBox.value = '';
            let placeholder = '';
            let ariaLabel = '';
            if (data.type === 'condition') {
                data.inputBox.value = dataBreakpoint.condition || '';
                placeholder = (0, nls_1.localize)('dataBreakpointExpressionPlaceholder', "Break when expression evaluates to true");
                ariaLabel = (0, nls_1.localize)('dataBreakPointExpresionAriaLabel', "Type expression. Data breakpoint will break when expression evaluates to true");
            }
            else if (data.type === 'hitCount') {
                data.inputBox.value = dataBreakpoint.hitCondition || '';
                placeholder = (0, nls_1.localize)('dataBreakpointHitCountPlaceholder', "Break when hit count is met");
                ariaLabel = (0, nls_1.localize)('dataBreakPointHitCountAriaLabel', "Type hit count. Data breakpoint will break when hit count is met.");
            }
            data.inputBox.setAriaLabel(ariaLabel);
            data.inputBox.setPlaceHolder(placeholder);
            setTimeout(() => {
                data.inputBox.focus();
                data.inputBox.select();
            }, 0);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    }
    class ExceptionBreakpointInputRenderer {
        constructor(view, debugService, contextViewService) {
            this.view = view;
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            // noop
        }
        static { this.ID = 'exceptionbreakpointinput'; }
        get templateId() {
            return ExceptionBreakpointInputRenderer.ID;
        }
        renderTemplate(container) {
            const template = Object.create(null);
            const toDispose = [];
            const breakpoint = dom.append(container, $('.breakpoint'));
            breakpoint.classList.add('exception');
            template.checkbox = createCheckbox(toDispose);
            dom.append(breakpoint, template.checkbox);
            this.view.breakpointInputFocused.set(true);
            const inputBoxContainer = dom.append(breakpoint, $('.inputBoxContainer'));
            const inputBox = new inputBox_1.InputBox(inputBoxContainer, this.contextViewService, {
                ariaLabel: (0, nls_1.localize)('exceptionBreakpointAriaLabel', "Type exception breakpoint condition"),
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles
            });
            const wrapUp = (success) => {
                this.view.breakpointInputFocused.set(false);
                let newCondition = template.breakpoint.condition;
                if (success) {
                    newCondition = inputBox.value !== '' ? inputBox.value : undefined;
                }
                this.debugService.setExceptionBreakpointCondition(template.breakpoint, newCondition);
            };
            toDispose.push(dom.addStandardDisposableListener(inputBox.inputElement, 'keydown', (e) => {
                const isEscape = e.equals(9 /* KeyCode.Escape */);
                const isEnter = e.equals(3 /* KeyCode.Enter */);
                if (isEscape || isEnter) {
                    e.preventDefault();
                    e.stopPropagation();
                    wrapUp(isEnter);
                }
            }));
            toDispose.push(dom.addDisposableListener(inputBox.inputElement, 'blur', () => {
                // Need to react with a timeout on the blur event due to possible concurent splices #56443
                setTimeout(() => {
                    wrapUp(true);
                });
            }));
            template.inputBox = inputBox;
            template.toDispose = toDispose;
            return template;
        }
        renderElement(exceptionBreakpoint, _index, data) {
            const placeHolder = exceptionBreakpoint.conditionDescription || (0, nls_1.localize)('exceptionBreakpointPlaceholder', "Break when expression evaluates to true");
            data.inputBox.setPlaceHolder(placeHolder);
            data.breakpoint = exceptionBreakpoint;
            data.checkbox.checked = exceptionBreakpoint.enabled;
            data.checkbox.disabled = true;
            data.inputBox.value = exceptionBreakpoint.condition || '';
            setTimeout(() => {
                data.inputBox.focus();
                data.inputBox.select();
            }, 0);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    }
    class BreakpointsAccessibilityProvider {
        constructor(debugService, labelService) {
            this.debugService = debugService;
            this.labelService = labelService;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('breakpoints', "Breakpoints");
        }
        getRole() {
            return 'checkbox';
        }
        isChecked(breakpoint) {
            return breakpoint.enabled;
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.ExceptionBreakpoint) {
                return element.toString();
            }
            const { message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), element, this.labelService, this.debugService.getModel());
            const toString = element.toString();
            return message ? `${toString}, ${message}` : toString;
        }
    }
    function openBreakpointSource(breakpoint, sideBySide, preserveFocus, pinned, debugService, editorService) {
        if (breakpoint.uri.scheme === debug_1.DEBUG_SCHEME && debugService.state === 0 /* State.Inactive */) {
            return Promise.resolve(undefined);
        }
        const selection = breakpoint.endLineNumber ? {
            startLineNumber: breakpoint.lineNumber,
            endLineNumber: breakpoint.endLineNumber,
            startColumn: breakpoint.column || 1,
            endColumn: breakpoint.endColumn || 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */
        } : {
            startLineNumber: breakpoint.lineNumber,
            startColumn: breakpoint.column || 1,
            endLineNumber: breakpoint.lineNumber,
            endColumn: breakpoint.column || 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */
        };
        return editorService.openEditor({
            resource: breakpoint.uri,
            options: {
                preserveFocus,
                selection,
                revealIfOpened: true,
                selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */,
                pinned
            }
        }, sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
    }
    exports.openBreakpointSource = openBreakpointSource;
    function getBreakpointMessageAndIcon(state, breakpointsActivated, breakpoint, labelService, debugModel) {
        const debugActive = state === 3 /* State.Running */ || state === 2 /* State.Stopped */;
        const breakpointIcon = breakpoint instanceof debugModel_1.DataBreakpoint ? icons.dataBreakpoint : breakpoint instanceof debugModel_1.FunctionBreakpoint ? icons.functionBreakpoint : breakpoint.logMessage ? icons.logBreakpoint : icons.breakpoint;
        if (!breakpoint.enabled || !breakpointsActivated) {
            return {
                icon: breakpointIcon.disabled,
                message: breakpoint.logMessage ? (0, nls_1.localize)('disabledLogpoint', "Disabled Logpoint") : (0, nls_1.localize)('disabledBreakpoint', "Disabled Breakpoint"),
            };
        }
        const appendMessage = (text) => {
            return ('message' in breakpoint && breakpoint.message) ? text.concat(', ' + breakpoint.message) : text;
        };
        if (debugActive && breakpoint instanceof debugModel_1.Breakpoint && breakpoint.pending) {
            return {
                icon: icons.breakpoint.pending
            };
        }
        if (debugActive && !breakpoint.verified) {
            return {
                icon: breakpointIcon.unverified,
                message: ('message' in breakpoint && breakpoint.message) ? breakpoint.message : (breakpoint.logMessage ? (0, nls_1.localize)('unverifiedLogpoint', "Unverified Logpoint") : (0, nls_1.localize)('unverifiedBreakpoint', "Unverified Breakpoint")),
                showAdapterUnverifiedMessage: true
            };
        }
        if (breakpoint instanceof debugModel_1.DataBreakpoint) {
            if (!breakpoint.supported) {
                return {
                    icon: breakpointIcon.unverified,
                    message: (0, nls_1.localize)('dataBreakpointUnsupported', "Data breakpoints not supported by this debug type"),
                };
            }
            return {
                icon: breakpointIcon.regular,
                message: breakpoint.message || (0, nls_1.localize)('dataBreakpoint', "Data Breakpoint")
            };
        }
        if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
            if (!breakpoint.supported) {
                return {
                    icon: breakpointIcon.unverified,
                    message: (0, nls_1.localize)('functionBreakpointUnsupported', "Function breakpoints not supported by this debug type"),
                };
            }
            const messages = [];
            messages.push(breakpoint.message || (0, nls_1.localize)('functionBreakpoint', "Function Breakpoint"));
            if (breakpoint.condition) {
                messages.push((0, nls_1.localize)('expression', "Condition: {0}", breakpoint.condition));
            }
            if (breakpoint.hitCondition) {
                messages.push((0, nls_1.localize)('hitCount', "Hit Count: {0}", breakpoint.hitCondition));
            }
            return {
                icon: breakpointIcon.regular,
                message: appendMessage(messages.join('\n'))
            };
        }
        if (breakpoint instanceof debugModel_1.InstructionBreakpoint) {
            if (!breakpoint.supported) {
                return {
                    icon: breakpointIcon.unverified,
                    message: (0, nls_1.localize)('instructionBreakpointUnsupported', "Instruction breakpoints not supported by this debug type"),
                };
            }
            const messages = [];
            if (breakpoint.message) {
                messages.push(breakpoint.message);
            }
            else if (breakpoint.instructionReference) {
                messages.push((0, nls_1.localize)('instructionBreakpointAtAddress', "Instruction breakpoint at address {0}", breakpoint.instructionReference));
            }
            else {
                messages.push((0, nls_1.localize)('instructionBreakpoint', "Instruction breakpoint"));
            }
            if (breakpoint.hitCondition) {
                messages.push((0, nls_1.localize)('hitCount', "Hit Count: {0}", breakpoint.hitCondition));
            }
            return {
                icon: breakpointIcon.regular,
                message: appendMessage(messages.join('\n'))
            };
        }
        // can change this when all breakpoint supports dependent breakpoint condition
        let triggeringBreakpoint;
        if (breakpoint instanceof debugModel_1.Breakpoint && breakpoint.triggeredBy) {
            triggeringBreakpoint = debugModel.getBreakpoints().find(bp => bp.getId() === breakpoint.triggeredBy);
        }
        if (breakpoint.logMessage || breakpoint.condition || breakpoint.hitCondition || triggeringBreakpoint) {
            const messages = [];
            let icon = breakpoint.logMessage ? icons.logBreakpoint.regular : icons.conditionalBreakpoint.regular;
            if (!breakpoint.supported) {
                icon = icons.debugBreakpointUnsupported;
                messages.push((0, nls_1.localize)('breakpointUnsupported', "Breakpoints of this type are not supported by the debugger"));
            }
            if (breakpoint.logMessage) {
                messages.push((0, nls_1.localize)('logMessage', "Log Message: {0}", breakpoint.logMessage));
            }
            if (breakpoint.condition) {
                messages.push((0, nls_1.localize)('expression', "Condition: {0}", breakpoint.condition));
            }
            if (breakpoint.hitCondition) {
                messages.push((0, nls_1.localize)('hitCount', "Hit Count: {0}", breakpoint.hitCondition));
            }
            if (triggeringBreakpoint) {
                messages.push((0, nls_1.localize)('triggeredBy', "Hit after breakpoint: {0}", `${labelService.getUriLabel(triggeringBreakpoint.uri, { relative: true })}: ${triggeringBreakpoint.lineNumber}`));
            }
            return {
                icon,
                message: appendMessage(messages.join('\n'))
            };
        }
        const message = ('message' in breakpoint && breakpoint.message) ? breakpoint.message : breakpoint instanceof debugModel_1.Breakpoint && labelService ? labelService.getUriLabel(breakpoint.uri) : (0, nls_1.localize)('breakpoint', "Breakpoint");
        return {
            icon: breakpointIcon.regular,
            message
        };
    }
    exports.getBreakpointMessageAndIcon = getBreakpointMessageAndIcon;
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.addFunctionBreakpointAction',
                title: {
                    value: (0, nls_1.localize)('addFunctionBreakpoint', "Add Function Breakpoint"),
                    original: 'Add Function Breakpoint',
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miFunctionBreakpoint', comment: ['&& denotes a mnemonic'] }, "&&Function Breakpoint...")
                },
                f1: true,
                icon: icons.watchExpressionsAddFuncBreakpoint,
                menu: [{
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 10,
                        when: contextkey_1.ContextKeyExpr.equals('view', debug_1.BREAKPOINTS_VIEW_ID)
                    }, {
                        id: actions_2.MenuId.MenubarNewBreakpointMenu,
                        group: '1_breakpoints',
                        order: 3,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.addFunctionBreakpoint();
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.toggleBreakpointsActivatedAction',
                title: (0, nls_1.localize2)('activateBreakpoints', 'Toggle Activate Breakpoints'),
                f1: true,
                icon: icons.breakpointsActivate,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    group: 'navigation',
                    order: 20,
                    when: contextkey_1.ContextKeyExpr.equals('view', debug_1.BREAKPOINTS_VIEW_ID)
                }
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.setBreakpointsActivated(!debugService.getModel().areBreakpointsActivated());
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.removeBreakpoint',
                title: (0, nls_1.localize)('removeBreakpoint', "Remove Breakpoint"),
                icon: codicons_1.Codicon.removeClose,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: '3_modification',
                        order: 10,
                        when: debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint')
                    }, {
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'inline',
                        order: 20,
                        when: debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint')
                    }]
            });
        }
        async run(accessor, breakpoint) {
            const debugService = accessor.get(debug_1.IDebugService);
            if (breakpoint instanceof debugModel_1.Breakpoint) {
                await debugService.removeBreakpoints(breakpoint.getId());
            }
            else if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
                await debugService.removeFunctionBreakpoints(breakpoint.getId());
            }
            else if (breakpoint instanceof debugModel_1.DataBreakpoint) {
                await debugService.removeDataBreakpoints(breakpoint.getId());
            }
            else if (breakpoint instanceof debugModel_1.InstructionBreakpoint) {
                await debugService.removeInstructionBreakpoints(breakpoint.instructionReference);
            }
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.removeAllBreakpoints',
                title: {
                    original: 'Remove All Breakpoints',
                    value: (0, nls_1.localize)('removeAllBreakpoints', "Remove All Breakpoints"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miRemoveAllBreakpoints', comment: ['&& denotes a mnemonic'] }, "Remove &&All Breakpoints")
                },
                f1: true,
                icon: icons.breakpointsRemoveAll,
                menu: [{
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 30,
                        when: contextkey_1.ContextKeyExpr.equals('view', debug_1.BREAKPOINTS_VIEW_ID)
                    }, {
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: '3_modification',
                        order: 20,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint'))
                    }, {
                        id: actions_2.MenuId.MenubarDebugMenu,
                        group: '5_breakpoints',
                        order: 3,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.removeBreakpoints();
            debugService.removeFunctionBreakpoints();
            debugService.removeDataBreakpoints();
            debugService.removeInstructionBreakpoints();
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.enableAllBreakpoints',
                title: {
                    original: 'Enable All Breakpoints',
                    value: (0, nls_1.localize)('enableAllBreakpoints', "Enable All Breakpoints"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miEnableAllBreakpoints', comment: ['&& denotes a mnemonic'] }, "&&Enable All Breakpoints"),
                },
                f1: true,
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'z_commands',
                        order: 10,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint'))
                    }, {
                        id: actions_2.MenuId.MenubarDebugMenu,
                        group: '5_breakpoints',
                        order: 1,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            await debugService.enableOrDisableBreakpoints(true);
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.disableAllBreakpoints',
                title: {
                    original: 'Disable All Breakpoints',
                    value: (0, nls_1.localize)('disableAllBreakpoints', "Disable All Breakpoints"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miDisableAllBreakpoints', comment: ['&& denotes a mnemonic'] }, "Disable A&&ll Breakpoints")
                },
                f1: true,
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'z_commands',
                        order: 20,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint'))
                    }, {
                        id: actions_2.MenuId.MenubarDebugMenu,
                        group: '5_breakpoints',
                        order: 2,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            await debugService.enableOrDisableBreakpoints(false);
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.reapplyBreakpointsAction',
                title: (0, nls_1.localize2)('reapplyAllBreakpoints', 'Reapply All Breakpoints'),
                f1: true,
                precondition: debug_1.CONTEXT_IN_DEBUG_MODE,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'z_commands',
                        order: 30,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint'))
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            await debugService.setBreakpointsActivated(true);
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'debug.editBreakpoint',
                viewId: debug_1.BREAKPOINTS_VIEW_ID,
                title: (0, nls_1.localize)('editCondition', "Edit Condition..."),
                icon: codicons_1.Codicon.edit,
                precondition: debug_1.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        when: debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('functionBreakpoint'),
                        group: 'navigation',
                        order: 10
                    }, {
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'inline',
                        order: 10
                    }]
            });
        }
        async runInView(accessor, view, breakpoint) {
            const debugService = accessor.get(debug_1.IDebugService);
            const editorService = accessor.get(editorService_1.IEditorService);
            if (breakpoint instanceof debugModel_1.Breakpoint) {
                const editor = await openBreakpointSource(breakpoint, false, false, true, debugService, editorService);
                if (editor) {
                    const codeEditor = editor.getControl();
                    if ((0, editorBrowser_1.isCodeEditor)(codeEditor)) {
                        codeEditor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(breakpoint.lineNumber, breakpoint.column);
                    }
                }
            }
            else if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
                const contextMenuService = accessor.get(contextView_1.IContextMenuService);
                const actions = [new actions_1.Action('breakpoint.editCondition', (0, nls_1.localize)('editCondition', "Edit Condition..."), undefined, true, async () => view.renderInputBox({ breakpoint, type: 'condition' })),
                    new actions_1.Action('breakpoint.editCondition', (0, nls_1.localize)('editHitCount', "Edit Hit Count..."), undefined, true, async () => view.renderInputBox({ breakpoint, type: 'hitCount' }))];
                const domNode = breakpointIdToActionBarDomeNode.get(breakpoint.getId());
                if (domNode) {
                    contextMenuService.showContextMenu({
                        getActions: () => actions,
                        getAnchor: () => domNode,
                        onHide: () => (0, lifecycle_1.dispose)(actions)
                    });
                }
            }
            else {
                view.renderInputBox({ breakpoint, type: 'condition' });
            }
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'debug.editFunctionBreakpoint',
                viewId: debug_1.BREAKPOINTS_VIEW_ID,
                title: (0, nls_1.localize)('editBreakpoint', "Edit Function Condition..."),
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'navigation',
                        order: 10,
                        when: debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo('functionBreakpoint')
                    }]
            });
        }
        runInView(_accessor, view, breakpoint) {
            view.renderInputBox({ breakpoint, type: 'name' });
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'debug.editFunctionBreakpointHitCount',
                viewId: debug_1.BREAKPOINTS_VIEW_ID,
                title: (0, nls_1.localize)('editHitCount', "Edit Hit Count..."),
                precondition: debug_1.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'navigation',
                        order: 20,
                        when: contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo('functionBreakpoint'), debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo('dataBreakpoint'))
                    }]
            });
        }
        runInView(_accessor, view, breakpoint) {
            view.renderInputBox({ breakpoint, type: 'hitCount' });
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWtwb2ludHNWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2JyZWFrcG9pbnRzVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBb0RoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLFNBQVMsY0FBYyxDQUFDLFdBQTBCO1FBQ2pELE1BQU0sUUFBUSxHQUFxQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUMsUUFBUSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7UUFDM0IsUUFBUSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN2QixXQUFXLENBQUMsSUFBSSxDQUFDLGVBQU8sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVqRCxPQUFPLFFBQVEsQ0FBQztJQUNqQixDQUFDO0lBRUQsTUFBTSx1QkFBdUIsR0FBRyxDQUFDLENBQUM7SUFDbEMsU0FBZ0IsbUJBQW1CLENBQUMsS0FBa0IsRUFBRSxTQUE2QixFQUFFLFVBQWtCO1FBQ3hHLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNoTyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBSEQsa0RBR0M7SUFRTSxJ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