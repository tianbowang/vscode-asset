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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/workbench/browser/part", "vs/base/browser/touch", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/contextview/browser/contextView", "vs/base/common/actions", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/workspace/common/workspace", "vs/platform/theme/common/colorRegistry", "vs/base/browser/dom", "vs/platform/storage/common/storage", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/extensions", "vs/base/common/arrays", "vs/base/browser/mouseEvent", "vs/workbench/browser/actions/layoutActions", "vs/base/common/types", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/theme", "vs/base/common/hash", "vs/platform/hover/browser/hover", "vs/platform/configuration/common/configuration", "vs/workbench/browser/parts/statusbar/statusbarActions", "vs/workbench/browser/parts/statusbar/statusbarModel", "vs/workbench/browser/parts/statusbar/statusbarItem", "vs/workbench/common/contextkeys", "vs/base/common/event", "vs/css!./media/statusbarpart"], function (require, exports, nls_1, lifecycle_1, part_1, touch_1, instantiation_1, statusbar_1, contextView_1, actions_1, themeService_1, theme_1, workspace_1, colorRegistry_1, dom_1, storage_1, layoutService_1, extensions_1, arrays_1, mouseEvent_1, layoutActions_1, types_1, contextkey_1, theme_2, hash_1, hover_1, configuration_1, statusbarActions_1, statusbarModel_1, statusbarItem_1, contextkeys_1, event_1) {
    "use strict";
    var StatusbarPart_1, AuxiliaryStatusbarPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScopedStatusbarService = exports.StatusbarService = exports.AuxiliaryStatusbarPart = exports.MainStatusbarPart = void 0;
    let StatusbarPart = class StatusbarPart extends part_1.Part {
        static { StatusbarPart_1 = this; }
        static { this.HEIGHT = 22; }
        constructor(id, instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService, hoverService, configurationService) {
            super(id, { hasTitle: false }, themeService, storageService, layoutService);
            this.instantiationService = instantiationService;
            this.contextService = contextService;
            this.storageService = storageService;
            this.contextMenuService = contextMenuService;
            this.contextKeyService = contextKeyService;
            this.hoverService = hoverService;
            this.configurationService = configurationService;
            //#region IView
            this.minimumWidth = 0;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this.minimumHeight = StatusbarPart_1.HEIGHT;
            this.maximumHeight = StatusbarPart_1.HEIGHT;
            this.pendingEntries = [];
            this.viewModel = this._register(new statusbarModel_1.StatusbarViewModel(this.storageService));
            this.onDidChangeEntryVisibility = this.viewModel.onDidChangeEntryVisibility;
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this.hoverDelegate = new class {
                get delay() {
                    if (Date.now() - this.lastHoverHideTime < 200) {
                        return 0; // show instantly when a hover was recently shown
                    }
                    return this.configurationService.getValue('workbench.hover.delay');
                }
                constructor(configurationService, hoverService) {
                    this.configurationService = configurationService;
                    this.hoverService = hoverService;
                    this.lastHoverHideTime = 0;
                    this.placement = 'element';
                }
                showHover(options, focus) {
                    return this.hoverService.showHover({
                        ...options,
                        persistence: {
                            hideOnKeyDown: true,
                            sticky: focus
                        }
                    }, focus);
                }
                onDidHideHover() {
                    this.lastHoverHideTime = Date.now();
                }
            }(this.configurationService, this.hoverService);
            this.compactEntriesDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.styleOverrides = new Set();
            this.registerListeners();
        }
        registerListeners() {
            // Entry visibility changes
            this._register(this.onDidChangeEntryVisibility(() => this.updateCompactEntries()));
            // Workbench state changes
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.updateStyles()));
        }
        addEntry(entry, id, alignment, priorityOrLocation = 0) {
            let priority;
            if ((0, statusbar_1.isStatusbarEntryPriority)(priorityOrLocation)) {
                priority = priorityOrLocation;
            }
            else {
                priority = {
                    primary: priorityOrLocation,
                    secondary: (0, hash_1.hash)(id) // derive from identifier to accomplish uniqueness
                };
            }
            // As long as we have not been created into a container yet, record all entries
            // that are pending so that they can get created at a later point
            if (!this.element) {
                return this.doAddPendingEntry(entry, id, alignment, priority);
            }
            // Otherwise add to view
            return this.doAddEntry(entry, id, alignment, priority);
        }
        doAddPendingEntry(entry, id, alignment, priority) {
            const pendingEntry = { entry, id, alignment, priority };
            this.pendingEntries.push(pendingEntry);
            const accessor = {
                update: (entry) => {
                    if (pendingEntry.accessor) {
                        pendingEntry.accessor.update(entry);
                    }
                    else {
                        pendingEntry.entry = entry;
                    }
                },
                dispose: () => {
                    if (pendingEntry.accessor) {
                        pendingEntry.accessor.dispose();
                    }
                    else {
                        this.pendingEntries = this.pendingEntries.filter(entry => entry !== pendingEntry);
                    }
                }
            };
            return accessor;
        }
        doAddEntry(entry, id, alignment, priority) {
            // View model item
            const itemContainer = this.doCreateStatusItem(id, alignment);
            const item = this.instantiationService.createInstance(statusbarItem_1.StatusbarEntryItem, itemContainer, entry, this.hoverDelegate);
            // View model entry
            const viewModelEntry = new class {
                constructor() {
                    this.id = id;
                    this.alignment = alignment;
                    this.priority = priority;
                    this.container = itemContainer;
                    this.labelContainer = item.labelContainer;
                }
                get name() { return item.name; }
                get hasCommand() { return item.hasCommand; }
            };
            // Add to view model
            const { needsFullRefresh } = this.doAddOrRemoveModelEntry(viewModelEntry, true);
            if (needsFullRefresh) {
                this.appendStatusbarEntries();
            }
            else {
                this.appendStatusbarEntry(viewModelEntry);
            }
            return {
                update: entry => {
                    item.update(entry);
                },
                dispose: () => {
                    const { needsFullRefresh } = this.doAddOrRemoveModelEntry(viewModelEntry, false);
                    if (needsFullRefresh) {
                        this.appendStatusbarEntries();
                    }
                    else {
                        itemContainer.remove();
                    }
                    (0, lifecycle_1.dispose)(item);
                }
            };
        }
        doCreateStatusItem(id, alignment, ...extraClasses) {
            const itemContainer = document.createElement('div');
            itemContainer.id = id;
            itemContainer.classList.add('statusbar-item');
            if (extraClasses) {
                itemContainer.classList.add(...extraClasses);
            }
            if (alignment === 1 /* StatusbarAlignment.RIGHT */) {
                itemContainer.classList.add('right');
            }
            else {
                itemContainer.classList.add('left');
            }
            return itemContainer;
        }
        doAddOrRemoveModelEntry(entry, add) {
            // Update model but remember previous entries
            const entriesBefore = this.viewModel.entries;
            if (add) {
                this.viewModel.add(entry);
            }
            else {
                this.viewModel.remove(entry);
            }
            const entriesAfter = this.viewModel.entries;
            // Apply operation onto the entries from before
            if (add) {
                entriesBefore.splice(entriesAfter.indexOf(entry), 0, entry);
            }
            else {
                entriesBefore.splice(entriesBefore.indexOf(entry), 1);
            }
            // Figure out if a full refresh is needed by comparing arrays
            const needsFullRefresh = !(0, arrays_1.equals)(entriesBefore, entriesAfter);
            return { needsFullRefresh };
        }
        isEntryVisible(id) {
            return !this.viewModel.isHidden(id);
        }
        updateEntryVisibility(id, visible) {
            if (visible) {
                this.viewModel.show(id);
            }
            else {
                this.viewModel.hide(id);
            }
        }
        focusNextEntry() {
            this.viewModel.focusNextEntry();
        }
        focusPreviousEntry() {
            this.viewModel.focusPreviousEntry();
        }
        isEntryFocused() {
            return this.viewModel.isEntryFocused();
        }
        focus(preserveEntryFocus = true) {
            this.getContainer()?.focus();
            const lastFocusedEntry = this.viewModel.lastFocusedEntry;
            if (preserveEntryFocus && lastFocusedEntry) {
                setTimeout(() => lastFocusedEntry.labelContainer.focus(), 0); // Need a timeout, for some reason without it the inner label container will not get focused
            }
        }
        createContentArea(parent) {
            this.element = parent;
            // Track focus within container
            const scopedContextKeyService = this.contextKeyService.createScoped(this.element);
            contextkeys_1.StatusBarFocused.bindTo(scopedContextKeyService).set(true);
            // Left items container
            this.leftItemsContainer = document.createElement('div');
            this.leftItemsContainer.classList.add('left-items', 'items-container');
            this.element.appendChild(this.leftItemsContainer);
            this.element.tabIndex = 0;
            // Right items container
            this.rightItemsContainer = document.createElement('div');
            this.rightItemsContainer.classList.add('right-items', 'items-container');
            this.element.appendChild(this.rightItemsContainer);
            // Context menu support
            this._register((0, dom_1.addDisposableListener)(parent, dom_1.EventType.CONTEXT_MENU, e => this.showContextMenu(e)));
            this._register(touch_1.Gesture.addTarget(parent));
            this._register((0, dom_1.addDisposableListener)(parent, touch_1.EventType.Contextmenu, e => this.showContextMenu(e)));
            // Initial status bar entries
            this.createInitialStatusbarEntries();
            return this.element;
        }
        createInitialStatusbarEntries() {
            // Add items in order according to alignment
            this.appendStatusbarEntries();
            // Fill in pending entries if any
            while (this.pendingEntries.length) {
                const pending = this.pendingEntries.shift();
                if (pending) {
                    pending.accessor = this.addEntry(pending.entry, pending.id, pending.alignment, pending.priority.primary);
                }
            }
        }
        appendStatusbarEntries() {
            const leftItemsContainer = (0, types_1.assertIsDefined)(this.leftItemsContainer);
            const rightItemsContainer = (0, types_1.assertIsDefined)(this.rightItemsContainer);
            // Clear containers
            (0, dom_1.clearNode)(leftItemsContainer);
            (0, dom_1.clearNode)(rightItemsContainer);
            // Append all
            for (const entry of [
                ...this.viewModel.getEntries(0 /* StatusbarAlignment.LEFT */),
                ...this.viewModel.getEntries(1 /* StatusbarAlignment.RIGHT */).reverse() // reversing due to flex: row-reverse
            ]) {
                const target = entry.alignment === 0 /* StatusbarAlignment.LEFT */ ? leftItemsContainer : rightItemsContainer;
                target.appendChild(entry.container);
            }
            // Update compact entries
            this.updateCompactEntries();
        }
        appendStatusbarEntry(entry) {
            const entries = this.viewModel.getEntries(entry.alignment);
            if (entry.alignment === 1 /* StatusbarAlignment.RIGHT */) {
                entries.reverse(); // reversing due to flex: row-reverse
            }
            const target = (0, types_1.assertIsDefined)(entry.alignment === 0 /* StatusbarAlignment.LEFT */ ? this.leftItemsContainer : this.rightItemsContainer);
            const index = entries.indexOf(entry);
            if (index + 1 === entries.length) {
                target.appendChild(entry.container); // append at the end if last
            }
            else {
                target.insertBefore(entry.container, entries[index + 1].container); // insert before next element otherwise
            }
            // Update compact entries
            this.updateCompactEntries();
        }
        updateCompactEntries() {
            const entries = this.viewModel.entries;
            // Find visible entries and clear compact related CSS classes if any
            const mapIdToVisibleEntry = new Map();
            for (const entry of entries) {
                if (!this.viewModel.isHidden(entry.id)) {
                    mapIdToVisibleEntry.set(entry.id, entry);
                }
                entry.container.classList.remove('compact-left', 'compact-right');
            }
            // Figure out groups of entries with `compact` alignment
            const compactEntryGroups = new Map();
            for (const entry of mapIdToVisibleEntry.values()) {
                if ((0, statusbar_1.isStatusbarEntryLocation)(entry.priority.primary) && // entry references another entry as location
                    entry.priority.primary.compact // entry wants to be compact
                ) {
                    const locationId = entry.priority.primary.id;
                    const location = mapIdToVisibleEntry.get(locationId);
                    if (!location) {
                        continue; // skip if location does not exist
                    }
                    // Build a map of entries that are compact among each other
                    let compactEntryGroup = compactEntryGroups.get(locationId);
                    if (!compactEntryGroup) {
                        compactEntryGroup = new Set([entry, location]);
                        compactEntryGroups.set(locationId, compactEntryGroup);
                    }
                    else {
                        compactEntryGroup.add(entry);
                    }
                    // Adjust CSS classes to move compact items closer together
                    if (entry.priority.primary.alignment === 0 /* StatusbarAlignment.LEFT */) {
                        location.container.classList.add('compact-left');
                        entry.container.classList.add('compact-right');
                    }
                    else {
                        location.container.classList.add('compact-right');
                        entry.container.classList.add('compact-left');
                    }
                }
            }
            // Install mouse listeners to update hover feedback for
            // all compact entries that belong to each other
            const statusBarItemHoverBackground = this.getColor(theme_1.STATUS_BAR_ITEM_HOVER_BACKGROUND);
            const statusBarItemCompactHoverBackground = this.getColor(theme_1.STATUS_BAR_ITEM_COMPACT_HOVER_BACKGROUND);
            this.compactEntriesDisposable.value = new lifecycle_1.DisposableStore();
            if (statusBarItemHoverBackground && statusBarItemCompactHoverBackground && !(0, theme_2.isHighContrast)(this.theme.type)) {
                for (const [, compactEntryGroup] of compactEntryGroups) {
                    for (const compactEntry of compactEntryGroup) {
                        if (!compactEntry.hasCommand) {
                            continue; // only show hover feedback when we have a command
                        }
                        this.compactEntriesDisposable.value.add((0, dom_1.addDisposableListener)(compactEntry.labelContainer, dom_1.EventType.MOUSE_OVER, () => {
                            compactEntryGroup.forEach(compactEntry => compactEntry.labelContainer.style.backgroundColor = statusBarItemHoverBackground);
                            compactEntry.labelContainer.style.backgroundColor = statusBarItemCompactHoverBackground;
                        }));
                        this.compactEntriesDisposable.value.add((0, dom_1.addDisposableListener)(compactEntry.labelContainer, dom_1.EventType.MOUSE_OUT, () => {
                            compactEntryGroup.forEach(compactEntry => compactEntry.labelContainer.style.backgroundColor = '');
                        }));
                    }
                }
            }
        }
        showContextMenu(e) {
            dom_1.EventHelper.stop(e, true);
            const event = new mouseEvent_1.StandardMouseEvent((0, dom_1.getWindow)(this.element), e);
            let actions = undefined;
            this.contextMenuService.showContextMenu({
                getAnchor: () => event,
                getActions: () => {
                    actions = this.getContextMenuActions(event);
                    return actions;
                },
                onHide: () => {
                    if (actions) {
                        (0, lifecycle_1.disposeIfDisposable)(actions);
                    }
                }
            });
        }
        getContextMenuActions(event) {
            const actions = [];
            // Provide an action to hide the status bar at last
            actions.push((0, actions_1.toAction)({ id: layoutActions_1.ToggleStatusbarVisibilityAction.ID, label: (0, nls_1.localize)('hideStatusBar', "Hide Status Bar"), run: () => this.instantiationService.invokeFunction(accessor => new layoutActions_1.ToggleStatusbarVisibilityAction().run(accessor)) }));
            actions.push(new actions_1.Separator());
            // Show an entry per known status entry
            // Note: even though entries have an identifier, there can be multiple entries
            // having the same identifier (e.g. from extensions). So we make sure to only
            // show a single entry per identifier we handled.
            const handledEntries = new Set();
            for (const entry of this.viewModel.entries) {
                if (!handledEntries.has(entry.id)) {
                    actions.push(new statusbarActions_1.ToggleStatusbarEntryVisibilityAction(entry.id, entry.name, this.viewModel));
                    handledEntries.add(entry.id);
                }
            }
            // Figure out if mouse is over an entry
            let statusEntryUnderMouse = undefined;
            for (let element = event.target; element; element = element.parentElement) {
                const entry = this.viewModel.findEntry(element);
                if (entry) {
                    statusEntryUnderMouse = entry;
                    break;
                }
            }
            if (statusEntryUnderMouse) {
                actions.push(new actions_1.Separator());
                actions.push(new statusbarActions_1.HideStatusbarEntryAction(statusEntryUnderMouse.id, statusEntryUnderMouse.name, this.viewModel));
            }
            return actions;
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.assertIsDefined)(this.getContainer());
            const styleOverride = [...this.styleOverrides].sort((a, b) => a.priority - b.priority)[0];
            // Background / foreground colors
            const backgroundColor = this.getColor(styleOverride?.background ?? (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ? theme_1.STATUS_BAR_BACKGROUND : theme_1.STATUS_BAR_NO_FOLDER_BACKGROUND)) || '';
            container.style.backgroundColor = backgroundColor;
            const foregroundColor = this.getColor(styleOverride?.foreground ?? (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ? theme_1.STATUS_BAR_FOREGROUND : theme_1.STATUS_BAR_NO_FOLDER_FOREGROUND)) || '';
            container.style.color = foregroundColor;
            const itemBorderColor = this.getColor(theme_1.STATUS_BAR_ITEM_FOCUS_BORDER);
            // Border color
            const borderColor = this.getColor(styleOverride?.border ?? (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ? theme_1.STATUS_BAR_BORDER : theme_1.STATUS_BAR_NO_FOLDER_BORDER)) || this.getColor(colorRegistry_1.contrastBorder);
            if (borderColor) {
                container.classList.add('status-border-top');
                container.style.setProperty('--status-border-top-color', borderColor);
            }
            else {
                container.classList.remove('status-border-top');
                container.style.removeProperty('--status-border-top-color');
            }
            // Colors and focus outlines via dynamic stylesheet
            const statusBarFocusColor = this.getColor(theme_1.STATUS_BAR_FOCUS_BORDER);
            if (!this.styleElement) {
                this.styleElement = (0, dom_1.createStyleSheet)(container);
            }
            this.styleElement.textContent = `

				/* Status bar focus outline */
				.monaco-workbench .part.statusbar:focus {
					outline-color: ${statusBarFocusColor};
				}

				/* Status bar item focus outline */
				.monaco-workbench .part.statusbar > .items-container > .statusbar-item a:focus-visible:not(.disabled) {
					outline: 1px solid ${this.getColor(colorRegistry_1.activeContrastBorder) ?? itemBorderColor};
					outline-offset: ${borderColor ? '-2px' : '-1px'};
				}

				/* Notification Beak */
				.monaco-workbench .part.statusbar > .items-container > .statusbar-item.has-beak > .status-bar-item-beak-container:before {
					border-bottom-color: ${backgroundColor};
				}
			`;
        }
        layout(width, height, top, left) {
            super.layout(width, height, top, left);
            super.layoutContents(width, height);
        }
        overrideStyle(style) {
            this.styleOverrides.add(style);
            this.updateStyles();
            return (0, lifecycle_1.toDisposable)(() => {
                this.styleOverrides.delete(style);
                this.updateStyles();
            });
        }
        toJSON() {
            return {
                type: "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */
            };
        }
        dispose() {
            this._onWillDispose.fire();
            super.dispose();
        }
    };
    StatusbarPart = StatusbarPart_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, themeService_1.IThemeService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, storage_1.IStorageService),
        __param(5, layoutService_1.IWorkbenchLayoutService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, hover_1.IHoverService),
        __param(9, configuration_1.IConfigurationService)
    ], StatusbarPart);
    let MainStatusbarPart = class MainStatusbarPart extends StatusbarPart {
        constructor(instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService, hoverService, configurationService) {
            super("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService, hoverService, configurationService);
        }
    };
    exports.MainStatusbarPart = MainStatusbarPart;
    exports.MainStatusbarPart = MainStatusbarPart = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, themeService_1.IThemeService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, storage_1.IStorageService),
        __param(4, layoutService_1.IWorkbenchLayoutService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, hover_1.IHoverService),
        __param(8, configuration_1.IConfigurationService)
    ], MainStatusbarPart);
    let AuxiliaryStatusbarPart = class AuxiliaryStatusbarPart extends StatusbarPart {
        static { AuxiliaryStatusbarPart_1 = this; }
        static { this.COUNTER = 1; }
        constructor(container, instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService, hoverService, configurationService) {
            const id = AuxiliaryStatusbarPart_1.COUNTER++;
            super(`workbench.parts.auxiliaryStatus.${id}`, instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService, hoverService, configurationService);
            this.container = container;
            this.height = StatusbarPart.HEIGHT;
        }
    };
    exports.AuxiliaryStatusbarPart = AuxiliaryStatusbarPart;
    exports.AuxiliaryStatusbarPart = AuxiliaryStatusbarPart = AuxiliaryStatusbarPart_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, themeService_1.IThemeService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, storage_1.IStorageService),
        __param(5, layoutService_1.IWorkbenchLayoutService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, hover_1.IHoverService),
        __param(9, configuration_1.IConfigurationService)
    ], AuxiliaryStatusbarPart);
    let StatusbarService = class StatusbarService extends part_1.MultiWindowParts {
        constructor(instantiationService, storageService, themeService) {
            super('workbench.statusBarService', themeService, storageService);
            this.instantiationService = instantiationService;
            this.mainPart = this._register(this.instantiationService.createInstance(MainStatusbarPart));
            //#endregion
            //#region Service Implementation
            this.onDidChangeEntryVisibility = this.mainPart.onDidChangeEntryVisibility;
            this._register(this.registerPart(this.mainPart));
        }
        //#region Auxiliary Statusbar Parts
        createAuxiliaryStatusbarPart(container) {
            const statusbarPartContainer = document.createElement('footer');
            statusbarPartContainer.classList.add('part', 'statusbar');
            statusbarPartContainer.setAttribute('role', 'status');
            statusbarPartContainer.style.position = 'relative';
            statusbarPartContainer.setAttribute('aria-live', 'off');
            statusbarPartContainer.setAttribute('tabindex', '0');
            container.appendChild(statusbarPartContainer);
            const statusbarPart = this.instantiationService.createInstance(AuxiliaryStatusbarPart, statusbarPartContainer);
            const disposable = this.registerPart(statusbarPart);
            statusbarPart.create(statusbarPartContainer);
            event_1.Event.once(statusbarPart.onWillDispose)(() => disposable.dispose());
            return statusbarPart;
        }
        createScoped(statusbarEntryContainer, disposables) {
            return disposables.add(this.instantiationService.createInstance(ScopedStatusbarService, statusbarEntryContainer));
        }
        addEntry(entry, id, alignment, priorityOrLocation = 0) {
            return this.mainPart.addEntry(entry, id, alignment, priorityOrLocation);
        }
        isEntryVisible(id) {
            return this.mainPart.isEntryVisible(id);
        }
        updateEntryVisibility(id, visible) {
            for (const part of this.parts) {
                part.updateEntryVisibility(id, visible);
            }
        }
        focus(preserveEntryFocus) {
            this.activePart.focus(preserveEntryFocus);
        }
        focusNextEntry() {
            this.activePart.focusNextEntry();
        }
        focusPreviousEntry() {
            this.activePart.focusPreviousEntry();
        }
        isEntryFocused() {
            return this.activePart.isEntryFocused();
        }
        overrideStyle(style) {
            const disposables = new lifecycle_1.DisposableStore();
            for (const part of this.parts) {
                disposables.add(part.overrideStyle(style));
            }
            return disposables;
        }
    };
    exports.StatusbarService = StatusbarService;
    exports.StatusbarService = StatusbarService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, storage_1.IStorageService),
        __param(2, themeService_1.IThemeService)
    ], StatusbarService);
    let ScopedStatusbarService = class ScopedStatusbarService extends lifecycle_1.Disposable {
        constructor(statusbarEntryContainer, statusbarService) {
            super();
            this.statusbarEntryContainer = statusbarEntryContainer;
            this.statusbarService = statusbarService;
            this.onDidChangeEntryVisibility = this.statusbarEntryContainer.onDidChangeEntryVisibility;
        }
        createAuxiliaryStatusbarPart(container) {
            return this.statusbarService.createAuxiliaryStatusbarPart(container);
        }
        createScoped(statusbarEntryContainer, disposables) {
            return this.statusbarService.createScoped(statusbarEntryContainer, disposables);
        }
        getPart() {
            return this.statusbarEntryContainer;
        }
        addEntry(entry, id, alignment, priorityOrLocation = 0) {
            return this.statusbarEntryContainer.addEntry(entry, id, alignment, priorityOrLocation);
        }
        isEntryVisible(id) {
            return this.statusbarEntryContainer.isEntryVisible(id);
        }
        updateEntryVisibility(id, visible) {
            this.statusbarEntryContainer.updateEntryVisibility(id, visible);
        }
        focus(preserveEntryFocus) {
            this.statusbarEntryContainer.focus(preserveEntryFocus);
        }
        focusNextEntry() {
            this.statusbarEntryContainer.focusNextEntry();
        }
        focusPreviousEntry() {
            this.statusbarEntryContainer.focusPreviousEntry();
        }
        isEntryFocused() {
            return this.statusbarEntryContainer.isEntryFocused();
        }
        overrideStyle(style) {
            return this.statusbarEntryContainer.overrideStyle(style);
        }
    };
    exports.ScopedStatusbarService = ScopedStatusbarService;
    exports.ScopedStatusbarService = ScopedStatusbarService = __decorate([
        __param(1, statusbar_1.IStatusbarService)
    ], ScopedStatusbarService);
    (0, extensions_1.registerSingleton)(statusbar_1.IStatusbarService, StatusbarService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzYmFyUGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvc3RhdHVzYmFyL3N0YXR1c2JhclBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQThHaEcsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLFdBQUk7O2lCQUVmLFdBQU0sR0FBRyxFQUFFLEFBQUwsQ0FBTTtRQThENUIsWUFDQyxFQUFVLEVBQ2Esb0JBQTRELEVBQ3BFLFlBQTJCLEVBQ2hCLGNBQXlELEVBQ2xFLGNBQWdELEVBQ3hDLGFBQXNDLEVBQzFDLGtCQUErQyxFQUNoRCxpQkFBc0QsRUFDM0QsWUFBNEMsRUFDcEMsb0JBQTREO1lBRW5GLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQVZwQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBRXhDLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUNqRCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFFcEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUMvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQzFDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ25CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUF0RXBGLGVBQWU7WUFFTixpQkFBWSxHQUFXLENBQUMsQ0FBQztZQUN6QixpQkFBWSxHQUFXLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztZQUNoRCxrQkFBYSxHQUFXLGVBQWEsQ0FBQyxNQUFNLENBQUM7WUFDN0Msa0JBQWEsR0FBVyxlQUFhLENBQUMsTUFBTSxDQUFDO1lBTTlDLG1CQUFjLEdBQTZCLEVBQUUsQ0FBQztZQUVyQyxjQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLG1DQUFrQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBRWhGLCtCQUEwQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUM7WUFFL0QsbUJBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUM3RCxrQkFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO1lBS2xDLGtCQUFhLEdBQUcsSUFBSTtnQkFNcEMsSUFBSSxLQUFLO29CQUNSLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLEVBQUUsQ0FBQzt3QkFDL0MsT0FBTyxDQUFDLENBQUMsQ0FBQyxpREFBaUQ7b0JBQzVELENBQUM7b0JBRUQsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFTLHVCQUF1QixDQUFDLENBQUM7Z0JBQzVFLENBQUM7Z0JBRUQsWUFDa0Isb0JBQTJDLEVBQzNDLFlBQTJCO29CQUQzQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO29CQUMzQyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtvQkFkckMsc0JBQWlCLEdBQUcsQ0FBQyxDQUFDO29CQUVyQixjQUFTLEdBQUcsU0FBUyxDQUFDO2dCQWEzQixDQUFDO2dCQUVMLFNBQVMsQ0FBQyxPQUE4QixFQUFFLEtBQWU7b0JBQ3hELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7d0JBQ2xDLEdBQUcsT0FBTzt3QkFDVixXQUFXLEVBQUU7NEJBQ1osYUFBYSxFQUFFLElBQUk7NEJBQ25CLE1BQU0sRUFBRSxLQUFLO3lCQUNiO3FCQUNELEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQztnQkFFRCxjQUFjO29CQUNiLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLENBQUM7YUFDRCxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFL0IsNkJBQXdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFtQixDQUFDLENBQUM7WUFDcEYsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBMkIsQ0FBQztZQWdCcEUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUV4QiwyQkFBMkI7WUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRW5GLDBCQUEwQjtZQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMseUJBQXlCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxRixDQUFDO1FBRUQsUUFBUSxDQUFDLEtBQXNCLEVBQUUsRUFBVSxFQUFFLFNBQTZCLEVBQUUscUJBQWlGLENBQUM7WUFDN0osSUFBSSxRQUFpQyxDQUFDO1lBQ3RDLElBQUksSUFBQSxvQ0FBd0IsRUFBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xELFFBQVEsR0FBRyxrQkFBa0IsQ0FBQztZQUMvQixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsUUFBUSxHQUFHO29CQUNWLE9BQU8sRUFBRSxrQkFBa0I7b0JBQzNCLFNBQVMsRUFBRSxJQUFBLFdBQUksRUFBQyxFQUFFLENBQUMsQ0FBQyxrREFBa0Q7aUJBQ3RFLENBQUM7WUFDSCxDQUFDO1lBRUQsK0VBQStFO1lBQy9FLGlFQUFpRTtZQUNqRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNuQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMvRCxDQUFDO1lBRUQsd0JBQXdCO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRU8saUJBQWlCLENBQUMsS0FBc0IsRUFBRSxFQUFVLEVBQUUsU0FBNkIsRUFBRSxRQUFpQztZQUM3SCxNQUFNLFlBQVksR0FBMkIsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQztZQUNoRixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUV2QyxNQUFNLFFBQVEsR0FBNEI7Z0JBQ3pDLE1BQU0sRUFBRSxDQUFDLEtBQXNCLEVBQUUsRUFBRTtvQkFDbEMsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQzNCLFlBQVksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNyQyxDQUFDO3lCQUFNLENBQUM7d0JBQ1AsWUFBWSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7b0JBQzVCLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxPQUFPLEVBQUUsR0FBRyxFQUFFO29CQUNiLElBQUksWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUMzQixZQUFZLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNqQyxDQUFDO3lCQUFNLENBQUM7d0JBQ1AsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxZQUFZLENBQUMsQ0FBQztvQkFDbkYsQ0FBQztnQkFDRixDQUFDO2FBQ0QsQ0FBQztZQUVGLE9BQU8sUUFBUSxDQUFDO1FBQ2pCLENBQUM7UUFFTyxVQUFVLENBQUMsS0FBc0IsRUFBRSxFQUFVLEVBQUUsU0FBNkIsRUFBRSxRQUFpQztZQUV0SCxrQkFBa0I7WUFDbEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM3RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGtDQUFrQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXBILG1CQUFtQjtZQUNuQixNQUFNLGNBQWMsR0FBNkIsSUFBSTtnQkFBQTtvQkFDM0MsT0FBRSxHQUFHLEVBQUUsQ0FBQztvQkFDUixjQUFTLEdBQUcsU0FBUyxDQUFDO29CQUN0QixhQUFRLEdBQUcsUUFBUSxDQUFDO29CQUNwQixjQUFTLEdBQUcsYUFBYSxDQUFDO29CQUMxQixtQkFBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7Z0JBSS9DLENBQUM7Z0JBRkEsSUFBSSxJQUFJLEtBQUssT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxVQUFVLEtBQUssT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzthQUM1QyxDQUFDO1lBRUYsb0JBQW9CO1lBQ3BCLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEYsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUMvQixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzNDLENBQUM7WUFFRCxPQUFPO2dCQUNOLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRTtvQkFDZixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwQixDQUFDO2dCQUNELE9BQU8sRUFBRSxHQUFHLEVBQUU7b0JBQ2IsTUFBTSxFQUFFLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDakYsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO3dCQUN0QixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztvQkFDL0IsQ0FBQzt5QkFBTSxDQUFDO3dCQUNQLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDeEIsQ0FBQztvQkFDRCxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2YsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDO1FBRU8sa0JBQWtCLENBQUMsRUFBVSxFQUFFLFNBQTZCLEVBQUUsR0FBRyxZQUFzQjtZQUM5RixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BELGFBQWEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1lBRXRCLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDOUMsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDbEIsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQztZQUM5QyxDQUFDO1lBRUQsSUFBSSxTQUFTLHFDQUE2QixFQUFFLENBQUM7Z0JBQzVDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQyxDQUFDO1lBRUQsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVPLHVCQUF1QixDQUFDLEtBQStCLEVBQUUsR0FBWTtZQUU1RSw2Q0FBNkM7WUFDN0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7WUFDN0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDVCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUIsQ0FBQztZQUNELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO1lBRTVDLCtDQUErQztZQUMvQyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNULGFBQWEsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDN0QsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLGFBQWEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCxDQUFDO1lBRUQsNkRBQTZEO1lBQzdELE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxJQUFBLGVBQU0sRUFBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFOUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVELGNBQWMsQ0FBQyxFQUFVO1lBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQscUJBQXFCLENBQUMsRUFBVSxFQUFFLE9BQWdCO1lBQ2pELElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ2IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekIsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3pCLENBQUM7UUFDRixDQUFDO1FBRUQsY0FBYztZQUNiLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVELGtCQUFrQjtZQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDckMsQ0FBQztRQUVELGNBQWM7WUFDYixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDeEMsQ0FBQztRQUVELEtBQUssQ0FBQyxrQkFBa0IsR0FBRyxJQUFJO1lBQzlCLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUM3QixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUM7WUFDekQsSUFBSSxrQkFBa0IsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO2dCQUM1QyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsNEZBQTRGO1lBQzNKLENBQUM7UUFDRixDQUFDO1FBRWtCLGlCQUFpQixDQUFDLE1BQW1CO1lBQ3ZELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBRXRCLCtCQUErQjtZQUMvQixNQUFNLHVCQUF1QixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2xGLDhCQUFnQixDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUzRCx1QkFBdUI7WUFDdkIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBRTFCLHdCQUF3QjtZQUN4QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUVuRCx1QkFBdUI7WUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLDJCQUFxQixFQUFDLE1BQU0sRUFBRSxlQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLDJCQUFxQixFQUFDLE1BQU0sRUFBRSxpQkFBYyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhHLDZCQUE2QjtZQUM3QixJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztZQUVyQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckIsQ0FBQztRQUVPLDZCQUE2QjtZQUVwQyw0Q0FBNEM7WUFDNUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFFOUIsaUNBQWlDO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDNUMsSUFBSSxPQUFPLEVBQUUsQ0FBQztvQkFDYixPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDMUcsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRU8sc0JBQXNCO1lBQzdCLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx1QkFBZSxFQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sbUJBQW1CLEdBQUcsSUFBQSx1QkFBZSxFQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBRXRFLG1CQUFtQjtZQUNuQixJQUFBLGVBQVMsRUFBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzlCLElBQUEsZUFBUyxFQUFDLG1CQUFtQixDQUFDLENBQUM7WUFFL0IsYUFBYTtZQUNiLEtBQUssTUFBTSxLQUFLLElBQUk7Z0JBQ25CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLGlDQUF5QjtnQkFDckQsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsa0NBQTBCLENBQUMsT0FBTyxFQUFFLENBQUMscUNBQXFDO2FBQ3RHLEVBQUUsQ0FBQztnQkFDSCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsU0FBUyxvQ0FBNEIsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDO2dCQUV0RyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQyxDQUFDO1lBRUQseUJBQXlCO1lBQ3pCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFTyxvQkFBb0IsQ0FBQyxLQUErQjtZQUMzRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFM0QsSUFBSSxLQUFLLENBQUMsU0FBUyxxQ0FBNkIsRUFBRSxDQUFDO2dCQUNsRCxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxxQ0FBcUM7WUFDekQsQ0FBQztZQUVELE1BQU0sTUFBTSxHQUFHLElBQUEsdUJBQWUsRUFBQyxLQUFLLENBQUMsU0FBUyxvQ0FBNEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUVqSSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLElBQUksS0FBSyxHQUFHLENBQUMsS0FBSyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2xDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsNEJBQTRCO1lBQ2xFLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHVDQUF1QztZQUM1RyxDQUFDO1lBRUQseUJBQXlCO1lBQ3pCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFTyxvQkFBb0I7WUFDM0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7WUFFdkMsb0VBQW9FO1lBQ3BFLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7WUFDeEUsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO29CQUN4QyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDMUMsQ0FBQztnQkFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ25FLENBQUM7WUFFRCx3REFBd0Q7WUFDeEQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBeUMsQ0FBQztZQUM1RSxLQUFLLE1BQU0sS0FBSyxJQUFJLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ2xELElBQ0MsSUFBQSxvQ0FBd0IsRUFBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLDZDQUE2QztvQkFDakcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFNLDRCQUE0QjtrQkFDL0QsQ0FBQztvQkFDRixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQzdDLE1BQU0sUUFBUSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDckQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNmLFNBQVMsQ0FBQyxrQ0FBa0M7b0JBQzdDLENBQUM7b0JBRUQsMkRBQTJEO29CQUMzRCxJQUFJLGlCQUFpQixHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDM0QsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7d0JBQ3hCLGlCQUFpQixHQUFHLElBQUksR0FBRyxDQUEyQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUN6RSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUM7b0JBQ3ZELENBQUM7eUJBQU0sQ0FBQzt3QkFDUCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzlCLENBQUM7b0JBRUQsMkRBQTJEO29CQUMzRCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsb0NBQTRCLEVBQUUsQ0FBQzt3QkFDbEUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUNqRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQ2hELENBQUM7eUJBQU0sQ0FBQzt3QkFDUCxRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7d0JBQ2xELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDL0MsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUdELHVEQUF1RDtZQUN2RCxnREFBZ0Q7WUFDaEQsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLHdDQUFnQyxDQUFDLENBQUM7WUFDckYsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdEQUF3QyxDQUFDLENBQUM7WUFDcEcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUM1RCxJQUFJLDRCQUE0QixJQUFJLG1DQUFtQyxJQUFJLENBQUMsSUFBQSxzQkFBYyxFQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDN0csS0FBSyxNQUFNLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLGtCQUFrQixFQUFFLENBQUM7b0JBQ3hELEtBQUssTUFBTSxZQUFZLElBQUksaUJBQWlCLEVBQUUsQ0FBQzt3QkFDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQzs0QkFDOUIsU0FBUyxDQUFDLGtEQUFrRDt3QkFDN0QsQ0FBQzt3QkFFRCxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFBLDJCQUFxQixFQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsZUFBUyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7NEJBQ3JILGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyw0QkFBNEIsQ0FBQyxDQUFDOzRCQUM1SCxZQUFZLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsbUNBQW1DLENBQUM7d0JBQ3pGLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRUosSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxZQUFZLENBQUMsY0FBYyxFQUFFLGVBQVMsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFOzRCQUNwSCxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDLENBQUM7d0JBQ25HLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ0wsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFTyxlQUFlLENBQUMsQ0FBNEI7WUFDbkQsaUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTFCLE1BQU0sS0FBSyxHQUFHLElBQUksK0JBQWtCLENBQUMsSUFBQSxlQUFTLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWpFLElBQUksT0FBTyxHQUEwQixTQUFTLENBQUM7WUFDL0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztnQkFDdkMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUs7Z0JBQ3RCLFVBQVUsRUFBRSxHQUFHLEVBQUU7b0JBQ2hCLE9BQU8sR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBRTVDLE9BQU8sT0FBTyxDQUFDO2dCQUNoQixDQUFDO2dCQUNELE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQ1osSUFBSSxPQUFPLEVBQUUsQ0FBQzt3QkFDYixJQUFBLCtCQUFtQixFQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM5QixDQUFDO2dCQUNGLENBQUM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8scUJBQXFCLENBQUMsS0FBeUI7WUFDdEQsTUFBTSxPQUFPLEdBQWMsRUFBRSxDQUFDO1lBRTlCLG1EQUFtRDtZQUNuRCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUEsa0JBQVEsRUFBQyxFQUFFLEVBQUUsRUFBRSwrQ0FBK0IsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSwrQ0FBK0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxFQUFFLENBQUMsQ0FBQztZQUU5Qix1Q0FBdUM7WUFDdkMsOEVBQThFO1lBQzlFLDZFQUE2RTtZQUM3RSxpREFBaUQ7WUFDakQsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUN6QyxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO29CQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksdURBQW9DLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUM3RixjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDOUIsQ0FBQztZQUNGLENBQUM7WUFFRCx1Q0FBdUM7WUFDdkMsSUFBSSxxQkFBcUIsR0FBeUMsU0FBUyxDQUFDO1lBQzVFLEtBQUssSUFBSSxPQUFPLEdBQXVCLEtBQUssQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQy9GLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUNYLHFCQUFxQixHQUFHLEtBQUssQ0FBQztvQkFDOUIsTUFBTTtnQkFDUCxDQUFDO1lBQ0YsQ0FBQztZQUVELElBQUkscUJBQXFCLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksMkNBQXdCLENBQUMscUJBQXFCLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsSCxDQUFDO1lBRUQsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVRLFlBQVk7WUFDcEIsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXJCLE1BQU0sU0FBUyxHQUFHLElBQUEsdUJBQWUsRUFBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztZQUN2RCxNQUFNLGFBQWEsR0FBd0MsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUvSCxpQ0FBaUM7WUFDakMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxpQ0FBeUIsQ0FBQyxDQUFDLENBQUMsNkJBQXFCLENBQUMsQ0FBQyxDQUFDLHVDQUErQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdk0sU0FBUyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1lBQ2xELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsaUNBQXlCLENBQUMsQ0FBQyxDQUFDLDZCQUFxQixDQUFDLENBQUMsQ0FBQyx1Q0FBK0IsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZNLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLGVBQWUsQ0FBQztZQUN4QyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG9DQUE0QixDQUFDLENBQUM7WUFFcEUsZUFBZTtZQUNmLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsaUNBQXlCLENBQUMsQ0FBQyxDQUFDLHlCQUFpQixDQUFDLENBQUMsQ0FBQyxtQ0FBMkIsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDbE4sSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDakIsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDN0MsU0FBUyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsMkJBQTJCLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdkUsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQ2hELFNBQVMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDN0QsQ0FBQztZQUVELG1EQUFtRDtZQUVuRCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsK0JBQXVCLENBQUMsQ0FBQztZQUVuRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUEsc0JBQWdCLEVBQUMsU0FBUyxDQUFDLENBQUM7WUFDakQsQ0FBQztZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxHQUFHOzs7O3NCQUlaLG1CQUFtQjs7Ozs7MEJBS2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQ0FBb0IsQ0FBQyxJQUFJLGVBQWU7dUJBQ3pELFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNOzs7Ozs0QkFLeEIsZUFBZTs7SUFFdkMsQ0FBQztRQUNKLENBQUM7UUFFUSxNQUFNLENBQUMsS0FBYSxFQUFFLE1BQWMsRUFBRSxHQUFXLEVBQUUsSUFBWTtZQUN2RSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxhQUFhLENBQUMsS0FBOEI7WUFDM0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXBCLE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNyQixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNO1lBQ0wsT0FBTztnQkFDTixJQUFJLHdEQUFzQjthQUMxQixDQUFDO1FBQ0gsQ0FBQztRQUVRLE9BQU87WUFDZixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRTNCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDOztJQS9oQkksYUFBYTtRQWtFaEIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLDRCQUFhLENBQUE7UUFDYixXQUFBLG9DQUF3QixDQUFBO1FBQ3hCLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsdUNBQXVCLENBQUE7UUFDdkIsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEscUNBQXFCLENBQUE7T0ExRWxCLGFBQWEsQ0FnaUJsQjtJQUVNLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsYUFBYTtRQUVuRCxZQUN3QixvQkFBMkMsRUFDbkQsWUFBMkIsRUFDaEIsY0FBd0MsRUFDakQsY0FBK0IsRUFDdkIsYUFBc0MsRUFDMUMsa0JBQXVDLEVBQ3hDLGlCQUFxQyxFQUMxQyxZQUEyQixFQUNuQixvQkFBMkM7WUFFbEUsS0FBSyx5REFBdUIsb0JBQW9CLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLFlBQVksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQzNMLENBQUM7S0FDRCxDQUFBO0lBZlksOENBQWlCO2dDQUFqQixpQkFBaUI7UUFHM0IsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLDRCQUFhLENBQUE7UUFDYixXQUFBLG9DQUF3QixDQUFBO1FBQ3hCLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsdUNBQXVCLENBQUE7UUFDdkIsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEscUNBQXFCLENBQUE7T0FYWCxpQkFBaUIsQ0FlN0I7SUFPTSxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLGFBQWE7O2lCQUV6QyxZQUFPLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFJM0IsWUFDVSxTQUFzQixFQUNSLG9CQUEyQyxFQUNuRCxZQUEyQixFQUNoQixjQUF3QyxFQUNqRCxjQUErQixFQUN2QixhQUFzQyxFQUMxQyxrQkFBdUMsRUFDeEMsaUJBQXFDLEVBQzFDLFlBQTJCLEVBQ25CLG9CQUEyQztZQUVsRSxNQUFNLEVBQUUsR0FBRyx3QkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM1QyxLQUFLLENBQUMsbUNBQW1DLEVBQUUsRUFBRSxFQUFFLG9CQUFvQixFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQVpwTSxjQUFTLEdBQVQsU0FBUyxDQUFhO1lBSHZCLFdBQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDO1FBZ0J2QyxDQUFDOztJQXBCVyx3REFBc0I7cUNBQXRCLHNCQUFzQjtRQVFoQyxXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsNEJBQWEsQ0FBQTtRQUNiLFdBQUEsb0NBQXdCLENBQUE7UUFDeEIsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSx1Q0FBdUIsQ0FBQTtRQUN2QixXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSxxQkFBYSxDQUFBO1FBQ2IsV0FBQSxxQ0FBcUIsQ0FBQTtPQWhCWCxzQkFBc0IsQ0FxQmxDO0lBRU0sSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSx1QkFBK0I7UUFNcEUsWUFDd0Isb0JBQTRELEVBQ2xFLGNBQStCLEVBQ2pDLFlBQTJCO1lBRTFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFKMUIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUgzRSxhQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQXFDaEcsWUFBWTtZQUVaLGdDQUFnQztZQUV2QiwrQkFBMEIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDO1lBaEM5RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVELG1DQUFtQztRQUVuQyw0QkFBNEIsQ0FBQyxTQUFzQjtZQUNsRCxNQUFNLHNCQUFzQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEUsc0JBQXNCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDMUQsc0JBQXNCLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN0RCxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztZQUNuRCxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hELHNCQUFzQixDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckQsU0FBUyxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBRTlDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsc0JBQXNCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztZQUMvRyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXBELGFBQWEsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUU3QyxhQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUVwRSxPQUFPLGFBQWEsQ0FBQztRQUN0QixDQUFDO1FBRUQsWUFBWSxDQUFDLHVCQUFpRCxFQUFFLFdBQTRCO1lBQzNGLE9BQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHNCQUFzQixFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQztRQUNuSCxDQUFDO1FBUUQsUUFBUSxDQUFDLEtBQXNCLEVBQUUsRUFBVSxFQUFFLFNBQTZCLEVBQUUscUJBQWlGLENBQUM7WUFDN0osT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCxjQUFjLENBQUMsRUFBVTtZQUN4QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFRCxxQkFBcUIsQ0FBQyxFQUFVLEVBQUUsT0FBZ0I7WUFDakQsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDekMsQ0FBQztRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsa0JBQTRCO1lBQ2pDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELGNBQWM7WUFDYixJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFFRCxrQkFBa0I7WUFDakIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFFRCxjQUFjO1lBQ2IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFFRCxhQUFhLENBQUMsS0FBOEI7WUFDM0MsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFMUMsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQy9CLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzVDLENBQUM7WUFFRCxPQUFPLFdBQVcsQ0FBQztRQUNwQixDQUFDO0tBR0QsQ0FBQTtJQXhGWSw0Q0FBZ0I7K0JBQWhCLGdCQUFnQjtRQU8xQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsNEJBQWEsQ0FBQTtPQVRILGdCQUFnQixDQXdGNUI7SUFFTSxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHNCQUFVO1FBSXJELFlBQ2tCLHVCQUFpRCxFQUMvQyxnQkFBb0Q7WUFFdkUsS0FBSyxFQUFFLENBQUM7WUFIUyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQzlCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFpQi9ELCtCQUEwQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQywwQkFBMEIsQ0FBQztRQWQ5RixDQUFDO1FBRUQsNEJBQTRCLENBQUMsU0FBc0I7WUFDbEQsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsNEJBQTRCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUVELFlBQVksQ0FBQyx1QkFBaUQsRUFBRSxXQUE0QjtZQUMzRixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsdUJBQXVCLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDakYsQ0FBQztRQUVELE9BQU87WUFDTixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztRQUNyQyxDQUFDO1FBSUQsUUFBUSxDQUFDLEtBQXNCLEVBQUUsRUFBVSxFQUFFLFNBQTZCLEVBQUUscUJBQWlGLENBQUM7WUFDN0osT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDeEYsQ0FBQztRQUVELGNBQWMsQ0FBQyxFQUFVO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQscUJBQXFCLENBQUMsRUFBVSxFQUFFLE9BQWdCO1lBQ2pELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELEtBQUssQ0FBQyxrQkFBNEI7WUFDakMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxjQUFjO1lBQ2IsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQy9DLENBQUM7UUFFRCxrQkFBa0I7WUFDakIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDbkQsQ0FBQztRQUVELGNBQWM7WUFDYixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0RCxDQUFDO1FBRUQsYUFBYSxDQUFDLEtBQThCO1lBQzNDLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxRCxDQUFDO0tBQ0QsQ0FBQTtJQXhEWSx3REFBc0I7cUNBQXRCLHNCQUFzQjtRQU1oQyxXQUFBLDZCQUFpQixDQUFBO09BTlAsc0JBQXNCLENBd0RsQztJQUVELElBQUEsOEJBQWlCLEVBQUMsNkJBQWlCLEVBQUUsZ0JBQWdCLGtDQUEwQixDQUFDIn0=