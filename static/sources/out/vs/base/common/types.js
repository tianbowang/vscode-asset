/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateConstraint = exports.validateConstraints = exports.areFunctions = exports.isFunction = exports.isEmptyObject = exports.assertAllDefined = exports.assertIsDefined = exports.assertType = exports.isUndefinedOrNull = exports.isDefined = exports.isUndefined = exports.isBoolean = exports.isIterable = exports.isNumber = exports.isTypedArray = exports.isObject = exports.isStringArray = exports.isString = void 0;
    /**
     * @returns whether the provided parameter is a JavaScript String or not.
     */
    function isString(str) {
        return (typeof str === 'string');
    }
    exports.isString = isString;
    /**
     * @returns whether the provided parameter is a JavaScript Array and each element in the array is a string.
     */
    function isStringArray(value) {
        return Array.isArray(value) && value.every(elem => isString(elem));
    }
    exports.isStringArray = isStringArray;
    /**
     * @returns whether the provided parameter is of type `object` but **not**
     *	`null`, an `array`, a `regexp`, nor a `date`.
     */
    function isObject(obj) {
        // The method can't do a type cast since there are type (like strings) which
        // are subclasses of any put not positvely matched by the function. Hence type
        // narrowing results in wrong results.
        return typeof obj === 'object'
            && obj !== null
            && !Array.isArray(obj)
            && !(obj instanceof RegExp)
            && !(obj instanceof Date);
    }
    exports.isObject = isObject;
    /**
     * @returns whether the provided parameter is of type `Buffer` or Uint8Array dervived type
     */
    function isTypedArray(obj) {
        const TypedArray = Object.getPrototypeOf(Uint8Array);
        return typeof obj === 'object'
            && obj instanceof TypedArray;
    }
    exports.isTypedArray = isTypedArray;
    /**
     * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
     * @returns whether the provided parameter is a JavaScript Number or not.
     */
    function isNumber(obj) {
        return (typeof obj === 'number' && !isNaN(obj));
    }
    exports.isNumber = isNumber;
    /**
     * @returns whether the provided parameter is an Iterable, casting to the given generic
     */
    function isIterable(obj) {
        return !!obj && typeof obj[Symbol.iterator] === 'function';
    }
    exports.isIterable = isIterable;
    /**
     * @returns whether the provided parameter is a JavaScript Boolean or not.
     */
    function isBoolean(obj) {
        return (obj === true || obj === false);
    }
    exports.isBoolean = isBoolean;
    /**
     * @returns whether the provided parameter is undefined.
     */
    function isUndefined(obj) {
        return (typeof obj === 'undefined');
    }
    exports.isUndefined = isUndefined;
    /**
     * @returns whether the provided parameter is defined.
     */
    function isDefined(arg) {
        return !isUndefinedOrNull(arg);
    }
    exports.isDefined = isDefined;
    /**
     * @returns whether the provided parameter is undefined or null.
     */
    function isUndefinedOrNull(obj) {
        return (isUndefined(obj) || obj === null);
    }
    exports.isUndefinedOrNull = isUndefinedOrNull;
    function assertType(condition, type) {
        if (!condition) {
            throw new Error(type ? `Unexpected type, expected '${type}'` : 'Unexpected type');
        }
    }
    exports.assertType = assertType;
    /**
     * Asserts that the argument passed in is neither undefined nor null.
     */
    function assertIsDefined(arg) {
        if (isUndefinedOrNull(arg)) {
            throw new Error('Assertion Failed: argument is undefined or null');
        }
        return arg;
    }
    exports.assertIsDefined = assertIsDefined;
    function assertAllDefined(...args) {
        const result = [];
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (isUndefinedOrNull(arg)) {
                throw new Error(`Assertion Failed: argument at index ${i} is undefined or null`);
            }
            result.push(arg);
        }
        return result;
    }
    exports.assertAllDefined = assertAllDefined;
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    /**
     * @returns whether the provided parameter is an empty JavaScript Object or not.
     */
    function isEmptyObject(obj) {
        if (!isObject(obj)) {
            return false;
        }
        for (const key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    exports.isEmptyObject = isEmptyObject;
    /**
     * @returns whether the provided parameter is a JavaScript Function or not.
     */
    function isFunction(obj) {
        return (typeof obj === 'function');
    }
    exports.isFunction = isFunction;
    /**
     * @returns whether the provided parameters is are JavaScript Function or not.
     */
    function areFunctions(...objects) {
        return objects.length > 0 && objects.every(isFunction);
    }
    exports.areFunctions = areFunctions;
    function validateConstraints(args, constraints) {
        const len = Math.min(args.length, constraints.length);
        for (let i = 0; i < len; i++) {
            validateConstraint(args[i], constraints[i]);
        }
    }
    exports.validateConstraints = validateConstraints;
    function validateConstraint(arg, constraint) {
        if (isString(constraint)) {
            if (typeof arg !== constraint) {
                throw new Error(`argument does not match constraint: typeof ${constraint}`);
            }
        }
        else if (isFunction(constraint)) {
            try {
                if (arg instanceof constraint) {
                    return;
                }
            }
            catch {
                // ignore
            }
            if (!isUndefinedOrNull(arg) && arg.constructor === constraint) {
                return;
            }
            if (constraint.length === 1 && constraint.call(undefined, arg) === true) {
                return;
            }
            throw new Error(`argument does not match one of these constraints: arg instanceof constraint, arg.constructor === constraint, nor constraint(arg) === true`);
        }
    }
    exports.validateConstraint = validateConstraint;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL3R5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUVoRzs7T0FFRztJQUNILFNBQWdCLFFBQVEsQ0FBQyxHQUFZO1FBQ3BDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRkQsNEJBRUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLGFBQWEsQ0FBQyxLQUFjO1FBQzNDLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBZ0IsS0FBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFGRCxzQ0FFQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLFFBQVEsQ0FBQyxHQUFZO1FBQ3BDLDRFQUE0RTtRQUM1RSw4RUFBOEU7UUFDOUUsc0NBQXNDO1FBQ3RDLE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUTtlQUMxQixHQUFHLEtBQUssSUFBSTtlQUNaLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7ZUFDbkIsQ0FBQyxDQUFDLEdBQUcsWUFBWSxNQUFNLENBQUM7ZUFDeEIsQ0FBQyxDQUFDLEdBQUcsWUFBWSxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBVEQsNEJBU0M7SUFFRDs7T0FFRztJQUNILFNBQWdCLFlBQVksQ0FBQyxHQUFZO1FBQ3hDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckQsT0FBTyxPQUFPLEdBQUcsS0FBSyxRQUFRO2VBQzFCLEdBQUcsWUFBWSxVQUFVLENBQUM7SUFDL0IsQ0FBQztJQUpELG9DQUlDO0lBRUQ7OztPQUdH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