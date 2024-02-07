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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry"], function (require, exports, actions_1, themables_1, event_1, lifecycle_1, linkedList_1, commands_1, contextkey_1, instantiation_1, keybindingsRegistry_1) {
    "use strict";
    var MenuItemAction_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerAction2 = exports.Action2 = exports.MenuItemAction = exports.SubmenuItemAction = exports.MenuRegistry = exports.IMenuService = exports.MenuId = exports.isISubmenuItem = exports.isIMenuItem = void 0;
    function isIMenuItem(item) {
        return item.command !== undefined;
    }
    exports.isIMenuItem = isIMenuItem;
    function isISubmenuItem(item) {
        return item.submenu !== undefined;
    }
    exports.isISubmenuItem = isISubmenuItem;
    class MenuId {
        static { this._instances = new Map(); }
        static { this.CommandPalette = new MenuId('CommandPalette'); }
        static { this.DebugBreakpointsContext = new MenuId('DebugBreakpointsContext'); }
        static { this.DebugCallStackContext = new MenuId('DebugCallStackContext'); }
        static { this.DebugConsoleContext = new MenuId('DebugConsoleContext'); }
        static { this.DebugVariablesContext = new MenuId('DebugVariablesContext'); }
        static { this.DebugHoverContext = new MenuId('DebugHoverContext'); }
        static { this.DebugWatchContext = new MenuId('DebugWatchContext'); }
        static { this.DebugToolBar = new MenuId('DebugToolBar'); }
        static { this.DebugToolBarStop = new MenuId('DebugToolBarStop'); }
        static { this.EditorContext = new MenuId('EditorContext'); }
        static { this.SimpleEditorContext = new MenuId('SimpleEditorContext'); }
        static { this.EditorContent = new MenuId('EditorContent'); }
        static { this.EditorLineNumberContext = new MenuId('EditorLineNumberContext'); }
        static { this.EditorContextCopy = new MenuId('EditorContextCopy'); }
        static { this.EditorContextPeek = new MenuId('EditorContextPeek'); }
        static { this.EditorContextShare = new MenuId('EditorContextShare'); }
        static { this.EditorTitle = new MenuId('EditorTitle'); }
        static { this.EditorTitleRun = new MenuId('EditorTitleRun'); }
        static { this.EditorTitleContext = new MenuId('EditorTitleContext'); }
        static { this.EditorTitleContextShare = new MenuId('EditorTitleContextShare'); }
        static { this.EmptyEditorGroup = new MenuId('EmptyEditorGroup'); }
        static { this.EmptyEditorGroupContext = new MenuId('EmptyEditorGroupContext'); }
        static { this.EditorTabsBarContext = new MenuId('EditorTabsBarContext'); }
        static { this.EditorTabsBarShowTabsSubmenu = new MenuId('EditorTabsBarShowTabsSubmenu'); }
        static { this.EditorTabsBarShowTabsZenModeSubmenu = new MenuId('EditorTabsBarShowTabsZenModeSubmenu'); }
        static { this.EditorActionsPositionSubmenu = new MenuId('EditorActionsPositionSubmenu'); }
        static { this.ExplorerContext = new MenuId('ExplorerContext'); }
        static { this.ExplorerContextShare = new MenuId('ExplorerContextShare'); }
        static { this.ExtensionContext = new MenuId('ExtensionContext'); }
        static { this.GlobalActivity = new MenuId('GlobalActivity'); }
        static { this.CommandCenter = new MenuId('CommandCenter'); }
        static { this.CommandCenterCenter = new MenuId('CommandCenterCenter'); }
        static { this.LayoutControlMenuSubmenu = new MenuId('LayoutControlMenuSubmenu'); }
        static { this.LayoutControlMenu = new MenuId('LayoutControlMenu'); }
        static { this.MenubarMainMenu = new MenuId('MenubarMainMenu'); }
        static { this.MenubarAppearanceMenu = new MenuId('MenubarAppearanceMenu'); }
        static { this.MenubarDebugMenu = new MenuId('MenubarDebugMenu'); }
        static { this.MenubarEditMenu = new MenuId('MenubarEditMenu'); }
        static { this.MenubarCopy = new MenuId('MenubarCopy'); }
        static { this.MenubarFileMenu = new MenuId('MenubarFileMenu'); }
        static { this.MenubarGoMenu = new MenuId('MenubarGoMenu'); }
        static { this.MenubarHelpMenu = new MenuId('MenubarHelpMenu'); }
        static { this.MenubarLayoutMenu = new MenuId('MenubarLayoutMenu'); }
        static { this.MenubarNewBreakpointMenu = new MenuId('MenubarNewBreakpointMenu'); }
        static { this.PanelAlignmentMenu = new MenuId('PanelAlignmentMenu'); }
        static { this.PanelPositionMenu = new MenuId('PanelPositionMenu'); }
        static { this.ActivityBarPositionMenu = new MenuId('ActivityBarPositionMenu'); }
        static { this.MenubarPreferencesMenu = new MenuId('MenubarPreferencesMenu'); }
        static { this.MenubarRecentMenu = new MenuId('MenubarRecentMenu'); }
        static { this.MenubarSelectionMenu = new MenuId('MenubarSelectionMenu'); }
        static { this.MenubarShare = new MenuId('MenubarShare'); }
        static { this.MenubarSwitchEditorMenu = new MenuId('MenubarSwitchEditorMenu'); }
        static { this.MenubarSwitchGroupMenu = new MenuId('MenubarSwitchGroupMenu'); }
        static { this.MenubarTerminalMenu = new MenuId('MenubarTerminalMenu'); }
        static { this.MenubarViewMenu = new MenuId('MenubarViewMenu'); }
        static { this.MenubarHomeMenu = new MenuId('MenubarHomeMenu'); }
        static { this.OpenEditorsContext = new MenuId('OpenEditorsContext'); }
        static { this.OpenEditorsContextShare = new MenuId('OpenEditorsContextShare'); }
        static { this.ProblemsPanelContext = new MenuId('ProblemsPanelContext'); }
        static { this.SCMInputBox = new MenuId('SCMInputBox'); }
        static { this.SCMIncomingChanges = new MenuId('SCMIncomingChanges'); }
        static { this.SCMOutgoingChanges = new MenuId('SCMOutgoingChanges'); }
        static { this.SCMIncomingChangesAllChangesContext = new MenuId('SCMIncomingChangesAllChangesContext'); }
        static { this.SCMIncomingChangesHistoryItemContext = new MenuId('SCMIncomingChangesHistoryItemContext'); }
        static { this.SCMOutgoingChangesAllChangesContext = new MenuId('SCMOutgoingChangesAllChangesContext'); }
        static { this.SCMOutgoingChangesHistoryItemContext = new MenuId('SCMOutgoingChangesHistoryItemContext'); }
        static { this.SCMChangeContext = new MenuId('SCMChangeContext'); }
        static { this.SCMResourceContext = new MenuId('SCMResourceContext'); }
        static { this.SCMResourceContextShare = new MenuId('SCMResourceContextShare'); }
        static { this.SCMResourceFolderContext = new MenuId('SCMResourceFolderContext'); }
        static { this.SCMResourceGroupContext = new MenuId('SCMResourceGroupContext'); }
        static { this.SCMSourceControl = new MenuId('SCMSourceControl'); }
        static { this.SCMSourceControlInline = new MenuId('SCMSourceControlInline'); }
        static { this.SCMTitle = new MenuId('SCMTitle'); }
        static { this.SearchContext = new MenuId('SearchContext'); }
        static { this.SearchActionMenu = new MenuId('SearchActionContext'); }
        static { this.StatusBarWindowIndicatorMenu = new MenuId('StatusBarWindowIndicatorMenu'); }
        static { this.StatusBarRemoteIndicatorMenu = new MenuId('StatusBarRemoteIndicatorMenu'); }
        static { this.StickyScrollContext = new MenuId('StickyScrollContext'); }
        static { this.TestItem = new MenuId('TestItem'); }
        static { this.TestItemGutter = new MenuId('TestItemGutter'); }
        static { this.TestMessageContext = new MenuId('TestMessageContext'); }
        static { this.TestMessageContent = new MenuId('TestMessageContent'); }
        static { this.TestPeekElement = new MenuId('TestPeekElement'); }
        static { this.TestPeekTitle = new MenuId('TestPeekTitle'); }
        static { this.TouchBarContext = new MenuId('TouchBarContext'); }
        static { this.TitleBarContext = new MenuId('TitleBarContext'); }
        static { this.TitleBarTitleContext = new MenuId('TitleBarTitleContext'); }
        static { this.TunnelContext = new MenuId('TunnelContext'); }
        static { this.TunnelPrivacy = new MenuId('TunnelPrivacy'); }
        static { this.TunnelProtocol = new MenuId('TunnelProtocol'); }
        static { this.TunnelPortInline = new MenuId('TunnelInline'); }
        static { this.TunnelTitle = new MenuId('TunnelTitle'); }
        static { this.TunnelLocalAddressInline = new MenuId('TunnelLocalAddressInline'); }
        static { this.TunnelOriginInline = new MenuId('TunnelOriginInline'); }
        static { this.ViewItemContext = new MenuId('ViewItemContext'); }
        static { this.ViewContainerTitle = new MenuId('ViewContainerTitle'); }
        static { this.ViewContainerTitleContext = new MenuId('ViewContainerTitleContext'); }
        static { this.ViewTitle = new MenuId('ViewTitle'); }
        static { this.ViewTitleContext = new MenuId('ViewTitleContext'); }
        static { this.CommentEditorActions = new MenuId('CommentEditorActions'); }
        static { this.CommentThreadTitle = new MenuId('CommentThreadTitle'); }
        static { this.CommentThreadActions = new MenuId('CommentThreadActions'); }
        static { this.CommentThreadAdditionalActions = new MenuId('CommentThreadAdditionalActions'); }
        static { this.CommentThreadTitleContext = new MenuId('CommentThreadTitleContext'); }
        static { this.CommentThreadCommentContext = new MenuId('CommentThreadCommentContext'); }
        static { this.CommentTitle = new MenuId('CommentTitle'); }
        static { this.CommentActions = new MenuId('CommentActions'); }
        static { this.InteractiveToolbar = new MenuId('InteractiveToolbar'); }
        static { this.InteractiveCellTitle = new MenuId('InteractiveCellTitle'); }
        static { this.InteractiveCellDelete = new MenuId('InteractiveCellDelete'); }
        static { this.InteractiveCellExecute = new MenuId('InteractiveCellExecute'); }
        static { this.InteractiveInputExecute = new MenuId('InteractiveInputExecute'); }
        static { this.NotebookToolbar = new MenuId('NotebookToolbar'); }
        static { this.NotebookStickyScrollContext = new MenuId('NotebookStickyScrollContext'); }
        static { this.NotebookCellTitle = new MenuId('NotebookCellTitle'); }
        static { this.NotebookCellDelete = new MenuId('NotebookCellDelete'); }
        static { this.NotebookCellInsert = new MenuId('NotebookCellInsert'); }
        static { this.NotebookCellBetween = new MenuId('NotebookCellBetween'); }
        static { this.NotebookCellListTop = new MenuId('NotebookCellTop'); }
        static { this.NotebookCellExecute = new MenuId('NotebookCellExecute'); }
        static { this.NotebookCellExecutePrimary = new MenuId('NotebookCellExecutePrimary'); }
        static { this.NotebookDiffCellInputTitle = new MenuId('NotebookDiffCellInputTitle'); }
        static { this.NotebookDiffCellMetadataTitle = new MenuId('NotebookDiffCellMetadataTitle'); }
        static { this.NotebookDiffCellOutputsTitle = new MenuId('NotebookDiffCellOutputsTitle'); }
        static { this.NotebookOutputToolbar = new MenuId('NotebookOutputToolbar'); }
        static { this.NotebookEditorLayoutConfigure = new MenuId('NotebookEditorLayoutConfigure'); }
        static { this.NotebookKernelSource = new MenuId('NotebookKernelSource'); }
        static { this.BulkEditTitle = new MenuId('BulkEditTitle'); }
        static { this.BulkEditContext = new MenuId('BulkEditContext'); }
        static { this.TimelineItemContext = new MenuId('TimelineItemContext'); }
        static { this.TimelineTitle = new MenuId('TimelineTitle'); }
        static { this.TimelineTitleContext = new MenuId('TimelineTitleContext'); }
        static { this.TimelineFilterSubMenu = new MenuId('TimelineFilterSubMenu'); }
        static { this.AccountsContext = new MenuId('AccountsContext'); }
        static { this.SidebarTitle = new MenuId('SidebarTitle'); }
        static { this.PanelTitle = new MenuId('PanelTitle'); }
        static { this.AuxiliaryBarTitle = new MenuId('AuxiliaryBarTitle'); }
        static { this.TerminalInstanceContext = new MenuId('TerminalInstanceContext'); }
        static { this.TerminalEditorInstanceContext = new MenuId('TerminalEditorInstanceContext'); }
        static { this.TerminalNewDropdownContext = new MenuId('TerminalNewDropdownContext'); }
        static { this.TerminalTabContext = new MenuId('TerminalTabContext'); }
        static { this.TerminalTabEmptyAreaContext = new MenuId('TerminalTabEmptyAreaContext'); }
        static { this.TerminalStickyScrollContext = new MenuId('TerminalStickyScrollContext'); }
        static { this.WebviewContext = new MenuId('WebviewContext'); }
        static { this.InlineCompletionsActions = new MenuId('InlineCompletionsActions'); }
        static { this.NewFile = new MenuId('NewFile'); }
        static { this.MergeInput1Toolbar = new MenuId('MergeToolbar1Toolbar'); }
        static { this.MergeInput2Toolbar = new MenuId('MergeToolbar2Toolbar'); }
        static { this.MergeBaseToolbar = new MenuId('MergeBaseToolbar'); }
        static { this.MergeInputResultToolbar = new MenuId('MergeToolbarResultToolbar'); }
        static { this.InlineSuggestionToolbar = new MenuId('InlineSuggestionToolbar'); }
        static { this.ChatContext = new MenuId('ChatContext'); }
        static { this.ChatCodeBlock = new MenuId('ChatCodeblock'); }
        static { this.ChatMessageTitle = new MenuId('ChatMessageTitle'); }
        static { this.ChatExecute = new MenuId('ChatExecute'); }
        static { this.ChatInputSide = new MenuId('ChatInputSide'); }
        static { this.AccessibleView = new MenuId('AccessibleView'); }
        static { this.MultiDiffEditorFileToolbar = new MenuId('MultiDiffEditorFileToolbar'); }
        /**
         * Create or reuse a `MenuId` with the given identifier
         */
        static for(identifier) {
            return MenuId._instances.get(identifier) ?? new MenuId(identifier);
        }
        /**
         * Create a new `MenuId` with the unique identifier. Will throw if a menu
         * with the identifier already exists, use `MenuId.for(ident)` or a unique
         * identifier
         */
        constructor(identifier) {
            if (MenuId._instances.has(identifier)) {
                throw new TypeError(`MenuId with identifier '${identifier}' already exists. Use MenuId.for(ident) or a unique identifier`);
            }
            MenuId._instances.set(identifier, this);
            this.id = identifier;
        }
    }
    exports.MenuId = MenuId;
    exports.IMenuService = (0, instantiation_1.createDecorator)('menuService');
    class MenuRegistryChangeEvent {
        static { this._all = new Map(); }
        static for(id) {
            let value = this._all.get(id);
            if (!value) {
                value = new MenuRegistryChangeEvent(id);
                this._all.set(id, value);
            }
            return value;
        }
        static merge(events) {
            const ids = new Set();
            for (const item of events) {
                if (item instanceof MenuRegistryChangeEvent) {
                    ids.add(item.id);
                }
            }
            return ids;
        }
        constructor(id) {
            this.id = id;
            this.has = candidate => candidate === id;
        }
    }
    exports.MenuRegistry = new class {
        constructor() {
            this._commands = new Map();
            this._menuItems = new Map();
            this._onDidChangeMenu = new event_1.MicrotaskEmitter({
                merge: MenuRegistryChangeEvent.merge
            });
            this.onDidChangeMenu = this._onDidChangeMenu.event;
        }
        addCommand(command) {
            this._commands.set(command.id, command);
            this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(MenuId.CommandPalette));
            return (0, lifecycle_1.toDisposable)(() => {
                if (this._commands.delete(command.id)) {
                    this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(MenuId.CommandPalette));
                }
            });
        }
        getCommand(id) {
            return this._commands.get(id);
        }
        getCommands() {
            const map = new Map();
            this._commands.forEach((value, key) => map.set(key, value));
            return map;
        }
        appendMenuItem(id, item) {
            let list = this._menuItems.get(id);
            if (!list) {
                list = new linkedList_1.LinkedList();
                this._menuItems.set(id, list);
            }
            const rm = list.push(item);
            this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(id));
            return (0, lifecycle_1.toDisposable)(() => {
                rm();
                this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(id));
            });
        }
        appendMenuItems(items) {
            const result = new lifecycle_1.DisposableStore();
            for (const { id, item } of items) {
                result.add(this.appendMenuItem(id, item));
            }
            return result;
        }
        getMenuItems(id) {
            let result;
            if (this._menuItems.has(id)) {
                result = [...this._menuItems.get(id)];
            }
            else {
                result = [];
            }
            if (id === MenuId.CommandPalette) {
                // CommandPalette is special because it shows
                // all commands by default
                this._appendImplicitItems(result);
            }
            return result;
        }
        _appendImplicitItems(result) {
            const set = new Set();
            for (const item of result) {
                if (isIMenuItem(item)) {
                    set.add(item.command.id);
                    if (item.alt) {
                        set.add(item.alt.id);
                    }
                }
            }
            this._commands.forEach((command, id) => {
                if (!set.has(id)) {
                    result.push({ command });
                }
            });
        }
    };
    class SubmenuItemAction extends actions_1.SubmenuAction {
        constructor(item, hideActions, actions) {
            super(`submenuitem.${item.submenu.id}`, typeof item.title === 'string' ? item.title : item.title.value, actions, 'submenu');
            this.item = item;
            this.hideActions = hideActions;
        }
    }
    exports.SubmenuItemAction = SubmenuItemAction;
    // implements IAction, does NOT extend Action, so that no one
    // subscribes to events of Action or modified properties
    let MenuItemAction = MenuItemAction_1 = class MenuItemAction {
        static label(action, options) {
            return options?.renderShortTitle && action.shortTitle
                ? (typeof action.shortTitle === 'string' ? action.shortTitle : action.shortTitle.value)
                : (typeof action.title === 'string' ? action.title : action.title.value);
        }
        constructor(item, alt, options, hideActions, contextKeyService, _commandService) {
            this.hideActions = hideActions;
            this._commandService = _commandService;
            this.id = item.id;
            this.label = MenuItemAction_1.label(item, options);
            this.tooltip = (typeof item.tooltip === 'string' ? item.tooltip : item.tooltip?.value) ?? '';
            this.enabled = !item.precondition || contextKeyService.contextMatchesRules(item.precondition);
            this.checked = undefined;
            let icon;
            if (item.toggled) {
                const toggled = (item.toggled.condition ? item.toggled : { condition: item.toggled });
                this.checked = contextKeyService.contextMatchesRules(toggled.condition);
                if (this.checked && toggled.tooltip) {
                    this.tooltip = typeof toggled.tooltip === 'string' ? toggled.tooltip : toggled.tooltip.value;
                }
                if (this.checked && themables_1.ThemeIcon.isThemeIcon(toggled.icon)) {
                    icon = toggled.icon;
                }
                if (this.checked && toggled.title) {
                    this.label = typeof toggled.title === 'string' ? toggled.title : toggled.title.value;
                }
            }
            if (!icon) {
                icon = themables_1.ThemeIcon.isThemeIcon(item.icon) ? item.icon : undefined;
            }
            this.item = item;
            this.alt = alt ? new MenuItemAction_1(alt, undefined, options, hideActions, contextKeyService, _commandService) : undefined;
            this._options = options;
            this.class = icon && themables_1.ThemeIcon.asClassName(icon);
        }
        run(...args) {
            let runArgs = [];
            if (this._options?.arg) {
                runArgs = [...runArgs, this._options.arg];
            }
            if (this._options?.shouldForwardArgs) {
                runArgs = [...runArgs, ...args];
            }
            return this._commandService.executeCommand(this.id, ...runArgs);
        }
    };
    exports.MenuItemAction = MenuItemAction;
    exports.MenuItemAction = MenuItemAction = MenuItemAction_1 = __decorate([
        __param(4, contextkey_1.IContextKeyService),
        __param(5, commands_1.ICommandService)
    ], MenuItemAction);
    class Action2 {
        constructor(desc) {
            this.desc = desc;
        }
    }
    exports.Action2 = Action2;
    function registerAction2(ctor) {
        const disposables = new lifecycle_1.DisposableStore();
        const action = new ctor();
        const { f1, menu, keybinding, ...command } = action.desc;
        if (commands_1.CommandsRegistry.getCommand(command.id)) {
            throw new Error(`Cannot register two commands with the same id: ${command.id}`);
        }
        // command
        disposables.add(commands_1.CommandsRegistry.registerCommand({
            id: command.id,
            handler: (accessor, ...args) => action.run(accessor, ...args),
            metadata: command.metadata,
        }));
        // menu
        if (Array.isArray(menu)) {
            for (const item of menu) {
                disposables.add(exports.MenuRegistry.appendMenuItem(item.id, { command: { ...command, precondition: item.precondition === null ? undefined : command.precondition }, ...item }));
            }
        }
        else if (menu) {
            disposables.add(exports.MenuRegistry.appendMenuItem(menu.id, { command: { ...command, precondition: menu.precondition === null ? undefined : command.precondition }, ...menu }));
        }
        if (f1) {
            disposables.add(exports.MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command, when: command.precondition }));
            disposables.add(exports.MenuRegistry.addCommand(command));
        }
        // keybinding
        if (Array.isArray(keybinding)) {
            for (const item of keybinding) {
                disposables.add(keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
                    ...item,
                    id: command.id,
                    when: command.precondition ? contextkey_1.ContextKeyExpr.and(command.precondition, item.when) : item.when
                }));
            }
        }
        else if (keybinding) {
            disposables.add(keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
                ...keybinding,
                id: command.id,
                when: command.precondition ? contextkey_1.ContextKeyExpr.and(command.precondition, keybinding.when) : keybinding.when
            }));
        }
        return disposables;
    }
    exports.registerAction2 = registerAction2;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vYWN0aW9ucy9jb21tb24vYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBa0NoRyxTQUFnQixXQUFXLENBQUMsSUFBUztRQUNwQyxPQUFRLElBQWtCLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQztJQUNsRCxDQUFDO0lBRkQsa0NBRUM7SUFFRCxTQUFnQixjQUFjLENBQUMsSUFBUztRQUN2QyxPQUFRLElBQXFCLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQztJQUNyRCxDQUFDO0lBRkQsd0NBRUM7SUFFRCxNQUFhLE1BQU07aUJBRU0sZUFBVSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO2lCQUUvQyxtQkFBYyxHQUFHLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7aUJBQzlDLDRCQUF1QixHQUFHLElBQUksTUFBTSxDQUFDLHlCQUF5QixDQUFDLENBQUM7aUJBQ2hFLDBCQUFxQixHQUFHLElBQUksTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7aUJBQzVELHdCQUFtQixHQUFHLElBQUksTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7aUJBQ3hELDBCQUFxQixHQUFHLElBQUksTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7aUJBQzVELHNCQUFpQixHQUFHLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUM7aUJBQ3BELHNCQUFpQixHQUFHLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUM7aUJBQ3BELGlCQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7aUJBQzFDLHFCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7aUJBQ2xELGtCQUFhLEdBQUcs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