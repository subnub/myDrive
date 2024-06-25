import { connect } from "react-redux";
import React, { useEffect, useRef } from "react";
import bytes from "bytes";
import { useFilesClient, useQuickFilesClient } from "../../hooks/files";
import { getCancelToken } from "../../utils/cancelTokenManager";

const UploadItem = (props) => {
  const filesRefreshed = useRef(false);
  const { invalidateFilesCache } = useFilesClient();
  const { invalidateQuickFilesCache } = useQuickFilesClient();
  const completed = props.completed;
  const uploadImage = props.getUploadImage();
  const canceled = props.canceled;

  // TODO: Add ability to cancel indivdual uploads
  useEffect(() => {
    if (completed && !filesRefreshed.current) {
      invalidateFilesCache();
      invalidateQuickFilesCache();
    }
  }, [completed]);

  if (!completed && !canceled) {
    return (
      <div className="elem__upload uploading__now">
        <div className="upload__elem--status">
          <span>
            <img src="/assets/upload_now.svg" alt="upload" />
          </span>
        </div>
        <div className="upload__info">
          <div className="top__upload">
            <div className="upload__text">
              <p>{props.name}</p>
            </div>
            <div className="upload__size">
              <div className="stop__download">
                <span>
                  <img
                    onClick={props.cancelUploadEvent}
                    src="/assets/cancel.svg"
                    alt="cancel"
                  />
                </span>
              </div>
              <span>{bytes(props.size)}</span>
            </div>
          </div>
          <div className="bottom__upload">
            <div className="progress__upload">
              <div
                className="active__progress"
                style={{ width: `${props.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (completed) {
    return (
      <div className="elem__upload uploaded__already">
        <div className="upload__elem--status">
          <span>
            <img src="/assets/uploaded__success.svg" alt="upload" />
          </span>
        </div>
        <div className="upload__info">
          <div className="top__upload">
            <div className="upload__text">
              <p>{props.name}</p>
            </div>
            <div className="upload__size">
              <span>{bytes(props.size)}</span>
            </div>
          </div>
          <div className="bottom__upload">
            <div className="progress__upload">
              <div
                className="active__progress"
                style={{ width: `${props.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="elem__upload uploaded__cancelled">
        <div className="upload__elem--status">
          <span>
            <img src="/assets/uploaded__failed.svg" alt="upload" />
          </span>
        </div>
        <div className="upload__info">
          <div className="top__upload">
            <div className="upload__text">
              <p>{props.name}</p>
            </div>
            <div className="retry__download">
              <a href="#">Retry</a>
            </div>
          </div>
          <div className="bottom__upload">
            <div className="failed__info">
              <span>Upload failed</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default connect()(UploadItem);
