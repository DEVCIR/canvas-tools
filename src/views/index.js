import { useMemo, useState } from "react";
import { Container, Button, Row, Col, NavLink } from "react-bootstrap";
import { useFabricJSEditor } from "fabricjs-react";
import "react-rangeslider/lib/index.css";
import "react-select-search/style.css";
import {
  ArrowLeft,
  CardText,
  CloudUpload,
  Droplet,
  List,
  Save,
} from "react-bootstrap-icons";
import TextComponent from "../components/TextComponents";
import ImageComponent from "../components/ImageComponents";
import { useRef } from "react";
import CanvasComponent from "../components/CanvasComponents";
import ProductColorModal from "../components/CanvasComponents/ProductColorModal";
import { objectRgbToHex } from "../helpers/colorHelpers";
import ProductColorComponent from "../components/ProductColorComponent";
import SidebarText from "../assets/img/text_icon_white.png";
import SidebarTextHover from "../assets/img/text_icon_black.png";
import SidebarArt from "../assets/img/art_icon_white.png";
import SidebarArtHover from "../assets/img/art_icon_black.png";
import SidebarUpload from "../assets/img/upload_icon_white.png";
import SidebarUploadHover from "../assets/img/upload_icon_black.png";
import SidebarGarment from "../assets/img/garment_icon_white.png";
import SidebarGarmentHover from "../assets/img/garment_icon_black.png";
import SidebarName from "../assets/img/name.png";
import ProductImg from "../assets/img/demoshirt.png";
import MainText from "../assets/img/text_icon.png";
import MainArt from "../assets/img/art_icon.png";
import MainUpload from "../assets/img/upload_icon.png";
import MainGarment from "../assets/img/garment_icon.png";
import Logo from "../assets/img/logo.png";
import axios from "axios";
import {
  deleteAll,
  loadCanvasData,
  saveCanvasData,
} from "../helpers/canvasHelpers";
import NumbersComponent from "../components/NumbersComponent";

const Index = () => {
  const [optionType, setOptionType] = useState("");
  const [headerTitle, setHeaderTitle] = useState("");
  const [productColor, setProductColor] = useState("#FFFFFF");
  const [show, setShow] = useState(false);
  const [fonts, setFonts] = useState([]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const wrapperRef = useRef();

  const { editor, onReady } = useFabricJSEditor();

  const getFonts = async () => {
    const res = await axios.get(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBvXv1dCX-GQ5aeaSgfCU6vy1yuf2_APnY`
    );
    if (res.status == 200) {
      setFonts(res.data.items);
      res.data.items.forEach((font) => {
        loadFont(font.family);
      });
    }
  };

  const loadFont = (font) => {
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      font.replace(/ %/g, "+")
    )}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  };

  useMemo(() => {
    getFonts();
  }, []);

  function handleOption(value) {
    setOptionType(value);

    if (value == "image") {
      setHeaderTitle("Edit Image");
    }

    if (value == "text") {
      setHeaderTitle("Edit Text");
    }

    if (value == "productColor") {
      setHeaderTitle("Product color");
    }

    if (value == "numbers") {
      setHeaderTitle("Name & Numbers Tools");
    }
  }

  function handleProductColor(event) {
    var color = objectRgbToHex(event.target.style.backgroundColor);
    setProductColor(color);
  }

  return (
    <Container fluid className="main px-0">
      <div className="header">
        <div className="hamburger">
          <List />
        </div>
        <div className="content">
          <img className="logo" src={Logo} />
        </div>
      </div>
      <div className="content">
        <div className="tool">
          <div className="toolSection">
            <div className="whiteBox">
              <div className="sidebar">
                <div
                  className={`${
                    optionType == "text" ? "active" : ""
                  } sidebarItem`}
                  onClick={() => handleOption("text")}
                >
                  <img src={SidebarText} />
                  <img className="active" src={SidebarTextHover} />
                  Add Text
                </div>
                <div className={`sidebarItem`} onClick={() => handleOption("")}>
                  <img src={SidebarArt} />
                  <img className="active" src={SidebarArtHover} />
                  Add Art
                </div>
                <div
                  className={`${
                    optionType == "image" ? "active" : ""
                  } sidebarItem`}
                  onClick={() => handleOption("image")}
                >
                  <img src={SidebarUpload} />
                  <img className="active" src={SidebarUploadHover} />
                  Upload
                </div>
                <div
                  className={`${
                    optionType == "productColor" ? "active" : ""
                  } sidebarItem`}
                  onClick={() => handleOption("productColor")}
                >
                  <img src={SidebarGarment} />
                  <img className="active" src={SidebarGarmentHover} />
                  Garment Color
                </div>
                <div
                  className={`${
                    optionType == "numbers" ? "active" : ""
                  } sidebarItem`}
                  onClick={() => handleOption("numbers")}
                >
                  <img src={SidebarGarment} />
                  <img className="active" src={SidebarGarmentHover} />
                  Names & Numbers
                </div>
              </div>
              {optionType == "" ? (
                <div className="editorSection px-3 py-5">
                  <h4 className="sectionTitle mb-3">
                    Lets start a project together !
                  </h4>
                  <div className="optionWrapper mt-4">
                    <div
                      className="optionBtn"
                      onClick={() => handleOption("text")}
                    >
                      <img src={MainText} />
                      <span className="text">Add Text</span>
                      <span></span>
                    </div>
                    <div
                      className="optionBtn"
                      // onClick={() => handleOption("text")}
                    >
                      <img src={MainArt} />
                      <span className="text">Add Art</span>
                      <span></span>
                    </div>
                    <div
                      className="optionBtn"
                      onClick={() => handleOption("image")}
                    >
                      <img src={MainUpload} />
                      <span className="text">Upload Image</span>
                      <span></span>
                    </div>
                    <div
                      className="optionBtn"
                      onClick={() => handleOption("productColor")}
                    >
                      <img src={MainGarment} />
                      <span className="text">Garment Color</span>
                      <span></span>
                    </div>
                    <div
                      className="optionBtn"
                      onClick={() => handleOption("numbers")}
                    >
                      <img src={MainGarment} />
                      <span className="text">Names & Numbers</span>
                      <span></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="editorSection">
                  <div className="editorHeader">{headerTitle}</div>
                  <div className="editorBody">
                    {/* Text section */}
                    {optionType == "text" && (
                      <TextComponent
                        editor={editor}
                        setOptionType={setOptionType}
                        deleteAll={deleteAll}
                        fonts={fonts}
                      />
                    )}

                    {/* Image section */}
                    {optionType == "image" && (
                      <ImageComponent
                        wrapperRef={wrapperRef}
                        editor={editor}
                        setOptionType={setOptionType}
                        deleteAll={deleteAll}
                      />
                    )}

                    {/* Image section */}
                    {optionType == "productColor" && (
                      <ProductColorComponent
                        wrapperRef={wrapperRef}
                        editor={editor}
                        productColor={productColor}
                        setOptionType={setOptionType}
                        handleProductColor={handleProductColor}
                        deleteAll={deleteAll}
                      />
                    )}

                    {/* Image section */}
                    {optionType == "numbers" && (
                      <NumbersComponent
                        wrapperRef={wrapperRef}
                        editor={editor}
                        setOptionType={setOptionType}
                        deleteAll={deleteAll}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="productSection">
            <CanvasComponent
              editor={editor}
              productColor={productColor}
              wrapperRef={wrapperRef}
              onReady={onReady}
            />
          </div>
        </div>
      </div>
      <div className="footer">
        <div className="d-flex align-items-center">
          {/* <Button className="outline my-2" onClick={() => deleteAll(editor)}>
            Clear canvas
          </Button> */}
          <Button className="outline my-2">Add Products</Button>
          <div className="productFooterCard ms-2">
            <img className="productImg" src={ProductImg} />
            <div>
              <p className="productName borderBottom">
                <span className="fw-6 me-3">Golf Club T-shirt Design</span>
                <span className="colorBtn">Change Product</span>
              </p>
              <p className="productName">
                <span className="fw-6 me-3">Product:</span>
                <span className="">
                  Next Level Women's Tri-Blend Racerback Tank Top
                </span>
              </p>
              <div className="d-flex">
                <div className="productColor">
                  <span className="fw-6 me-3">Color:</span>
                  <div
                    className="colorBox"
                    style={{ backgroundColor: productColor }}
                  ></div>
                  <span className="mx-3">Heather white</span>
                  <div className="colorBtn" onClick={handleShow}>
                    Change Color
                  </div>
                </div>
                <div className="productColor ms-5">
                  <span className="fw-6">Method:</span>
                  <span className="mx-3">Printing</span>
                  <div className="colorBtn">Change Method</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Button
            className="outline my-2 mx-2"
            onClick={() => saveCanvasData(editor)}
          >
            Save | Share
          </Button>
          {/* <Button className="outline-blue my-2" onClick={() => loadCanvasData(editor)}>
            Load
          </Button> */}
          <Button className="outline-blue my-2">Get Price</Button>
        </div>
      </div>
      <ProductColorModal
        show={show}
        handleClose={handleClose}
        productColor={productColor}
        handleProductColor={handleProductColor}
      />
    </Container>
  );
};

export default Index;
