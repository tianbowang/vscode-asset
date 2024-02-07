(function anonymous() { /*---------------------------------------------------------------------------------------------
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
define(["require", "exports", "vs/base/common/assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostDocumentData", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTextEditor", "vs/workbench/api/common/extHostTypeConverters", "vs/platform/log/common/log", "vs/base/common/map", "vs/base/common/network", "vs/base/common/iterator", "vs/base/common/lazy"], function (require, exports, assert, event_1, lifecycle_1, uri_1, instantiation_1, extHost_protocol_1, extHostDocumentData_1, extHostRpcService_1, extHostTextEditor_1, typeConverters, log_1, map_1, network_1, iterator_1, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostDocumentsAndEditors = exports.ExtHostDocumentsAndEditors = void 0;
    class Reference {
        constructor(value) {
            this.value = value;
            this._count = 0;
        }
        ref() {
            this._count++;
        }
        unref() {
            return --this._count === 0;
        }
    }
    let ExtHostDocumentsAndEditors = class ExtHostDocumentsAndEditors {
        constructor(_extHostRpc, _logService) {
            this._extHostRpc = _extHostRpc;
            this._logService = _logService;
            this._activeEditorId = null;
            this._editors = new Map();
            this._documents = new map_1.ResourceMap();
            this._onDidAddDocuments = new event_1.Emitter();
            this._onDidRemoveDocuments = new event_1.Emitter();
            this._onDidChangeVisibleTextEditors = new event_1.Emitter();
            this._onDidChangeActiveTextEditor = new event_1.Emitter();
            this.onDidAddDocuments = this._onDidAddDocuments.event;
            this.onDidRemoveDocuments = this._onDidRemoveDocuments.event;
            this.onDidChangeVisibleTextEditors = this._onDidChangeVisibleTextEditors.event;
            this.onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
        }
        $acceptDocumentsAndEditorsDelta(delta) {
            this.acceptDocumentsAndEditorsDelta(delta);
        }
        acceptDocumentsAndEditorsDelta(delta) {
            const removedDocuments = [];
            const addedDocuments = [];
            const removedEditors = [];
            if (delta.removedDocuments) {
                for (const uriComponent of delta.removedDocuments) {
                    const uri = uri_1.URI.revive(uriComponent);
                    const data = this._documents.get(uri);
                    if (data?.unref()) {
                        this._documents.delete(uri);
                        removedDocuments.push(data.value);
                    }
                }
            }
            if (delta.addedDocuments) {
                for (const data of delta.addedDocuments) {
                    const resource = uri_1.URI.revive(data.uri);
                    let ref = this._documents.get(resource);
                    // double check -> only notebook cell documents should be
                    // referenced/opened more than once...
                    if (ref) {
                        if (resource.scheme !== network_1.Schemas.vscodeNotebookCell && resource.scheme !== network_1.Schemas.vscodeInteractiveInput) {
                            throw new Error(`document '${resource} already exists!'`);
                        }
                    }
                    if (!ref) {
                        ref = new Reference(new extHostDocumentData_1.ExtHostDocumentData(this._extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadDocuments), resource, data.lines, data.EOL, data.versionId, data.languageId, data.isDirty, data.notebook));
                        this._documents.set(resource, ref);
                        addedDocuments.push(ref.value);
                    }
                    ref.ref();
                }
            }
            if (delta.removedEditors) {
                for (const id of delta.removedEditors) {
                    const editor = this._editors.get(id);
                    this._editors.delete(id);
                    if (editor) {
                        removedEditors.push(editor);
                    }
                }
            }
            if (delta.addedEditors) {
                for (const data of delta.addedEditors) {
                    const resource = uri_1.URI.revive(data.documentUri);
                    assert.ok(this._documents.has(resource), `document '${resource}' does not exist`);
                    assert.ok(!this._editors.has(data.id), `editor '${data.id}' already exists!`);
                    const documentData = this._documents.get(resource).value;
                    const editor = new extHostTextEditor_1.ExtHostTextEditor(data.id, this._extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadTextEditors), this._logService, new lazy_1.Lazy(() => documentData.document), data.selections.map(typeConverters.Selection.to), data.options, data.visibleRanges.map(range => typeConverters.Range.to(range)), typeof data.editorPosition === 'number' ? typeConverters.ViewColumn.to(data.editorPosition) : undefined);
                    this._editors.set(data.id, editor);
                }
            }
            if (delta.newActiveEditor !== undefined) {
                assert.ok(delta.newActiveEditor === null || this._editors.has(delta.newActiveEditor), `active editor '${delta.newActiveEditor}' does not exist`);
                this._activeEditorId = delta.newActiveEditor;
            }
            (0, lifecycle_1.dispose)(removedDocuments);
            (0, lifecycle_1.dispose)(removedEditors);
            // now that the internal state is complete, fire events
            if (delta.removedDocuments) {
                this._onDidRemoveDocuments.fire(removedDocuments);
            }
            if (delta.addedDocuments) {
                this._onDidAddDocuments.fire(addedDocuments);
            }
            if (delta.removedEditors || delta.addedEditors) {
                this._onDidChangeVisibleTextEditors.fire(this.allEditors().map(editor => editor.value));
            }
            if (delta.newActiveEditor !== undefined) {
                this._onDidChangeActiveTextEditor.fire(this.activeEditor());
            }
        }
        getDocument(uri) {
            return this._documents.get(uri)?.value;
        }
        allDocuments() {
            return iterator_1.Iterable.map(this._documents.values(), ref => ref.value);
        }
        getEditor(id) {
            return this._editors.get(id);
        }
        activeEditor(internal) {
            if (!this._activeEditorId) {
                return undefined;
            }
            const editor = this._editors.get(this._activeEditorId);
            if (internal) {
                return editor;
            }
            else {
                return editor?.value;
            }
        }
        allEditors() {
            return [...this._editors.values()];
        }
    };
    exports.ExtHostDocumentsAndEditors = ExtHostDocumentsAndEditors;
    exports.ExtHostDocumentsAndEditors = ExtHostDocumentsAndEditors = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, log_1.ILogService)
    ], ExtHostDocumentsAndEditors);
    exports.IExtHostDocumentsAndEditors = (0, instantiation_1.createDecorator)('IExtHostDocumentsAndEditors');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERvY3VtZW50c0FuZEVkaXRvcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3REb2N1bWVudHNBbmRFZGl0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1CaEcsTUFBTSxTQUFTO1FBRWQsWUFBcUIsS0FBUTtZQUFSLFVBQUssR0FBTCxLQUFLLENBQUc7WUFEckIsV0FBTSxHQUFHLENBQUMsQ0FBQztRQUNjLENBQUM7UUFDbEMsR0FBRztZQUNGLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFDRCxLQUFLO1lBQ0osT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQzVCLENBQUM7S0FDRDtJQVVNLElBQU0sMEJBQTBCLEdBQWhDLE1BQU0sMEJBQTBCO1FBbUJ0QyxZQUNxQixXQUFnRCxFQUN2RCxXQUF5QztZQURqQixnQkFBVyxHQUFYLFdBQVcsQ0FBb0I7WUFDdEMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFqQi9DLG9CQUFlLEdBQWtCLElBQUksQ0FBQztZQUU3QixhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQTZCLENBQUM7WUFDaEQsZUFBVSxHQUFHLElBQUksaUJBQVcsRUFBa0MsQ0FBQztZQUUvRCx1QkFBa0IsR0FBRyxJQUFJLGVBQU8sRUFBa0MsQ0FBQztZQUNuRSwwQkFBcUIsR0FBRyxJQUFJLGVBQU8sRUFBa0MsQ0FBQztZQUN0RSxtQ0FBOEIsR0FBRyxJQUFJLGVBQU8sRUFBZ0MsQ0FBQztZQUM3RSxpQ0FBNEIsR0FBRyxJQUFJLGVBQU8sRUFBaUMsQ0FBQztZQUVwRixzQkFBaUIsR0FBMEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztZQUN6Rix5QkFBb0IsR0FBMEMsSUFBSSxD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
//# sourceURL=../../../vs/workbench/api/common/extHostDocumentsAndEditors.js
})