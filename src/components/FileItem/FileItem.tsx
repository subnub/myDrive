import capitalize from "../../utils/capitalize";
import React, { memo, useMemo, useRef, useState } from "react";
import ContextMenu from "../ContextMenu/ContextMenu";
import { useContextMenu } from "../../hooks/contextMenu";
import classNames from "classnames";
import { getFileColor, getFileExtension } from "../../utils/files";
import bytes from "bytes";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { setMainSelect, setMultiSelectMode } from "../../reducers/selected";
import PlayButtonIcon from "../../icons/PlayIcon";
import { setPopupSelect } from "../../reducers/selected";
import ActionsIcon from "../../icons/ActionsIcon";
import { FileInterface } from "../../types/file";
import getBackendURL from "../../utils/getBackendURL";
import dayjs from "dayjs";
import CalendarIcon from "../../icons/CalendarIcon";
import ClockIcon from "../../icons/ClockIcon";

interface FileItemProps {
  file: FileInterface;
}

const FileItem: React.FC<FileItemProps> = memo((props) => {
  const { file } = props;
  const elementSelected = useAppSelector((state) => {
    if (state.selected.mainSection.type !== "file") return false;
    return state.selected.mainSection.id === file._id;
  });
  const elementMultiSelected = useAppSelector((state) => {
    if (!state.selected.multiSelectMode) return false;
    const selected = state.selected.multiSelectMap[file._id];
    return selected && selected.type === "file";
  });
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
  );
  const listView = useAppSelector((state) => state.general.listView);
  const thumbnailURL = `${getBackendURL()}/file-service/thumbnail/${
    file.metadata.thumbnailID
  }`;
  const hasThumbnail = file.metadata.hasThumbnail;
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
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
  const fileExtension = getFileExtension(file.filename, listView ? 3 : 4);

  const imageColor = getFileColor(file.filename);

  const formattedFilename = capitalize(file.filename);

  const formattedCreatedDate = useMemo(
    () => dayjs(file.uploadDate).format("MM/DD/YY hh:mma"),
    [file.uploadDate]
  );

  const fileClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const multiSelectKey = e.metaKey || e.ctrlKey;

    if (multiSelectMode || multiSelectKey) {
      dispatch(
        setMultiSelectMode([
          {
            type: "file",
            id: file._id,
            file: file,
            folder: null,
          },
        ])
      );
      return;
    }

    const currentDate = Date.now();

    if (!elementSelected) {
      dispatch(
        setMainSelect({ file, id: file._id, type: "file", folder: null })
      );
      lastSelected.current = Date.now();
      return;
    }

    if (currentDate - lastSelected.current < 1500) {
      dispatch(setPopupSelect({ type: "file", file }));
    }

    lastSelected.current = Date.now();
  };

  if (listView) {
    return (
      <tr
        className={classNames(
          "text-[14px] font-normal border-y",
          !elementSelected && !elementMultiSelected
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
          <div className="flex items-center fileTextXL:w-[560px] w-[60px] xxs:w-[160px] xs:w-[260px] fileTextXSM:w-[460px] fileTextLG:w-[440px] fileTextMD:w-[240px] desktopMode:w-[160px]">
            <span className="inline-flex items-center mr-[15px] max-w-[27px] min-w-[27px] min-h-[27px] max-h-[27px]">
              <div
                className="h-7 w-7 bg-red-500 rounded-md flex flex-row justify-center items-center"
                style={{ background: imageColor }}
              >
                <span className="font-semibold text-[9.5px] text-white">
                  {fileExtension}
                </span>
              </div>
            </span>
            <p className="m-0 max-h-[30px] overflow-hidden whitespace-nowrap text-ellipsis block">
              {formattedFilename}
            </p>
          </div>
        </td>
        <td className="p-5 hidden fileListShowDetails:table-cell">
          <p className="text-center">{bytes(props.file.length)}</p>
        </td>
        <td className="p-5 hidden fileListShowDetails:table-cell">
          <p className="text-center whitespace-nowrap">
            {formattedCreatedDate}
          </p>
        </td>
        <td>
          <div className="flex justify-center items-center">
            {contextMenuState.selected && (
              <div onClick={clickStopPropagation}>
                <ContextMenu
                  quickItemMode={false}
                  contextSelected={contextMenuState}
                  closeContext={closeContextMenu}
                  file={file}
                />
              </div>
            )}

            {/* <ContextMenu parent={props.metadata.parent} contextSelected={props.state.contextSelected} closeContext={props.closeContext} downloadFile={props.downloadFile} file={props} changeEditNameMode={props.changeEditNameMode} closeEditNameMode={props.closeEditNameMode} changeDeleteMode={props.changeDeleteMode} startMovingFile={props.startMovingFile}/> */}

            <a onClick={onContextMenu}>
              <ActionsIcon
                className={classNames(
                  "w-4 h-4",
                  elementSelected || elementMultiSelected
                    ? "text-white"
                    : "text-[#919eab]"
                )}
              />
            </a>
          </div>
        </td>
      </tr>
    );
  } else {
    return (
      <div
        className={classNames(
          "border rounded-md o transition-all duration-400 ease-in-out cursor-pointer flex items-center justify-center flex-col h-[150px] animiate hover:border-primary overflow-hidden bg-white ",
          elementSelected || elementMultiSelected
            ? "border-primary"
            : "border-gray-third"
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
              quickItemMode={false}
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
              "mt-2": !thumbnailLoaded,
            }
          )}
        >
          {hasThumbnail && (
            <div
              className={classNames(
                "w-full min-h-[88px] max-h-[88px] h-full flex",
                {
                  hidden: !thumbnailLoaded,
                }
              )}
            >
              <img
                className="object-cover w-full disable-force-touch"
                src={thumbnailURL}
                onLoad={() => setThumbnailLoaded(true)}
              />
              {file.metadata.isVideo && (
                <div className="w-full h-full absolute flex justify-center items-center text-white">
                  <PlayButtonIcon className="w-[50px] h-[50px]" />
                </div>
              )}
            </div>
          )}
          {!thumbnailLoaded && (
            <>
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
              <div className="w-full h-full absolute flex justify-center items-center text-white mt-3">
                <p className="text-sm">{fileExtension}</p>
              </div>
            </>
          )}
        </div>
        <div
          className={classNames(
            "p-3 overflow-hidden text-ellipsis block w-full animate",
            elementSelected || elementMultiSelected
              ? "bg-primary text-white"
              : "bg-white text-gray-primary"
          )}
        >
          <p
            className={classNames(
              "text-[14px] leading-[16px] font-normal max-w-full overflow-hidden text-ellipsis whitespace-nowrap animate mb-0",
              elementSelected || elementMultiSelected
                ? "text-white"
                : "text-[#212b36]"
            )}
          >
            {formattedFilename}
          </p>
          <div className="flex flex-row items-center mt-2">
            <ClockIcon className="h-4 w-4 mr-1" />
            <p
              className={classNames(
                "m-0 font-normal max-w-full whitespace-nowrap text-xs animate block",
                elementSelected || elementMultiSelected
                  ? "text-white"
                  : "text-gray-primary]"
              )}
            >
              {formattedCreatedDate}
            </p>
          </div>
        </div>
      </div>
    );
  }
});

export default FileItem;
