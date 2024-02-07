/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/uuid", "vs/workbench/common/editor/editorInput"], function (require, exports, network_1, uri_1, uuid_1, editorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewInput = void 0;
    class WebviewInput extends editorInput_1.EditorInput {
        static { this.typeId = 'workbench.editors.webviewInput'; }
        get typeId() {
            return WebviewInput.typeId;
        }
        get editorId() {
            return this.viewType;
        }
        get capabilities() {
            return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */ | 128 /* EditorInputCapabilities.CanDropIntoEditor */ | 1024 /* EditorInputCapabilities.AuxWindowUnsupported */;
        }
        get resource() {
            return uri_1.URI.from({
                scheme: network_1.Schemas.webviewPanel,
                path: `webview-panel/webview-${this._resourceId}`
            });
        }
        constructor(init, webview, _iconManager) {
            super();
            this._iconManager = _iconManager;
            this._resourceId = (0, uuid_1.generateUuid)();
            this._hasTransfered = false;
            this.viewType = init.viewType;
            this.providedId = init.providedId;
            this._name = init.name;
            this._webview = webview;
        }
        dispose() {
            if (!this.isDisposed()) {
                if (!this._hasTransfered) {
                    this._webview?.dispose();
                }
            }
            super.dispose();
        }
        getName() {
            return this._name;
        }
        getTitle(_verbosity) {
            return this.getName();
        }
        getDescription() {
            return undefined;
        }
        setName(value) {
            this._name = value;
            this.webview.setTitle(value);
            this._onDidChangeLabel.fire();
        }
        get webview() {
            return this._webview;
        }
        get extension() {
            return this.webview.extension;
        }
        get iconPath() {
            return this._iconPath;
        }
        set iconPath(value) {
            this._iconPath = value;
            this._iconManager.setIcons(this._resourceId, value);
        }
        matches(other) {
            return super.matches(other) || other === this;
        }
        get group() {
            return this._group;
        }
        updateGroup(group) {
            this._group = group;
        }
        transfer(other) {
            if (this._hasTransfered) {
                return undefined;
            }
            this._hasTransfered = true;
            other._webview = this._webview;
            return other;
        }
    }
    exports.WebviewInput = WebviewInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld0VkaXRvcklucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3UGFuZWwvYnJvd3Nlci93ZWJ2aWV3RWRpdG9ySW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JoRyxNQUFhLFlBQWEsU0FBUSx5QkFBVztpQkFFOUIsV0FBTSxHQUFHLGdDQUFnQyxBQUFuQyxDQUFvQztRQUV4RCxJQUFvQixNQUFNO1lBQ3pCLE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUM1QixDQUFDO1FBRUQsSUFBb0IsUUFBUTtZQUMzQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUVELElBQW9CLFlBQVk7WUFDL0IsT0FBTyxvRkFBb0Usc0RBQTRDLDBEQUErQyxDQUFDO1FBQ3hLLENBQUM7UUFZRCxJQUFJLFFBQVE7WUFDWCxPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ2YsTUFBTSxFQUFFLGlCQUFPLENBQUMsWUFBWTtnQkFDNUIsSUFBSSxFQUFFLHlCQUF5QixJQUFJLENBQUMsV0FBVyxFQUFFO2FBQ2pELENBQUMsQ0FBQztRQUNKLENBQUM7UUFLRCxZQUNDLElBQTBCLEVBQzFCLE9BQXdCLEVBQ1AsWUFBZ0M7WUFFakQsS0FBSyxFQUFFLENBQUM7WUFGUyxpQkFBWSxHQUFaLFlBQVksQ0FBb0I7WUF2QmpDLGdCQUFXLEdBQUcsSUFBQSxtQkFBWSxHQUFFLENBQUM7WUFRdEMsbUJBQWMsR0FBRyxLQUFLLENBQUM7WUFtQjlCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM5QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFFbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3pCLENBQUM7UUFFUSxPQUFPO1lBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUMxQixJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDO2dCQUMxQixDQUFDO1lBQ0YsQ0FBQztZQUNELEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRWUsT0FBTztZQUN0QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDbkIsQ0FBQztRQUVlLFFBQVEsQ0FBQyxVQUFzQjtZQUM5QyxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRWUsY0FBYztZQUM3QixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU0sT0FBTyxDQUFDLEtBQWE7WUFDM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQy9CLENBQUM7UUFFRCxJQUFXLE9BQU87WUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFXLFNBQVM7WUFDbkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBVyxRQUFRO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN2QixDQUFDO1FBRUQsSUFBVyxRQUFRLENBQUMsS0FBK0I7WUFDbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRWUsT0FBTyxDQUFDLEtBQXdDO1lBQy9ELE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDO1FBQy9DLENBQUM7UUFFRCxJQUFXLEtBQUs7WUFDZixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEIsQ0FBQztRQUVNLFdBQVcsQ0FBQyxLQUFzQjtZQUN4QyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNyQixDQUFDO1FBRVMsUUFBUSxDQUFDLEtBQW1CO1lBQ3JDLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN6QixPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDO1lBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFDM0IsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQy9CLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQzs7SUFqSEYsb0NBa0hDIn0=