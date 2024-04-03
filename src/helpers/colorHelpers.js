//  Convert each pixel value ( number ) to hexadecimal ( string ) with base 16
export const rgbToHex = (pixel) => {
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

  return (
    "#" +
    componentToHex(pixel.r) +
    componentToHex(pixel.g) +
    componentToHex(pixel.b)
  ).toUpperCase();
};

//  Convert hex to rgb
export const hexToRgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convert HSL to Hex
 * this entire formula can be found in stackoverflow, credits to @icl7126 !!!
 * https://stackoverflow.com/a/44134328/17150245
 */
export const hslToHex = (hslColor) => {
  const hslColorCopy = { ...hslColor };
  hslColorCopy.l /= 100;
  const a =
    (hslColorCopy.s * Math.min(hslColorCopy.l, 1 - hslColorCopy.l)) / 100;
  const f = (n) => {
    const k = (n + hslColorCopy.h / 30) % 12;
    const color = hslColorCopy.l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

/**
 * Convert RGB values to HSL
 * This formula can be
 * found here https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
 */
export const convertRGBtoHSL = (rgbValues) => {
  return rgbValues.map((pixel) => {
    let hue,
      saturation,
      luminance = 0;

    // first change range from 0-255 to 0 - 1
    let redOpposite = pixel.r / 255;
    let greenOpposite = pixel.g / 255;
    let blueOpposite = pixel.b / 255;

    const Cmax = Math.max(redOpposite, greenOpposite, blueOpposite);
    const Cmin = Math.min(redOpposite, greenOpposite, blueOpposite);

    const difference = Cmax - Cmin;

    luminance = (Cmax + Cmin) / 2.0;

    if (luminance <= 0.5) {
      saturation = difference / (Cmax + Cmin);
    } else if (luminance >= 0.5) {
      saturation = difference / (2.0 - Cmax - Cmin);
    }

    /**
     * If Red is max, then Hue = (G-B)/(max-min)
     * If Green is max, then Hue = 2.0 + (B-R)/(max-min)
     * If Blue is max, then Hue = 4.0 + (R-G)/(max-min)
     */
    const maxColorValue = Math.max(pixel.r, pixel.g, pixel.b);

    if (maxColorValue === pixel.r) {
      hue = (greenOpposite - blueOpposite) / difference;
    } else if (maxColorValue === pixel.g) {
      hue = 2.0 + (blueOpposite - redOpposite) / difference;
    } else {
      hue = 4.0 + (greenOpposite - blueOpposite) / difference;
    }

    hue = hue * 60; // find the sector of 60 degrees to which the color belongs

    // it should be always a positive angle
    if (hue < 0) {
      hue = hue + 360;
    }

    // When all three of R, G and B are equal, we get a neutral color: white, grey or black.
    if (difference === 0) {
      return false;
    }

    return {
      h: Math.round(hue) + 180, // plus 180 degrees because that is the complementary color
      s: parseFloat(saturation * 100).toFixed(2),
      l: parseFloat(luminance * 100).toFixed(2),
    };
  });
};

export function RGBToHSL(r, g, b) {
  var min = Math.min(r, g, b),
    max = Math.max(r, g, b),
    diff = max - min,
    h = 0,
    s = 0,
    l = (min + max) / 2;

  if (diff != 0) {
    s = l < 0.5 ? diff / (max + min) : diff / (2 - max - min);

    h =
      (r == max
        ? (g - b) / diff
        : g == max
        ? 2 + (b - r) / diff
        : 4 + (r - g) / diff) * 60;
  }

  return [h, s, l];
}

export function HSLToRGB(h, s, l) {
  if (s == 0) {
    return [l, l, l];
  }

  var temp2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
  var temp1 = 2 * l - temp2;

  h /= 360;

  var rtemp = (h + 1 / 3) % 1,
    gtemp = h,
    btemp = (h + 2 / 3) % 1,
    rgb = [rtemp, gtemp, btemp],
    i = 0;

  for (; i < 3; ++i) {
    rgb[i] =
      rgb[i] < 1 / 6
        ? temp1 + (temp2 - temp1) * 6 * rgb[i]
        : rgb[i] < 1 / 2
        ? temp2
        : rgb[i] < 2 / 3
        ? temp1 + (temp2 - temp1) * 6 * (2 / 3 - rgb[i])
        : temp1;
  }

  return rgb;
}

export const findBiggestColorRange = (rgbValues) => {
  let rMin = Number.MAX_VALUE;
  let gMin = Number.MAX_VALUE;
  let bMin = Number.MAX_VALUE;

  let rMax = Number.MIN_VALUE;
  let gMax = Number.MIN_VALUE;
  let bMax = Number.MIN_VALUE;

  rgbValues.forEach((pixel) => {
    rMin = Math.min(rMin, pixel.r);
    gMin = Math.min(gMin, pixel.g);
    bMin = Math.min(bMin, pixel.b);

    rMax = Math.max(rMax, pixel.r);
    gMax = Math.max(gMax, pixel.g);
    bMax = Math.max(bMax, pixel.b);
  });

  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;

  const biggestRange = Math.max(rRange, gRange, bRange);
  if (biggestRange === rRange) {
    return "r";
  } else if (biggestRange === gRange) {
    return "g";
  } else {
    return "b";
  }
};

export const colorCondition = (value1, value2, limit) => {
  let flag = false;
  if (value1 == value2) {
    flag = true;
  } else {
    for (var i = 1; i <= limit; i++) {
      if (value1 + i == value2 || value1 - i == value2) {
        flag = true;
      }
    }
  }
  return flag;
};

/**
 * Median cut implementation
 * can be found here -> https://en.wikipedia.org/wiki/Median_cut
 */
export const quantization = (rgbValues, depth) => {
  const MAX_DEPTH = 4;

  // Base case
  if (depth === MAX_DEPTH || rgbValues.length === 0) {
    const color = rgbValues.reduce(
      (prev, curr) => {
        prev.r += curr.r;
        prev.g += curr.g;
        prev.b += curr.b;

        return prev;
      },
      {
        r: 0,
        g: 0,
        b: 0,
      }
    );

    color.r = Math.round(color.r / rgbValues.length);
    color.g = Math.round(color.g / rgbValues.length);
    color.b = Math.round(color.b / rgbValues.length);

    return [color];
  }

  /**
   *  Recursively do the following:
   *  1. Find the pixel channel (red,green or blue) with biggest difference/range
   *  2. Order by this channel
   *  3. Divide in half the rgb colors list
   *  4. Repeat process again, until desired depth or base case
   */
  const componentToSortBy = findBiggestColorRange(rgbValues);
  rgbValues.sort((p1, p2) => {
    return p1[componentToSortBy] - p2[componentToSortBy];
  });

  const mid = rgbValues.length / 2;
  return [
    ...quantization(rgbValues.slice(0, mid), depth + 1),
    ...quantization(rgbValues.slice(mid + 1), depth + 1),
  ];
};

export const uniqueArray = (a) =>
  [...new Set(a.map((o) => JSON.stringify(o)))].map((s) => JSON.parse(s));

export const closestHexFromRgb = (rgbObj, preDefinedColors) => {
  var minDistance = Number.MAX_SAFE_INTEGER;
  var nearestHex = null;

  for (var i = 0; i < preDefinedColors.length; i++) {
    var currentColor = preDefinedColors[i];
    var distance = Math.sqrt(
      Math.pow(rgbObj.red - currentColor.r, 2) +
        Math.pow(rgbObj.green - currentColor.g, 2) +
        Math.pow(rgbObj.blue - currentColor.b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestHex = currentColor;
    }
  }
  return nearestHex;
};

/**
 * Calculate the color distance or difference between 2 colors
 *
 * further explanation of this topic
 * can be found here -> https://en.wikipedia.org/wiki/Euclidean_distance
 * note: this method is not accuarate for better results use Delta-E distance metric.
 */
export const calculateColorDifference = (color1, color2) => {
  const rDifference = Math.pow(color2.r - color1.r, 2);
  const gDifference = Math.pow(color2.g - color1.g, 2);
  const bDifference = Math.pow(color2.b - color1.b, 2);

  return rDifference + gDifference + bDifference;
};

export const buildRgb = (imageData) => {
  const rgbValues = [];
  for (let i = 0; i < imageData.length; i += 4) {
    var rgb = {
      r: imageData[i],
      g: imageData[i + 1],
      b: imageData[i + 2],
    };
    rgbValues.push(rgb);
  }

  return rgbValues;
};

/**
 * Using relative luminance we order the brightness of the colors
 * the fixed values and further explanation about this topic
 * can be found here -> https://en.wikipedia.org/wiki/Luma_(video)
 */
export const orderByLuminance = (rgbValues) => {
  const calculateLuminance = (p) => {
    return 0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b;
  };

  return rgbValues.sort((p1, p2) => {
    return calculateLuminance(p2) - calculateLuminance(p1);
  });
};

export const hslCodeToHex = (color) => {
  var colorVar = color.substring(4);
  colorVar = colorVar.substring(0, colorVar.length - 1);
  var colorArr = colorVar.split(",");
  var colorObj = {
    h: colorArr[0],
    s: colorArr[1].replaceAll("%", ""),
    l: colorArr[2].replaceAll("%", ""),
  };
  return hslToHex(colorObj);
};

export function objectRgbToHex(rgb) {
  // Extract r, g, b values from the 'rgb(r, g, b)' string
  const matches = rgb.match(/\d+/g);
  if (!matches || matches.length !== 3) {
    return null; // Invalid input format
  }

  const r = parseInt(matches[0]);
  const g = parseInt(matches[1]);
  const b = parseInt(matches[2]);

  // Convert individual color components to hexadecimal
  const hexR = r.toString(16).padStart(2, "0");
  const hexG = g.toString(16).padStart(2, "0");
  const hexB = b.toString(16).padStart(2, "0");

  // Combine the hex values to create the final hex color
  const hexColor = `#${hexR}${hexG}${hexB}`;

  return hexColor.toUpperCase(); // Convert to uppercase for consistency
}

export const getImageBackgroundColor = (editor) => {
  var colorData = editor.canvas.contextContainer.getImageData(10, 10, 1, 1).data;
  // Convert the color data to a CSS color string
  var color =
    "rgba(" +
    colorData[0] +
    ", " +
    colorData[1] +
    ", " +
    colorData[2] +
    ", " +
    colorData[3] / 255 +
    ")";

    return color;
};
