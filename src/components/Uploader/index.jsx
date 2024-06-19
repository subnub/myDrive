import Uploader from "./Uploader";
import {showUploader, hideUploader} from "../../actions/main";
import {startCancelAllUploads} from "../../actions/uploads";
import {connect} from "react-redux";
import React from "react";

class UploaderContainer extends React.Component {
    
    constructor(props) {
        super(props);

        this.uploaderWrapper = React.createRef()
        this.prevUploadLength = 0;
    }

    minimizeUploader = () => {
    
        const uploaderShow = this.props.uploaderShow;
        const dispatch = this.props.dispatch;
    
        if (uploaderShow) {
    
            dispatch(hideUploader())
    
        } else {
    
            dispatch(showUploader())
        }
    }
    
    cancelAllUploadsEvent = () => {
    
        this.props.dispatch(startCancelAllUploads(this.props.uploads))
    }

    componentDidUpdate = () => {

        if (this.props.uploads.length !== this.prevUploadLength) {
            if (this.uploaderWrapper.current) this.uploaderWrapper.current.scrollTop = 0;
        }

        this.prevUploadLength = this.props.uploads.length;
    }

    render() {
        return <Uploader 
                minimizeUploader={this.minimizeUploader}
                cancelAllUploadsEvent={this.cancelAllUploadsEvent}
                ref={this.uploaderWrapper}
                {...this.props}/>
    }

}

const connectStateToProp = (state) => ({
    uploads: state.uploads,
    uploaderShow: state.main.uploaderShow
})

export default connect(connectStateToProp)(UploaderContainer);