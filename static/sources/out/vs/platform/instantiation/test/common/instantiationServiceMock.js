/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "sinon", "vs/base/common/lifecycle", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection"], function (require, exports, sinon, lifecycle_1, descriptors_1, instantiationService_1, serviceCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createServices = exports.TestInstantiationService = void 0;
    const isSinonSpyLike = (fn) => fn && 'callCount' in fn;
    class TestInstantiationService extends instantiationService_1.InstantiationService {
        constructor(_serviceCollection = new serviceCollection_1.ServiceCollection(), strict = false, parent) {
            super(_serviceCollection, strict, parent);
            this._serviceCollection = _serviceCollection;
            this._servciesMap = new Map();
        }
        get(service) {
            return super._getOrCreateServiceInstance(service, instantiationService_1.Trace.traceCreation(false, TestInstantiationService));
        }
        set(service, instance) {
            return this._serviceCollection.set(service, instance);
        }
        mock(service) {
            return this._create(service, { mock: true });
        }
        stub(serviceIdentifier, arg2, arg3, arg4) {
            const service = typeof arg2 !== 'string' ? arg2 : undefined;
            const serviceMock = { id: serviceIdentifier, service: service };
            const property = typeof arg2 === 'string' ? arg2 : arg3;
            const value = typeof arg2 === 'string' ? arg3 : arg4;
            const stubObject = this._create(serviceMock, { stub: true }, service && !property);
            if (property) {
                if (stubObject[property]) {
                    if (stubObject[property].hasOwnProperty('restore')) {
                        stubObject[property].restore();
                    }
                    if (typeof value === 'function') {
                        const spy = isSinonSpyLike(value) ? value : sinon.spy(value);
                        stubObject[property] = spy;
                        return spy;
                    }
                    else {
                        const stub = value ? sinon.stub().returns(value) : sinon.stub();
                        stubObject[property] = stub;
                        return stub;
                    }
                }
                else {
                    stubObject[property] = value;
                }
            }
            return stubObject;
        }
        stubPromise(arg1, arg2, arg3, arg4) {
            arg3 = typeof arg2 === 'string' ? Promise.resolve(arg3) : arg3;
            arg4 = typeof arg2 !== 'string' && typeof arg3 === 'string' ? Promise.resolve(arg4) : arg4;
            return this.stub(arg1, arg2, arg3, arg4);
        }
        spy(service, fnProperty) {
            const spy = sinon.spy();
            this.stub(service, fnProperty, spy);
            return spy;
        }
        _create(arg1, options, reset = false) {
            if (this.isServiceMock(arg1)) {
                const service = this._getOrCreateService(arg1, options, reset);
                this._serviceCollection.set(arg1.id, service);
                return service;
            }
            return options.mock ? sinon.mock(arg1) : this._createStub(arg1);
        }
        _getOrCreateService(serviceMock, opts, reset) {
            const service = this._serviceCollection.get(serviceMock.id);
            if (!reset && service) {
                if (opts.mock && service['sinonOptions'] && !!service['sinonOptions'].mock) {
                    return service;
                }
                if (opts.stub && service['sinonOptions'] && !!service['sinonOptions'].stub) {
                    return service;
                }
            }
            return this._createService(serviceMock, opts);
        }
        _createService(serviceMock, opts) {
            serviceMock.service = serviceMock.service ? serviceMock.service : this._servciesMap.get(serviceMock.id);
            const service = opts.mock ? sinon.mock(serviceMock.service) : this._createStub(serviceMock.service);
            service['sinonOptions'] = opts;
            return service;
        }
        _createStub(arg) {
            return typeof arg === 'object' ? arg : sinon.createStubInstance(arg);
        }
        isServiceMock(arg1) {
            return typeof arg1 === 'object' && arg1.hasOwnProperty('id');
        }
        createChild(services) {
            return new TestInstantiationService(services, false, this);
        }
        dispose() {
            sinon.restore();
        }
    }
    exports.TestInstantiationService = TestInstantiationService;
    function createServices(disposables, services) {
        const serviceIdentifiers = [];
        const serviceCollection = new serviceCollection_1.ServiceCollection();
        const define = (id, ctorOrInstance) => {
            if (!serviceCollection.has(id)) {
                if (typeof ctorOrInstance === 'function') {
                    serviceCollection.set(id, new descriptors_1.SyncDescriptor(ctorOrInstance));
                }
                else {
                    serviceCollection.set(id, ctorOrInstance);
                }
            }
            serviceIdentifiers.push(id);
        };
        for (const [id, ctor] of services) {
            define(id, ctor);
        }
        const instantiationService = disposables.add(new TestInstantiationService(serviceCollection, true));
        disposables.add((0, lifecycle_1.toDisposable)(() => {
            for (const id of serviceIdentifiers) {
                const instanceOrDescriptor = serviceCollection.get(id);
                if (typeof instanceOrDescriptor.dispose === 'function') {
                    instanceOrDescriptor.dispose();
                }
            }
        }));
        return instantiationService;
    }
    exports.createServices = createServices;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFudGlhdGlvblNlcnZpY2VNb2NrLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9pbnN0YW50aWF0aW9uL3Rlc3QvY29tbW9uL2luc3RhbnRpYXRpb25TZXJ2aWNlTW9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBTSxjQUFjLEdBQUcsQ0FBQyxFQUFZLEVBQXdCLEVBQUUsQ0FBQyxFQUFFLElBQUksV0FBVyxJQUFJLEVBQUUsQ0FBQztJQUV2RixNQUFhLHdCQUF5QixTQUFRLDJDQUFvQjtRQUlqRSxZQUFvQixxQkFBd0MsSUFBSSxxQ0FBaUIsRUFBRSxFQUFFLFNBQWtCLEtBQUssRUFBRSxNQUFpQztZQUM5SSxLQUFLLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRHZCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBNkM7WUFHbEYsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBK0IsQ0FBQztRQUM1RCxDQUFDO1FBRU0sR0FBRyxDQUFJLE9BQTZCO1lBQzFDLE9BQU8sS0FBSyxDQUFDLDJCQUEyQixDQUFDLE9BQU8sRUFBRSw0QkFBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1FBQ3pHLENBQUM7UUFFTSxHQUFHLENBQUksT0FBNkIsRUFBRSxRQUFXO1lBQ3ZELE9BQVUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVNLElBQUksQ0FBSSxPQUE2QjtZQUMzQyxPQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQU9NLElBQUksQ0FB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