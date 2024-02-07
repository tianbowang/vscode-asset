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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/customEditor/browser/customEditorInput", "vs/base/common/uri", "vs/workbench/contrib/webviewPanel/browser/webviewEditorInput", "vs/workbench/contrib/terminal/browser/terminalEditorInput", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor/sideBySideEditorInput", "vs/base/common/resources", "vs/workbench/common/editor/editorGroupModel", "vs/workbench/contrib/interactive/browser/interactiveEditorInput", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInput", "vs/platform/log/common/log", "vs/workbench/contrib/chat/browser/chatEditorInput"], function (require, exports, lifecycle_1, extHost_protocol_1, extHostCustomers_1, editor_1, diffEditorInput_1, editorGroupColumn_1, editorGroupsService_1, editorService_1, textResourceEditorInput_1, notebookEditorInput_1, customEditorInput_1, uri_1, webviewEditorInput_1, terminalEditorInput_1, configuration_1, sideBySideEditorInput_1, resources_1, editorGroupModel_1, interactiveEditorInput_1, mergeEditorInput_1, log_1, chatEditorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadEditorTabs = void 0;
    let MainThreadEditorTabs = class MainThreadEditorTabs {
        constructor(extHostContext, _editorGroupsService, _configurationService, _logService, editorService) {
            this._editorGroupsService = _editorGroupsService;
            this._configurationService = _configurationService;
            this._logService = _logService;
            this._dispoables = new lifecycle_1.DisposableStore();
            // List of all groups and their corresponding tabs, this is **the** model
            this._tabGroupModel = [];
            // Lookup table for finding group by id
            this._groupLookup = new Map();
            // Lookup table for finding tab by id
            this._tabInfoLookup = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostEditorTabs);
            // Main listener which responds to events from the editor service
            this._dispoables.add(editorService.onDidEditorsChange((event) => {
                try {
                    this._updateTabsModel(event);
                }
                catch {
                    this._logService.error('Failed to update model, rebuilding');
                    this._createTabsModel();
                }
            }));
            // Structural group changes (add, remove, move, etc) are difficult to patch.
            // Since they happen infrequently we just rebuild the entire model
            this._dispoables.add(this._editorGroupsService.onDidAddGroup(() => this._createTabsModel()));
            this._dispoables.add(this._editorGroupsService.onDidRemoveGroup(() => this._createTabsModel()));
            // Once everything is read go ahead and initialize the model
            this._editorGroupsService.whenReady.then(() => this._createTabsModel());
        }
        dispose() {
            this._groupLookup.clear();
            this._tabInfoLookup.clear();
            this._dispoables.dispose();
        }
        /**
         * Creates a tab object with the correct properties
         * @param editor The editor input represented by the tab
         * @param group The group the tab is in
         * @returns A tab object
         */
        _buildTabObject(group, editor, editorIndex) {
            const editorId = editor.editorId;
            const tab = {
                id: this._generateTabId(editor, group.id),
                label: editor.getName(),
                editorId,
                input: this._editorInputToDto(editor),
                isPinned: group.isSticky(editorIndex),
                isPreview: !group.isPinned(editorIndex),
                isActive: group.isActive(editor),
                isDirty: editor.isDirty()
            };
            return tab;
        }
        _editorInputToDto(editor) {
            if (editor instanceof mergeEditorInput_1.MergeEditorInput) {
                return {
                    kind: 3 /* TabInputKind.TextMergeInput */,
                    base: editor.base,
                    input1: editor.input1.uri,
                    input2: editor.input2.uri,
                    result: editor.resource
                };
            }
            if (editor instanceof textResourceEditorInput_1.AbstractTextResourceEditorInput) {
                return {
                    kind: 1 /* TabInputKind.TextInput */,
                    uri: editor.resource
                };
            }
            if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput && !(editor instanceof diffEditorInput_1.DiffEditorInput)) {
                const primaryResource = editor.primary.resource;
                const secondaryResource = editor.secondary.resource;
                // If side by side editor with same resource on both sides treat it as a singular tab kind
                if (editor.primary instanceof textResourceEditorInput_1.AbstractTextResourceEditorInput
                    && editor.secondary instanceof textResourceEditorInput_1.AbstractTextResourceEditorInput
                    && (0, resources_1.isEqual)(primaryResource, secondaryResource)
                    && primaryResource
                    && secondaryResource) {
                    return {
                        kind: 1 /* TabInputKind.TextInput */,
                        uri: primaryResource
                    };
                }
                return { kind: 0 /* TabInputKind.UnknownInput */ };
            }
            if (editor instanceof notebookEditorInput_1.NotebookEditorInput) {
                return {
                    kind: 4 /* TabInputKind.NotebookInput */,
                    notebookType: editor.viewType,
                    uri: editor.resource
                };
            }
            if (editor instanceof customEditorInput_1.CustomEditorInput) {
                return {
                    kind: 6 /* TabInputKind.CustomEditorInput */,
                    viewType: editor.viewType,
                    uri: editor.resource,
                };
            }
            if (editor instanceof webviewEditorInput_1.WebviewInput) {
                return {
                    kind: 7 /* TabInputKind.WebviewEditorInput */,
                    viewType: editor.viewType
                };
            }
            if (editor instanceof terminalEditorInput_1.TerminalEditorInput) {
                return {
                    kind: 8 /* TabInputKind.TerminalEditorInput */
                };
            }
            if (editor instanceof diffEditorInput_1.DiffEditorInput) {
                if (editor.modified instanceof textResourceEditorInput_1.AbstractTextResourceEditorInput && editor.original instanceof textResourceEditorInput_1.AbstractTextResourceEditorInput) {
                    return {
                        kind: 2 /* TabInputKind.TextDiffInput */,
                        modified: editor.modified.resource,
                        original: editor.original.resource
                    };
                }
                if (editor.modified instanceof notebookEditorInput_1.NotebookEditorInput && editor.original instanceof notebookEditorInput_1.NotebookEditorInput) {
                    return {
                        kind: 5 /* TabInputKind.NotebookDiffInput */,
                        notebookType: editor.original.viewType,
                        modified: editor.modified.resource,
                        original: editor.original.resource
                    };
                }
            }
            if (editor instanceof interactiveEditorInput_1.InteractiveEditorInput) {
                return {
                    kind: 9 /* TabInputKind.InteractiveEditorInput */,
                    uri: editor.resource,
                    inputBoxUri: editor.inputResource
                };
            }
            if (editor instanceof chatEditorInput_1.ChatEditorInput) {
                return {
                    kind: 10 /* TabInputKind.ChatEditorInput */,
                    providerId: editor.providerId ?? 'unknown',
                };
            }
            return { kind: 0 /* TabInputKind.UnknownInput */ };
        }
        /**
         * Generates a unique id for a tab
         * @param editor The editor input
         * @param groupId The group id
         * @returns A unique identifier for a specific tab
         */
        _generateTabId(editor, groupId) {
            let resourceString;
            // Properly get the resource and account for side by side editors
            const resource = editor_1.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH });
            if (resource instanceof uri_1.URI) {
                resourceString = resource.toString();
            }
            else {
                resourceString = `${resource?.primary?.toString()}-${resource?.secondary?.toString()}`;
            }
            return `${groupId}~${editor.editorId}-${editor.typeId}-${resourceString} `;
        }
        /**
         * Called whenever a group activates, updates the model by marking the group as active an notifies the extension host
         */
        _onDidGroupActivate() {
            const activeGroupId = this._editorGroupsService.activeGroup.id;
            const activeGroup = this._groupLookup.get(activeGroupId);
            if (activeGroup) {
                // Ok not to loop as exthost accepts last active group
                activeGroup.isActive = true;
                this._proxy.$acceptTabGroupUpdate(activeGroup);
            }
        }
        /**
         * Called when the tab label changes
         * @param groupId The id of the group the tab exists in
         * @param editorInput The editor input represented by the tab
         */
        _onDidTabLabelChange(groupId, editorInput, editorIndex) {
            const tabId = this._generateTabId(editorInput, groupId);
            const tabInfo = this._tabInfoLookup.get(tabId);
            // If tab is found patch, else rebuild
            if (tabInfo) {
                tabInfo.tab.label = editorInput.getName();
                this._proxy.$acceptTabOperation({
                    groupId,
                    index: editorIndex,
                    tabDto: tabInfo.tab,
                    kind: 2 /* TabModelOperationKind.TAB_UPDATE */
                });
            }
            else {
                this._logService.error('Invalid model for label change, rebuilding');
                this._createTabsModel();
            }
        }
        /**
         * Called when a new tab is opened
         * @param groupId The id of the group the tab is being created in
         * @param editorInput The editor input being opened
         * @param editorIndex The index of the editor within that group
         */
        _onDidTabOpen(groupId, editorInput, editorIndex) {
            const group = this._editorGroupsService.getGroup(groupId);
            // Even if the editor service knows about the group the group might not exist yet in our model
            const groupInModel = this._groupLookup.get(groupId) !== undefined;
            // Means a new group was likely created so we rebuild the model
            if (!group || !groupInModel) {
                this._createTabsModel();
                return;
            }
            const tabs = this._groupLookup.get(groupId)?.tabs;
            if (!tabs) {
                return;
            }
            // Splice tab into group at index editorIndex
            const tabObject = this._buildTabObject(group, editorInput, editorIndex);
            tabs.splice(editorIndex, 0, tabObject);
            // Update lookup
            this._tabInfoLookup.set(this._generateTabId(editorInput, groupId), { group, editorInput, tab: tabObject });
            this._proxy.$acceptTabOperation({
                groupId,
                index: editorIndex,
                tabDto: tabObject,
                kind: 0 /* TabModelOperationKind.TAB_OPEN */
            });
        }
        /**
         * Called when a tab is closed
         * @param groupId The id of the group the tab is being removed from
         * @param editorIndex The index of the editor within that group
         */
        _onDidTabClose(groupId, editorIndex) {
            const group = this._editorGroupsService.getGroup(groupId);
            const tabs = this._groupLookup.get(groupId)?.tabs;
            // Something is wrong with the model state so we rebuild
            if (!group || !tabs) {
                this._createTabsModel();
                return;
            }
            // Splice tab into group at index editorIndex
            const removedTab = tabs.splice(editorIndex, 1);
            // Index must no longer be valid so we return prematurely
            if (removedTab.length === 0) {
                return;
            }
            // Update lookup
            this._tabInfoLookup.delete(removedTab[0]?.id ?? '');
            this._proxy.$acceptTabOperation({
                groupId,
                index: editorIndex,
                tabDto: removedTab[0],
                kind: 1 /* TabModelOperationKind.TAB_CLOSE */
            });
        }
        /**
         * Called when the active tab changes
         * @param groupId The id of the group the tab is contained in
         * @param editorIndex The index of the tab
         */
        _onDidTabActiveChange(groupId, editorIndex) {
            // TODO @lramos15 use the tab lookup here if possible. Do we have an editor input?!
            const tabs = this._groupLookup.get(groupId)?.tabs;
            if (!tabs) {
                return;
            }
            const activeTab = tabs[editorIndex];
            // No need to loop over as the exthost uses the most recently marked active tab
            activeTab.isActive = true;
            // Send DTO update to the exthost
            this._proxy.$acceptTabOperation({
                groupId,
                index: editorIndex,
                tabDto: activeTab,
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */
            });
        }
        /**
         * Called when the dirty indicator on the tab changes
         * @param groupId The id of the group the tab is in
         * @param editorIndex The index of the tab
         * @param editor The editor input represented by the tab
         */
        _onDidTabDirty(groupId, editorIndex, editor) {
            const tabId = this._generateTabId(editor, groupId);
            const tabInfo = this._tabInfoLookup.get(tabId);
            // Something wrong with the model state so we rebuild
            if (!tabInfo) {
                this._logService.error('Invalid model for dirty change, rebuilding');
                this._createTabsModel();
                return;
            }
            tabInfo.tab.isDirty = editor.isDirty();
            this._proxy.$acceptTabOperation({
                groupId,
                index: editorIndex,
                tabDto: tabInfo.tab,
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */
            });
        }
        /**
         * Called when the tab is pinned/unpinned
         * @param groupId The id of the group the tab is in
         * @param editorIndex The index of the tab
         * @param editor The editor input represented by the tab
         */
        _onDidTabPinChange(groupId, editorIndex, editor) {
            const tabId = this._generateTabId(editor, groupId);
            const tabInfo = this._tabInfoLookup.get(tabId);
            const group = tabInfo?.group;
            const tab = tabInfo?.tab;
            // Something wrong with the model state so we rebuild
            if (!group || !tab) {
                this._logService.error('Invalid model for sticky change, rebuilding');
                this._createTabsModel();
                return;
            }
            // Whether or not the tab has the pin icon (internally it's called sticky)
            tab.isPinned = group.isSticky(editorIndex);
            this._proxy.$acceptTabOperation({
                groupId,
                index: editorIndex,
                tabDto: tab,
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */
            });
        }
        /**
     * Called when the tab is preview / unpreviewed
     * @param groupId The id of the group the tab is in
     * @param editorIndex The index of the tab
     * @param editor The editor input represented by the tab
     */
        _onDidTabPreviewChange(groupId, editorIndex, editor) {
            const tabId = this._generateTabId(editor, groupId);
            const tabInfo = this._tabInfoLookup.get(tabId);
            const group = tabInfo?.group;
            const tab = tabInfo?.tab;
            // Something wrong with the model state so we rebuild
            if (!group || !tab) {
                this._logService.error('Invalid model for sticky change, rebuilding');
                this._createTabsModel();
                return;
            }
            // Whether or not the tab has the pin icon (internally it's called pinned)
            tab.isPreview = !group.isPinned(editorIndex);
            this._proxy.$acceptTabOperation({
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */,
                groupId,
                tabDto: tab,
                index: editorIndex
            });
        }
        _onDidTabMove(groupId, editorIndex, oldEditorIndex, editor) {
            const tabs = this._groupLookup.get(groupId)?.tabs;
            // Something wrong with the model state so we rebuild
            if (!tabs) {
                this._logService.error('Invalid model for move change, rebuilding');
                this._createTabsModel();
                return;
            }
            // Move tab from old index to new index
            const removedTab = tabs.splice(oldEditorIndex, 1);
            if (removedTab.length === 0) {
                return;
            }
            tabs.splice(editorIndex, 0, removedTab[0]);
            // Notify exthost of move
            this._proxy.$acceptTabOperation({
                kind: 3 /* TabModelOperationKind.TAB_MOVE */,
                groupId,
                tabDto: removedTab[0],
                index: editorIndex,
                oldIndex: oldEditorIndex
            });
        }
        /**
         * Builds the model from scratch based on the current state of the editor service.
         */
        _createTabsModel() {
            this._tabGroupModel = [];
            this._groupLookup.clear();
            this._tabInfoLookup.clear();
            let tabs = [];
            for (const group of this._editorGroupsService.groups) {
                const currentTabGroupModel = {
                    groupId: group.id,
                    isActive: group.id === this._editorGroupsService.activeGroup.id,
                    viewColumn: (0, editorGroupColumn_1.editorGroupToColumn)(this._editorGroupsService, group),
                    tabs: []
                };
                group.editors.forEach((editor, editorIndex) => {
                    const tab = this._buildTabObject(group, editor, editorIndex);
                    tabs.push(tab);
                    // Add information about the tab to the lookup
                    this._tabInfoLookup.set(this._generateTabId(editor, group.id), {
                        group,
                        tab,
                        editorInput: editor
                    });
                });
                currentTabGroupModel.tabs = tabs;
                this._tabGroupModel.push(currentTabGroupModel);
                this._groupLookup.set(group.id, currentTabGroupModel);
                tabs = [];
            }
            // notify the ext host of the new model
            this._proxy.$acceptEditorTabModel(this._tabGroupModel);
        }
        // TODOD @lramos15 Remove this after done finishing the tab model code
        // private _eventToString(event: IEditorsChangeEvent | IEditorsMoveEvent): string {
        // 	let eventString = '';
        // 	switch (event.kind) {
        // 		case GroupModelChangeKind.GROUP_INDEX: eventString += 'GROUP_INDEX'; break;
        // 		case GroupModelChangeKind.EDITOR_ACTIVE: eventString += 'EDITOR_ACTIVE'; break;
        // 		case GroupModelChangeKind.EDITOR_PIN: eventString += 'EDITOR_PIN'; break;
        // 		case GroupModelChangeKind.EDITOR_OPEN: eventString += 'EDITOR_OPEN'; break;
        // 		case GroupModelChangeKind.EDITOR_CLOSE: eventString += 'EDITOR_CLOSE'; break;
        // 		case GroupModelChangeKind.EDITOR_MOVE: eventString += 'EDITOR_MOVE'; break;
        // 		case GroupModelChangeKind.EDITOR_LABEL: eventString += 'EDITOR_LABEL'; break;
        // 		case GroupModelChangeKind.GROUP_ACTIVE: eventString += 'GROUP_ACTIVE'; break;
        // 		case GroupModelChangeKind.GROUP_LOCKED: eventString += 'GROUP_LOCKED'; break;
        // 		case GroupModelChangeKind.EDITOR_DIRTY: eventString += 'EDITOR_DIRTY'; break;
        // 		case GroupModelChangeKind.EDITOR_STICKY: eventString += 'EDITOR_STICKY'; break;
        // 		default: eventString += `UNKNOWN: ${event.kind}`; break;
        // 	}
        // 	return eventString;
        // }
        /**
         * The main handler for the tab events
         * @param events The list of events to process
         */
        _updateTabsModel(changeEvent) {
            const event = changeEvent.event;
            const groupId = changeEvent.groupId;
            switch (event.kind) {
                case 0 /* GroupModelChangeKind.GROUP_ACTIVE */:
                    if (groupId === this._editorGroupsService.activeGroup.id) {
                        this._onDidGroupActivate();
                        break;
                    }
                    else {
                        return;
                    }
                case 8 /* GroupModelChangeKind.EDITOR_LABEL */:
                    if (event.editor !== undefined && event.editorIndex !== undefined) {
                        this._onDidTabLabelChange(groupId, event.editor, event.editorIndex);
                        break;
                    }
                case 4 /* GroupModelChangeKind.EDITOR_OPEN */:
                    if (event.editor !== undefined && event.editorIndex !== undefined) {
                        this._onDidTabOpen(groupId, event.editor, event.editorIndex);
                        break;
                    }
                case 5 /* GroupModelChangeKind.EDITOR_CLOSE */:
                    if (event.editorIndex !== undefined) {
                        this._onDidTabClose(groupId, event.editorIndex);
                        break;
                    }
                case 7 /* GroupModelChangeKind.EDITOR_ACTIVE */:
                    if (event.editorIndex !== undefined) {
                        this._onDidTabActiveChange(groupId, event.editorIndex);
                        break;
                    }
                case 12 /* GroupModelChangeKind.EDITOR_DIRTY */:
                    if (event.editorIndex !== undefined && event.editor !== undefined) {
                        this._onDidTabDirty(groupId, event.editorIndex, event.editor);
                        break;
                    }
                case 11 /* GroupModelChangeKind.EDITOR_STICKY */:
                    if (event.editorIndex !== undefined && event.editor !== undefined) {
                        this._onDidTabPinChange(groupId, event.editorIndex, event.editor);
                        break;
                    }
                case 10 /* GroupModelChangeKind.EDITOR_PIN */:
                    if (event.editorIndex !== undefined && event.editor !== undefined) {
                        this._onDidTabPreviewChange(groupId, event.editorIndex, event.editor);
                        break;
                    }
                case 6 /* GroupModelChangeKind.EDITOR_MOVE */:
                    if ((0, editorGroupModel_1.isGroupEditorMoveEvent)(event) && event.editor && event.editorIndex !== undefined && event.oldEditorIndex !== undefined) {
                        this._onDidTabMove(groupId, event.editorIndex, event.oldEditorIndex, event.editor);
                        break;
                    }
                default:
                    // If it's not an optimized case we rebuild the tabs model from scratch
                    this._createTabsModel();
            }
        }
        //#region Messages received from Ext Host
        $moveTab(tabId, index, viewColumn, preserveFocus) {
            const groupId = (0, editorGroupColumn_1.columnToEditorGroup)(this._editorGroupsService, this._configurationService, viewColumn);
            const tabInfo = this._tabInfoLookup.get(tabId);
            const tab = tabInfo?.tab;
            if (!tab) {
                throw new Error(`Attempted to close tab with id ${tabId} which does not exist`);
            }
            let targetGroup;
            const sourceGroup = this._editorGroupsService.getGroup(tabInfo.group.id);
            if (!sourceGroup) {
                return;
            }
            // If group index is out of bounds then we make a new one that's to the right of the last group
            if (this._groupLookup.get(groupId) === undefined) {
                let direction = 3 /* GroupDirection.RIGHT */;
                // Make sure we respect the user's preferred side direction
                if (viewColumn === editorService_1.SIDE_GROUP) {
                    direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(this._configurationService);
                }
                targetGroup = this._editorGroupsService.addGroup(this._editorGroupsService.groups[this._editorGroupsService.groups.length - 1], direction);
            }
            else {
                targetGroup = this._editorGroupsService.getGroup(groupId);
            }
            if (!targetGroup) {
                return;
            }
            // Similar logic to if index is out of bounds we place it at the end
            if (index < 0 || index > targetGroup.editors.length) {
                index = targetGroup.editors.length;
            }
            // Find the correct EditorInput using the tab info
            const editorInput = tabInfo?.editorInput;
            if (!editorInput) {
                return;
            }
            // Move the editor to the target group
            sourceGroup.moveEditor(editorInput, targetGroup, { index, preserveFocus });
            return;
        }
        async $closeTab(tabIds, preserveFocus) {
            const groups = new Map();
            for (const tabId of tabIds) {
                const tabInfo = this._tabInfoLookup.get(tabId);
                const tab = tabInfo?.tab;
                const group = tabInfo?.group;
                const editorTab = tabInfo?.editorInput;
                // If not found skip
                if (!group || !tab || !tabInfo || !editorTab) {
                    continue;
                }
                const groupEditors = groups.get(group);
                if (!groupEditors) {
                    groups.set(group, [editorTab]);
                }
                else {
                    groupEditors.push(editorTab);
                }
            }
            // Loop over keys of the groups map and call closeEditors
            const results = [];
            for (const [group, editors] of groups) {
                results.push(await group.closeEditors(editors, { preserveFocus }));
            }
            // TODO @jrieken This isn't quite right how can we say true for some but not others?
            return results.every(result => result);
        }
        async $closeGroup(groupIds, preserveFocus) {
            const groupCloseResults = [];
            for (const groupId of groupIds) {
                const group = this._editorGroupsService.getGroup(groupId);
                if (group) {
                    groupCloseResults.push(await group.closeAllEditors());
                    // Make sure group is empty but still there before removing it
                    if (group.count === 0 && this._editorGroupsService.getGroup(group.id)) {
                        this._editorGroupsService.removeGroup(group);
                    }
                }
            }
            return groupCloseResults.every(result => result);
        }
    };
    exports.MainThreadEditorTabs = MainThreadEditorTabs;
    exports.MainThreadEditorTabs = MainThreadEditorTabs = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadEditorTabs),
        __param(1, editorGroupsService_1.IEditorGroupsService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, log_1.ILogService),
        __param(4, editorService_1.IEditorService)
    ], MainThreadEditorTabs);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEVkaXRvclRhYnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkRWRpdG9yVGFicy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQ3pGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQW9CO1FBV2hDLFlBQ0MsY0FBK0IsRUFDVCxvQkFBMkQsRUFDMUQscUJBQTZELEVBQ3ZFLFdBQXlDLEVBQ3RDLGFBQTZCO1lBSE4seUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUN6QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ3RELGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBYnRDLGdCQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFckQseUVBQXlFO1lBQ2pFLG1CQUFjLEdBQXlCLEVBQUUsQ0FBQztZQUNsRCx1Q0FBdUM7WUFDdEIsaUJBQVksR0FBb0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMzRSxxQ0FBcUM7WUFDcEIsbUJBQWMsR0FBeUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQVVqRSxJQUFJLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsaUNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRXhFLGlFQUFpRTtZQUNqRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDL0QsSUFBSSxDQUFDO29CQUNKLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUIsQ0FBQztnQkFBQyxNQUFNLENBQUM7b0JBQ1IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztvQkFDN0QsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3pCLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosNEVBQTRFO1lBQzVFLGtFQUFrRTtZQUNsRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWhHLDREQUE0RDtZQUM1RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0ssZUFBZSxDQUFDLEtBQW1CLEVBQUUsTUFBbUIsRUFBRSxXQUFtQjtZQUNwRixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ2pDLE1BQU0sR0FBRyxHQUFrQjtnQkFDMUIsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3pDLEtBQUssRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUN2QixRQUFRO2dCQUNSLEtBQUssRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDO2dCQUNyQyxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7Z0JBQ3JDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO2dCQUN2QyxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQ2hDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFO2FBQ3pCLENBQUM7WUFDRixPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFTyxpQkFBaUIsQ0FBQyxNQUFtQjtZQUU1QyxJQUFJLE1BQU0sWUFBWSxtQ0FBZ0IsRUFBRSxDQUFDO2dCQUN4QyxPQUFPO29CQUNOLElBQUkscUNBQTZCO29CQUNqQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7b0JBQ2pCLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUc7b0JBQ3pCLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUc7b0JBQ3pCLE1BQU0sRUFBRSxNQUFNLENBQUMsUUFBUTtpQkFDdkIsQ0FBQztZQUNILENBQUM7WUFFRCxJQUFJLE1BQU0sWUFBWSx5REFBK0IsRUFBRSxDQUFDO2dCQUN2RCxPQUFPO29CQUNOLElBQUksZ0NBQXdCO29CQUM1QixHQUFHLEVBQUUsTUFBTSxDQUFDLFFBQVE7aUJBQ3BCLENBQUM7WUFDSCxDQUFDO1lBRUQsSUFBSSxNQUFNLFlBQVksNkNBQXFCLElBQUksQ0FBQyxDQUFDLE1BQU0sWUFBWSxpQ0FBZSxDQUFDLEVBQUUsQ0FBQztnQkFDckYsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7Z0JBQ2hELE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7Z0JBQ3BELDBGQUEwRjtnQkFDMUYsSUFBSSxNQUFNLENBQUMsT0FBTyxZQUFZLHlEQUErQjt1QkFDekQsTUFBTSxDQUFDLFNBQVMsWUFBWSx5REFBK0I7dUJBQzNELElBQUEsbUJBQU8sRUFBQyxlQUFlLEVBQUUsaUJBQWlCLENBQUM7dUJBQzNDLGVBQWU7dUJBQ2YsaUJBQWlCLEVBQ25CLENBQUM7b0JBQ0YsT0FBTzt3QkFDTixJQUFJLGdDQUF3Qjt3QkFDNUIsR0FBRyxFQUFFLGVBQWU7cUJBQ3BCLENBQUM7Z0JBQ0gsQ0FBQztnQkFDRCxPQUFPLEVBQUUsSUFBSSxtQ0FBMkIsRUFBRSxDQUFDO1lBQzVDLENBQUM7WUFFRCxJQUFJLE1BQU0sWUFBWSx5Q0FBbUIsRUFBRSxDQUFDO2dCQUMzQyxPQUFPO29CQUNOLElBQUksb0NBQTRCO29CQUNoQyxZQUFZLEVBQUUsTUFBTSxDQUFDLFFBQVE7b0JBQzdCLEdBQUcsRUFBRSxNQUFNLENBQUMsUUFBUTtpQkFDcEIsQ0FBQztZQUNILENBQUM7WUFFRCxJQUFJLE1BQU0sWUFBWSxxQ0FBaUIsRUFBRSxDQUFDO2dCQUN6QyxPQUFPO29CQUNOLElBQUksd0NBQWdDO29CQUNwQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVE7b0JBQ3pCLEdBQUcsRUFBRSxNQUFNLENBQUMsUUFBUTtpQkFDcEIsQ0FBQztZQUNILENBQUM7WUFFRCxJQUFJLE1BQU0sWUFBWSxpQ0FBWSxFQUFFLENBQUM7Z0JBQ3BDLE9BQU87b0JBQ04sSUFBSSx5Q0FBaUM7b0JBQ3JDLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTtpQkFDekIsQ0FBQztZQUNILENBQUM7WUFFRCxJQUFJLE1BQU0sWUFBWSx5Q0FBbUIsRUFBRSxDQUFDO2dCQUMzQyxPQUFPO29CQUNOLElBQUksMENBQWtDO2lCQUN0QyxDQUFDO1lBQ0gsQ0FBQztZQUVELElBQUksTUFBTSxZQUFZLGlDQUFlLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxNQUFNLENBQUMsUUFBUSxZQUFZLHlEQUErQixJQUFJLE1BQU0sQ0FBQyxRQUFRLFlBQVkseURBQStCLEVBQUUsQ0FBQztvQkFDOUgsT0FBTzt3QkFDTixJQUFJLG9DQUE0Qjt3QkFDaEMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUTt3QkFDbEMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUTtxQkFDbEMsQ0FBQztnQkFDSCxDQUFDO2dCQUNELElBQUksTUFBTSxDQUFDLFFBQVEsWUFBWSx5Q0FBbUIsSUFBSSxNQUFNLENBQUMsUUFBUSxZQUFZLHlDQUFtQixFQUFFLENBQUM7b0JBQ3RHLE9BQU87d0JBQ04sSUFBSSx3Q0FBZ0M7d0JBQ3BDLFlBQVksRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVE7d0JBQ3RDLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVE7d0JBQ2xDLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVE7cUJBQ2xDLENBQUM7Z0JBQ0gsQ0FBQztZQUNGLENBQUM7WUFFRCxJQUFJLE1BQU0sWUFBWSwrQ0FBc0IsRUFBRSxDQUFDO2dCQUM5QyxPQUFPO29CQUNOLElBQUksNkNBQXFDO29CQUN6QyxHQUFHLEVBQUUsTUFBTSxDQUFDLFFBQVE7b0JBQ3BCLFdBQVcsRUFBRSxNQUFNLENBQUMsYUFBYTtpQkFDakMsQ0FBQztZQUNILENBQUM7WUFFRCxJQUFJLE1BQU0sWUFBWSxpQ0FBZSxFQUFFLENBQUM7Z0JBQ3ZDLE9BQU87b0JBQ04sSUFBSSx1Q0FBOEI7b0JBQ2xDLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxJQUFJLFNBQVM7aUJBQzFDLENBQUM7WUFDSCxDQUFDO1lBRUQsT0FBTyxFQUFFLElBQUksbUNBQTJCLEVBQUUsQ0FBQztRQUM1QyxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSyxjQUFjLENBQUMsTUFBbUIsRUFBRSxPQUFlO1lBQzFELElBQUksY0FBa0MsQ0FBQztZQUN2QyxpRUFBaUU7WUFDakUsTUFBTSxRQUFRLEdBQUcsK0JBQXNCLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxFQUFFLGlCQUFpQixFQUFFLHlCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDOUcsSUFBSSxRQUFRLFlBQVksU0FBRyxFQUFFLENBQUM7Z0JBQzdCLGNBQWMsR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLGNBQWMsR0FBRyxHQUFHLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDO1lBQ3hGLENBQUM7WUFDRCxPQUFPLEdBQUcsT0FBTyxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxjQUFjLEdBQUcsQ0FBQztRQUM1RSxDQUFDO1FBRUQ7O1dBRUc7UUFDSyxtQkFBbUI7WUFDMUIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7WUFDL0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDekQsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDakIsc0RBQXNEO2dCQUN0RCxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNoRCxDQUFDO1FBQ0YsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSyxvQkFBb0IsQ0FBQyxPQUFlLEVBQUUsV0FBd0IsRUFBRSxXQUFtQjtZQUMxRixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN4RCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxzQ0FBc0M7WUFDdEMsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUM7b0JBQy9CLE9BQU87b0JBQ1AsS0FBSyxFQUFFLFdBQVc7b0JBQ2xCLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRztvQkFDbkIsSUFBSSwwQ0FBa0M7aUJBQ3RDLENBQUMsQ0FBQztZQUNKLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO2dCQUNyRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN6QixDQUFDO1FBQ0YsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0ssYUFBYSxDQUFDLE9BQWUsRUFBRSxXQUF3QixFQUFFLFdBQW1CO1lBQ25GLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUQsOEZBQThGO1lBQzlGLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLFNBQVMsQ0FBQztZQUNsRSwrREFBK0Q7WUFDL0QsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDeEIsT0FBTztZQUNSLENBQUM7WUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7WUFDbEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNYLE9BQU87WUFDUixDQUFDO1lBQ0QsNkNBQTZDO1lBQzdDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdkMsZ0JBQWdCO1lBQ2hCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUUzRyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDO2dCQUMvQixPQUFPO2dCQUNQLEtBQUssRUFBRSxXQUFXO2dCQUNsQixNQUFNLEVBQUUsU0FBUztnQkFDakIsSUFBSSx3Q0FBZ0M7YUFDcEMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVEOzs7O1dBSUc7UUFDSyxjQUFjLENBQUMsT0FBZSxFQUFFLFdBQW1CO1lBQzFELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO1lBQ2xELHdEQUF3RDtZQUN4RCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN4QixPQUFPO1lBQ1IsQ0FBQztZQUNELDZDQUE2QztZQUM3QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUvQyx5REFBeUQ7WUFDekQsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1IsQ0FBQztZQUVELGdCQUFnQjtZQUNoQixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRXBELElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUM7Z0JBQy9CLE9BQU87Z0JBQ1AsS0FBSyxFQUFFLFdBQVc7Z0JBQ2xCLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLHlDQUFpQzthQUNyQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNLLHFCQUFxQixDQUFDLE9BQWUsRUFBRSxXQUFtQjtZQUNqRSxtRkFBbUY7WUFDbkYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO1lBQ2xELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxPQUFPO1lBQ1IsQ0FBQztZQUNELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNwQywrRUFBK0U7WUFDL0UsU0FBUyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDMUIsaUNBQWlDO1lBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUM7Z0JBQy9CLE9BQU87Z0JBQ1AsS0FBSyxFQUFFLFdBQVc7Z0JBQ2xCLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixJQUFJLDBDQUFrQzthQUN0QyxDQUFDLENBQUM7UUFFSixDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSyxjQUFjLENBQUMsT0FBZSxFQUFFLFdBQW1CLEVBQUUsTUFBbUI7WUFDL0UsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbkQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0MscURBQXFEO1lBQ3JELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDZCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO2dCQUNyRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDeEIsT0FBTztZQUNSLENBQUM7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQztnQkFDL0IsT0FBTztnQkFDUCxLQUFLLEVBQUUsV0FBVztnQkFDbEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHO2dCQUNuQixJQUFJLDBDQUFrQzthQUN0QyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSyxrQkFBa0IsQ0FBQyxPQUFlLEVBQUUsV0FBbUIsRUFBRSxNQUFtQjtZQUNuRixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNuRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxNQUFNLEtBQUssR0FBRyxPQUFPLEVBQUUsS0FBSyxDQUFDO1lBQzdCLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxHQUFHLENBQUM7WUFDekIscURBQXFEO1lBQ3JELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztnQkFDdEUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3hCLE9BQU87WUFDUixDQUFDO1lBQ0QsMEVBQTBFO1lBQzFFLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDO2dCQUMvQixPQUFPO2dCQUNQLEtBQUssRUFBRSxXQUFXO2dCQUNsQixNQUFNLEVBQUUsR0FBRztnQkFDWCxJQUFJLDBDQUFrQzthQUN0QyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQ7Ozs7O09BS0U7UUFDTSxzQkFBc0IsQ0FBQyxPQUFlLEVBQUUsV0FBbUIsRUFBRSxNQUFtQjtZQUN2RixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNuRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxNQUFNLEtBQUssR0FBRyxPQUFPLEVBQUUsS0FBSyxDQUFDO1lBQzdCLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxHQUFHLENBQUM7WUFDekIscURBQXFEO1lBQ3JELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztnQkFDdEUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3hCLE9BQU87WUFDUixDQUFDO1lBQ0QsMEVBQTBFO1lBQzFFLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUM7Z0JBQy9CLElBQUksMENBQWtDO2dCQUN0QyxPQUFPO2dCQUNQLE1BQU0sRUFBRSxHQUFHO2dCQUNYLEtBQUssRUFBRSxXQUFXO2FBQ2xCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyxhQUFhLENBQUMsT0FBZSxFQUFFLFdBQW1CLEVBQUUsY0FBc0IsRUFBRSxNQUFtQjtZQUN0RyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7WUFDbEQscURBQXFEO1lBQ3JELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDeEIsT0FBTztZQUNSLENBQUM7WUFFRCx1Q0FBdUM7WUFDdkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUzQyx5QkFBeUI7WUFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQztnQkFDL0IsSUFBSSx3Q0FBZ0M7Z0JBQ3BDLE9BQU87Z0JBQ1AsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLEtBQUssRUFBRSxXQUFXO2dCQUNsQixRQUFRLEVBQUUsY0FBYzthQUN4QixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQ7O1dBRUc7UUFDSyxnQkFBZ0I7WUFDdkIsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzVCLElBQUksSUFBSSxHQUFvQixFQUFFLENBQUM7WUFDL0IsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3RELE1BQU0sb0JBQW9CLEdBQXVCO29CQUNoRCxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ2pCLFFBQVEsRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDL0QsVUFBVSxFQUFFLElBQUEsdUNBQW1CLEVBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQztvQkFDakUsSUFBSSxFQUFFLEVBQUU7aUJBQ1IsQ0FBQztnQkFDRixLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRTtvQkFDN0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUM3RCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNmLDhDQUE4QztvQkFDOUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFO3dCQUM5RCxLQUFLO3dCQUNMLEdBQUc7d0JBQ0gsV0FBVyxFQUFFLE1BQU07cUJBQ25CLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsQ0FBQztnQkFDSCxvQkFBb0IsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3RELElBQUksR0FBRyxFQUFFLENBQUM7WUFDWCxDQUFDO1lBQ0QsdUNBQXVDO1lBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxzRUFBc0U7UUFDdEUsbUZBQW1GO1FBQ25GLHlCQUF5QjtRQUN6Qix5QkFBeUI7UUFDekIsZ0ZBQWdGO1FBQ2hGLG9GQUFvRjtRQUNwRiw4RUFBOEU7UUFDOUUsZ0ZBQWdGO1FBQ2hGLGtGQUFrRjtRQUNsRixnRkFBZ0Y7UUFDaEYsa0ZBQWtGO1FBQ2xGLGtGQUFrRjtRQUNsRixrRkFBa0Y7UUFDbEYsa0ZBQWtGO1FBQ2xGLG9GQUFvRjtRQUNwRiw2REFBNkQ7UUFDN0QsS0FBSztRQUNMLHVCQUF1QjtRQUN2QixJQUFJO1FBRUo7OztXQUdHO1FBQ0ssZ0JBQWdCLENBQUMsV0FBZ0M7WUFDeEQsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUNoQyxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1lBQ3BDLFFBQVEsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNwQjtvQkFDQyxJQUFJLE9BQU8sS0FBSyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUMxRCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzt3QkFDM0IsTUFBTTtvQkFDUCxDQUFDO3lCQUFNLENBQUM7d0JBQ1AsT0FBTztvQkFDUixDQUFDO2dCQUNGO29CQUNDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDbkUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDcEUsTUFBTTtvQkFDUCxDQUFDO2dCQUNGO29CQUNDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDbkUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQzdELE1BQU07b0JBQ1AsQ0FBQztnQkFDRjtvQkFDQyxJQUFJLEtBQUssQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQ3JDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDaEQsTUFBTTtvQkFDUCxDQUFDO2dCQUNGO29CQUNDLElBQUksS0FBSyxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDckMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQ3ZELE1BQU07b0JBQ1AsQ0FBQztnQkFDRjtvQkFDQyxJQUFJLEtBQUssQ0FBQyxXQUFXLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQ25FLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUM5RCxNQUFNO29CQUNQLENBQUM7Z0JBQ0Y7b0JBQ0MsSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO3dCQUNuRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNsRSxNQUFNO29CQUNQLENBQUM7Z0JBQ0Y7b0JBQ0MsSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO3dCQUNuRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUN0RSxNQUFNO29CQUNQLENBQUM7Z0JBQ0Y7b0JBQ0MsSUFBSSxJQUFBLHlDQUFzQixFQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDNUgsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDbkYsTUFBTTtvQkFDUCxDQUFDO2dCQUNGO29CQUNDLHVFQUF1RTtvQkFDdkUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDMUIsQ0FBQztRQUNGLENBQUM7UUFDRCx5Q0FBeUM7UUFDekMsUUFBUSxDQUFDLEtBQWEsRUFBRSxLQUFhLEVBQUUsVUFBNkIsRUFBRSxhQUF1QjtZQUM1RixNQUFNLE9BQU8sR0FBRyxJQUFBLHVDQUFtQixFQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMscUJBQXFCLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDdkcsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0MsTUFBTSxHQUFHLEdBQUcsT0FBTyxFQUFFLEdBQUcsQ0FBQztZQUN6QixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsS0FBSyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ2pGLENBQUM7WUFDRCxJQUFJLFdBQXFDLENBQUM7WUFDMUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbEIsT0FBTztZQUNSLENBQUM7WUFDRCwrRkFBK0Y7WUFDL0YsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDbEQsSUFBSSxTQUFTLCtCQUF1QixDQUFDO2dCQUNyQywyREFBMkQ7Z0JBQzNELElBQUksVUFBVSxLQUFLLDBCQUFVLEVBQUUsQ0FBQztvQkFDL0IsU0FBUyxHQUFHLElBQUEsdURBQWlDLEVBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQzNFLENBQUM7Z0JBQ0QsV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM1SSxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0QsQ0FBQztZQUNELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbEIsT0FBTztZQUNSLENBQUM7WUFFRCxvRUFBb0U7WUFDcEUsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNyRCxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDcEMsQ0FBQztZQUNELGtEQUFrRDtZQUNsRCxNQUFNLFdBQVcsR0FBRyxPQUFPLEVBQUUsV0FBVyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbEIsT0FBTztZQUNSLENBQUM7WUFDRCxzQ0FBc0M7WUFDdEMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFDM0UsT0FBTztRQUNSLENBQUM7UUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQWdCLEVBQUUsYUFBdUI7WUFDeEQsTUFBTSxNQUFNLEdBQXFDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDM0QsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQy9DLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxHQUFHLENBQUM7Z0JBQ3pCLE1BQU0sS0FBSyxHQUFHLE9BQU8sRUFBRSxLQUFLLENBQUM7Z0JBQzdCLE1BQU0sU0FBUyxHQUFHLE9BQU8sRUFBRSxXQUFXLENBQUM7Z0JBQ3ZDLG9CQUFvQjtnQkFDcEIsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUM5QyxTQUFTO2dCQUNWLENBQUM7Z0JBQ0QsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM5QixDQUFDO1lBQ0YsQ0FBQztZQUNELHlEQUF5RDtZQUN6RCxNQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7WUFDOUIsS0FBSyxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUN2QyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEUsQ0FBQztZQUNELG9GQUFvRjtZQUNwRixPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFrQixFQUFFLGFBQXVCO1lBQzVELE1BQU0saUJBQWlCLEdBQWMsRUFBRSxDQUFDO1lBQ3hDLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ2hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzFELElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ1gsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7b0JBQ3RELDhEQUE4RDtvQkFDOUQsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO3dCQUN2RSxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM5QyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1lBQ0QsT0FBTyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRCxDQUFDO0tBRUQsQ0FBQTtJQXRtQlksb0RBQW9CO21DQUFwQixvQkFBb0I7UUFEaEMsSUFBQSx1Q0FBb0IsRUFBQyw4QkFBVyxDQUFDLG9CQUFvQixDQUFDO1FBY3BELFdBQUEsMENBQW9CLENBQUE7UUFDcEIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLDhCQUFjLENBQUE7T0FoQkosb0JBQW9CLENBc21CaEMifQ==