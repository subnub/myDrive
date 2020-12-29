import { connect } from "react-redux";
import React from "react";
import bytes from "bytes";

const UploadItem = (props) => {
  const completed = props.completed;
  const uploadImage = props.getUploadImage();
  const canceled = props.canceled;

  if (!completed && !canceled) {
    return (
      <div class="elem__upload uploading__now">
        <div class="upload__elem--status">
          <span>
            <img src="/assets/upload_now.svg" alt="upload" />
          </span>
        </div>
        <div class="upload__info">
          <div class="top__upload">
            <div class="upload__text">
              <p>{props.name}</p>
            </div>
            <div class="upload__size">
              <div class="stop__download">
                <span>
                  <img onClick={props.cancelUploadEvent} src="/assets/cancel.svg" alt="cancel" />
                </span>
              </div>
                <span>{bytes(props.size)}</span>
            </div>
          </div>
          <div class="bottom__upload">
            <div class="progress__upload">
              <div class="active__progress" style={{width:`${props.progress}%`}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (completed) {
    return (
      <div class="elem__upload uploaded__already">
        <div class="upload__elem--status">
          <span>
            <img src="/assets/uploaded__success.svg" alt="upload" />
          </span>
        </div>
        <div class="upload__info">
          <div class="top__upload">
            <div class="upload__text">
              <p>{props.name}</p>
            </div>
            <div class="upload__size">
            <span>{bytes(props.size)}</span>
            </div>
          </div>
          <div class="bottom__upload">
            <div class="progress__upload">
              <div class="active__progress" style={{width:`${props.progress}%`}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div class="elem__upload uploaded__cancelled">
        <div class="upload__elem--status">
          <span>
            <img src="/assets/uploaded__failed.svg" alt="upload" />
          </span>
        </div>
        <div class="upload__info">
          <div class="top__upload">
            <div class="upload__text">
              <p>{props.name}</p>
            </div>
            <div class="retry__download">
              <a href="#">Retry</a>
            </div>
          </div>
          <div class="bottom__upload">
            <div class="failed__info">
              <span>Upload failed</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default connect()(UploadItem);
