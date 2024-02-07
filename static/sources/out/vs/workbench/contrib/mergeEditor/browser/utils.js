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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/platform/storage/common/storage"], function (require, exports, arrays_1, errors_1, lifecycle_1, observable_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.observableConfigValue = exports.PersistentStore = exports.deepMerge = exports.setFields = exports.thenIfNotDisposed = exports.elementAtOrUndefined = exports.concatArrays = exports.join = exports.leftJoin = exports.applyObservableDecorations = exports.setStyle = exports.ReentrancyBarrier = void 0;
    class ReentrancyBarrier {
        constructor() {
            this._isActive = false;
        }
        get isActive() {
            return this._isActive;
        }
        makeExclusive(fn) {
            return ((...args) => {
                if (this._isActive) {
                    return;
                }
                this._isActive = true;
                try {
                    return fn(...args);
                }
                finally {
                    this._isActive = false;
                }
            });
        }
        runExclusively(fn) {
            if (this._isActive) {
                return;
            }
            this._isActive = true;
            try {
                fn();
            }
            finally {
                this._isActive = false;
            }
        }
        runExclusivelyOrThrow(fn) {
            if (this._isActive) {
                throw new errors_1.BugIndicatingError();
            }
            this._isActive = true;
            try {
                fn();
            }
            finally {
                this._isActive = false;
            }
        }
    }
    exports.ReentrancyBarrier = ReentrancyBarrier;
    function setStyle(element, style) {
        Object.entries(style).forEach(([key, value]) => {
            element.style.setProperty(key, toSize(value));
        });
    }
    exports.setStyle = setStyle;
    function toSize(value) {
        return typeof value === 'number' ? `${value}px` : value;
    }
    function applyObservableDecorations(editor, decorations) {
        const d = new lifecycle_1.DisposableStore();
        let decorationIds = [];
        d.add((0, observable_1.autorunOpts)({ debugName: () => `Apply decorations from ${decorations.debugName}` }, reader => {
            const d = decorations.read(reader);
            editor.changeDecorations(a => {
                decorationIds = a.deltaDecorations(decorationIds, d);
            });
        }));
        d.add({
            dispose: () => {
                editor.changeDecorations(a => {
                    decorationIds = a.deltaDecorations(decorationIds, []);
                });
            }
        });
        return d;
    }
    exports.applyObservableDecorations = applyObservableDecorations;
    function* leftJoin(left, right, compare) {
        const rightQueue = new arrays_1.ArrayQueue(right);
        for (const leftElement of left) {
            rightQueue.takeWhile(rightElement => arrays_1.CompareResult.isGreaterThan(compare(leftElement, rightElement)));
            const equals = rightQueue.takeWhile(rightElement => arrays_1.CompareResult.isNeitherLessOrGreaterThan(compare(leftElement, rightElement)));
            yield { left: leftElement, rights: equals || [] };
        }
    }
    exports.leftJoin = leftJoin;
    function* join(left, right, compare) {
        const rightQueue = new arrays_1.ArrayQueue(right);
        for (const leftElement of left) {
            const skipped = rightQueue.takeWhile(rightElement => arrays_1.CompareResult.isGreaterThan(compare(leftElement, rightElement)));
            if (skipped) {
                yield { rights: skipped };
            }
            const equals = rightQueue.takeWhile(rightElement => arrays_1.CompareResult.isNeitherLessOrGreaterThan(compare(leftElement, rightElement)));
            yield { left: leftElement, rights: equals || [] };
        }
    }
    exports.join = join;
    function concatArrays(...arrays) {
        return [].concat(...arrays);
    }
    exports.concatArrays = concatArrays;
    function elementAtOrUndefined(arr, index) {
        return arr[index];
    }
    exports.elementAtOrUndefined = elementAtOrUndefined;
    function thenIfNotDisposed(promise, then) {
        let disposed = false;
        promise.then(() => {
            if (disposed) {
                return;
            }
            then();
        });
        return (0, lifecycle_1.toDisposable)(() => {
            disposed = true;
        });
    }
    exports.thenIfNotDisposed = thenIfNotDisposed;
    function setFields(obj, fields) {
        return Object.assign(obj, fields);
    }
    exports.setFields = setFields;
    function deepMerge(source1, source2) {
        const result = {};
        for (const key in source1) {
            result[key] = source1[key];
        }
        for (const key in source2) {
            const source2Value = source2[key];
            if (typeof result[key] === 'object' && source2Value && typeof source2Value === 'object') {
                result[key] = deepMerge(result[key], source2Value);
            }
            else {
                result[key] = source2Value;
            }
        }
        return result;
    }
    exports.deepMerge = deepMerge;
    let PersistentStore = class PersistentStore {
        constructor(key, storageService) {
            this.key = key;
            this.storageService = storageService;
            this.hasValue = false;
            this.value = undefined;
        }
        get() {
            if (!this.hasValue) {
                const value = this.storageService.get(this.key, 0 /* StorageScope.PROFILE */);
                if (value !== undefined) {
                    try {
                        this.value = JSON.parse(value);
                    }
                    catch (e) {
                        (0, errors_1.onUnexpectedError)(e);
                    }
                }
                this.hasValue = true;
            }
            return this.value;
        }
        set(newValue) {
            this.value = newValue;
            this.storageService.store(this.key, JSON.stringify(this.value), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    exports.PersistentStore = PersistentStore;
    exports.PersistentStore = PersistentStore = __decorate([
        __param(1, storage_1.IStorageService)
    ], PersistentStore);
    function observableConfigValue(key, defaultValue, configurationService) {
        return (0, observable_1.observableFromEvent)((handleChange) => configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(key)) {
                handleChange(e);
            }
        }), () => configurationService.getValue(key) ?? defaultValue);
    }
    exports.observableConfigValue = observableConfigValue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2Jyb3dzZXIvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV2hHLE1BQWEsaUJBQWlCO1FBQTlCO1lBQ1MsY0FBUyxHQUFHLEtBQUssQ0FBQztRQTJDM0IsQ0FBQztRQXpDQSxJQUFXLFFBQVE7WUFDbEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxhQUFhLENBQTZCLEVBQWE7WUFDN0QsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtnQkFDMUIsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ3BCLE9BQU87Z0JBQ1IsQ0FBQztnQkFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDdEIsSUFBSSxDQUFDO29CQUNKLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7d0JBQVMsQ0FBQztvQkFDVixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztnQkFDeEIsQ0FBQztZQUNGLENBQUMsQ0FBUSxDQUFDO1FBQ1gsQ0FBQztRQUVNLGNBQWMsQ0FBQyxFQUFjO1lBQ25DLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNwQixPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLElBQUksQ0FBQztnQkFDSixFQUFFLEVBQUUsQ0FBQztZQUNOLENBQUM7b0JBQVMsQ0FBQztnQkFDVixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN4QixDQUFDO1FBQ0YsQ0FBQztRQUVNLHFCQUFxQixDQUFDLEVBQWM7WUFDMUMsSUFBSSxJ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