import { ArrowLeft, X } from "react-bootstrap-icons";
import { Button, Pagination, Placeholder } from "react-bootstrap";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

const FontDetailBox = (props) => {
  const { text, fonts, type, value, handleChange, closeBox } = props;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState("");
  const wrapper = useRef(null);

  const fontsPerPage = 150;

  const filteredFonts = fonts.filter((font) =>
    font.family.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastFont = currentPage * fontsPerPage;
  const indexOfFirstFont = indexOfLastFont - fontsPerPage;
  const currentFonts = filteredFonts.slice(indexOfFirstFont, indexOfLastFont);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    // Scroll to the top of the list when the currentPage changes
    if (wrapper.current) {
      wrapper.current.scrollTop = 0;
    }
  }, [currentPage]);

  return (
    <div className="detailBox">
      <div className="editorHeader">Font</div>
      <div ref={wrapper} className="editorBody">
        <div className="backButton" onClick={() => closeBox()}>
          <X className="close" />
        </div>
        <div className="fontsWrapper">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search Fonts"
            value={searchTerm}
            style={{ maxWidth: "100%" }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {loading ? (
            <ul>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, index) => (
                <li key={index}>
                  <Placeholder animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <ul>
                {currentFonts.map((font) => (
                  <li
                    key={font.family}
                    onClick={() => handleChange(font.family)}
                  >
                    <div className="text" style={{ fontFamily: font.family }}>
                      {text}
                    </div>
                    <div
                      className="fontName"
                      style={{ fontFamily: font.family }}
                    >
                      {font.family}
                    </div>
                  </li>
                ))}
              </ul>
              <div>
                <Pagination>
                  {Array.from({
                    length: Math.ceil(filteredFonts.length / fontsPerPage),
                  }).map((_, index) => (
                    <Pagination.Item
                      key={index}
                      active={index + 1 === currentPage}
                      onClick={() => paginate(index + 1)}
                    >
                      {" "}
                      {index + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
              </div>
            </>
          )}
        </div>
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

export default FontDetailBox;
