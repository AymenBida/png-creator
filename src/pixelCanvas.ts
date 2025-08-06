import {
    throwIfNegative,
    throwIfNotInKeys,
    throwIfNotNumber,
    throwIfOutOfRange,
} from './validation.js';
import { COLORS, VALID_COLOR_VALUE_RANGE, type ColorName, type PixelMap } from './png.types.js';

type Color = ColorName | number;

/** default value are (width = 16, height = 16, backgroundColorValue = 0) */
export type PixelCanvasOptions = {
    width: number;
    height: number;
    backgroundColor: Color;
};

export class PixelCanvas {
    #width: number = 16;
    #height: number = 16;
    #pixelMap: PixelMap = new Array<number[] | undefined>(this.#width)
        .fill(undefined)
        .map(() => new Array<number | undefined>(this.#height).fill(undefined));
    #lastUsedColor: number = 0;
    #backgroundColor: number = 0;

    constructor(options?: PixelCanvasOptions) {
        if (!options) return this;
        const { width, height, backgroundColor } = options;

        throwIfNotNumber(width);
        throwIfNegative(width);
        this.#width = width;

        throwIfNotNumber(height);
        throwIfNegative(height);
        this.#height = height;

        this.#pixelMap = new Array<number[] | undefined>(width)
            .fill(undefined)
            .map(() => new Array<number | undefined>(height).fill(undefined));

        this.#backgroundColor = this.#validateColor(backgroundColor);
    }

    #validateColor(color: Color): number {
        if (typeof color === 'string') {
            throwIfNotInKeys(color, COLORS);
            return COLORS[color];
        }

        throwIfNotNumber(color);
        throwIfOutOfRange(color, VALID_COLOR_VALUE_RANGE);
        return color;
    }

    setPixel({
        x,
        y,
        color,
    }: {
        x: number;
        y: number;
        /** If not set the last used color will be used */
        color?: Color;
    }): this {
        throwIfOutOfRange(x, { min: 0, max: this.#width - 1 });
        throwIfOutOfRange(y, { min: 0, max: this.#height - 1 });

        const currentColor = color !== undefined ? this.#validateColor(color) : this.#lastUsedColor;

        this.#pixelMap[x]![y] = currentColor;
        this.#lastUsedColor = currentColor;

        return this;
    }

    setPixels({
        xValues,
        yValues,
        color,
    }: {
        xValues: number[];
        yValues: number[];
        /** If not set the last used color will be used */
        color?: Color;
    }): this {
        for (const x of xValues) {
            throwIfOutOfRange(x, { min: 0, max: this.#width - 1 });
        }
        for (const y of yValues) {
            throwIfOutOfRange(y, { min: 0, max: this.#height - 1 });
        }

        const currentColor = color !== undefined ? this.#validateColor(color) : this.#lastUsedColor;
        for (const x of xValues) {
            for (const y of yValues) {
                this.#pixelMap[x]![y] = currentColor;
            }
        }
        this.#lastUsedColor = currentColor;

        return this;
    }

    setColumn({
        x,
        color,
    }: {
        x: number;
        /** If not set the last used color will be used */
        color?: Color;
    }): this {
        throwIfOutOfRange(x, { min: 0, max: this.#width - 1 });

        const currentColor = color !== undefined ? this.#validateColor(color) : this.#lastUsedColor;
        for (let y = 0; y < this.#height; y++) {
            this.#pixelMap[x]![y] = currentColor;
        }
        this.#lastUsedColor = currentColor;

        return this;
    }

    setRow({
        y,
        color,
    }: {
        y: number;
        /** If not set the last used color will be used */
        color?: Color;
    }): this {
        throwIfOutOfRange(y, { min: 0, max: this.#height - 1 });

        const currentColor = color !== undefined ? this.#validateColor(color) : this.#lastUsedColor;
        for (let x = 0; x < this.#width; x++) {
            this.#pixelMap[x]![y] = currentColor;
        }
        this.#lastUsedColor = currentColor;

        return this;
    }

    getSize(): { width: number; height: number } {
        return { width: this.#width, height: this.#height };
    }

    getPixelMap(): PixelMap {
        return this.#pixelMap;
    }

    getBackgroundColor(): number {
        return this.#backgroundColor;
    }
}
