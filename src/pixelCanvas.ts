import {
    throwIfNegative,
    throwIfNotInKeys,
    throwIfNotInteger,
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
    pixelMap?: PixelMap;
};

export interface IPixelCanvas {
    getPixelMap(): PixelMap;
    getSize(): { width: number; height: number };
    getBackgroundColor(): number;
}

export const initPixelMap = ({ width, height }: { width: number; height: number }): PixelMap => {
    return new Array<number[] | null>(width)
        .fill(null)
        .map(() => new Array<number | null>(height).fill(null));
};

export class PixelCanvas {
    #width: number = 16;
    #height: number = 16;
    #pixelMap: PixelMap = initPixelMap({ width: this.#width, height: this.#height });
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

        if (options.pixelMap) {
            this.#validateInitialPixelMap(options.pixelMap, width, height);
            this.#pixelMap = options.pixelMap;
        } else {
            this.#pixelMap = initPixelMap({ width, height });
        }

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

    #validateInitialPixelMap(pixelMap: PixelMap, width: number, height: number): void {
        if (pixelMap.length !== width) {
            throw new RangeError(
                `Initial pixelMap width ${pixelMap.length} does not match specified width ${width}`,
            );
        }
        for (const column of pixelMap) {
            if (column.length !== height) {
                throw new RangeError(
                    `Initial pixelMap height ${column.length} does not match specified height ${height}`,
                );
            }
        }
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
    }): PixelCanvas {
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
    }): PixelCanvas {
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
    }): PixelCanvas {
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
    }): PixelCanvas {
        throwIfOutOfRange(y, { min: 0, max: this.#height - 1 });

        const currentColor = color !== undefined ? this.#validateColor(color) : this.#lastUsedColor;
        for (let x = 0; x < this.#width; x++) {
            this.#pixelMap[x]![y] = currentColor;
        }
        this.#lastUsedColor = currentColor;

        return this;
    }

    #scaleOnePixel({
        x,
        y,
        scale,
        pixelMap,
    }: {
        x: number;
        y: number;
        scale: number;
        pixelMap: PixelMap;
    }): void {
        for (let i = 0; i < scale; i++) {
            for (let j = 0; j < scale; j++) {
                const newX = x * scale + i;
                const newY = y * scale + j;
                pixelMap[newX]![newY] = this.#pixelMap[x]![y]!;
            }
        }
    }

    setScale(scale: number): PixelCanvas {
        throwIfNotNumber(scale);
        throwIfNegative(scale);
        throwIfOutOfRange(scale, { min: 1, max: 100 });
        throwIfNotInteger(scale);
        const newWidth = this.#width * scale;
        const newHeight = this.#height * scale;
        const newPixelMap: PixelMap = initPixelMap({ width: newWidth, height: newHeight });
        for (let x = 0; x < this.#width; x++) {
            for (let y = 0; y < this.#height; y++) {
                this.#scaleOnePixel({ x, y, scale, pixelMap: newPixelMap });
            }
        }
        this.#width = newWidth;
        this.#height = newHeight;
        this.#pixelMap = newPixelMap;
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
