import capitalize from "../../utils/capitalize";
import moment from "moment";
import React, { useMemo, useRef } from "react";
import ContextMenu from "../ContextMenu";
import mobilecheck from "../../utils/mobileCheck";
import { useContextMenu } from "../../hooks/contextMenu";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import { useThumbnail } from "../../hooks/files";
import { getFileColor, getFileExtension } from "../../utils/files";
import { startSetSelectedItem } from "../../actions/selectedItem";
import { setPopupFile } from "../../actions/popupFile";
import bytes from "bytes";

const FileItem = (props) => {
  const { file } = props;
  const currentSelectedItem = useSelector(
    (state) => state.selectedItem.selected
  );
  const listView = useSelector((state) => state.filter.listView);
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
    () => getFileExtension(file.filename, listView ? 3 : 4),
    [file.filename]
  );

  const imageColor = useMemo(
    () => getFileColor(file.filename),
    [file.filename]
  );
  const elementSelected = useMemo(
    () => file._id === currentSelectedItem,
    [file._id, currentSelectedItem]
  );

  const fileClick = () => {
    const currentDate = Date.now();

    if (!elementSelected) {
      dispatch(startSetSelectedItem(file._id, true, false));
    }

    const isMobile = mobilecheck();

    if (isMobile || currentDate - lastSelected.current < 1500) {
      dispatch(setPopupFile({ showPopup: true, ...file }));
    }

    lastSelected.current = Date.now();
  };

  if (listView) {
    return (
      <tr
        className={classNames(
          "text-[14px] font-normal border-y",
          !elementSelected
            ? "text-[#212b36] hover:bg-[#f6f5fd]"
            : "bg-[#3c85ee] animate text-white"
        )}
        onClick={fileClick}
        onContextMenu={onContextMenu}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* <ContextMenu parent={props.metadata.parent} contextSelected={props.state.contextSelected} closeContext={props.closeContext} downloadFile={props.downloadFile} file={props} changeEditNameMode={props.changeEditNameMode} closeEditNameMode={props.closeEditNameMode} changeDeleteMode={props.changeDeleteMode} startMovingFile={props.startMovingFile}/> */}
        <td className="p-5">
          <div className="flex items-center fileTextXL:w-[560px] w-[60px] xxs:w-[160px] xs:w-[260px] fileTextXSM:w-[460px] fileTextLG:w-[440px] fileTextMD:w-[240px] mobileMode:w-[160px]">
            <span className="inline-flex items-center mr-[15px] max-w-[27px] min-w-[27px] min-h-[27px] max-h-[27px]">
              <div
                className="h-[27px] w-[27px] bg-red-500 rounded-[3px] flex flex-row justify-center items-center"
                style={{ background: imageColor }}
              >
                <span className="font-semibold text-[9.5px] text-white">
                  {fileExtension}
                </span>
              </div>
            </span>
            <p className="m-0 max-h-[30px] overflow-hidden whitespace-nowrap text-ellipsis block capitalize">
              {props.file.filename}
            </p>
          </div>
        </td>
        <td className="p-5 hidden fileListShowDetails:table-cell">
          <p className="text-center">{bytes(props.file.length)}</p>
        </td>
        <td className="p-5 hidden fileListShowDetails:table-cell">
          <p className="text-center">
            {moment(props.file.uploadDate).format("MM/DD/YY hh:mma")}
          </p>
        </td>
        <td>
          <div className="flex justify-center items-center">
            {contextMenuState.selected && (
              <div onClick={clickStopPropagation}>
                <ContextMenu
                  gridMode={false}
                  quickItemMode={false}
                  contextSelected={contextMenuState}
                  closeContext={closeContextMenu}
                  file={file}
                />
              </div>
            )}

            {/* <ContextMenu parent={props.metadata.parent} contextSelected={props.state.contextSelected} closeContext={props.closeContext} downloadFile={props.downloadFile} file={props} changeEditNameMode={props.changeEditNameMode} closeEditNameMode={props.closeEditNameMode} changeDeleteMode={props.changeDeleteMode} startMovingFile={props.startMovingFile}/> */}
            <a onClick={onContextMenu}>
              <svg
                className={classNames(
                  "w-4 h-4",
                  elementSelected ? "text-white" : "text-[#919eab]"
                )}
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="ellipsis-h"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"
                ></path>
              </svg>
            </a>
          </div>
        </td>
      </tr>
    );
  } else {
    return (
      <div
        className={classNames(
          "border rounded-md o transition-all duration-400 ease-in-out cursor-pointer w-48 flex items-center justify-center flex-col h-[150px] animiate hover:border-[#3c85ee] overflow-hidden",
          elementSelected ? "border-[#3c85ee]" : "border-[#ebe9f9]"
        )}
        onClick={fileClick}
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
  }
};

export default FileItem;
