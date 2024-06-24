import bytes from "bytes";
import moment from "moment";
import React from "react";
import ContextMenu from "../ContextMenu";
import classNames from "classnames";

class RightSection extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div
        onClick={this.props.closeContext}
        ref={this.props.rightSectionRef}
        style={
          this.props.rightSectionMode === ""
            ? {}
            : this.props.rightSectionMode === "open"
            ? { right: "0px" }
            : { right: "-260px" }
        }
        className={classNames(
          "!hidden mobileMode:!flex",
          this.props.selectedItem.name === ""
            ? "file__details empty__details"
            : "file__details"
        )}
      >
        {this.props.selectedItem.name === "" ? (
          <div className="file__details--inner">
            <span>
              <img src="/assets/filedetailsicon.svg" alt="filedetailsicon" />
            </span>
            <p>Select a file or folder to view it’s details</p>
          </div>
        ) : (
          <div className="file__info--wrap">
            <img
              className={
                this.props.selected === ""
                  ? "section__title-image section__title-image--gone"
                  : "section__title-image"
              }
              src="/images/close_icon.png"
              onClick={this.props.resetSelected}
            />
            <div className="file__type">
              <img src="/assets/typedetailed1.svg" alt="typedetailed1" />
            </div>
            <div className="file__name">
              <p>{this.props.selectedItem.name}</p>
            </div>
            <div className="file__information">
              <div className="elem__file--info">
                <span>Type</span>
                <span>
                  {this.props.selectedItem.size
                    ? this.props.getFileExtension(this.props.selectedItem.name)
                    : "Folder"}
                </span>
              </div>
              <div
                className="elem__file--info"
                style={
                  !this.props.selectedItem.size
                    ? { display: "none" }
                    : { display: "flex" }
                }
              >
                <span>Size</span>
                <span>{bytes(this.props.selectedItem.size)}</span>
              </div>
              <div className="elem__file--info">
                <span>Created</span>
                <span>{moment(this.props.selectedItem.date).format("L")}</span>
              </div>
              <div className="elem__file--info">
                <span>Location</span>
                <span>
                  {this.props.selectedItem.drive
                    ? "Google Drive"
                    : this.props.selectedItem.personalFile
                    ? "Amazon S3"
                    : "myDrive"}
                </span>
              </div>
              <div
                className="elem__file--info"
                style={
                  !this.props.selectedItem.size
                    ? { display: "none" }
                    : { display: "flex" }
                }
              >
                <span>Privacy</span>
                <span>
                  {this.props.selectedItem.link ? "Public" : "Only you"}
                </span>
              </div>
            </div>
            <div className="file__control">
              <a onClick={this.props.openItem}>
                {this.props.selectedItem.file ? "Open File" : "Open Folder"}
              </a>
              <div className="file__settings">
                <a onClick={this.props.selectContext}>
                  <i className="fas fa-ellipsis-h" aria-hidden="true"></i>
                </a>
              </div>
            </div>
            <div
              className="context__menu--wrapper"
              onClick={this.props.clickTest}
            >
              <ContextMenu
                gridMode={true}
                folderMode={!this.props.selectedItem.file}
                contextSelected={this.props.state.contextSelected}
                closeContext={this.props.closeContext}
                downloadFile={this.props.downloadFile}
                file={this.props.selectedItem.data}
                changeEditNameMode={this.props.changeEditNameMode}
                startMovingFile={this.props.startMoveFolder}
                changeDeleteMode={this.props.changeDeleteMode}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default RightSection;
