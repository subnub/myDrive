import { connect } from "react-redux";
import React, { memo, useEffect, useRef } from "react";
import { useFilesClient, useQuickFilesClient } from "../../hooks/files";
import { getCancelToken } from "../../utils/cancelTokenManager";
import CloseIcon from "../../icons/CloseIcon";
import CheckCircleIcon from "../../icons/CheckCircleIcon";
import AlertIcon from "../../icons/AlertIcon";
import { UploadItemType } from "../../reducers/uploader";

const UploadItem: React.FC<UploadItemType> = (props) => {
  const { completed, canceled, progress, name, id, type } = props;
  const cancelToken = getCancelToken(id);

  const cancelUpload = () => {
    cancelToken.cancel();
  };

  const ProgressIcon = memo(() => {
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
  });

  return (
    <div className="relative p-[20px] flex justify-between items-start hover:bg-[#f6f5fd]">
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
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
          {(type === "file" || completed) && (
            <progress className="custom-progress" value={progress} max="100" />
          )}
          {type === "folder" && !completed && (
            <progress className="custom-progress indeterminate" />
          )}
        </div>
      </div>
    </div>
  );
};

export default connect()(UploadItem);
