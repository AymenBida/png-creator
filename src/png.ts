import zlib from 'node:zlib';
import type {
    AvailableColorType,
    BitDepth,
    CompressionMethod,
    CriticalChunk,
    FilterMethod,
    InterlaceMethod,
    PixelMap,
} from './png.types.js';
import { COLOR_TYPES } from './png.types.js';
import type { IPixelCanvas } from './pixelCanvas.js';
import { createPixelBuffer } from './png.helper.js';

export interface PNGCreatorDependencies {
    zlibModule: { deflateSync: (buf: Buffer) => Buffer };
}
class PNGCreator {
    /** The first eight bytes of a PNG datastream always contain the following hexadecimal values:

	89 50 4E 47 0D 0A 1A 0A

	This signature indicates that the remainder of the datastream contains a single PNG image, consisting of a series of chunks beginning with an [IHDR](https://www.w3.org/TR/png/#11IHDR) chunk and ending with an [IEND](https://www.w3.org/TR/png/#11IEND) chunk.

	This signature differentiates a PNG datastream from other types of [datastream](https://www.w3.org/TR/png/#dfn-datastream) and allows early detection of some transmission errors. */
    #PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;
    #pngSignatureBuffer = Buffer.from(this.#PNG_SIGNATURE);
    #CHUNK_BYTES_SIZE = 4 as const;
    #crc32Table: number[] = []; // Cache for CRC32 table
    #zlib;
    // #COLOR_TYPE_BIT_DEPTHS: Record<ColorType, BitDepth[]> = {
    //     [COLOR_TYPES.GRAYSCALE]: [1, 2, 4, 8, 16],
    //     [COLOR_TYPES.TRUE_COLOR]: [8, 16],
    //     [COLOR_TYPES.INDEXED_COLOR]: [1, 2, 4, 8],
    //     [COLOR_TYPES.GRAYSCALE_ALPHA]: [8, 16],
    //     [COLOR_TYPES.TRUE_COLOR_ALPHA]: [8, 16],
    // };
    #DEFAULT_COLOR_TYPE: AvailableColorType = COLOR_TYPES.TRUE_COLOR;

    /** The IHDR chunk shall be the first chunk in the PNG datastream. It contains -> Width: 4 bytes, Height: 4 bytes, Bit depth: 1 byte, Color type: 1 byte, Compression method: 1 byte, Filter method: 1 byte, Interlace method: 1 byte */
    #IHDR_INDEXES = {
        WIDTH: 0,
        HEIGHT: 4,
        BIT_DEPTH: 8,
        COLOR_TYPE: 9,
        COMPRESSION_METHOD: 10,
        FILTER_METHOD: 11,
        INTERLACE_METHOD: 12,
    } as const;

    #IHDR_BYTES_LENGTH = 13 as const;

    #DEFAULT_BIT_DEPTH: BitDepth = 8;
    #DEFAULT_COMPRESSION_METHOD: CompressionMethod = 0;
    #DEFAULT_FILTER_METHOD: FilterMethod = 0;
    #DEFAULT_INTERLACE_METHOD: InterlaceMethod = 0;

    constructor(dependencies: PNGCreatorDependencies) {
        this.#zlib = dependencies.zlibModule;
    }

    #getCrc32Table() {
        // If the table is not initialized, create it
        if (this.#crc32Table.length === 0) {
            for (let index = 0; index < 256; index++) {
                let current = index;
                for (let bit = 0; bit < 8; bit++) {
                    const isLeastBitOne = current & 1;
                    current = isLeastBitOne ? 0xed_b8_83_20 ^ (current >>> 1) : current >>> 1;
                }
                this.#crc32Table[index] = current >>> 0;
            }
        }

        return this.#crc32Table;
    }

    /** The following code represents a practical implementation of the CRC (Cyclic Redundancy Check) employed in PNG chunks. (See also ISO 3309 [[ISO-3309](https://www.w3.org/TR/png/#bib-iso-3309)] or ITU-T V.42 [[ITU-T-V.42](https://www.w3.org/TR/png/#bib-itu-t-v.42)] for a formal specification.) */
    #computeCRC32(buffer: Buffer) {
        const table = this.#getCrc32Table();

        let crc = 0xff_ff_ff_ff;

        for (const byte of buffer) {
            const index = (crc ^ byte) & 0xff;
            crc = table[index]! ^ (crc >>> 8);
        }

        return ~crc >>> 0;
    }

    #createIHDRBuffer = ({
        width,
        height,
        colorType,
    }: {
        width: number;
        height: number;
        colorType: AvailableColorType;
    }): Buffer => {
        const ihdr = Buffer.alloc(this.#IHDR_BYTES_LENGTH);
        ihdr.writeUInt32BE(width, this.#IHDR_INDEXES.WIDTH);
        ihdr.writeUInt32BE(height, this.#IHDR_INDEXES.HEIGHT);
        ihdr.writeUInt8(this.#DEFAULT_BIT_DEPTH, this.#IHDR_INDEXES.BIT_DEPTH);
        ihdr.writeUInt8(colorType, this.#IHDR_INDEXES.COLOR_TYPE);
        ihdr.writeUInt8(this.#DEFAULT_COMPRESSION_METHOD, this.#IHDR_INDEXES.COMPRESSION_METHOD);
        ihdr.writeUInt8(this.#DEFAULT_FILTER_METHOD, this.#IHDR_INDEXES.FILTER_METHOD);
        ihdr.writeUInt8(this.#DEFAULT_INTERLACE_METHOD, this.#IHDR_INDEXES.INTERLACE_METHOD);

        return ihdr;
    };

    #createChunk(chunkType: CriticalChunk, chunkData: Buffer): Buffer {
        const typeBuffer = Buffer.from(chunkType);
        const length = Buffer.alloc(this.#CHUNK_BYTES_SIZE);
        length.writeUInt32BE(chunkData.length);

        const crcBuffer = Buffer.concat([typeBuffer, chunkData]);
        const crc = Buffer.alloc(this.#CHUNK_BYTES_SIZE);
        crc.writeUInt32BE(this.#computeCRC32(crcBuffer));

        return Buffer.concat([length, typeBuffer, chunkData, crc]);
    }

    #addBackgroundColor({
        pixelMap,
        backgroundColor,
    }: {
        pixelMap: PixelMap;
        backgroundColor: number;
    }): number[][] {
        const newPixelMap: number[][] = [];
        for (const row of pixelMap) {
            const newRow: number[] = [];
            for (const column of row) {
                newRow.push(column === null ? backgroundColor : column);
            }
            newPixelMap.push(newRow);
        }
        return newPixelMap;
    }

    #computeImageBuffer({
        pixelCanvas,
        colorType,
    }: {
        pixelCanvas: IPixelCanvas;
        colorType: AvailableColorType;
    }): Buffer {
        const { width, height } = pixelCanvas.getSize();
        const pixelMap = this.#addBackgroundColor({
            pixelMap: pixelCanvas.getPixelMap(),
            backgroundColor: pixelCanvas.getBackgroundColor(),
        });
        const imageBuffer = [];
        for (let y = 0; y < height; y++) {
            imageBuffer.push(Buffer.alloc(1));
            for (let x = 0; x < width; x++) {
                imageBuffer.push(
                    createPixelBuffer({
                        colorValue: pixelMap[x]![y]!,
                        colorType,
                    }),
                );
            }
        }
        return Buffer.concat(imageBuffer);
    }

    #finalizeCreation({ ihdrBuffer, idatBuffer }: { ihdrBuffer: Buffer; idatBuffer: Buffer }) {
        return Buffer.concat([
            this.#pngSignatureBuffer,
            this.#createChunk('IHDR', ihdrBuffer),
            this.#createChunk('IDAT', idatBuffer),
            this.#createChunk('IEND', Buffer.alloc(0)),
        ]);
    }

    createFromCanvas({
        pixelCanvas,
        colorMode,
    }: {
        pixelCanvas: IPixelCanvas;
        /** Grayscale: 0, True Color: 2, GrayScale + alpha: 4, True Color + alpha: 6, default is True Color */
        colorMode?: AvailableColorType;
    }): Buffer {
        const colorType = colorMode ?? this.#DEFAULT_COLOR_TYPE;
        const imageData = this.#computeImageBuffer({ pixelCanvas, colorType });
        const idatBuffer = this.#zlib.deflateSync(imageData);
        const { width, height } = pixelCanvas.getSize();
        const ihdrBuffer = this.#createIHDRBuffer({ width, height, colorType });

        return this.#finalizeCreation({
            ihdrBuffer,
            idatBuffer,
        });
    }

    createFromBuffer({
        pixelBuffer,
        width,
        height,
        colorType,
    }: {
        pixelBuffer: Buffer;
        width: number;
        height: number;
        /** Grayscale: 0, True Color: 2, GrayScale + alpha: 4, True Color + alpha: 6 */
        colorType: AvailableColorType;
    }): Buffer {
        const idatBuffer = this.#zlib.deflateSync(pixelBuffer);
        const ihdrBuffer = this.#createIHDRBuffer({ width, height, colorType });

        return this.#finalizeCreation({
            ihdrBuffer,
            idatBuffer,
        });
    }
}

export const getPNGCreator = (dependencies?: PNGCreatorDependencies) => {
    const { zlibModule = zlib } = dependencies ?? {};
    return new PNGCreator({ zlibModule });
};
