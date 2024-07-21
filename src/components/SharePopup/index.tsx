import { memo, useEffect, useMemo, useState } from "react";
import CloseIcon from "../../icons/CloseIcon";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { getFileColor, getFileExtension } from "../../utils/files";
import bytes from "bytes";
import moment from "moment";
import {
  makeOneTimePublicPopup,
  makePublicPopup,
  removeLinkPopup,
} from "../../popups/file";
import {
  makeOneTimePublicAPI,
  makePublicAPI,
  removeLinkAPI,
} from "../../api/filesAPI";
import { useFilesClient } from "../../hooks/files";
import {
  resetShareModal,
  setMainSelect,
  setShareModal,
} from "../../reducers/selected";
import { toast } from "react-toastify";

const SharePopup = memo(() => {
  const file = useAppSelector((state) => state.selected.shareModal.file)!;
  const [updating, setUpdating] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const dispatch = useAppDispatch();
  const { invalidateFilesCache } = useFilesClient();

  const imageColor = useMemo(
    () => getFileColor(file.filename),
    [file.filename]
  );

  const fileExtension = useMemo(
    () => getFileExtension(file.filename, 3),
    [file.filename]
  );

  const formattedDate = useMemo(() => {
    return moment(file.uploadDate).format("MM/DD/YYYY");
  }, [file.uploadDate, moment]);

  const fileSize = useMemo(() => {
    return bytes(file.length);
  }, [file.length, bytes]);

  const makePublic = async () => {
    try {
      const result = await makePublicPopup();
      if (!result) return;
      setUpdating(true);
      const { file: updatedFile } = await toast.promise(
        makePublicAPI(file._id),
        {
          pending: "Making Public...",
          success: "Public Link Generated",
          error: "Error Making Public",
        }
      );
      dispatch(
        setMainSelect({
          file: updatedFile,
          id: updatedFile._id,
          type: "file",
          folder: null,
        })
      );
      dispatch(setShareModal(updatedFile));
      invalidateFilesCache();
    } catch (e) {
      console.log("Error making file public", e);
    } finally {
      setUpdating(false);
    }
  };

  const makeOneTimePublic = async () => {
    try {
      const result = await makeOneTimePublicPopup();
      if (!result) return;
      setUpdating(true);
      const { file: updatedFile } = await toast.promise(
        makeOneTimePublicAPI(file._id),
        {
          pending: "Making Public...",
          success: "Public Link Generated",
          error: "Error Making Public",
        }
      );
      dispatch(
        setMainSelect({
          file: updatedFile,
          id: updatedFile._id,
          type: "file",
          folder: null,
        })
      );
      dispatch(setShareModal(updatedFile));
      invalidateFilesCache();
    } catch (e) {
      console.log("Error making file public", e);
    } finally {
      setUpdating(false);
    }
  };

  const removeLink = async () => {
    try {
      const result = await removeLinkPopup();
      if (!result) return;
      setUpdating(true);
      const updatedFile = await toast.promise(removeLinkAPI(file._id), {
        pending: "Removing Link...",
        success: "Link Removed",
        error: "Error Removing Link",
      });
      dispatch(
        setMainSelect({
          file: updatedFile,
          id: updatedFile._id,
          type: "file",
          folder: null,
        })
      );
      dispatch(setShareModal(updatedFile));
      invalidateFilesCache();
      setShareLink("");
    } catch (e) {
      console.log("Error removing link", e);
    } finally {
      setUpdating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Link Copied");
  };

  const closeShareModal = () => {
    dispatch(resetShareModal());
  };

  const outterWrapperClick = (e: any) => {
    if (e.target.id !== "outer-wrapper") return;
    closeShareModal();
  };

  useEffect(() => {
    if (!file.metadata.link) return;
    const url = `${window.location.origin}/download-page/${file._id}/${shareLink}`;
    console.log("url", url);
    setShareLink(url);
  }, [file.metadata.link]);

  return (
    <div
      className="w-screen h-screen bg-black bg-opacity-80 absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center flex-col"
      id="outer-wrapper"
      onClick={outterWrapperClick}
    >
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
          <div id="action-close-wrapper" onClick={closeShareModal}>
            <CloseIcon className="text-white w-[25px] h-[25px] cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="w-[90%] sm:w-[400px] p-4 bg-white rounded-md">
        <p className="text-lg mb-4 text-center">Share file</p>
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

        {shareLink && (
          <div className="relative">
            <input
              placeholder="Share link"
              className="w-full h-[48px] pl-[12px] pr-[53px] text-black border border-[#637381] rounded-[5px] outline-none text-[15px] mt-4"
              value={shareLink}
              readOnly={true}
            />
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center">
              <a
                className="text-[#3c85ee] text-[15px] font-medium no-underline mr-2 mt-4 cursor-pointer"
                onClick={copyLink}
              >
                Copy
              </a>
            </div>
          </div>
        )}

        {!shareLink && (
          <div className="flex justify-between mt-4">
            <button
              className="py-2 px-4 inline-flex items-center justify-center border border-[#3c85ee] rounded-[4px] text-[#3c85ee] text-[15px] font-medium no-underline animate cursor-pointer hover:bg-[#f6f5fd] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={makePublic}
              disabled={updating}
            >
              Share Indefinitely
            </button>
            <button
              className="py-2 px-4 inline-flex items-center justify-center border border-[#3c85ee] rounded-[4px] text-[#3c85ee] text-[15px] font-medium no-underline animate cursor-pointer hover:bg-[#f6f5fd] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={makeOneTimePublic}
              disabled={updating}
            >
              Single-Use Link
            </button>
          </div>
        )}

        {shareLink && (
          <div className="flex justify-center mt-4">
            <button
              className="py-2 px-4 inline-flex items-center justify-center border border-[#3c85ee] rounded-[4px] text-[#3c85ee] text-[15px] font-medium no-underline animate cursor-pointer hover:bg-[#f6f5fd] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={removeLink}
              disabled={updating}
            >
              Make Private
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default SharePopup;
