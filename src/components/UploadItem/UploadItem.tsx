import { connect } from "react-redux";
import React, { memo } from "react";
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

  const ProgressBar = memo(() => {
    if (completed) {
      return <div className="custom-progress-success"></div>;
    } else if (canceled) {
      return <div className="custom-progress-failed"></div>;
    } else if (type === "file") {
      return (
        <progress className="custom-progress" value={progress} max="100" />
      );
    } else {
      return <progress className="custom-progress indeterminate" />;
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
          <ProgressBar />
        </div>
      </div>
    </div>
  );
};

export default connect()(UploadItem);
