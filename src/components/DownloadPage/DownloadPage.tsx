import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  downloadPublicFileAPI,
  getPublicFileInfoAPI,
} from "../../api/filesAPI";
import { toast, ToastContainer } from "react-toastify";
import Spinner from "../Spinner/Spinner";
import dayjs from "dayjs";
import { getFileColor, getFileExtension } from "../../utils/files";
import { FileInterface } from "../../types/file";
import bytes from "bytes";
import LockIcon from "../../icons/LockIcon";
import OneIcon from "../../icons/OneIcon";
import StorageIcon from "../../icons/StorageIcon";
import CalendarIcon from "../../icons/CalendarIcon";
import DownloadIcon from "../../icons/DownloadIcon";
import PublicIcon from "../../icons/PublicIcon";

const PublicDownloadPage = () => {
  const [file, setFile] = useState<FileInterface | null>(null);
  const params = useParams();

  const getFile = useCallback(async () => {
    try {
      const id = params.id!;
      const tempToken = params.tempToken!;
      const fileResponse = await getPublicFileInfoAPI(id, tempToken);
      setFile(fileResponse);
    } catch (e) {
      console.log("Error getting publicfile info", e);
      toast.error("Error getting public file");
    }
  }, [params.id, params.tempToken]);

  const downloadItem = () => {
    const id = params.id!;
    const tempToken = params.tempToken!;
    downloadPublicFileAPI(id, tempToken);
  };

  const permissionText = (() => {
    if (!file) return "";
    if (file.metadata.linkType === "one") {
      return `Temporary`;
    } else if (file.metadata.linkType === "public") {
      return "Public";
    } else {
      return "Private";
    }
  })();

  const copyName = () => {
    navigator.clipboard.writeText(file!.filename);
    toast.success("Filename Copied");
  };

  useEffect(() => {
    getFile();
  }, [getFile]);

  if (!file) {
    return (
      <div className="w-screen dynamic-height flex justify-center items-center">
        <Spinner />
        <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
      </div>
    );
  }

  const fileExtension = getFileExtension(file.filename, 3);

  const imageColor = getFileColor(file.filename);

  const formattedDate = dayjs(file.uploadDate).format("MM/DD/YYYY hh:mma");

  const fileSize = bytes(file.metadata.size);

  return (
    <div>
      <div className="flex justify-center items-center w-screen dynamic-height bg-black bg-opacity-90">
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
        </div>
        <div className="w-[90%] sm:w-[500px] p-6 bg-white rounded-md animate-easy">
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
      <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
    </div>
  );
};

export default PublicDownloadPage;
