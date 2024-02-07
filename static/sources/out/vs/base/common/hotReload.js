/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/process"], function (require, exports, process_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerHotReloadHandler = exports.isHotReloadEnabled = void 0;
    function isHotReloadEnabled() {
        return process_1.env && !!process_1.env['VSCODE_DEV'];
    }
    exports.isHotReloadEnabled = isHotReloadEnabled;
    function registerHotReloadHandler(handler) {
        if (!isHotReloadEnabled()) {
            return { dispose() { } };
        }
        else {
            const handlers = registerGlobalHotReloadHandler();
            handlers.add(handler);
            return {
                dispose() { handlers.delete(handler); }
            };
        }
    }
    exports.registerHotReloadHandler = registerHotReloadHandler;
    function registerGlobalHotReloadHandler() {
        if (!hotReloadHandlers) {
            hotReloadHandlers = new Set();
        }
        const g = globalThis;
        if (!g.$hotReload_applyNewExports) {
            g.$hotReload_applyNewExports = oldExports => {
                for (const h of hotReloadHandlers) {
                    const result = h(oldExports);
                    if (result) {
                        return result;
                    }
                }
                return undefined;
            };
        }
        return hotReloadHandlers;
    }
    let hotReloadHandlers = undefined;
    if (isHotReloadEnabled()) {
        // This code does not run in production.
        registerHotReloadHandler(({ oldExports, newSrc }) => {
            // Don't match its own source code
            if (newSrc.indexOf('/* ' + 'hot-reload:patch-prototype-methods */') === -1) {
                return undefined;
            }
            return newExports => {
                for (const key in newExports) {
                    const exportedItem = newExports[key];
                    console.log(`[hot-reload] Patching prototype methods of '${key}'`, { exportedItem });
                    if (typeof exportedItem === 'function' && exportedItem.prototype) {
                        const oldExportedItem = oldExports[key];
                        if (oldExportedItem) {
                            for (const prop of Object.getOwnPropertyNames(exportedItem.prototype)) {
                                const descriptor = Object.getOwnPropertyDescriptor(exportedItem.prototype, prop);
                                const oldDescriptor = Object.getOwnPropertyDescriptor(oldExportedItem.prototype, prop);
                                if (descriptor?.value?.toString() !== oldDescriptor?.value?.toString()) {
                                    console.log(`[hot-reload] Patching prototype method '${key}.${prop}'`);
                                }
                                Object.defineProperty(oldExportedItem.prototype, prop, descriptor);
                            }
                            newExports[key] = oldExportedItem;
                        }
                    }
                }
                return true;
            };
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG90UmVsb2FkLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9ob3RSZWxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLFNBQWdCLGtCQUFrQjtRQUNqQyxPQUFPLGFBQUcsSUFBSSxDQUFDLENBQUMsYUFBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFGRCxnREFFQztJQUNELFNBQWdCLHdCQUF3QixDQUFDLE9BQXlCO1FBQ2pFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUM7WUFDM0IsT0FBTyxFQUFFLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMxQixDQUFDO2FBQU0sQ0FBQztZQUNQLE1BQU0sUUFBUSxHQUFHLDhCQUE4QixFQUFFLENBQUM7WUFDbEQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QixPQUFPO2dCQUNOLE9BQU8sS0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2QyxDQUFDO1FBQ0gsQ0FBQztJQUNGLENBQUM7SUFWRCw0REFVQztJQVdELFNBQVMsOEJBQThCO1FBQ3RDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3hCLGlCQUFpQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUVELE1BQU0sQ0FBQyxHQUFHLFVBQTJDLENBQUM7UUFDdEQsSUFBSSxDQUFDLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1lBQ25DLENBQUMsQ0FBQywwQkFBMEIsR0FBRyxVQUFVLENBQUMsRUFBRTtnQkFDM0MsS0FBSyxNQUFNLENBQUMsSUFBSSxpQkFBa0IsRUFBRSxDQUFDO29CQUNwQyxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzdCLElBQUksTUFBTSxFQUFFLENBQUM7d0JBQUMsT0FBTyxNQUFNLENBQUM7b0JBQUMsQ0FBQztnQkFDL0IsQ0FBQztnQkFDRCxPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxpQkFBaUIsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxpQkFBaUIsR0FBdUgsU0FBUyxDQUFDO0lBU3RKLElBQUksa0JBQWtCLEVBQUUsRUFBRSxDQUFDO1FBQzFCLHdDQUF3QztRQUN4Qyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7WUFDbkQsa0NBQWtDO1lBQ2xDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsdUNBQXVDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM1RSxPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDO1lBQ0QsT0FBTyxVQUFVLENBQUMsRUFBRTtnQkFDbkIsS0FBSyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztvQkFDOUIsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLCtDQUErQyxHQUFHLEdBQUcsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7b0JBQ3JGLElBQUksT0FBTyxZQUFZLEtBQUssVUFBVSxJQUFJLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDbEUsTUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUN4QyxJQUFJLGVBQWUsRUFBRSxDQUFDOzRCQUNyQixLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztnQ0FDdkUsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFFLENBQUM7Z0NBQ2xGLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBRSxlQUF1QixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQ0FFaEcsSUFBSSxVQUFVLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLGFBQWEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQztvQ0FDeEUsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsR0FBRyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7Z0NBQ3hFLENBQUM7Z0NBRUQsTUFBTSxDQUFDLGNBQWMsQ0FBRSxlQUF1QixDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7NEJBQzdFLENBQUM7NEJBQ0QsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQWUsQ0FBQzt3QkFDbkMsQ0FBQztvQkFDRixDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMifQ==