import { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  ToggleButton,
  Form,
} from "react-bootstrap";
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { extractColors } from "extract-colors";
import Slider from "react-rangeslider";
import "react-rangeslider/lib/index.css";
import {
  // rgbToHex,
  // hexToRgb,
  colorCondition,
  closestHexFromRgb,
  hslCodeToHex,
  objectRgbToHex,
  getImageBackgroundColor,
} from "../../helpers/colorHelpers";
import { preDefinedColors } from "../../constants";
import "react-select-search/style.css";
import {
  ArrowLeft,
  ChevronRight,
  Dash,
  Plus,
  SymmetryHorizontal,
  SymmetryVertical,
  TextCenter,
  X,
} from "react-bootstrap-icons";
import * as CD from "./colorDiff";
import { debounce } from "lodash";
import DetailBox from "./DetailBox";
import { objectCenter } from "../../helpers/canvasHelpers";

function rgbToHexP(rgb) {
  const { r, g, b } = rgb;
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hexValue =
    "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  return hexValue;
}

const rgbToHex = (rgb) =>
  "#" +
  rgb
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");

const hexToRgb = (hex) => {
  // console.log("Hex value before replace:", hex);
  var bigint = parseInt(hex.replace("#", ""), 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return [r, g, b];
};

const ImageComponent = (props) => {
  const { editor, setOptionType, deleteAll, wrapperRef } = props;
  // const [height, setHeight] = useState(220);
  const [width, setWidth] = useState(150);
  const [treshold, setTreshold] = useState(0.2);
  const [logoImg, setLogoImg] = useState(null);
  const [img, setImg] = useState(null);
  const [imgData, setImgData] = useState(null);
  const [fetchColors, setFetchColors] = useState([]);
  const [exColors, setExColors] = useState([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [bgRemove, setBgRemove] = useState(false);
  const { editor2, onReady } = useFabricJSEditor();
  const uploadedImage = useRef(null);
  const [extractedColorVal, selectedExtractedColorVal] = useState(null);
  const [pickedColor, setPickedColor] = useState("#FFFFFF");
  const [makeSingleColor, setMakeSingleColor] = useState(false);
  const [makeSingleColorInvert, setMakeSingleColorInvert] = useState(false);
  const [makeOneColor, setMakeOneColor] = useState(false);
  const [makeOneColorCode, setMakeOneColorCode] = useState("#000000");
  const [makeOneColorDetailBox, showMakeOneColorDetailBox] = useState(false);
  const [imageColorDetailBox, showImageColorDetailBox] = useState(false);
  const [size, setSize] = useState(0.05);
  const [flipX, setFlipX] = useState(0);
  const [flipY, setFlipY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const firstRender = useRef(true);
  const [extratColors, setExtractColors] = useState([])


  const btnRef = useRef();
  const options = {
    pixels: 64000,
    distance: treshold,
    saturationDistance: 0.2,
    lightnessDistance: 0.2,
    hueDistance: 0.15,
  };

  let oldColor = []

  const setColor = (color, index) => {
    if (color[0] == "h" && color[1] == "s" && color[2] == "l") {
      setSelectedColor(hslCodeToHex(color));
    } else {
      setSelectedColor(color);
      setSelectedColorIndex(index);
    }
  };

  const createCanvasAndFetchColor = async () => {
    const img = uploadedImage.current;
    console.log(img?.src);
    editor?.canvas?.getObjects().forEach(function (object) {
      return editor?.canvas.remove(object);
    });

    if (uploadedImage.current)
      fabric.util.loadImage(img.src, function (imgObj) {
        console.log(imgObj);
        let newImg = new fabric.Image(imgObj, {
          cache: true,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high",
        });

        editor.canvas.antiAlias = true;


        setImg(newImg);

        newImg.set('opacity', 0.9)
        newImg.scaleToHeight(wrapperRef.current.offsetHeight - 100);
        newImg.scaleToWidth(wrapperRef.current.offsetWidth - 100);
        editor?.canvas.centerObject(newImg);
        editor.canvas.add(newImg);
        editor.canvas.renderAll();
        newImg.setControlVisible("ml", false); // Middle-left control
        newImg.setControlVisible("mb", false); // Middle-bottom control
        newImg.setControlVisible("mr", false); // Middle-right control
        newImg.setControlVisible("mt", false); // Middle-top control
        newImg.set({
          originX: "center",
          originY: "center",
        });

        var ctx = editor.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        var imgData = ctx.getImageData(
          0,
          0,
          editor.canvas.width,
          editor.canvas.height
        );

        setImgData(imgData);

        var object = editor.canvas.getObjects();

        if (object) {
          console.log(object);
        }

        // extracting colors from image
        extractColors(img, { ...options, treshold })
          .then((data) => {
            console.log(data, "here");
            const colors = [];
            const orgColors = [];
            console.log(treshold);

            for (var i = 0; i < data.length; i++) {

              // replacing original extracted color with the closest Pre defined colors
              // const colorNew = closestHexFromRgb(data[i], preDefinedColors);
              // console.log(rgbToHexP(colorNew), "colorNew", "data[i]", data[i])
              // data[i].hex = rgbToHexP(colorNew);

              colors.push(data[i]);
              orgColors.push(data[i]);
            }

            if (extratColors.length === 0 && img.src && img.src.length > 0) {
              // console.log(orgColors, "colors")
              setTreshold(treshold + 0.0001)
              setTreshold(treshold - 0.0001)

              setExtractColors(colors)
            }
            oldColor = colors

            setExColors(colors);
            // setFetchColors(orgColors);
          })
          .catch(console.log);
      });
  };

  function setExtractedColor() {
    setExtractColors([])
    extratColors.length = 0
  }

  useEffect(() => {

  }, [uploadedImage, logoImg])

  const changeImage = (e) => {
    const img = new Image()
    img.src = URL.createObjectURL(e.target.files[0]);
    setLogoImg(img);
    uploadedImage.current = img
    setExtractedColor()
    createCanvasAndFetchColor();
  };

  // const handleDelete = () => {
  //   editor.canvas.getObjects().forEach(function (object) {
  //     return editor.canvas.remove(object);
  //   });
  //   editor.canvas.discardActiveObject();
  //   // btnRef.current.value = {};
  //   setLogoImg({});
  //   editor.canvas.renderAll();
  //   setFetchColors([]);
  //   setSelectedColorIndex(null);
  //   setSelectedColor(null); deleteAll();
  //   setLogoImg({});
  //   setFetchColors([]);
  //   setSelectedColorIndex(null);
  //   setSelectedColor(null);
  // };

  function recolorImage(
    canvas,
    oldRed,
    oldGreen,
    oldBlue,
    newRed,
    newGreen,
    newBlue,
    isRevert = true,
    callback
  ) {
    console.log("start");
    // fabric.Image.fromURL(img, (img) => {
    // editor.canvas.add(img);

    const imageData = canvas.contextContainer.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    // var ctx = editor.canvas.getContext("2d");
    // // pull the entire image into an array of pixel data
    // var imageData = ctx.getImageData(
    //   0,
    //   0,
    //   editor.canvas.height,
    //   editor.canvas.width
    // );

    // examine every pixel,
    // change any old rgb to the new-rgb
    for (var i = 0; i < imageData.data.length; i += 4) {
      // check if new rgb is equal to or new to old rgb
      if (
        colorCondition(imageData.data[i], oldRed, 45) &&
        colorCondition(imageData.data[i + 1], oldGreen, 45) &&
        colorCondition(imageData.data[i + 2], oldBlue, 45)
      ) {
        // change to your new rgb
        imageData.data[i] = newRed;
        imageData.data[i + 1] = newGreen;
        imageData.data[i + 2] = newBlue;
      }
    }

    // put the altered data back on the canvas
    // ctx.putImageData(imageData, 0, 0);
    setImgData(imageData);
    canvas.contextContainer.putImageData(imageData, 0, 0);

    // put the re-colored image back on the image
    // var img1 = document.getElementById("image");
    // img1.src = canvas.toDataURL();

    if (isRevert) {
      setFetchColors([
        ...fetchColors.map((item, index) => {
          if (index == selectedColorIndex) {
            return {
              ...item,
              reverted: rgbToHex({
                r: newRed,
                g: newGreen,
                b: newBlue,
              }),
            };
          }
          return item;
        }),
      ]);
    }

    // });
    // console.log(logoImg, img1, editor.canvas.toDataURL());
    // setLogoImg(logoImg);
    // editor.canvas.renderAll();
    // getCanvasDataURL(editor.canvas)
    var img1 = document.getElementById("image");
    img1.src = editor.canvas.toDataURL();
  }

  const upateImage = (data) => {
    editor.canvas.contextContainer.putImageData(data, 0, 0);
  };

  const removeBgColor = (value) => {
    var color = getProminentColor(editor.canvas);
    console.log(getImageBackgroundColor(editor), color, "color-rgb");
    if (true) {
      if (value) {
        var removeColorFilter = new fabric.Image.filters.RemoveColor({
          distance: 0.2, // distance to the color to remove, between 0 and 1
          color: getImageBackgroundColor(editor), // the color to remove, in this case white
          alpha: 1, // alpha channel to consider, between 0 and 1
        });
        editor.canvas.item(0).filters.push(removeColorFilter);
        editor.canvas.item(0).applyFilters();
        editor.canvas.renderAll();
      } else {
        editor.canvas.item(0).filters = [];
        editor.canvas.item(0).applyFilters();
        editor.canvas.renderAll();
      }
      setBgRemove(value);
    }
    // var img1 = document.getElementById("image");
    // img1.src = editor.canvas.toDataURL();
  };

  const imageHasBg = (canvas, img) => {
    var imageData = canvas.contextContainer.getImageData(
      img.left,
      img.top,
      img.width,
      img.height
    );
    var pixelData = imageData.data;

    var hasTransparentBackground = true;
    var hasColorBackground = true;

    // check if all pixels have an alpha value of 0
    var counterPixel = 0;

    for (var i = 3; i < pixelData.length; i += 4) {
      if (pixelData[i] === 0) {
        counterPixel++;
        // hasTransparentBackground = true;
      }
    }

    console.log((counterPixel / (pixelData.length / 4)) * 100);

    for (var i = 3; i < pixelData.length; i += 4) {
      if (pixelData[i] !== 0) {
        hasTransparentBackground = false;
        break;
      }
    }

    // check if all pixels have an alpha value of 255
    for (var i = 3; i < pixelData.length; i += 4) {
      if (pixelData[i] !== 255) {
        hasColorBackground = false;
        break;
      }
    }

    var hasComplexBackground = !hasTransparentBackground && !hasColorBackground;

    if (hasTransparentBackground) {
      console.log("Image has a transparent background");
    } else if (hasColorBackground) {
      console.log("Image has a solid color background");
    } else if (hasComplexBackground) {
      console.log("Image has a complex background");
    } else {
      console.log("Unable to determine background type");
    }
  };

  const getProminentColor = (canvas) => {
    imageHasBg(canvas, img);
    // get the image's pixel data
    var imageData = canvas.contextContainer.getImageData(
      img.left,
      img.top,
      img.width,
      img.height
    );
    var pixelData = imageData.data;

    // calculate color frequencies
    var colorFrequencies = {};

    for (var i = 0; i < pixelData.length; i += 4) {
      var red = pixelData[i];
      var green = pixelData[i + 1];
      var blue = pixelData[i + 2];
      var color = "rgb(" + red + "," + green + "," + blue + ")";

      if (!colorFrequencies[color]) {
        colorFrequencies[color] = 0;
      }
      colorFrequencies[color]++;
    }

    // determine the most frequent color
    var mostFrequentColor = null;
    var maxFrequency = -1;

    for (var color in colorFrequencies) {
      if (colorFrequencies[color] > maxFrequency) {
        mostFrequentColor = color;
        maxFrequency = colorFrequencies[color];
      }
    }

    console.log("Most prominent color: " + mostFrequentColor);
    return mostFrequentColor;
  };

  const downloadImage = () => {
    this.href = editor.canvas.toDataURL({
      format: "png",
      quality: 0.8,
    });
    this.download = "testimage.png";
  };

  const changeColor = (e) => {
    setSelectedColor(e.target.value);
    const rgbSelectedColor = hexToRgb(selectedColor);
    const rgbNewColor = hexToRgb(e.target.value);
    recolorImage(
      editor.canvas,
      rgbSelectedColor.r,
      rgbSelectedColor.g,
      rgbSelectedColor.b,
      rgbNewColor.r,
      rgbNewColor.g,
      rgbNewColor.b
    );
    setFetchColors([
      ...fetchColors?.map((color, index) => {
        if (index == selectedColorIndex) {
          return (color = e.target.value);
        }
        return color;
      }),
    ]);
  };

  const revertColor = (item, selectedIndex) => {
    const color = hexToRgb(
      item.color == "#100100100" ? "#FFFFFF" : exColors[selectedIndex].hex
    );
    const replaceColor = hexToRgb(
      item.reverted == "#100100100" ? "#FFFFFF" : item.reverted
    );
    setFetchColors([
      ...fetchColors.map((item, index) => {
        if (index == selectedIndex) {
          return {
            ...item,
            reverted: null,
            color: item.color,
          };
        }
        return item;
      }),
    ]);
    recolorImage(
      editor.canvas,
      replaceColor.r,
      replaceColor.g,
      replaceColor.b,
      color.r,
      color.g,
      color.b,
      false
    );
  };

  //  function constrainObject(object) {
  //     const canvasWidth = canvas.width;
  //     const canvasHeight = canvas.height;

  //     object.setCoords();

  //     if (object.left < 0) {
  //       object.left = 0;
  //     } else if (object.left + object.width > canvasWidth) {
  //       object.left = canvasWidth - object.width;
  //     }

  //     if (object.top < 0) {
  //       object.top = 0;
  //     } else if (object.top + object.height > canvasHeight) {
  //       object.top = canvasHeight - object.height;
  //     }
  //   }

  useEffect(() => {
    if (!firstRender.current) createCanvasAndFetchColor(uploadedImage.current);
    firstRender.current = false;
  }, [treshold]);

  // useMemo(() => {
  //   if (editor) {
  //     editor.canvas.on("object:moving", function (e) {
  //       debugger
  //       e.e.preventDefault();
  //       if (imgData) {
  //         console.log("moving", imgData, e);
  //         upateImage(imgData);
  //       }
  //     });
  //     editor.canvas.on("selection:created", function (e) {
  //       e.e.preventDefault();
  //       if (imgData) {
  //         console.log("created", imgData, e);
  //         upateImage(imgData);
  //       }
  //     });
  //     editor.canvas.on("selection:cleared", function (e) {
  //       // e.e.preventDefault();
  //       if (imgData) {
  //         console.log("cleared", imgData, e);
  //         upateImage(imgData);
  //       }
  //     });
  //   }
  // }, []);

  const selectedExtractedColor = (color, key) => {
    console.log(color.hex, key, "selectedExtractedColor");
    selectedExtractedColorVal(color);
    setSelectedColorIndex(key);
  };

  const debouncedSetPickedColor = debounce((newColor) => {
    setPickedColor(newColor);
  }, 0);

  // useMemo(() => {
  //   if (editor) {
  //     editor.canvas.on("object:moving", function (e) {
  //       e.e.preventDefault();
  //       if (imgData) {
  //         console.log("moving", imgData, e);
  //         // upateImage(imgData);
  //       }
  //     });
  //     editor.canvas.on("selection:created", function (e) {
  //       console.log(e);
  //       e.e.preventDefault();
  //       if (imgData) {
  //         console.log("created", imgData, e);
  //         upateImage(imgData);
  //       }
  //     });
  //     editor.canvas.on("selection:cleared", function (e) {
  //       // e.e.preventDefault();
  //       if (imgData) {
  //         console.log("cleared", imgData, e);
  //         upateImage(imgData);
  //       }
  //     });
  //   }
  //   // fetchFontFamily();
  // }, []);

  const modifiedCanvasRef = useRef(null);

  useEffect(() => {
    if (
      pickedColor !== null &&
      extractedColorVal !== null &&
      imgData !== null
    ) {
      console.log(pickedColor, "picked");
      console.log(extratColors, "extratColors");

      if (uploadedImage.current) {
        // Create a new Image element to hold the modified image
        const modifiedImg = new Image();
        modifiedImg.src = uploadedImage.current.src;

        let newWidth = modifiedImg.width;
        let newHeight = modifiedImg.height;
        // if (newWidth > 600 || newHeight > 600) {
        //   if (newWidth > newHeight) {
        //     newWidth = 500;
        //     newHeight = (modifiedImg.height / modifiedImg.width) * 500;
        //   } else {
        //     newHeight = 500;
        //     newWidth = (modifiedImg.width / modifiedImg.height) * 500;
        //   }
        // }

        if (!modifiedCanvasRef.current) {
          console.log("making canvas");
          modifiedCanvasRef.current = document.createElement("canvas");
        }

        modifiedCanvasRef.current.width = newWidth;
        modifiedCanvasRef.current.height = newHeight;

        const ctx = modifiedCanvasRef.current.getContext("2d");
        ctx.drawImage(modifiedImg, 0, 0, newWidth, newHeight);

        const imageData = ctx.getImageData(
          0,
          0,
          modifiedCanvasRef.current.width,
          modifiedCanvasRef.current.height
        );
        const data = new Uint32Array(imageData.data.buffer);

        const tolerance = 14;
        const batchPixelCount = 1000;

        const pickedRgbColor = hexToRgb(pickedColor);

        for (let i = 0; i < data.length; i += batchPixelCount) {
          for (let j = i; j < Math.min(i + batchPixelCount, data.length); j++) {
            var pixel = data[j];
            var red = pixel & 0xff;
            var green = (pixel >> 8) & 0xff;
            var blue = (pixel >> 16) & 0xff;
            var alpha = pixel;

            if (alpha === 0) {
              continue;
            }

            let dominantColor = exColors[selectedColorIndex].hex;

            let CP = hexToRgb(dominantColor);

            CP = { r: CP[0], g: CP[1], b: CP[2] };
            const isClosest = CD.compare(CP, { r: red, g: green, b: blue }, "rgb");
            if (isClosest < tolerance) {
              data[j] =
                (255 << 24) |
                (pickedRgbColor[2] << 16) |
                (pickedRgbColor[1] << 8) |
                pickedRgbColor[0];
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        uploadedImage.current.src = modifiedCanvasRef.current.toDataURL();

        // update the exColor array with the new color
        const newExColors = [...exColors];
        newExColors[selectedColorIndex].hex = pickedColor;
        setExColors(newExColors);

        // Update the canvas on the main FabricJS editor
        const fabricImage = editor.canvas.item(0);
        if (fabricImage) {
          fabricImage.setElement(modifiedCanvasRef.current);
          fabricImage.setCoords();
          editor.canvas.renderAll();
        }
      }
    }
  }, [pickedColor]);

  const handleThreshold = (type) => {
    if (type == "plus" && treshold < 1) {
      setTreshold(parseFloat(treshold) + 0.01);
      setExtractColors([])

    }
    if (type == "minus" && treshold > 0) {
      setTreshold(parseFloat(treshold) - 0.01);
      setExtractColors([])
    }
  };

  const MakeSingleColorinvert = (value) => {
    setMakeSingleColorInvert(value);
    const object = editor.canvas.getActiveObject();
    if (value) {
      if (object instanceof fabric.Image) {
        // Convert the selected image to grayscale
        object.filters.push(new fabric.Image.filters.Invert());
        object.applyFilters();
        editor.canvas.renderAll();
      }
    } else {
      // object.filters.length = 0; // Remove all filters
      const filters = object.filters;
      if (filters && filters.length > 0) {
        for (let i = filters.length - 1; i >= 0; i--) {
          if (filters[i] instanceof fabric.Image.filters.Invert) {
            filters.splice(i, 1); // Remove the grayscale filter
          }
        }
      }
      object.applyFilters();
      editor.canvas.renderAll();
    }
  };

  const MakeSingleColor = (value) => {
    setMakeSingleColor(value);
    const object = editor.canvas.getActiveObject();
    if (value) {
      if (object instanceof fabric.Image) {
        // Convert the selected image to grayscale
        object.filters.push(new fabric.Image.filters.Grayscale());
        object.applyFilters();
        editor.canvas.renderAll();
      }
    } else {
      // object.filters.length = 0; // Remove all filters
      const filters = object.filters;
      if (filters && filters.length > 0) {
        for (let i = filters.length - 1; i >= 0; i--) {
          if (filters[i] instanceof fabric.Image.filters.Grayscale) {
            filters.splice(i, 1); // Remove the grayscale filter
          }
        }
      }
      object.applyFilters();
      editor.canvas.renderAll();
    }
  };

  const MakeOneColor = (value) => {
    setMakeOneColor(value);
    const object = editor.canvas.getActiveObject();
    if (value) {
      setMakeSingleColor(false);
      setMakeSingleColorInvert(false);
      if (object instanceof fabric.Image) {
        // Convert the selected image to grayscale
        object.filters.push(
          new fabric.Image.filters.BlendColor({
            color: makeOneColorCode,
            mode: "tint",
            alpha: 1,
          })
        );
        object.applyFilters();
        editor.canvas.renderAll();
      }
    } else {
      // object.filters.length = 0; // Remove all filters
      const filters = object.filters;
      if (filters && filters.length > 0) {
        for (let i = filters.length - 1; i >= 0; i--) {
          if (filters[i] instanceof fabric.Image.filters.BlendColor) {
            filters.splice(i, 1); // Remove the grayscale filter
          }
        }
      }
      object.applyFilters();
      editor.canvas.renderAll();
    }
  };

  const handleMakeOneColor = (event, flag = false) => {
    // saveObjectState();
    var color = objectRgbToHex(event.target.style.backgroundColor);
    console.log(event, color);
    setMakeOneColorCode(color);
    const object = editor.canvas.getActiveObject();
    if (object instanceof fabric.Image) {
      object.filters.push(
        new fabric.Image.filters.BlendColor({
          color: color,
          mode: "tint",
          alpha: 1,
        })
      );
      object.applyFilters();
      editor.canvas.renderAll();
      editor.canvas.setActiveObject(object);
    }
  };

  function checkIfActiveObjectIsText() {
    var flag = false;
    const object = editor.canvas.getActiveObject();
    console.log(object);
    if (object) {
      flag = true;
    }
    return flag;
  }

  function handleImageSize(scaleFactor) {
    setSize(scaleFactor);
    // Get the selected object on the canvas
    var selectedObject = editor.canvas.getActiveObject();

    if (selectedObject && selectedObject.type === "image") {
      // Calculate new width and height based on the original dimensions and scaleFactor
      var originalWidth = selectedObject.width;
      var originalHeight = selectedObject.height;

      var newWidth = originalWidth * scaleFactor;
      var newHeight = originalHeight * scaleFactor;

      // Maintain aspect ratio while resizing the object
      selectedObject.set({
        scaleX: newWidth / originalWidth,
        scaleY: newHeight / originalHeight,
      });

      // Render the canvas to see the changes
      editor.canvas.renderAll();
    }
  }

  function flipXContent() {
    const object = editor.canvas.getActiveObject();
    setFlipX(!object.flipX);
    object.flipX = !object.flipX;
    editor.canvas.add(object);
    editor.canvas.setActiveObject(object);
    editor.canvas.renderAll();
  }

  function flipYContent() {
    const object = editor.canvas.getActiveObject();
    setFlipY(!object.flipY);
    object.flipY = !object.flipY;
    editor.canvas.add(object);
    editor.canvas.renderAll();
  }

  function handleRotation(value) {
    const object = editor.canvas.getActiveObject();
    if (object.angle == 0) {
      // saveObjectState();
    }
    setRotation(value);
    object.angle = value; // No vertical skew
    editor.canvas.setActiveObject(object);
    editor.canvas.renderAll();
  }

  return (
    <div>
      <div
        className="backButton"
        onClick={() => {
          setOptionType("");
          // handleDelete();
        }}
      >
        <X className="close" />
      </div>
      {!logoImg?.target?.value ? (
        <div className="inputWrapper">
          <input
            ref={btnRef}
            type="file"
            id="tshirt-custompicture"
            defaultValue={logoImg?.target?.value}
            onChange={changeImage}
          />
          <span>Click here to upload</span>
        </div>
      ) : (
        ""
      )}

      {checkIfActiveObjectIsText ? (
        <>
          {logoImg ? (
            <>
              <div className="field-row">
                <label className="mt-2">Remove background</label>
                <Form.Check
                  type="switch"
                  id="custom-switch"
                  onChange={(e) => removeBgColor(e.currentTarget.checked)}
                  checked={bgRemove}
                />
              </div>
            </>
          ) : null}

          {exColors?.length > 0 ? (
            <div className="field-row">
              <label className="">
                Add more colors ({parseInt(101 - (treshold / 1) * 100)}%)
              </label>

              <div className="quantityWrapper">
                <Button
                  disabled={treshold > 1 ? "disabled" : ""}
                  onClick={() => handleThreshold("plus")}
                >
                  <Dash />{" "}
                </Button>
                <Button
                  disabled={
                    treshold < 0.01 && exColors.length == 1 ? "disabled" : ""
                  }
                  className="ms-3"
                  onClick={() => handleThreshold("minus")}
                >
                  <Plus />{" "}
                </Button>
              </div>
            </div>
          ) : (
            ""
          )}

          {logoImg && !makeOneColor ? (
            <>
              <div className="field-row">
                <label className="mt-2">Single color</label>
                <Form.Check
                  type="switch"
                  id="custom-switch-make-single-color"
                  onChange={(e) => MakeSingleColor(e.currentTarget.checked)}
                  checked={makeSingleColor}
                />
              </div>
            </>
          ) : null}

          {makeSingleColor && !makeOneColor ? (
            <>
              <div className="field-row">
                <label className="mt-2">Invert color</label>
                <Form.Check
                  type="switch"
                  id="custom-switch-invert-color"
                  onChange={(e) =>
                    MakeSingleColorinvert(e.currentTarget.checked)
                  }
                  checked={makeSingleColorInvert}
                />
              </div>
            </>
          ) : null}

          {logoImg && !makeSingleColor ? (
            <>
              <div className="field-row">
                <label className="mt-2">Make one color</label>
                <Form.Check
                  type="switch"
                  id="custom-switch-make-one-color"
                  onChange={(e) => MakeOneColor(e.currentTarget.checked)}
                  checked={makeOneColor}
                />
              </div>
            </>
          ) : null}

          {makeOneColor && !makeSingleColor ? (
            <div className="field-row">
              <label className="mt-2">Select color</label>
              <div
                className="selectBox"
                onClick={() => showMakeOneColorDetailBox(true)}
              >
                <div
                  className="selectedColor"
                  style={{ backgroundColor: makeOneColorCode }}
                ></div>
                <ChevronRight />
              </div>
              {makeOneColorDetailBox ? (
                <DetailBox
                  type="textColor"
                  value={makeOneColorCode}
                  handleChange={handleMakeOneColor}
                  closeBox={() => {
                    showMakeOneColorDetailBox(false);
                  }}
                />
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}

          {logoImg ? (
            <>
              <div className="field-row">
                <label>Size</label>
                <input
                  className="w-100"
                  type="range"
                  defaultValue={size}
                  value={size}
                  min={0.05}
                  max={0.5}
                  step={0.001}
                  onChange={(e) => handleImageSize(e.target.value)}
                />
              </div>

              <div className="field-row">
                <label>Rotation</label>
                <input
                  className="w-100"
                  type="range"
                  defaultValue={rotation}
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(e) => handleRotation(e.target.value)}
                />
              </div>
            </>
          ) : (
            ""
          )}

          {logoImg ? (
            <div className="field-row">
              <label className="mt-2">Image color</label>
              <div
                className="imageColorBox"
                onClick={() => showImageColorDetailBox(true)}
              >
                <div id="palette" className="py-3">
                  {exColors?.slice(0, 4).map((color, index) => {
                    return (
                      <div
                        key={index}
                        onClick={() => selectedExtractedColor(color, index)}
                        style={{
                          border:
                            color === extractedColorVal
                              ? "2px solid red"
                              : "none",
                          backgroundColor:
                            color.hex == "#100100100" ? "#FFFFFF" : color.hex,
                        }}
                      ></div>
                    );
                  })}
                </div>
                <ChevronRight />
              </div>
            </div>
          ) : (
            ""
          )}

          {logoImg ? (
            <div className="d-flex justify-content-between mt-3">
              <div className="btnLabel">
                <Button
                  className={`btnTab`}
                  onClick={() => objectCenter(editor)}
                >
                  <TextCenter />
                </Button>
                <label>Center</label>
              </div>
              <div className="btnLabel">
                <div className="btnGroup">
                  <Button
                    className={`${flipX ? "active" : ""} btnTab`}
                    onClick={flipXContent}
                  >
                    <SymmetryHorizontal />
                  </Button>
                  <Button
                    className={`${flipY ? "active" : ""} btnTab`}
                    onClick={flipYContent}
                  >
                    <SymmetryVertical />
                  </Button>
                </div>
                <label>Flip</label>
              </div>
            </div>
          ) : (
            ""
          )}
        </>
      ) : (
        ""
      )}

      {/* <div id="palette" className="pt-4 pb-2">
        {fetchColors?.map((item, index) => {
          return (
            <div
              key={index}
              data-color={item.color == "#100100100" ? "#FFFFFF" : item.color}
              className={
                item.color == selectedColor ||
                (item.color == "#100100100" && selectedColor == "#FFFFFF")
                  ? "active"
                  : ""
              }
              style={{
                backgroundColor:
                  item.reverted == "#100100100"
                    ? "#FFFFFF"
                    : item.reverted
                    ? item.reverted
                    : item.color == "#100100100"
                    ? "#FFFFFF"
                    : item.color,
                cursor: item.reverted ? "default" : "pointer",
              }}
              onClick={() =>
                item.reverted
                  ? null
                  : setColor(
                      item.color == "#100100100" ? "#FFFFFF" : item.color,
                      index
                    )
              }
            >
              <div
                className="reverted"
                style={{
                  backgroundColor: item.reverted
                    ? item.color == "#100100100"
                      ? "#FFFFFF"
                      : item.color
                    : null,
                }}
                onClick={() => revertColor(item, index)}
              ></div>
            </div>
          );
        })}
      </div> */}

      {imageColorDetailBox ? (
        <div className="imageDetailBox">
          {exColors?.length > 0 ? (
            <div className="field-row">
              <label className="">
                Add more colors ({parseInt(101 - (treshold / 1) * 100)}%)
              </label>

              <div className="quantityWrapper">
                <Button
                  disabled={treshold > 1 ? "disabled" : ""}
                  onClick={() => handleThreshold("plus")}
                >
                  <Dash />{" "}
                </Button>
                <Button
                  disabled={
                    treshold < 0.01 && exColors.length == 1 ? "disabled" : ""
                  }
                  className="ms-3"
                  onClick={() => handleThreshold("minus")}
                >
                  <Plus />{" "}
                </Button>
              </div>
            </div>
          ) : (
            ""
          )}
          <span>Image color</span>


      {/* <div id="palette" className="pt-4 pb-2">
        {exColors?.map((color, index) => {
          const excol = extratColors[index]; // Get the corresponding extratColor
          console.log(color, "color");
          return (
            <div
              key={index}
              style={{
                border: color === extractedColorVal ? "2px solid red" : "none",
                backgroundColor: color.hex === "#100100100" ? "#FFFFFF" : color.hex,
              }}
            >
              <div
                key={index}
                onClick={() => {
                  console.log("pock", excol)
                  setPickedColor(excol.hex)
                  // revertPalette(excol, index, color);
                  selectedExtractedColor(color, index)
                  console.log("clicked", excol);
                }}
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: excol?.hex,
                  position: "absolute",
                  zIndex: "1",
                  top: "0px",
                  right: "0px",
                  border: "1px solid white",
                }}
              ></div>
            </div>
          );
        })}
      </div> */}


          <div id="palette" className="py-3">
            {exColors?.map((color, index) => {
              const excol = extratColors[index]; // Get the corresponding extratColor
              return (
                <div
                  key={index}
                  onClick={() => selectedExtractedColor(color, index)}
                  style={{
                    border:
                      color === extractedColorVal ? "2px solid red" : "none",
                    backgroundColor:
                      color.hex == "#100100100" ? "#FFFFFF" : color.hex,
                  }}
                >
                  <div
                    key={index}
                    onClick={() => {
                      // console.log("pock", excol);
                      setPickedColor(excol.hex);
                      // revertPalette(excol, index, color);
                      selectedExtractedColor(color, index);
                      console.log("clicked", excol);
                    }}
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: excol?.hex,
                      position: "absolute",
                      zIndex: "1",
                      top: "0px",
                      right: "0px",
                      border: "1px solid white",
                    }}
                  ></div>
                </div>
              );
            })}
          </div>

          <span>Select color</span>
          {logoImg ? (
            <div id="palette" className="small py-3">
              {preDefinedColors?.map((color, index) => {
                return (
                  <div
                    key={index}
                    // data-color={rgbToHex(color)}
                    // className={color == selectedColor ? "active" : ""}
                    style={{
                      backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                    }}
                    onClick={() => {
                      console.log(rgbToHexP(color));
                      setPickedColor(rgbToHexP(color));
                    }}
                  ></div>
                );
              })}
            </div>
          ) : (
            ""
          )}

          <Button className="" onClick={() => showImageColorDetailBox(false)}>
            Back
          </Button>
          <Button
            className="float-right"
            onClick={() => showImageColorDetailBox(false)}
          >
            Done
          </Button>
        </div>
      ) : (
        ""
      )}



      {/* Color Picker */}
      {/* {logoImg ? (
        <input
          type="color"
          value={pickedColor}
          onChange={(e) => debouncedSetPickedColor(e.target.value)} // Call the debounced function
        />
      )
        : null} */}

      {/* <img id="image" src="" /> */}
    </div>
  );
};

export default ImageComponent;
