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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/dataTransfer", "vs/base/common/lifecycle", "vs/editor/browser/dnd", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/treeViewsDnd", "vs/editor/common/services/treeViewsDndService", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/contrib/inlineProgress/browser/inlineProgress", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dnd/browser/dnd", "vs/platform/instantiation/common/instantiation", "./edit", "./postEditWidget"], function (require, exports, arrays_1, async_1, dataTransfer_1, lifecycle_1, dnd_1, range_1, languageFeatures_1, treeViewsDnd_1, treeViewsDndService_1, editorState_1, inlineProgress_1, nls_1, configuration_1, contextkey_1, dnd_2, instantiation_1, edit_1, postEditWidget_1) {
    "use strict";
    var DropIntoEditorController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DropIntoEditorController = exports.dropWidgetVisibleCtx = exports.changeDropTypeCommandId = exports.defaultProviderConfig = void 0;
    exports.defaultProviderConfig = 'editor.experimental.dropIntoEditor.defaultProvider';
    exports.changeDropTypeCommandId = 'editor.changeDropType';
    exports.dropWidgetVisibleCtx = new contextkey_1.RawContextKey('dropWidgetVisible', false, (0, nls_1.localize)('dropWidgetVisible', "Whether the drop widget is showing"));
    let DropIntoEditorController = class DropIntoEditorController extends lifecycle_1.Disposable {
        static { DropIntoEditorController_1 = this; }
        static { this.ID = 'editor.contrib.dropIntoEditorController'; }
        static get(editor) {
            return editor.getContribution(DropIntoEditorController_1.ID);
        }
        constructor(editor, instantiationService, _configService, _languageFeaturesService, _treeViewsDragAndDropService) {
            super();
            this._configService = _configService;
            this._languageFeaturesService = _languageFeaturesService;
            this._treeViewsDragAndDropService = _treeViewsDragAndDropService;
            this.treeItemsTransfer = dnd_2.LocalSelectionTransfer.getInstance();
            this._dropProgressManager = this._register(instantiationService.createInstance(inlineProgress_1.InlineProgressManager, 'dropIntoEditor', editor));
            this._postDropWidgetManager = this._register(instantiationService.createInstance(postEditWidget_1.PostEditWidgetManager, 'dropIntoEditor', editor, exports.dropWidgetVisibleCtx, { id: exports.changeDropTypeCommandId, label: (0, nls_1.localize)('postDropWidgetTitle', "Show drop options...") }));
            this._register(editor.onDropIntoEditor(e => this.onDropIntoEditor(editor, e.position, e.event)));
        }
        clearWidgets() {
            this._postDropWidgetManager.clear();
        }
        changeDropType() {
            this._postDropWidgetManager.tryShowSelector();
        }
        async onDropIntoEditor(editor, position, dragEvent) {
            if (!dragEvent.dataTransfer || !editor.hasModel()) {
                return;
            }
            this._currentOperation?.cancel();
            editor.focus();
            editor.setPosition(position);
            const p = (0, async_1.createCancelablePromise)(async (token) => {
                const tokenSource = new editorState_1.EditorStateCancellationTokenSource(editor, 1 /* CodeEditorStateFlag.Value */, undefined, token);
                try {
                    const ourDataTransfer = await this.extractDataTransferData(dragEvent);
                    if (ourDataTransfer.size === 0 || tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    const model = editor.getModel();
                    if (!model) {
                        return;
                    }
                    const providers = this._languageFeaturesService.documentOnDropEditProvider
                        .ordered(model)
                        .filter(provider => {
                        if (!provider.dropMimeTypes) {
                            // Keep all providers that don't specify mime types
                            return true;
                        }
                        return provider.dropMimeTypes.some(mime => ourDataTransfer.matches(mime));
                    });
                    const edits = await this.getDropEdits(providers, model, position, ourDataTransfer, tokenSource);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    if (edits.length) {
                        const activeEditIndex = this.getInitialActiveEditIndex(model, edits);
                        const canShowWidget = editor.getOption(36 /* EditorOption.dropIntoEditor */).showDropSelector === 'afterDrop';
                        // Pass in the parent token here as it tracks cancelling the entire drop operation
                        await this._postDropWidgetManager.applyEditAndShowIfNeeded([range_1.Range.fromPositions(position)], { activeEditIndex, allEdits: edits }, canShowWidget, token);
                    }
                }
                finally {
                    tokenSource.dispose();
                    if (this._currentOperation === p) {
                        this._currentOperation = undefined;
                    }
                }
            });
            this._dropProgressManager.showWhile(position, (0, nls_1.localize)('dropIntoEditorProgress', "Running drop handlers. Click to cancel"), p);
            this._currentOperation = p;
        }
        async getDropEdits(providers, model, position, dataTransfer, tokenSource) {
            const results = await (0, async_1.raceCancellation)(Promise.all(providers.map(async (provider) => {
                try {
                    const edit = await provider.provideDocumentOnDropEdits(model, position, dataTransfer, tokenSource.token);
                    if (edit) {
                        return { ...edit, providerId: provider.id };
                    }
                }
                catch (err) {
                    console.error(err);
                }
                return undefined;
            })), tokenSource.token);
            const edits = (0, arrays_1.coalesce)(results ?? []);
            return (0, edit_1.sortEditsByYieldTo)(edits);
        }
        getInitialActiveEditIndex(model, edits) {
            const preferredProviders = this._configService.getValue(exports.defaultProviderConfig, { resource: model.uri });
            for (const [configMime, desiredId] of Object.entries(preferredProviders)) {
                const editIndex = edits.findIndex(edit => desiredId === edit.providerId
                    && edit.handledMimeType && (0, dataTransfer_1.matchesMimeType)(configMime, [edit.handledMimeType]));
                if (editIndex >= 0) {
                    return editIndex;
                }
            }
            return 0;
        }
        async extractDataTransferData(dragEvent) {
            if (!dragEvent.dataTransfer) {
                return new dataTransfer_1.VSDataTransfer();
            }
            const dataTransfer = (0, dnd_1.toExternalVSDataTransfer)(dragEvent.dataTransfer);
            if (this.treeItemsTransfer.hasData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype)) {
                const data = this.treeItemsTransfer.getData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype);
                if (Array.isArray(data)) {
                    for (const id of data) {
                        const treeDataTransfer = await this._treeViewsDragAndDropService.removeDragOperationTransfer(id.identifier);
                        if (treeDataTransfer) {
                            for (const [type, value] of treeDataTransfer) {
                                dataTransfer.replace(type, value);
                            }
                        }
                    }
                }
            }
            return dataTransfer;
        }
    };
    exports.DropIntoEditorController = DropIntoEditorController;
    exports.DropIntoEditorController = DropIntoEditorController = DropIntoEditorController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, treeViewsDndService_1.ITreeViewsDnDService)
    ], DropIntoEditorController);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcEludG9FZGl0b3JDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9kcm9wT3JQYXN0ZUludG8vYnJvd3Nlci9kcm9wSW50b0VkaXRvckNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTJCbkYsUUFBQSxxQkFBcUIsR0FBRyxvREFBb0QsQ0FBQztJQUU3RSxRQUFBLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBRWxELFFBQUEsb0JBQW9CLEdBQUcsSUFBSSwwQkFBYSxDQUFVLG1CQUFtQixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDLENBQUM7SUFFekosSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBeUIsU0FBUSxzQkFBVTs7aUJBRWhDLE9BQUUsR0FBRyx5Q0FBeUMsQUFBNUMsQ0FBNkM7UUFFL0QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUNwQyxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQTJCLDBCQUF3QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFTRCxZQUNDLE1BQW1CLEVBQ0ksb0JBQTJDLEVBQzNDLGNBQXNELEVBQ25ELHdCQUFtRSxFQUN2RSw0QkFBbUU7WUFFekYsS0FBSyxFQUFFLENBQUM7WUFKZ0MsbUJBQWMsR0FBZCxjQUFjLENBQXVCO1lBQ2xDLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDdEQsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUFzQjtZQVB6RSxzQkFBaUIsR0FBRyw0QkFBc0IsQ0FBQyxXQUFXLEVBQThCLENBQUM7WUFXckcsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsY0FBYyxD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