import React from "react";

const UploadOverlay = (props) => (
  <div
    onClick={props.closeOverlay}
    className="upload__overlay"
    draggable="true"
    onDrop={props.onDragDropEvent}
    onDragOver={props.onDragOverEvent}
    onDragLeave={props.onDragLeaveEvent}
    onDragEnter={props.onDragEnterEvent}
    style={props.uploadOverlayOpen ? { display: "block" } : { display: "none" }}
  >
    <div className="inner__upload">
      <div className="upload__image">
        <img src="/assets/upload.svg" alt="upload" />
      </div>
      <p>Drop your files anywhere to start uploading</p>
    </div>
  </div>
);

export default UploadOverlay;
