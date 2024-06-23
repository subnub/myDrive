import UploadItem from "../UploadItem";
import React from "react";

const Uploader = React.forwardRef((props, ref) => (
  <div
    className="upload__status"
    style={
      props.uploads.length !== 0 ? { display: "block" } : { display: "none" }
    }
  >
    <div className="head__upload">
      <p>
        Uploading {props.uploads.length}{" "}
        {props.uploads.length === 1 ? "file" : "files"}
      </p>
      <div className="hide__upload">
        <a onClick={() => props.minimizeUploader()}>
          <img src="/assets/upload_hide.svg" alt="upload__hide" />
        </a>
        <a onClick={() => props.cancelAllUploadsEvent()}>
          <img
            src="/assets/close-white.svg"
            style={{ height: "24px" }}
            alt="upload__hide"
          />
        </a>
      </div>
    </div>
    <div className="content__upload">
      {props.uploaderShow
        ? props.uploads.map((upload) => {
            return <UploadItem key={upload.id} {...upload} />;
          })
        : undefined}
    </div>
  </div>
));

export default Uploader;
