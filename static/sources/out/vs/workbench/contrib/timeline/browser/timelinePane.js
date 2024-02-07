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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/cancellation", "vs/base/common/date", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/label/common/label", "vs/base/common/strings", "vs/base/common/uri", "vs/base/browser/ui/iconLabel/iconLabel", "vs/workbench/browser/parts/views/viewPane", "vs/platform/list/browser/listService", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/timeline/common/timeline", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor", "vs/platform/commands/common/commands", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/views", "vs/platform/progress/common/progress", "vs/platform/opener/common/opener", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/theme/common/theme", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/types", "vs/base/browser/markdownRenderer", "vs/platform/hover/browser/hover", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/extensions/common/extensions", "vs/platform/storage/common/storage", "vs/css!./media/timelinePane"], function (require, exports, nls_1, DOM, actions_1, cancellation_1, date_1, decorators_1, event_1, filters_1, iterator_1, lifecycle_1, network_1, label_1, strings_1, uri_1, iconLabel_1, viewPane_1, listService_1, keybinding_1, contextView_1, contextkey_1, configuration_1, instantiation_1, timeline_1, editorService_1, editor_1, commands_1, themeService_1, themables_1, views_1, progress_1, opener_1, actionbar_1, menuEntryActionViewItem_1, actions_2, telemetry_1, actionViewItems_1, theme_1, codicons_1, iconRegistry_1, editorCommands_1, types_1, markdownRenderer_1, hover_1, uriIdentity_1, extensions_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimelineListVirtualDelegate = exports.TimelineKeyboardNavigationLabelProvider = exports.TimelineIdentityProvider = exports.TimelinePane = exports.TimelineExcludeSources = exports.TimelineFollowActiveEditorContext = void 0;
    const ItemHeight = 22;
    function isLoadMoreCommand(item) {
        return item instanceof LoadMoreCommand;
    }
    function isTimelineItem(item) {
        return !item?.handle.startsWith('vscode-command:') ?? false;
    }
    function updateRelativeTime(item, lastRelativeTime) {
        item.relativeTime = isTimelineItem(item) ? (0, date_1.fromNow)(item.timestamp) : undefined;
        item.relativeTimeFullWord = isTimelineItem(item) ? (0, date_1.fromNow)(item.timestamp, false, true) : undefined;
        if (lastRelativeTime === undefined || item.relativeTime !== lastRelativeTime) {
            lastRelativeTime = item.relativeTime;
            item.hideRelativeTime = false;
        }
        else {
            item.hideRelativeTime = true;
        }
        return lastRelativeTime;
    }
    class TimelineAggregate {
        constructor(timeline) {
            this._stale = false;
            this._requiresReset = false;
            this.source = timeline.source;
            this.items = timeline.items;
            this._cursor = timeline.paging?.cursor;
            this.lastRenderedIndex = -1;
        }
        get cursor() {
            return this._cursor;
        }
        get more() {
            return this._cursor !== undefined;
        }
        get newest() {
            return this.items[0];
        }
        get oldest() {
            return this.items[this.items.length - 1];
        }
        add(timeline, options) {
            let updated = false;
            if (timeline.items.length !== 0 && this.items.length !== 0) {
                updated = true;
                const ids = new Set();
                const timestamps = new Set();
                for (const item of timeline.items) {
                    if (item.id === undefined) {
                        timestamps.add(item.timestamp);
                    }
                    else {
                        ids.add(item.id);
                    }
                }
                // Remove any duplicate items
                let i = this.items.length;
                let item;
                while (i--) {
                    item = this.items[i];
                    if ((item.id !== undefined && ids.has(item.id)) || timestamps.has(item.timestamp)) {
                        this.items.splice(i, 1);
                    }
                }
                if ((timeline.items[timeline.items.length - 1]?.timestamp ?? 0) >= (this.newest?.timestamp ?? 0)) {
                    this.items.splice(0, 0, ...timeline.items);
                }
                else {
                    this.items.push(...timeline.items);
                }
            }
            else if (timeline.items.length !== 0) {
                updated = true;
                this.items.push(...timeline.items);
            }
            // If we are not requesting more recent items than we have, then update the cursor
            if (options.cursor !== undefined || typeof options.limit !== 'object') {
                this._cursor = timeline.paging?.cursor;
            }
            if (updated) {
                this.items.sort((a, b) => (b.timestamp - a.timestamp) ||
                    (a.source === undefined
                        ? b.source === undefined ? 0 : 1
                        : b.source === undefined ? -1 : b.source.localeCompare(a.source, undefined, { numeric: true, sensitivity: 'base' })));
            }
            return updated;
        }
        get stale() {
            return this._stale;
        }
        get requiresReset() {
            return this._requiresReset;
        }
        invalidate(requiresReset) {
            this._stale = true;
            this._requiresReset = requiresReset;
        }
    }
    class LoadMoreCommand {
        constructor(loading) {
            this.handle = 'vscode-command:loadMore';
            this.timestamp = 0;
            this.description = undefined;
            this.tooltip = undefined;
            this.contextValue = undefined;
            // Make things easier for duck typing
            this.id = undefined;
            this.icon = undefined;
            this.iconDark = undefined;
            this.source = undefined;
            this.relativeTime = undefined;
            this.relativeTimeFullWord = undefined;
            this.hideRelativeTime = undefined;
            this._loading = false;
            this._loading = loading;
        }
        get loading() {
            return this._loading;
        }
        set loading(value) {
            this._loading = value;
        }
        get ariaLabel() {
            return this.label;
        }
        get label() {
            return this.loading ? (0, nls_1.localize)('timeline.loadingMore', "Loading...") : (0, nls_1.localize)('timeline.loadMore', "Load more");
        }
        get themeIcon() {
            return undefined; //this.loading ? { id: 'sync~spin' } : undefined;
        }
    }
    exports.TimelineFollowActiveEditorContext = new contextkey_1.RawContextKey('timelineFollowActiveEditor', true, true);
    exports.TimelineExcludeSources = new contextkey_1.RawContextKey('timelineExcludeSources', '[]', true);
    let TimelinePane = class TimelinePane extends viewPane_1.ViewPane {
        static { this.TITLE = (0, nls_1.localize2)('timeline', "Timeline"); }
        constructor(options, keybindingService, contextMenuService, contextKeyService, configurationService, storageService, viewDescriptorService, instantiationService, editorService, commandService, progressService, timelineService, openerService, themeService, telemetryService, labelService, uriIdentityService, extensionService) {
            super({ ...options, titleMenuId: actions_2.MenuId.TimelineTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.storageService = storageService;
            this.editorService = editorService;
            this.commandService = commandService;
            this.progressService = progressService;
            this.timelineService = timelineService;
            this.labelService = labelService;
            this.uriIdentityService = uriIdentityService;
            this.extensionService = extensionService;
            this.pendingRequests = new Map();
            this.timelinesBySource = new Map();
            this._followActiveEditor = true;
            this._isEmpty = true;
            this._maxItemCount = 0;
            this._visibleItemCount = 0;
            this._pendingRefresh = false;
            this.commands = this._register(this.instantiationService.createInstance(TimelinePaneCommands, this));
            this.followActiveEditorContext = exports.TimelineFollowActiveEditorContext.bindTo(this.contextKeyService);
            this.timelineExcludeSourcesContext = exports.TimelineExcludeSources.bindTo(this.contextKeyService);
            const excludedSourcesString = storageService.get('timeline.excludeSources', 0 /* StorageScope.PROFILE */, '[]');
            this.timelineExcludeSourcesContext.set(excludedSourcesString);
            this.excludedSources = new Set(JSON.parse(excludedSourcesString));
            this._register(storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, 'timeline.excludeSources', this._register(new lifecycle_1.DisposableStore()))(this.onStorageServiceChanged, this));
            this._register(configurationService.onDidChangeConfiguration(this.onConfigurationChanged, this));
            this._register(timelineService.onDidChangeProviders(this.onProvidersChanged, this));
            this._register(timelineService.onDidChangeTimeline(this.onTimelineChanged, this));
            this._register(timelineService.onDidChangeUri(uri => this.setUri(uri), this));
        }
        get followActiveEditor() {
            return this._followActiveEditor;
        }
        set followActiveEditor(value) {
            if (this._followActiveEditor === value) {
                return;
            }
            this._followActiveEditor = value;
            this.followActiveEditorContext.set(value);
            this.updateFilename(this._filename);
            if (value) {
                this.onActiveEditorChanged();
            }
        }
        get pageOnScroll() {
            if (this._pageOnScroll === undefined) {
                this._pageOnScroll = this.configurationService.getValue('timeline.pageOnScroll') ?? false;
            }
            return this._pageOnScroll;
        }
        get pageSize() {
            let pageSize = this.configurationService.getValue('timeline.pageSize');
            if (pageSize === undefined || pageSize === null) {
                // If we are paging when scrolling, then add an extra item to the end to make sure the "Load more" item is out of view
                pageSize = Math.max(20, Math.floor((this.tree?.renderHeight ?? 0 / ItemHeight) + (this.pageOnScroll ? 1 : -1)));
            }
            return pageSize;
        }
        reset() {
            this.loadTimeline(true);
        }
        setUri(uri) {
            this.setUriCore(uri, true);
        }
        setUriCore(uri, disableFollowing) {
            if (disableFollowing) {
                this.followActiveEditor = false;
            }
            this.uri = uri;
            this.updateFilename(uri ? this.labelService.getUriBasenameLabel(uri) : undefined);
            this.treeRenderer?.setUri(uri);
            this.loadTimeline(true);
        }
        onStorageServiceChanged() {
            const excludedSourcesString = this.storageService.get('timeline.excludeSources', 0 /* StorageScope.PROFILE */, '[]');
            this.timelineExcludeSourcesContext.set(excludedSourcesString);
            this.excludedSources = new Set(JSON.parse(excludedSourcesString));
            const missing = this.timelineService.getSources()
                .filter(({ id }) => !this.excludedSources.has(id) && !this.timelinesBySource.has(id));
            if (missing.length !== 0) {
                this.loadTimeline(true, missing.map(({ id }) => id));
            }
            else {
                this.refresh();
            }
        }
        onConfigurationChanged(e) {
            if (e.affectsConfiguration('timeline.pageOnScroll')) {
                this._pageOnScroll = undefined;
            }
        }
        onActiveEditorChanged() {
            if (!this.followActiveEditor || !this.isExpanded()) {
                return;
            }
            const uri = editor_1.EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if ((this.uriIdentityService.extUri.isEqual(uri, this.uri) && uri !== undefined) ||
                // Fallback to match on fsPath if we are dealing with files or git schemes
                (uri?.fsPath === this.uri?.fsPath && (uri?.scheme === network_1.Schemas.file || uri?.scheme === 'git') && (this.uri?.scheme === network_1.Schemas.file || this.uri?.scheme === 'git'))) {
                // If the uri hasn't changed, make sure we have valid caches
                for (const source of this.timelineService.getSources()) {
                    if (this.excludedSources.has(source.id)) {
                        continue;
                    }
                    const timeline = this.timelinesBySource.get(source.id);
                    if (timeline !== undefined && !timeline.stale) {
                        continue;
                    }
                    if (timeline !== undefined) {
                        this.updateTimeline(timeline, timeline.requiresReset);
                    }
                    else {
                        this.loadTimelineForSource(source.id, uri, true);
                    }
                }
                return;
            }
            this.setUriCore(uri, false);
        }
        onProvidersChanged(e) {
            if (e.removed) {
                for (const source of e.removed) {
                    this.timelinesBySource.delete(source);
                }
                this.refresh();
            }
            if (e.added) {
                this.loadTimeline(true, e.added);
            }
        }
        onTimelineChanged(e) {
            if (e?.uri === undefined || this.uriIdentityService.extUri.isEqual(e.uri, this.uri)) {
                const timeline = this.timelinesBySource.get(e.id);
                if (timeline === undefined) {
                    return;
                }
                if (this.isBodyVisible()) {
                    this.updateTimeline(timeline, e.reset);
                }
                else {
                    timeline.invalidate(e.reset);
                }
            }
        }
        updateFilename(filename) {
            this._filename = filename;
            if (this.followActiveEditor || !filename) {
                this.updateTitleDescription(filename);
            }
            else {
                this.updateTitleDescription(`${filename} (pinned)`);
            }
        }
        get message() {
            return this._message;
        }
        set message(message) {
            this._message = message;
            this.updateMessage();
        }
        updateMessage() {
            if (this._message !== undefined) {
                this.showMessage(this._message);
            }
            else {
                this.hideMessage();
            }
        }
        showMessage(message) {
            if (!this.$message) {
                return;
            }
            this.$message.classList.remove('hide');
            this.resetMessageElement();
            this.$message.textContent = message;
        }
        hideMessage() {
            this.resetMessageElement();
            this.$message.classList.add('hide');
        }
        resetMessageElement() {
            DOM.clearNode(this.$message);
        }
        get hasVisibleItems() {
            return this._visibleItemCount > 0;
        }
        clear(cancelPending) {
            this._visibleItemCount = 0;
            this._maxItemCount = this.pageSize;
            this.timelinesBySource.clear();
            if (cancelPending) {
                for (const { tokenSource } of this.pendingRequests.values()) {
                    tokenSource.dispose(true);
                }
                this.pendingRequests.clear();
                if (!this.isBodyVisible() && this.tree) {
                    this.tree.setChildren(null, undefined);
                    this._isEmpty = true;
                }
            }
        }
        async loadTimeline(reset, sources) {
            // If we have no source, we are resetting all sources, so cancel everything in flight and reset caches
            if (sources === undefined) {
                if (reset) {
                    this.clear(true);
                }
                // TODO@eamodio: Are these the right the list of schemes to exclude? Is there a better way?
                if (this.uri?.scheme === network_1.Schemas.vscodeSettings || this.uri?.scheme === network_1.Schemas.webviewPanel || this.uri?.scheme === network_1.Schemas.walkThrough) {
                    this.uri = undefined;
                    this.clear(false);
                    this.refresh();
                    return;
                }
                if (this._isEmpty && this.uri !== undefined) {
                    this.setLoadingUriMessage();
                }
            }
            if (this.uri === undefined) {
                this.clear(false);
                this.refresh();
                return;
            }
            if (!this.isBodyVisible()) {
                return;
            }
            let hasPendingRequests = false;
            for (const source of sources ?? this.timelineService.getSources().map(s => s.id)) {
                const requested = this.loadTimelineForSource(source, this.uri, reset);
                if (requested) {
                    hasPendingRequests = true;
                }
            }
            if (!hasPendingRequests) {
                this.refresh();
            }
            else if (this._isEmpty) {
                this.setLoadingUriMessage();
            }
        }
        loadTimelineForSource(source, uri, reset, options) {
            if (this.excludedSources.has(source)) {
                return false;
            }
            const timeline = this.timelinesBySource.get(source);
            // If we are paging, and there are no more items or we have enough cached items to cover the next page,
            // don't bother querying for more
            if (!reset &&
                options?.cursor !== undefined &&
                timeline !== undefined &&
                (!timeline?.more || timeline.items.length > timeline.lastRenderedIndex + this.pageSize)) {
                return false;
            }
            if (options === undefined) {
                options = { cursor: reset ? undefined : timeline?.cursor, limit: this.pageSize };
            }
            let request = this.pendingRequests.get(source);
            if (request !== undefined) {
                options.cursor = request.options.cursor;
                // TODO@eamodio deal with concurrent requests better
                if (typeof options.limit === 'number') {
                    if (typeof request.options.limit === 'number') {
                        options.limit += request.options.limit;
                    }
                    else {
                        options.limit = request.options.limit;
                    }
                }
            }
            request?.tokenSource.dispose(true);
            options.cacheResults = true;
            options.resetCache = reset;
            request = this.timelineService.getTimeline(source, uri, options, new cancellation_1.CancellationTokenSource());
            if (request === undefined) {
                return false;
            }
            this.pendingRequests.set(source, request);
            request.tokenSource.token.onCancellationRequested(() => this.pendingRequests.delete(source));
            this.handleRequest(request);
            return true;
        }
        updateTimeline(timeline, reset) {
            if (reset) {
                this.timelinesBySource.delete(timeline.source);
                // Override the limit, to re-query for all our existing cached (possibly visible) items to keep visual continuity
                const { oldest } = timeline;
                this.loadTimelineForSource(timeline.source, this.uri, true, oldest !== undefined ? { limit: { timestamp: oldest.timestamp, id: oldest.id } } : undefined);
            }
            else {
                // Override the limit, to query for any newer items
                const { newest } = timeline;
                this.loadTimelineForSource(timeline.source, this.uri, false, newest !== undefined ? { limit: { timestamp: newest.timestamp, id: newest.id } } : { limit: this.pageSize });
            }
        }
        async handleRequest(request) {
            let response;
            try {
                response = await this.progressService.withProgress({ location: this.id }, () => request.result);
            }
            finally {
                this.pendingRequests.delete(request.source);
            }
            if (response === undefined ||
                request.tokenSource.token.isCancellationRequested ||
                request.uri !== this.uri) {
                if (this.pendingRequests.size === 0 && this._pendingRefresh) {
                    this.refresh();
                }
                return;
            }
            const source = request.source;
            let updated = false;
            const timeline = this.timelinesBySource.get(source);
            if (timeline === undefined) {
                this.timelinesBySource.set(source, new TimelineAggregate(response));
                updated = true;
            }
            else {
                updated = timeline.add(response, request.options);
            }
            if (updated) {
                this._pendingRefresh = true;
                // If we have visible items already and there are other pending requests, debounce for a bit to wait for other requests
                if (this.hasVisibleItems && this.pendingRequests.size !== 0) {
                    this.refreshDebounced();
                }
                else {
                    this.refresh();
                }
            }
            else if (this.pendingRequests.size === 0) {
                if (this._pendingRefresh) {
                    this.refresh();
                }
                else {
                    this.tree.rerender();
                }
            }
        }
        *getItems() {
            let more = false;
            if (this.uri === undefined || this.timelinesBySource.size === 0) {
                this._visibleItemCount = 0;
                return;
            }
            const maxCount = this._maxItemCount;
            let count = 0;
            if (this.timelinesBySource.size === 1) {
                const [source, timeline] = iterator_1.Iterable.first(this.timelinesBySource);
                timeline.lastRenderedIndex = -1;
                if (this.excludedSources.has(source)) {
                    this._visibleItemCount = 0;
                    return;
                }
                if (timeline.items.length !== 0) {
                    // If we have any items, just say we have one for now -- the real count will be updated below
                    this._visibleItemCount = 1;
                }
                more = timeline.more;
                let lastRelativeTime;
                for (const item of timeline.items) {
                    item.relativeTime = undefined;
                    item.hideRelativeTime = undefined;
                    count++;
                    if (count > maxCount) {
                        more = true;
                        break;
                    }
                    lastRelativeTime = updateRelativeTime(item, lastRelativeTime);
                    yield { element: item };
                }
                timeline.lastRenderedIndex = count - 1;
            }
            else {
                const sources = [];
                let hasAnyItems = false;
                let mostRecentEnd = 0;
                for (const [source, timeline] of this.timelinesBySource) {
                    timeline.lastRenderedIndex = -1;
                    if (this.excludedSources.has(source) || timeline.stale) {
                        continue;
                    }
                    if (timeline.items.length !== 0) {
                        hasAnyItems = true;
                    }
                    if (timeline.more) {
                        more = true;
                        const last = timeline.items[Math.min(maxCount, timeline.items.length - 1)];
                        if (last.timestamp > mostRecentEnd) {
                            mostRecentEnd = last.timestamp;
                        }
                    }
                    const iterator = timeline.items[Symbol.iterator]();
                    sources.push({ timeline: timeline, iterator: iterator, nextItem: iterator.next() });
                }
                this._visibleItemCount = hasAnyItems ? 1 : 0;
                function getNextMostRecentSource() {
                    return sources
                        .filter(source => !source.nextItem.done)
                        .reduce((previous, current) => (previous === undefined || current.nextItem.value.timestamp >= previous.nextItem.value.timestamp) ? current : previous, undefined);
                }
                let lastRelativeTime;
                let nextSource;
                while (nextSource = getNextMostRecentSource()) {
                    nextSource.timeline.lastRenderedIndex++;
                    const item = nextSource.nextItem.value;
                    item.relativeTime = undefined;
                    item.hideRelativeTime = undefined;
                    if (item.timestamp >= mostRecentEnd) {
                        count++;
                        if (count > maxCount) {
                            more = true;
                            break;
                        }
                        lastRelativeTime = updateRelativeTime(item, lastRelativeTime);
                        yield { element: item };
                    }
                    nextSource.nextItem = nextSource.iterator.next();
                }
            }
            this._visibleItemCount = count;
            if (count > 0) {
                if (more) {
                    yield {
                        element: new LoadMoreCommand(this.pendingRequests.size !== 0)
                    };
                }
                else if (this.pendingRequests.size !== 0) {
                    yield {
                        element: new LoadMoreCommand(true)
                    };
                }
            }
        }
        refresh() {
            if (!this.isBodyVisible()) {
                return;
            }
            this.tree.setChildren(null, this.getItems());
            this._isEmpty = !this.hasVisibleItems;
            if (this.uri === undefined) {
                this.updateFilename(undefined);
                this.message = (0, nls_1.localize)('timeline.editorCannotProvideTimeline', "The active editor cannot provide timeline information.");
            }
            else if (this._isEmpty) {
                if (this.pendingRequests.size !== 0) {
                    this.setLoadingUriMessage();
                }
                else {
                    this.updateFilename(this.labelService.getUriBasenameLabel(this.uri));
                    const scmProviderCount = this.contextKeyService.getContextKeyValue('scm.providerCount');
                    if (this.timelineService.getSources().filter(({ id }) => !this.excludedSources.has(id)).length === 0) {
                        this.message = (0, nls_1.localize)('timeline.noTimelineSourcesEnabled', "All timeline sources have been filtered out.");
                    }
                    else {
                        if (this.configurationService.getValue('workbench.localHistory.enabled') && !this.excludedSources.has('timeline.localHistory')) {
                            this.message = (0, nls_1.localize)('timeline.noLocalHistoryYet', "Local History will track recent changes as you save them unless the file has been excluded or is too large.");
                        }
                        else if (this.excludedSources.size > 0) {
                            this.message = (0, nls_1.localize)('timeline.noTimelineInfoFromEnabledSources', "No filtered timeline information was provided.");
                        }
                        else {
                            this.message = (0, nls_1.localize)('timeline.noTimelineInfo', "No timeline information was provided.");
                        }
                    }
                    if (!scmProviderCount || scmProviderCount === 0) {
                        this.message += ' ' + (0, nls_1.localize)('timeline.noSCM', "Source Control has not been configured.");
                    }
                }
            }
            else {
                this.updateFilename(this.labelService.getUriBasenameLabel(this.uri));
                this.message = undefined;
            }
            this._pendingRefresh = false;
        }
        refreshDebounced() {
            this.refresh();
        }
        focus() {
            super.focus();
            this.tree.domFocus();
        }
        setExpanded(expanded) {
            const changed = super.setExpanded(expanded);
            if (changed && this.isBodyVisible()) {
                if (!this.followActiveEditor) {
                    this.setUriCore(this.uri, true);
                }
                else {
                    this.onActiveEditorChanged();
                }
            }
            return changed;
        }
        setVisible(visible) {
            if (visible) {
                this.extensionService.activateByEvent('onView:timeline');
                this.visibilityDisposables = new lifecycle_1.DisposableStore();
                this.editorService.onDidActiveEditorChange(this.onActiveEditorChanged, this, this.visibilityDisposables);
                // Refresh the view on focus to update the relative timestamps
                this.onDidFocus(() => this.refreshDebounced(), this, this.visibilityDisposables);
                super.setVisible(visible);
                this.onActiveEditorChanged();
            }
            else {
                this.visibilityDisposables?.dispose();
                super.setVisible(visible);
            }
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.tree.layout(height, width);
        }
        renderHeaderTitle(container) {
            super.renderHeaderTitle(container, this.title);
            container.classList.add('timeline-view');
        }
        renderBody(container) {
            super.renderBody(container);
            this.$container = container;
            container.classList.add('tree-explorer-viewlet-tree-view', 'timeline-tree-view');
            this.$message = DOM.append(this.$container, DOM.$('.message'));
            this.$message.classList.add('timeline-subtle');
            this.message = (0, nls_1.localize)('timeline.editorCannotProvideTimeline', "The active editor cannot provide timeline information.");
            this.$tree = document.createElement('div');
            this.$tree.classList.add('customview-tree', 'file-icon-themable-tree', 'hide-arrows');
            // this.treeElement.classList.add('show-file-icons');
            container.appendChild(this.$tree);
            this.treeRenderer = this.instantiationService.createInstance(TimelineTreeRenderer, this.commands);
            this.treeRenderer.onDidScrollToEnd(item => {
                if (this.pageOnScroll) {
                    this.loadMore(item);
                }
            });
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchObjectTree, 'TimelinePane', this.$tree, new TimelineListVirtualDelegate(), [this.treeRenderer], {
                identityProvider: new TimelineIdentityProvider(),
                accessibilityProvider: {
                    getAriaLabel(element) {
                        if (isLoadMoreCommand(element)) {
                            return element.ariaLabel;
                        }
                        return element.accessibilityInformation ? element.accessibilityInformation.label : (0, nls_1.localize)('timeline.aria.item', "{0}: {1}", element.relativeTimeFullWord ?? '', element.label);
                    },
                    getRole(element) {
                        if (isLoadMoreCommand(element)) {
                            return 'treeitem';
                        }
                        return element.accessibilityInformation && element.accessibilityInformation.role ? element.accessibilityInformation.role : 'treeitem';
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)('timeline', "Timeline");
                    }
                },
                keyboardNavigationLabelProvider: new TimelineKeyboardNavigationLabelProvider(),
                multipleSelectionSupport: false,
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            this._register(this.tree.onContextMenu(e => this.onContextMenu(this.commands, e)));
            this._register(this.tree.onDidChangeSelection(e => this.ensureValidItems()));
            this._register(this.tree.onDidOpen(e => {
                if (!e.browserEvent || !this.ensureValidItems()) {
                    return;
                }
                const selection = this.tree.getSelection();
                let item;
                if (selection.length === 1) {
                    item = selection[0];
                }
                if (item === null) {
                    return;
                }
                if (isTimelineItem(item)) {
                    if (item.command) {
                        let args = item.command.arguments ?? [];
                        if (item.command.id === editorCommands_1.API_OPEN_EDITOR_COMMAND_ID || item.command.id === editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID) {
                            // Some commands owned by us should receive the
                            // `IOpenEvent` as context to open properly
                            args = [...args, e];
                        }
                        this.commandService.executeCommand(item.command.id, ...args);
                    }
                }
                else if (isLoadMoreCommand(item)) {
                    this.loadMore(item);
                }
            }));
        }
        loadMore(item) {
            if (item.loading) {
                return;
            }
            item.loading = true;
            this.tree.rerender(item);
            if (this.pendingRequests.size !== 0) {
                return;
            }
            this._maxItemCount = this._visibleItemCount + this.pageSize;
            this.loadTimeline(false);
        }
        ensureValidItems() {
            // If we don't have any non-excluded timelines, clear the tree and show the loading message
            if (!this.hasVisibleItems || !this.timelineService.getSources().some(({ id }) => !this.excludedSources.has(id) && this.timelinesBySource.has(id))) {
                this.tree.setChildren(null, undefined);
                this._isEmpty = true;
                this.setLoadingUriMessage();
                return false;
            }
            return true;
        }
        setLoadingUriMessage() {
            const file = this.uri && this.labelService.getUriBasenameLabel(this.uri);
            this.updateFilename(file);
            this.message = file ? (0, nls_1.localize)('timeline.loading', "Loading timeline for {0}...", file) : '';
        }
        onContextMenu(commands, treeEvent) {
            const item = treeEvent.element;
            if (item === null) {
                return;
            }
            const event = treeEvent.browserEvent;
            event.preventDefault();
            event.stopPropagation();
            if (!this.ensureValidItems()) {
                return;
            }
            this.tree.setFocus([item]);
            const actions = commands.getItemContextActions(item);
            if (!actions.length) {
                return;
            }
            this.contextMenuService.showContextMenu({
                getAnchor: () => treeEvent.anchor,
                getActions: () => actions,
                getActionViewItem: (action) => {
                    const keybinding = this.keybindingService.lookupKeybinding(action.id);
                    if (keybinding) {
                        return new actionViewItems_1.ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
                    }
                    return undefined;
                },
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.tree.domFocus();
                    }
                },
                getActionsContext: () => ({ uri: this.uri, item: item }),
                actionRunner: new TimelineActionRunner()
            });
        }
    };
    exports.TimelinePane = TimelinePane;
    __decorate([
        (0, decorators_1.debounce)(500)
    ], TimelinePane.prototype, "refreshDebounced", null);
    exports.TimelinePane = TimelinePane = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, storage_1.IStorageService),
        __param(6, views_1.IViewDescriptorService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, editorService_1.IEditorService),
        __param(9, commands_1.ICommandService),
        __param(10, progress_1.IProgressService),
        __param(11, timeline_1.ITimelineService),
        __param(12, opener_1.IOpenerService),
        __param(13, themeService_1.IThemeService),
        __param(14, telemetry_1.ITelemetryService),
        __param(15, label_1.ILabelService),
        __param(16, uriIdentity_1.IUriIdentityService),
        __param(17, extensions_1.IExtensionService)
    ], TimelinePane);
    class TimelineElementTemplate {
        static { this.id = 'TimelineElementTemplate'; }
        constructor(container, actionViewItemProvider, hoverDelegate) {
            container.classList.add('custom-view-tree-node-item');
            this.icon = DOM.append(container, DOM.$('.custom-view-tree-node-item-icon'));
            this.iconLabel = new iconLabel_1.IconLabel(container, { supportHighlights: true, supportIcons: true, hoverDelegate: hoverDelegate });
            const timestampContainer = DOM.append(this.iconLabel.element, DOM.$('.timeline-timestamp-container'));
            this.timestamp = DOM.append(timestampContainer, DOM.$('span.timeline-timestamp'));
            const actionsContainer = DOM.append(this.iconLabel.element, DOM.$('.actions'));
            this.actionBar = new actionbar_1.ActionBar(actionsContainer, { actionViewItemProvider: actionViewItemProvider });
        }
        dispose() {
            this.iconLabel.dispose();
            this.actionBar.dispose();
        }
        reset() {
            this.icon.className = '';
            this.icon.style.backgroundImage = '';
            this.actionBar.clear();
        }
    }
    class TimelineIdentityProvider {
        getId(item) {
            return item.handle;
        }
    }
    exports.TimelineIdentityProvider = TimelineIdentityProvider;
    class TimelineActionRunner extends actions_1.ActionRunner {
        async runAction(action, { uri, item }) {
            if (!isTimelineItem(item)) {
                // TODO@eamodio do we need to do anything else?
                await action.run();
                return;
            }
            await action.run({
                $mid: 12 /* MarshalledId.TimelineActionContext */,
                handle: item.handle,
                source: item.source,
                uri: uri
            }, uri, item.source);
        }
    }
    class TimelineKeyboardNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            return element.label;
        }
    }
    exports.TimelineKeyboardNavigationLabelProvider = TimelineKeyboardNavigationLabelProvider;
    class TimelineListVirtualDelegate {
        getHeight(_element) {
            return ItemHeight;
        }
        getTemplateId(element) {
            return TimelineElementTemplate.id;
        }
    }
    exports.TimelineListVirtualDelegate = TimelineListVirtualDelegate;
    let TimelineTreeRenderer = class TimelineTreeRenderer {
        constructor(commands, instantiationService, themeService, hoverService, configurationService) {
            this.commands = commands;
            this.instantiationService = instantiationService;
            this.themeService = themeService;
            this.hoverService = hoverService;
            this.configurationService = configurationService;
            this._onDidScrollToEnd = new event_1.Emitter();
            this.onDidScrollToEnd = this._onDidScrollToEnd.event;
            this.templateId = TimelineElementTemplate.id;
            this.actionViewItemProvider = menuEntryActionViewItem_1.createActionViewItem.bind(undefined, this.instantiationService);
            this._hoverDelegate = {
                showHover: (options) => this.hoverService.showHover(options),
                delay: this.configurationService.getValue('workbench.hover.delay')
            };
        }
        setUri(uri) {
            this.uri = uri;
        }
        renderTemplate(container) {
            return new TimelineElementTemplate(container, this.actionViewItemProvider, this._hoverDelegate);
        }
        renderElement(node, index, template, height) {
            template.reset();
            const { element: item } = node;
            const theme = this.themeService.getColorTheme();
            const icon = theme.type === theme_1.ColorScheme.LIGHT ? item.icon : item.iconDark;
            const iconUrl = icon ? uri_1.URI.revive(icon) : null;
            if (iconUrl) {
                template.icon.className = 'custom-view-tree-node-item-icon';
                template.icon.style.backgroundImage = DOM.asCSSUrl(iconUrl);
                template.icon.style.color = '';
            }
            else if (item.themeIcon) {
                template.icon.className = `custom-view-tree-node-item-icon ${themables_1.ThemeIcon.asClassName(item.themeIcon)}`;
                if (item.themeIcon.color) {
                    template.icon.style.color = theme.getColor(item.themeIcon.color.id)?.toString() ?? '';
                }
                else {
                    template.icon.style.color = '';
                }
                template.icon.style.backgroundImage = '';
            }
            else {
                template.icon.className = 'custom-view-tree-node-item-icon';
                template.icon.style.backgroundImage = '';
                template.icon.style.color = '';
            }
            const tooltip = item.tooltip
                ? (0, types_1.isString)(item.tooltip)
                    ? item.tooltip
                    : { markdown: item.tooltip, markdownNotSupportedFallback: (0, markdownRenderer_1.renderMarkdownAsPlaintext)(item.tooltip) }
                : undefined;
            template.iconLabel.setLabel(item.label, item.description, {
                title: tooltip,
                matches: (0, filters_1.createMatches)(node.filterData)
            });
            template.timestamp.textContent = item.relativeTime ?? '';
            template.timestamp.ariaLabel = item.relativeTimeFullWord ?? '';
            template.timestamp.parentElement.classList.toggle('timeline-timestamp--duplicate', isTimelineItem(item) && item.hideRelativeTime);
            template.actionBar.context = { uri: this.uri, item: item };
            template.actionBar.actionRunner = new TimelineActionRunner();
            template.actionBar.push(this.commands.getItemActions(item), { icon: true, label: false });
            // If we are rendering the load more item, we've scrolled to the end, so trigger an event
            if (isLoadMoreCommand(item)) {
                setTimeout(() => this._onDidScrollToEnd.fire(item), 0);
            }
        }
        disposeTemplate(template) {
            template.dispose();
        }
    };
    TimelineTreeRenderer = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, themeService_1.IThemeService),
        __param(3, hover_1.IHoverService),
        __param(4, configuration_1.IConfigurationService)
    ], TimelineTreeRenderer);
    const timelineRefresh = (0, iconRegistry_1.registerIcon)('timeline-refresh', codicons_1.Codicon.refresh, (0, nls_1.localize)('timelineRefresh', 'Icon for the refresh timeline action.'));
    const timelinePin = (0, iconRegistry_1.registerIcon)('timeline-pin', codicons_1.Codicon.pin, (0, nls_1.localize)('timelinePin', 'Icon for the pin timeline action.'));
    const timelineUnpin = (0, iconRegistry_1.registerIcon)('timeline-unpin', codicons_1.Codicon.pinned, (0, nls_1.localize)('timelineUnpin', 'Icon for the unpin timeline action.'));
    let TimelinePaneCommands = class TimelinePaneCommands extends lifecycle_1.Disposable {
        constructor(pane, timelineService, storageService, contextKeyService, menuService) {
            super();
            this.pane = pane;
            this.timelineService = timelineService;
            this.storageService = storageService;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this._register(this.sourceDisposables = new lifecycle_1.DisposableStore());
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'timeline.refresh',
                        title: (0, nls_1.localize2)('refresh', "Refresh"),
                        icon: timelineRefresh,
                        category: (0, nls_1.localize2)('timeline', "Timeline"),
                        menu: {
                            id: actions_2.MenuId.TimelineTitle,
                            group: 'navigation',
                            order: 99,
                        }
                    });
                }
                run(accessor, ...args) {
                    pane.reset();
                }
            }));
            this._register(commands_1.CommandsRegistry.registerCommand('timeline.toggleFollowActiveEditor', (accessor, ...args) => pane.followActiveEditor = !pane.followActiveEditor));
            this._register(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TimelineTitle, ({
                command: {
                    id: 'timeline.toggleFollowActiveEditor',
                    title: (0, nls_1.localize2)('timeline.toggleFollowActiveEditorCommand.follow', 'Pin the Current Timeline'),
                    icon: timelinePin,
                    category: (0, nls_1.localize2)('timeline', "Timeline"),
                },
                group: 'navigation',
                order: 98,
                when: exports.TimelineFollowActiveEditorContext
            })));
            this._register(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TimelineTitle, ({
                command: {
                    id: 'timeline.toggleFollowActiveEditor',
                    title: (0, nls_1.localize2)('timeline.toggleFollowActiveEditorCommand.unfollow', 'Unpin the Current Timeline'),
                    icon: timelineUnpin,
                    category: (0, nls_1.localize2)('timeline', "Timeline"),
                },
                group: 'navigation',
                order: 98,
                when: exports.TimelineFollowActiveEditorContext.toNegated()
            })));
            this._register(timelineService.onDidChangeProviders(() => this.updateTimelineSourceFilters()));
            this.updateTimelineSourceFilters();
        }
        getItemActions(element) {
            return this.getActions(actions_2.MenuId.TimelineItemContext, { key: 'timelineItem', value: element.contextValue }).primary;
        }
        getItemContextActions(element) {
            return this.getActions(actions_2.MenuId.TimelineItemContext, { key: 'timelineItem', value: element.contextValue }).secondary;
        }
        getActions(menuId, context) {
            const contextKeyService = this.contextKeyService.createOverlay([
                ['view', this.pane.id],
                [context.key, context.value],
            ]);
            const menu = this.menuService.createMenu(menuId, contextKeyService);
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, result, 'inline');
            menu.dispose();
            return result;
        }
        updateTimelineSourceFilters() {
            this.sourceDisposables.clear();
            const excluded = new Set(JSON.parse(this.storageService.get('timeline.excludeSources', 0 /* StorageScope.PROFILE */, '[]')));
            for (const source of this.timelineService.getSources()) {
                this.sourceDisposables.add((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                    constructor() {
                        super({
                            id: `timeline.toggleExcludeSource:${source.id}`,
                            title: source.label,
                            menu: {
                                id: actions_2.MenuId.TimelineFilterSubMenu,
                                group: 'navigation',
                            },
                            toggled: contextkey_1.ContextKeyExpr.regex(`timelineExcludeSources`, new RegExp(`\\b${(0, strings_1.escapeRegExpCharacters)(source.id)}\\b`)).negate()
                        });
                    }
                    run(accessor, ...args) {
                        if (excluded.has(source.id)) {
                            excluded.delete(source.id);
                        }
                        else {
                            excluded.add(source.id);
                        }
                        const storageService = accessor.get(storage_1.IStorageService);
                        storageService.store('timeline.excludeSources', JSON.stringify([...excluded.keys()]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                    }
                }));
            }
        }
    };
    TimelinePaneCommands = __decorate([
        __param(1, timeline_1.ITimelineService),
        __param(2, storage_1.IStorageService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, actions_2.IMenuService)
    ], TimelinePaneCommands);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmVQYW5lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90aW1lbGluZS9icm93c2VyL3RpbWVsaW5lUGFuZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3RGhHLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUl0QixTQUFTLGlCQUFpQixDQUFDLElBQTZCO1FBQ3ZELE9BQU8sSUFBSSxZQUFZLGVBQWUsQ0FBQztJQUN4QyxDQUFDO0lBRUQsU0FBUyxjQUFjLENBQUMsSUFBNkI7UUFDcEQsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLElBQUksS0FBSyxDQUFDO0lBQzdELENBQUM7SUFFRCxTQUFTLGtCQUFrQixDQUFDLElBQWtCLEVBQUUsZ0JBQW9DO1FBQ25GLElBQUksQ0FBQyxZQUFZLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUMvRSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3BHLElBQUksZ0JBQWdCLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssZ0JBQWdCLEVBQUUsQ0FBQztZQUM5RSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFDL0IsQ0FBQzthQUFNLENBQUM7WUFD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