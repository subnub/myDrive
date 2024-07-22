import { connect } from "react-redux";
import React, { useEffect, useRef } from "react";
import { useFilesClient, useQuickFilesClient } from "../../hooks/files";
import { getCancelToken } from "../../utils/cancelTokenManager";
import CloseIcon from "../../icons/CloseIcon";
import CheckCircleIcon from "../../icons/CheckCircleIcon";
import AlertIcon from "../../icons/AlertIcon";

const UploadItem = (props) => {
  const filesRefreshed = useRef(false);
  const { invalidateFilesCache } = useFilesClient();
  const { invalidateQuickFilesCache } = useQuickFilesClient();
  const { completed, canceled, progress, name, id } = props;
  const cancelToken = getCancelToken(id);

  useEffect(() => {
    if (completed && !filesRefreshed.current) {
      invalidateFilesCache();
      invalidateQuickFilesCache();
      filesRefreshed.current = true;
    }
  }, [completed]);

  const cancelUpload = () => {
    cancelToken.cancel();
  };

  const ProgressIcon = () => {
    if (completed) {
      return <CheckCircleIcon className="w-[20px] h-[20px] text-green-600" />;
    } else if (canceled) {
      return <AlertIcon className="w-[20px] h-[20px] text-red-600" />;
    } else {
      return (
        <CloseIcon
          className="w-[20px] h-[20px] cursor-pointer"
          onClick={cancelUpload}
        />
      );
    }
  };

  return (
    <div className="relative p-[20px] flex justify-between items-start hover:bg-[#f6f5fd]">
      <div className="w-full">
        <div className="flex justify-between items-center mb-[15px]">
          <div className="mr-[30px]">
            <p className="text-[15px] leading-[18px] font-medium max-w-[160px] overflow-hidden whitespace-nowrap text-ellipsis">
              {name}
            </p>
          </div>
          <div>
            <ProgressIcon />
          </div>
        </div>
        <div>
          <div className="w-full bg-[#e0dcf3] rounded-[1.5px] h-[3px] relative">
            <div
              className="h-[3px] bg-[#3c85ee] rounded-[1.5px]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect()(UploadItem);
