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
define(["require", "exports", "vs/base/common/errors", "vs/workbench/services/extensions/common/extensionDescriptionRegistry", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/common/extensions", "vs/platform/log/common/log", "vs/base/common/async"], function (require, exports, errors, extensionDescriptionRegistry_1, extensions_1, extensions_2, log_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsActivator = exports.HostExtension = exports.EmptyExtension = exports.ActivatedExtension = exports.ExtensionActivationTimesBuilder = exports.ExtensionActivationTimes = void 0;
    class ExtensionActivationTimes {
        static { this.NONE = new ExtensionActivationTimes(false, -1, -1, -1); }
        constructor(startup, codeLoadingTime, activateCallTime, activateResolvedTime) {
            this.startup = startup;
            this.codeLoadingTime = codeLoadingTime;
            this.activateCallTime = activateCallTime;
            this.activateResolvedTime = activateResolvedTime;
        }
    }
    exports.ExtensionActivationTimes = ExtensionActivationTimes;
    class ExtensionActivationTimesBuilder {
        constructor(startup) {
            this._startup = startup;
            this._codeLoadingStart = -1;
            this._codeLoadingStop = -1;
            this._activateCallStart = -1;
            this._activateCallStop = -1;
            this._activateResolveStart = -1;
            this._activateResolveStop = -1;
        }
        _delta(start, stop) {
            if (start === -1 || stop === -1) {
                return -1;
            }
            return stop - start;
        }
        build() {
            return new ExtensionActivationTimes(this._startup, this._delta(this._codeLoadingStart, this._codeLoadingStop), this._delta(this._activateCallStart, this._activateCallStop), this._delta(this._activateResolveStart, this._activateResolveStop));
        }
        codeLoadingStart() {
            this._codeLoadingStart = Date.now();
        }
        codeLoadingStop() {
            this._codeLoadingStop = Date.now();
        }
        activateCallStart() {
            this._activateCallStart = Date.now();
        }
        activateCallStop() {
            this._activateCallStop = Date.now();
        }
        activateResolveStart() {
            this._activateResolveStart = Date.now();
        }
        activateResolveStop() {
            this._activateResolveStop = Date.now();
        }
    }
    exports.ExtensionActivationTimesBuilder = ExtensionActivationTimesBuilder;
    class ActivatedExtension {
        constructor(activationFailed, activationFailedError, activationTimes, module, exports, subscriptions) {
            this.activationFailed = activationFailed;
            this.activationFailedError = activationFailedError;
            this.activationTimes = activationTimes;
            this.module = module;
            this.exports = exports;
            this.subscriptions = subscriptions;
        }
    }
    exports.ActivatedExtension = ActivatedExtension;
    class EmptyExtension extends ActivatedExtension {
        constructor(activationTimes) {
            super(false, null, activationTimes, { activate: undefined, deactivate: undefined }, undefined, []);
        }
    }
    exports.EmptyExtension = EmptyExtension;
    class HostExtension extends ActivatedExtension {
        constructor() {
            super(false, null, ExtensionActivationTimes.NONE, { activate: undefined, deactivate: undefined }, undefined, []);
        }
    }
    exports.HostExtension = HostExtension;
    class FailedExtension extends ActivatedExtension {
        constructor(activationError) {
            super(true, activationError, ExtensionActivationTimes.NONE, { activate: undefined, deactivate: undefined }, undefined, []);
        }
    }
    let ExtensionsActivator = class ExtensionsActivator {
        constructor(registry, globalRegistry, host, _logService) {
            this._logService = _logService;
            this._registry = registry;
            this._globalRegistry = globalRegistry;
            this._host = host;
            this._operations = new extensions_1.ExtensionIdentifierMap();
            this._alreadyActivatedEvents = Object.create(null);
        }
        dispose() {
            for (const [_, op] of this._operations) {
                op.dispose();
            }
        }
        async waitForActivatingExtensions() {
            const res = [];
            for (const [_, op] of this._operations) {
                res.push(op.wait());
            }
            await Promise.all(res);
        }
        isActivated(extensionId) {
            const op = this._operations.get(extensionId);
            return Boolean(op && op.value);
        }
        getActivatedExtension(extensionId) {
            const op = this._operations.get(extensionId);
            if (!op || !op.value) {
                throw new Error(`Extension '${extensionId.value}' is not known or not activated`);
            }
            return op.value;
        }
        async activateByEvent(activationEvent, startup) {
            if (this._alreadyActivatedEvents[activationEvent]) {
                return;
            }
            const activateExtensions = this._registry.getExtensionDescriptionsForActivationEvent(activationEvent);
            await this._activateExtensions(activateExtensions.map(e => ({
                id: e.identifier,
                reason: { startup, extensionId: e.identifier, activationEvent }
            })));
            this._alreadyActivatedEvents[activationEvent] = true;
        }
        activateById(extensionId, reason) {
            const desc = this._registry.getExtensionDescription(extensionId);
            if (!desc) {
                throw new Error(`Extension '${extensionId}' is not known`);
            }
            return this._activateExtensions([{ id: desc.identifier, reason }]);
        }
        async _activateExtensions(extensions) {
            const operations = extensions
                .filter((p) => !this.isActivated(p.id))
                .map(ext => this._handleActivationRequest(ext));
            await Promise.all(operations.map(op => op.wait()));
        }
        /**
         * Handle semantics related to dependencies for `currentExtension`.
         * We don't need to worry about dependency loops because they are handled by the registry.
         */
        _handleActivationRequest(currentActivation) {
            if (this._operations.has(currentActivation.id)) {
                return this._operations.get(currentActivation.id);
            }
            if (this._isHostExtension(currentActivation.id)) {
                return this._createAndSaveOperation(currentActivation, null, [], null);
            }
            const currentExtension = this._registry.getExtensionDescription(currentActivation.id);
            if (!currentExtension) {
                // Error condition 0: unknown extension
                const error = new Error(`Cannot activate unknown extension '${currentActivation.id.value}'`);
                const result = this._createAndSaveOperation(currentActivation, null, [], new FailedExtension(error));
                this._host.onExtensionActivationError(currentActivation.id, error, new extensions_2.MissingExtensionDependency(currentActivation.id.value));
                return result;
            }
            const deps = [];
            const depIds = (typeof currentExtension.extensionDependencies === 'undefined' ? [] : currentExtension.extensionDependencies);
            for (const depId of depIds) {
                if (this._isResolvedExtension(depId)) {
                    // This dependency is already resolved
                    continue;
                }
                const dep = this._operations.get(depId);
                if (dep) {
                    deps.push(dep);
                    continue;
                }
                if (this._isHostExtension(depId)) {
                    // must first wait for the dependency to activate
                    deps.push(this._handleActivationRequest({
                        id: this._globalRegistry.getExtensionDescription(depId).identifier,
                        reason: currentActivation.reason
                    }));
                    continue;
                }
                const depDesc = this._registry.getExtensionDescription(depId);
                if (depDesc) {
                    if (!depDesc.main && !depDesc.browser) {
                        // this dependency does not need to activate because it is descriptive only
                        continue;
                    }
                    // must first wait for the dependency to activate
                    deps.push(this._handleActivationRequest({
                        id: depDesc.identifier,
                        reason: currentActivation.reason
                    }));
                    continue;
                }
                // Error condition 1: unknown dependency
                const currentExtensionFriendlyName = currentExtension.displayName || currentExtension.identifier.value;
                const error = new Error(`Cannot activate the '${currentExtensionFriendlyName}' extension because it depends on unknown extension '${depId}'`);
                const result = this._createAndSaveOperation(currentActivation, currentExtension.displayName, [], new FailedExtension(error));
                this._host.onExtensionActivationError(currentExtension.identifier, error, new extensions_2.MissingExtensionDependency(depId));
                return result;
            }
            return this._createAndSaveOperation(currentActivation, currentExtension.displayName, deps, null);
        }
        _createAndSaveOperation(activation, displayName, deps, value) {
            const operation = new ActivationOperation(activation.id, displayName, activation.reason, deps, value, this._host, this._logService);
            this._operations.set(activation.id, operation);
            return operation;
        }
        _isHostExtension(extensionId) {
            return extensionDescriptionRegistry_1.ExtensionDescriptionRegistry.isHostExtension(extensionId, this._registry, this._globalRegistry);
        }
        _isResolvedExtension(extensionId) {
            const extensionDescription = this._globalRegistry.getExtensionDescription(extensionId);
            if (!extensionDescription) {
                // unknown extension
                return false;
            }
            return (!extensionDescription.main && !extensionDescription.browser);
        }
    };
    exports.ExtensionsActivator = ExtensionsActivator;
    exports.ExtensionsActivator = ExtensionsActivator = __decorate([
        __param(3, log_1.ILogService)
    ], ExtensionsActivator);
    let ActivationOperation = class ActivationOperation {
        get value() {
            return this._value;
        }
        get friendlyName() {
            return this._displayName || this._id.value;
        }
        constructor(_id, _displayName, _reason, _deps, _value, _host, _logService) {
            this._id = _id;
            this._displayName = _displayName;
            this._reason = _reason;
            this._deps = _deps;
            this._value = _value;
            this._host = _host;
            this._logService = _logService;
            this._barrier = new async_1.Barrier();
            this._isDisposed = false;
            this._initialize();
        }
        dispose() {
            this._isDisposed = true;
        }
        wait() {
            return this._barrier.wait();
        }
        async _initialize() {
            await this._waitForDepsThenActivate();
            this._barrier.open();
        }
        async _waitForDepsThenActivate() {
            if (this._value) {
                // this operation is already finished
                return;
            }
            while (this._deps.length > 0) {
                // remove completed deps
                for (let i = 0; i < this._deps.length; i++) {
                    const dep = this._deps[i];
                    if (dep.value && !dep.value.activationFailed) {
                        // the dependency is already activated OK
                        this._deps.splice(i, 1);
                        i--;
                        continue;
                    }
                    if (dep.value && dep.value.activationFailed) {
                        // Error condition 2: a dependency has already failed activation
                        const error = new Error(`Cannot activate the '${this.friendlyName}' extension because its dependency '${dep.friendlyName}' failed to activate`);
                        error.detail = dep.value.activationFailedError;
                        this._value = new FailedExtension(error);
                        this._host.onExtensionActivationError(this._id, error, null);
                        return;
                    }
                }
                if (this._deps.length > 0) {
                    // wait for one dependency
                    await Promise.race(this._deps.map(dep => dep.wait()));
                }
            }
            await this._activate();
        }
        async _activate() {
            try {
                this._value = await this._host.actualActivateExtension(this._id, this._reason);
            }
            catch (err) {
                const error = new Error();
                if (err && err.name) {
                    error.name = err.name;
                }
                if (err && err.message) {
                    error.message = `Activating extension '${this._id.value}' failed: ${err.message}.`;
                }
                else {
                    error.message = `Activating extension '${this._id.value}' failed: ${err}.`;
                }
                if (err && err.stack) {
                    error.stack = err.stack;
                }
                // Treat the extension as being empty
                this._value = new FailedExtension(error);
                if (this._isDisposed && errors.isCancellationError(err)) {
                    // It is expected for ongoing activations to fail if the extension host is going down
                    // So simply ignore and don't log canceled errors in this case
                    return;
                }
                this._host.onExtensionActivationError(this._id, error, null);
                this._logService.error(`Activating extension ${this._id.value} failed due to an error:`);
                this._logService.error(err);
            }
        }
    };
    ActivationOperation = __decorate([
        __param(6, log_1.ILogService)
    ], ActivationOperation);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEV4dGVuc2lvbkFjdGl2YXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdEV4dGVuc2lvbkFjdGl2YXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpQ2hHLE1BQWEsd0JBQXdCO2lCQUViLFNBQUksR0FBRyxJQUFJLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBTzlFLFlBQVksT0FBZ0IsRUFBRSxlQUF1QixFQUFFLGdCQUF3QixFQUFFLG9CQUE0QjtZQUM1RyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztZQUN2QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7WUFDekMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDO1FBQ2xELENBQUM7O0lBZEYsNERBZUM7SUFFRCxNQUFhLCtCQUErQjtRQVUzQyxZQUFZLE9BQWdCO1lBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLENB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