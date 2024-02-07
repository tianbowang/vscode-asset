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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/widget", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/nls", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/theme/common/colorRegistry", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/services/environment/common/environmentService", "vs/editor/common/languages/language"], function (require, exports, DOM, keyboardEvent_1, actionbar_1, actionViewItems_1, widget_1, actions_1, event_1, htmlContent_1, lifecycle_1, network_1, resources_1, uri_1, nls_1, contextScopedHistoryWidget_1, historyWidgetKeybindingHint_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, label_1, colorRegistry_1, themables_1, workspace_1, preferencesIcons_1, environmentService_1, language_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditPreferenceWidget = exports.SearchWidget = exports.SettingsTargetsWidget = exports.FolderSettingsActionViewItem = void 0;
    let FolderSettingsActionViewItem = class FolderSettingsActionViewItem extends actionViewItems_1.BaseActionViewItem {
        constructor(action, contextService, contextMenuService) {
            super(null, action);
            this.contextService = contextService;
            this.contextMenuService = contextMenuService;
            this._folderSettingCounts = new Map();
            const workspace = this.contextService.getWorkspace();
            this._folder = workspace.folders.length === 1 ? workspace.folders[0] : null;
            this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.onWorkspaceFoldersChanged()));
        }
        get folder() {
            return this._folder;
        }
        set folder(folder) {
            this._folder = folder;
            this.update();
        }
        setCount(settingsTarget, count) {
            const workspaceFolder = this.contextService.getWorkspaceFolder(settingsTarget);
            if (!workspaceFolder) {
                throw new Error('unknown folder');
            }
            const folder = workspaceFolder.uri;
            this._folderSettingCounts.set(folder.toString(), count);
            this.update();
        }
        render(container) {
            this.element = container;
            this.container = container;
            this.labelElement = DOM.$('.action-title');
            this.detailsElement = DOM.$('.action-details');
            this.dropDownElement = DOM.$('.dropdown-icon.hide' + themables_1.ThemeIcon.asCSSSelector(preferencesIcons_1.settingsScopeDropDownIcon));
            this.anchorElement = DOM.$('a.action-label.folder-settings', {
                role: 'button',
                'aria-haspopup': 'true',
                'tabindex': '0'
            }, this.labelElement, this.detailsElement, this.dropDownElement);
            this._register(DOM.addDisposableListener(this.anchorElement, DOM.EventType.MOUSE_DOWN, e => DOM.EventHelper.stop(e)));
            this._register(DOM.addDisposableListener(this.anchorElement, DOM.EventType.CLICK, e => this.onClick(e)));
            this._register(DOM.addDisposableListener(this.container, DOM.EventType.KEY_UP, e => this.onKeyUp(e)));
            DOM.append(this.container, this.anchorElement);
            this.update();
        }
        onKeyUp(event) {
            const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(event);
            switch (keyboardEvent.keyCode) {
                case 3 /* KeyCode.Enter */:
                case 10 /* KeyCode.Space */:
                    this.onClick(event);
                    return;
            }
        }
        onClick(event) {
            DOM.EventHelper.stop(event, true);
            if (!this.folder || this._action.checked) {
                this.showMenu();
            }
            else {
                this._action.run(this._folder);
            }
        }
        updateEnabled() {
            this.update();
        }
        updateChecked() {
            this.update();
        }
        onWorkspaceFoldersChanged() {
            const oldFolder = this._folder;
            const workspace = this.contextService.getWorkspace();
            if (oldFolder) {
                this._folder = workspace.folders.filter(folder => (0, resources_1.isEqual)(folder.uri, oldFolder.uri))[0] || workspace.folders[0];
            }
            this._folder = this._folder ? this._folder : workspace.folders.length === 1 ? workspace.folders[0] : null;
            this.update();
            if (this._action.checked) {
                this._action.run(this._folder);
            }
        }
        update() {
            let total = 0;
            this._folderSettingCounts.forEach(n => total += n);
            const workspace = this.contextService.getWorkspace();
            if (this._folder) {
                this.labelElement.textContent = this._folder.name;
                this.anchorElement.title = this._folder.name;
                const detailsText = this.labelWithCount(this._action.label, total);
                this.detailsElement.textContent = detailsText;
                this.dropDownElement.classList.toggle('hide', workspace.folders.length === 1 || !this._action.checked);
            }
            else {
                const labelText = this.labelWithCount(this._action.label, total);
                this.labelElement.textContent = labelText;
                this.detailsElement.textContent = '';
                this.anchorElement.title = this._action.label;
                this.dropDownElement.classList.remove('hide');
            }
            this.anchorElement.classList.toggle('checked', this._action.checked);
            this.container.classList.toggle('disabled', !this._action.enabled);
        }
        showMenu() {
            this.contextMenuService.showContextMenu({
                getAnchor: () => this.container,
                getActions: () => this.getDropdownMenuActions(),
                getActionViewItem: () => undefined,
                onHide: () => {
                    this.anchorElement.blur();
                }
            });
        }
        getDropdownMenuActions() {
            const actions = [];
            const workspaceFolders = this.contextService.getWorkspace().folders;
            if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && workspaceFolders.length > 0) {
                actions.push(...workspaceFolders.map((folder, index) => {
                    const folderCount = this._folderSettingCounts.get(folder.uri.toString());
                    return {
                        id: 'folderSettingsTarget' + index,
                        label: this.labelWithCount(folder.name, folderCount),
                        checked: this.folder && (0, resources_1.isEqual)(this.folder.uri, folder.uri),
                        enabled: true,
                        run: () => this._action.run(folder)
                    };
                }));
            }
            return actions;
        }
        labelWithCount(label, count) {
            // Append the count if it's >0 and not undefined
            if (count) {
                label += ` (${count})`;
            }
            return label;
        }
    };
    exports.FolderSettingsActionViewItem = FolderSettingsActionViewItem;
    exports.FolderSettingsActionViewItem = FolderSettingsActionViewItem = __decorate([
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, contextView_1.IContextMenuService)
    ], FolderSettingsActionViewItem);
    let SettingsTargetsWidget = class SettingsTargetsWidget extends widget_1.Widget {
        constructor(parent, options, contextService, instantiationService, environmentService, labelService, languageService) {
            super();
            this.contextService = contextService;
            this.instantiationService = instantiationService;
            this.environmentService = environmentService;
            this.labelService = labelService;
            this.languageService = languageService;
            this._settingsTarget = null;
            this._onDidTargetChange = this._register(new event_1.Emitter());
            this.onDidTargetChange = this._onDidTargetChange.event;
            this.options = options ?? {};
            this.create(parent);
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.onWorkbenchStateChanged()));
            this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.update()));
        }
        resetLabels() {
            const remoteAuthority = this.environmentService.remoteAuthority;
            const hostLabel = remoteAuthority && this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority);
            this.userLocalSettings.label = (0, nls_1.localize)('userSettings', "User");
            this.userRemoteSettings.label = (0, nls_1.localize)('userSettingsRemote', "Remote") + (hostLabel ? ` [${hostLabel}]` : '');
            this.workspaceSettings.label = (0, nls_1.localize)('workspaceSettings', "Workspace");
            this.folderSettingsAction.label = (0, nls_1.localize)('folderSettings', "Folder");
        }
        create(parent) {
            const settingsTabsWidget = DOM.append(parent, DOM.$('.settings-tabs-widget'));
            this.settingsSwitcherBar = this._register(new actionbar_1.ActionBar(settingsTabsWidget, {
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                focusOnlyEnabledItems: true,
                ariaLabel: (0, nls_1.localize)('settingsSwitcherBarAriaLabel', "Settings Switcher"),
                animated: false,
                actionViewItemProvider: (action) => action.id === 'folderSettings' ? this.folderSettings : undefined
            }));
            this.userLocalSettings = new actions_1.Action('userSettings', '', '.settings-tab', true, () => this.updateTarget(3 /* ConfigurationTarget.USER_LOCAL */));
            this.userLocalSettings.tooltip = (0, nls_1.localize)('userSettings', "User");
            this.userRemoteSettings = new actions_1.Action('userSettingsRemote', '', '.settings-tab', true, () => this.updateTarget(4 /* ConfigurationTarget.USER_REMOTE */));
            const remoteAuthority = this.environmentService.remoteAuthority;
            const hostLabel = remoteAuthority && this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority);
            this.userRemoteSettings.tooltip = (0, nls_1.localize)('userSettingsRemote', "Remote") + (hostLabel ? ` [${hostLabel}]` : '');
            this.workspaceSettings = new actions_1.Action('workspaceSettings', '', '.settings-tab', false, () => this.updateTarget(5 /* ConfigurationTarget.WORKSPACE */));
            this.folderSettingsAction = new actions_1.Action('folderSettings', '', '.settings-tab', false, async (folder) => {
                this.updateTarget((0, workspace_1.isWorkspaceFolder)(folder) ? folder.uri : 3 /* ConfigurationTarget.USER_LOCAL */);
            });
            this.folderSettings = this.instantiationService.createInstance(FolderSettingsActionViewItem, this.folderSettingsAction);
            this.resetLabels();
            this.update();
            this.settingsSwitcherBar.push([this.userLocalSettings, this.userRemoteSettings, this.workspaceSettings, this.folderSettingsAction]);
        }
        get settingsTarget() {
            return this._settingsTarget;
        }
        set settingsTarget(settingsTarget) {
            this._settingsTarget = settingsTarget;
            this.userLocalSettings.checked = 3 /* ConfigurationTarget.USER_LOCAL */ === this.settingsTarget;
            this.userRemoteSettings.checked = 4 /* ConfigurationTarget.USER_REMOTE */ === this.settingsTarget;
            this.workspaceSettings.checked = 5 /* ConfigurationTarget.WORKSPACE */ === this.settingsTarget;
            if (this.settingsTarget instanceof uri_1.URI) {
                this.folderSettings.action.checked = true;
                this.folderSettings.folder = this.contextService.getWorkspaceFolder(this.settingsTarget);
            }
            else {
                this.folderSettings.action.checked = false;
            }
        }
        setResultCount(settingsTarget, count) {
            if (settingsTarget === 5 /* ConfigurationTarget.WORKSPACE */) {
                let label = (0, nls_1.localize)('workspaceSettings', "Workspace");
                if (count) {
                    label += ` (${count})`;
                }
                this.workspaceSettings.label = label;
            }
            else if (settingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                let label = (0, nls_1.localize)('userSettings', "User");
                if (count) {
                    label += ` (${count})`;
                }
                this.userLocalSettings.label = label;
            }
            else if (settingsTarget instanceof uri_1.URI) {
                this.folderSettings.setCount(settingsTarget, count);
            }
        }
        updateLanguageFilterIndicators(filter) {
            this.resetLabels();
            if (filter) {
                const languageToUse = this.languageService.getLanguageName(filter);
                if (languageToUse) {
                    const languageSuffix = ` [${languageToUse}]`;
                    this.userLocalSettings.label += languageSuffix;
                    this.userRemoteSettings.label += languageSuffix;
                    this.workspaceSettings.label += languageSuffix;
                    this.folderSettingsAction.label += languageSuffix;
                }
            }
        }
        onWorkbenchStateChanged() {
            this.folderSettings.folder = null;
            this.update();
            if (this.settingsTarget === 5 /* ConfigurationTarget.WORKSPACE */ && this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                this.updateTarget(3 /* ConfigurationTarget.USER_LOCAL */);
            }
        }
        updateTarget(settingsTarget) {
            const isSameTarget = this.settingsTarget === settingsTarget ||
                settingsTarget instanceof uri_1.URI &&
                    this.settingsTarget instanceof uri_1.URI &&
                    (0, resources_1.isEqual)(this.settingsTarget, settingsTarget);
            if (!isSameTarget) {
                this.settingsTarget = settingsTarget;
                this._onDidTargetChange.fire(this.settingsTarget);
            }
            return Promise.resolve(undefined);
        }
        async update() {
            this.settingsSwitcherBar.domNode.classList.toggle('empty-workbench', this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */);
            this.userRemoteSettings.enabled = !!(this.options.enableRemoteSettings && this.environmentService.remoteAuthority);
            this.workspaceSettings.enabled = this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */;
            this.folderSettings.action.enabled = this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && this.contextService.getWorkspace().folders.length > 0;
            this.workspaceSettings.tooltip = (0, nls_1.localize)('workspaceSettings', "Workspace");
        }
    };
    exports.SettingsTargetsWidget = SettingsTargetsWidget;
    exports.SettingsTargetsWidget = SettingsTargetsWidget = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, label_1.ILabelService),
        __param(6, language_1.ILanguageService)
    ], SettingsTargetsWidget);
    let SearchWidget = class SearchWidget extends widget_1.Widget {
        constructor(parent, options, contextViewService, instantiationService, contextKeyService, keybindingService) {
            super();
            this.options = options;
            this.contextViewService = contextViewService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.keybindingService = keybindingService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onFocus = this._register(new event_1.Emitter());
            this.onFocus = this._onFocus.event;
            this.create(parent);
        }
        create(parent) {
            this.domNode = DOM.append(parent, DOM.$('div.settings-header-widget'));
            this.createSearchContainer(DOM.append(this.domNode, DOM.$('div.settings-search-container')));
            this.controlsDiv = DOM.append(this.domNode, DOM.$('div.settings-search-controls'));
            if (this.options.showResultCount) {
                this.countElement = DOM.append(this.controlsDiv, DOM.$('.settings-count-widget'));
                this.countElement.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeBackground);
                this.countElement.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeForeground);
                this.countElement.style.border = `1px solid ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.contrastBorder)}`;
            }
            this.inputBox.inputElement.setAttribute('aria-live', this.options.ariaLive || 'off');
            if (this.options.ariaLabelledBy) {
                this.inputBox.inputElement.setAttribute('aria-labelledBy', this.options.ariaLabelledBy);
            }
            const focusTracker = this._register(DOM.trackFocus(this.inputBox.inputElement));
            this._register(focusTracker.onDidFocus(() => this._onFocus.fire()));
            const focusKey = this.options.focusKey;
            if (focusKey) {
                this._register(focusTracker.onDidFocus(() => focusKey.set(true)));
                this._register(focusTracker.onDidBlur(() => focusKey.set(false)));
            }
        }
        createSearchContainer(searchContainer) {
            this.searchContainer = searchContainer;
            const searchInput = DOM.append(this.searchContainer, DOM.$('div.settings-search-input'));
            this.inputBox = this._register(this.createInputBox(searchInput));
            this._register(this.inputBox.onDidChange(value => this._onDidChange.fire(value)));
        }
        createInputBox(parent) {
            const showHistoryHint = () => (0, historyWidgetKeybindingHint_1.showHistoryKeybindingHint)(this.keybindingService);
            const box = this._register(new contextScopedHistoryWidget_1.ContextScopedHistoryInputBox(parent, this.contextViewService, { ...this.options, showHistoryHint }, this.contextKeyService));
            return box;
        }
        showMessage(message) {
            // Avoid setting the aria-label unnecessarily, the screenreader will read the count every time it's set, since it's aria-live:assertive. #50968
            if (this.countElement && message !== this.countElement.textContent) {
                this.countElement.textContent = message;
                this.inputBox.inputElement.setAttribute('aria-label', message);
                this.inputBox.inputElement.style.paddingRight = this.getControlsWidth() + 'px';
            }
        }
        layout(dimension) {
            if (dimension.width < 400) {
                this.countElement?.classList.add('hide');
                this.inputBox.inputElement.style.paddingRight = '0px';
            }
            else {
                this.countElement?.classList.remove('hide');
                this.inputBox.inputElement.style.paddingRight = this.getControlsWidth() + 'px';
            }
        }
        getControlsWidth() {
            const countWidth = this.countElement ? DOM.getTotalWidth(this.countElement) : 0;
            return countWidth + 20;
        }
        focus() {
            this.inputBox.focus();
            if (this.getValue()) {
                this.inputBox.select();
            }
        }
        hasFocus() {
            return this.inputBox.hasFocus();
        }
        clear() {
            this.inputBox.value = '';
        }
        getValue() {
            return this.inputBox.value;
        }
        setValue(value) {
            return this.inputBox.value = value;
        }
        dispose() {
            this.options.focusKey?.set(false);
            super.dispose();
        }
    };
    exports.SearchWidget = SearchWidget;
    exports.SearchWidget = SearchWidget = __decorate([
        __param(2, contextView_1.IContextViewService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, keybinding_1.IKeybindingService)
    ], SearchWidget);
    class EditPreferenceWidget extends lifecycle_1.Disposable {
        constructor(editor) {
            super();
            this.editor = editor;
            this._line = -1;
            this._preferences = [];
            this._editPreferenceDecoration = this.editor.createDecorationsCollection();
            this._onClick = this._register(new event_1.Emitter());
            this.onClick = this._onClick.event;
            this._register(this.editor.onMouseDown((e) => {
                if (e.target.type !== 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ || e.target.detail.isAfterLines || !this.isVisible()) {
                    return;
                }
                this._onClick.fire(e);
            }));
        }
        get preferences() {
            return this._preferences;
        }
        getLine() {
            return this._line;
        }
        show(line, hoverMessage, preferences) {
            this._preferences = preferences;
            const newDecoration = [];
            this._line = line;
            newDecoration.push({
                options: {
                    description: 'edit-preference-widget-decoration',
                    glyphMarginClassName: themables_1.ThemeIcon.asClassName(preferencesIcons_1.settingsEditIcon),
                    glyphMarginHoverMessage: new htmlContent_1.MarkdownString().appendText(hoverMessage),
                    stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                },
                range: {
                    startLineNumber: line,
                    startColumn: 1,
                    endLineNumber: line,
                    endColumn: 1
                }
            });
            this._editPreferenceDecoration.set(newDecoration);
        }
        hide() {
            this._editPreferenceDecoration.clear();
        }
        isVisible() {
            return this._editPreferenceDecoration.length > 0;
        }
        dispose() {
            this.hide();
            super.dispose();
        }
    }
    exports.EditPreferenceWidget = EditPreferenceWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXNXaWRnZXRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL3ByZWZlcmVuY2VzV2lkZ2V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpQ3pGLElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTZCLFNBQVEsb0NBQWtCO1FBV25FLFlBQ0MsTUFBZSxFQUNXLGNBQXlELEVBQzlELGtCQUF3RDtZQUU3RSxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBSHVCLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUM3Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBWHRFLHlCQUFvQixHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBY3hELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDckQsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUM1RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pHLENBQUM7UUFFRCxJQUFJLE1BQU07WUFDVCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckIsQ0FBQztRQUVELElBQUksTUFBTSxDQUFDLE1BQStCO1lBQ3pDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxN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