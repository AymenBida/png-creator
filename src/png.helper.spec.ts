import { describe, it, expect } from 'vitest';
import { createPixelBuffer } from './png.helper.js';
import { AVAILABLE_COLOR_TYPES, COLOR_TYPE_BYTES } from './png.types.js';

describe(`${createPixelBuffer.name}`, () => {
    for (const colorType of AVAILABLE_COLOR_TYPES) {
        it(`should return a buffer for all available colorTypes, colorType: ${colorType}`, () => {
            expect(createPixelBuffer({ colorValue: 0, colorType })).toBeInstanceOf(Buffer);
        });
    }

    for (const colorType of AVAILABLE_COLOR_TYPES) {
        it(`should return the right bytelength for each color type, colorType: ${colorType}`, () => {
            const buffer = createPixelBuffer({ colorValue: 0, colorType });
            expect(buffer.byteLength).toBe(COLOR_TYPE_BYTES[colorType]);
        });
    }

    for (const colorType of AVAILABLE_COLOR_TYPES) {
        it(`should throw range error if the colorValue is negative, colorType: ${colorType}`, () => {
            expect(() => createPixelBuffer({ colorValue: -1, colorType })).toThrow(RangeError);
        });
    }

    for (const colorType of AVAILABLE_COLOR_TYPES) {
        it(`should throw range error if the colorValue is bigger than 0xffffff, colorType: ${colorType}`, () => {
            expect(() => createPixelBuffer({ colorValue: 0x1000000, colorType })).toThrow(
                RangeError,
            );
        });
    }

    const validTestCases: {
        input: Parameters<typeof createPixelBuffer>[0];
        output: number[];
    }[] = [
        {
            input: { colorValue: 0x123456, colorType: 2 },
            output: [0x12, 0x34, 0x56],
        },
        {
            input: { colorValue: 0x123456, colorType: 0 },
            output: [0x2e],
        },
        {
            input: { colorValue: 0x123456, colorType: 4 },
            output: [0x2e, 0xff],
        },
        {
            input: { colorValue: 0x123456, colorType: 6 },
            output: [0x12, 0x34, 0x56, 0xff],
        },
        {
            input: { colorValue: 0, colorType: 4 },
            output: [0, 0],
        },
        {
            input: { colorValue: 0, colorType: 6 },
            output: [0, 0, 0, 0],
        },
    ];

    for (const { input, output } of validTestCases) {
        it(`should return the right sequence depending on color input: ${JSON.stringify(input)}`, () => {
            const buffer = createPixelBuffer(input);
            expect([...buffer]).toEqual(output);
        });
    }

    it('should throw a TypeError if the color type is not valid', () => {
        expect(() =>
            // @ts-expect-error -- colorType cannot be 5
            createPixelBuffer({ colorValue: 0, colorType: 5 }),
        ).toThrow(TypeError);
    });
});
