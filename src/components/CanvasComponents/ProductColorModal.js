import { Button, Modal } from "react-bootstrap";
import { preDefinedColors } from "../../constants";
import { rgbToHex } from "../../helpers/colorHelpers";

const ProductColorModal = (props) => {
  const { show, handleClose, productColor, handleProductColor } = props;
  return (
    <Modal show={show} centered onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Change Product Color</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="outlineColorsWrapper">
          {preDefinedColors.map((color, index) => (
            <div
              key={index}
              className={rgbToHex(color) == productColor ? "active" : ""}
              data-white={rgbToHex(color) == "#FFFFFF" ? true : false}
              onClick={(e) => handleProductColor(e)}
              style={{ backgroundColor: rgbToHex(color) }}
            ></div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductColorModal;
