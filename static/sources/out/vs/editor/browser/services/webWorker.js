/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects", "vs/editor/browser/services/editorWorkerService"], function (require, exports, objects_1, editorWorkerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createWebWorker = void 0;
    /**
     * Create a new web worker that has model syncing capabilities built in.
     * Specify an AMD module to load that will `create` an object that will be proxied.
     */
    function createWebWorker(modelService, languageConfigurationService, opts) {
        return new MonacoWebWorkerImpl(modelService, languageConfigurationService, opts);
    }
    exports.createWebWorker = createWebWorker;
    class MonacoWebWorkerImpl extends editorWorkerService_1.EditorWorkerClient {
        constructor(modelService, languageConfigurationService, opts) {
            super(modelService, opts.keepIdleModels || false, opts.label, languageConfigurationService);
            this._foreignModuleId = opts.moduleId;
            this._foreignModuleCreateData = opts.createData || null;
            this._foreignModuleHost = opts.host || null;
            this._foreignProxy = null;
        }
        // foreign host request
        fhr(method, args) {
            if (!this._foreignModuleHost || typeof this._foreignModuleHost[method] !== 'function') {
                return Promise.reject(new Error('Missing method ' + method + ' or missing main thread foreign host.'));
            }
            try {
                return Promise.resolve(this._foreignModuleHost[method].apply(this._foreignModuleHost, args));
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        _getForeignProxy() {
            if (!this._foreignProxy) {
                this._foreignProxy = this._getProxy().then((proxy) => {
                    const foreignHostMethods = this._foreignModuleHost ? (0, objects_1.getAllMethodNames)(this._foreignModuleHost) : [];
                    return proxy.loadForeignModule(this._foreignModuleId, this._foreignModuleCreateData, foreignHostMethods).then((foreignMethods) => {
                        this._foreignModuleCreateData = null;
                        const proxyMethodRequest = (method, args) => {
                            return proxy.fmr(method, args);
                        };
                        const createProxyMethod = (method, proxyMethodRequest) => {
                            return function () {
                                const args = Array.prototype.slice.call(arguments, 0);
                                return proxyMethodRequest(method, args);
                            };
                        };
                        const foreignProxy = {};
                        for (const foreignMethod of foreignMethods) {
                            foreignProxy[foreignMethod] = createProxyMethod(foreignMethod, proxyMethodRequest);
                        }
                        return foreignProxy;
                    });
                });
            }
            return this._foreignProxy;
        }
        getProxy() {
            return this._getForeignProxy();
        }
        withSyncedResources(resources) {
            return this._withSyncedResources(resources).then(_ => this.getProxy());
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViV29ya2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci9zZXJ2aWNlcy93ZWJXb3JrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHOzs7T0FHRztJQUNILFNBQWdCLGVBQWUsQ0FBbUIsWUFBMkIsRUFBRSw0QkFBMkQsRUFBRSxJQUF1QjtRQUNsSyxPQUFPLElBQUksbUJBQW1CLENBQUksWUFBWSxFQUFFLDRCQUE0QixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFGRCwwQ0FFQztJQThDRCxNQUFNLG1CQUFzQyxTQUFRLHdDQUFrQjtRQU9yRSxZQUFZLFlBQTJCLEVBQUUsNEJBQTJELEVBQUUsSUFBdUI7WUFDNUgsS0FBSyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsY0FBYyxJQUFJLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLDRCQUE0QixDQUFDLENBQUM7WUFDNUYsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDdEMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDO1lBQ3hELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztZQUM1QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUMzQixDQUFDO1FBRUQsdUJBQXVCO1FBQ1AsR0FBRyxDQUFDLE1BQWMsRUFBRSxJQUFXO1lBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQ3ZGLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxpQkFB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