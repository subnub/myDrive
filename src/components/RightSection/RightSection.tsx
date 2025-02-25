import bytes from "bytes";
import { memo, useMemo } from "react";
import classNames from "classnames";
import { useDispatch } from "react-redux";
import { getFileColor, getFileExtension } from "../../utils/files";
import { useAppSelector } from "../../hooks/store";
import { resetSelected } from "../../reducers/selected";
import CloseIcon from "../../icons/CloseIcon";
import FileDetailsIcon from "../../icons/FileDetailsIcon";
import dayjs from "dayjs";
import DownloadIcon from "../../icons/DownloadIcon";
import ShareIcon from "../../icons/ShareIcon";
import TrashIcon from "../../icons/TrashIcon";
import RenameIcon from "../../icons/RenameIcon";
import { useActions } from "../../hooks/actions";
import RestoreIcon from "../../icons/RestoreIcon";

const RightSection = memo(() => {
  const selectedItem = useAppSelector((state) => state.selected.mainSection);
  const dispatch = useDispatch();
  const {
    renameItem,
    trashItem,
    deleteItem,
    restoreItem,
    openShareItemModal,
    downloadItem,
  } = useActions({
    quickItemMode: false,
  });

  const onAction = async (
    action: "rename" | "trash" | "delete" | "restore" | "download" | "share"
  ) => {
    const file = selectedItem.file;
    const folder = selectedItem.folder;

    switch (action) {
      case "rename":
        await renameItem(file, folder);
        break;
      case "trash":
        await trashItem(file, folder);
        break;
      case "delete":
        await deleteItem(file, folder);
        break;
      case "restore":
        await restoreItem(file, folder);
        break;
      case "download":
        downloadItem(file, folder);
        break;
      case "share":
        openShareItemModal(file);
    }
  };

  const itemTrashed =
    selectedItem?.file?.metadata.trashed || selectedItem?.folder?.trashed;

  const formattedName = useMemo(() => {
    if (!selectedItem.id) return "";
    const name = selectedItem.file?.filename || selectedItem.folder?.name || "";
    const maxLength = 66;
    const ellipsis = "...";
    if (name.length <= maxLength) {
      return name;
    }

    const startLength = Math.ceil((maxLength - ellipsis.length) / 2);
    const endLength = Math.floor((maxLength - ellipsis.length) / 2);

    const start = name.slice(0, startLength);
    const end = name.slice(-endLength);

    return `${start}${ellipsis}${end}`;
  }, [
    selectedItem?.id,
    selectedItem?.file?.filename,
    selectedItem?.folder?.name,
  ]);

  const formattedDate = useMemo(() => {
    const date =
      selectedItem.file?.uploadDate || selectedItem.folder?.createdAt;
    return dayjs(date).format("MM/DD/YYYY");
  }, [selectedItem?.file?.uploadDate, selectedItem.folder?.createdAt]);

  const fileSize = bytes(selectedItem.file?.length || 0);

  const fileExtension = (() => {
    if (!selectedItem?.file?.filename) return null;
    return getFileExtension(selectedItem.file.filename);
  })();

  const reset = () => {
    dispatch(resetSelected());
  };

  const bannerBackgroundColor = (() => {
    if (selectedItem.file) {
      return getFileColor(selectedItem.file.filename);
    } else if (selectedItem.folder) {
      return "#3c85ee";
    } else {
      return "#3c85ee";
    }
  })();

  const bannerText = (() => {
    if (selectedItem.file) {
      return getFileExtension(selectedItem.file.filename);
    } else if (selectedItem.folder) {
      return "Folder";
    } else {
      return "";
    }
  })();

  return (
    <div
      className={classNames(
        "!hidden desktopMode:!flex min-w-[260px] max-w-[260px] border-l border-gray-secondary bg-white right-0 justify-center relative mt-1.5",
        selectedItem.id === "" ? "flex justify-center items-center" : ""
      )}
    >
      {selectedItem.id === "" ? (
        <div className="flex flex-col justify-center items-center text-center">
          <FileDetailsIcon className="w-10 h-10" />
          <p className="text-gray-500 text-xs mt-4">
            Select a file or folder to view it’s details
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-col justify-between">
          <div>
            <div className="flex flex-row">
              <div></div>
              <div className="w-full h-16 flex items-center relative">
                <div
                  className="opacity-40 w-full h-full absolute"
                  style={{ background: bannerBackgroundColor }}
                ></div>
                <p className="text-sm ml-6 z-10">{bannerText}</p>
              </div>
              <CloseIcon
                className="w-5 h-5 p-1 cursor-pointer absolute right-3 top-5 bg-white rounded-full shadow-lg z-10"
                onClick={reset}
              />
            </div>
            <div className="p-6">
              <p className="m-0 text-[#212b36] text-sm font-bold max-h-[90px] overflow-hidden text-ellipsis block break-all">
                {formattedName}
              </p>
            </div>

            <div className="p-6 pt-0">
              <p className="text-sm mb-4">Information</p>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-[#637381] text-[13px] font-normal mr-[35px] leading-[20px] min-w-[50px]">
                    Type
                  </span>
                  <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
                    {selectedItem.file ? fileExtension : "Folder"}
                  </span>
                </div>
                <div
                  className="flex justify-between border-b border-gray-200 pb-2"
                  style={
                    !selectedItem.file
                      ? { display: "none" }
                      : { display: "flex" }
                  }
                >
                  <span className="text-[#637381] text-[13px] font-normal mr-[35px] leading-[20px] min-w-[50px]">
                    Size
                  </span>
                  <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
                    {fileSize}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-[#637381] text-[13px] font-normal mr-[35px] leading-[20px] min-w-[50px]">
                    Created
                  </span>
                  <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
                    {formattedDate}
                  </span>
                </div>
                <div
                  className="flex justify-between border-b border-gray-200 pb-2"
                  style={
                    !selectedItem.file
                      ? { display: "none" }
                      : { display: "flex" }
                  }
                >
                  <span className="text-[#637381] text-[13px] font-normal mr-[35px] leading-[20px] min-w-[50px]">
                    Access
                  </span>
                  <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
                    {selectedItem.file?.metadata.link ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* <div
            className="w-full p-0.5 opacity-40 h-10 absolute bottom-0"
            style={{ background: bannerBackgroundColor }}
          ></div>
          <div className="flex flex-row justify-between w-full z-10">
            {!itemTrashed && (
              <div
                className="text-gray-600 hover:text-black p-2.5 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => onAction("download")}
              >
                <DownloadIcon className="w-5 h-5" />
              </div>
            )}
            {selectedItem.file && !itemTrashed && (
              <div
                className="text-gray-600 hover:text-black p-2.5 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => onAction("share")}
              >
                <ShareIcon className="w-5 h-5" />
              </div>
            )}
            {itemTrashed && (
              <div
                className="text-gray-600 hover:text-black p-2.5 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => onAction("restore")}
              >
                <RestoreIcon className="w-5 h-5" />
              </div>
            )}
            <div
              className="text-gray-600 hover:text-black p-2.5 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => onAction(itemTrashed ? "delete" : "trash")}
            >
              <TrashIcon className="w-5 h-5" />
            </div>
            {!itemTrashed && (
              <div
                className="text-gray-600 hover:text-black p-2.5 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => onAction("rename")}
              >
                <RenameIcon className="w-5 h-5" />
              </div>
            )}
          </div> */}
        </div>
      )}
    </div>
  );
});

export default RightSection;
