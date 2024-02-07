/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/amd", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri"], function (require, exports, amd_1, network_1, platform, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.importAMDNodeModule = void 0;
    class DefineCall {
        constructor(id, dependencies, callback) {
            this.id = id;
            this.dependencies = dependencies;
            this.callback = callback;
        }
    }
    class AMDModuleImporter {
        static { this.INSTANCE = new AMDModuleImporter(); }
        constructor() {
            this._isWebWorker = (typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope');
            this._isRenderer = typeof document === 'object';
            this._defineCalls = [];
            this._initialized = false;
        }
        _initialize() {
            if (this._initialized) {
                return;
            }
            this._initialized = true;
            globalThis.define = (id, dependencies, callback) => {
                if (typeof id !== 'string') {
                    callback = dependencies;
                    dependencies = id;
                    id = null;
                }
                if (typeof dependencies !== 'object' || !Array.isArray(dependencies)) {
                    callback = dependencies;
                    dependencies = null;
                }
                // if (!dependencies) {
                // 	dependencies = ['require', 'exports', 'module'];
                // }
                this._defineCalls.push(new DefineCall(id, dependencies, callback));
            };
            globalThis.define.amd = true;
            if (this._isRenderer) {
                // eslint-disable-next-line no-restricted-globals
                this._amdPolicy = window.trustedTypes?.createPolicy('amdLoader', {
                    createScriptURL(value) {
                        // eslint-disable-next-line no-restricted-globals
                        if (value.startsWith(window.location.origin)) {
                            return value;
                        }
                        if (value.startsWith('vscode-file://vscode-app')) {
                            return value;
                        }
                        throw new Error(`[trusted_script_src] Invalid script url: ${value}`);
                    }
                });
            }
            else if (this._isWebWorker) {
                this._amdPolicy = globalThis.trustedTypes?.createPolicy('amdLoader', {
                    createScriptURL(value) {
                        return value;
                    }
                });
            }
        }
        async load(scriptSrc) {
            this._initialize();
            const defineCall = await (this._isWebWorker ? this._workerLoadScript(scriptSrc) : this._isRenderer ? this._rendererLoadScript(scriptSrc) : this._nodeJSLoadScript(scriptSrc));
            if (!defineCall) {
                throw new Error(`Did not receive a define call from script ${scriptSrc}`);
            }
            // TODO require, exports, module
            if (Array.isArray(defineCall.dependencies) && defineCall.dependencies.length > 0) {
                throw new Error(`Cannot resolve dependencies for script ${scriptSrc}. The dependencies are: ${defineCall.dependencies.join(', ')}`);
            }
            if (typeof defineCall.callback === 'function') {
                return defineCall.callback([]);
            }
            else {
                return defineCall.callback;
            }
        }
        _rendererLoadScript(scriptSrc) {
            return new Promise((resolve, reject) => {
                const scriptElement = document.createElement('script');
                scriptElement.setAttribute('async', 'async');
                scriptElement.setAttribute('type', 'text/javascript');
                const unbind = () => {
                    scriptElement.removeEventListener('load', loadEventListener);
                    scriptElement.removeEventListener('error', errorEventListener);
                };
                const loadEventListener = (e) => {
                    unbind();
                    resolve(this._defineCalls.pop());
                };
                const errorEventListener = (e) => {
                    unbind();
                    reject(e);
                };
                scriptElement.addEventListener('load', loadEventListener);
                scriptElement.addEventListener('error', errorEventListener);
                if (this._amdPolicy) {
                    scriptSrc = this._amdPolicy.createScriptURL(scriptSrc);
                }
                scriptElement.setAttribute('src', scriptSrc);
                // eslint-disable-next-line no-restricted-globals
                window.document.getElementsByTagName('head')[0].appendChild(scriptElement);
            });
        }
        _workerLoadScript(scriptSrc) {
            return new Promise((resolve, reject) => {
                try {
                    if (this._amdPolicy) {
                        scriptSrc = this._amdPolicy.createScriptURL(scriptSrc);
                    }
                    importScripts(scriptSrc);
                    resolve(this._defineCalls.pop());
                }
                catch (err) {
                    reject(err);
                }
            });
        }
        async _nodeJSLoadScript(scriptSrc) {
            try {
                const fs = globalThis._VSCODE_NODE_MODULES['fs'];
                const vm = globalThis._VSCODE_NODE_MODULES['vm'];
                const module = globalThis._VSCODE_NODE_MODULES['module'];
                const filePath = uri_1.URI.parse(scriptSrc).fsPath;
                const content = fs.readFileSync(filePath).toString();
                const scriptSource = module.wrap(content.replace(/^#!.*/, ''));
                const script = new vm.Script(scriptSource);
                const compileWrapper = script.runInThisContext();
                compileWrapper.apply();
                return this._defineCalls.pop();
            }
            catch (error) {
                throw error;
            }
        }
    }
    const cache = new Map();
    let _paths = {};
    if (typeof globalThis.require === 'object') {
        _paths = globalThis.require.paths ?? {};
    }
    /**
     * Utility for importing an AMD node module. This util supports AMD and ESM contexts and should be used while the ESM adoption
     * is on its way.
     *
     * e.g. pass in `vscode-textmate/release/main.js`
     */
    async function importAMDNodeModule(nodeModuleName, pathInsideNodeModule, isBuilt) {
        if (amd_1.isESM) {
            if (isBuilt === undefined) {
                const product = globalThis._VSCODE_PRODUCT_JSON;
                isBuilt = Boolean((product ?? globalThis.vscode?.context?.configuration()?.product)?.commit);
            }
            if (_paths[nodeModuleName]) {
                nodeModuleName = _paths[nodeModuleName];
            }
            const nodeModulePath = `${nodeModuleName}/${pathInsideNodeModule}`;
            if (cache.has(nodeModulePath)) {
                return cache.get(nodeModulePath);
            }
            let scriptSrc;
            if (/^\w[\w\d+.-]*:\/\//.test(nodeModulePath)) {
                // looks like a URL
                // bit of a special case for: src/vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker.ts
                scriptSrc = nodeModulePath;
            }
            else {
                const useASAR = (isBuilt && !platform.isWeb);
                const actualNodeModulesPath = (useASAR ? network_1.nodeModulesAsarPath : network_1.nodeModulesPath);
                const resourcePath = `${actualNodeModulesPath}/${nodeModulePath}`;
                scriptSrc = network_1.FileAccess.asBrowserUri(resourcePath).toString(true);
            }
            const result = AMDModuleImporter.INSTANCE.load(scriptSrc);
            cache.set(nodeModulePath, result);
            return result;
        }
        else {
            return await new Promise((resolve_1, reject_1) => { require([nodeModuleName], resolve_1, reject_1); });
        }
    }
    exports.importAMDNodeModule = importAMDNodeModule;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW1kWC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYW1kWC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBTSxVQUFVO1FBQ2YsWUFDaUIsRUFBNkIsRUFDN0IsWUFBeUMsRUFDekMsUUFBYTtZQUZiLE9BQUUsR0FBRixFQUFFLENBQTJCO1lBQzdCLGlCQUFZLEdBQVosWUFBWSxDQUE2QjtZQUN6QyxhQUFRLEdBQVIsUUFBUSxDQUFLO1FBQzFCLENBQUM7S0FDTDtJQUVELE1BQU0saUJBQWlCO2lCQUNSLGFBQVEsR0FBRyxJQUFJLGlCQUFpQixFQUFFLEFBQTFCLENBQTJCO1FBV2pEO1lBVGlCLGlCQUFZLEdBQUcsQ0FBQyxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyw0QkFBNEIsQ0FBQyxDQUFDO1lBQ3hILGdCQUFXLEdBQUcsT0FBTyxRQUFRLEtBQUssUUFBUSxDQUFDO1lBRTNDLGlCQUFZLEdBQWlCLEVBQUUsQ0FBQztZQUN6QyxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUtiLENBQUM7UUFFVCxXQUFXO1lBQ2xCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN2QixPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBRW5CLFVBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFPLEVBQUUsWUFBaUIsRUFBRSxRQUFhLEVBQUUsRUFBRTtnQkFDeEUsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRLEVBQUUsQ0FBQztvQkFDNUIsUUFBUSxHQUFHLFlBQVksQ0FBQztvQkFDeEIsWUFBWSxHQUFHLEVBQUUsQ0FBQztvQkFDbEIsRUFBRSxHQUFHLElBQUksQ0FBQztnQkFDWCxDQUFDO2dC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