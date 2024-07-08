import capitalize from "../../utils/capitalize";
import moment from "moment";
import React, { memo, useMemo, useRef } from "react";
import ContextMenu from "../ContextMenu";
import classNames from "classnames";
import { getFileColor, getFileExtension } from "../../utils/files";
import { useThumbnail } from "../../hooks/files";
import { useContextMenu } from "../../hooks/contextMenu";
import { useDispatch, useSelector } from "react-redux";
import mobilecheck from "../../utils/mobileCheck";
import { startSetSelectedItem } from "../../actions/selectedItem";
import { setPopupFile } from "../../actions/popupFile";
import { FileInterface } from "../../types/file";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import {
  setMainSelect,
  setMultiSelectMode,
  setPopupSelect,
} from "../../reducers/selected";
import PlayButtonIcon from "../../icons/PlayIcon";

interface QuickAccessItemProps {
  file: FileInterface;
}

const QuickAccessItem = memo((props: QuickAccessItemProps) => {
  const { file } = props;
  const elementSelected = useAppSelector((state) => {
    if (state.selected.mainSection.type !== "quick-item") return false;
    return state.selected.mainSection.id === file._id;
  });
  const elementMultiSelected = useAppSelector((state) => {
    if (!state.selected.multiSelectMode) return false;
    const selected = state.selected.multiSelectMap[file._id];
    return selected && selected.type === "quick-item";
  });
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
  );
  const { image, hasThumbnail, imageOnError } = useThumbnail(
    file.metadata.hasThumbnail,
    file.metadata.thumbnailID,
    true
  );
  const dispatch = useAppDispatch();
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

  // TODO: See if we can memoize this and remove any
  const quickItemClick = (e: any) => {
    const multiSelectKey = e.metaKey || e.ctrlKey;
    if (multiSelectMode || multiSelectKey) {
      dispatch(
        setMultiSelectMode({
          type: "quick-item",
          id: file._id,
          file: file,
          folder: null,
        })
      );
      return;
    }
    const currentDate = Date.now();

    if (!elementSelected) {
      // dispatch(startSetSelectedItem(file._id, true, true));
      dispatch(
        setMainSelect({ file, id: file._id, type: "quick-item", folder: null })
      );
      lastSelected.current = Date.now();
      return;
    }

    const isMobile = mobilecheck();

    if (isMobile || currentDate - lastSelected.current < 1500) {
      dispatch(setPopupSelect({ type: "quick-item", file }));
    }

    lastSelected.current = Date.now();
  };

  return (
    <div
      className={classNames(
        "border rounded-md o transition-all duration-400 ease-in-out cursor-pointer flex items-center justify-center flex-col h-[130px] sm:h-[150px] animiate hover:border-[#3c85ee] overflow-hidden bg-white",
        elementSelected || elementMultiSelected
          ? "border-[#3c85ee]"
          : "border-[#ebe9f9]"
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
          <div className="w-full min-h-[88px] max-h-[88px] h-full flex">
            <img className=" object-cover" src={image} onError={imageOnError} />
            {file.metadata.isVideo && (
              <div className="w-full h-full absolute flex justify-center items-center text-white">
                <PlayButtonIcon className="w-[50px] h-[50px]" />
              </div>
            )}
          </div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
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
          elementSelected || elementMultiSelected
            ? "bg-[#3c85ee] text-white"
            : "bg-white text-[#637381]"
        )}
      >
        <p
          className={classNames(
            "text-[14px] leading-[16px] font-normal max-w-full overflow-hidden text-ellipsis whitespace-nowrap animate mb-1 sm:mb-0",
            elementSelected || elementMultiSelected
              ? "text-white"
              : "text-[#212b36]"
          )}
        >
          {capitalize(file.filename)}
        </p>
        <span
          className={classNames(
            "text-[#637381] font-normal max-w-full whitespace-nowrap text-xs animate hidden sm:block mt-1",
            elementSelected || elementMultiSelected
              ? "text-white"
              : "text-[#637381]"
          )}
        >
          Created {moment(file.uploadDate).format("MM/DD/YY hh:mma")}
        </span>
      </div>
    </div>
  );
});

export default QuickAccessItem;
