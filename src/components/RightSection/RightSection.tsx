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

const RightSection = memo(() => {
  const selectedItem = useAppSelector((state) => state.selected.mainSection);
  const dispatch = useDispatch();

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
          <FileDetailsIcon />
          <p className="text-[#637381] text-[16px] leading-[24px] font-normal m-0 mt-[30px]">
            Select a file or folder to view it’s details
          </p>
        </div>
      ) : (
        <div className="w-full">
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
            <div className="mb-5">
              <p className="m-0 text-[#212b36] text-[16px] font-bold max-h-[90px] overflow-hidden text-ellipsis block break-all">
                {formattedName}
              </p>
            </div>
            <div>
              <div className="flex mb-[7px] justify-start">
                <span className="text-[#637381] text-[13px] font-normal mr-[35px] leading-[20px] min-w-[50px]">
                  Type
                </span>
                <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
                  {selectedItem.file ? fileExtension : "Folder"}
                </span>
              </div>
              <div
                className="flex mb-[7px] justify-start"
                style={
                  !selectedItem.file ? { display: "none" } : { display: "flex" }
                }
              >
                <span className="text-[#637381] text-[13px] font-normal mr-[35px] leading-[20px] min-w-[50px]">
                  Size
                </span>
                <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
                  {fileSize}
                </span>
              </div>
              <div className="flex mb-[7px] justify-start">
                <span className="text-[#637381] text-[13px] font-normal mr-[35px] leading-[20px] min-w-[50px]">
                  Created
                </span>
                <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
                  {formattedDate}
                </span>
              </div>
              <div
                className="flex mb-[7px] justify-start"
                style={
                  !selectedItem.file ? { display: "none" } : { display: "flex" }
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
      )}
    </div>
  );
});

export default RightSection;
