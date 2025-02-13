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
      <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
    </div>
  );
};

export default PublicDownloadPage;
