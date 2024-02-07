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
define(["require", "exports", "vs/base/common/event", "vs/workbench/common/editor", "vs/workbench/common/editor/editorInput", "vs/workbench/common/editor/sideBySideEditorInput", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/base/common/arrays"], function (require, exports, event_1, editor_1, editorInput_1, sideBySideEditorInput_1, instantiation_1, configuration_1, lifecycle_1, platform_1, arrays_1) {
    "use strict";
    var EditorGroupModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorGroupModel = exports.isGroupEditorCloseEvent = exports.isGroupEditorMoveEvent = exports.isGroupEditorOpenEvent = exports.isGroupEditorChangeEvent = exports.isSerializedEditorGroupModel = void 0;
    const EditorOpenPositioning = {
        LEFT: 'left',
        RIGHT: 'right',
        FIRST: 'first',
        LAST: 'last'
    };
    function isSerializedEditorGroupModel(group) {
        const candidate = group;
        return !!(candidate && typeof candidate === 'object' && Array.isArray(candidate.editors) && Array.isArray(candidate.mru));
    }
    exports.isSerializedEditorGroupModel = isSerializedEditorGroupModel;
    function isGroupEditorChangeEvent(e) {
        const candidate = e;
        return candidate.editor && candidate.editorIndex !== undefined;
    }
    exports.isGroupEditorChangeEvent = isGroupEditorChangeEvent;
    function isGroupEditorOpenEvent(e) {
        const candidate = e;
        return candidate.kind === 4 /* GroupModelChangeKind.EDITOR_OPEN */ && candidate.editorIndex !== undefined;
    }
    exports.isGroupEditorOpenEvent = isGroupEditorOpenEvent;
    function isGroupEditorMoveEvent(e) {
        const candidate = e;
        return candidate.kind === 6 /* GroupModelChangeKind.EDITOR_MOVE */ && candidate.editorIndex !== undefined && candidate.oldEditorIndex !== undefined;
    }
    exports.isGroupEditorMoveEvent = isGroupEditorMoveEvent;
    function isGroupEditorCloseEvent(e) {
        const candidate = e;
        return candidate.kind === 5 /* GroupModelChangeKind.EDITOR_CLOSE */ && candidate.editorIndex !== undefined && candidate.context !== undefined && candidate.sticky !== undefined;
    }
    exports.isGroupEditorCloseEvent = isGroupEditorCloseEvent;
    let EditorGroupModel = class EditorGroupModel extends lifecycle_1.Disposable {
        static { EditorGroupModel_1 = this; }
        static { this.IDS = 0; }
        get id() { return this._id; }
        constructor(labelOrSerializedGroup, instantiationService, configurationService) {
            super();
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            //#region events
            this._onDidModelChange = this._register(new event_1.Emitter());
            this.onDidModelChange = this._onDidModelChange.event;
            this.editors = [];
            this.mru = [];
            this.editorListeners = new Set();
            this.locked = false;
            this.preview = null; // editor in preview state
            this.active = null; // editor in active state
            this.sticky = -1; // index of first editor in sticky state
            if (isSerializedEditorGroupModel(labelOrSerializedGroup)) {
                this._id = this.deserialize(labelOrSerializedGroup);
            }
            else {
                this._id = EditorGroupModel_1.IDS++;
            }
            this.onConfigurationUpdated();
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
        }
        onConfigurationUpdated(e) {
            if (e && !e.affectsConfiguration('workbench.editor.openPositioning') && !e.affectsConfiguration('workbench.editor.focusRecentEditorAfterClose')) {
                return;
            }
            this.editorOpenPositioning = this.configurationService.getValue('workbench.editor.openPositioning');
            this.focusRecentEditorAfterClose = this.configurationService.getValue('workbench.editor.focusRecentEditorAfterClose');
        }
        get count() {
            return this.editors.length;
        }
        get stickyCount() {
            return this.sticky + 1;
        }
        getEditors(order, options) {
            const editors = order === 0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */ ? this.mru.slice(0) : this.editors.slice(0);
            if (options?.excludeSticky) {
                // MRU: need to check for index on each
                if (order === 0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */) {
                    return editors.filter(editor => !this.isSticky(editor));
                }
                // Sequential: simply start after sticky index
                return editors.slice(this.sticky + 1);
            }
            return editors;
        }
        getEditorByIndex(index) {
            return this.editors[index];
        }
        get activeEditor() {
            return this.active;
        }
        isActive(editor) {
            return this.matches(this.active, editor);
        }
        get previewEditor() {
            return this.preview;
        }
        openEditor(candidate, options) {
            const makeSticky = options?.sticky || (typeof options?.index === 'number' && this.isSticky(options.index));
            const makePinned = options?.pinned || options?.sticky;
            const makeActive = options?.active || !this.activeEditor || (!makePinned && this.matches(this.preview, this.activeEditor));
            const existingEditorAndIndex = this.findEditor(candidate, options);
            // New editor
            if (!existingEditorAndIndex) {
                const newEditor = candidate;
                const indexOfActive = this.indexOf(this.active);
                // Insert into specific position
                let targetIndex;
                if (options && typeof options.index === 'number') {
                    targetIndex = options.index;
                }
                // Insert to the BEGINNING
                else if (this.editorOpenPositioning === EditorOpenPositioning.FIRST) {
                    targetIndex = 0;
                    // Always make sure targetIndex is after sticky editors
                    // unless we are explicitly told to make the editor sticky
                    if (!makeSticky && this.isSticky(targetIndex)) {
                        targetIndex = this.sticky + 1;
                    }
                }
                // Insert to the END
                else if (this.editorOpenPositioning === EditorOpenPositioning.LAST) {
                    targetIndex = this.editors.length;
                }
                // Insert to LEFT or RIGHT of active editor
                else {
                    // Insert to the LEFT of active editor
                    if (this.editorOpenPositioning === EditorOpenPositioning.LEFT) {
                        if (indexOfActive === 0 || !this.editors.length) {
                            targetIndex = 0; // to the left becoming first editor in list
                        }
                        else {
                            targetIndex = indexOfActive; // to the left of active editor
                        }
                    }
                    // Insert to the RIGHT of active editor
                    else {
                        targetIndex = indexOfActive + 1;
                    }
                    // Always make sure targetIndex is after sticky editors
                    // unless we are explicitly told to make the editor sticky
                    if (!makeSticky && this.isSticky(targetIndex)) {
                        targetIndex = this.sticky + 1;
                    }
                }
                // If the editor becomes sticky, increment the sticky index and adjust
                // the targetIndex to be at the end of sticky editors unless already.
                if (makeSticky) {
                    this.sticky++;
                    if (!this.isSticky(targetIndex)) {
                        targetIndex = this.sticky;
                    }
                }
                // Insert into our list of editors if pinned or we have no preview editor
                if (makePinned || !this.preview) {
                    this.splice(targetIndex, false, newEditor);
                }
                // Handle preview
                if (!makePinned) {
                    // Replace existing preview with this editor if we have a preview
                    if (this.preview) {
                        const indexOfPreview = this.indexOf(this.preview);
                        if (targetIndex > indexOfPreview) {
                            targetIndex--; // accomodate for the fact that the preview editor closes
                        }
                        this.replaceEditor(this.preview, newEditor, targetIndex, !makeActive);
                    }
                    this.preview = newEditor;
                }
                // Listeners
                this.registerEditorListeners(newEditor);
                // Event
                const event = {
                    kind: 4 /* GroupModelChangeKind.EDITOR_OPEN */,
                    editor: newEditor,
                    editorIndex: targetIndex
                };
                this._onDidModelChange.fire(event);
                // Handle active
                if (makeActive) {
                    this.doSetActive(newEditor, targetIndex);
                }
                return {
                    editor: newEditor,
                    isNew: true
                };
            }
            // Existing editor
            else {
                const [existingEditor, existingEditorIndex] = existingEditorAndIndex;
                // Pin it
                if (makePinned) {
                    this.doPin(existingEditor, existingEditorIndex);
                }
                // Activate it
                if (makeActive) {
                    this.doSetActive(existingEditor, existingEditorIndex);
                }
                // Respect index
                if (options && typeof options.index === 'number') {
                    this.moveEditor(existingEditor, options.index);
                }
                // Stick it (intentionally after the moveEditor call in case
                // the editor was already moved into the sticky range)
                if (makeSticky) {
                    this.doStick(existingEditor, this.indexOf(existingEditor));
                }
                return {
                    editor: existingEditor,
                    isNew: false
                };
            }
        }
        registerEditorListeners(editor) {
            const listeners = new lifecycle_1.DisposableStore();
            this.editorListeners.add(listeners);
            // Re-emit disposal of editor input as our own event
            listeners.add(event_1.Event.once(editor.onWillDispose)(() => {
                const editorIndex = this.editors.indexOf(editor);
                if (editorIndex >= 0) {
                    const event = {
                        kind: 13 /* GroupModelChangeKind.EDITOR_WILL_DISPOSE */,
                        editor,
                        editorIndex
                    };
                    this._onDidModelChange.fire(event);
                }
            }));
            // Re-Emit dirty state changes
            listeners.add(editor.onDidChangeDirty(() => {
                const event = {
                    kind: 12 /* GroupModelChangeKind.EDITOR_DIRTY */,
                    editor,
                    editorIndex: this.editors.indexOf(editor)
                };
                this._onDidModelChange.fire(event);
            }));
            // Re-Emit label changes
            listeners.add(editor.onDidChangeLabel(() => {
                const event = {
                    kind: 8 /* GroupModelChangeKind.EDITOR_LABEL */,
                    editor,
                    editorIndex: this.editors.indexOf(editor)
                };
                this._onDidModelChange.fire(event);
            }));
            // Re-Emit capability changes
            listeners.add(editor.onDidChangeCapabilities(() => {
                const event = {
                    kind: 9 /* GroupModelChangeKind.EDITOR_CAPABILITIES */,
                    editor,
                    editorIndex: this.editors.indexOf(editor)
                };
                this._onDidModelChange.fire(event);
            }));
            // Clean up dispose listeners once the editor gets closed
            listeners.add(this.onDidModelChange(event => {
                if (event.kind === 5 /* GroupModelChangeKind.EDITOR_CLOSE */ && event.editor?.matches(editor)) {
                    (0, lifecycle_1.dispose)(listeners);
                    this.editorListeners.delete(listeners);
                }
            }));
        }
        replaceEditor(toReplace, replaceWith, replaceIndex, openNext = true) {
            const closeResult = this.doCloseEditor(toReplace, editor_1.EditorCloseContext.REPLACE, openNext); // optimization to prevent multiple setActive() in one call
            // We want to first add the new editor into our model before emitting the close event because
            // firing the close event can trigger a dispose on the same editor that is now being added.
            // This can lead into opening a disposed editor which is not what we want.
            this.splice(replaceIndex, false, replaceWith);
            if (closeResult) {
                const event = {
                    kind: 5 /* GroupModelChangeKind.EDITOR_CLOSE */,
                    ...closeResult
                };
                this._onDidModelChange.fire(event);
            }
        }
        closeEditor(candidate, context = editor_1.EditorCloseContext.UNKNOWN, openNext = true) {
            const closeResult = this.doCloseEditor(candidate, context, openNext);
            if (closeResult) {
                const event = {
                    kind: 5 /* GroupModelChangeKind.EDITOR_CLOSE */,
                    ...closeResult
                };
                this._onDidModelChange.fire(event);
                return closeResult;
            }
            return undefined;
        }
        doCloseEditor(candidate, context, openNext) {
            const index = this.indexOf(candidate);
            if (index === -1) {
                return undefined; // not found
            }
            const editor = this.editors[index];
            const sticky = this.isSticky(index);
            // Active Editor closed
            if (openNext && this.matches(this.active, editor)) {
                // More than one editor
                if (this.mru.length > 1) {
                    let newActive;
                    if (this.focusRecentEditorAfterClose) {
                        newActive = this.mru[1]; // active editor is always first in MRU, so pick second editor after as new active
                    }
                    else {
                        if (index === this.editors.length - 1) {
                            newActive = this.editors[index - 1]; // last editor is closed, pick previous as new active
                        }
                        else {
                            newActive = this.editors[index + 1]; // pick next editor as new active
                        }
                    }
                    this.doSetActive(newActive, this.editors.indexOf(newActive));
                }
                // One Editor
                else {
                    this.active = null;
                }
            }
            // Preview Editor closed
            if (this.matches(this.preview, editor)) {
                this.preview = null;
            }
            // Remove from arrays
            this.splice(index, true);
            // Event
            return { editor, sticky, editorIndex: index, context };
        }
        moveEditor(candidate, toIndex) {
            // Ensure toIndex is in bounds of our model
            if (toIndex >= this.editors.length) {
                toIndex = this.editors.length - 1;
            }
            else if (toIndex < 0) {
                toIndex = 0;
            }
            const index = this.indexOf(candidate);
            if (index < 0 || toIndex === index) {
                return;
            }
            const editor = this.editors[index];
            const sticky = this.sticky;
            // Adjust sticky index: editor moved out of sticky state into unsticky state
            if (this.isSticky(index) && toIndex > this.sticky) {
                this.sticky--;
            }
            // ...or editor moved into sticky state from unsticky state
            else if (!this.isSticky(index) && toIndex <= this.sticky) {
                this.sticky++;
            }
            // Move
            this.editors.splice(index, 1);
            this.editors.splice(toIndex, 0, editor);
            // Move Event
            const event = {
                kind: 6 /* GroupModelChangeKind.EDITOR_MOVE */,
                editor,
                oldEditorIndex: index,
                editorIndex: toIndex
            };
            this._onDidModelChange.fire(event);
            // Sticky Event (if sticky changed as part of the move)
            if (sticky !== this.sticky) {
                const event = {
                    kind: 11 /* GroupModelChangeKind.EDITOR_STICKY */,
                    editor,
                    editorIndex: toIndex
                };
                this._onDidModelChange.fire(event);
            }
            return editor;
        }
        setActive(candidate) {
            let result = undefined;
            if (!candidate) {
                this.setGroupActive();
            }
            else {
                result = this.setEditorActive(candidate);
            }
            return result;
        }
        setGroupActive() {
            // We do not really keep the `active` state in our model because
            // it has no special meaning to us here. But for consistency
            // we emit a `onDidModelChange` event so that components can
            // react.
            this._onDidModelChange.fire({ kind: 0 /* GroupModelChangeKind.GROUP_ACTIVE */ });
        }
        setEditorActive(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.doSetActive(editor, editorIndex);
            return editor;
        }
        doSetActive(editor, editorIndex) {
            if (this.matches(this.active, editor)) {
                return; // already active
            }
            this.active = editor;
            // Bring to front in MRU list
            const mruIndex = this.indexOf(editor, this.mru);
            this.mru.splice(mruIndex, 1);
            this.mru.unshift(editor);
            // Event
            const event = {
                kind: 7 /* GroupModelChangeKind.EDITOR_ACTIVE */,
                editor,
                editorIndex
            };
            this._onDidModelChange.fire(event);
        }
        setIndex(index) {
            // We do not really keep the `index` in our model because
            // it has no special meaning to us here. But for consistency
            // we emit a `onDidModelChange` event so that components can
            // react.
            this._onDidModelChange.fire({ kind: 1 /* GroupModelChangeKind.GROUP_INDEX */ });
        }
        setLabel(label) {
            // We do not really keep the `label` in our model because
            // it has no special meaning to us here. But for consistency
            // we emit a `onDidModelChange` event so that components can
            // react.
            this._onDidModelChange.fire({ kind: 2 /* GroupModelChangeKind.GROUP_LABEL */ });
        }
        pin(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.doPin(editor, editorIndex);
            return editor;
        }
        doPin(editor, editorIndex) {
            if (this.isPinned(editor)) {
                return; // can only pin a preview editor
            }
            // Convert the preview editor to be a pinned editor
            this.preview = null;
            // Event
            const event = {
                kind: 10 /* GroupModelChangeKind.EDITOR_PIN */,
                editor,
                editorIndex
            };
            this._onDidModelChange.fire(event);
        }
        unpin(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.doUnpin(editor, editorIndex);
            return editor;
        }
        doUnpin(editor, editorIndex) {
            if (!this.isPinned(editor)) {
                return; // can only unpin a pinned editor
            }
            // Set new
            const oldPreview = this.preview;
            this.preview = editor;
            // Event
            const event = {
                kind: 10 /* GroupModelChangeKind.EDITOR_PIN */,
                editor,
                editorIndex
            };
            this._onDidModelChange.fire(event);
            // Close old preview editor if any
            if (oldPreview) {
                this.closeEditor(oldPreview, editor_1.EditorCloseContext.UNPIN);
            }
        }
        isPinned(editorOrIndex) {
            let editor;
            if (typeof editorOrIndex === 'number') {
                editor = this.editors[editorOrIndex];
            }
            else {
                editor = editorOrIndex;
            }
            return !this.matches(this.preview, editor);
        }
        stick(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.doStick(editor, editorIndex);
            return editor;
        }
        doStick(editor, editorIndex) {
            if (this.isSticky(editorIndex)) {
                return; // can only stick a non-sticky editor
            }
            // Pin editor
            this.pin(editor);
            // Move editor to be the last sticky editor
            const newEditorIndex = this.sticky + 1;
            this.moveEditor(editor, newEditorIndex);
            // Adjust sticky index
            this.sticky++;
            // Event
            const event = {
                kind: 11 /* GroupModelChangeKind.EDITOR_STICKY */,
                editor,
                editorIndex: newEditorIndex
            };
            this._onDidModelChange.fire(event);
        }
        unstick(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.doUnstick(editor, editorIndex);
            return editor;
        }
        doUnstick(editor, editorIndex) {
            if (!this.isSticky(editorIndex)) {
                return; // can only unstick a sticky editor
            }
            // Move editor to be the first non-sticky editor
            const newEditorIndex = this.sticky;
            this.moveEditor(editor, newEditorIndex);
            // Adjust sticky index
            this.sticky--;
            // Event
            const event = {
                kind: 11 /* GroupModelChangeKind.EDITOR_STICKY */,
                editor,
                editorIndex: newEditorIndex
            };
            this._onDidModelChange.fire(event);
        }
        isSticky(candidateOrIndex) {
            if (this.sticky < 0) {
                return false; // no sticky editor
            }
            let index;
            if (typeof candidateOrIndex === 'number') {
                index = candidateOrIndex;
            }
            else {
                index = this.indexOf(candidateOrIndex);
            }
            if (index < 0) {
                return false;
            }
            return index <= this.sticky;
        }
        splice(index, del, editor) {
            const editorToDeleteOrReplace = this.editors[index];
            // Perform on sticky index
            if (del && this.isSticky(index)) {
                this.sticky--;
            }
            // Perform on editors array
            if (editor) {
                this.editors.splice(index, del ? 1 : 0, editor);
            }
            else {
                this.editors.splice(index, del ? 1 : 0);
            }
            // Perform on MRU
            {
                // Add
                if (!del && editor) {
                    if (this.mru.length === 0) {
                        // the list of most recent editors is empty
                        // so this editor can only be the most recent
                        this.mru.push(editor);
                    }
                    else {
                        // we have most recent editors. as such we
                        // put this newly opened editor right after
                        // the current most recent one because it cannot
                        // be the most recently active one unless
                        // it becomes active. but it is still more
                        // active then any other editor in the list.
                        this.mru.splice(1, 0, editor);
                    }
                }
                // Remove / Replace
                else {
                    const indexInMRU = this.indexOf(editorToDeleteOrReplace, this.mru);
                    // Remove
                    if (del && !editor) {
                        this.mru.splice(indexInMRU, 1); // remove from MRU
                    }
                    // Replace
                    else if (del && editor) {
                        this.mru.splice(indexInMRU, 1, editor); // replace MRU at location
                    }
                }
            }
        }
        indexOf(candidate, editors = this.editors, options) {
            let index = -1;
            if (!candidate) {
                return index;
            }
            for (let i = 0; i < editors.length; i++) {
                const editor = editors[i];
                if (this.matches(editor, candidate, options)) {
                    // If we are to support side by side matching, it is possible that
                    // a better direct match is found later. As such, we continue finding
                    // a matching editor and prefer that match over the side by side one.
                    if (options?.supportSideBySide && editor instanceof sideBySideEditorInput_1.SideBySideEditorInput && !(candidate instanceof sideBySideEditorInput_1.SideBySideEditorInput)) {
                        index = i;
                    }
                    else {
                        index = i;
                        break;
                    }
                }
            }
            return index;
        }
        findEditor(candidate, options) {
            const index = this.indexOf(candidate, this.editors, options);
            if (index === -1) {
                return undefined;
            }
            return [this.editors[index], index];
        }
        isFirst(candidate, editors = this.editors) {
            return this.matches(editors[0], candidate);
        }
        isLast(candidate, editors = this.editors) {
            return this.matches(editors[editors.length - 1], candidate);
        }
        contains(candidate, options) {
            return this.indexOf(candidate, this.editors, options) !== -1;
        }
        matches(editor, candidate, options) {
            if (!editor || !candidate) {
                return false;
            }
            if (options?.supportSideBySide && editor instanceof sideBySideEditorInput_1.SideBySideEditorInput && !(candidate instanceof sideBySideEditorInput_1.SideBySideEditorInput)) {
                switch (options.supportSideBySide) {
                    case editor_1.SideBySideEditor.ANY:
                        if (this.matches(editor.primary, candidate, options) || this.matches(editor.secondary, candidate, options)) {
                            return true;
                        }
                        break;
                    case editor_1.SideBySideEditor.BOTH:
                        if (this.matches(editor.primary, candidate, options) && this.matches(editor.secondary, candidate, options)) {
                            return true;
                        }
                        break;
                }
            }
            const strictEquals = editor === candidate;
            if (options?.strictEquals) {
                return strictEquals;
            }
            return strictEquals || editor.matches(candidate);
        }
        get isLocked() {
            return this.locked;
        }
        lock(locked) {
            if (this.isLocked !== locked) {
                this.locked = locked;
                this._onDidModelChange.fire({ kind: 3 /* GroupModelChangeKind.GROUP_LOCKED */ });
            }
        }
        clone() {
            const clone = this.instantiationService.createInstance(EditorGroupModel_1, undefined);
            // Copy over group properties
            clone.editors = this.editors.slice(0);
            clone.mru = this.mru.slice(0);
            clone.preview = this.preview;
            clone.active = this.active;
            clone.sticky = this.sticky;
            // Ensure to register listeners for each editor
            for (const editor of clone.editors) {
                clone.registerEditorListeners(editor);
            }
            return clone;
        }
        serialize() {
            const registry = platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory);
            // Serialize all editor inputs so that we can store them.
            // Editors that cannot be serialized need to be ignored
            // from mru, active, preview and sticky if any.
            const serializableEditors = [];
            const serializedEditors = [];
            let serializablePreviewIndex;
            let serializableSticky = this.sticky;
            for (let i = 0; i < this.editors.length; i++) {
                const editor = this.editors[i];
                let canSerializeEditor = false;
                const editorSerializer = registry.getEditorSerializer(editor);
                if (editorSerializer) {
                    const value = editorSerializer.serialize(editor);
                    // Editor can be serialized
                    if (typeof value === 'string') {
                        canSerializeEditor = true;
                        serializedEditors.push({ id: editor.typeId, value });
                        serializableEditors.push(editor);
                        if (this.preview === editor) {
                            serializablePreviewIndex = serializableEditors.length - 1;
                        }
                    }
                    // Editor cannot be serialized
                    else {
                        canSerializeEditor = false;
                    }
                }
                // Adjust index of sticky editors if the editor cannot be serialized and is pinned
                if (!canSerializeEditor && this.isSticky(i)) {
                    serializableSticky--;
                }
            }
            const serializableMru = this.mru.map(editor => this.indexOf(editor, serializableEditors)).filter(i => i >= 0);
            return {
                id: this.id,
                locked: this.locked ? true : undefined,
                editors: serializedEditors,
                mru: serializableMru,
                preview: serializablePreviewIndex,
                sticky: serializableSticky >= 0 ? serializableSticky : undefined
            };
        }
        deserialize(data) {
            const registry = platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory);
            if (typeof data.id === 'number') {
                this._id = data.id;
                EditorGroupModel_1.IDS = Math.max(data.id + 1, EditorGroupModel_1.IDS); // make sure our ID generator is always larger
            }
            else {
                this._id = EditorGroupModel_1.IDS++; // backwards compatibility
            }
            if (data.locked) {
                this.locked = true;
            }
            this.editors = (0, arrays_1.coalesce)(data.editors.map((e, index) => {
                let editor = undefined;
                const editorSerializer = registry.getEditorSerializer(e.id);
                if (editorSerializer) {
                    const deserializedEditor = editorSerializer.deserialize(this.instantiationService, e.value);
                    if (deserializedEditor instanceof editorInput_1.EditorInput) {
                        editor = deserializedEditor;
                        this.registerEditorListeners(editor);
                    }
                }
                if (!editor && typeof data.sticky === 'number' && index <= data.sticky) {
                    data.sticky--; // if editor cannot be deserialized but was sticky, we need to decrease sticky index
                }
                return editor;
            }));
            this.mru = (0, arrays_1.coalesce)(data.mru.map(i => this.editors[i]));
            this.active = this.mru[0];
            if (typeof data.preview === 'number') {
                this.preview = this.editors[data.preview];
            }
            if (typeof data.sticky === 'number') {
                this.sticky = data.sticky;
            }
            return this._id;
        }
        dispose() {
            (0, lifecycle_1.dispose)(Array.from(this.editorListeners));
            this.editorListeners.clear();
            super.dispose();
        }
    };
    exports.EditorGroupModel = EditorGroupModel;
    exports.EditorGroupModel = EditorGroupModel = EditorGroupModel_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService)
    ], EditorGroupModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yR3JvdXBNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9lZGl0b3IvZWRpdG9yR3JvdXBNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBWWhHLE1BQU0scUJBQXFCLEdBQUc7UUFDN0IsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsT0FBTztRQUNkLEtBQUssRUFBRSxPQUFPO1FBQ2QsSUFBSSxFQUFFLE1BQU07S0FDWixDQUFDO0lBNkJGLFNBQWdCLDRCQUE0QixDQUFDLEtBQWU7UUFDM0QsTUFBTSxTQUFTLEdBQUcsS0FBZ0QsQ0FBQztRQUVuRSxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzSCxDQUFDO0lBSkQsb0VBSUM7SUE2Q0QsU0FBZ0Isd0JBQXdCLENBQUMsQ0FBeUI7UUFDakUsTUFBTSxTQUFTLEdBQUcsQ0FBMEIsQ0FBQztRQUU3QyxPQUFPLFNBQVMsQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUM7SUFDaEUsQ0FBQztJQUpELDREQUlDO0lBT0QsU0FBZ0Isc0JBQXNCLENBQUMsQ0FBeUI7UUFDL0QsTUFBTSxTQUFTLEdBQUcsQ0FBMEIsQ0FBQztRQUU3QyxPQUFPLFNBQVMsQ0FBQyxJQUFJLDZDQUFxQyxJQUFJLFNBQVMsQ0FBQyxXQUFXLEtBQUssU0FBUyxDQUFDO0lBQ25HLENBQUM7SUFKRCx3REFJQztJQWNELFNBQWdCLHNCQUFzQixDQUFDLENBQXlCO1FBQy9ELE1BQU0s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