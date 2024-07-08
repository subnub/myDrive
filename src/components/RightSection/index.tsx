import bytes from "bytes";
import moment from "moment";
import { memo, useMemo } from "react";
import ContextMenu from "../ContextMenu";
import classNames from "classnames";
import { useDispatch } from "react-redux";
import { getFileExtension } from "../../utils/files";
import { useContextMenu } from "../../hooks/contextMenu";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/store";
import { resetSelected, setPopupSelect } from "../../reducers/selected";
import { useUtils } from "../../hooks/utils";

const RightSection = memo(() => {
  const selectedItem = useAppSelector((state) => state.selected.mainSection);
  const { isTrash } = useUtils();
  const navigate = useNavigate();
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
    return moment(date).format("L");
  }, [selectedItem?.file?.uploadDate, selectedItem.folder?.createdAt, moment]);

  const fileSize = useMemo(() => {
    if (!selectedItem.file?.length) return 0;
    return bytes(selectedItem.file.length);
  }, [selectedItem?.file?.length, bytes]);

  const fileExtension = useMemo(() => {
    if (!selectedItem?.file?.filename) return null;
    return getFileExtension(selectedItem.file.filename);
  }, [selectedItem?.file?.filename, getFileExtension]);

  const {
    onContextMenu,
    closeContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    clickStopPropagation,
    ...contextMenuState
  } = useContextMenu();

  const reset = () => {
    dispatch(resetSelected());
  };
  const openItem = () => {
    if (selectedItem.file) {
      dispatch(setPopupSelect({ type: "file", file: selectedItem.file }));
    } else if (!isTrash) {
      navigate(`/folder/${selectedItem.id}`);
    } else {
      navigate(`/folder-trash/${selectedItem.id}`);
    }
  };
  return (
    <div
      className={classNames(
        "!hidden desktopMode:!flex min-w-[260px] max-w-[260px] border-l border-[#e8eef2] p-[25px] bg-white right-0 justify-center relative",
        selectedItem.id === "" ? "flex justify-center items-center" : ""
      )}
    >
      {selectedItem.id === "" ? (
        <div className="flex flex-col justify-center items-center text-center">
          <span>
            <img src="/assets/filedetailsicon.svg" alt="filedetailsicon" />
          </span>
          <p className="text-[#637381] text-[16px] leading-[24px] font-normal m-0 mt-[30px]">
            Select a file or folder to view it’s details
          </p>
        </div>
      ) : (
        <div className="w-[210px]">
          <div className="flex flex-row">
            <div>
              <img
                className="flex w-auto max-w-full"
                src="/assets/typedetailed1.svg"
                alt="typedetailed1"
              />
            </div>
            <img
              className="w-[30px] h-[30px] ml-8 cursor-pointer absolute right-3"
              src="/images/close_icon.png"
              onClick={reset}
            />
          </div>

          <div className="m-[20px_0]">
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
          <div className="mt-[15px] flex items-center">
            <a
              className="w-[80px] h-[40px] inline-flex items-center justify-center border border-[#3c85ee] rounded-[4px] text-[#3c85ee] text-[15px] font-medium no-underline animate cursor-pointer hover:bg-[#f6f5fd]"
              onClick={openItem}
            >
              Open
            </a>
            <div className="ml-[15px] px-[20px]">
              <a
                className="w-[40px] h-[40px] rounded-[4px] inline-flex items-center justify-center border border-[#919eab] text-[#919eab] no-underline animate cursor-pointer"
                // @ts-ignore
                onClick={onContextMenu}
              >
                <i className="fas fa-ellipsis-h" aria-hidden="true"></i>
              </a>
            </div>
          </div>
          {contextMenuState.selected && (
            <div onClick={clickStopPropagation}>
              <ContextMenu
                contextSelected={contextMenuState}
                closeContext={closeContextMenu}
                folderMode={!selectedItem.file}
                file={selectedItem.file}
                folder={selectedItem.folder}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default RightSection;
