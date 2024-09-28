import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../axiosInterceptor";
import {
  downloadPublicFileAPI,
  getPublicFileInfoAPI,
} from "../../api/filesAPI";
import { toast, ToastContainer } from "react-toastify";
import Spinner from "../Spinner/Spinner";
import moment from "moment";
import { getFileColor, getFileExtension } from "../../utils/files";
import { FileInterface } from "../../types/file";
import bytes from "bytes";

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
  }, [params.id, params.tempToken, getPublicFileInfoAPI]);

  const downloadItem = useCallback(() => {
    const id = params.id!;
    const tempToken = params.tempToken!;
    downloadPublicFileAPI(id, tempToken);
  }, [params.id, params.tempToken, downloadPublicFileAPI]);

  useEffect(() => {
    getFile();
  }, [getFile]);

  if (!file) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <Spinner />
        <ToastContainer position="bottom-left" />
      </div>
    );
  }

  const fileExtension = getFileExtension(file.filename, 3);

  const imageColor = getFileColor(file.filename);

  const formattedDate = moment(file.uploadDate).format("L");

  const fileSize = bytes(file.metadata.size);

  return (
    <div>
      <div className="flex justify-center items-center w-screen h-screen bg-black bg-opacity-90">
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
        </div>
        <div className="w-[300px] p-4 bg-white rounded-md border shadow-lg">
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
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-left" />
    </div>
  );
};

export default PublicDownloadPage;
