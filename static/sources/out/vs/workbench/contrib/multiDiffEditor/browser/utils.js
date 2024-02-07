/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observable"], function (require, exports, observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ObservableLazyStatefulPromise = exports.PromiseResult = exports.ObservablePromise = exports.ObservableLazy = void 0;
    class ObservableLazy {
        /**
         * The cached value.
         * Does not force a computation of the value.
         */
        get cachedValue() { return this._value; }
        constructor(_computeValue) {
            this._computeValue = _computeValue;
            this._value = (0, observable_1.observableValue)(this, undefined);
        }
        /**
         * Returns the cached value.
         * Computes the value if the value has not been cached yet.
         */
        getValue() {
            let v = this._value.get();
            if (!v) {
                v = this._computeValue();
                this._value.set(v, undefined);
            }
            return v;
        }
    }
    exports.ObservableLazy = ObservableLazy;
    /**
     * A promise whose state is observable.
     */
    class ObservablePromise {
        constructor(promise) {
            this._value = (0, observable_1.observableValue)(this, undefined);
            this.value = this._value;
            this.promise = promise.then(value => {
                this._value.set(new PromiseResult(value, undefined), undefined);
                return value;
            }, error => {
                this._value.set(new PromiseResult(undefined, error), undefined);
                throw error;
            });
        }
    }
    exports.ObservablePromise = ObservablePromise;
    class PromiseResult {
        constructor(
        /**
         * The value of the resolved promise.
         * Undefined if the promise rejected.
         */
        value, 
        /**
         * The error in case of a rejected promise.
         * Undefined if the promise resolved.
         */
        error) {
            this.value = value;
            this.error = error;
        }
        /**
         * Returns the value if the promise resolved, otherwise throws the error.
         */
        getValue() {
            if (this.error) {
                throw this.error;
            }
            return this.value;
        }
    }
    exports.PromiseResult = PromiseResult;
    /**
     * A lazy promise whose state is observable.
     */
    class ObservableLazyStatefulPromise {
        constructor(_computeValue) {
            this._computeValue = _computeValue;
            this._lazyValue = new ObservableLazy(() => new ObservablePromise(this._computeValue()));
            /**
             * Does not enforce evaluation of the promise compute function.
             * Is undefined if the promise has not been computed yet.
             */
            this.cachedValue = (0, observable_1.derived)(this, reader => this._lazyValue.cachedValue.read(reader)?.value.read(reader));
        }
        getValue() {
            return this._lazyValue.getValue().promise;
        }
    }
    exports.ObservableLazyStatefulPromise = ObservableLazyStatefulPromise;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL211bHRpRGlmZkVkaXRvci9icm93c2VyL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyxNQUFhLGNBQWM7UUFHMUI7OztXQUdHO1FBQ0gsSUFBVyxXQUFXLEtBQWlDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFNUUsWUFBNkIsYUFBc0I7WUFBdEIsa0JBQWEsR0FBYixhQUFhLENBQVM7WUFSbEMsV0FBTSxHQUFHLElBQUEsNEJBQWUsRUFBZ0IsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBUzFFLENBQUM7UUFFRDs7O1dBR0c7UUFDSSxRQUFRO1lBQ2QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ1IsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQy9CLENBQUM7WUFDRCxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7S0FDRDtJQXhCRCx3Q0F3QkM7SUFFRDs7T0FFRztJQUNILE1BQWEsaUJBQWlCO1FBTTdCLFlBQVksT0FBbUI7WUFMZCxXQUFNLEdBQUcsSUFBQSw0QkFBZSxFQUErQixJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFHekUsVUFBSyxHQUE4QyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBRzlFLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxhQUFhLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNoRSxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGFBQWEsQ0FBSSxTQUFTLEVBQUUsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ25FLE1BQU0sS0FBSyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUFmRCw4Q0FlQztJQUVELE1BQWEsYUFBYTtRQUN6QjtRQUNDOzs7V0FHRztRQUNhLEtBQW9CO1FBRXBDOzs7V0FHRztRQUNhLEtBQTBCO1lBTjFCLFVBQUssR0FBTCxLQUFLLENBQWU7WUFNcEIsVUFBSyxHQUFMLEtBQUssQ0FBcUI7UUFFM0MsQ0FBQztRQUVEOztXQUVHO1FBQ0ksUUFBUTtZQUNkLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNoQixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDbEIsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDLEtBQU0sQ0FBQztRQUNwQixDQUFDO0tBQ0Q7SUF6QkQsc0NBeUJDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLDZCQUE2QjtRQVN6QyxZQUE2QixhQUErQjtZQUEvQixrQkFBYSxHQUFiLGFBQWEsQ0FBa0I7WUFSM0MsZUFBVSxHQUFHLElBQUksY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVwRzs7O2VBR0c7WUFDYSxnQkFBVyxHQUFHLElBQUEsb0JBQU8sRUFBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBR3BILENBQUM7UUFFTSxRQUFRO1lBQ2QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQztRQUMzQyxDQUFDO0tBQ0Q7SUFmRCxzRUFlQyJ9