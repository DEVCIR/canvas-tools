import { fabric } from "fabric";

export function removeActiveObject(editor) {
  var activeObject = editor.canvas.getActiveObject();
  // If there's an active object, remove it from the canvas
  if (activeObject) {
    editor.canvas.discardActiveObject();
    editor.canvas.remove(activeObject);
    editor.canvas.renderAll(); // Render the canvas after removing the object
  }
}

export function objectCenter(editor) {
  var object = editor.canvas.getActiveObject();
  editor.canvas.centerObject(object);
  editor.canvas.renderAll();
}

export function bringToFront(editor) {
  var object = editor.canvas.getActiveObject();
  editor.canvas.bringToFront(object);
  editor.canvas.renderAll();
}

export function sendToBack(editor) {
  var object = editor.canvas.getActiveObject();
  editor.canvas.sendToBack(object);
  editor.canvas.renderAll();
}

export function clone(editor) {
  var object = editor.canvas.getActiveObject();
  object.clone(function (obj) {
    obj.set({
      left: obj.left + 10,
      top: obj.top + 10,
      evented: true,
    });
    editor.canvas.add(obj);
    editor.canvas.setActiveObject(obj);
    editor.canvas.renderAll();
  });
}

export function setWarning(editor) {
  var activeObject = editor.canvas.getActiveObject();
  activeObject.setCoords();
  var _boundingRect = activeObject.getBoundingRect();
  var objectTop = _boundingRect.top,
    objectLeft = _boundingRect.left,
    safeAreaHeight = editor.canvas.getHeight(),
    safeAreaWidth = editor.canvas.getWidth(),
    safeAreaTop = 0,
    safeAreaLeft = 0,
    objHeight = objectTop + _boundingRect.height,
    objWidth = objectLeft + _boundingRect.width;
  activeObject.set({
    borderColor: "rgba(102,153,255,0.75)",
    cornerColor: "rgba(102,153,255,0.5)",
  });

  if (objectTop < safeAreaTop) {
    activeObject.top = _boundingRect.height;
    activeObject.set({ borderColor: "red", cornerColor: "red" });
  } else if (objHeight > safeAreaHeight) {
    activeObject.top = safeAreaHeight;
    activeObject.set({ borderColor: "red", cornerColor: "red" });
  }

  if (objectLeft < safeAreaLeft) {
    activeObject.left = _boundingRect.height;
    activeObject.set({ borderColor: "red", cornerColor: "red" });
  } else if (objWidth > safeAreaWidth) {
    activeObject.left = safeAreaWidth;
    activeObject.set({ borderColor: "red", cornerColor: "red" });
  }

  editor.canvas.renderAll();
}

export const deleteAll = (editor) => {
  editor.canvas.getObjects().forEach(function (object) {
    return editor.canvas.remove(object);
  });
  editor.canvas.discardActiveObject();
  editor.canvas.renderAll();
};

export function saveCanvasData(editor) {
  const canvasData = editor.canvas.toJSON();
  const jsonString = JSON.stringify(canvasData);

  // Save the JSON data in localStorage with a key
  localStorage.setItem("canvasData", jsonString);
  console.log("Canvas data saved to localStorage.");
}

export function loadCanvasData(editor) {
  const jsonString = localStorage.getItem("canvasData");

  if (jsonString) {
    const parsedData = JSON.parse(jsonString);
    console.log(parsedData);
    editor.canvas.loadFromJSON(parsedData, function () {
      editor.canvas.renderAll();
    });

    console.log("Canvas data loaded from localStorage.");
  } else {
    console.log("No canvas data found in localStorage.");
  }
}

export const getObjectById = (editor, id) => {
  var object = null;
  editor.canvas.forEachObject(function (obj) {
    if (obj.id === id) {
      object = obj;
    }
  });
  return object;
};
