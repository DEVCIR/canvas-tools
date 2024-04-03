import { useState } from "react";
import { useMemo } from "react";
import { Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import FontPicker from "font-picker-react";
import { fabric } from "fabric";
import { objectRgbToHex, rgbToHex } from "../../helpers/colorHelpers";
import { preDefinedColors } from "../../constants";
import {
  ArrowLeft,
  SymmetryVertical,
  SymmetryHorizontal,
  TrashFill,
  TextCenter,
  Front,
  Back,
  Plus,
  ChevronRight,
  X,
  ArrowCounterclockwise,
  ArrowClockwise,
} from "react-bootstrap-icons";
import {
  bringToFront,
  objectCenter,
  removeActiveObject,
  sendToBack,
} from "../../helpers/canvasHelpers";
import DetailBox from "./DetailBox";
import axios from "axios";
import FontDetailBox from "./FontDetailBox";
import { mergeDuplicateObjects } from "../../helpers/commonHelper";
import UndoImg from "../../assets/img/undo_icon.png" 
import RedoImg from "../../assets/img/redo_icon.png" 

const TextComponent = (props) => {
  const { setOptionType, deleteAll, editor, fonts } = props;
  const [textValue, setTextValue] = useState("");
  const [fontFamily, setFontFamily] = useState("Montserrat");
  const [fontSize, setFontSize] = useState(30);
  const [fontWeight, setFontWeight] = useState(400);
  const [fontColor, setFontColor] = useState("#000000");
  const [checkOutline, setCheckOutline] = useState(false);
  const [outlineWidth, setOutlineWidth] = useState(0);
  const [outlineColor, setOutlineColor] = useState(null);
  const [editorMode, setEditorMode] = useState(false);
  const [skewX, setSkewX] = useState(0);
  const [skewY, setSkewY] = useState(0);
  const [flipX, setFlipX] = useState(0);
  const [flipY, setFlipY] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [textAdded, setTextAdded] = useState(false);
  const [colorDetail, showColorDetail] = useState(false);
  const [fontDetail, showFontDetail] = useState(false);
  const [outlineDetail, showOutlineDetail] = useState(false);
  const [spacing, setSpacing] = useState(0);
  const [undoStack, setUndo] = useState([]);
  const [redoStack, setRedo] = useState([]);
  // const undoStack = [];
  // const redoStack = [];

  const textOpacity = (value) => {
    const object = editor.canvas.getActiveObject();
    setOpacity(Number(value));
    object.opacity = Number(value);
    editor.canvas.add(object);
    editor.canvas.renderAll();
  };

  const textFontFamily = async (value) => {
    saveObjectState();
    setTimeout(function () {
      if (value) {
        const object = editor.canvas.getActiveObject();
        setFontFamily(value);
        object.set({ fontFamily: value });
        editor.canvas.add(object);
        editor.canvas.setActiveObject(object);
        editor.canvas.renderAll();
      }
    }, 500);
  };

  function handleTextValue(value) {
    saveObjectState();
    setTimeout(function () {
      if (value) {
        const object = editor.canvas.getActiveObject();
        setTextValue(value);
        object.set({ text: value });
        editor.canvas.add(object);
        editor.canvas.setActiveObject(object);
        editor.canvas.renderAll();
      }
    }, 100);
  }

  function textFontSize(value) {
    saveObjectState();
    const object = editor.canvas.getActiveObject();
    setFontSize(value);
    object.set({ fontSize: value });
    editor.canvas.add(object);
    editor.canvas.setActiveObject(object);
    editor.canvas.renderAll();
  }

  function textFontColor(event, flag = false) {
    saveObjectState();
    var color = objectRgbToHex(event.target.style.backgroundColor);
    const object = editor.canvas.getActiveObject();
    if (flag) {
      setFontColor("#00000000");
      object.set({ fill: "#00000000" });
    } else {
      setFontColor(color);
      object.set({ fill: color });
    }
    editor.canvas.add(object);
    editor.canvas.setActiveObject(object);
    editor.canvas.renderAll();
  }

  function textFontWeight(value) {
    saveObjectState();
    setFontWeight(value);
    const object = editor.canvas.getActiveObject();
    object.set({ fontWeight: value });
    // var updatedText = new fabric.Text(object.text, {
    //     fontWeight: value,
    //     ...object
    // });
    // object.fontWeight = value;
    // editor.canvas.remove(object);
    // editor.canvas.renderAll();
    editor.canvas.add(object);
    editor.canvas.setActiveObject(object);
    editor.canvas.renderAll();
  }

  function flipXContent() {
    saveObjectState();
    const object = editor.canvas.getActiveObject();
    setFlipX(!object.flipX);
    object.flipX = !object.flipX;
    editor.canvas.add(object);
    editor.canvas.setActiveObject(object);
    editor.canvas.renderAll();
  }

  function flipYContent() {
    saveObjectState();
    const object = editor.canvas.getActiveObject();
    setFlipY(!object.flipY);
    object.flipY = !object.flipY;
    editor.canvas.add(object);
    editor.canvas.renderAll();
  }

  function textSkewX(value) {
    const object = editor.canvas.getActiveObject();
    if (object.skewX == 0) {
      saveObjectState();
    }
    setSkewX(value);
    object.skewX = value; // Skew horizontally by 30 degrees
    editor.canvas.setActiveObject(object);
    editor.canvas.renderAll();
  }

  function textSkewY(value) {
    const object = editor.canvas.getActiveObject();
    if (object.skewY == 0) {
      saveObjectState();
    }
    setSkewY(value);
    object.skewY = value; // No vertical skew
    editor.canvas.setActiveObject(object);
    editor.canvas.renderAll();
  }

  function textRotation(value) {
    const object = editor.canvas.getActiveObject();
    if (object.angle == 0) {
      saveObjectState();
    }
    setRotation(value);
    object.angle = value; // No vertical skew
    editor.canvas.setActiveObject(object);
    editor.canvas.renderAll();
  }

  function textSpacing(value) {
    const object = editor.canvas.getActiveObject();
    setSpacing(value);
    if (object.charSpacing == 0) {
      saveObjectState();
    }
    object.charSpacing = value; // No vertical skew
    editor.canvas.setActiveObject(object);
    editor.canvas.renderAll();
  }

  function handleOutlineCheck(value) {
    setCheckOutline(value);
    showOutlineDetail(value);
    if (value) {
      const object = editor.canvas.getActiveObject();
      object.set({
        stroke: outlineColor ? outlineColor : "#BDBBBB",
        strokeWidth: outlineWidth ? outlineWidth : 0.3,
        strokeOffset: outlineColor ? outlineColor : "#BDBBBB",
      });
      object.setCoords();
      editor.canvas.add(object);
      if (outlineColor == null && outlineWidth == 0) {
        setOutlineWidth(0.3);
        setOutlineColor("#BDBBBB");
      }
      editor.canvas.setActiveObject(object);
      editor.canvas.renderAll();
    } else {
      const object = editor.canvas.getActiveObject();
      object.set({ stroke: null, strokeWidth: 0, strokeOffset: null });
      setOutlineWidth(0);
      setOutlineColor(null);
      object.setCoords();
      editor.canvas.add(object);
      editor.canvas.setActiveObject(object);
      editor.canvas.renderAll();
    }
  }

  function handleOutlineWidth(value) {
    saveObjectState();
    setOutlineWidth(Number(value));
    const object = editor.canvas.getActiveObject();
    object.set({ strokeWidth: Number(value), strokeOffset: outlineColor });
    editor.canvas.add(object);
    editor.canvas.setActiveObject(object);
    editor.canvas.renderAll();
    object.setCoords();
  }

  function handleOutlineColor(event) {
    saveObjectState();
    var color = objectRgbToHex(event.target.style.backgroundColor);
    setOutlineColor(color);
    const object = editor.canvas.getActiveObject();
    object.set({ stroke: color });
    editor.canvas.add(object);
    editor.canvas.setActiveObject(object);
    editor.canvas.renderAll();
    object.setCoords();
  }

  function checkIfActiveObjectIsText() {
    var flag = false;
    const object = editor.canvas.getActiveObject();
    if (object && object.text) {
      flag = true;
    }
    return flag;
  }

  function addText() {
    setTextAdded(true);
    saveObjectState();
    if (textValue) {
      if (editorMode) {
        const object = editor.canvas.getActiveObject();
        object.text = textValue;
        object.fontSize = fontSize;
        object.fontFamily = fontFamily;
        object.fill = fontColor;
        object.fontWeight = fontWeight;

        if (object.stroke && object.strokeWidth) {
          object.stroke = outlineColor;
          object.strokeWidth = Number(outlineWidth);
        }

        editor.canvas.add(object);
        editor.canvas.renderAll();
        // saveObjectState(object);
      } else {
        var data = {
          fontSize: fontSize,
          fontFamily: fontFamily,
          fill: fontColor,
          fontWeight: fontWeight,
          originX: "center",
          originY: "center",
        };

        if (checkOutline) {
          data.stroke = outlineColor; // Outline color
          data.strokeWidth = Number(outlineWidth); // Outline width
        }

        const text = new fabric.Text(textValue, data);

        text.setControlVisible("ml", false); // Middle-left control
        text.setControlVisible("mb", false); // Middle-bottom control
        text.setControlVisible("mr", false); // Middle-right control
        text.setControlVisible("mt", false); // Middle-top control

        editor.canvas.centerObject(text);
        editor.canvas.add(text);
        editor.canvas.setActiveObject(text);
        editor.canvas.renderAll();
        setEditorMode(true);
        // saveObjectState(text);
      }
      // resetTextOptions();
    }
  }

  function setFields(object) {
    if (object) {
      setFontSize(object.fontSize);
      setTextValue(object.text);
      setFontFamily(object.fontFamily);
      setFontWeight(object.fontWeight);
      setFontColor(object.fill);

      if (object.angle) {
        setRotation(object.angle);
      }

      if (object.skewY) {
        setSkewY(object.skewY);
      }

      if (object.skewX) {
        setSkewX(object.skewX);
      }

      if (object.flipX) {
        setFlipX(object.flipX);
      }

      if (object.flipY) {
        setFlipY(object.flipY);
      }

      if (object.stroke && object.strokeWidth) {
        setCheckOutline(true);
        setOutlineColor(object.stroke);
        setOutlineWidth(object.strokeWidth);
      }

      if (object.charSpacing != null || object.charSpacing != undefined) {
        setSpacing(object.charSpacing);
      }
    }
  }

  function getText() {
    var text;
    var object = editor.canvas.getActiveObject();
    if (object) {
      text = object.text;
    }
    return text;
  }

  function resetTextOptions() {
    setFontSize(30);
    setTextValue("");
    setFontFamily("Montserrat");
    setFontWeight(400);
    setFontColor("#000000");
    setCheckOutline(false);
    setOutlineColor("#c3c3c3");
    setOutlineWidth(1);
    setRotation(0);
    setSkewX(0);
    setSkewY(0);
    setFlipX(false);
    setFlipY(false);
    showColorDetail(false);
    showFontDetail(false);
    showOutlineDetail(false);
    setSpacing(0);
  }

  const saveObjectState = (obj) => {
    var saveState = editor.canvas.toJSON();
    console.log("canvas saved");
    setUndo(saveState);
  };

  const undo = () => {
    if (undoStack != null && undoStack != undefined) {
      setRedo(editor.canvas.toJSON());
      deleteAll(editor);
      editor.canvas.loadFromJSON(undoStack);
      editor.canvas.renderAll();
    }
  };

  const redo = () => {
    if (redoStack != null && redoStack != undefined) {
      setUndo(editor.canvas.toJSON());
      deleteAll(editor);
      var objects = mergeDuplicateObjects(redoStack.objects);
      editor.canvas.loadFromJSON({ ...redoStack, objects });
      editor.canvas.renderAll();
    }
  };

  useMemo(() => {
    if (editor) {
      editor.canvas.on("selection:created", function (e) {
        setEditorMode(true);
        setTextAdded(true);
        showColorDetail(false);
        showFontDetail(false);
        showOutlineDetail(false);
        if (e?.selected?.length) {
          setFields(e.selected[0]);
        }
      });

      editor.canvas.on("selection:updated", function (e) {
        setTextAdded(true);
        setEditorMode(true);
        showColorDetail(false);
        showFontDetail(false);
        showOutlineDetail(false);
        if (e?.selected?.length) {
          setFields(e.selected[0]);
        }
      });

      editor.canvas.on("before:selection:cleared", function (e) {
        setTextAdded(false);
        setEditorMode(false);
        resetTextOptions();
      });

      // editor.canvas.on("object:modified", saveObjectState(editor.canvas.getActiveObject()));

      document.addEventListener("keydown", function (event) {
        if (event.keyCode === 46) {
          if (editor) {
            removeActiveObject(editor); // Remove the selected object
          }
        }
      });
    }

    return () => {
      document.removeEventListener("keydown");
    };
  }, [editor]);

  return (
    <div className="">
      <div
        className="backButton"
        onClick={() => {
          setOptionType("");
          setEditorMode(false);
          setTextAdded(false);
          editor.canvas.discardActiveObject();
        }}
      >
        <X className="close" />
      </div>

      {!textAdded ? (
        <div className="text-center">
          <form onSubmit={addText}>
            <input
              className="form-control field-title mb-3"
              type="text"
              placeholder="Enter text here"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
            />

            <Button
              className=""
              type="submit"
              disabled={textValue.length > 0 ? "" : "disabled"}
            >
              Add to design
            </Button>
          </form>
        </div>
      ) : (
        ""
      )}
      {checkIfActiveObjectIsText() && textValue ? (
        <>
          <button className="undo" onClick={undo}>
            <img src={UndoImg} />
          </button>
          <button className="redo" onClick={redo}>
            <img src={RedoImg} />
          </button>
          <input
            className="form-control field-title mb-3"
            type="text"
            placeholder="Enter text here"
            value={textValue}
            onChange={(e) => handleTextValue(e.target.value)}
          />
          <div className="field-row">
            <label>Font</label>
            <div className="" onClick={() => showFontDetail(true)}>
              <span
                className="fontPlaceholder pe-2"
                style={{ fontFamily: fontFamily }}
              >
                {fontFamily}
              </span>
              <ChevronRight />
            </div>
            {fontDetail ? (
              <FontDetailBox
                text={getText()}
                fonts={fonts}
                value={fontFamily}
                handleChange={textFontFamily}
                closeBox={() => {
                  showFontDetail(false);
                }}
              />
            ) : (
              ""
            )}
          </div>

          <div className="field-row">
            <label className="mt-2">Text color</label>
            <div className="selectBox" onClick={() => showColorDetail(true)}>
              <div
                className="selectedColor"
                style={{ backgroundColor: fontColor }}
              ></div>
              <ChevronRight />
            </div>
            {colorDetail ? (
              <DetailBox
                type="textColor"
                value={fontColor}
                handleChange={textFontColor}
                closeBox={() => {
                  showColorDetail(false);
                }}
              />
            ) : (
              ""
            )}
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
              onChange={(e) => textRotation(e.target.value)}
            />
          </div>
          <div className="field-row">
            <label>Spacing</label>
            <input
              className="w-100"
              type="range"
              defaultValue={spacing}
              value={spacing}
              min={0}
              max={1000}
              step={10}
              onChange={(e) => textSpacing(e.target.value)}
            />
          </div>
          <div className="field-row">
            <label>Outline</label>
            <div className="selectBox" onClick={() => handleOutlineCheck(true)}>
              {checkOutline ? (
                <div
                  className="selectedColor"
                  style={{ backgroundColor: outlineColor }}
                ></div>
              ) : (
                <span className="me-2" style={{ cursor: "pointer" }}>
                  None
                </span>
              )}
              <ChevronRight />
            </div>
            {outlineDetail ? (
              <DetailBox
                type="outline"
                value={outlineWidth}
                handleChange={handleOutlineWidth}
                value2={outlineColor}
                handleChange2={handleOutlineColor}
                closeBox={() => {
                  showOutlineDetail(false);
                }}
                reset={() => {
                  handleOutlineCheck(false);
                }}
              />
            ) : (
              ""
            )}
          </div>
          <div className="field-row">
            <label>Text size</label>
            <input
              className="form-control"
              type="text"
              value={fontSize}
              onChange={(e) => textFontSize(e.target.value)}
            />
          </div>

          <div className="field-row">
            <label>Font Weight</label>
            <select
              className="form-control"
              value={fontWeight}
              onChange={(e) => textFontWeight(e.target.value)}
            >
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="500">500</option>
              <option value="600">600</option>
              <option value="700">700</option>
              <option value="800">800</option>
            </select>
          </div>

          <div className="field-row">
            <label>Skew X</label>
            <input
              className="w-100"
              type="range"
              defaultValue={skewX}
              value={skewX}
              min={0}
              max={100}
              step={1}
              onChange={(e) => textSkewX(e.target.value)}
            />
          </div>
          <div className="field-row">
            <label>Skew Y</label>
            <input
              className="w-100"
              type="range"
              defaultValue={skewY}
              value={skewY}
              min={0}
              max={100}
              step={1}
              onChange={(e) => textSkewY(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-between mt-3">
            <div className="btnLabel">
              <Button className={`btnTab`} onClick={() => objectCenter(editor)}>
                <TextCenter />
              </Button>
              <label>Center</label>
            </div>
            <div className="btnLabel">
              <Button className={`btnTab`} onClick={() => bringToFront(editor)}>
                <Front />
              </Button>
              <label>Bring to front</label>
            </div>
            {/* <Button className={`btnTab mx-2`} onClick={() => sendToBack(editor)}>
              <Back />
            </Button> */}
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
        </>
      ) : (
        ""
      )}

      {/* {editorMode ? (
        <OverlayTrigger
          key="tooltip"
          placement="right"
          overlay={<Tooltip id="tooltip-top">Delete selected text</Tooltip>}
        >
          <div
            className="deleteBtn me-2"
            onClick={() => removeActiveObject(editor)}
          >
            <TrashFill />
          </div>
        </OverlayTrigger>
      ) : (
        ""
      )} */}
    </div>
  );
};

export default TextComponent;
