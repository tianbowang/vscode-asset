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
define(["require", "exports", "vs/base/common/collections", "vs/base/common/event", "vs/base/common/types", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, collections_1, event_1, types_1, uri_1, instantiation_1, extHost_protocol_1, extHostRpcService_1, typeConverters, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostEditorTabs = exports.IExtHostEditorTabs = void 0;
    exports.IExtHostEditorTabs = (0, instantiation_1.createDecorator)('IExtHostEditorTabs');
    class ExtHostEditorTab {
        constructor(dto, parentGroup, activeTabIdGetter) {
            this._activeTabIdGetter = activeTabIdGetter;
            this._parentGroup = parentGroup;
            this.acceptDtoUpdate(dto);
        }
        get apiObject() {
            if (!this._apiObject) {
                // Don't want to lose reference to parent `this` in the getters
                const that = this;
                const obj = {
                    get isActive() {
                        // We use a getter function here to always ensure at most 1 active tab per group and prevent iteration for being required
                        return that._dto.id === that._activeTabIdGetter();
                    },
                    get label() {
                        return that._dto.label;
                    },
                    get input() {
                        return that._input;
                    },
                    get isDirty() {
                        return that._dto.isDirty;
                    },
                    get isPinned() {
                        return that._dto.isPinned;
                    },
                    get isPreview() {
                        return that._dto.isPreview;
                    },
                    get group() {
                        return that._parentGroup.apiObject;
                    }
                };
                this._apiObject = Object.freeze(obj);
            }
            return this._apiObject;
        }
        get tabId() {
            return this._dto.id;
        }
        acceptDtoUpdate(dto) {
            this._dto = dto;
            this._input = this._initInput();
        }
        _initInput() {
            switch (this._dto.input.kind) {
                case 1 /* TabInputKind.TextInput */:
                    return new extHostTypes_1.TextTabInput(uri_1.URI.revive(this._dto.input.uri));
                case 2 /* TabInputKind.TextDiffInput */:
                    return new extHostTypes_1.TextDiffTabInput(uri_1.URI.revive(this._dto.input.original), uri_1.URI.revive(this._dto.input.modified));
                case 3 /* TabInputKind.TextMergeInput */:
                    return new extHostTypes_1.TextMergeTabInput(uri_1.URI.revive(this._dto.input.base), uri_1.URI.revive(this._dto.input.input1), uri_1.URI.revive(this._dto.input.input2), uri_1.URI.revive(this._dto.input.result));
                case 6 /* TabInputKind.CustomEditorInput */:
                    return new extHostTypes_1.CustomEditorTabInput(uri_1.URI.revive(this._dto.input.uri), this._dto.input.viewType);
                case 7 /* TabInputKind.WebviewEditorInput */:
                    return new extHostTypes_1.WebviewEditorTabInput(this._dto.input.viewType);
                case 4 /* TabInputKind.NotebookInput */:
                    return new extHostTypes_1.NotebookEditorTabInput(uri_1.URI.revive(this._dto.input.uri), this._dto.input.notebookType);
                case 5 /* TabInputKind.NotebookDiffInput */:
                    return new extHostTypes_1.NotebookDiffEditorTabInput(uri_1.URI.revive(this._dto.input.original), uri_1.URI.revive(this._dto.input.modified), this._dto.input.notebookType);
                case 8 /* TabInputKind.TerminalEditorInput */:
                    return new extHostTypes_1.TerminalEditorTabInput();
                case 9 /* TabInputKind.InteractiveEditorInput */:
                    return new extHostTypes_1.InteractiveWindowInput(uri_1.URI.revive(this._dto.input.uri), uri_1.URI.revive(this._dto.input.inputBoxUri));
                case 10 /* TabInputKind.ChatEditorInput */:
                    return new extHostTypes_1.ChatEditorTabInput(this._dto.input.providerId);
                default:
                    return undefined;
            }
        }
    }
    class ExtHostEditorTabGroup {
        constructor(dto, activeGroupIdGetter) {
            this._tabs = [];
            this._activeTabId = '';
            this._dto = dto;
            this._activeGroupIdGetter = activeGroupIdGetter;
            // Construct all tabs from the given dto
            for (const tabDto of dto.tabs) {
                if (tabDto.isActive) {
                    this._activeTabId = tabDto.id;
                }
                this._tabs.push(new ExtHostEditorTab(tabDto, this, () => this.activeTabId()));
            }
        }
        get apiObject() {
            if (!this._apiObject) {
                // Don't want to lose reference to parent `this` in the getters
                const that = this;
                const obj = {
                    get isActive() {
                        // We use a getter function here to always ensure at most 1 active group and prevent iteration for being required
                        return that._dto.groupId === that._activeGroupIdGetter();
                    },
                    get viewColumn() {
                        return typeConverters.ViewColumn.to(that._dto.viewColumn);
                    },
                    get activeTab() {
                        return that._tabs.find(tab => tab.tabId === that._activeTabId)?.apiObject;
                    },
                    get tabs() {
                        return Object.freeze(that._tabs.map(tab => tab.apiObject));
                    }
                };
                this._apiObject = Object.freeze(obj);
            }
            return this._apiObject;
        }
        get groupId() {
            return this._dto.groupId;
        }
        get tabs() {
            return this._tabs;
        }
        acceptGroupDtoUpdate(dto) {
            this._dto = dto;
        }
        acceptTabOperation(operation) {
            // In the open case we add the tab to the group
            if (operation.kind === 0 /* TabModelOperationKind.TAB_OPEN */) {
                const tab = new ExtHostEditorTab(operation.tabDto, this, () => this.activeTabId());
                // Insert tab at editor index
                this._tabs.splice(operation.index, 0, tab);
                if (operation.tabDto.isActive) {
                    this._activeTabId = tab.tabId;
                }
                return tab;
            }
            else if (operation.kind === 1 /* TabModelOperationKind.TAB_CLOSE */) {
                const tab = this._tabs.splice(operation.index, 1)[0];
                if (!tab) {
                    throw new Error(`Tab close updated received for index ${operation.index} which does not exist`);
                }
                if (tab.tabId === this._activeTabId) {
                    this._activeTabId = '';
                }
                return tab;
            }
            else if (operation.kind === 3 /* TabModelOperationKind.TAB_MOVE */) {
                if (operation.oldIndex === undefined) {
                    throw new Error('Invalid old index on move IPC');
                }
                // Splice to remove at old index and insert at new index === moving the tab
                const tab = this._tabs.splice(operation.oldIndex, 1)[0];
                if (!tab) {
                    throw new Error(`Tab move updated received for index ${operation.oldIndex} which does not exist`);
                }
                this._tabs.splice(operation.index, 0, tab);
                return tab;
            }
            const tab = this._tabs.find(extHostTab => extHostTab.tabId === operation.tabDto.id);
            if (!tab) {
                throw new Error('INVALID tab');
            }
            if (operation.tabDto.isActive) {
                this._activeTabId = operation.tabDto.id;
            }
            else if (this._activeTabId === operation.tabDto.id && !operation.tabDto.isActive) {
                // Events aren't guaranteed to be in order so if we receive a dto that matches the active tab id
                // but isn't active we mark the active tab id as empty. This prevent onDidActiveTabChange from
                // firing incorrectly
                this._activeTabId = '';
            }
            tab.acceptDtoUpdate(operation.tabDto);
            return tab;
        }
        // Not a getter since it must be a function to be used as a callback for the tabs
        activeTabId() {
            return this._activeTabId;
        }
    }
    let ExtHostEditorTabs = class ExtHostEditorTabs {
        constructor(extHostRpc) {
            this._onDidChangeTabs = new event_1.Emitter();
            this._onDidChangeTabGroups = new event_1.Emitter();
            this._extHostTabGroups = [];
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadEditorTabs);
        }
        get tabGroups() {
            if (!this._apiObject) {
                const that = this;
                const obj = {
                    // never changes -> simple value
                    onDidChangeTabGroups: that._onDidChangeTabGroups.event,
                    onDidChangeTabs: that._onDidChangeTabs.event,
                    // dynamic -> getters
                    get all() {
                        return Object.freeze(that._extHostTabGroups.map(group => group.apiObject));
                    },
                    get activeTabGroup() {
                        const activeTabGroupId = that._activeGroupId;
                        const activeTabGroup = (0, types_1.assertIsDefined)(that._extHostTabGroups.find(candidate => candidate.groupId === activeTabGroupId)?.apiObject);
                        return activeTabGroup;
                    },
                    close: async (tabOrTabGroup, preserveFocus) => {
                        const tabsOrTabGroups = Array.isArray(tabOrTabGroup) ? tabOrTabGroup : [tabOrTabGroup];
                        if (!tabsOrTabGroups.length) {
                            return true;
                        }
                        // Check which type was passed in and call the appropriate close
                        // Casting is needed as typescript doesn't seem to infer enough from this
                        if (isTabGroup(tabsOrTabGroups[0])) {
                            return this._closeGroups(tabsOrTabGroups, preserveFocus);
                        }
                        else {
                            return this._closeTabs(tabsOrTabGroups, preserveFocus);
                        }
                    },
                    // move: async (tab: vscode.Tab, viewColumn: ViewColumn, index: number, preserveFocus?: boolean) => {
                    // 	const extHostTab = this._findExtHostTabFromApi(tab);
                    // 	if (!extHostTab) {
                    // 		throw new Error('Invalid tab');
                    // 	}
                    // 	this._proxy.$moveTab(extHostTab.tabId, index, typeConverters.ViewColumn.from(viewColumn), preserveFocus);
                    // 	return;
                    // }
                };
                this._apiObject = Object.freeze(obj);
            }
            return this._apiObject;
        }
        $acceptEditorTabModel(tabGroups) {
            const groupIdsBefore = new Set(this._extHostTabGroups.map(group => group.groupId));
            const groupIdsAfter = new Set(tabGroups.map(dto => dto.groupId));
            const diff = (0, collections_1.diffSets)(groupIdsBefore, groupIdsAfter);
            const closed = this._extHostTabGroups.filter(group => diff.removed.includes(group.groupId)).map(group => group.apiObject);
            const opened = [];
            const changed = [];
            this._extHostTabGroups = tabGroups.map(tabGroup => {
                const group = new ExtHostEditorTabGroup(tabGroup, () => this._activeGroupId);
                if (diff.added.includes(group.groupId)) {
                    opened.push(group.apiObject);
                }
                else {
                    changed.push(group.apiObject);
                }
                return group;
            });
            // Set the active tab group id
            const activeTabGroupId = (0, types_1.assertIsDefined)(tabGroups.find(group => group.isActive === true)?.groupId);
            if (activeTabGroupId !== undefined && this._activeGroupId !== activeTabGroupId) {
                this._activeGroupId = activeTabGroupId;
            }
            this._onDidChangeTabGroups.fire(Object.freeze({ opened, closed, changed }));
        }
        $acceptTabGroupUpdate(groupDto) {
            const group = this._extHostTabGroups.find(group => group.groupId === groupDto.groupId);
            if (!group) {
                throw new Error('Update Group IPC call received before group creation.');
            }
            group.acceptGroupDtoUpdate(groupDto);
            if (groupDto.isActive) {
                this._activeGroupId = groupDto.groupId;
            }
            this._onDidChangeTabGroups.fire(Object.freeze({ changed: [group.apiObject], opened: [], closed: [] }));
        }
        $acceptTabOperation(operation) {
            const group = this._extHostTabGroups.find(group => group.groupId === operation.groupId);
            if (!group) {
                throw new Error('Update Tabs IPC call received before group creation.');
            }
            const tab = group.acceptTabOperation(operation);
            // Construct the tab change event based on the operation
            switch (operation.kind) {
                case 0 /* TabModelOperationKind.TAB_OPEN */:
                    this._onDidChangeTabs.fire(Object.freeze({
                        opened: [tab.apiObject],
                        closed: [],
                        changed: []
                    }));
                    return;
                case 1 /* TabModelOperationKind.TAB_CLOSE */:
                    this._onDidChangeTabs.fire(Object.freeze({
                        opened: [],
                        closed: [tab.apiObject],
                        changed: []
                    }));
                    return;
                case 3 /* TabModelOperationKind.TAB_MOVE */:
                case 2 /* TabModelOperationKind.TAB_UPDATE */:
                    this._onDidChangeTabs.fire(Object.freeze({
                        opened: [],
                        closed: [],
                        changed: [tab.apiObject]
                    }));
                    return;
            }
        }
        _findExtHostTabFromApi(apiTab) {
            for (const group of this._extHostTabGroups) {
                for (const tab of group.tabs) {
                    if (tab.apiObject === apiTab) {
                        return tab;
                    }
                }
            }
            return;
        }
        _findExtHostTabGroupFromApi(apiTabGroup) {
            return this._extHostTabGroups.find(candidate => candidate.apiObject === apiTabGroup);
        }
        async _closeTabs(tabs, preserveFocus) {
            const extHostTabIds = [];
            for (const tab of tabs) {
                const extHostTab = this._findExtHostTabFromApi(tab);
                if (!extHostTab) {
                    throw new Error('Tab close: Invalid tab not found!');
                }
                extHostTabIds.push(extHostTab.tabId);
            }
            return this._proxy.$closeTab(extHostTabIds, preserveFocus);
        }
        async _closeGroups(groups, preserverFoucs) {
            const extHostGroupIds = [];
            for (const group of groups) {
                const extHostGroup = this._findExtHostTabGroupFromApi(group);
                if (!extHostGroup) {
                    throw new Error('Group close: Invalid group not found!');
                }
                extHostGroupIds.push(extHostGroup.groupId);
            }
            return this._proxy.$closeGroup(extHostGroupIds, preserverFoucs);
        }
    };
    exports.ExtHostEditorTabs = ExtHostEditorTabs;
    exports.ExtHostEditorTabs = ExtHostEditorTabs = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService)
    ], ExtHostEditorTabs);
    //#region Utils
    function isTabGroup(obj) {
        const tabGroup = obj;
        if (tabGroup.tabs !== undefined) {
            return true;
        }
        return false;
    }
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEVkaXRvclRhYnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RFZGl0b3JUYWJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtCbkYsUUFBQSxrQkFBa0IsR0FBRyxJQUFBLCtCQUFlLEVBQXFCLG9CQUFvQixDQUFDLENBQUM7SUFJNUYsTUFBTSxnQkFBZ0I7UUFPckIsWUFBWSxHQUFrQixFQUFFLFdBQWtDLEVBQUUsaUJBQStCO1lBQ2xHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQztZQUM1QyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztZQUNoQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFRCxJQUFJLFNBQVM7WUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN0QiwrREFBK0Q7Z0JBQy9ELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDbEIsTUFBTSxHQUFHLEdBQWU7b0JBQ3ZCLElBQUksUUFBUTt3QkFDWCx5SEFBeUg7d0JBQ3pILE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7b0JBQ25ELENBQUM7b0JBQ0QsSUFBSSxLQUFLO3dCQUNSLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQ3hCLENBQUM7b0JBQ0QsSUFBSSxLQUFLO3dCQUNSLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztvQkFDcEIsQ0FBQztvQkFDRCxJQUFJLE9BQU87d0JBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFDMUIsQ0FBQztvQkFDRCxJQUFJLFFBQVE7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