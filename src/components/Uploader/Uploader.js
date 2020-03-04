import UploadItem from ".././UploadItem";
import React from "react";

const Uploader = React.forwardRef((props, ref) => (
    <div className={props.uploads.length !== 0 ? "uploader__wrapper" : "uploader__wrapper--gone"}>
    
        <div className="uploader__header__wrapper">
        
            <h3 className="uploader__header__title">Uploads</h3>

            <div className="uploader__header__button_wrapper">
                <img className="uploader__header__button" onClick={() => props.minimizeUploader()} src={props.uploaderShow ? "/images/down-arrow-white.png" : "/images/up-arrow-white.png"}/>
                <img className="uploader__header__button" onClick={() => props.cancelAllUploadsEvent()} src="/images/close-white-png.png"/>
            </div>

        </div>

        <div className={props.uploaderShow ? "upload__item__block" : "upload__item__block upload__item__block--hide"} ref={ref}>
            {props.uploads.map((upload) => <UploadItem key={upload.id} {...upload}/>)}
        </div>
    </div>
))

export default Uploader;
