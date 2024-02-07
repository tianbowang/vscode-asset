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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/resources", "vs/base/common/uuid", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/common/memento"], function (require, exports, arrays_1, resources_1, uuid_1, contextkey_1, instantiation_1, storage_1, memento_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionKeyedWebviewOriginStore = exports.WebviewOriginStore = exports.areWebviewContentOptionsEqual = exports.WebviewContentPurpose = exports.IWebviewService = exports.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED = exports.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED = exports.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE = void 0;
    /**
     * Set when the find widget in a webview in a webview is visible.
     */
    exports.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE = new contextkey_1.RawContextKey('webviewFindWidgetVisible', false);
    /**
     * Set when the find widget in a webview is focused.
     */
    exports.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED = new contextkey_1.RawContextKey('webviewFindWidgetFocused', false);
    /**
     * Set when the find widget in a webview is enabled in a webview
     */
    exports.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED = new contextkey_1.RawContextKey('webviewFindWidgetEnabled', false);
    exports.IWebviewService = (0, instantiation_1.createDecorator)('webviewService');
    var WebviewContentPurpose;
    (function (WebviewContentPurpose) {
        WebviewContentPurpose["NotebookRenderer"] = "notebookRenderer";
        WebviewContentPurpose["CustomEditor"] = "customEditor";
        WebviewContentPurpose["WebviewView"] = "webviewView";
    })(WebviewContentPurpose || (exports.WebviewContentPurpose = WebviewContentPurpose = {}));
    /**
     * Check if two {@link WebviewContentOptions} are equal.
     */
    function areWebviewContentOptionsEqual(a, b) {
        return (a.allowMultipleAPIAcquire === b.allowMultipleAPIAcquire
            && a.allowScripts === b.allowScripts
            && a.allowForms === b.allowForms
            && (0, arrays_1.equals)(a.localResourceRoots, b.localResourceRoots, resources_1.isEqual)
            && (0, arrays_1.equals)(a.portMapping, b.portMapping, (a, b) => a.extensionHostPort === b.extensionHostPort && a.webviewPort === b.webviewPort)
            && areEnableCommandUrisEqual(a, b));
    }
    exports.areWebviewContentOptionsEqual = areWebviewContentOptionsEqual;
    function areEnableCommandUrisEqual(a, b) {
        if (a.enableCommandUris === b.enableCommandUris) {
            return true;
        }
        if (Array.isArray(a.enableCommandUris) && Array.isArray(b.enableCommandUris)) {
            return (0, arrays_1.equals)(a.enableCommandUris, b.enableCommandUris);
        }
        return false;
    }
    /**
     * Stores the unique origins for a webview.
     *
     * These are randomly generated
     */
    let WebviewOriginStore = class WebviewOriginStore {
        constructor(rootStorageKey, storageService) {
            this._memento = new memento_1.Memento(rootStorageKey, storageService);
            this._state = this._memento.getMemento(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        getOrigin(viewType, additionalKey) {
            const key = this._getKey(viewType, additionalKey);
            const existing = this._state[key];
            if (existing && typeof existing === 'string') {
                return existing;
            }
            const newOrigin = (0, uuid_1.generateUuid)();
            this._state[key] = newOrigin;
            this._memento.saveMemento();
            return newOrigin;
        }
        _getKey(viewType, additionalKey) {
            return JSON.stringify({ viewType, key: additionalKey });
        }
    };
    exports.WebviewOriginStore = WebviewOriginStore;
    exports.WebviewOriginStore = WebviewOriginStore = __decorate([
        __param(1, storage_1.IStorageService)
    ], WebviewOriginStore);
    /**
     * Stores the unique origins for a webview.
     *
     * These are randomly generated, but keyed on extension and webview viewType.
     */
    let ExtensionKeyedWebviewOriginStore = class ExtensionKeyedWebviewOriginStore {
        constructor(rootStorageKey, storageService) {
            this._store = new WebviewOriginStore(rootStorageKey, storageService);
        }
        getOrigin(viewType, extId) {
            return this._store.getOrigin(viewType, extId.value);
        }
    };
    exports.ExtensionKeyedWebviewOriginStore = ExtensionKeyedWebviewOriginStore;
    exports.ExtensionKeyedWebviewOriginStore = ExtensionKeyedWebviewOriginStore = __decorate([
        __param(1, storage_1.IStorageService)
    ], ExtensionKeyedWebviewOriginStore);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2Vidmlldy9icm93c2VyL3dlYnZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0JoRzs7T0FFRztJQUNVLFFBQUEsOENBQThDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTVIOztPQUVHO0lBQ1UsUUFBQSw4Q0FBOEMsR0FBRyxJQUFJLDBCQUFhLENBQVUsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFNUg7O09BRUc7SUFDVSxRQUFBLDhDQUE4QyxHQUFHLElBQUksMEJBQWEsQ0FBVSwwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUUvRyxRQUFBLGVBQWUsR0FBRyxJQUFBLCtCQUFlLEVBQWtCLGdCQUFnQixDQUFDLENBQUM7SUErQ2xGLElBQWtCLHFCQUlqQjtJQUpELFdBQWtCLHFCQUFxQjtRQUN0Qyw4REFBcUMsQ0FBQTtRQUNyQyxzREFBNkIsQ0FBQTtRQUM3QixvREFBMkIsQ0FBQTtJQUM1QixDQUFDLEVBSmlCLHFCQUFxQixxQ0FBckIscUJBQXFCLFFBSXRDO0lBd0REOztPQUVHO0lBQ0gsU0FBZ0IsNkJBQTZCLENBQUMsQ0FBd0IsRUFBRSxDQUF3QjtRQUMvRixPQUFPLENBQ04sQ0FBQyxDQUFDLHVCQUF1QixLQUFLLENBQUMsQ0FBQyx1QkFBdUI7ZUFDcEQsQ0FBQyxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUMsWUFBWTtlQUNqQyxDQUFDLENBQUMsVUFBVSxLQUFLLENBQUMsQ0FBQyxVQUFVO2VBQzdCLElBQUEsZUFBTSxFQUFDLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsa0JBQWtCLEVBQUUsbUJBQU8sQ0FBQztlQUMzRCxJQUFB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