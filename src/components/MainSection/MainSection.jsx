import DataForm from "../Dataform";
import RightSection from "../RightSection";
import MoverMenu from "../MoverMenu";
import PopupWindow from "../PopupWindow";
import React from "react";
import LeftSection from "../LeftSection";

const MainSection = React.forwardRef((props, ref) => {
  return (
    <div className="content__block">
      <div
        className="overlay"
        style={
          props.leftSectionMode === "open" || props.rightSectionMode === "open"
            ? { display: "block" }
            : { display: "none" }
        }
      ></div>
      <div className="small__switcher--content">
        <a onClick={props.switchLeftSectionMode} className="menu__button">
          <i className="fas fa-bars"></i>
        </a>
        <a onClick={props.switchRightSectionMode} className="image__viewer">
          <i className="fas fa-images"></i>
        </a>
      </div>
      <div
        className="file__container"
        style={
          props.routeType === "search"
            ? { flexDirection: "column" }
            : { flexDirection: "row" }
        }
      >
        {true ? undefined : (
          <div className="file__control--panel empty__control--panel">
            <div className="file__get--started">
              <div className="get__started--image">
                <img src="/assets/get_startedfile.svg" alt="get" />
              </div>
              <h6>All your files in one place</h6>
              <p>Drag and drop a file to get started</p>
            </div>
          </div>
        )}

        {props.routeType === "search" ? (
          <div
            className="file__control--panel folder__view"
            style={{ paddingBottom: "0", marginBottom: "-50px" }}
          >
            <div className="results__files">
              <h2>
                <span className="counter__result">
                  {props.files.length + props.folders.length >= 50
                    ? "50+"
                    : props.files.length + props.folders.length}
                </span>{" "}
                <span className="result__word">results</span> for{" "}
                <span className="result__search--word">
                  {props.cachedSearch}
                </span>
              </h2>
              <p className="searching__result">
                You are searching in{" "}
                <span className="root__parent">
                  {props.parent === "/"
                    ? "Home"
                    : props.parentNameList.length !== 0
                    ? props.parentNameList[props.parentNameList.length - 1]
                    : "Unknown"}
                </span>{" "}
                <span className="spacer">
                  <img
                    style={{
                      height: "11px",
                      marginTop: "2px",
                      display: "none",
                    }}
                    src="/assets/smallspacer.svg"
                    alt="spacer"
                  />
                </span>
                <span className="current__folder"></span>{" "}
                <a
                  href="#"
                  style={{ display: "none" }}
                  className="search__filter--global"
                >
                  Show results from everywhere
                </a>
              </p>
            </div>
          </div>
        ) : undefined}

        {props.showPopup ? (
          <PopupWindow downloadFile={props.downloadFile} />
        ) : undefined}

        {props.moverID.length === 0 ? undefined : <MoverMenu />}

        <div className="flex flex-row h-screen w-screen pt-16">
          <LeftSection goHome={() => {}} />

          <DataForm />

          <RightSection
            folderClick={props.folderClick}
            fileClick={props.fileClick}
            downloadFile={props.downloadFile}
          />
        </div>
      </div>
    </div>
  );
});

export default MainSection;
