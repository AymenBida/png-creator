import { describe, it, expect } from 'vitest';
import { initPixelMap, PixelCanvas } from './pixelCanvas.js';
import type { PixelCanvasOptions } from './pixelCanvas.js';

const getPixelCanvasOptions = (input: Partial<PixelCanvasOptions> = {}) => {
    const defaultOptions: PixelCanvasOptions = {
        width: 16,
        height: 16,
        backgroundColor: 0,
    };
    return {
        ...defaultOptions,
        ...input,
    };
};

describe('PixelCanvas', () => {
    describe('constructor', () => {
        it('should create a PixelCanvas instance', () => {
            const pixelCanvas = new PixelCanvas();
            expect(pixelCanvas).toBeInstanceOf(PixelCanvas);
        });

        it('should throw an error if provided width is not a number', () => {
            expect(
                () =>
                    new PixelCanvas(
                        // @ts-expect-error -- Testing invalid input
                        getPixelCanvasOptions({ width: 'notANumber' }),
                    ),
            ).toThrow(TypeError);
        });

        it('should throw an error if provided negative width', () => {
            expect(() => new PixelCanvas(getPixelCanvasOptions({ width: -1 }))).toThrow(RangeError);
        });

        it('should throw an error if provided height is not a number', () => {
            expect(
                () =>
                    new PixelCanvas(
                        // @ts-expect-error -- Testing invalid input
                        getPixelCanvasOptions({ height: 'notANumber' }),
                    ),
            ).toThrow(TypeError);
        });

        it('should throw an error if provided negative height', () => {
            expect(() => new PixelCanvas(getPixelCanvasOptions({ height: -1 }))).toThrow(
                RangeError,
            );
        });

        it('should throw an error if provided backgroundColor is not a valid color name', () => {
            expect(
                () =>
                    new PixelCanvas(
                        getPixelCanvasOptions({
                            // @ts-expect-error -- Testing invalid input
                            backgroundColor: 'invalidColor',
                        }),
                    ),
            ).toThrow(ReferenceError);
        });

        it('should throw an error if provided backgroundColor is not a number if not a string', () => {
            expect(
                () =>
                    new PixelCanvas(
                        // @ts-expect-error -- Testing invalid input
                        getPixelCanvasOptions({ backgroundColor: false }),
                    ),
            ).toThrow(TypeError);
        });

        it('should throw an error if provided backgroundColor is out of range (smaller)', () => {
            expect(() => new PixelCanvas(getPixelCanvasOptions({ backgroundColor: -1 }))).toThrow(
                RangeError,
            );
        });

        it('should throw an error if provided backgroundColor is out of range (bigger)', () => {
            expect(
                () => new PixelCanvas(getPixelCanvasOptions({ backgroundColor: 0x1000000 })),
            ).toThrow(RangeError);
        });

        it('should set default values if no options are provided', () => {
            const pixelCanvas = new PixelCanvas();
            expect(pixelCanvas.getSize()).toEqual({ width: 16, height: 16 });
            expect(pixelCanvas.getBackgroundColor()).toBe(0);
        });

        it('should set provided values correctly', () => {
            const options = getPixelCanvasOptions({
                width: 32,
                height: 32,
                backgroundColor: 0x123456,
            });
            const pixelCanvas = new PixelCanvas(options);
            expect(pixelCanvas.getSize()).toEqual({ width: 32, height: 32 });
            expect(pixelCanvas.getBackgroundColor()).toBe(0x123456);
        });

        it('should throw if provided pixel map have the wrong height', () => {
            const pixelMap = initPixelMap({ width: 16, height: 8 });
            expect(
                () => new PixelCanvas(getPixelCanvasOptions({ width: 16, height: 16, pixelMap })),
            ).toThrow(RangeError);
        });

        it('should throw if provided pixel map have the wrong width', () => {
            const pixelMap = initPixelMap({ width: 8, height: 16 });
            expect(
                () => new PixelCanvas(getPixelCanvasOptions({ width: 16, height: 16, pixelMap })),
            ).toThrow(RangeError);
        });
    });

    describe('setPixel', () => {
        it('should throw if the x value is out of range (smaller)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setPixel({ x: -1, y: 0 })).toThrow(RangeError);
        });

        it('should throw if the x value is out of range (bigger)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setPixel({ x: 32, y: 0 })).toThrow(RangeError);
        });

        it('should throw if the y value is out of range (smaller)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setPixel({ x: 0, y: -1 })).toThrow(RangeError);
        });

        it('should throw if the y value is out of range (bigger)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setPixel({ x: 0, y: 32 })).toThrow(RangeError);
        });

        it('should throw if the color is not a valid color name', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() =>
                // @ts-expect-error -- Testing invalid input
                pixelCanvas.setPixel({ x: 0, y: 0, color: 'invalidColor' }),
            ).toThrow(ReferenceError);
        });

        it('should throw if the color is not a number if not a string', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() =>
                // @ts-expect-error -- Testing invalid input
                pixelCanvas.setPixel({ x: 0, y: 0, color: false }),
            ).toThrow(TypeError);
        });

        it('should throw if the color is out of range (smaller)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setPixel({ x: 0, y: 0, color: -1 })).toThrow(RangeError);
        });

        it('should throw if the color is out of range (bigger)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setPixel({ x: 0, y: 0, color: 0x1000000 })).toThrow(
                RangeError,
            );
        });

        it('should set the pixel color correctly', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            pixelCanvas.setPixel({ x: 0, y: 0, color: 0x123456 });

            expect(pixelCanvas.getPixelMap()[0]?.[0]).toBe(0x123456);
        });

        it('should use the last used color if no color is provided', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            pixelCanvas.setPixel({ x: 0, y: 0, color: 0x123456 });
            pixelCanvas.setPixel({ x: 1, y: 0 });
            expect(pixelCanvas.getPixelMap()[1]?.[0]).toBe(0x123456);
        });
    });

    describe('setPixels', () => {
        it('should throw if any x value is out of range (smaller)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setPixels({ xValues: [-1], yValues: [0] })).toThrow(
                RangeError,
            );
        });

        it('should throw if any x value is out of range (bigger)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setPixels({ xValues: [32], yValues: [0] })).toThrow(
                RangeError,
            );
        });

        it('should throw if any y value is out of range (smaller)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setPixels({ xValues: [0], yValues: [-1] })).toThrow(
                RangeError,
            );
        });

        it('should throw if any y value is out of range (bigger)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setPixels({ xValues: [0], yValues: [32] })).toThrow(
                RangeError,
            );
        });

        it('should throw if the color is not a valid color name', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() =>
                pixelCanvas.setPixels({
                    xValues: [0],
                    yValues: [0],
                    // @ts-expect-error -- Testing invalid input
                    color: 'invalidColor',
                }),
            ).toThrow(ReferenceError);
        });

        it('should throw if the color is not a number if not a string', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() =>
                pixelCanvas.setPixels({
                    xValues: [0],
                    yValues: [0],
                    // @ts-expect-error -- Testing invalid input
                    color: false,
                }),
            ).toThrow(TypeError);
        });

        it('should throw if the color is out of range (smaller)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() =>
                pixelCanvas.setPixels({
                    xValues: [0],
                    yValues: [0],
                    color: -1,
                }),
            ).toThrow(RangeError);
        });

        it('should throw if the color is out of range (bigger)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() =>
                pixelCanvas.setPixels({
                    xValues: [0],
                    yValues: [0],
                    color: 0x1000000,
                }),
            ).toThrow(RangeError);
        });

        it('should set multiple pixels with the same color', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            pixelCanvas.setPixels({
                xValues: [0, 1],
                yValues: [0, 1],
                color: 0x123456,
            });
            expect(pixelCanvas.getPixelMap()[0]?.[0]).toBe(0x123456);
            expect(pixelCanvas.getPixelMap()[1]?.[0]).toBe(0x123456);
            expect(pixelCanvas.getPixelMap()[0]?.[1]).toBe(0x123456);
            expect(pixelCanvas.getPixelMap()[1]?.[1]).toBe(0x123456);
        });

        it('should use the last used color if no color is provided', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            pixelCanvas.setPixels({
                xValues: [0, 1],
                yValues: [0, 1],
                color: 0x123456,
            });
            pixelCanvas.setPixels({ xValues: [2], yValues: [2] });
            expect(pixelCanvas.getPixelMap()[2]?.[2]).toBe(0x123456);
        });
    });

    describe('setColumn', () => {
        it('should throw if the x value is out of range (smaller)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setColumn({ x: -1 })).toThrow(RangeError);
        });

        it('should throw if the x value is out of range (bigger)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setColumn({ x: 32 })).toThrow(RangeError);
        });

        it('should throw if the color is not a valid color name', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() =>
                // @ts-expect-error -- Testing invalid input
                pixelCanvas.setColumn({ x: 0, color: 'invalidColor' }),
            ).toThrow(ReferenceError);
        });

        it('should throw if the color is not a number if not a string', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            // @ts-expect-error -- Testing invalid input
            expect(() => pixelCanvas.setColumn({ x: 0, color: false })).toThrow(TypeError);
        });

        it('should throw if the color is out of range (smaller)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setColumn({ x: 0, color: -1 })).toThrow(RangeError);
        });

        it('should throw if the color is out of range (bigger)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setColumn({ x: 0, color: 0x1000000 })).toThrow(RangeError);
        });

        it('should set the entire column to the specified color', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            pixelCanvas.setColumn({ x: 0, color: 0x123456 });
            for (let y = 0; y < 32; y++) {
                expect(pixelCanvas.getPixelMap()[0]?.[y]).toBe(0x123456);
            }
        });

        it('should use the last used color if no color is provided', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            pixelCanvas.setColumn({ x: 0, color: 0x123456 });
            pixelCanvas.setColumn({ x: 1 });
            for (let y = 0; y < 32; y++) {
                expect(pixelCanvas.getPixelMap()[1]?.[y]).toBe(0x123456);
            }
        });
    });

    describe('setRow', () => {
        it('should throw if the y value is out of range (smaller)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setRow({ y: -1 })).toThrow(RangeError);
        });

        it('should throw if the y value is out of range (bigger)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setRow({ y: 32 })).toThrow(RangeError);
        });

        it('should throw if the color is not a valid color name', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() =>
                // @ts-expect-error -- Testing invalid input
                pixelCanvas.setRow({ y: 0, color: 'invalidColor' }),
            ).toThrow(ReferenceError);
        });

        it('should throw if the color is not a number if not a string', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            // @ts-expect-error -- Testing invalid input
            expect(() => pixelCanvas.setRow({ y: 0, color: false })).toThrow(TypeError);
        });

        it('should throw if the color is out of range (smaller)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setRow({ y: 0, color: -1 })).toThrow(RangeError);
        });

        it('should throw if the color is out of range (bigger)', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(() => pixelCanvas.setRow({ y: 0, color: 0x1000000 })).toThrow(RangeError);
        });

        it('should set the entire row to the specified color', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            pixelCanvas.setRow({ y: 0, color: 0x123456 });
            for (let x = 0; x < 32; x++) {
                expect(pixelCanvas.getPixelMap()[x]?.[0]).toBe(0x123456);
            }
        });

        it('should use the last used color if no color is provided', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            pixelCanvas.setRow({ y: 0, color: 0x123456 });
            pixelCanvas.setRow({ y: 1 });
            for (let x = 0; x < 32; x++) {
                expect(pixelCanvas.getPixelMap()[x]?.[1]).toBe(0x123456);
            }
        });
    });

    describe('getSize', () => {
        it('should return the correct size of the pixel canvas', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 32, height: 32 }));
            expect(pixelCanvas.getSize()).toEqual({ width: 32, height: 32 });
        });

        it('should return the default size if no options are provided', () => {
            const pixelCanvas = new PixelCanvas();
            expect(pixelCanvas.getSize()).toEqual({ width: 16, height: 16 });
        });
    });

    describe('getPixelMap', () => {
        it('should return the pixel map of the canvas', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 2, height: 2 }));
            const pixelMap = pixelCanvas.getPixelMap();
            expect(pixelMap).toEqual([
                [null, null],
                [null, null],
            ]);
        });

        it('should return the pixel map with the correct pixel colors after setting some pixels', () => {
            const pixelCanvas = new PixelCanvas(getPixelCanvasOptions({ width: 2, height: 2 }));
            pixelCanvas.setPixel({ x: 0, y: 0, color: 0x123456 });
            pixelCanvas.setPixel({ x: 1, y: 1, color: 0x654321 });
            const pixelMap = pixelCanvas.getPixelMap();
            expect(pixelMap).toEqual([
                [0x123456, null],
                [null, 0x654321],
            ]);
        });

        it('should return the pixel map provided in the constructor', () => {
            const initialPixelMap = [
                [0x111111, 0x222222],
                [0x333333, 0x444444],
            ];
            const pixelCanvas = new PixelCanvas(
                getPixelCanvasOptions({ width: 2, height: 2, pixelMap: initialPixelMap }),
            );
            const pixelMap = pixelCanvas.getPixelMap();
            expect(pixelMap).toEqual(initialPixelMap);
        });

        it('any modification should apply on top of the provided pixel map', () => {
            const initialPixelMap = [
                [0x111111, 0x222222],
                [0x333333, 0x444444],
            ];
            const pixelCanvas = new PixelCanvas(
                getPixelCanvasOptions({ width: 2, height: 2, pixelMap: initialPixelMap }),
            );
            pixelCanvas.setPixel({ x: 0, y: 0, color: 0x123456 });
            const pixelMap = pixelCanvas.getPixelMap();
            expect(pixelMap).toEqual([
                [0x123456, 0x222222],
                [0x333333, 0x444444],
            ]);
        });
    });

    describe('getBackgroundColor', () => {
        it('should return the background color of the canvas', () => {
            const pixelCanvas = new PixelCanvas(
                getPixelCanvasOptions({
                    width: 32,
                    height: 32,
                    backgroundColor: 0x123456,
                }),
            );
            expect(pixelCanvas.getBackgroundColor()).toBe(0x123456);
        });

        it('should return the default background color if no options are provided', () => {
            const pixelCanvas = new PixelCanvas();
            expect(pixelCanvas.getBackgroundColor()).toBe(0);
        });
    });

    describe('setScale', () => {
        it('should multiply the height and width of the canvas by the scale', () => {
            const pixelCanvas = new PixelCanvas({ height: 2, width: 2, backgroundColor: 0 });
            pixelCanvas.setScale(4);
            expect(pixelCanvas.getSize()).toEqual({ width: 8, height: 8 });
        });

        it('should throw an error if the scale is not a number', () => {
            const pixelCanvas = new PixelCanvas();
            expect(() =>
                // @ts-expect-error -- Testing invalid input
                pixelCanvas.setScale('notANumber'),
            ).toThrow(TypeError);
        });

        it('should throw an error if the scale is negative', () => {
            const pixelCanvas = new PixelCanvas();
            expect(() => pixelCanvas.setScale(-1)).toThrow(RangeError);
        });

        it('should throw an error if the scale is not an integer', () => {
            const pixelCanvas = new PixelCanvas();
            expect(() => pixelCanvas.setScale(2.5)).toThrow(TypeError);
        });

        it('should throw an error if the scale is out of range (smaller)', () => {
            const pixelCanvas = new PixelCanvas();
            expect(() => pixelCanvas.setScale(0)).toThrow(RangeError);
        });

        it('should throw an error if the scale is out of range (bigger)', () => {
            const pixelCanvas = new PixelCanvas();
            expect(() => pixelCanvas.setScale(101)).toThrow(RangeError);
        });

        it('should scale the pixel map correctly', () => {
            const pixelCanvas = new PixelCanvas({ height: 2, width: 2, backgroundColor: 0 });
            pixelCanvas.setPixel({ x: 0, y: 0, color: 0x123456 });
            pixelCanvas.setScale(2);
            expect(pixelCanvas.getPixelMap()).toEqual([
                [0x123456, 0x123456, null, null],
                [0x123456, 0x123456, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ]);
        });
    });
});
