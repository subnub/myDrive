import { memo, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { downloadFileAPI } from "../../api/filesAPI";
import CloseIcon from "../../icons/CloseIcon";
import ActionsIcon from "../../icons/ActionsIcon";
import { useContextMenu } from "../../hooks/contextMenu";
import ContextMenu from "../ContextMenu";
import { resetPopupSelect } from "../../reducers/selected";
import { getFileColor, getFileExtension } from "../../utils/files";
import bytes from "bytes";
import moment from "moment";

const FileInfoPopup = memo(() => {
  const file = useAppSelector((state) => state.selected.popupModal.file)!;
  const dispatch = useAppDispatch();
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
    () => getFileExtension(file.filename, 3),
    [file.filename]
  );

  const imageColor = useMemo(
    () => getFileColor(file.filename),
    [file.filename]
  );

  const formattedDate = useMemo(() => {
    return moment(file.uploadDate).format("L");
  }, [file.uploadDate, moment]);

  const fileSize = useMemo(() => {
    return bytes(file.metadata.size);
  }, [file.metadata.size, bytes]);

  const closePhotoViewer = useCallback(() => {
    dispatch(resetPopupSelect());
  }, [resetPopupSelect]);

  const downloadItem = () => {
    downloadFileAPI(file._id);
  };

  return (
    <div
      className="w-screen h-screen bg-black bg-opacity-80 absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center flex-col"
      id="outer-wrapper"
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
        className="absolute top-[20px] flex justify-between w-full"
        id="actions-wrapper"
      >
        <div className="ml-4 flex items-center">
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
          <p className="text-md text-white text-ellipsis overflow-hidden max-w-[200px] md:max-w-[600px] whitespace-nowrap">
            {file.filename}
          </p>
        </div>
        <div className="flex mr-4">
          <div onClick={onContextMenu} id="action-context-wrapper">
            <ActionsIcon
              className="pointer text-white w-[20px] h-[25px] mr-4"
              id="action-context-icon"
            />
          </div>

          <div onClick={closePhotoViewer} id="action-close-wrapper">
            <CloseIcon
              className="pointer text-white w-[25px] h-[25px]"
              id="action-close-icon"
            />
          </div>
        </div>
      </div>
      <div className="w-[300px] p-4 bg-white rounded-md">
        <div className="mt-2 flex justify-between">
          <span className="text-[#637381] text-[13px] font-normal leading-[20px] min-w-[50px]">
            Type
          </span>
          <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
            {fileExtension}
          </span>
        </div>
        <div className="mt-2 flex justify-between">
          <span className="text-[#637381] text-[13px] font-normal leading-[20px] min-w-[50px]">
            Size
          </span>
          <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
            {fileSize}
          </span>
        </div>
        <div className="mt-2 flex justify-between">
          <span className="text-[#637381] text-[13px] font-normal leading-[20px] min-w-[50px]">
            Created
          </span>
          <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
            {formattedDate}
          </span>
        </div>
        <div className="mt-2 flex justify-between">
          <span className="text-[#637381] text-[13px] font-normal leading-[20px] min-w-[50px]">
            Access
          </span>
          <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
            {file.metadata.link ? "Public" : "Private"}
          </span>
        </div>
        <div className="mt-[15px] flex justify-center">
          <a
            onClick={downloadItem}
            className="w-[80px] h-[40px] inline-flex items-center justify-center border border-[#3c85ee] rounded-[4px] text-[#3c85ee] text-[15px] font-medium no-underline animate mr-4 cursor-pointer hover:bg-[#f6f5fd]"
          >
            Download
          </a>
          <ActionsIcon
            onClick={onContextMenu}
            className="w-[20px] ml-4 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
});

export default FileInfoPopup;
