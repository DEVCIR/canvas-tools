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
  getObjectById,
  objectCenter,
  removeActiveObject,
  sendToBack,
} from "../../helpers/canvasHelpers";
import DetailBox from "./DetailBox";
import axios from "axios";
import FontDetailBox from "./FontDetailBox";
import { mergeDuplicateObjects } from "../../helpers/commonHelper";
import UndoImg from "../../assets/img/undo_icon.png";
import RedoImg from "../../assets/img/redo_icon.png";
import { Value } from "sass";
import DetailModal from "./DetailModal";

const NumbersComponent = (props) => {
  const { setOptionType, deleteAll, editor, fonts } = props;
  const [textValue, setTextValue] = useState("");
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

  const [nameCheck, setNameCheck] = useState(false);
  const [numberCheck, setNumberCheck] = useState(false);
  const [side, setSide] = useState("front");
  const [fontFamily, setFontFamily] = useState("Roboto");
  const [fontSize, setFontSize] = useState("small");
  const [detailModal, setDetailModal] = useState(false);
  // const undoStack = [];
  // const redoStack = [];

  function setFields(object) {
    if (object) {
      setFontSize(object.customSize);
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

  function resetTextOptions() {
    setFontSize("small");
    setTextValue("");
    setFontFamily("Roboto");
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

  function addName(value) {
    setTextAdded(true);
    setNameCheck(value);
    saveObjectState();
    // if (editorMode) {
    //   const object = editor.canvas.getActiveObject();
    //   object.text = textValue;
    //   object.fontSize = fontSize;
    //   object.fontFamily = fontFamily;
    //   object.fill = fontColor;
    //   object.fontWeight = fontWeight;

    //   if (object.stroke && object.strokeWidth) {
    //     object.stroke = outlineColor;
    //     object.strokeWidth = Number(outlineWidth);
    //   }

    //   editor.canvas.add(object);
    //   editor.canvas.renderAll();
    //   // saveObjectState(object);
    // } else {
    if (value) {
      var data = {
        fill: fontColor,
        fontWeight: "500",
        id: "name",
        text: "NAME",
        hasControls: false,
      };

      if (fontSize == "small") {
        data.fontSize = 30;
      }

      if (fontFamily == "Roboto") {
        data.fontFamily = "Roboto";
      }

      const text = new fabric.Text(textValue, data);
      text.left = editor.canvas.getWidth() - 100;
      text.top = 20;
      text.setCoords(); // Upda
      editor.canvas.add(text);
      editor.canvas.setActiveObject(text);
      editor.canvas.renderAll();
      setEditorMode(true);
    } else {
      const nameObject = getObjectById(editor, "name");
      editor.canvas.remove(nameObject);
      editor.canvas.renderAll();
    }

    // saveObjectState(text);
    // }
    // resetTextOptions();
  }

  function addNumber(value) {
    setTextAdded(true);
    setNumberCheck(value);
    // if (editorMode) {
    //   const object = editor.canvas.getActiveObject();
    //   object.text = textValue;
    //   object.fontSize = fontSize;
    //   object.fontFamily = fontFamily;
    //   object.fill = fontColor;
    //   object.fontWeight = fontWeight;

    //   if (object.stroke && object.strokeWidth) {
    //     object.stroke = outlineColor;
    //     object.strokeWidth = Number(outlineWidth);
    //   }

    //   editor.canvas.add(object);
    //   editor.canvas.renderAll();
    //   // saveObjectState(object);
    // } else {
    if (value) {
      var data = {
        fill: fontColor,
        fontWeight: "500",
        id: "number",
        text: "00",
        hasControls: false,
      };

      if (fontSize == "small") {
        data.fontSize = 100;
      }

      if (fontFamily == "Roboto") {
        data.fontFamily = "Roboto";
      }

      const text = new fabric.Text(textValue, data);
      const nameObject = getObjectById(editor, "name");

      if (nameObject) {
        text.left = nameObject.left - 12;
        text.top = nameObject.top + 20;
        text.setCoords(); // Update coordinates of the attached object
      }
      editor.canvas.add(text);
      editor.canvas.setActiveObject(text);
      setEditorMode(true);
      editor.canvas.renderAll();
    } else {
      const nameObject = getObjectById(editor, "number");
      editor.canvas.remove(nameObject);
      editor.canvas.renderAll();
    }

    // saveObjectState(text);
    // }
    // resetTextOptions();
  }

  const handleSide = (value) => {
    setSide(value);
    const nameObject = getObjectById(editor, "name");
    const numberObject = getObjectById(editor, "number");
  };
  const handleSize = (value) => {
    setFontSize(value);
    const nameObject = getObjectById(editor, "name");
    const numberObject = getObjectById(editor, "number");

    if (nameObject !== null) {
      if (value == "small") {
        nameObject.fontSize = 30;
        nameObject.customSize = "small";
        if (nameObject && numberObject) {
          if (nameObject.fontFamily == "Roboto") {
            numberObject.left = nameObject.left - 10;
            numberObject.top = nameObject.top + 28;
            numberObject.setCoords(); // Update coordinates of the attached object
            // editor.canvas.add(numberObject);
          } else {
            numberObject.left = nameObject.left - 18;
            numberObject.top = nameObject.top + 35;
            numberObject.setCoords(); // Update coordinates of the attached object
            // editor.canvas.add(numberObject);
          }
        }
      } else {
        nameObject.fontSize = 40;
        nameObject.customSize = "large";
        if (nameObject && numberObject) {
          if (nameObject.fontFamily == "Roboto") {
            numberObject.left = nameObject.left - 26;
            numberObject.top = nameObject.top + 30;
            numberObject.setCoords(); // Update coordinates of the attached object
            // editor.canvas.add(numberObject);
          } else {
            numberObject.left = nameObject.left - 33;
            numberObject.top = nameObject.top + 35;
            numberObject.setCoords(); // Update coordinates of the attached object
            // editor.canvas.add(numberObject);
          }
        }
      }
      editor.canvas.add(nameObject);


      editor.canvas.renderAll();
    }
    if (numberObject !== null) {
      if (value == "small") {
        numberObject.fontSize = 100;
        numberObject.customSize = "small";
      } else {
        numberObject.fontSize = 150;
        numberObject.customSize = "large";
      }
      editor.canvas.add(numberObject);
      editor.canvas.discardActiveObject();
      editor.canvas.setActiveObject(numberObject);
      editor.canvas.renderAll();
    }
  };

  const handleFont = (value) => {
    setFontFamily(value);
    const nameObject = getObjectById(editor, "name");
    const numberObject = getObjectById(editor, "number");
    if (nameObject !== null) {
      nameObject.fontFamily = value == "Roboto" ? "Roboto" : "Oswald";
      if (value == "Roboto") {
        nameObject.fontFamily = "Roboto";
        if (nameObject && numberObject) {
          if (fontSize == "small") {
            numberObject.left = nameObject.left - 12;
            numberObject.top = nameObject.top + 20;
            numberObject.setCoords(); // Update coordinates of the attached object
          } else {
            numberObject.left = nameObject.left - 25;
            numberObject.top = nameObject.top + 28;
            numberObject.setCoords(); // Update coordinates of the attached object
          }
        }
      }
      if (value == "Oswald") {
        nameObject.fontFamily = "Oswald";
        if (nameObject && numberObject) {
          if (fontSize == "small") {
            numberObject.left = nameObject.left - 18;
            numberObject.top = nameObject.top + 35;
            numberObject.setCoords(); // Update coordinates of the attached object
          } else {
            numberObject.left = nameObject.left - 33;
            numberObject.top = nameObject.top + 35;
            numberObject.setCoords(); // Update coordinates of the attached object
          }
        }
      }
      editor.canvas.add(nameObject);
      editor.canvas.discardActiveObject();
      editor.canvas.setActiveObject(numberObject);
      editor.canvas.renderAll();
    }
    if (numberObject !== null) {
      numberObject.fontFamily = value == "Roboto" ? "Roboto" : "Oswald";
      editor.canvas.add(nameObject);
      editor.canvas.discardActiveObject();
      editor.canvas.setActiveObject(numberObject);
      editor.canvas.renderAll();
    }
  };

  function textFontColor(event) {
    saveObjectState();
    var color = objectRgbToHex(event.target.style.backgroundColor);
    setFontColor(color);
    const nameObject = getObjectById(editor, "name");
    const numberObject = getObjectById(editor, "number");
    if (nameObject !== null) {
      nameObject.set("fill", color);
      editor.canvas.add(nameObject);
      editor.canvas.renderAll();
    }
    if (numberObject !== null) {
      numberObject.set("fill", color);
      editor.canvas.add(numberObject);
      editor.canvas.renderAll();
    }
    editor.canvas.renderAll();
  }

  function attachObjects() {
    const objects = editor.canvas.getObjects();
    var attachedObject = objects[0];
    var mainObject = objects[1];
    if (mainObject && attachedObject) {
      if (fontSize == "small") {
        if (fontFamily == "Roboto") {
          attachedObject.left = mainObject.left + 11;
          attachedObject.top = mainObject.top - 22;
        } else {
          attachedObject.left = mainObject.left + 18;
          attachedObject.top = mainObject.top - 30;
        }
      }
      if (fontSize == "large") {
        if (fontFamily == "Roboto") {
          attachedObject.left = mainObject.left + 25;
          attachedObject.top = mainObject.top - 28;
        } else {
          attachedObject.left = mainObject.left + 33;
          attachedObject.top = mainObject.top - 35;
        }
      }
    }
    attachedObject.setCoords(); // Update coordinates of the attached object
    editor.canvas.renderAll(); // Render canvas to see the changes
  }

  useMemo(() => {
    if (editor) {
      editor.canvas.on("object:moving", function () {
        attachObjects();
      });
    }

    return () => {};
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

      <div className="field-row">
        <label>Step 1</label>
        <div className="d-flex justify-content-between">
          <Form.Check // prettier-ignore
            type="checkbox"
            className="customCheckbox"
            id="names"
            label="Add Names"
            defaultChecked={nameCheck}
            onChange={(e) => addName(e.target.checked)}
          />
          <Form.Check // prettier-ignore
            type="checkbox"
            className="customCheckbox"
            id="numbers"
            label="Add Numbers"
            defaultChecked={numberCheck}
            onChange={(e) => addNumber(e.target.checked)}
          />
        </div>
      </div>

      {nameCheck || numberCheck ? (
        <>
          <button className="undo" onClick={undo}>
            <img src={UndoImg} />
          </button>
          <button className="redo" onClick={redo}>
            <img src={RedoImg} />
          </button>

          <div className="field-row">
            <label className="mt-2">Side</label>
            <div className="fieldBoxWrapper">
              <div
                className={`fieldBox ${side == "front" ? "active" : ""}`}
                onClick={() => handleSide("front")}
              >
                FRONT
              </div>
              <div
                className={`fieldBox ${side == "back" ? "active" : ""}`}
                onClick={() => handleSide("back")}
              >
                BACK
              </div>
            </div>
          </div>

          <div className="field-row">
            <label className="mt-2">Size</label>
            <div className="fieldBoxWrapper">
              <div
                className={`fieldBox sm ${fontSize == "small" ? "active" : ""}`}
                onClick={() => handleSize("small")}
              >
                SMALL
              </div>
              <div
                className={`fieldBox ${fontSize == "large" ? "active" : ""}`}
                onClick={() => handleSize("large")}
              >
                LARGE
              </div>
            </div>
          </div>

          <div className="field-row">
            <label className="mt-2">Font</label>
            <div className="fieldBoxWrapper">
              <div
                className={`fieldBox roboto ${
                  fontFamily == "Roboto" ? "active" : ""
                }`}
                onClick={() => handleFont("Roboto")}
              >
                ROBOTO
              </div>
              <div
                className={`fieldBox ${fontFamily == "Oswald" ? "active" : ""}`}
                onClick={() => handleFont("Oswald")}
              >
                Oswald
              </div>
            </div>
          </div>

          <div className="field-row">
            <label className="mt-2">Color</label>
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

          <Button onClick={() => setDetailModal(true)} className="mt-4 w-100">
            Enter Name/Number
          </Button>
        </>
      ) : (
        ""
      )}

      <DetailModal
        show={detailModal}
        fontFamily={fontFamily}
        handleClose={() => setDetailModal(false)}
      />
    </div>
  );
};

export default NumbersComponent;
