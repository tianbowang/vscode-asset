/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/trustedTypes", "vs/base/common/errors", "vs/base/common/network", "vs/base/common/worker/simpleWorker", "vs/base/common/lifecycle"], function (require, exports, trustedTypes_1, errors_1, network_1, simpleWorker_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultWorkerFactory = exports.getWorkerBootstrapUrl = exports.createBlobWorker = void 0;
    const ttPolicy = (0, trustedTypes_1.createTrustedTypesPolicy)('defaultWorkerFactory', { createScriptURL: value => value });
    function createBlobWorker(blobUrl, options) {
        if (!blobUrl.startsWith('blob:')) {
            throw new URIError('Not a blob-url: ' + blobUrl);
        }
        return new Worker(ttPolicy ? ttPolicy.createScriptURL(blobUrl) : blobUrl, options);
    }
    exports.createBlobWorker = createBlobWorker;
    function getWorker(label) {
        const monacoEnvironment = globalThis.MonacoEnvironment;
        if (monacoEnvironment) {
            if (typeof monacoEnvironment.getWorker === 'function') {
                return monacoEnvironment.getWorker('workerMain.js', label);
            }
            if (typeof monacoEnvironment.getWorkerUrl === 'function') {
                const workerUrl = monacoEnvironment.getWorkerUrl('workerMain.js', label);
                return new Worker(ttPolicy ? ttPolicy.createScriptURL(workerUrl) : workerUrl, { name: label });
            }
        }
        // ESM-comment-begin
        if (typeof require === 'function') {
            // check if the JS lives on a different origin
            const workerMain = require.toUrl('vs/base/worker/workerMain.js'); // explicitly using require.toUrl(), see https://github.com/microsoft/vscode/issues/107440#issuecomment-698982321
            const workerUrl = getWorkerBootstrapUrl(workerMain, label);
            return new Worker(ttPolicy ? ttPolicy.createScriptURL(workerUrl) : workerUrl, { name: label });
        }
        // ESM-comment-end
        throw new Error(`You must define a function MonacoEnvironment.getWorkerUrl or MonacoEnvironment.getWorker`);
    }
    // ESM-comment-begin
    function getWorkerBootstrapUrl(scriptPath, label) {
        if (/^((http:)|(https:)|(file:))/.test(scriptPath) && scriptPath.substring(0, globalThis.origin.length) !== globalThis.origin) {
            // this is the cross-origin case
            // i.e. the webpage is running at a different origin than where the scripts are loaded from
            const myPath = 'vs/base/worker/defaultWorkerFactory.js';
            const workerBaseUrl = require.toUrl(myPath).slice(0, -myPath.length); // explicitly using require.toUrl(), see https://github.com/microsoft/vscode/issues/107440#issuecomment-698982321
            const js = `/*${label}*/globalThis.MonacoEnvironment={baseUrl: '${workerBaseUrl}'};const ttPolicy = globalThis.trustedTypes?.createPolicy('defaultWorkerFactory', { createScriptURL: value => value });importScripts(ttPolicy?.createScriptURL('${scriptPath}') ?? '${scriptPath}');/*${label}*/`;
            const blob = new Blob([js], { type: 'application/javascript' });
            return URL.createObjectURL(blob);
        }
        const start = scriptPath.lastIndexOf('?');
        const end = scriptPath.lastIndexOf('#', start);
        const params = start > 0
            ? new URLSearchParams(scriptPath.substring(start + 1, ~end ? end : undefined))
            : new URLSearchParams();
        network_1.COI.addSearchParam(params, true, true);
        const search = params.toString();
        if (!search) {
            return `${scriptPath}#${label}`;
        }
        else {
            return `${scriptPath}?${params.toString()}#${label}`;
        }
    }
    exports.getWorkerBootstrapUrl = getWorkerBootstrapUrl;
    // ESM-comment-end
    function isPromiseLike(obj) {
        if (typeof obj.then === 'function') {
            return true;
        }
        return false;
    }
    /**
     * A worker that uses HTML5 web workers so that is has
     * its own global scope and its own thread.
     */
    class WebWorker extends lifecycle_1.Disposable {
        constructor(moduleId, id, label, onMessageCallback, onErrorCallback) {
            super();
            this.id = id;
            this.label = label;
            const workerOrPromise = getWorker(label);
            if (isPromiseLike(workerOrPromise)) {
                this.worker = workerOrPromise;
            }
            else {
                this.worker = Promise.resolve(workerOrPromise);
            }
            this.postMessage(moduleId, []);
            this.worker.then((w) => {
                w.onmessage = function (ev) {
                    onMessageCallback(ev.data);
                };
                w.onmessageerror = onErrorCallback;
                if (typeof w.addEventListener === 'function') {
                    w.addEventListener('error', onErrorCallback);
                }
            });
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.worker?.then(w => {
                    w.onmessage = null;
                    w.onmessageerror = null;
                    w.removeEventListener('error', onErrorCallback);
                    w.terminate();
                });
                this.worker = null;
            }));
        }
        getId() {
            return this.id;
        }
        postMessage(message, transfer) {
            this.worker?.then(w => {
                try {
                    w.postMessage(message, transfer);
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                    (0, errors_1.onUnexpectedError)(new Error(`FAILED to post message to '${this.label}'-worker`, { cause: err }));
                }
            });
        }
    }
    class DefaultWorkerFactory {
        static { this.LAST_WORKER_ID = 0; }
        constructor(label) {
            this._label = label;
            this._webWorkerFailedBeforeError = false;
        }
        create(moduleId, onMessageCallback, onErrorCallback) {
            const workerId = (++DefaultWorkerFactory.LAST_WORKER_ID);
            if (this._webWorkerFailedBeforeError) {
                throw this._webWorkerFailedBeforeError;
            }
            return new WebWorker(moduleId, workerId, this._label || 'anonymous' + workerId, onMessageCallback, (err) => {
                (0, simpleWorker_1.logOnceWebWorkerWarning)(err);
                this._webWorkerFailedBeforeError = err;
                onErrorCallback(err);
            });
        }
    }
    exports.DefaultWorkerFactory = DefaultWorkerFactory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdFdvcmtlckZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci9kZWZhdWx0V29ya2VyRmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBTSxRQUFRLEdBQUcsSUFBQSx1Q0FBd0IsRUFBQyxzQkFBc0IsRUFBRSxFQUFFLGVBQWUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFFdkcsU0FBZ0IsZ0JBQWdCLENBQUMsT0FBZSxFQUFFLE9BQXVCO1FBQ3hFLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDbEMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBQ0QsT0FBTyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFzQixDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDekcsQ0FBQztJQUxELDRDQUtDO0lBRUQsU0FBUyxTQUFTLENBQUMsS0FBYTtRQU0vQixNQUFNLGlCQUFpQixHQUFvQyxVQUFrQixDQUFDLGlCQUFpQixDQUFDO1FBQ2hHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztZQUN2QixJQUFJLE9BQU8saUJBQWlCLENBQUMsU0FBUyxLQUFLLFVBQVUsRUFBRSxDQUFDO2dCQUN2RCxPQUFPLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDNUQsQ0FBQztZQUNELElBQUksT0FBTyxpQkFBaUIsQ0FBQyxZQUFZLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQzFELE1BQU0sU0FBUyxHQUFHLGlC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