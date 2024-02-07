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
define(["require", "exports", "vs/base/common/glob", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/editor/common/editor", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/network", "vs/workbench/services/editor/common/editorResolverService", "vs/platform/quickinput/common/quickInput", "vs/nls", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/extensions", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/platform/log/common/log", "vs/workbench/services/editor/common/editorGroupFinder", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor/sideBySideEditorInput", "vs/base/common/event"], function (require, exports, glob, arrays_1, lifecycle_1, resources_1, uri_1, configuration_1, editor_1, editor_2, editorGroupsService_1, network_1, editorResolverService_1, quickInput_1, nls_1, notification_1, telemetry_1, extensions_1, storage_1, extensions_2, log_1, editorGroupFinder_1, instantiation_1, sideBySideEditorInput_1, event_1) {
    "use strict";
    var EditorResolverService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorResolverService = void 0;
    let EditorResolverService = class EditorResolverService extends lifecycle_1.Disposable {
        static { EditorResolverService_1 = this; }
        // Constants
        static { this.configureDefaultID = 'promptOpenWith.configureDefault'; }
        static { this.cacheStorageID = 'editorOverrideService.cache'; }
        static { this.conflictingDefaultsStorageID = 'editorOverrideService.conflictingDefaults'; }
        constructor(editorGroupService, instantiationService, configurationService, quickInputService, notificationService, telemetryService, storageService, extensionService, logService) {
            super();
            this.editorGroupService = editorGroupService;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.quickInputService = quickInputService;
            this.notificationService = notificationService;
            this.telemetryService = telemetryService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.logService = logService;
            // Events
            this._onDidChangeEditorRegistrations = this._register(new event_1.PauseableEmitter());
            this.onDidChangeEditorRegistrations = this._onDidChangeEditorRegistrations.event;
            // Data Stores
            this._editors = new Map();
            this._flattenedEditors = new Map();
            this._shouldReFlattenEditors = true;
            // Read in the cache on statup
            this.cache = new Set(JSON.parse(this.storageService.get(EditorResolverService_1.cacheStorageID, 0 /* StorageScope.PROFILE */, JSON.stringify([]))));
            this.storageService.remove(EditorResolverService_1.cacheStorageID, 0 /* StorageScope.PROFILE */);
            this._register(this.storageService.onWillSaveState(() => {
                // We want to store the glob patterns we would activate on, this allows us to know if we need to await the ext host on startup for opening a resource
                this.cacheEditors();
            }));
            // When extensions have registered we no longer need the cache
            this.extensionService.onDidRegisterExtensions(() => {
                this.cache = undefined;
            });
        }
        resolveUntypedInputAndGroup(editor, preferredGroup) {
            const untypedEditor = editor;
            // Use the untyped editor to find a group
            const findGroupResult = this.instantiationService.invokeFunction(editorGroupFinder_1.findGroup, untypedEditor, preferredGroup);
            if (findGroupResult instanceof Promise) {
                return findGroupResult.then(([group, activation]) => [untypedEditor, group, activation]);
            }
            else {
                const [group, activation] = findGroupResult;
                return [untypedEditor, group, activation];
            }
        }
        async resolveEditor(editor, preferredGroup) {
            // Update the flattened editors
            this._flattenedEditors = this._flattenEditorsMap();
            // Special case: side by side editors requires us to
            // independently resolve both sides and then build
            // a side by side editor with the result
            if ((0, editor_2.isResourceSideBySideEditorInput)(editor)) {
                return this.doResolveSideBySideEditor(editor, preferredGroup);
            }
            let resolvedUntypedAndGroup;
            const resolvedUntypedAndGroupResult = this.resolveUntypedInputAndGroup(editor, preferredGroup);
            if (resolvedUntypedAndGroupResult instanceof Promise) {
                resolvedUntypedAndGroup = await resolvedUntypedAndGroupResult;
            }
            else {
                resolvedUntypedAndGroup = resolvedUntypedAndGroupResult;
            }
            if (!resolvedUntypedAndGroup) {
                return 2 /* ResolvedStatus.NONE */;
            }
            // Get the resolved untyped editor, group, and activation
            const [untypedEditor, group, activation] = resolvedUntypedAndGroup;
            if (activation) {
                untypedEditor.options = { ...untypedEditor.options, activation };
            }
            let resource = editor_2.EditorResourceAccessor.getCanonicalUri(untypedEditor, { supportSideBySide: editor_2.SideBySideEditor.PRIMARY });
            // If it was resolved before we await for the extensions to activate and then proceed with resolution or else the backing extensions won't be registered
            if (this.cache && resource && this.resourceMatchesCache(resource)) {
                await this.extensionService.whenInstalledExtensionsRegistered();
            }
            // Undefined resource -> untilted. Other malformed URI's are unresolvable
            if (resource === undefined) {
                resource = uri_1.URI.from({ scheme: network_1.Schemas.untitled });
            }
            else if (resource.scheme === undefined || resource === null) {
                return 2 /* ResolvedStatus.NONE */;
            }
            if (untypedEditor.options?.override === editor_1.EditorResolution.PICK) {
                const picked = await this.doPickEditor(untypedEditor);
                // If the picker was cancelled we will stop resolving the editor
                if (!picked) {
                    return 1 /* ResolvedStatus.ABORT */;
                }
                // Populate the options with the new ones
                untypedEditor.options = picked;
            }
            // Resolved the editor ID as much as possible, now find a given editor (cast here is ok because we resolve down to a string above)
            let { editor: selectedEditor, conflictingDefault } = this.getEditor(resource, untypedEditor.options?.override);
            // If no editor was found and this was a typed editor or an editor with an explicit override we could not resolve it
            if (!selectedEditor && (untypedEditor.options?.override || (0, editor_2.isEditorInputWithOptions)(editor))) {
                return 2 /* ResolvedStatus.NONE */;
            }
            else if (!selectedEditor) {
                // Simple untyped editors that we could not resolve will be resolved to the default editor
                const resolvedEditor = this.getEditor(resource, editor_2.DEFAULT_EDITOR_ASSOCIATION.id);
                selectedEditor = resolvedEditor?.editor;
                conflictingDefault = resolvedEditor?.conflictingDefault;
                if (!selectedEditor) {
                    return 2 /* ResolvedStatus.NONE */;
                }
            }
            // In the special case of diff editors we do some more work to determine the correct editor for both sides
            if ((0, editor_2.isResourceDiffEditorInput)(untypedEditor) && untypedEditor.options?.override === undefined) {
                let resource2 = editor_2.EditorResourceAccessor.getCanonicalUri(untypedEditor, { supportSideBySide: editor_2.SideBySideEditor.SECONDARY });
                if (!resource2) {
                    resource2 = uri_1.URI.from({ scheme: network_1.Schemas.untitled });
                }
                const { editor: selectedEditor2 } = this.getEditor(resource2, undefined);
                if (!selectedEditor2 || selectedEditor.editorInfo.id !== selectedEditor2.editorInfo.id) {
                    const { editor: selectedDiff, conflictingDefault: conflictingDefaultDiff } = this.getEditor(resource, editor_2.DEFAULT_EDITOR_ASSOCIATION.id);
                    selectedEditor = selectedDiff;
                    conflictingDefault = conflictingDefaultDiff;
                }
                if (!selectedEditor) {
                    return 2 /* ResolvedStatus.NONE */;
                }
            }
            // If no override we take the selected editor id so that matches works with the isActive check
            untypedEditor.options = { override: selectedEditor.editorInfo.id, ...untypedEditor.options };
            // Check if diff can be created based on prescene of factory function
            if (selectedEditor.editorFactoryObject.createDiffEditorInput === undefined && (0, editor_2.isResourceDiffEditorInput)(untypedEditor)) {
                return 2 /* ResolvedStatus.NONE */;
            }
            const input = await this.doResolveEditor(untypedEditor, group, selectedEditor);
            if (conflictingDefault && input) {
                // Show the conflicting default dialog
                await this.doHandleConflictingDefaults(resource, selectedEditor.editorInfo.label, untypedEditor, input.editor, group);
            }
            if (input) {
                this.sendEditorResolutionTelemetry(input.editor);
                if (input.editor.editorId !== selectedEditor.editorInfo.id) {
                    this.logService.warn(`Editor ID Mismatch: ${input.editor.editorId} !== ${selectedEditor.editorInfo.id}. This will cause bugs. Please ensure editorInput.editorId matches the registered id`);
                }
                return { ...input, group };
            }
            return 1 /* ResolvedStatus.ABORT */;
        }
        async doResolveSideBySideEditor(editor, preferredGroup) {
            const primaryResolvedEditor = await this.resolveEditor(editor.primary, preferredGroup);
            if (!(0, editor_2.isEditorInputWithOptionsAndGroup)(primaryResolvedEditor)) {
                return 2 /* ResolvedStatus.NONE */;
            }
            const secondaryResolvedEditor = await this.resolveEditor(editor.secondary, primaryResolvedEditor.group ?? preferredGroup);
            if (!(0, editor_2.isEditorInputWithOptionsAndGroup)(secondaryResolvedEditor)) {
                return 2 /* ResolvedStatus.NONE */;
            }
            return {
                group: primaryResolvedEditor.group ?? secondaryResolvedEditor.group,
                editor: this.instantiationService.createInstance(sideBySideEditorInput_1.SideBySideEditorInput, editor.label, editor.description, secondaryResolvedEditor.editor, primaryResolvedEditor.editor),
                options: editor.options
            };
        }
        bufferChangeEvents(callback) {
            this._onDidChangeEditorRegistrations.pause();
            try {
                callback();
            }
            finally {
                this._onDidChangeEditorRegistrations.resume();
            }
        }
        registerEditor(globPattern, editorInfo, options, editorFactoryObject) {
            let registeredEditor = this._editors.get(globPattern);
            if (registeredEditor === undefined) {
                registeredEditor = new Map();
                this._editors.set(globPattern, registeredEditor);
            }
            let editorsWithId = registeredEditor.get(editorInfo.id);
            if (editorsWithId === undefined) {
                editorsWithId = [];
            }
            const remove = (0, arrays_1.insert)(editorsWithId, {
                globPattern,
                editorInfo,
                options,
                editorFactoryObject
            });
            registeredEditor.set(editorInfo.id, editorsWithId);
            this._shouldReFlattenEditors = true;
            this._onDidChangeEditorRegistrations.fire();
            return (0, lifecycle_1.toDisposable)(() => {
                remove();
                if (editorsWithId && editorsWithId.length === 0) {
                    registeredEditor?.delete(editorInfo.id);
                }
                this._shouldReFlattenEditors = true;
                this._onDidChangeEditorRegistrations.fire();
            });
        }
        getAssociationsForResource(resource) {
            const associations = this.getAllUserAssociations();
            let matchingAssociations = associations.filter(association => association.filenamePattern && (0, editorResolverService_1.globMatchesResource)(association.filenamePattern, resource));
            // Sort matching associations based on glob length as a longer glob will be more specific
            matchingAssociations = matchingAssociations.sort((a, b) => (b.filenamePattern?.length ?? 0) - (a.filenamePattern?.length ?? 0));
            const allEditors = this._registeredEditors;
            // Ensure that the settings are valid editors
            return matchingAssociations.filter(association => allEditors.find(c => c.editorInfo.id === association.viewType));
        }
        getAllUserAssociations() {
            const inspectedEditorAssociations = this.configurationService.inspect(editorResolverService_1.editorsAssociationsSettingId) || {};
            const defaultAssociations = inspectedEditorAssociations.defaultValue ?? {};
            const workspaceAssociations = inspectedEditorAssociations.workspaceValue ?? {};
            const userAssociations = inspectedEditorAssociations.userValue ?? {};
            const rawAssociations = { ...workspaceAssociations };
            // We want to apply the default associations and user associations on top of the workspace associations but ignore duplicate keys.
            for (const [key, value] of Object.entries({ ...defaultAssociations, ...userAssociations })) {
                if (rawAssociations[key] === undefined) {
                    rawAssociations[key] = value;
                }
            }
            const associations = [];
            for (const [key, value] of Object.entries(rawAssociations)) {
                const association = {
                    filenamePattern: key,
                    viewType: value
                };
                associations.push(association);
            }
            return associations;
        }
        /**
         * Given the nested nature of the editors map, we merge factories of the same glob and id to make it flat
         * and easier to work with
         */
        _flattenEditorsMap() {
            // If we shouldn't be re-flattening (due to lack of update) then return early
            if (!this._shouldReFlattenEditors) {
                return this._flattenedEditors;
            }
            this._shouldReFlattenEditors = false;
            const editors = new Map();
            for (const [glob, value] of this._editors) {
                const registeredEditors = [];
                for (const editors of value.values()) {
                    let registeredEditor = undefined;
                    // Merge all editors with the same id and glob pattern together
                    for (const editor of editors) {
                        if (!registeredEditor) {
                            registeredEditor = {
                                editorInfo: editor.editorInfo,
                                globPattern: editor.globPattern,
                                options: {},
                                editorFactoryObject: {}
                            };
                        }
                        // Merge options and factories
                        registeredEditor.options = { ...registeredEditor.options, ...editor.options };
                        registeredEditor.editorFactoryObject = { ...registeredEditor.editorFactoryObject, ...editor.editorFactoryObject };
                    }
                    if (registeredEditor) {
                        registeredEditors.push(registeredEditor);
                    }
                }
                editors.set(glob, registeredEditors);
            }
            return editors;
        }
        /**
         * Returns all editors as an array. Possible to contain duplicates
         */
        get _registeredEditors() {
            return (0, arrays_1.flatten)(Array.from(this._flattenedEditors.values()));
        }
        updateUserAssociations(globPattern, editorID) {
            const newAssociation = { viewType: editorID, filenamePattern: globPattern };
            const currentAssociations = this.getAllUserAssociations();
            const newSettingObject = Object.create(null);
            // Form the new setting object including the newest associations
            for (const association of [...currentAssociations, newAssociation]) {
                if (association.filenamePattern) {
                    newSettingObject[association.filenamePattern] = association.viewType;
                }
            }
            this.configurationService.updateValue(editorResolverService_1.editorsAssociationsSettingId, newSettingObject);
        }
        findMatchingEditors(resource) {
            // The user setting should be respected even if the editor doesn't specify that resource in package.json
            const userSettings = this.getAssociationsForResource(resource);
            const matchingEditors = [];
            // Then all glob patterns
            for (const [key, editors] of this._flattenedEditors) {
                for (const editor of editors) {
                    const foundInSettings = userSettings.find(setting => setting.viewType === editor.editorInfo.id);
                    if ((foundInSettings && editor.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.exclusive) || (0, editorResolverService_1.globMatchesResource)(key, resource)) {
                        matchingEditors.push(editor);
                    }
                }
            }
            // Return the editors sorted by their priority
            return matchingEditors.sort((a, b) => {
                // Very crude if priorities match longer glob wins as longer globs are normally more specific
                if ((0, editorResolverService_1.priorityToRank)(b.editorInfo.priority) === (0, editorResolverService_1.priorityToRank)(a.editorInfo.priority) && typeof b.globPattern === 'string' && typeof a.globPattern === 'string') {
                    return b.globPattern.length - a.globPattern.length;
                }
                return (0, editorResolverService_1.priorityToRank)(b.editorInfo.priority) - (0, editorResolverService_1.priorityToRank)(a.editorInfo.priority);
            });
        }
        getEditors(resource) {
            this._flattenedEditors = this._flattenEditorsMap();
            // By resource
            if (uri_1.URI.isUri(resource)) {
                const editors = this.findMatchingEditors(resource);
                if (editors.find(e => e.editorInfo.priority === editorResolverService_1.RegisteredEditorPriority.exclusive)) {
                    return [];
                }
                return editors.map(editor => editor.editorInfo);
            }
            // All
            return (0, arrays_1.distinct)(this._registeredEditors.map(editor => editor.editorInfo), editor => editor.id);
        }
        /**
         * Given a resource and an editorId selects the best possible editor
         * @returns The editor and whether there was another default which conflicted with it
         */
        getEditor(resource, editorId) {
            const findMatchingEditor = (editors, viewType) => {
                return editors.find((editor) => {
                    if (editor.options && editor.options.canSupportResource !== undefined) {
                        return editor.editorInfo.id === viewType && editor.options.canSupportResource(resource);
                    }
                    return editor.editorInfo.id === viewType;
                });
            };
            if (editorId && editorId !== editor_1.EditorResolution.EXCLUSIVE_ONLY) {
                // Specific id passed in doesn't have to match the resource, it can be anything
                const registeredEditors = this._registeredEditors;
                return {
                    editor: findMatchingEditor(registeredEditors, editorId),
                    conflictingDefault: false
                };
            }
            const editors = this.findMatchingEditors(resource);
            const associationsFromSetting = this.getAssociationsForResource(resource);
            // We only want minPriority+ if no user defined setting is found, else we won't resolve an editor
            const minPriority = editorId === editor_1.EditorResolution.EXCLUSIVE_ONLY ? editorResolverService_1.RegisteredEditorPriority.exclusive : editorResolverService_1.RegisteredEditorPriority.builtin;
            let possibleEditors = editors.filter(editor => (0, editorResolverService_1.priorityToRank)(editor.editorInfo.priority) >= (0, editorResolverService_1.priorityToRank)(minPriority) && editor.editorInfo.id !== editor_2.DEFAULT_EDITOR_ASSOCIATION.id);
            if (possibleEditors.length === 0) {
                return {
                    editor: associationsFromSetting[0] && minPriority !== editorResolverService_1.RegisteredEditorPriority.exclusive ? findMatchingEditor(editors, associationsFromSetting[0].viewType) : undefined,
                    conflictingDefault: false
                };
            }
            // If the editor is exclusive we use that, else use the user setting, else use the built-in+ editor
            const selectedViewType = possibleEditors[0].editorInfo.priority === editorResolverService_1.RegisteredEditorPriority.exclusive ?
                possibleEditors[0].editorInfo.id :
                associationsFromSetting[0]?.viewType || possibleEditors[0].editorInfo.id;
            let conflictingDefault = false;
            // Filter out exclusive before we check for conflicts as exclusive editors cannot be manually chosen
            possibleEditors = possibleEditors.filter(editor => editor.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.exclusive);
            if (associationsFromSetting.length === 0 && possibleEditors.length > 1) {
                conflictingDefault = true;
            }
            return {
                editor: findMatchingEditor(editors, selectedViewType),
                conflictingDefault
            };
        }
        async doResolveEditor(editor, group, selectedEditor) {
            let options = editor.options;
            const resource = editor_2.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_2.SideBySideEditor.PRIMARY });
            // If no activation option is provided, populate it.
            if (options && typeof options.activation === 'undefined') {
                options = { ...options, activation: options.preserveFocus ? editor_1.EditorActivation.RESTORE : undefined };
            }
            // If it's a merge editor we trigger the create merge editor input
            if ((0, editor_2.isResourceMergeEditorInput)(editor)) {
                if (!selectedEditor.editorFactoryObject.createMergeEditorInput) {
                    return;
                }
                const inputWithOptions = await selectedEditor.editorFactoryObject.createMergeEditorInput(editor, group);
                return { editor: inputWithOptions.editor, options: inputWithOptions.options ?? options };
            }
            // If it's a diff editor we trigger the create diff editor input
            if ((0, editor_2.isResourceDiffEditorInput)(editor)) {
                if (!selectedEditor.editorFactoryObject.createDiffEditorInput) {
                    return;
                }
                const inputWithOptions = await selectedEditor.editorFactoryObject.createDiffEditorInput(editor, group);
                return { editor: inputWithOptions.editor, options: inputWithOptions.options ?? options };
            }
            // If it's a diff list editor we trigger the create diff list editor input
            if ((0, editor_2.isResourceDiffListEditorInput)(editor)) {
                if (!selectedEditor.editorFactoryObject.createMultiDiffEditorInput) {
                    return;
                }
                const inputWithOptions = await selectedEditor.editorFactoryObject.createMultiDiffEditorInput(editor, group);
                return { editor: inputWithOptions.editor, options: inputWithOptions.options ?? options };
            }
            if ((0, editor_2.isResourceSideBySideEditorInput)(editor)) {
                throw new Error(`Untyped side by side editor input not supported here.`);
            }
            if ((0, editor_2.isUntitledResourceEditorInput)(editor)) {
                if (!selectedEditor.editorFactoryObject.createUntitledEditorInput) {
                    return;
                }
                const inputWithOptions = await selectedEditor.editorFactoryObject.createUntitledEditorInput(editor, group);
                return { editor: inputWithOptions.editor, options: inputWithOptions.options ?? options };
            }
            // Should no longer have an undefined resource so lets throw an error if that's somehow the case
            if (resource === undefined) {
                throw new Error(`Undefined resource on non untitled editor input.`);
            }
            // If the editor states it can only be opened once per resource we must close all existing ones except one and move the new one into the group
            const singleEditorPerResource = typeof selectedEditor.options?.singlePerResource === 'function' ? selectedEditor.options.singlePerResource() : selectedEditor.options?.singlePerResource;
            if (singleEditorPerResource) {
                const foundInput = await this.moveExistingEditorForResource(resource, selectedEditor.editorInfo.id, group);
                if (foundInput) {
                    return { editor: foundInput, options };
                }
            }
            // If no factory is above, return flow back to caller letting them know we could not resolve it
            if (!selectedEditor.editorFactoryObject.createEditorInput) {
                return;
            }
            // Respect options passed back
            const inputWithOptions = await selectedEditor.editorFactoryObject.createEditorInput(editor, group);
            options = inputWithOptions.options ?? options;
            const input = inputWithOptions.editor;
            return { editor: input, options };
        }
        /**
         * Moves an editor with the resource and viewtype to target group if one exists
         * Additionally will close any other editors that are open for that resource and viewtype besides the first one found
         * @param resource The resource of the editor
         * @param viewType the viewtype of the editor
         * @param targetGroup The group to move it to
         * @returns An editor input if one exists, else undefined
         */
        async moveExistingEditorForResource(resource, viewType, targetGroup) {
            const editorInfoForResource = this.findExistingEditorsForResource(resource, viewType);
            if (!editorInfoForResource.length) {
                return;
            }
            const editorToUse = editorInfoForResource[0];
            // We should only have one editor but if there are multiple we close the others
            for (const { editor, group } of editorInfoForResource) {
                if (editor !== editorToUse.editor) {
                    const closed = await group.closeEditor(editor);
                    if (!closed) {
                        return;
                    }
                }
            }
            // Move the editor already opened to the target group
            if (targetGroup.id !== editorToUse.group.id) {
                editorToUse.group.moveEditor(editorToUse.editor, targetGroup);
                return editorToUse.editor;
            }
            return;
        }
        /**
         * Given a resource and an editorId, returns all editors open for that resource and editorId.
         * @param resource The resource specified
         * @param editorId The editorID
         * @returns A list of editors
         */
        findExistingEditorsForResource(resource, editorId) {
            const out = [];
            const orderedGroups = (0, arrays_1.distinct)([
                ...this.editorGroupService.groups,
            ]);
            for (const group of orderedGroups) {
                for (const editor of group.editors) {
                    if ((0, resources_1.isEqual)(editor.resource, resource) && editor.editorId === editorId) {
                        out.push({ editor, group });
                    }
                }
            }
            return out;
        }
        async doHandleConflictingDefaults(resource, editorName, untypedInput, currentEditor, group) {
            const editors = this.findMatchingEditors(resource);
            const storedChoices = JSON.parse(this.storageService.get(EditorResolverService_1.conflictingDefaultsStorageID, 0 /* StorageScope.PROFILE */, '{}'));
            const globForResource = `*${(0, resources_1.extname)(resource)}`;
            // Writes to the storage service that a choice has been made for the currently installed editors
            const writeCurrentEditorsToStorage = () => {
                storedChoices[globForResource] = [];
                editors.forEach(editor => storedChoices[globForResource].push(editor.editorInfo.id));
                this.storageService.store(EditorResolverService_1.conflictingDefaultsStorageID, JSON.stringify(storedChoices), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            };
            // If the user has already made a choice for this editor we don't want to ask them again
            if (storedChoices[globForResource] && storedChoices[globForResource].find(editorID => editorID === currentEditor.editorId)) {
                return;
            }
            const handle = this.notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('editorResolver.conflictingDefaults', 'There are multiple default editors available for the resource.'), [{
                    label: (0, nls_1.localize)('editorResolver.configureDefault', 'Configure Default'),
                    run: async () => {
                        // Show the picker and tell it to update the setting to whatever the user selected
                        const picked = await this.doPickEditor(untypedInput, true);
                        if (!picked) {
                            return;
                        }
                        untypedInput.options = picked;
                        const replacementEditor = await this.resolveEditor(untypedInput, group);
                        if (replacementEditor === 1 /* ResolvedStatus.ABORT */ || replacementEditor === 2 /* ResolvedStatus.NONE */) {
                            return;
                        }
                        // Replace the current editor with the picked one
                        group.replaceEditors([
                            {
                                editor: currentEditor,
                                replacement: replacementEditor.editor,
                                options: replacementEditor.options ?? picked,
                            }
                        ]);
                    }
                },
                {
                    label: (0, nls_1.localize)('editorResolver.keepDefault', 'Keep {0}', editorName),
                    run: writeCurrentEditorsToStorage
                }
            ]);
            // If the user pressed X we assume they want to keep the current editor as default
            const onCloseListener = handle.onDidClose(() => {
                writeCurrentEditorsToStorage();
                onCloseListener.dispose();
            });
        }
        mapEditorsToQuickPickEntry(resource, showDefaultPicker) {
            const currentEditor = (0, arrays_1.firstOrDefault)(this.editorGroupService.activeGroup.findEditors(resource));
            // If untitled, we want all registered editors
            let registeredEditors = resource.scheme === network_1.Schemas.untitled ? this._registeredEditors.filter(e => e.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.exclusive) : this.findMatchingEditors(resource);
            // We don't want duplicate Id entries
            registeredEditors = (0, arrays_1.distinct)(registeredEditors, c => c.editorInfo.id);
            const defaultSetting = this.getAssociationsForResource(resource)[0]?.viewType;
            // Not the most efficient way to do this, but we want to ensure the text editor is at the top of the quickpick
            registeredEditors = registeredEditors.sort((a, b) => {
                if (a.editorInfo.id === editor_2.DEFAULT_EDITOR_ASSOCIATION.id) {
                    return -1;
                }
                else if (b.editorInfo.id === editor_2.DEFAULT_EDITOR_ASSOCIATION.id) {
                    return 1;
                }
                else {
                    return (0, editorResolverService_1.priorityToRank)(b.editorInfo.priority) - (0, editorResolverService_1.priorityToRank)(a.editorInfo.priority);
                }
            });
            const quickPickEntries = [];
            const currentlyActiveLabel = (0, nls_1.localize)('promptOpenWith.currentlyActive', "Active");
            const currentDefaultLabel = (0, nls_1.localize)('promptOpenWith.currentDefault', "Default");
            const currentDefaultAndActiveLabel = (0, nls_1.localize)('promptOpenWith.currentDefaultAndActive', "Active and Default");
            // Default order = setting -> highest priority -> text
            let defaultViewType = defaultSetting;
            if (!defaultViewType && registeredEditors.length > 2 && registeredEditors[1]?.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.option) {
                defaultViewType = registeredEditors[1]?.editorInfo.id;
            }
            if (!defaultViewType) {
                defaultViewType = editor_2.DEFAULT_EDITOR_ASSOCIATION.id;
            }
            // Map the editors to quickpick entries
            registeredEditors.forEach(editor => {
                const currentViewType = currentEditor?.editorId ?? editor_2.DEFAULT_EDITOR_ASSOCIATION.id;
                const isActive = currentEditor ? editor.editorInfo.id === currentViewType : false;
                const isDefault = editor.editorInfo.id === defaultViewType;
                const quickPickEntry = {
                    id: editor.editorInfo.id,
                    label: editor.editorInfo.label,
                    description: isActive && isDefault ? currentDefaultAndActiveLabel : isActive ? currentlyActiveLabel : isDefault ? currentDefaultLabel : undefined,
                    detail: editor.editorInfo.detail ?? editor.editorInfo.priority,
                };
                quickPickEntries.push(quickPickEntry);
            });
            if (!showDefaultPicker && (0, resources_1.extname)(resource) !== '') {
                const separator = { type: 'separator' };
                quickPickEntries.push(separator);
                const configureDefaultEntry = {
                    id: EditorResolverService_1.configureDefaultID,
                    label: (0, nls_1.localize)('promptOpenWith.configureDefault', "Configure default editor for '{0}'...", `*${(0, resources_1.extname)(resource)}`),
                };
                quickPickEntries.push(configureDefaultEntry);
            }
            return quickPickEntries;
        }
        async doPickEditor(editor, showDefaultPicker) {
            let resource = editor_2.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_2.SideBySideEditor.PRIMARY });
            if (resource === undefined) {
                resource = uri_1.URI.from({ scheme: network_1.Schemas.untitled });
            }
            // Get all the editors for the resource as quickpick entries
            const editorPicks = this.mapEditorsToQuickPickEntry(resource, showDefaultPicker);
            // Create the editor picker
            const editorPicker = this.quickInputService.createQuickPick();
            const placeHolderMessage = showDefaultPicker ?
                (0, nls_1.localize)('promptOpenWith.updateDefaultPlaceHolder', "Select new default editor for '{0}'", `*${(0, resources_1.extname)(resource)}`) :
                (0, nls_1.localize)('promptOpenWith.placeHolder', "Select editor for '{0}'", (0, resources_1.basename)(resource));
            editorPicker.placeholder = placeHolderMessage;
            editorPicker.canAcceptInBackground = true;
            editorPicker.items = editorPicks;
            const firstItem = editorPicker.items.find(item => item.type === 'item');
            if (firstItem) {
                editorPicker.selectedItems = [firstItem];
            }
            // Prompt the user to select an editor
            const picked = await new Promise(resolve => {
                editorPicker.onDidAccept(e => {
                    let result = undefined;
                    if (editorPicker.selectedItems.length === 1) {
                        result = {
                            item: editorPicker.selectedItems[0],
                            keyMods: editorPicker.keyMods,
                            openInBackground: e.inBackground
                        };
                    }
                    // If asked to always update the setting then update it even if the gear isn't clicked
                    if (resource && showDefaultPicker && result?.item.id) {
                        this.updateUserAssociations(`*${(0, resources_1.extname)(resource)}`, result.item.id);
                    }
                    resolve(result);
                });
                editorPicker.onDidHide(() => resolve(undefined));
                editorPicker.onDidTriggerItemButton(e => {
                    // Trigger opening and close picker
                    resolve({ item: e.item, openInBackground: false });
                    // Persist setting
                    if (resource && e.item && e.item.id) {
                        this.updateUserAssociations(`*${(0, resources_1.extname)(resource)}`, e.item.id);
                    }
                });
                editorPicker.show();
            });
            // Close picker
            editorPicker.dispose();
            // If the user picked an editor, look at how the picker was
            // used (e.g. modifier keys, open in background) and create the
            // options and group to use accordingly
            if (picked) {
                // If the user selected to configure default we trigger this picker again and tell it to show the default picker
                if (picked.item.id === EditorResolverService_1.configureDefaultID) {
                    return this.doPickEditor(editor, true);
                }
                // Figure out options
                const targetOptions = {
                    ...editor.options,
                    override: picked.item.id,
                    preserveFocus: picked.openInBackground || editor.options?.preserveFocus,
                };
                return targetOptions;
            }
            return undefined;
        }
        sendEditorResolutionTelemetry(chosenInput) {
            if (chosenInput.editorId) {
                this.telemetryService.publicLog2('override.viewType', { viewType: chosenInput.editorId });
            }
        }
        cacheEditors() {
            // Create a set to store glob patterns
            const cacheStorage = new Set();
            // Store just the relative pattern pieces without any path info
            for (const [globPattern, contribPoint] of this._flattenedEditors) {
                const nonOptional = !!contribPoint.find(c => c.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.option && c.editorInfo.id !== editor_2.DEFAULT_EDITOR_ASSOCIATION.id);
                // Don't keep a cache of the optional ones as those wouldn't be opened on start anyways
                if (!nonOptional) {
                    continue;
                }
                if (glob.isRelativePattern(globPattern)) {
                    cacheStorage.add(`${globPattern.pattern}`);
                }
                else {
                    cacheStorage.add(globPattern);
                }
            }
            // Also store the users settings as those would have to activate on startup as well
            const userAssociations = this.getAllUserAssociations();
            for (const association of userAssociations) {
                if (association.filenamePattern) {
                    cacheStorage.add(association.filenamePattern);
                }
            }
            this.storageService.store(EditorResolverService_1.cacheStorageID, JSON.stringify(Array.from(cacheStorage)), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        resourceMatchesCache(resource) {
            if (!this.cache) {
                return false;
            }
            for (const cacheEntry of this.cache) {
                if ((0, editorResolverService_1.globMatchesResource)(cacheEntry, resource)) {
                    return true;
                }
            }
            return false;
        }
    };
    exports.EditorResolverService = EditorResolverService;
    exports.EditorResolverService = EditorResolverService = EditorResolverService_1 = __decorate([
        __param(0, editorGroupsService_1.IEditorGroupsService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, notification_1.INotificationService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, storage_1.IStorageService),
        __param(7, extensions_2.IExtensionService),
        __param(8, log_1.ILogService)
    ], EditorResolverService);
    (0, extensions_1.registerSingleton)(editorResolverService_1.IEditorResolverService, EditorResolverService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUmVzb2x2ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZWRpdG9yL2Jyb3dzZXIvZWRpdG9yUmVzb2x2ZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFxQ3pGLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsc0JBQVU7O1FBT3BELFlBQVk7aUJBQ1ksdUJBQWtCLEdBQUcsaUNBQWlDLEFBQXBDLENBQXFDO2lCQUN2RCxtQkFBYyxHQUFHLDZCQUE2QixBQUFoQyxDQUFpQztpQkFDL0MsaUNBQTRCLEdBQUcsMkNBQTJDLEFBQTlDLENBQStDO1FBUW5HLFlBQ3VCLGtCQUF5RCxFQUN4RCxvQkFBNEQsRUFDNUQsb0JBQTRELEVBQy9ELGlCQUFzRCxFQUNwRCxtQkFBMEQsRUFDN0QsZ0JBQW9ELEVBQ3RELGNBQWdELEVBQzlDLGdCQUFvRCxFQUMxRCxVQUF3QztZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQVYrQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXNCO1lBQ3ZDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUM5QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ25DLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNyQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDN0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN6QyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBeEJ0RCxTQUFTO1lBQ1Esb0NBQStCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdCQUFnQixFQUFRLENBQUMsQ0FBQztZ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