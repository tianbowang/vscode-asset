/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/types"], function (require, exports, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.verifyObject = exports.ObjectVerifier = exports.EnumVerifier = exports.SetVerifier = exports.NumberVerifier = exports.BooleanVerifier = void 0;
    class Verifier {
        constructor(defaultValue) {
            this.defaultValue = defaultValue;
        }
        verify(value) {
            if (!this.isType(value)) {
                return this.defaultValue;
            }
            return value;
        }
    }
    class BooleanVerifier extends Verifier {
        isType(value) {
            return typeof value === 'boolean';
        }
    }
    exports.BooleanVerifier = BooleanVerifier;
    class NumberVerifier extends Verifier {
        isType(value) {
            return typeof value === 'number';
        }
    }
    exports.NumberVerifier = NumberVerifier;
    class SetVerifier extends Verifier {
        isType(value) {
            return value instanceof Set;
        }
    }
    exports.SetVerifier = SetVerifier;
    class EnumVerifier extends Verifier {
        constructor(defaultValue, allowedValues) {
            super(defaultValue);
            this.allowedValues = allowedValues;
        }
        isType(value) {
            return this.allowedValues.includes(value);
        }
    }
    exports.EnumVerifier = EnumVerifier;
    class ObjectVerifier extends Verifier {
        constructor(defaultValue, verifier) {
            super(defaultValue);
            this.verifier = verifier;
        }
        verify(value) {
            if (!this.isType(value)) {
                return this.defaultValue;
            }
            return verifyObject(this.verifier, value);
        }
        isType(value) {
            return (0, types_1.isObject)(value);
        }
    }
    exports.ObjectVerifier = ObjectVerifier;
    function verifyObject(verifiers, value) {
        const result = Object.create(null);
        for (const key in verifiers) {
            if (Object.hasOwnProperty.call(verifiers, key)) {
                const verifier = verifiers[key];
                result[key] = verifier.verify(value[key]);
            }
        }
        return result;
    }
    exports.verifyObject = verifyObject;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZpZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL3ZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxNQUFlLFFBQVE7UUFFdEIsWUFBK0IsWUFBZTtZQUFmLGlCQUFZLEdBQVosWUFBWSxDQUFHO1FBQUksQ0FBQztRQUVuRCxNQUFNLENBQUMsS0FBYztZQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN6QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDMUIsQ0FBQztZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztLQUdEO0lBRUQsTUFBYSxlQUFnQixTQUFRLFFBQWlCO1FBQzNDLE1BQU0sQ0FBQyxLQUFjO1lBQzlCLE9BQU8sT0FBTyxLQUFLLEtBQUssU0FBUyxDQUFDO1FBQ25DLENBQUM7S0FDRDtJQUpELDBDQUlDO0lBRUQsTUFBYSxjQUFlLFNBQVEsUUFBZ0I7UUFDekMsTUFBTSxDQUFDLEtBQWM7WUFDOUIsT0FBTyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUM7UUFDbEMsQ0FBQztLQUNEO0lBSkQsd0NBSUM7SUFFRCxNQUFhLFdBQWUsU0FBUSxRQUFnQjtRQUN6QyxNQUFNLENBQUMsS0FBYztZQUM5QixPQUFPLEtBQUssWUFBWSxHQUFHLENBQUM7UUFDN0IsQ0FBQztLQUNEO0lBSkQsa0NBSUM7SUFFRCxNQUFhLFlBQWdCLFNBQVEsUUFBVztRQUcvQyxZQUFZLFlBQWUsRUFBRSxhQUErQjtZQUMzRCxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDcEMsQ0FBQztRQUVTLE1BQU0sQ0FBQyxLQUFjO1lBQzlCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBVSxDQUFDLENBQUM7UUFDaEQsQ0FBQztLQUNEO0lBWEQsb0NBV0M7SUFFRCxNQUFhLGNBQWlDLFNBQVEsUUFBVztRQUVoRSxZQUFZLFlBQWUsRUFBbUIsUUFBNkM7WUFDMUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRHlCLGFBQVEsR0FBUixRQUFRLENBQXFDO1FBRTNGLENBQUM7UUFFUSxNQUFNLENBQUMsS0FBYztZQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN6QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDMUIsQ0FBQztZQUNELE9BQU8sWUFBWSxDQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVTLE1BQU0sQ0FBQyxLQUFjO1lBQzlCLE9BQU8sSUFBQSxnQkFBUSxFQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLENBQUM7S0FDRDtJQWhCRCx3Q0FnQkM7SUFFRCxTQUFnQixZQUFZLENBQW1CLFNBQThDLEVBQUUsS0FBYTtRQUMzRyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRW5DLEtBQUssTUFBTSxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7WUFDN0IsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDaEQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBRSxLQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNwRCxDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQVhELG9DQVdDIn0=