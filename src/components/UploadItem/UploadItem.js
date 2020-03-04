import { CircularProgressbar } from 'react-circular-progressbar';
import {connect} from "react-redux";
import React from "react";

const UploadItem = (props) => {

    const completed = props.completed;
        const uploadImage = props.getUploadImage();
        const canceled = props.canceled;

        return (
            <div className="upload__item__wrapper">
                <h3 className="upload__item__item">{props.name}</h3>




                <div className="upload__item__item__wrapper" 
                    onMouseOver={(!completed && !canceled) ? props.hideProgress : undefined} 
                    onMouseLeave={(!completed && !canceled)? props.showProgress : undefined} 
                    onClick={props.cancelUploadEvent}>

                    <div className={!completed ? "upload__item__item_wrapper" : "upload__item__item_wrapper upload__item__item_wrapper--hidden"} 
                    style={props.state.progressBarStyle} >

                    <CircularProgressbar className="upload__item__progress" value={props.progress} /> 

                    </div>
                                      
                </div>

                <img className="upload__item__image" 
                src={uploadImage}
                style={props.state.stopUploadButtonStyle}/>
                
            </div>
        )
}

export default connect()(UploadItem);
