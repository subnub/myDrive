import React from "react";

const UploadOverlay = (props) => (
    <div onClick={props.closeOverlay} class="upload__overlay" draggable="true" onDrop={props.onDragDropEvent} onDragOver={props.onDragOverEvent} onDragLeave={props.onDragLeaveEvent} onDragEnter={props.onDragEnterEvent} style={props.uploadOverlayOpen ? {display:"block"} : {display:"none"}}>
        <div class="inner__upload">
            <div class="upload__image">
                <img src="/assets/upload.svg" alt="upload"/>
            </div>
            <p>Drop your files anywhere to start uploading</p>
        </div>
    </div>
)

export default UploadOverlay;