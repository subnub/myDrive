import capitalize from "../../utils/capitalize";
import moment from "moment";
import React, { useMemo, useState } from "react";
import NewContextMenu from "../NewContextMenu";
import classNames from "classnames";
import { getFileColor, getFileExtension } from "../../utils/files";
import { useThumbnail } from "../../hooks/files";
import { useContextMenu } from "../../hooks/contextMenu";

const QuickAccessItem = (props) => {
  const { image, hasThumbnail, imageOnError } = useThumbnail(
    props.metadata.hasThumbnail,
    props.metadata.thumbnailID
  );

  const { onContextMenu, closeContextMenu, ...contextMenuState } =
    useContextMenu();

  const fileExtension = useMemo(
    () => getFileExtension(props.filename),
    [props.filename]
  );

  const imageColor = useMemo(
    () => getFileColor(props.filename),
    [props.filename]
  );

  const elementSelected = useMemo(
    () => `quick-${props._id}` === props.selected,
    [props._id, props.selected]
  );

  return (
    <div
      className={classNames(
        "border rounded-md o transition-all duration-400 ease-in-out cursor-pointer w-48 flex items-center justify-center flex-col h-[150px] animiate hover:border-[#3c85ee] overflow-hidden",
        elementSelected ? "border-[#3c85ee]" : "border-[#ebe9f9]"
      )}
      onClick={() => {
        props.fileClick(props._id, props, true);
      }}
      onContextMenu={onContextMenu}
      onTouchStart={props.onTouchStart}
      onTouchEnd={props.onTouchEnd}
      onTouchMove={props.onTouchMove}
    >
      {contextMenuState.selected && (
        <div onClick={props.clickStopPropagation}>
          <NewContextMenu
            gridMode={true}
            quickItemMode={true}
            contextSelected={contextMenuState}
            closeContext={closeContextMenu}
            downloadFile={props.downloadFile}
            file={props}
            changeEditNameMode={props.changeEditNameMode}
            closeEditNameMode={props.closeEditNameMode}
            changeDeleteMode={props.changeDeleteMode}
            startMovingFile={props.startMovingFile}
          />
        </div>
      )}
      <div
        className={classNames(
          "inline-flex items-center w-full bg-white relative",
          {
            "mt-2": !hasThumbnail,
          }
        )}
      >
        {hasThumbnail ? (
          <img
            className="w-full min-h-[88px] max-h-[88px] h-full flex object-cover"
            src={image}
            onError={imageOnError}
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
        {!hasThumbnail && (
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
