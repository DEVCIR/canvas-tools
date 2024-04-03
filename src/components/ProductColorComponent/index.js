import { ArrowLeft, X } from "react-bootstrap-icons";
import { preDefinedColors } from "../../constants";
import { rgbToHex } from "../../helpers/colorHelpers";

const ProductColorComponent = (props) => {
  const { productColor, handleProductColor, setOptionType } = props;
  return (
    <div>
      <div
        className="backButton"
        onClick={() => {
          setOptionType("");
        }}
      >
        <X className="close" />
      </div>
      <h6 className="mb-3">Select Product Color</h6>
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
    </div>
  );
};

export default ProductColorComponent;
