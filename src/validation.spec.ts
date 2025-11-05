import { describe, it, expect } from 'vitest';
import {
    throwIfNegative,
    throwIfNotInKeys,
    throwIfNotInteger,
    throwIfNotNumber,
    throwIfOutOfRange,
} from './validation.js';

describe(throwIfNotNumber.name, () => {
    it('should throw an error if the input is not a number', () => {
        expect(() => throwIfNotNumber('aa')).toThrow(TypeError);
    });

    it('should not throw an error if the input is a number', () => {
        expect(() => throwIfNotNumber(42)).not.toThrow();
    });
});

describe(throwIfNegative.name, () => {
    it('should throw an error if the input is a negative number', () => {
        expect(() => throwIfNegative(-1)).toThrow(RangeError);
    });

    it('should not throw an error if the input is a positive number', () => {
        expect(() => throwIfNegative(1)).not.toThrow();
    });

    it('should not throw an error if the input is zero', () => {
        expect(() => throwIfNegative(0)).not.toThrow();
    });
});

describe(throwIfNotInKeys.name, () => {
    it('should throw if the attribute is not in the keys of the object', () => {
        const obj = { a: 1, b: 2 };
        expect(() => throwIfNotInKeys('c', obj)).toThrow(ReferenceError);
    });

    it('should not throw if the attribute is in the keys of the object', () => {
        const obj = { a: 1, b: 2 };
        expect(() => throwIfNotInKeys('a', obj)).not.toThrow();
    });
});

describe(throwIfOutOfRange.name, () => {
    it('should throw an error if the value is out of the specified range (bigger)', () => {
        expect(() => throwIfOutOfRange(10, { min: 1, max: 5 })).toThrow(RangeError);
    });

    it('should throw an error if the value is out of the specified range (smaller)', () => {
        expect(() => throwIfOutOfRange(-1, { min: 0, max: 5 })).toThrow(RangeError);
    });

    it('should not throw an error if the value is within the specified range', () => {
        expect(() => throwIfOutOfRange(3, { min: 0, max: 5 })).not.toThrow();
    });
});

describe(throwIfNotInteger.name, () => {
    it('should throw an error if the input is not an integer', () => {
        expect(() => throwIfNotInteger(3.14)).toThrow(TypeError);
    });

    it('should not throw an error if the input is an integer', () => {
        expect(() => throwIfNotInteger(42)).not.toThrow();
    });
});
