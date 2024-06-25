import bytes from "bytes";
import moment from "moment";
import React, { memo, useMemo } from "react";
import ContextMenu from "../ContextMenu";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { resetSelectedItem } from "../../actions/selectedItem";
import { getFileExtension } from "../../utils/files";
import { useContextMenu } from "../../hooks/contextMenu";
import { setPopupFile } from "../../actions/popupFile";
import { useNavigate } from "react-router-dom";

const RightSection = memo(() => {
  const selectedItem = useSelector((state) => state.selectedItem);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formattedName = useMemo(() => {
    if (!selectedItem) return "";
    const name = selectedItem.name;
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
  }, [selectedItem?.name, selectedItem?.file]);

  const formattedDate = useMemo(
    () => moment(selectedItem.date).format("L"),
    [selectedItem?.date, moment]
  );

  const fileSize = useMemo(() => {
    if (!selectedItem || !selectedItem.size) return 0;
    return bytes(selectedItem.size);
  }, [selectedItem?.size, bytes]);

  const fileExtension = useMemo(() => {
    if (!selectedItem?.file) return null;
    return getFileExtension(selectedItem.name);
  }, [selectedItem?.file, selectedItem?.name, getFileExtension]);

  const {
    onContextMenu,
    closeContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    clickStopPropagation,
    ...contextMenuState
  } = useContextMenu();

  const resetSelected = () => {
    dispatch(resetSelectedItem());
  };
  const openItem = (e) => {
    if (selectedItem.file) {
      dispatch(setPopupFile({ showPopup: true, ...selectedItem.data }));
    } else {
      navigate(`/folder/${selectedItem.data._id}`);
    }
  };
  return (
    <div
      className={classNames(
        "!hidden mobileMode:!flex min-w-[260px] max-w-[260px] border-l border-[#e8eef2] p-[25px] bg-white right-0 justify-center relative",
        selectedItem.name === "" ? "flex justify-center items-center" : ""
      )}
    >
      {selectedItem.name === "" ? (
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
              onClick={resetSelected}
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
                {selectedItem.size ? fileExtension : "Folder"}
              </span>
            </div>
            <div
              className="flex mb-[7px] justify-start"
              style={
                !selectedItem.size ? { display: "none" } : { display: "flex" }
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
            <div className="flex mb-[7px] justify-start">
              <span className="text-[#637381] text-[13px] font-normal mr-[35px] leading-[20px] min-w-[50px]">
                Location
              </span>
              <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
                {selectedItem.drive
                  ? "Google Drive"
                  : selectedItem.personalFile
                  ? "Amazon S3"
                  : "myDrive"}
              </span>
            </div>
            <div
              className="flex mb-[7px] justify-start"
              style={
                !selectedItem.size ? { display: "none" } : { display: "flex" }
              }
            >
              <span className="text-[#637381] text-[13px] font-normal mr-[35px] leading-[20px] min-w-[50px]">
                Privacy
              </span>
              <span className="text-[#212b36] text-[13px] font-normal leading-[20px]">
                {selectedItem.link ? "Public" : "Only you"}
              </span>
            </div>
          </div>
          <div className="mt-[15px] flex items-center">
            <a
              className="w-[80px] h-[40px] inline-flex items-center justify-center border border-[#3c85ee] rounded-[4px] text-[#3c85ee] text-[15px] font-medium no-underline animate"
              onClick={openItem}
            >
              Open
            </a>
            <div className="ml-[15px] px-[20px]">
              <a
                className="w-[40px] h-[40px] rounded-[4px] inline-flex items-center justify-center border border-[#919eab] text-[#919eab] no-underline animate"
                onClick={onContextMenu}
              >
                <i className="fas fa-ellipsis-h" aria-hidden="true"></i>
              </a>
            </div>
          </div>
          {contextMenuState.selected && (
            <div onClick={clickStopPropagation}>
              <ContextMenu
                gridMode={true}
                contextSelected={contextMenuState}
                closeContext={closeContextMenu}
                folderMode={!selectedItem.file}
                file={selectedItem.data}
                folder={selectedItem.data}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default RightSection;
