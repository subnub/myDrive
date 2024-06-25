import FolderTree from "../FolderTree";
import React from "react";
import UploadStorageSwitcher from "../UploadStorageSwitcher";
import mobilecheck from "../../utils/mobileCheck";

class LeftSection extends React.Component {
  constructor(props) {
    super(props);

    this.isMobile = mobilecheck();
    this.nonDropMode = window.localStorage.getItem("non_drop-mode");
  }

  render() {
    return (
      <div
        className="menu__block p-6 hidden mobileMode:block border-r w-[270px] min-w-[270px]"
        ref={this.props.leftSectionRef}
        style={
          this.props.leftSectionMode === ""
            ? {}
            : this.props.leftSectionMode === "open"
            ? { left: "0px" }
            : { left: "-290px" }
        }
      >
        <div className="navigation__block">
          <div className="add__new">
            <a onClick={this.props.showDropDown}>
              <p>ADD NEW</p>
              <span>
                <img src="/assets/dropselect.svg" alt="dropselect" />
              </span>
            </a>
            <div
              className="dropdown__list"
              style={
                this.props.state.open
                  ? { display: "block" }
                  : { display: "none" }
              }
            >
              <ul>
                <li>
                  {this.isMobile || this.nonDropMode ? (
                    <div>
                      <input
                        className="upload__mobile"
                        ref={this.props.uploadInput}
                        type="file"
                        multiple={true}
                        onChange={this.props.handleUpload}
                      />
                      <a
                        onClick={this.props.showUploadOverlay}
                        className="upload__files"
                      >
                        <span>
                          <img src="/assets/uploadicon.svg" alt="upload" />
                        </span>{" "}
                        Upload Files
                      </a>
                    </div>
                  ) : (
                    <a
                      onClick={this.props.showUploadOverlay}
                      className="upload__files"
                    >
                      <span>
                        <img src="/assets/uploadicon.svg" alt="upload" />
                      </span>{" "}
                      Upload Files
                    </a>
                  )}
                </li>
                <li>
                  <a onClick={this.props.createFolder}>
                    <span>
                      <img src="/assets/foldericon.svg" alt="folder" />
                    </span>{" "}
                    Create Folder
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="page__navigation">
            <ul>
              <li className="active__page">
                <a onClick={this.props.goHome}>
                  <span>
                    <img src="/assets/homea.svg" alt="homeactive" />
                  </span>
                  Home
                </a>
              </li>
            </ul>
          </div>
          <div
            className={
              this.props.state.hideFolderTree
                ? "utility__buttons utility__buttons_no_border"
                : "utility__buttons"
            }
          >
            <ul>
              {/* <li><a href="#"><span><img src="/assets/utility1.svg" alt="utility"/></span> Shared with me</a></li>
							<li><a href="#"><span><img src="/assets/utility2.svg" alt="utility"/></span> Recent Files</a></li>
							<li><a href="#"><span><img src="/assets/utility3.svg" alt="utility"/></span> Trash</a></li> */}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default LeftSection;
