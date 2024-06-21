import capitalize from "../../utils/capitalize";
import moment from "moment";
import React, { useMemo } from "react";
import NewContextMenu from "../NewContextMenu";
import classNames from "classnames";

const QuickAccessItem = (props) => {
  const fileExtension = useMemo(() => {
    const filenameSplit = props.filename.split(".");

    if (filenameSplit.length > 1) {
      let extension = filenameSplit[filenameSplit.length - 1];

      if (extension.length > 4)
        extension =
          extension.substring(0, 3) +
          extension.substring(extension.length - 1, extension.length);

      return extension.toUpperCase();
    } else {
      return "UNK";
    }
  }, [props.filename]);

  const imageColor = useMemo(() => {
    const letter = fileExtension.substring(0, 1).toUpperCase();

    const colorObj = {
      A: "#e53935",
      B: "#d81b60",
      C: "#8e24aa",
      D: "#5e35b1",
      E: "#3949ab",
      F: "#1e88e5",
      G: "#039be5",
      H: "#00acc1",
      I: "#00897b",
      J: "#43a047",
      K: "#fdd835",
      L: "#ffb300",
      M: "#fb8c00",
      N: "#f4511e",
      O: "#d32f2f",
      P: "#c2185b",
      Q: "#7b1fa2",
      R: "#512da8",
      S: "#303f9f",
      T: "#1976d2",
      U: "#0288d1",
      V: "#0097a7",
      W: "#0097a7",
      X: "#00796b",
      Y: "#388e3c",
      Z: "#fbc02d",
    };

    if (colorObj[letter]) {
      return colorObj[letter];
    } else {
      return "#03a9f4";
    }
  }, [props.filename]);

  const elementSelected = useMemo(
    () => `quick-${props._id}` === props.selected,
    [props._id, props.selected]
  );

  console.log("thumbnail", props.state);

  return (
    <div
      className={classNames(
        "border rounded-md o transition-all duration-400 ease-in-out cursor-pointer w-48 flex items-center justify-center flex-col h-[150px] animiate hover:border-[#3c85ee] overflow-hidden",
        {
          "border-[#3c85ee]": elementSelected,
          "border-[#ebe9f9]": !elementSelected,
        }
      )}
      onClick={() => {
        props.fileClick(props._id, props, true);
      }}
      onContextMenu={props.selectContext}
      onTouchStart={props.onTouchStart}
      onTouchEnd={props.onTouchEnd}
      onTouchMove={props.onTouchMove}
    >
      <div onClick={props.clickStopPropagation}>
        <NewContextMenu
          gridMode={true}
          quickItemMode={true}
          contextSelected={props.state.contextSelected}
          closeContext={props.closeContext}
          downloadFile={props.downloadFile}
          file={props}
          changeEditNameMode={props.changeEditNameMode}
          closeEditNameMode={props.closeEditNameMode}
          changeDeleteMode={props.changeDeleteMode}
          startMovingFile={props.startMovingFile}
        />
      </div>
      <div
        className={classNames(
          "inline-flex items-center w-full bg-white relative",
          {
            "mt-2": !props.state.hasThumbnail,
          }
        )}
      >
        {props.state.hasThumbnail ? (
          <img
            className="w-full min-h-[88px] max-h-[88px] h-full flex object-cover"
            src={props.state.image}
            onError={props.thumbnailOnError}
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            version="1.1"
            width="150"
            height="150"
            viewBox="0 0 24 24"
            className="w-full min-h-[80px] max-h-[80px] h-full flex"
          >
            <path
              d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z"
              fill={imageColor}
            />
          </svg>
        )}
        {!props.state.hasThumbnail && (
          <div className="w-full h-full absolute flex justify-center items-center text-white mt-3">
            <p className="text-sm">{fileExtension}</p>
          </div>
        )}
      </div>
      <div
        className={classNames(
          "p-3 overflow-hidden text-ellipsis block w-full animate",
          elementSelected ? "bg-[#3c85ee]" : "bg-white"
        )}
      >
        <p
          className={classNames(
            "m-0 text-[14px] leading-[16px] font-normal max-w-full overflow-hidden text-ellipsis whitespace-nowrap animate",
            elementSelected ? "text-white" : "text-[#212b36]"
          )}
        >
          {capitalize(props.filename)}
        </p>
        <span
          className={classNames(
            "m-0 text-[#637381] font-normal max-w-full whitespace-nowrap text-xs animate",
            elementSelected ? "text-white" : "text-[#637381]"
          )}
        >
          Created {moment(props.uploadDate).calendar()}
        </span>
      </div>
    </div>
  );
};

export default QuickAccessItem;
