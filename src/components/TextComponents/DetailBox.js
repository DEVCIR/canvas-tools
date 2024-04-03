import { ArrowLeft, SlashCircle, X } from "react-bootstrap-icons";
import { preDefinedColors } from "../../constants";
import { rgbToHex } from "../../helpers/colorHelpers";
import { Button } from "react-bootstrap";

const DetailBox = (props) => {
  const { type, value, handleChange, value2, handleChange2, closeBox, reset } =
    props;

  return (
    <div className="detailBox">
      <div className="editorHeader">Text Color</div>
      <div className="editorBody">
        <div className="backButton" onClick={() => closeBox()}>
          <X className="close" />
        </div>
        {type == "textColor" ? (
          <>
            <h6 className="mb-3">Select Color</h6>
            <div className="outlineColorsWrapper">
              <div
                className={
                  "#00000000" == value ? "transparent active" : "transparent"
                }
                onClick={(e) => handleChange(e, true)}
              >
                <SlashCircle />
              </div>
              {preDefinedColors.map((color, index) => (
                <div
                  key={index}
                  className={rgbToHex(color) == value ? "active" : ""}
                  data-white={rgbToHex(color) == "#FFFFFF" ? true : false}
                  onClick={(e) => handleChange(e)}
                  style={{ backgroundColor: rgbToHex(color) }}
                ></div>
              ))}
            </div>
          </>
        ) : type == "outline" ? (
          <>
            <h6 className="mb-3">Select Width</h6>
            <input
              className="w-100"
              type="range"
              defaultValue={value}
              // value={value}
              min={0.5}
              max={2}
              step={0.5}
              onChange={(e) => handleChange(e.target.value)}
            />
            <h6 className="my-3">Select Color</h6>
            <div className="outlineColorsWrapper">
              <div
                className={
                  "#00000000" == value ? "transparent active" : "transparent"
                }
                onClick={(e) => handleChange(e, true)}
              >
                <SlashCircle />
              </div>
              {preDefinedColors.map((color, index) => (
                <div
                  key={index}
                  className={rgbToHex(color) == value2 ? "active" : ""}
                  data-white={rgbToHex(color) == "#FFFFFF" ? true : false}
                  onClick={(e) => handleChange2(e)}
                  style={{ backgroundColor: rgbToHex(color) }}
                ></div>
              ))}
            </div>
          </>
        ) : (
          ""
        )}
        {type == "outline" ? (
          <Button className="px-5 mt-3 me-3" onClick={reset}>
            Reset
          </Button>
        ) : (
          ""
        )}
        <Button className="px-5 mt-3" onClick={() => closeBox()}>
          Back
        </Button>
        <Button className="px-5 float-right mt-3" onClick={() => closeBox()}>
          Done
        </Button>
      </div>
    </div>
  );
};

export default DetailBox;
