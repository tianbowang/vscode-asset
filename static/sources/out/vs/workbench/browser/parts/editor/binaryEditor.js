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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/workbench/common/editor/binaryEditorModel", "vs/platform/storage/common/storage", "vs/platform/files/common/files", "vs/workbench/browser/parts/editor/editorPlaceholder"], function (require, exports, nls_1, event_1, binaryEditorModel_1, storage_1, files_1, editorPlaceholder_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseBinaryResourceEditor = void 0;
    /*
     * This class is only intended to be subclassed and not instantiated.
     */
    let BaseBinaryResourceEditor = class BaseBinaryResourceEditor extends editorPlaceholder_1.EditorPlaceholder {
        constructor(id, callbacks, telemetryService, themeService, storageService) {
            super(id, telemetryService, themeService, storageService);
            this.callbacks = callbacks;
            this._onDidChangeMetadata = this._register(new event_1.Emitter());
            this.onDidChangeMetadata = this._onDidChangeMetadata.event;
            this._onDidOpenInPlace = this._register(new event_1.Emitter());
            this.onDidOpenInPlace = this._onDidOpenInPlace.event;
        }
        getTitle() {
            return this.input ? this.input.getName() : (0, nls_1.localize)('binaryEditor', "Binary Viewer");
        }
        async getContents(input, options) {
            const model = await input.resolve(options);
            // Assert Model instance
            if (!(model instanceof binaryEditorModel_1.BinaryEditorModel)) {
                throw new Error('Unable to open file as binary');
            }
            // Update metadata
            const size = model.getSize();
            this.handleMetadataChanged(typeof size === 'number' ? files_1.ByteSize.formatSize(size) : '');
            return {
                icon: '$(warning)',
                label: (0, nls_1.localize)('binaryError', "The file is not displayed in the text editor because it is either binary or uses an unsupported text encoding."),
                actions: [
                    {
                        label: (0, nls_1.localize)('openAnyway', "Open Anyway"),
                        run: async () => {
                            // Open in place
                            await this.callbacks.openInternal(input, options);
                            // Signal to listeners that the binary editor has been opened in-place
                            this._onDidOpenInPlace.fire();
                        }
                    }
                ]
            };
        }
        handleMetadataChanged(meta) {
            this.metadata = meta;
            this._onDidChangeMetadata.fire();
        }
        getMetadata() {
            return this.metadata;
        }
    };
    exports.BaseBinaryResourceEditor = BaseBinaryResourceEditor;
    exports.BaseBinaryResourceEditor = BaseBinaryResourceEditor = __decorate([
        __param(4, storage_1.IStorageService)
    ], BaseBinaryResourceEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluYXJ5RWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvYmluYXJ5RWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCaEc7O09BRUc7SUFDSSxJQUFlLHdCQUF3QixHQUF2QyxNQUFlLHdCQUF5QixTQUFRLHFDQUFpQjtRQVV2RSxZQUNDLEVBQVUsRUFDTyxTQUF5QixFQUMxQyxnQkFBbUMsRUFDbkMsWUFBMkIsRUFDVixjQUErQjtZQUVoRCxLQUFLLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUx6QyxjQUFTLEdBQVQsU0FBUyxDQUFnQjtZQVYxQix5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNuRSx3QkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBRTlDLHNCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ2hFLHFCQUFnQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7UUFZekQsQ0FBQztRQUVRLFFBQVE7WUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUVTLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBa0IsRUFBRSxPQUF1QjtZQUN0RSxNQUFNLEtBQUssR0FBRyxNQUFNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFM0Msd0JBQXdCO1lBQ3hCLElBQUksQ0FBQyxDQUFDLEtBQUssWUFBWSxxQ0FBaUIsQ0FBQyxFQUFFLENBQUM7Z0JBQzNDLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztZQUNsRCxDQUFDO1lBRUQsa0JBQWtCO1lBQ2xCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFdEYsT0FBTztnQkFDTixJQUFJLEVBQUUsWUFBWTtnQkFDbEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSxnSEFBZ0gsQ0FBQztnQkFDaEosT0FBTyxFQUFFO29CQUNSO3dCQUNDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsYUFBYSxDQUFDO3dCQUM1QyxHQUFHLEVBQUUsS0FBSyxJQUFJLEVBQUU7NEJBRWYsZ0JBQWdCOzRCQUNoQixNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQzs0QkFFbEQsc0VBQXNFOzRCQUN0RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQy9CLENBQUM7cUJBQ0Q7aUJBQ0Q7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVPLHFCQUFxQixDQUFDLElBQXdCO1lBQ3JELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBRXJCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRUQsV0FBVztZQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QixDQUFDO0tBQ0QsQ0FBQTtJQWhFcUIsNERBQXdCO3VDQUF4Qix3QkFBd0I7UUFlM0MsV0FBQSx5QkFBZSxDQUFBO09BZkksd0JBQXdCLENBZ0U3QyJ9