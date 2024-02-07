/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/common/editor", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/base/common/async", "vs/workbench/services/editor/common/editorService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/network", "vs/base/common/iterator"], function (require, exports, nls_1, editor_1, platform_1, lifecycle_1, async_1, editorService_1, uriIdentity_1, workingCopyService_1, network_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeEditorAriaLabel = exports.whenEditorClosed = exports.EditorPaneRegistry = exports.EditorPaneDescriptor = void 0;
    /**
     * A lightweight descriptor of an editor pane. The descriptor is deferred so that heavy editor
     * panes can load lazily in the workbench.
     */
    class EditorPaneDescriptor {
        static create(ctor, typeId, name) {
            return new EditorPaneDescriptor(ctor, typeId, name);
        }
        constructor(ctor, typeId, name) {
            this.ctor = ctor;
            this.typeId = typeId;
            this.name = name;
        }
        instantiate(instantiationService) {
            return instantiationService.createInstance(this.ctor);
        }
        describes(editorPane) {
            return editorPane.getId() === this.typeId;
        }
    }
    exports.EditorPaneDescriptor = EditorPaneDescriptor;
    class EditorPaneRegistry {
        constructor() {
            this.mapEditorPanesToEditors = new Map();
            //#endregion
        }
        registerEditorPane(editorPaneDescriptor, editorDescriptors) {
            this.mapEditorPanesToEditors.set(editorPaneDescriptor, editorDescriptors);
            return (0, lifecycle_1.toDisposable)(() => {
                this.mapEditorPanesToEditors.delete(editorPaneDescriptor);
            });
        }
        getEditorPane(editor) {
            const descriptors = this.findEditorPaneDescriptors(editor);
            if (descriptors.length === 0) {
                return undefined;
            }
            if (descriptors.length === 1) {
                return descriptors[0];
            }
            return editor.prefersEditorPane(descriptors);
        }
        findEditorPaneDescriptors(editor, byInstanceOf) {
            const matchingEditorPaneDescriptors = [];
            for (const editorPane of this.mapEditorPanesToEditors.keys()) {
                const editorDescriptors = this.mapEditorPanesToEditors.get(editorPane) || [];
                for (const editorDescriptor of editorDescriptors) {
                    const editorClass = editorDescriptor.ctor;
                    // Direct check on constructor type (ignores prototype chain)
                    if (!byInstanceOf && editor.constructor === editorClass) {
                        matchingEditorPaneDescriptors.push(editorPane);
                        break;
                    }
                    // Normal instanceof check
                    else if (byInstanceOf && editor instanceof editorClass) {
                        matchingEditorPaneDescriptors.push(editorPane);
                        break;
                    }
                }
            }
            // If no descriptors found, continue search using instanceof and prototype chain
            if (!byInstanceOf && matchingEditorPaneDescriptors.length === 0) {
                return this.findEditorPaneDescriptors(editor, true);
            }
            return matchingEditorPaneDescriptors;
        }
        //#region Used for tests only
        getEditorPaneByType(typeId) {
            return iterator_1.Iterable.find(this.mapEditorPanesToEditors.keys(), editor => editor.typeId === typeId);
        }
        getEditorPanes() {
            return Array.from(this.mapEditorPanesToEditors.keys());
        }
        getEditors() {
            const editorClasses = [];
            for (const editorPane of this.mapEditorPanesToEditors.keys()) {
                const editorDescriptors = this.mapEditorPanesToEditors.get(editorPane);
                if (editorDescriptors) {
                    editorClasses.push(...editorDescriptors.map(editorDescriptor => editorDescriptor.ctor));
                }
            }
            return editorClasses;
        }
    }
    exports.EditorPaneRegistry = EditorPaneRegistry;
    platform_1.Registry.add(editor_1.EditorExtensions.EditorPane, new EditorPaneRegistry());
    //#endregion
    //#region Editor Close Tracker
    function whenEditorClosed(accessor, resources) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
        const workingCopyService = accessor.get(workingCopyService_1.IWorkingCopyService);
        return new Promise(resolve => {
            let remainingResources = [...resources];
            // Observe any editor closing from this moment on
            const listener = editorService.onDidCloseEditor(async (event) => {
                if (event.context === editor_1.EditorCloseContext.MOVE) {
                    return; // ignore move events where the editor will open in another group
                }
                let primaryResource = editor_1.EditorResourceAccessor.getOriginalUri(event.editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                let secondaryResource = editor_1.EditorResourceAccessor.getOriginalUri(event.editor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY });
                // Specially handle an editor getting replaced: if the new active editor
                // matches any of the resources from the closed editor, ignore those
                // resources because they were actually not closed, but replaced.
                // (see https://github.com/microsoft/vscode/issues/134299)
                if (event.context === editor_1.EditorCloseContext.REPLACE) {
                    const newPrimaryResource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                    const newSecondaryResource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY });
                    if (uriIdentityService.extUri.isEqual(primaryResource, newPrimaryResource)) {
                        primaryResource = undefined;
                    }
                    if (uriIdentityService.extUri.isEqual(secondaryResource, newSecondaryResource)) {
                        secondaryResource = undefined;
                    }
                }
                // Remove from resources to wait for being closed based on the
                // resources from editors that got closed
                remainingResources = remainingResources.filter(resource => {
                    // Closing editor matches resource directly: remove from remaining
                    if (uriIdentityService.extUri.isEqual(resource, primaryResource) || uriIdentityService.extUri.isEqual(resource, secondaryResource)) {
                        return false;
                    }
                    // Closing editor is untitled with associated resource
                    // that matches resource directly: remove from remaining
                    // but only if the editor was not replaced, otherwise
                    // saving an untitled with associated resource would
                    // release the `--wait` call.
                    // (see https://github.com/microsoft/vscode/issues/141237)
                    if (event.context !== editor_1.EditorCloseContext.REPLACE) {
                        if ((primaryResource?.scheme === network_1.Schemas.untitled && uriIdentityService.extUri.isEqual(resource, primaryResource.with({ scheme: resource.scheme }))) ||
                            (secondaryResource?.scheme === network_1.Schemas.untitled && uriIdentityService.extUri.isEqual(resource, secondaryResource.with({ scheme: resource.scheme })))) {
                            return false;
                        }
                    }
                    // Editor is not yet closed, so keep it in waiting mode
                    return true;
                });
                // All resources to wait for being closed are closed
                if (remainingResources.length === 0) {
                    // If auto save is configured with the default delay (1s) it is possible
                    // to close the editor while the save still continues in the background. As such
                    // we have to also check if the editors to track for are dirty and if so wait
                    // for them to get saved.
                    const dirtyResources = resources.filter(resource => workingCopyService.isDirty(resource));
                    if (dirtyResources.length > 0) {
                        await async_1.Promises.settled(dirtyResources.map(async (resource) => await new Promise(resolve => {
                            if (!workingCopyService.isDirty(resource)) {
                                return resolve(); // return early if resource is not dirty
                            }
                            // Otherwise resolve promise when resource is saved
                            const listener = workingCopyService.onDidChangeDirty(workingCopy => {
                                if (!workingCopy.isDirty() && uriIdentityService.extUri.isEqual(resource, workingCopy.resource)) {
                                    listener.dispose();
                                    return resolve();
                                }
                            });
                        })));
                    }
                    listener.dispose();
                    return resolve();
                }
            });
        });
    }
    exports.whenEditorClosed = whenEditorClosed;
    //#endregion
    //#region ARIA
    function computeEditorAriaLabel(input, index, group, groupCount) {
        let ariaLabel = input.getAriaLabel();
        if (group && !group.isPinned(input)) {
            ariaLabel = (0, nls_1.localize)('preview', "{0}, preview", ariaLabel);
        }
        if (group?.isSticky(index ?? input)) {
            ariaLabel = (0, nls_1.localize)('pinned', "{0}, pinned", ariaLabel);
        }
        // Apply group information to help identify in
        // which group we are (only if more than one group
        // is actually opened)
        if (group && typeof groupCount === 'number' && groupCount > 1) {
            ariaLabel = `${ariaLabel}, ${group.ariaLabel}`;
        }
        return ariaLabel;
    }
    exports.computeEditorAriaLabel = computeEditorAriaLabel;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9lZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMENoRzs7O09BR0c7SUFDSCxNQUFhLG9CQUFvQjtRQUVoQyxNQUFNLENBQUMsTUFBTSxDQUNaLElBQWdELEVBQ2hELE1BQWMsRUFDZCxJQUFZO1lBRVosT0FBTyxJQUFJLG9CQUFvQixDQUFDLElBQXlDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFFRCxZQUNrQixJQUF1QyxFQUMvQyxNQUFjLEVBQ2QsSUFBWTtZQUZKLFNBQUksR0FBSixJQUFJLENBQW1DO1lBQy9DLFdBQU0sR0FBTixNQUFNLENBQVE7WUFDZCxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ2xCLENBQUM7UUFFTCxXQUFXLENBQUMsb0JBQTJDO1lBQ3RELE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRUQsU0FBUyxDQUFDLFVBQXNCO1lBQy9CLE9BQU8sVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDM0MsQ0FBQztLQUNEO0lBdkJELG9EQXVCQztJQUVELE1BQWEsa0JBQWtCO1FBQS9CO1lBRWtCLDRCQUF1QixHQUFHLElBQUksR0FBRyxFQUFnRSxDQUFDO1lBNEVuSCxZQUFZO1FBQ2IsQ0FBQztRQTNFQSxrQkFBa0IsQ0FBQyxvQkFBMEMsRUFBRSxpQkFBeUQ7WUFDdkgsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBRTFFLE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLHVC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