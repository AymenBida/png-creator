/** A critical chunk is a chunk that is absolutely required in order to successfully decode a PNG image from a PNG datastream. Extension chunks may be defined as critical chunks (see [14. Editors](https://www.w3.org/TR/png/#14EditorsExt)), though this practice is strongly discouraged.

A valid PNG datastream shall begin with a PNG signature, immediately followed by an [IHDR](https://www.w3.org/TR/png/#11IHDR) chunk, then one or more [IDAT](https://www.w3.org/TR/png/#11IDAT) chunks, and shall end with an [IEND](https://www.w3.org/TR/png/#11IEND) chunk. Only one [IHDR](https://www.w3.org/TR/png/#11IHDR) chunk and one [IEND](https://www.w3.org/TR/png/#11IEND) chunk are allowed in a PNG datastream. */
export type CriticalChunk = 'IHDR' | 'IDAT' | 'IEND';

export const COLOR_TYPES = {
    /** Greyscale: Each pixel is a greyscale sample */
    GRAYSCALE: 0,
    /** Truecolor: Each pixel is an R,G,B triple */
    TRUE_COLOR: 2,
    /** Indexed-color: Each pixel is a palette index; a [PLTE](https://www.w3.org/TR/png/#11PLTE) chunk shall appear. */
    INDEXED_COLOR: 3,
    /** Greyscale with alpha: Each pixel is a greyscale sample followed by an alpha sample. */
    GRAYSCALE_ALPHA: 4,
    /** Truecolor with alpha: Each pixel is an R,G,B triple followed by an alpha sample. */
    TRUE_COLOR_ALPHA: 6,
} as const;

export const AVAILABLE_COLOR_TYPES: AvailableColorType[] = Object.values(COLOR_TYPES).filter(
    (colorType) => colorType !== 3,
);

export const COLOR_TYPE_BYTES: Record<ColorType, number> = {
    [COLOR_TYPES.GRAYSCALE]: 1,
    [COLOR_TYPES.TRUE_COLOR]: 3,
    [COLOR_TYPES.INDEXED_COLOR]: 1,
    [COLOR_TYPES.GRAYSCALE_ALPHA]: 2,
    [COLOR_TYPES.TRUE_COLOR_ALPHA]: 4,
};

/** [Color type](https://www.w3.org/TR/png/#3colourType) is a single-byte integer. */
export type ColorType = (typeof COLOR_TYPES)[keyof typeof COLOR_TYPES];
export type AvailableColorType = Exclude<ColorType, typeof COLOR_TYPES.INDEXED_COLOR>;

/** Bit depth is a single-byte integer giving the number of bits per sample or per palette index (not per pixel). Valid values are 1, 2, 4, 8, and 16, although not all values are allowed for all [color types](https://www.w3.org/TR/png/#3colourType). See [6.1 Color types and values](https://www.w3.org/TR/png/#6Colour-values). */
export type BitDepth = 1 | 2 | 4 | 8 | 16;

/** Compression method is a single-byte integer that indicates the method used to compress the [image data](https://www.w3.org/TR/png/#dfn-image-data). Only compression method 0 ([deflate](https://www.w3.org/TR/png/#dfn-deflate) compression with a sliding window of at most 32768 bytes) is defined in this specification. All conforming PNG images shall be compressed with this scheme. */
export type CompressionMethod = 0;
/** Filter method is a single-byte integer that indicates the preprocessing method applied to the [image data](https://www.w3.org/TR/png/#dfn-image-data) before compression. Only [filter method](https://www.w3.org/TR/png/#3filter) 0 (adaptive filtering with five basic filter types) is defined in this specification. See [9. Filtering](https://www.w3.org/TR/png/#9Filters) for details. */
export type FilterMethod = 0;
/** Interlace method is a single-byte integer that indicates the transmission order of the [image data](https://www.w3.org/TR/png/#dfn-image-data). Two values are defined in this specification: 0 (no interlace) or 1 (Adam7 interlace). See [8. Interlacing and pass extraction](https://www.w3.org/TR/png/#8Interlace) for details. */
export type InterlaceMethod = 0 | 1;

export type IHDROptions = {
    bitDepth?: BitDepth;
    colorType?: ColorType;
    compressionMethod?: CompressionMethod;
    filterMethod?: FilterMethod;
    interlaceMethod?: InterlaceMethod;
};

export type PixelMap = (number | undefined)[][];

export const VALID_COLOR_VALUE_RANGE = { min: 0, max: 0xffffff };

export const COLORS = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff, // synonym of aqua
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9, // synonym of darkgray
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f, // synonym of darkslategray
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969, // synonym of dimgray
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff, // synonym of magenta
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080, // synonym of grey
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080, // synonym of gray
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3, // synonym of lightgray
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899, // synonym of lightslategray
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff, // synonym of fuchsia
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090, // synonym of slategray
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32,
} as const;

export type ColorName = keyof typeof COLORS;
