import { throwIfNegative, throwIfOutOfRange } from './validation.js';
import {
    COLOR_TYPE_BYTES,
    COLOR_TYPES,
    VALID_COLOR_VALUE_RANGE,
    type AvailableColorType,
} from './png.types.js';

const throwIfInvalidColorValue = (colorValue: number): void => {
    throwIfNegative(colorValue);
    throwIfOutOfRange(colorValue, VALID_COLOR_VALUE_RANGE);
};

const createTrueColorPixelBuffer = (colorValue: number): Buffer => {
    throwIfInvalidColorValue(colorValue);
    const buffer = Buffer.alloc(COLOR_TYPE_BYTES[COLOR_TYPES.TRUE_COLOR]);
    buffer[0] = (colorValue >> 16) & 0xff; // for Red
    buffer[1] = (colorValue >> 8) & 0xff; // for Green
    buffer[2] = colorValue & 0xff; // for Blue
    return buffer;
};

const convertTrueColorToGrayscale = (colorValue: number): number => {
    const red = (colorValue >> 16) & 0xff;
    const green = (colorValue >> 8) & 0xff;
    const blue = colorValue & 0xff;
    const grayscale = Math.round(0.299 * red + 0.587 * green + 0.114 * blue); // Luminance-based perceptual grayscale conversion
    return grayscale;
};

const createGrayscalePixelBuffer = (colorValue: number): Buffer => {
    throwIfInvalidColorValue(colorValue);
    const buffer = Buffer.alloc(COLOR_TYPE_BYTES[COLOR_TYPES.GRAYSCALE]);
    const grayscaleColor = convertTrueColorToGrayscale(colorValue);
    buffer[0] = grayscaleColor;
    return buffer;
};

const createAlphaPixelBuffer = (colorValue: number): Buffer => {
    throwIfInvalidColorValue(colorValue);
    const buffer = Buffer.alloc(1);
    if (colorValue !== 0) {
        buffer[0] = 0xff;
    }
    return buffer;
};

export const createPixelBuffer = ({
    colorValue,
    colorType,
}: {
    colorValue: number;
    colorType: AvailableColorType;
}) => {
    if (colorType === COLOR_TYPES.GRAYSCALE) {
        return createGrayscalePixelBuffer(colorValue);
    }
    if (colorType === COLOR_TYPES.GRAYSCALE_ALPHA) {
        return Buffer.concat([
            createGrayscalePixelBuffer(colorValue),
            createAlphaPixelBuffer(colorValue),
        ]);
    }
    if (colorType === COLOR_TYPES.TRUE_COLOR) {
        return createTrueColorPixelBuffer(colorValue);
    }
    if (colorType === COLOR_TYPES.TRUE_COLOR_ALPHA) {
        return Buffer.concat([
            createTrueColorPixelBuffer(colorValue),
            createAlphaPixelBuffer(colorValue),
        ]);
    }
    throw new TypeError(`colorType <${String(colorType)}> is not a valid color type`);
};
