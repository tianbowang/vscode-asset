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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/strings", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/browser/debugToolBar", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, dom, actionbar_1, highlightedLabel_1, actions_1, async_1, codicons_1, event_1, filters_1, lifecycle_1, path_1, strings_1, nls_1, menuEntryActionViewItem_1, actions_2, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, label_1, listService_1, notification_1, opener_1, telemetry_1, colorRegistry_1, themeService_1, themables_1, viewPane_1, views_1, baseDebugView_1, debugCommands_1, icons, debugToolBar_1, debug_1, debugModel_1, debugUtils_1) {
    "use strict";
    var SessionsRenderer_1, ThreadsRenderer_1, StackFramesRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallStackView = exports.getSpecificSourceName = exports.getContextForContributedActions = exports.getContext = void 0;
    const $ = dom.$;
    function assignSessionContext(element, context) {
        context.sessionId = element.getId();
        return context;
    }
    function assignThreadContext(element, context) {
        context.threadId = element.getId();
        assignSessionContext(element.session, context);
        return context;
    }
    function assignStackFrameContext(element, context) {
        context.frameId = element.getId();
        context.frameName = element.name;
        context.frameLocation = { range: element.range, source: element.source.raw };
        assignThreadContext(element.thread, context);
        return context;
    }
    function getContext(element) {
        if (element instanceof debugModel_1.StackFrame) {
            return assignStackFrameContext(element, {});
        }
        else if (element instanceof debugModel_1.Thread) {
            return assignThreadContext(element, {});
        }
        else if (isDebugSession(element)) {
            return assignSessionContext(element, {});
        }
        else {
            return undefined;
        }
    }
    exports.getContext = getContext;
    // Extensions depend on this context, should not be changed even though it is not fully deterministic
    function getContextForContributedActions(element) {
        if (element instanceof debugModel_1.StackFrame) {
            if (element.source.inMemory) {
                return element.source.raw.path || element.source.reference || element.source.name;
            }
            return element.source.uri.toString();
        }
        if (element instanceof debugModel_1.Thread) {
            return element.threadId;
        }
        if (isDebugSession(element)) {
            return element.getId();
        }
        return '';
    }
    exports.getContextForContributedActions = getContextForContributedActions;
    function getSpecificSourceName(stackFrame) {
        // To reduce flashing of the path name and the way we fetch stack frames
        // We need to compute the source name based on the other frames in the stale call stack
        let callStack = stackFrame.thread.getStaleCallStack();
        callStack = callStack.length > 0 ? callStack : stackFrame.thread.getCallStack();
        const otherSources = callStack.map(sf => sf.source).filter(s => s !== stackFrame.source);
        let suffixLength = 0;
        otherSources.forEach(s => {
            if (s.name === stackFrame.source.name) {
                suffixLength = Math.max(suffixLength, (0, strings_1.commonSuffixLength)(stackFrame.source.uri.path, s.uri.path));
            }
        });
        if (suffixLength === 0) {
            return stackFrame.source.name;
        }
        const from = Math.max(0, stackFrame.source.uri.path.lastIndexOf(path_1.posix.sep, stackFrame.source.uri.path.length - suffixLength - 1));
        return (from > 0 ? '...' : '') + stackFrame.source.uri.path.substring(from);
    }
    exports.getSpecificSourceName = getSpecificSourceName;
    async function expandTo(session, tree) {
        if (session.parentSession) {
            await expandTo(session.parentSession, tree);
        }
        await tree.expand(session);
    }
    let CallStackView = class CallStackView extends viewPane_1.ViewPane {
        constructor(options, contextMenuService, debugService, keybindingService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, themeService, telemetryService, menuService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.options = options;
            this.debugService = debugService;
            this.menuService = menuService;
            this.needsRefresh = false;
            this.ignoreSelectionChangedEvent = false;
            this.ignoreFocusStackFrameEvent = false;
            this.autoExpandedSessions = new Set();
            this.selectionNeedsUpdate = false;
            // Create scheduler to prevent unnecessary flashing of tree when reacting to changes
            this.onCallStackChangeScheduler = this._register(new async_1.RunOnceScheduler(async () => {
                // Only show the global pause message if we do not display threads.
                // Otherwise there will be a pause message per thread and there is no need for a global one.
                const sessions = this.debugService.getModel().getSessions();
                if (sessions.length === 0) {
                    this.autoExpandedSessions.clear();
                }
                const thread = sessions.length === 1 && sessions[0].getAllThreads().length === 1 ? sessions[0].getAllThreads()[0] : undefined;
                const stoppedDetails = sessions.length === 1 ? sessions[0].getStoppedDetails() : undefined;
                if (stoppedDetails && (thread || typeof stoppedDetails.threadId !== 'number')) {
                    this.stateMessageLabel.textContent = stoppedDescription(stoppedDetails);
                    this.stateMessageLabel.title = stoppedText(stoppedDetails);
                    this.stateMessageLabel.classList.toggle('exception', stoppedDetails.reason === 'exception');
                    this.stateMessage.hidden = false;
                }
                else if (sessions.length === 1 && sessions[0].state === 3 /* State.Running */) {
                    this.stateMessageLabel.textContent = (0, nls_1.localize)({ key: 'running', comment: ['indicates state'] }, "Running");
                    this.stateMessageLabel.title = sessions[0].getLabel();
                    this.stateMessageLabel.classList.remove('exception');
                    this.stateMessage.hidden = false;
                }
                else {
                    this.stateMessage.hidden = true;
                }
                this.updateActions();
                this.needsRefresh = false;
                this.dataSource.deemphasizedStackFramesToShow = [];
                await this.tree.updateChildren();
                try {
                    const toExpand = new Set();
                    sessions.forEach(s => {
                        // Automatically expand sessions that have children, but only do this once.
                        if (s.parentSession && !this.autoExpandedSessions.has(s.parentSession)) {
                            toExpand.add(s.parentSession);
                        }
                    });
                    for (const session of toExpand) {
                        await expandTo(session, this.tree);
                        this.autoExpandedSessions.add(session);
                    }
                }
                catch (e) {
                    // Ignore tree expand errors if element no longer present
                }
                if (this.selectionNeedsUpdate) {
                    this.selectionNeedsUpdate = false;
                    await this.updateTreeSelection();
                }
            }, 50));
        }
        renderHeaderTitle(container) {
            super.renderHeaderTitle(container, this.options.title);
            this.stateMessage = dom.append(container, $('span.call-stack-state-message'));
            this.stateMessage.hidden = true;
            this.stateMessageLabel = dom.append(this.stateMessage, $('span.label'));
        }
        renderBody(container) {
            super.renderBody(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-call-stack');
            const treeContainer = (0, baseDebugView_1.renderViewTree)(container);
            this.dataSource = new CallStackDataSource(this.debugService);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchCompressibleAsyncDataTree, 'CallStackView', treeContainer, new CallStackDelegate(), new CallStackCompressionDelegate(this.debugService), [
                this.instantiationService.createInstance(SessionsRenderer),
                this.instantiationService.createInstance(ThreadsRenderer),
                this.instantiationService.createInstance(StackFramesRenderer),
                new ErrorsRenderer(),
                new LoadMoreRenderer(),
                new ShowMoreRenderer()
            ], this.dataSource, {
                accessibilityProvider: new CallStackAccessibilityProvider(),
                compressionEnabled: true,
                autoExpandSingleChildren: true,
                identityProvider: {
                    getId: (element) => {
                        if (typeof element === 'string') {
                            return element;
                        }
                        if (element instanceof Array) {
                            return `showMore ${element[0].getId()}`;
                        }
                        return element.getId();
                    }
                },
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (e) => {
                        if (isDebugSession(e)) {
                            return e.getLabel();
                        }
                        if (e instanceof debugModel_1.Thread) {
                            return `${e.name} ${e.stateLabel}`;
                        }
                        if (e instanceof debugModel_1.StackFrame || typeof e === 'string') {
                            return e;
                        }
                        if (e instanceof debugModel_1.ThreadAndSessionIds) {
                            return LoadMoreRenderer.LABEL;
                        }
                        return (0, nls_1.localize)('showMoreStackFrames2', "Show More Stack Frames");
                    },
                    getCompressedNodeKeyboardNavigationLabel: (e) => {
                        const firstItem = e[0];
                        if (isDebugSession(firstItem)) {
                            return firstItem.getLabel();
                        }
                        return '';
                    }
                },
                expandOnlyOnTwistieClick: true,
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            this.tree.setInput(this.debugService.getModel());
            this._register(this.tree);
            this._register(this.tree.onDidOpen(async (e) => {
                if (this.ignoreSelectionChangedEvent) {
                    return;
                }
                const focusStackFrame = (stackFrame, thread, session, options = {}) => {
                    this.ignoreFocusStackFrameEvent = true;
                    try {
                        this.debugService.focusStackFrame(stackFrame, thread, session, { ...options, ...{ explicit: true } });
                    }
                    finally {
                        this.ignoreFocusStackFrameEvent = false;
                    }
                };
                const element = e.element;
                if (element instanceof debugModel_1.StackFrame) {
                    const opts = {
                        preserveFocus: e.editorOptions.preserveFocus,
                        sideBySide: e.sideBySide,
                        pinned: e.editorOptions.pinned
                    };
                    focusStackFrame(element, element.thread, element.thread.session, opts);
                }
                if (element instanceof debugModel_1.Thread) {
                    focusStackFrame(undefined, element, element.session);
                }
                if (isDebugSession(element)) {
                    focusStackFrame(undefined, undefined, element);
                }
                if (element instanceof debugModel_1.ThreadAndSessionIds) {
                    const session = this.debugService.getModel().getSession(element.sessionId);
                    const thread = session && session.getThread(element.threadId);
                    if (thread) {
                        const totalFrames = thread.stoppedDetails?.totalFrames;
                        const remainingFramesCount = typeof totalFrames === 'number' ? (totalFrames - thread.getCallStack().length) : undefined;
                        // Get all the remaining frames
                        await thread.fetchCallStack(remainingFramesCount);
                        await this.tree.updateChildren();
                    }
                }
                if (element instanceof Array) {
                    this.dataSource.deemphasizedStackFramesToShow.push(...element);
                    this.tree.updateChildren();
                }
            }));
            this._register(this.debugService.getModel().onDidChangeCallStack(() => {
                if (!this.isBodyVisible()) {
                    this.needsRefresh = true;
                    return;
                }
                if (!this.onCallStackChangeScheduler.isScheduled()) {
                    this.onCallStackChangeScheduler.schedule();
                }
            }));
            const onFocusChange = event_1.Event.any(this.debugService.getViewModel().onDidFocusStackFrame, this.debugService.getViewModel().onDidFocusSession);
            this._register(onFocusChange(async () => {
                if (this.ignoreFocusStackFrameEvent) {
                    return;
                }
                if (!this.isBodyVisible()) {
                    this.needsRefresh = true;
                    return;
                }
                if (this.onCallStackChangeScheduler.isScheduled()) {
                    this.selectionNeedsUpdate = true;
                    return;
                }
                await this.updateTreeSelection();
            }));
            this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
            // Schedule the update of the call stack tree if the viewlet is opened after a session started #14684
            if (this.debugService.state === 2 /* State.Stopped */) {
                this.onCallStackChangeScheduler.schedule(0);
            }
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.needsRefresh) {
                    this.onCallStackChangeScheduler.schedule();
                }
            }));
            this._register(this.debugService.onDidNewSession(s => {
                const sessionListeners = [];
                sessionListeners.push(s.onDidChangeName(() => {
                    // this.tree.updateChildren is called on a delay after a session is added,
                    // so don't rerender if the tree doesn't have the node yet
                    if (this.tree.hasNode(s)) {
                        this.tree.rerender(s);
                    }
                }));
                sessionListeners.push(s.onDidEndAdapter(() => (0, lifecycle_1.dispose)(sessionListeners)));
                if (s.parentSession) {
                    // A session we already expanded has a new child session, allow to expand it again.
                    this.autoExpandedSessions.delete(s.parentSession);
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
        async updateTreeSelection() {
            if (!this.tree || !this.tree.getInput()) {
                // Tree not initialized yet
                return;
            }
            const updateSelectionAndReveal = (element) => {
                this.ignoreSelectionChangedEvent = true;
                try {
                    this.tree.setSelection([element]);
                    // If the element is outside of the screen bounds,
                    // position it in the middle
                    if (this.tree.getRelativeTop(element) === null) {
                        this.tree.reveal(element, 0.5);
                    }
                    else {
                        this.tree.reveal(element);
                    }
                }
                catch (e) { }
                finally {
                    this.ignoreSelectionChangedEvent = false;
                }
            };
            const thread = this.debugService.getViewModel().focusedThread;
            const session = this.debugService.getViewModel().focusedSession;
            const stackFrame = this.debugService.getViewModel().focusedStackFrame;
            if (!thread) {
                if (!session) {
                    this.tree.setSelection([]);
                }
                else {
                    updateSelectionAndReveal(session);
                }
            }
            else {
                // Ignore errors from this expansions because we are not aware if we rendered the threads and sessions or we hide them to declutter the view
                try {
                    await expandTo(thread.session, this.tree);
                }
                catch (e) { }
                try {
                    await this.tree.expand(thread);
                }
                catch (e) { }
                const toReveal = stackFrame || session;
                if (toReveal) {
                    updateSelectionAndReveal(toReveal);
                }
            }
        }
        onContextMenu(e) {
            const element = e.element;
            let overlay = [];
            if (isDebugSession(element)) {
                overlay = getSessionContextOverlay(element);
            }
            else if (element instanceof debugModel_1.Thread) {
                overlay = getThreadContextOverlay(element);
            }
            else if (element instanceof debugModel_1.StackFrame) {
                overlay = getStackFrameContextOverlay(element);
            }
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            const contextKeyService = this.contextKeyService.createOverlay(overlay);
            const menu = this.menuService.createMenu(actions_2.MenuId.DebugCallStackContext, contextKeyService);
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { arg: getContextForContributedActions(element), shouldForwardArgs: true }, result, 'inline');
            menu.dispose();
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => result.secondary,
                getActionsContext: () => getContext(element)
            });
        }
    };
    exports.CallStackView = CallStackView;
    exports.CallStackView = CallStackView = __decorate([
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
        __param(11, actions_2.IMenuService)
    ], CallStackView);
    function getSessionContextOverlay(session) {
        return [
            [debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.key, 'session'],
            [debug_1.CONTEXT_CALLSTACK_SESSION_IS_ATTACH.key, (0, debugUtils_1.isSessionAttach)(session)],
            [debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED.key, session.state === 2 /* State.Stopped */],
            [debug_1.CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD.key, session.getAllThreads().length === 1],
        ];
    }
    let SessionsRenderer = class SessionsRenderer {
        static { SessionsRenderer_1 = this; }
        static { this.ID = 'session'; }
        constructor(instantiationService, contextKeyService, menuService) {
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
        }
        get templateId() {
            return SessionsRenderer_1.ID;
        }
        renderTemplate(container) {
            const session = dom.append(container, $('.session'));
            dom.append(session, $(themables_1.ThemeIcon.asCSSSelector(icons.callstackViewSession)));
            const name = dom.append(session, $('.name'));
            const stateLabel = dom.append(session, $('span.state.label.monaco-count-badge.long'));
            const label = new highlightedLabel_1.HighlightedLabel(name);
            const templateDisposable = new lifecycle_1.DisposableStore();
            const stopActionViewItemDisposables = templateDisposable.add(new lifecycle_1.DisposableStore());
            const actionBar = templateDisposable.add(new actionbar_1.ActionBar(session, {
                actionViewItemProvider: action => {
                    if ((action.id === debugCommands_1.STOP_ID || action.id === debugCommands_1.DISCONNECT_ID) && action instanceof actions_2.MenuItemAction) {
                        stopActionViewItemDisposables.clear();
                        const item = this.instantiationService.invokeFunction(accessor => (0, debugToolBar_1.createDisconnectMenuItemAction)(action, stopActionViewItemDisposables, accessor));
                        if (item) {
                            return item;
                        }
                    }
                    if (action instanceof actions_2.MenuItemAction) {
                        return this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined);
                    }
                    else if (action instanceof actions_2.SubmenuItemAction) {
                        return this.instantiationService.createInstance(menuEntryActionViewItem_1.SubmenuEntryActionViewItem, action, undefined);
                    }
                    return undefined;
                }
            }));
            const elementDisposable = templateDisposable.add(new lifecycle_1.DisposableStore());
            return { session, name, stateLabel, label, actionBar, elementDisposable, templateDisposable };
        }
        renderElement(element, _, data) {
            this.doRenderElement(element.element, (0, filters_1.createMatches)(element.filterData), data);
        }
        renderCompressedElements(node, _index, templateData) {
            const lastElement = node.element.elements[node.element.elements.length - 1];
            const matches = (0, filters_1.createMatches)(node.filterData);
            this.doRenderElement(lastElement, matches, templateData);
        }
        doRenderElement(session, matches, data) {
            data.session.title = (0, nls_1.localize)({ key: 'session', comment: ['Session is a noun'] }, "Session");
            data.label.set(session.getLabel(), matches);
            const stoppedDetails = session.getStoppedDetails();
            const thread = session.getAllThreads().find(t => t.stopped);
            const contextKeyService = this.contextKeyService.createOverlay(getSessionContextOverlay(session));
            const menu = data.elementDisposable.add(this.menuService.createMenu(actions_2.MenuId.DebugCallStackContext, contextKeyService));
            const setupActionBar = () => {
                data.actionBar.clear();
                const primary = [];
                const secondary = [];
                const result = { primary, secondary };
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { arg: getContextForContributedActions(session), shouldForwardArgs: true }, result, 'inline');
                data.actionBar.push(primary, { icon: true, label: false });
                // We need to set our internal context on the action bar, since our commands depend on that one
                // While the external context our extensions rely on
                data.actionBar.context = getContext(session);
            };
            data.elementDisposable.add(menu.onDidChange(() => setupActionBar()));
            setupActionBar();
            data.stateLabel.style.display = '';
            if (stoppedDetails) {
                data.stateLabel.textContent = stoppedDescription(stoppedDetails);
                data.session.title = `${session.getLabel()}: ${stoppedText(stoppedDetails)}`;
                data.stateLabel.classList.toggle('exception', stoppedDetails.reason === 'exception');
            }
            else if (thread && thread.stoppedDetails) {
                data.stateLabel.textContent = stoppedDescription(thread.stoppedDetails);
                data.session.title = `${session.getLabel()}: ${stoppedText(thread.stoppedDetails)}`;
                data.stateLabel.classList.toggle('exception', thread.stoppedDetails.reason === 'exception');
            }
            else {
                data.stateLabel.textContent = (0, nls_1.localize)({ key: 'running', comment: ['indicates state'] }, "Running");
                data.stateLabel.classList.remove('exception');
            }
        }
        disposeTemplate(templateData) {
            templateData.templateDisposable.dispose();
        }
        disposeElement(_element, _, templateData) {
            templateData.elementDisposable.clear();
        }
        disposeCompressedElements(node, index, templateData, height) {
            templateData.elementDisposable.clear();
        }
    };
    SessionsRenderer = SessionsRenderer_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, actions_2.IMenuService)
    ], SessionsRenderer);
    function getThreadContextOverlay(thread) {
        return [
            [debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.key, 'thread'],
            [debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED.key, thread.stopped]
        ];
    }
    let ThreadsRenderer = class ThreadsRenderer {
        static { ThreadsRenderer_1 = this; }
        static { this.ID = 'thread'; }
        constructor(contextKeyService, menuService) {
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
        }
        get templateId() {
            return ThreadsRenderer_1.ID;
        }
        renderTemplate(container) {
            const thread = dom.append(container, $('.thread'));
            const name = dom.append(thread, $('.name'));
            const stateLabel = dom.append(thread, $('span.state.label.monaco-count-badge.long'));
            const label = new highlightedLabel_1.HighlightedLabel(name);
            const templateDisposable = new lifecycle_1.DisposableStore();
            const actionBar = templateDisposable.add(new actionbar_1.ActionBar(thread));
            const elementDisposable = templateDisposable.add(new lifecycle_1.DisposableStore());
            return { thread, name, stateLabel, label, actionBar, elementDisposable, templateDisposable };
        }
        renderElement(element, _index, data) {
            const thread = element.element;
            data.thread.title = thread.name;
            data.label.set(thread.name, (0, filters_1.createMatches)(element.filterData));
            data.stateLabel.textContent = thread.stateLabel;
            data.stateLabel.classList.toggle('exception', thread.stoppedDetails?.reason === 'exception');
            const contextKeyService = this.contextKeyService.createOverlay(getThreadContextOverlay(thread));
            const menu = data.elementDisposable.add(this.menuService.createMenu(actions_2.MenuId.DebugCallStackContext, contextKeyService));
            const setupActionBar = () => {
                data.actionBar.clear();
                const primary = [];
                const secondary = [];
                const result = { primary, secondary };
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { arg: getContextForContributedActions(thread), shouldForwardArgs: true }, result, 'inline');
                data.actionBar.push(primary, { icon: true, label: false });
                // We need to set our internal context on the action bar, since our commands depend on that one
                // While the external context our extensions rely on
                data.actionBar.context = getContext(thread);
            };
            data.elementDisposable.add(menu.onDidChange(() => setupActionBar()));
            setupActionBar();
        }
        renderCompressedElements(_node, _index, _templateData, _height) {
            throw new Error('Method not implemented.');
        }
        disposeElement(_element, _index, templateData) {
            templateData.elementDisposable.clear();
        }
        disposeTemplate(templateData) {
            templateData.templateDisposable.dispose();
        }
    };
    ThreadsRenderer = ThreadsRenderer_1 = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, actions_2.IMenuService)
    ], ThreadsRenderer);
    function getStackFrameContextOverlay(stackFrame) {
        return [
            [debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.key, 'stackFrame'],
            [debug_1.CONTEXT_STACK_FRAME_SUPPORTS_RESTART.key, stackFrame.canRestart]
        ];
    }
    let StackFramesRenderer = class StackFramesRenderer {
        static { StackFramesRenderer_1 = this; }
        static { this.ID = 'stackFrame'; }
        constructor(labelService, notificationService) {
            this.labelService = labelService;
            this.notificationService = notificationService;
        }
        get templateId() {
            return StackFramesRenderer_1.ID;
        }
        renderTemplate(container) {
            const stackFrame = dom.append(container, $('.stack-frame'));
            const labelDiv = dom.append(stackFrame, $('span.label.expression'));
            const file = dom.append(stackFrame, $('.file'));
            const fileName = dom.append(file, $('span.file-name'));
            const wrapper = dom.append(file, $('span.line-number-wrapper'));
            const lineNumber = dom.append(wrapper, $('span.line-number.monaco-count-badge'));
            const label = new highlightedLabel_1.HighlightedLabel(labelDiv);
            const templateDisposable = new lifecycle_1.DisposableStore();
            const actionBar = templateDisposable.add(new actionbar_1.ActionBar(stackFrame));
            return { file, fileName, label, lineNumber, stackFrame, actionBar, templateDisposable };
        }
        renderElement(element, index, data) {
            const stackFrame = element.element;
            data.stackFrame.classList.toggle('disabled', !stackFrame.source || !stackFrame.source.available || isDeemphasized(stackFrame));
            data.stackFrame.classList.toggle('label', stackFrame.presentationHint === 'label');
            data.stackFrame.classList.toggle('subtle', stackFrame.presentationHint === 'subtle');
            const hasActions = !!stackFrame.thread.session.capabilities.supportsRestartFrame && stackFrame.presentationHint !== 'label' && stackFrame.presentationHint !== 'subtle' && stackFrame.canRestart;
            data.stackFrame.classList.toggle('has-actions', hasActions);
            data.file.title = stackFrame.source.inMemory ? stackFrame.source.uri.path : this.labelService.getUriLabel(stackFrame.source.uri);
            if (stackFrame.source.raw.origin) {
                data.file.title += `\n${stackFrame.source.raw.origin}`;
            }
            data.label.set(stackFrame.name, (0, filters_1.createMatches)(element.filterData), stackFrame.name);
            data.fileName.textContent = getSpecificSourceName(stackFrame);
            if (stackFrame.range.startLineNumber !== undefined) {
                data.lineNumber.textContent = `${stackFrame.range.startLineNumber}`;
                if (stackFrame.range.startColumn) {
                    data.lineNumber.textContent += `:${stackFrame.range.startColumn}`;
                }
                data.lineNumber.classList.remove('unavailable');
            }
            else {
                data.lineNumber.classList.add('unavailable');
            }
            data.actionBar.clear();
            if (hasActions) {
                const action = new actions_1.Action('debug.callStack.restartFrame', (0, nls_1.localize)('restartFrame', "Restart Frame"), themables_1.ThemeIcon.asClassName(icons.debugRestartFrame), true, async () => {
                    try {
                        await stackFrame.restart();
                    }
                    catch (e) {
                        this.notificationService.error(e);
                    }
                });
                data.actionBar.push(action, { icon: true, label: false });
            }
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Method not implemented.');
        }
        disposeTemplate(templateData) {
            templateData.actionBar.dispose();
        }
    };
    StackFramesRenderer = StackFramesRenderer_1 = __decorate([
        __param(0, label_1.ILabelService),
        __param(1, notification_1.INotificationService)
    ], StackFramesRenderer);
    class ErrorsRenderer {
        static { this.ID = 'error'; }
        get templateId() {
            return ErrorsRenderer.ID;
        }
        renderTemplate(container) {
            const label = dom.append(container, $('.error'));
            return { label };
        }
        renderElement(element, index, data) {
            const error = element.element;
            data.label.textContent = error;
            data.label.title = error;
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Method not implemented.');
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    class LoadMoreRenderer {
        static { this.ID = 'loadMore'; }
        static { this.LABEL = (0, nls_1.localize)('loadAllStackFrames', "Load More Stack Frames"); }
        constructor() { }
        get templateId() {
            return LoadMoreRenderer.ID;
        }
        renderTemplate(container) {
            const label = dom.append(container, $('.load-all'));
            label.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.textLinkForeground);
            return { label };
        }
        renderElement(element, index, data) {
            data.label.textContent = LoadMoreRenderer.LABEL;
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Method not implemented.');
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    class ShowMoreRenderer {
        static { this.ID = 'showMore'; }
        constructor() { }
        get templateId() {
            return ShowMoreRenderer.ID;
        }
        renderTemplate(container) {
            const label = dom.append(container, $('.show-more'));
            label.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.textLinkForeground);
            return { label };
        }
        renderElement(element, index, data) {
            const stackFrames = element.element;
            if (stackFrames.every(sf => !!(sf.source && sf.source.origin && sf.source.origin === stackFrames[0].source.origin))) {
                data.label.textContent = (0, nls_1.localize)('showMoreAndOrigin', "Show {0} More: {1}", stackFrames.length, stackFrames[0].source.origin);
            }
            else {
                data.label.textContent = (0, nls_1.localize)('showMoreStackFrames', "Show {0} More Stack Frames", stackFrames.length);
            }
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Method not implemented.');
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    class CallStackDelegate {
        getHeight(element) {
            if (element instanceof debugModel_1.StackFrame && element.presentationHint === 'label') {
                return 16;
            }
            if (element instanceof debugModel_1.ThreadAndSessionIds || element instanceof Array) {
                return 16;
            }
            return 22;
        }
        getTemplateId(element) {
            if (isDebugSession(element)) {
                return SessionsRenderer.ID;
            }
            if (element instanceof debugModel_1.Thread) {
                return ThreadsRenderer.ID;
            }
            if (element instanceof debugModel_1.StackFrame) {
                return StackFramesRenderer.ID;
            }
            if (typeof element === 'string') {
                return ErrorsRenderer.ID;
            }
            if (element instanceof debugModel_1.ThreadAndSessionIds) {
                return LoadMoreRenderer.ID;
            }
            // element instanceof Array
            return ShowMoreRenderer.ID;
        }
    }
    function stoppedText(stoppedDetails) {
        return stoppedDetails.text ?? stoppedDescription(stoppedDetails);
    }
    function stoppedDescription(stoppedDetails) {
        return stoppedDetails.description ||
            (stoppedDetails.reason ? (0, nls_1.localize)({ key: 'pausedOn', comment: ['indicates reason for program being paused'] }, "Paused on {0}", stoppedDetails.reason) : (0, nls_1.localize)('paused', "Paused"));
    }
    function isDebugModel(obj) {
        return typeof obj.getSessions === 'function';
    }
    function isDebugSession(obj) {
        return obj && typeof obj.getAllThreads === 'function';
    }
    function isDeemphasized(frame) {
        return frame.source.presentationHint === 'deemphasize' || frame.presentationHint === 'deemphasize';
    }
    class CallStackDataSource {
        constructor(debugService) {
            this.debugService = debugService;
            this.deemphasizedStackFramesToShow = [];
        }
        hasChildren(element) {
            if (isDebugSession(element)) {
                const threads = element.getAllThreads();
                return (threads.length > 1) || (threads.length === 1 && threads[0].stopped) || !!(this.debugService.getModel().getSessions().find(s => s.parentSession === element));
            }
            return isDebugModel(element) || (element instanceof debugModel_1.Thread && element.stopped);
        }
        async getChildren(element) {
            if (isDebugModel(element)) {
                const sessions = element.getSessions();
                if (sessions.length === 0) {
                    return Promise.resolve([]);
                }
                if (sessions.length > 1 || this.debugService.getViewModel().isMultiSessionView()) {
                    return Promise.resolve(sessions.filter(s => !s.parentSession));
                }
                const threads = sessions[0].getAllThreads();
                // Only show the threads in the call stack if there is more than 1 thread.
                return threads.length === 1 ? this.getThreadChildren(threads[0]) : Promise.resolve(threads);
            }
            else if (isDebugSession(element)) {
                const childSessions = this.debugService.getModel().getSessions().filter(s => s.parentSession === element);
                const threads = element.getAllThreads();
                if (threads.length === 1) {
                    // Do not show thread when there is only one to be compact.
                    const children = await this.getThreadChildren(threads[0]);
                    return children.concat(childSessions);
                }
                return Promise.resolve(threads.concat(childSessions));
            }
            else {
                return this.getThreadChildren(element);
            }
        }
        getThreadChildren(thread) {
            return this.getThreadCallstack(thread).then(children => {
                // Check if some stack frames should be hidden under a parent element since they are deemphasized
                const result = [];
                children.forEach((child, index) => {
                    if (child instanceof debugModel_1.StackFrame && child.source && isDeemphasized(child)) {
                        // Check if the user clicked to show the deemphasized source
                        if (this.deemphasizedStackFramesToShow.indexOf(child) === -1) {
                            if (result.length) {
                                const last = result[result.length - 1];
                                if (last instanceof Array) {
                                    // Collect all the stackframes that will be "collapsed"
                                    last.push(child);
                                    return;
                                }
                            }
                            const nextChild = index < children.length - 1 ? children[index + 1] : undefined;
                            if (nextChild instanceof debugModel_1.StackFrame && nextChild.source && isDeemphasized(nextChild)) {
                                // Start collecting stackframes that will be "collapsed"
                                result.push([child]);
                                return;
                            }
                        }
                    }
                    result.push(child);
                });
                return result;
            });
        }
        async getThreadCallstack(thread) {
            let callStack = thread.getCallStack();
            if (!callStack || !callStack.length) {
                await thread.fetchCallStack();
                callStack = thread.getCallStack();
            }
            if (callStack.length === 1 && thread.session.capabilities.supportsDelayedStackTraceLoading && thread.stoppedDetails && thread.stoppedDetails.totalFrames && thread.stoppedDetails.totalFrames > 1) {
                // To reduce flashing of the call stack view simply append the stale call stack
                // once we have the correct data the tree will refresh and we will no longer display it.
                callStack = callStack.concat(thread.getStaleCallStack().slice(1));
            }
            if (thread.stoppedDetails && thread.stoppedDetails.framesErrorMessage) {
                callStack = callStack.concat([thread.stoppedDetails.framesErrorMessage]);
            }
            if (!thread.reachedEndOfCallStack && thread.stoppedDetails) {
                callStack = callStack.concat([new debugModel_1.ThreadAndSessionIds(thread.session.getId(), thread.threadId)]);
            }
            return callStack;
        }
    }
    class CallStackAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)({ comment: ['Debug is a noun in this context, not a verb.'], key: 'callStackAriaLabel' }, "Debug Call Stack");
        }
        getWidgetRole() {
            // Use treegrid as a role since each element can have additional actions inside #146210
            return 'treegrid';
        }
        getRole(_element) {
            return 'row';
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.Thread) {
                return (0, nls_1.localize)({ key: 'threadAriaLabel', comment: ['Placeholders stand for the thread name and the thread state.For example "Thread 1" and "Stopped'] }, "Thread {0} {1}", element.name, element.stateLabel);
            }
            if (element instanceof debugModel_1.StackFrame) {
                return (0, nls_1.localize)('stackFrameAriaLabel', "Stack Frame {0}, line {1}, {2}", element.name, element.range.startLineNumber, getSpecificSourceName(element));
            }
            if (isDebugSession(element)) {
                const thread = element.getAllThreads().find(t => t.stopped);
                const state = thread ? thread.stateLabel : (0, nls_1.localize)({ key: 'running', comment: ['indicates state'] }, "Running");
                return (0, nls_1.localize)({ key: 'sessionLabel', comment: ['Placeholders stand for the session name and the session state. For example "Launch Program" and "Running"'] }, "Session {0} {1}", element.getLabel(), state);
            }
            if (typeof element === 'string') {
                return element;
            }
            if (element instanceof Array) {
                return (0, nls_1.localize)('showMoreStackFrames', "Show {0} More Stack Frames", element.length);
            }
            // element instanceof ThreadAndSessionIds
            return LoadMoreRenderer.LABEL;
        }
    }
    class CallStackCompressionDelegate {
        constructor(debugService) {
            this.debugService = debugService;
        }
        isIncompressible(stat) {
            if (isDebugSession(stat)) {
                if (stat.compact) {
                    return false;
                }
                const sessions = this.debugService.getModel().getSessions();
                if (sessions.some(s => s.parentSession === stat && s.compact)) {
                    return false;
                }
                return true;
            }
            return true;
        }
    }
    (0, actions_2.registerAction2)(class Collapse extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'callStack.collapse',
                viewId: debug_1.CALLSTACK_VIEW_ID,
                title: (0, nls_1.localize)('collapse', "Collapse All"),
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                precondition: debug_1.CONTEXT_DEBUG_STATE.isEqualTo((0, debug_1.getStateLabel)(2 /* State.Stopped */)),
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    order: 10,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', debug_1.CALLSTACK_VIEW_ID)
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
    function registerCallStackInlineMenuItem(id, title, icon, when, order, precondition) {
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.DebugCallStackContext, {
            group: 'inline',
            order,
            when,
            command: { id, title, icon, precondition }
        });
    }
    const threadOrSessionWithOneThread = contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session'), debug_1.CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD));
    registerCallStackInlineMenuItem(debugCommands_1.PAUSE_ID, debugCommands_1.PAUSE_LABEL, icons.debugPause, contextkey_1.ContextKeyExpr.and(threadOrSessionWithOneThread, debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED.toNegated()), 10, debug_1.CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG.toNegated());
    registerCallStackInlineMenuItem(debugCommands_1.CONTINUE_ID, debugCommands_1.CONTINUE_LABEL, icons.debugContinue, contextkey_1.ContextKeyExpr.and(threadOrSessionWithOneThread, debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED), 10);
    registerCallStackInlineMenuItem(debugCommands_1.STEP_OVER_ID, debugCommands_1.STEP_OVER_LABEL, icons.debugStepOver, threadOrSessionWithOneThread, 20, debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED);
    registerCallStackInlineMenuItem(debugCommands_1.STEP_INTO_ID, debugCommands_1.STEP_INTO_LABEL, icons.debugStepInto, threadOrSessionWithOneThread, 30, debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED);
    registerCallStackInlineMenuItem(debugCommands_1.STEP_OUT_ID, debugCommands_1.STEP_OUT_LABEL, icons.debugStepOut, threadOrSessionWithOneThread, 40, debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED);
    registerCallStackInlineMenuItem(debugCommands_1.RESTART_SESSION_ID, debugCommands_1.RESTART_LABEL, icons.debugRestart, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session'), 50);
    registerCallStackInlineMenuItem(debugCommands_1.STOP_ID, debugCommands_1.STOP_LABEL, icons.debugStop, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_SESSION_IS_ATTACH.toNegated(), debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session')), 60);
    registerCallStackInlineMenuItem(debugCommands_1.DISCONNECT_ID, debugCommands_1.DISCONNECT_LABEL, icons.debugDisconnect, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_SESSION_IS_ATTACH, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session')), 60);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbFN0YWNrVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9jYWxsU3RhY2tWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFnRGhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFJaEIsU0FBUyxvQkFBb0IsQ0FBQyxPQUFzQixFQUFFLE9BQVk7UUFDakUsT0FBTyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDcEMsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQVMsbUJBQW1CLENBQUMsT0FBZ0IsRUFBRSxPQUFZO1FBQzFELE9BQU8sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25DLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDL0MsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQVMsdUJBQXVCLENBQUMsT0FBbUIsRUFBRSxPQUFZO1FBQ2pFLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2xDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUNqQyxPQUFPLENBQUMsYUFBYSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDN0UsbUJBQW1CLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QyxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBRUQsU0FBZ0IsVUFBVSxDQUFDLE9B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