import { memo, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { downloadFileAPI } from "../../api/filesAPI";
import CloseIcon from "../../icons/CloseIcon";
import ActionsIcon from "../../icons/ActionsIcon";
import { useContextMenu } from "../../hooks/contextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
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

  const outterWrapperClick = (e: any) => {
    if (e.target.id !== "outer-wrapper" || contextMenuState.selected) return;
    dispatch(resetPopupSelect());
  };

  return (
    <div
      className="w-screen h-screen bg-black bg-opacity-80 absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center flex-col"
      id="outer-wrapper"
      onClick={outterWrapperClick}
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
        className="absolute top-5 flex justify-between w-full"
        id="actions-wrapper"
      >
        <div className="ml-4 flex items-center">
          <span className="inline-flex items-center mr-4 max-w-7 min-w-7 min-h-7 max-h-7">
            <div
              className="h-7 w-7 bg-red-500 rounded-md flex flex-row justify-center items-center"
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
              className="pointer text-white w-h h-6 mr-4 cursor-pointer"
              id="action-context-icon"
            />
          </div>

          <div onClick={closePhotoViewer} id="action-close-wrapper">
            <CloseIcon
              className="pointer text-white w-6 h-6 cursor-pointer"
              id="action-close-icon"
            />
          </div>
        </div>
      </div>
      <div className="w-[300px] p-4 bg-white rounded-md border shadow-lg text-xs flex flex-col space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-primary font-normal">Type</span>
          <span className="text-black font-normal ">{fileExtension}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-primary font-normal">Size</span>
          <span className="text-black font-normal ">{fileSize}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-primary font-normal ">Created</span>
          <span className="text-black font-normal ">{formattedDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-primary font-normal ">Access</span>
          <span className="text-black font-normal ">
            {file.metadata.link ? "Public" : "Private"}
          </span>
        </div>
        <div className="flex justify-center">
          <a
            onClick={downloadItem}
            className="px-5 py-2.5 inline-flex items-center justify-center border border-primary rounded-md text-primary text-sm font-medium no-underline animate mr-4 cursor-pointer hover:bg-white-hover"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
});

export default FileInfoPopup;
