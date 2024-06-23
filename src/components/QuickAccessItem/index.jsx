import capitalize from "../../utils/capitalize";
import moment from "moment";
import React, { useMemo, useRef } from "react";
import ContextMenu from "../ContextMenu";
import classNames from "classnames";
import { getFileColor, getFileExtension } from "../../utils/files";
import { useThumbnail } from "../../hooks/files";
import { useContextMenu } from "../../hooks/contextMenu";
import { useDispatch, useSelector } from "react-redux";
import mobilecheck from "../../utils/mobileCheck";
import { startSetSelectedItem } from "../../actions/selectedItem";
import { setPopupFile } from "../../actions/popupFile";

const QuickAccessItem = (props) => {
  const { file } = props;
  const currentSelectedItem = useSelector(
    (state) => state.selectedItem.selected
  );
  const { image, hasThumbnail, imageOnError } = useThumbnail(
    file.metadata.hasThumbnail,
    file.metadata.thumbnailID
  );
  const dispatch = useDispatch();
  const lastSelected = useRef(0);

  const {
    onContextMenu,
    closeContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    clickStopPropagation,
    ...contextMenuState
  } = useContextMenu();

  const fileExtension = useMemo(
    () => getFileExtension(file.filename),
    [file.filename]
  );

  const imageColor = useMemo(
    () => getFileColor(file.filename),
    [file.filename]
  );

  const elementSelected = useMemo(
    () => `quick-${file._id}` === currentSelectedItem,
    [file._id, currentSelectedItem]
  );

  const quickItemClick = () => {
    const currentDate = Date.now();

    if (!elementSelected) {
      dispatch(startSetSelectedItem(file._id, true, true));
    }

    const isMobile = mobilecheck();

    if (isMobile || currentDate - lastSelected.current < 1500) {
      dispatch(setPopupFile({ showPopup: true, ...file }));
    }

    lastSelected.current = Date.now();
  };

  return (
    <div
      className={classNames(
        "border rounded-md o transition-all duration-400 ease-in-out cursor-pointer w-48 flex items-center justify-center flex-col h-[150px] animiate hover:border-[#3c85ee] overflow-hidden",
        elementSelected ? "border-[#3c85ee]" : "border-[#ebe9f9]"
      )}
      onClick={quickItemClick}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {contextMenuState.selected && (
        <div onClick={clickStopPropagation}>
          <ContextMenu
            gridMode={true}
            quickItemMode={true}
            contextSelected={contextMenuState}
            closeContext={closeContextMenu}
            file={file}
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
          {capitalize(file.filename)}
        </p>
        <span
          className={classNames(
            "m-0 text-[#637381] font-normal max-w-full whitespace-nowrap text-xs animate",
            elementSelected ? "text-white" : "text-[#637381]"
          )}
        >
          Created {moment(file.uploadDate).format("MM/DD/YY hh:mma")}
        </span>
      </div>
    </div>
  );
};

export default QuickAccessItem;
