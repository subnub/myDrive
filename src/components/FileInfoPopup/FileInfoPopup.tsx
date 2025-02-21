import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { downloadFileAPI } from "../../api/filesAPI";
import CloseIcon from "../../icons/CloseIcon";
import ActionsIcon from "../../icons/ActionsIcon";
import { useContextMenu } from "../../hooks/contextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import { resetPopupSelect } from "../../reducers/selected";
import { getFileColor, getFileExtension } from "../../utils/files";
import bytes from "bytes";
import dayjs from "dayjs";
import LockIcon from "../../icons/LockIcon";
import OneIcon from "../../icons/OneIcon";
import PublicIcon from "../../icons/PublicIcon";
import StorageIcon from "../../icons/StorageIcon";
import CalendarIcon from "../../icons/CalendarIcon";
import DownloadIcon from "../../icons/DownloadIcon";
import { toast } from "react-toastify";

const FileInfoPopup = () => {
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
  const [animate, setAnimate] = useState(false);

  const fileExtension = getFileExtension(file.filename, 3);

  const imageColor = getFileColor(file.filename);

  const formattedDate = useMemo(
    () => dayjs(file.uploadDate).format("MM/DD/YYYY hh:mma"),
    [file.uploadDate]
  );

  const fileSize = bytes(file.metadata.size);

  const closePhotoViewer = () => {
    setAnimate(false);
    setTimeout(() => dispatch(resetPopupSelect()), 200);
  };

  const downloadItem = () => {
    downloadFileAPI(file._id);
  };

  const outterWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      (e.target as HTMLDivElement).id !== "outer-wrapper" ||
      contextMenuState.selected
    ) {
      return;
    }
    setAnimate(false);
    setTimeout(() => dispatch(resetPopupSelect()), 200);
  };

  const permissionText = (() => {
    if (file.metadata.linkType === "one") {
      return `Temporary`;
    } else if (file.metadata.linkType === "public") {
      return "Public";
    } else {
      return "Private";
    }
  })();

  const copyName = () => {
    navigator.clipboard.writeText(file.filename);
    toast.success("Filename Copied");
  };

  useEffect(() => {
    setAnimate(true);
  }, []);

  useEffect(() => {
    const handleBack = () => {
      dispatch(resetPopupSelect());
    };
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);

  return (
    <div
      className="w-screen dynamic-height bg-black bg-opacity-80 absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center flex-col"
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
      <div
        className="w-[90%] sm:w-[500px] p-6 bg-white rounded-md animate-easy"
        style={{ marginTop: !animate ? "calc(100vh + 350px" : 0 }}
      >
        <div className="bg-light-primary p-6 rounded-md flex items-center space-x-2">
          <input
            className="rounded-md w-full text-xs h-10 p-2"
            value={file.filename}
          />
          <button
            className="bg-primary text-white hover:bg-primary-hover text-xs w-24 min-w-20 p-1 py-3 rounded-md"
            onClick={copyName}
          >
            Copy name
          </button>
        </div>
        <p className="mt-4">File details</p>
        <div className="mt-2 text-xs space-y-2">
          <div className="flex flex-row items-center">
            {!file.metadata.linkType && <LockIcon className="w-5 h-5" />}
            {file.metadata.linkType === "one" && (
              <OneIcon className="w-5 h-5" />
            )}
            {file.metadata.linkType === "public" && (
              <PublicIcon className="w-5 h-5" />
            )}
            <p className="ml-2 text-gray-500">{permissionText}</p>
          </div>
          <div className="flex flex-row items-center">
            <StorageIcon className="w-5 h-5" />
            <p className="ml-2 text-gray-500">{fileSize}</p>
          </div>
          <div className="flex flex-row items-center" items-center>
            <CalendarIcon className="w-5 h-5" />
            <p className="ml-2 text-gray-500">{formattedDate}</p>
          </div>
          <div className="flex w-full justify-center items-center pt-4">
            <button
              className="bg-primary text-white hover:bg-primary-hover text-xs p-1 py-3 rounded-md flex items-center justify-center w-40 space-x-2"
              onClick={downloadItem}
            >
              <DownloadIcon className="w-5 h-5" />
              <p>Download</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileInfoPopup;
