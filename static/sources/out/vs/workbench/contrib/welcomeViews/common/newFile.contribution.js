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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/types", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, lifecycle_1, types_1, nls_1, actions_1, commands_1, contextkey_1, keybinding_1, quickInput_1, platform_1, contributions_1) {
    "use strict";
    var NewFileTemplatesManager_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const builtInSource = (0, nls_1.localize)('Built-In', "Built-In");
    const category = (0, nls_1.localize2)('Create', 'Create');
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'welcome.showNewFileEntries',
                title: (0, nls_1.localize2)('welcome.newFile', 'New File...'),
                category,
                f1: true,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ + 2048 /* KeyMod.CtrlCmd */ + 256 /* KeyMod.WinCtrl */ + 44 /* KeyCode.KeyN */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                },
                menu: {
                    id: actions_1.MenuId.MenubarFileMenu,
                    group: '1_new',
                    order: 2
                }
            });
        }
        async run(accessor) {
            return (0, types_1.assertIsDefined)(NewFileTemplatesManager.Instance).run();
        }
    });
    let NewFileTemplatesManager = class NewFileTemplatesManager extends lifecycle_1.Disposable {
        static { NewFileTemplatesManager_1 = this; }
        constructor(quickInputService, contextKeyService, commandService, keybindingService, menuService) {
            super();
            this.quickInputService = quickInputService;
            this.contextKeyService = contextKeyService;
            this.commandService = commandService;
            this.keybindingService = keybindingService;
            NewFileTemplatesManager_1.Instance = this;
            this._register({ dispose() { if (NewFileTemplatesManager_1.Instance === this) {
                    NewFileTemplatesManager_1.Instance = undefined;
                } } });
            this.menu = menuService.createMenu(actions_1.MenuId.NewFile, contextKeyService);
        }
        allEntries() {
            const items = [];
            for (const [groupName, group] of this.menu.getActions({ renderShortTitle: true })) {
                for (const action of group) {
                    if (action instanceof actions_1.MenuItemAction) {
                        items.push({ commandID: action.item.id, from: action.item.source?.title ?? builtInSource, title: action.label, group: groupName });
                    }
                }
            }
            return items;
        }
        async run() {
            const entries = this.allEntries();
            if (entries.length === 0) {
                throw Error('Unexpected empty new items list');
            }
            else if (entries.length === 1) {
                this.commandService.executeCommand(entries[0].commandID);
                return true;
            }
            else {
                return this.selectNewEntry(entries);
            }
        }
        async selectNewEntry(entries) {
            let resolveResult;
            const resultPromise = new Promise(resolve => {
                resolveResult = resolve;
            });
            const disposables = new lifecycle_1.DisposableStore();
            const qp = this.quickInputService.createQuickPick();
            qp.title = (0, nls_1.localize)('newFileTitle', "New File...");
            qp.placeholder = (0, nls_1.localize)('newFilePlaceholder', "Select File Type or Enter File Name...");
            qp.sortByLabel = false;
            qp.matchOnDetail = true;
            qp.matchOnDescription = true;
            const sortCategories = (a, b) => {
                const categoryPriority = { 'file': 1, 'notebook': 2 };
                if (categoryPriority[a.group] && categoryPriority[b.group]) {
                    if (categoryPriority[a.group] !== categoryPriority[b.group]) {
                        return categoryPriority[b.group] - categoryPriority[a.group];
                    }
                }
                else if (categoryPriority[a.group]) {
                    return 1;
                }
                else if (categoryPriority[b.group]) {
                    return -1;
                }
                if (a.from === builtInSource) {
                    return 1;
                }
                if (b.from === builtInSource) {
                    return -1;
                }
                return a.from.localeCompare(b.from);
            };
            const displayCategory = {
                'file': (0, nls_1.localize)('file', "File"),
                'notebook': (0, nls_1.localize)('notebook', "Notebook"),
            };
            const refreshQp = (entries) => {
                const items = [];
                let lastSeparator;
                entries
                    .sort((a, b) => -sortCategories(a, b))
                    .forEach((entry) => {
                    const command = entry.commandID;
                    const keybinding = this.keybindingService.lookupKeybinding(command || '', this.contextKeyService);
                    if (lastSeparator !== entry.group) {
                        items.push({
                            type: 'separator',
                            label: displayCategory[entry.group] ?? entry.group
                        });
                        lastSeparator = entry.group;
                    }
                    items.push({
                        ...entry,
                        label: entry.title,
                        type: 'item',
                        keybinding,
                        buttons: command ? [
                            {
                                iconClass: 'codicon codicon-gear',
                                tooltip: (0, nls_1.localize)('change keybinding', "Configure Keybinding")
                            }
                        ] : [],
                        detail: '',
                        description: entry.from,
                    });
                });
                qp.items = items;
            };
            refreshQp(entries);
            disposables.add(this.menu.onDidChange(() => refreshQp(this.allEntries())));
            disposables.add(qp.onDidChangeValue((val) => {
                if (val === '') {
                    refreshQp(entries);
                    return;
                }
                const currentTextEntry = {
                    commandID: 'workbench.action.files.newFile',
                    commandArgs: { languageId: undefined, viewType: undefined, fileName: val },
                    title: (0, nls_1.localize)('miNewFileWithName', "Create New File ({0})", val),
                    group: 'file',
                    from: builtInSource,
                };
                refreshQp([currentTextEntry, ...entries]);
            }));
            disposables.add(qp.onDidAccept(async (e) => {
                const selected = qp.selectedItems[0];
                resolveResult(!!selected);
                qp.hide();
                if (selected) {
                    await this.commandService.executeCommand(selected.commandID, selected.commandArgs);
                }
            }));
            disposables.add(qp.onDidHide(() => {
                qp.dispose();
                disposables.dispose();
                resolveResult(false);
            }));
            disposables.add(qp.onDidTriggerItemButton(e => {
                qp.hide();
                this.commandService.executeCommand('workbench.action.openGlobalKeybindings', e.item.commandID);
                resolveResult(false);
            }));
            qp.show();
            return resultPromise;
        }
    };
    NewFileTemplatesManager = NewFileTemplatesManager_1 = __decorate([
        __param(0, quickInput_1.IQuickInputService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, commands_1.ICommandService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, actions_1.IMenuService)
    ], NewFileTemplatesManager);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(NewFileTemplatesManager, 3 /* LifecyclePhase.Restored */);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NewFile, {
        group: 'file',
        command: {
            id: 'workbench.action.files.newUntitledFile',
            title: (0, nls_1.localize)('miNewFile2', "Text File")
        },
        order: 1
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3RmlsZS5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3dlbGNvbWVWaWV3cy9jb21tb24vbmV3RmlsZS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0JoRyxNQUFNLGFBQWEsR0FBRyxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdkQsTUFBTSxRQUFRLEdBQXFCLElBQUEsZUFBUyxFQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUVqRSxJQUFBLHlCQUFlLEVBQUMsS0FBTSxTQUFRLGlCQUFPO1FBQ3BDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw0QkFBNEI7Z0JBQ2hDLEtBQUssRUFBRSxJQUFBLGVBQVMsRUFBQyxpQkFBaUIsRUFBRSxhQUFhLENBQUM7Z0JBQ2xELFFBQVE7Z0JBQ1IsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsVUFBVSxFQUFFO29CQUNYLE9BQU8sRUFBRSxnREFBMkIsMkJBQWlCLHdCQUFlO29CQUNwRSxNQUFNLDZDQUFtQztpQkFDekM7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGVBQWU7b0JBQzFCLEtBQUssRUFBRSxPQUFPO29CQUNkLEtBQUssRUFBRSxDQUFDO2lCQUNSO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsT0FBTyxJQUFBLHVCQUFlLEVBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEUsQ0FBQztLQUNELENBQUMsQ0FBQztJQUdILElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXdCLFNBQVEsc0JBQVU7O1FB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