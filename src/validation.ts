export const throwIfNotNumber: (value: unknown) => asserts value is number = (value) => {
    if (typeof value !== 'number') {
        throw TypeError(
            `value: <${JSON.stringify(value)}> of type <${typeof value}> is not a number`,
        );
    }
};

export const throwIfNegative = (value: number): void => {
    if (value < 0) {
        throw RangeError(`value: <${value}> is not positive`);
    }
};

export const throwIfNotInKeys: <T extends object>(
    value: PropertyKey,
    object: T,
) => asserts value is keyof T = (value, object) => {
    if (!Object.hasOwn(object, value)) {
        throw ReferenceError(
            `value: <${JSON.stringify(value)}> does not exist in keys: <${Object.keys(object).join(', ')}>`,
        );
    }
};

export const throwIfOutOfRange = (value: number, range: { min: number; max: number }) => {
    const { min, max } = range;
    if (value < min || value > max) {
        throw RangeError(`value: <${value}> must be between <${min}> and <${max}>`);
    }
};
