# png-creator

Programmatically create PNG images from pixel data.

[![npm version](https://img.shields.io/npm/v/png-creator.svg)](https://www.npmjs.com/package/png-creator)
[![downloads](https://img.shields.io/npm/dm/png-creator.svg)](https://www.npmjs.com/package/png-creator)
[![license](https://img.shields.io/npm/l/png-creator.svg)](LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/AymenBida/png-creator/ci.yml?branch=main)](https://github.com/OWNER/REPO/actions)

> Small, TypeScript-first utility to build PNG files from a pixel canvas or a raw pixel buffer.

## How to use

First install using your favorite package manager
```sh
npm install png-creator
```

This tool exposes two main elements:

### getPNGCreator

This is basically a function used to create an instance of the `PNGCreator` which itself exposes two ways of creating PNGs:

1- `createFromCanvas` :

So, what is a Canvas ?

Well, it's the `PixelCanvas` ! It is a tool to create a pixel map of color values that can be used with the `PNGCreator` to create the PNG (or used for any other reason you see fit)

It is used like this:

```typescript
import { PixelCanvas } from 'png-creator';

const canvas = new PixelCanvas({
	width: 8,
	height: 8,
	backgroundColor: "limegreen",
});

// You can choose to not provide any options, in that case you will receive the default ones: (width = 16, height = 16, backgroundColorValue = 0)
```

Background color can be either a string of any of the 140 colors (except transparent) from the [html specification](https://www.w3schools.com/colors/colors_names.asp) ***typescript auto complete included 😄** or any Hexadecimal color value (no transparency)

> Transparent background is supported by choosing `black` as a background color and using `colorMode` `4` or `6` when creating the PNG (more on that later)

So, right now the canvas is empty, if you try to create a png using it, it will result in an *_8x8 limegreen square_*, not bad, but not fun either

To populate the canvas we have several functions we can use like:
```typescript
canvas.setPixel({ x: 1, y: 3, color: "red" });
// sets a pixel defined by x and y coordinates to the defined color

canvas.setColumn({ x: 1, color: "blue" });
// sets an entire column to the defined color

canvas.setRow({ y: 1, color: "blue" });
// sets an entire row to the defined color

canvas.setPixels({ xValues: [1, 6], yValues: [2, 3], color: "black" });
// sets the combination of all the x and y coordinates to the defined color (in this case (1,2) (1,3) (6,2) and (6,3))
```

You can chain multiple functions like this:
```typescript
canvas.setPixel({ x: 1, y: 3, color: "red" })
	.setColumn({ x: 1, color: "blue" })
	.setPixels({ xValues: [3, 4], yValues: [4, 5, 6] });

// You can also omit the color argument, in that case the last used color will be used (or black if it's the first time)
```

> Any unused pixel in the canvas will be populated when used in PNGCreator with the background color value

So now putting everything together we can do something like this:

```typescript
import fs from "node:fs";
import { getPNGCreator, PixelCanvas } from 'png-creator';

const canvas = new PixelCanvas({
	width: 8,
	height: 8,
	backgroundColor: "limegreen",
})
	.setPixels({ xValues: [1, 6], yValues: [2, 3], color: "black" })
	.setPixels({ xValues: [2, 5], yValues: [2, 3, 5, 6, 7] })
	.setPixels({ xValues: [3, 4], yValues: [4, 5, 6] });
const png = getPNGCreator().createFromCanvas({ pixelCanvas: canvas, colorMode: 2 });

fs.writeFileSync("creeper.png", png);
```
And get [this PNG file](./creeper.png): <img src="./creeper.png">

You don't have to use The PixelCanvas from the library, you can use your own implementation of PixelCanvas as long as it implements the `IPixelCanvas` interface and it uses valid color values

Minimum shape:

```ts
export interface IPixelCanvas {
  /**
   * Returns the full pixel map for the canvas.
   * Each entry is a numeric RGB color value (0xRRGGBB), without alpha or `undefined`.
   * Example: [[0xff0000, 0x00ff00], [undefined, 0xffffff]]
   */
  getPixelMap(): PixelMap; // type PixelMap = (number | undefined)[][]

  /**
   * Returns the canvas dimensions in pixels.
   */
  getSize(): { width: number; height: number };

  /**
   * Returns the background color as a numeric RGB value (0xRRGGBB).
   */
  getBackgroundColor(): number;
}
```

You may have noticed we used a `colorMode` argument when we create the PNG, the full reference for this can be found [here](https://www.w3.org/TR/png/#3colourType) but the mode 3 (Indexed-color) is not supported for now (feel free to open a feature request 😉)

This is a summary of the color modes and how they behave in this library
- Truecolor (aka 2): each pixel uses the provided color value, undefined pixels will use the background color
- Truecolor with alpha (aka 6): same thing as TrueColor but any completely black pixel will become completely transparent
- Greyscale (aka 0): the provided color (between 0 and ffffff) will be transformed to a grayscale color (between 0 and ff) using the **Weighted Average Method (Luminance)** (Gray = Red * 0.299 + Green * 0.587 + Blue * 0.114)
- Greyscale with alpha (aka 4): same thing as Grayscale but any completely black pixel will become completely transparent

**Example:**
The same code that generates [this](./creeper.png) <img src="./creeper.png"> with TrueColor mode generates [this](./creeper-grayscale.png) <img src="./creeper-grayscale.png"> with the Grayscale mode


2- `createFromBuffer` :

If you want to generate the PNG using your own Buffer you can use this method from PNGCreator and in that case you need to provide the height, width and pixel buffer along with the color mode, to learn how to build the pixel buffer you can per example check the [Portable Network Graphics (PNG) Specification](https://www.w3.org/TR/png/)

Usage Example:
```typescript
import { getPNGCreator } from 'png-creator';
const buffer = Buffer.from(/* numbers array */);

const png = getPNGCreator().createFromBuffer({
    pixelBuffer: buffer,
    width: 10,
    height: 10,
    colorType: 0,
});

// ⚠️ width and height are not arbitrary, the buffer needs to be created to work with the correct width and height to work as expected
```
In case someone is wondering what is the second element, we already talked about it in depth in the first part, and it is the PixelCanvas, but here is the second title anyway 😄

### PixelCanvas

That's it for now !

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

## Contact

Aymen Bida - aymen.bida.00@gmail.com

Project Link: [https://github.com/AymenBida/png-creator](https://github.com/github_username/repo_name)

<p align="right">(<a href="#png-creator">back to top</a>)</p>