import React from "react";
import Spinner from "../Spinner";

const PhotoViewer = (props) => (
    <div className="photoviewer">

    <img className="photoviewer__close-button" onClick={props.closePhotoViewer} src="/images/close-white-png.png"/>

    {props.state.image === "" ? 
    <div className="photoviewer__loader">
        <Spinner />
    </div>
    : 
    <img className="photoviewer__image" src={props.state.image}/>
    }
    

    </div>
)

export default PhotoViewer;