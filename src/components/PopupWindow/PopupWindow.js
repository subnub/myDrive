import Spinner from ".././Spinner";
import capitalize from "../../utils/capitalize";
import React from "react";

class PopupWindow extends React.Component {

    constructor(props) {
        super(props);
        
    }

    render() {

        
        return (
            <div className="popup-window" ref={this.props.wrapperRef}>
            
                <h3 className="popup-window__title">{capitalize(this.props.popupFile.filename)}</h3>
        
                {!this.props.popupFile.metadata.isVideo ? 
                
                    <div className="popup-window__image__wrapper">
                    
                        {!this.props.popupFile.metadata.hasThumbnail ? <h3 className="popup-window__subtitle">No Preview Available</h3> : undefined}
            
                        {!this.props.popupFile.metadata.hasThumbnail ? <img className={this.props.state.imageClassname} src={this.props.state.image}/> 
                        : <img className={this.props.state.imageClassname} onClick={this.props.setPhotoViewerWindow} src={this.props.state.image}/>}

                        <div className={this.props.state.spinnerClassname}>
                            {!this.props.popupFile.metadata.hasThumbnail ? undefined : <Spinner />}
                        </div>
                    </div>
                : 
                    <video className="popup-window__video" 
                            src={this.props.state.video}
                            ref={this.props.video} 
                            type="video/mp4"
                            controls>
                        Your browser does not support the video tag.
                    </video>
                } 

                <button className="button popup-window__button" onClick={() => this.props.downloadFile(this.props.popupFile._id)}>Download</button>
                <img className="popup-window__close-button" onClick={this.props.hidePopupWindow} src="/images/close_icon.png"/>
            </div>
        )
    }

}


export default PopupWindow

