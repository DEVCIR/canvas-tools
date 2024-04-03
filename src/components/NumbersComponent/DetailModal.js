import { Button, Col, FormSelect, Modal, Row } from "react-bootstrap";
import ProductImg from "../../assets/img/demoshirt.png";
import { Trash } from "react-bootstrap-icons";
import { useState } from "react";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { fabric } from "fabric";
import { useRef } from "react";
import { useEffect } from "react";
import { useMemo } from "react";
import { getObjectById } from "../../helpers/canvasHelpers";

const DetailModal = (props) => {
  const { show, handleClose, fontFamily } = props;
  const numberCanvas = useRef();
  const { editor, onReady } = useFabricJSEditor();
  const [feildData, setFieldData] = useState([
    { id: 1, size: "s" },
    { id: 2, size: "s" },
    { id: 3, size: "s" },
  ]);

  useEffect(() => {
    setFieldData([
      { id: 1, size: "s" },
      { id: 2, size: "s" },
      { id: 3, size: "s" },
    ]);
  }, [show]);

  const addRow = () => {
    console.log("add row");
    setFieldData([
      ...feildData,
      { id: feildData[feildData?.length - 1]?.id + 1 },
    ]);
  };

  const removeRow = (id) => {
    console.log(id)
    if (feildData?.length > 0 && id) {
      const updatedData = feildData?.filter((item) => item.id !== id);
      setFieldData(updatedData);
    }
  };

  const countObjectsWithNumberAndName = () => {
    const countWithNumber = feildData.filter(item => item.number).length;
    const countWithName = feildData.filter(item => item.name).length;
    return { countWithNumber, countWithName };
  };

  const updateData = (key, value, index) => {
    if (index >= 0 && index < feildData.length) {
      // Create a copy of the object at the specified index
      const updatedObject = { ...feildData[index] };
      // Update the specified key with the new value
      updatedObject[key] = value;
      // Create a new array with the updated object at the specified index
      const updatedArray = [...feildData];
      updatedArray[index] = updatedObject;
      console.log(updatedArray, "updatedArray");
      setFieldData(updatedArray);

      if (key == "name" && index == 0) {
        updateName(value);
      }

      if (key == "number" && index == 0) {
        updateNumber(value, editor);
      }
    } else {
      // If the index is out of range, return the original array
      setFieldData(feildData);
    }
  };

  const updateName = (value) => {
    const nameObject = getObjectById(editor, "name");

    if (nameObject !== null) {
      nameObject.set("text", value);
      editor.canvas.centerObject(nameObject);
      nameObject.set("top", 15);
    } else {
      const textObject = new fabric.Text(value, {
        fontSize: 40,
        fill: "black",
        id: "name",
        fontFamily: fontFamily,
        hasControls: false,
        selectable: false,
      });
      editor.canvas.centerObject(textObject);
      textObject.set("top", 15);
      editor.canvas.add(textObject);
    }
    editor.canvas.renderAll();
  };

  const updateNumber = (value, editor) => {
    const numberObject = getObjectById(editor, "number");

    if (numberObject !== null) {
      numberObject.set({ text: value });
      editor.canvas.centerObject(numberObject);
      if (fontFamily == "Oswald") {
        numberObject.set("top", 60);
      } else {
        numberObject.set("top", 50);
      }
    } else {
      const textObject = new fabric.Text(value, {
        fontSize: 120,
        fill: "black",
        id: "number",
        fontFamily: fontFamily,
        hasControls: false,
        selectable: false,
      });
      editor.canvas.add(textObject);
      editor.canvas.centerObject(textObject);
      if (fontFamily == "Oswald") {
        textObject.set("top", 60);
      } else {
        textObject.set("top", 50);
      }
    }
    editor.canvas.renderAll();
  };

  // useMemo(() => {
  //   console.log(feildData, 'feildData')
  //   if (editor && feildData?.length > 0 && feildData[0]?.name) {
  //     updateName(feildData[0]?.name);
  //   }
  // }, [feildData, editor]);

  return (
    <Modal
      className="numberEditModal"
      show={show}
      centered
      onHide={handleClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Edit Names & Numbers List</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="listWrapper">
          <div className="listCanvasWrapper">
            <div className="canvasWrapper" ref={numberCanvas}>
              <FabricJSCanvas
                className="sampleCanvas"
                height="250"
                width="250"
                preserveObjectStacking={false}
                onReady={onReady}
              />
            </div>
          </div>
          <div className="listDetailWrapper">
            <div className="productFooterCard ms-2">
              <img className="productImg" src={ProductImg} />
              <div>
                <p className="productName borderBottom">
                  <span className="fw-6 me-3">Golf Club T-shirt Design</span>
                </p>
                <div className="d-flex mt-2">
                  <div className="productColor">
                    <span className="fw-6 me-3">Color:</span>
                    <div
                      className="colorBox"
                      style={{ backgroundColor: "#fff" }}
                    ></div>
                    <span className="mx-3">Heather white</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Row>
                <Col className="text-center my-2" sm={3}>
                  Size
                </Col>
                <Col className="text-center my-2" sm={5}>
                  Name
                </Col>
                <Col className="text-center my-2" sm={3}>
                  #
                </Col>
                <Col sm={1}></Col>
              </Row>
              {console.log(feildData, "feildData")}
              {feildData?.map((item, index) => {
                return (
                  <Row className="align-items-center mb-3" id={item.id}>
                    <Col sm={3}>
                      <FormSelect
                        value={item.size}
                        onChange={(e) =>
                          updateData("size", e.target.value, index)
                        }
                      >
                        <option value="s">S</option>
                        <option value="m">M</option>
                        <option value="l">L</option>
                        <option value="xl">XL</option>
                      </FormSelect>
                    </Col>
                    <Col sm={5}>
                      <input
                        className="form-control mb-0"
                        type="text"
                        placeholder=""
                        value={item?.name}
                        onChange={(e) =>
                          updateData("name", e.target.value, index)
                        }
                      />
                    </Col>
                    <Col sm={3}>
                      {" "}
                      <input
                        className="form-control mb-0"
                        type="text"
                        placeholder=""
                        value={item?.number}
                        maxLength={3}
                        onChange={(e) => {
                          if (e.target.value.length > 3) {
                            updateData(
                              "number",
                              e.target.value.substring(0, 3),
                              index
                            );
                          } else {
                            updateData("number", e.target.value, index);
                          }
                        }}
                      />
                    </Col>
                    <Col sm={1}>
                      <div onClick={() => removeRow(item?.id)}>
                        <Trash />
                      </div>
                    </Col>
                  </Row>
                );
              })}
              <div className="text-primary cursor-pointer fit-content" onClick={addRow}>
                + Add Another
              </div>
              <div className="mt-4">
                Totals: {countObjectsWithNumberAndName()?.countWithName } out of {feildData?.length} have Names | {countObjectsWithNumberAndName()?.countWithNumber } out of {feildData?.length} have Numbers
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetailModal;
