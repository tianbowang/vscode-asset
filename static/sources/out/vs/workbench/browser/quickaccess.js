/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/common/quickInput", "vs/editor/browser/editorBrowser"], function (require, exports, nls_1, contextkey_1, keybinding_1, quickInput_1, editorBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorViewState = exports.getQuickNavigateHandler = exports.defaultQuickAccessContext = exports.defaultQuickAccessContextKeyValue = exports.inQuickPickContext = exports.InQuickPickContextKey = exports.inQuickPickContextKeyValue = void 0;
    exports.inQuickPickContextKeyValue = 'inQuickOpen';
    exports.InQuickPickContextKey = new contextkey_1.RawContextKey(exports.inQuickPickContextKeyValue, false, (0, nls_1.localize)('inQuickOpen', "Whether keyboard focus is inside the quick open control"));
    exports.inQuickPickContext = contextkey_1.ContextKeyExpr.has(exports.inQuickPickContextKeyValue);
    exports.defaultQuickAccessContextKeyValue = 'inFilesPicker';
    exports.defaultQuickAccessContext = contextkey_1.ContextKeyExpr.and(exports.inQuickPickContext, contextkey_1.ContextKeyExpr.has(exports.defaultQuickAccessContextKeyValue));
    function getQuickNavigateHandler(id, next) {
        return accessor => {
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const keys = keybindingService.lookupKeybindings(id);
            const quickNavigate = { keybindings: keys };
            quickInputService.navigate(!!next, quickNavigate);
        };
    }
    exports.getQuickNavigateHandler = getQuickNavigateHandler;
    class EditorViewState {
        constructor(editorService) {
            this.editorService = editorService;
            this._editorViewState = undefined;
        }
        set() {
            if (this._editorViewState) {
                return; // return early if already done
            }
            const activeEditorPane = this.editorService.activeEditorPane;
            if (activeEditorPane) {
                this._editorViewState = {
                    group: activeEditorPane.group,
                    editor: activeEditorPane.input,
                    state: (0, editorBrowser_1.getIEditor)(activeEditorPane.getControl())?.saveViewState() ?? undefined,
                };
            }
        }
        async restore() {
            if (this._editorViewState) {
                const options = {
                    viewState: this._editorViewState.state,
                    preserveFocus: true /* import to not close the picker as a result */
                };
                await this._editorViewState.group.openEditor(this._editorViewState.editor, options);
            }
        }
        reset() {
            this._editorViewState = undefined;
        }
    }
    exports.EditorViewState = EditorViewState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2thY2Nlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3F1aWNrYWNjZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNuRixRQUFBLDBCQUEwQixHQUFHLGFBQWEsQ0FBQztJQUMzQyxRQUFBLHFCQUFxQixHQUFHLElBQUksMEJBQWEsQ0FBVSxrQ0FBMEIsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLHlEQUF5RCxDQUFDLENBQUMsQ0FBQztJQUMxSyxRQUFBLGtCQUFrQixHQUFHLDJCQUFjLENBQUMsR0FBRyxDQUFDLGtDQUEwQixDQUFDLENBQUM7SUFFcEUsUUFBQSxpQ0FBaUMsR0FBRyxlQUFlLENBQUM7SUFDcEQsUUFBQSx5QkFBeUIsR0FBRywyQkFBYyxDQUFDLEdBQUcsQ0FBQywwQkFBa0IsRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyx5Q0FBaUMsQ0FBQyxDQUFDLENBQUM7SUFvQnZJLFNBQWdCLHVCQUF1QixDQUFDLEVBQVUsRUFBRSxJQUFjO1FBQ2pFLE9BQU8sUUFBUSxDQUFDLEVBQUU7WUFDakIsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7WUFDM0QsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7WUFFM0QsTUFBTSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckQsTUFBTSxhQUFhLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFFNUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQVZELDBEQVVDO0lBQ0QsTUFBYSxlQUFlO1FBTzNCLFlBQTZCLGFBQTZCO1lBQTdCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQU5sRCxxQkFBZ0IsR0FJUixTQUFTLENBQUM7UUFFb0MsQ0FBQztRQUUvRCxHQUFHO1lBQ0YsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxDQUFDLCtCQUErQjtZQUN4QyxDQUFDO1lBRUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDO1lBQzdELElBQUksZ0JBQWdCLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHO29CQUN2QixLQUFLLEVBQUUsZ0JBQWdCLENBQUMsS0FBSztvQkFDN0IsTUFBTSxFQUFFLGdCQUFnQixDQUFDLEtBQUs7b0JBQzlCLEtBQUssRUFBRSxJQUFBLDBCQUFVLEVBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxTQUFTO2lCQUM5RSxDQUFDO1lBQ0gsQ0FBQztRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsT0FBTztZQUNaLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQzNCLE1BQU0sT0FBTyxHQUFtQjtvQkFDL0IsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLO29CQUN0QyxhQUFhLEVBQUUsSUFBSSxDQUFDLGdEQUFnRDtpQkFDcEUsQ0FBQztnQkFFRixNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDckYsQ0FBQztRQUNGLENBQUM7UUFFRCxLQUFLO1lBQ0osSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztRQUNuQyxDQUFDO0tBQ0Q7SUF0Q0QsMENBc0NDIn0=