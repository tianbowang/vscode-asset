/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/browser/composite", "vs/workbench/common/editor", "vs/base/common/map", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/types", "vs/workbench/browser/parts/editor/editor", "vs/base/common/resources", "vs/base/common/extpath", "vs/base/common/lifecycle"], function (require, exports, composite_1, editor_1, map_1, uri_1, event_1, types_1, editor_2, resources_1, extpath_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorMemento = exports.EditorPane = void 0;
    /**
     * The base class of editors in the workbench. Editors register themselves for specific editor inputs.
     * Editors are layed out in the editor part of the workbench in editor groups. Multiple editors can be
     * open at the same time. Each editor has a minimized representation that is good enough to provide some
     * information about the state of the editor data.
     *
     * The workbench will keep an editor alive after it has been created and show/hide it based on
     * user interaction. The lifecycle of a editor goes in the order:
     *
     * - `createEditor()`
     * - `setEditorVisible()`
     * - `layout()`
     * - `setInput()`
     * - `focus()`
     * - `dispose()`: when the editor group the editor is in closes
     *
     * During use of the workbench, a editor will often receive a `clearInput()`, `setEditorVisible()`, `layout()` and
     * `focus()` calls, but only one `create()` and `dispose()` call.
     *
     * This class is only intended to be subclassed and not instantiated.
     */
    class EditorPane extends composite_1.Composite {
        //#endregion
        static { this.EDITOR_MEMENTOS = new Map(); }
        get minimumWidth() { return editor_2.DEFAULT_EDITOR_MIN_DIMENSIONS.width; }
        get maximumWidth() { return editor_2.DEFAULT_EDITOR_MAX_DIMENSIONS.width; }
        get minimumHeight() { return editor_2.DEFAULT_EDITOR_MIN_DIMENSIONS.height; }
        get maximumHeight() { return editor_2.DEFAULT_EDITOR_MAX_DIMENSIONS.height; }
        get input() { return this._input; }
        get options() { return this._options; }
        get group() { return this._group; }
        /**
         * Should be overridden by editors that have their own ScopedContextKeyService
         */
        get scopedContextKeyService() { return undefined; }
        constructor(id, telemetryService, themeService, storageService) {
            super(id, telemetryService, themeService, storageService);
            //#region Events
            this.onDidChangeSizeConstraints = event_1.Event.None;
            this._onDidChangeControl = this._register(new event_1.Emitter());
            this.onDidChangeControl = this._onDidChangeControl.event;
        }
        create(parent) {
            super.create(parent);
            // Create Editor
            this.createEditor(parent);
        }
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Sets the given input with the options to the editor. The input is guaranteed
         * to be different from the previous input that was set using the `input.matches()`
         * method.
         *
         * The provided context gives more information around how the editor was opened.
         *
         * The provided cancellation token should be used to test if the operation
         * was cancelled.
         */
        async setInput(input, options, context, token) {
            this._input = input;
            this._options = options;
        }
        /**
         * Called to indicate to the editor that the input should be cleared and
         * resources associated with the input should be freed.
         *
         * This method can be called based on different contexts, e.g. when opening
         * a different input or different editor control or when closing all editors
         * in a group.
         *
         * To monitor the lifecycle of editor inputs, you should not rely on this
         * method, rather refer to the listeners on `IEditorGroup` via `IEditorGroupsService`.
         */
        clearInput() {
            this._input = undefined;
            this._options = undefined;
        }
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Sets the given options to the editor. Clients should apply the options
         * to the current input.
         */
        setOptions(options) {
            this._options = options;
        }
        setVisible(visible, group) {
            super.setVisible(visible);
            // Propagate to Editor
            this.setEditorVisible(visible, group);
        }
        /**
         * Indicates that the editor control got visible or hidden in a specific group. A
         * editor instance will only ever be visible in one editor group.
         *
         * @param visible the state of visibility of this editor
         * @param group the editor group this editor is in.
         */
        setEditorVisible(visible, group) {
            this._group = group;
        }
        setBoundarySashes(_sashes) {
            // Subclasses can implement
        }
        getEditorMemento(editorGroupService, configurationService, key, limit = 10) {
            const mementoKey = `${this.getId()}${key}`;
            let editorMemento = EditorPane.EDITOR_MEMENTOS.get(mementoKey);
            if (!editorMemento) {
                editorMemento = this._register(new EditorMemento(this.getId(), key, this.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */), limit, editorGroupService, configurationService));
                EditorPane.EDITOR_MEMENTOS.set(mementoKey, editorMemento);
            }
            return editorMemento;
        }
        getViewState() {
            // Subclasses to override
            return undefined;
        }
        saveState() {
            // Save all editor memento for this editor type
            for (const [, editorMemento] of EditorPane.EDITOR_MEMENTOS) {
                if (editorMemento.id === this.getId()) {
                    editorMemento.saveState();
                }
            }
            super.saveState();
        }
        dispose() {
            this._input = undefined;
            this._options = undefined;
            super.dispose();
        }
    }
    exports.EditorPane = EditorPane;
    class EditorMemento extends lifecycle_1.Disposable {
        static { this.SHARED_EDITOR_STATE = -1; } // pick a number < 0 to be outside group id range
        constructor(id, key, memento, limit, editorGroupService, configurationService) {
            super();
            this.id = id;
            this.key = key;
            this.memento = memento;
            this.limit = limit;
            this.editorGroupService = editorGroupService;
            this.configurationService = configurationService;
            this.cleanedUp = false;
            this.shareEditorState = false;
            this.updateConfiguration(undefined);
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => this.updateConfiguration(e)));
        }
        updateConfiguration(e) {
            if (!e || e.affectsConfiguration(undefined, 'workbench.editor.sharedViewState')) {
                this.shareEditorState = this.configurationService.getValue(undefined, 'workbench.editor.sharedViewState') === true;
            }
        }
        saveEditorState(group, resourceOrEditor, state) {
            const resource = this.doGetResource(resourceOrEditor);
            if (!resource || !group) {
                return; // we are not in a good state to save any state for a resource
            }
            const cache = this.doLoad();
            // Ensure mementos for resource map
            let mementosForResource = cache.get(resource.toString());
            if (!mementosForResource) {
                mementosForResource = Object.create(null);
                cache.set(resource.toString(), mementosForResource);
            }
            // Store state for group
            mementosForResource[group.id] = state;
            // Store state as most recent one based on settings
            if (this.shareEditorState) {
                mementosForResource[EditorMemento.SHARED_EDITOR_STATE] = state;
            }
            // Automatically clear when editor input gets disposed if any
            if ((0, editor_1.isEditorInput)(resourceOrEditor)) {
                this.clearEditorStateOnDispose(resource, resourceOrEditor);
            }
        }
        loadEditorState(group, resourceOrEditor) {
            const resource = this.doGetResource(resourceOrEditor);
            if (!resource || !group) {
                return; // we are not in a good state to load any state for a resource
            }
            const cache = this.doLoad();
            const mementosForResource = cache.get(resource.toString());
            if (mementosForResource) {
                const mementoForResourceAndGroup = mementosForResource[group.id];
                // Return state for group if present
                if (mementoForResourceAndGroup) {
                    return mementoForResourceAndGroup;
                }
                // Return most recent state based on settings otherwise
                if (this.shareEditorState) {
                    return mementosForResource[EditorMemento.SHARED_EDITOR_STATE];
                }
            }
            return undefined;
        }
        clearEditorState(resourceOrEditor, group) {
            if ((0, editor_1.isEditorInput)(resourceOrEditor)) {
                this.editorDisposables?.delete(resourceOrEditor);
            }
            const resource = this.doGetResource(resourceOrEditor);
            if (resource) {
                const cache = this.doLoad();
                // Clear state for group
                if (group) {
                    const mementosForResource = cache.get(resource.toString());
                    if (mementosForResource) {
                        delete mementosForResource[group.id];
                        if ((0, types_1.isEmptyObject)(mementosForResource)) {
                            cache.delete(resource.toString());
                        }
                    }
                }
                // Clear state across all groups for resource
                else {
                    cache.delete(resource.toString());
                }
            }
        }
        clearEditorStateOnDispose(resource, editor) {
            if (!this.editorDisposables) {
                this.editorDisposables = new Map();
            }
            if (!this.editorDisposables.has(editor)) {
                this.editorDisposables.set(editor, event_1.Event.once(editor.onWillDispose)(() => {
                    this.clearEditorState(resource);
                    this.editorDisposables?.delete(editor);
                }));
            }
        }
        moveEditorState(source, target, comparer) {
            const cache = this.doLoad();
            // We need a copy of the keys to not iterate over
            // newly inserted elements.
            const cacheKeys = [...cache.keys()];
            for (const cacheKey of cacheKeys) {
                const resource = uri_1.URI.parse(cacheKey);
                if (!comparer.isEqualOrParent(resource, source)) {
                    continue; // not matching our resource
                }
                // Determine new resulting target resource
                let targetResource;
                if ((0, resources_1.isEqual)(source, resource)) {
                    targetResource = target; // file got moved
                }
                else {
                    const index = (0, extpath_1.indexOfPath)(resource.path, source.path);
                    targetResource = (0, resources_1.joinPath)(target, resource.path.substr(index + source.path.length + 1)); // parent folder got moved
                }
                // Don't modify LRU state
                const value = cache.get(cacheKey, 0 /* Touch.None */);
                if (value) {
                    cache.delete(cacheKey);
                    cache.set(targetResource.toString(), value);
                }
            }
        }
        doGetResource(resourceOrEditor) {
            if ((0, editor_1.isEditorInput)(resourceOrEditor)) {
                return resourceOrEditor.resource;
            }
            return resourceOrEditor;
        }
        doLoad() {
            if (!this.cache) {
                this.cache = new map_1.LRUCache(this.limit);
                // Restore from serialized map state
                const rawEditorMemento = this.memento[this.key];
                if (Array.isArray(rawEditorMemento)) {
                    this.cache.fromJSON(rawEditorMemento);
                }
            }
            return this.cache;
        }
        saveState() {
            const cache = this.doLoad();
            // Cleanup once during session
            if (!this.cleanedUp) {
                this.cleanUp();
                this.cleanedUp = true;
            }
            this.memento[this.key] = cache.toJSON();
        }
        cleanUp() {
            const cache = this.doLoad();
            // Remove groups from states that no longer exist. Since we modify the
            // cache and its is a LRU cache make a copy to ensure iteration succeeds
            const entries = [...cache.entries()];
            for (const [resource, mapGroupToMementos] of entries) {
                for (const group of Object.keys(mapGroupToMementos)) {
                    const groupId = Number(group);
                    if (groupId === EditorMemento.SHARED_EDITOR_STATE && this.shareEditorState) {
                        continue; // skip over shared entries if sharing is enabled
                    }
                    if (!this.editorGroupService.getGroup(groupId)) {
                        delete mapGroupToMementos[groupId];
                        if ((0, types_1.isEmptyObject)(mapGroupToMementos)) {
                            cache.delete(resource);
                        }
                    }
                }
            }
        }
    }
    exports.EditorMemento = EditorMemento;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUGFuZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL2VkaXRvclBhbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBd0JoRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FvQkc7SUFDSCxNQUFzQixVQUFXLFNBQVEscUJBQVM7UUFTakQsWUFBWTtpQkFFWSxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUE4QixBQUF4QyxDQUF5QztRQUVoRixJQUFJLFlBQVksS0FBSyxPQUFPLHNDQUE2QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbEUsSUFBSSxZQUFZLEtBQUssT0FBTyxzQ0FBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLElBQUksYUFBYSxLQUFLLE9BQU8sc0NBQTZCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNwRSxJQUFJLGFBQWEsS0FBSyxPQUFPLHNDQUE2QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFHcEUsSUFBSSxLQUFLLEtBQThCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFHNUQsSUFBSSxPQUFPLEtBQWlDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFHbkUsSUFBSSxLQUFLLEtBQStCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFN0Q7O1dBRUc7UUFDSCxJQUFJLHVCQUF1QixLQUFxQyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFFbkYsWUFDQyxFQUFVLEVBQ1YsZ0JBQW1DLEVBQ25DLFlBQTJCLEVBQzNCLGNBQStCO1lBRS9CLEtBQUssQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBcEMzRCxnQkFB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