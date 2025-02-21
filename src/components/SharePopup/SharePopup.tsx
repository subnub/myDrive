import { memo, useEffect, useMemo, useState } from "react";
import CloseIcon from "../../icons/CloseIcon";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { getFileColor, getFileExtension } from "../../utils/files";
import bytes from "bytes";
import {
  makeOneTimePublicAPI,
  makePublicAPI,
  removeLinkAPI,
} from "../../api/filesAPI";
import { useFiles, useQuickFiles } from "../../hooks/files";
import {
  resetShareModal,
  setMainSelect,
  setShareModal,
} from "../../reducers/selected";
import { toast } from "react-toastify";
import LockIcon from "../../icons/LockIcon";
import OneIcon from "../../icons/OneIcon";
import PublicIcon from "../../icons/PublicIcon";

const SharePopup = memo(() => {
  const file = useAppSelector((state) => state.selected.shareModal.file)!;
  const [updating, setUpdating] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [shareType, setShareType] = useState<"private" | "public" | "one">(
    "private"
  );
  const dispatch = useAppDispatch();
  const { refetch: refetchFiles } = useFiles(false);
  const { refetch: refetchQuickFiles } = useQuickFiles(false);
  const [animate, setAnimate] = useState(false);

  const imageColor = getFileColor(file.filename);

  const fileExtension = getFileExtension(file.filename, 3);

  const makePublic = async () => {
    try {
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
      refetchFiles();
      refetchQuickFiles();
    } catch (e) {
      console.log("Error making file public", e);
    } finally {
      setUpdating(false);
    }
  };

  const makeOneTimePublic = async () => {
    try {
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
      refetchFiles();
      refetchQuickFiles();
    } catch (e) {
      console.log("Error making file public", e);
    } finally {
      setUpdating(false);
    }
  };

  const removeLink = async () => {
    try {
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
      refetchFiles();
      refetchQuickFiles();
      setShareLink("");
    } catch (e) {
      console.log("Error removing link", e);
    } finally {
      setUpdating(false);
    }
  };

  const copyLink = () => {
    if (shareType === "private") return;
    navigator.clipboard.writeText(shareLink);
    toast.success("Link Copied");
  };

  const closeShareModal = () => {
    setAnimate(false);
    setTimeout(() => dispatch(resetShareModal()), 200);
  };

  const outterWrapperClick = (e: any) => {
    if (e.target.id !== "outer-wrapper") return;
    closeShareModal();
  };

  const permissionText = (() => {
    if (shareType === "one") {
      return `This file will be available for download one time, 
      after it is downloaded once the file will then automatically be marked as private.`;
    } else if (shareType === "public") {
      return "Anyone with the link can view and download this file";
    } else {
      return "Only you can view and download this file";
    }
  })();

  const linkPreviewText = (() => {
    if (shareType === "private") {
      return "Document is private";
    } else {
      return shareLink;
    }
  })();

  useEffect(() => {
    if (!file.metadata.link) return;
    const url = `${window.location.origin}/public-download/${file._id}/${file.metadata.link}`;
    setShareLink(url);
    setShareType(file.metadata.linkType ? file.metadata.linkType : "private");
  }, [file._id, file.metadata.link, file.metadata.linkType]);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleSelectChange = async (value: string) => {
    if (value === "private") {
      await removeLink();
    } else if (value === "one") {
      await makeOneTimePublic();
    } else if (value === "public") {
      await makePublic();
    }
  };

  const selectOnChange = (e: any) => {
    const value = e.target.value;
    setShareType(value);
    handleSelectChange(value);
  };

  return (
    <div
      className="w-screen dynamic-height bg-black bg-opacity-80 absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center flex-col"
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
      <div
        className="w-[90%] sm:w-[500px] p-6 bg-white rounded-md animate-easy"
        style={{ marginTop: !animate ? "calc(100vh + 340px" : 0 }}
      >
        <p>Share file</p>
        <div className="bg-light-primary p-6 rounded-md mt-4 flex items-center space-x-2">
          <input
            className="rounded-md w-full text-xs h-10 p-2"
            value={linkPreviewText}
          />
          <button
            className="bg-primary text-white hover:bg-primary-hover text-xs w-20 p-1 py-3 rounded-md"
            onClick={copyLink}
          >
            Copy link
          </button>
        </div>
        <p className="mt-6">Permission</p>
        <div className="flex mt-6 items-center">
          {shareType === "private" && <LockIcon className="w-5 h-5 mr-2" />}
          {shareType === "one" && <OneIcon className="w-5 h-5 mr-2" />}
          {shareType === "public" && <PublicIcon className="w-5 h-5 mr-2" />}
          <select
            className="text-sm"
            value={shareType}
            onChange={selectOnChange}
            disabled={updating}
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="one">Temporary</option>
          </select>
          {updating && (
            <div className="border-t border-primary rounded-full animate-spin h-4 w-4 ml-2"></div>
          )}
        </div>
        <p className="text-xs mt-1.5 text-gray-500">{permissionText}</p>
      </div>
    </div>
  );
});

export default SharePopup;
