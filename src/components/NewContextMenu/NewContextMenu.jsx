import classNames from "classnames";
import React from "react";

class NewContextMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      // settings__folder__margin
      <div
        onClick={this.props.stopPropagation}
        ref={this.props.wrapperRef}
        className={classNames(
          "fixed min-w-[215px] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.15),_inset_0px_1px_0px_#f5f7fa] rounded-[4px] mt-[-5px] z-[2] animate-very-long",
          this.props.contextSelected ? "opacity-100" : "opacity-0"
        )}
        style={
          this.props.contextSelected
            ? {
                display: "block",
                left: `${this.props.contextSelected.width}px`,
                top: `${this.props.contextSelected.height}px`,
              }
            : { display: "none" }
        }
      >
        <ul className="p-0 list-none m-0 ">
          <li className="flex w-full px-[20px] py-[12px] items-center font-normal justify-start no-underline transition-all duration-400 ease-in-out hover:bg-[#f6f5fd] hover:text-[#3c85ee] hover:font-medium">
            <a onClick={this.props.startRenameFile} className="flex">
              <span className="inline-flex mr-[18px]">
                <img src="/assets/filesetting1.svg" alt="setting" />
              </span>
              Rename
            </a>
          </li>
          {!this.props.folderMode ? (
            <li className="flex w-full px-[20px] py-[12px] items-center font-normal justify-start no-underline transition-all duration-400 ease-in-out hover:bg-[#f6f5fd] hover:text-[#3c85ee] hover:font-medium">
              <a
                onClick={this.props.startShareFile}
                className="flex"
                data-modal="share__modal"
              >
                <span
                  className="inline-flex mr-[18px]
"
                >
                  <img src="/assets/filesetting2.svg" alt="setting" />
                </span>
                Share
              </a>
            </li>
          ) : undefined}
          {!this.props.folderMode ? (
            <li className="flex w-full px-[20px] py-[12px] items-center font-normal justify-start no-underline transition-all duration-400 ease-in-out hover:bg-[#f6f5fd] hover:text-[#3c85ee] hover:font-medium">
              <a onClick={this.props.startFileDownload} className="flex">
                <span className="inline-flex mr-[18px]">
                  <img src="/assets/filesetting3.svg" alt="setting" />
                </span>
                Download
              </a>
            </li>
          ) : undefined}
          <li className="flex w-full px-[20px] py-[12px] items-center font-normal justify-start no-underline transition-all duration-400 ease-in-out hover:bg-[#f6f5fd] hover:text-[#3c85ee] hover:font-medium">
            <a
              onClick={this.props.startMovingFile}
              className="flex"
              data-modal="destination__modal"
            >
              <span className="inline-flex mr-[18px]">
                <img src="/assets/filesetting4.svg" alt="setting" />
              </span>{" "}
              Move
            </a>
          </li>
          <li className="flex w-full px-[20px] py-[12px] items-center font-normal justify-start no-underline transition-all duration-400 ease-in-out hover:bg-[#f6f5fd] hover:text-[#3c85ee] hover:font-medium">
            <a onClick={this.props.startDeleteFile} className="flex">
              <span className="inline-flex mr-[18px]">
                <img src="/assets/filesetting5.svg" alt="setting" />
              </span>
              Delete
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default NewContextMenu;
