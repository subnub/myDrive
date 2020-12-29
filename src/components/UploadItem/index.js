import UploadItem from "./UploadItem"
import {cancelUpload} from "../../actions/uploads";
import {connect} from "react-redux";
import React from "react";

class UploadItemContainer extends React.Component {

    constructor(props) {
        super(props);

        const completed = this.props.completed;
        const canceled = this.props.canceled;

        this.uploadFinished = false;

        this.state = {
            progressBarStyle: {visibility: (completed || canceled) ? "hidden" : "visible"},
            stopUploadButtonStyle: (completed || canceled) ? {visibility:"visible", opacity: 1} : {visibility: "hidden", opacity: 0}
        }
    }
    
    hideProgress = () => {

        this.setState(() => ({
            ...this.state,
            progressBarStyle: {visibility: "hidden"},
            stopUploadButtonStyle: {opacity: 1, visibility: "visible"}

        }))
    }

    showProgress = () => {

        this.setState(() => ({
            ...this.state,
            progressBarStyle: {visibility: "visible"},
            stopUploadButtonStyle: {opacity: 0, visibility: "hidden"}

        }))
    }

    cancelUploadEvent = () => {

        if (!this.props.completed) {
            this.props.source.cancel("User Canceled Upload")
            this.props.dispatch(cancelUpload(this.props.id))
        }
        
    }

    getUploadImage = () => {

        if (this.props.canceled) {
            return "/images/error-red.png"
        } else if (this.props.completed) {
            return "/images/check-green.png"
        } else {
            return "/images/close-circle-outline.svg"
        }
    }

    componentDidUpdate = () => {

        if (this.props.completed && !this.uploadFinished) {

            this.uploadFinished = true; 

            this.setState(() => ({
            ...this.state,
            progressBarStyle: {visibility: "hidden"},
            stopUploadButtonStyle: {opacity: 1, visibility: "visible"}

            }))
        }

        if (this.props.canceled && !this.uploadFinished) {

            this.uploadFinished = true;
            const completed = this.props.completed;
            const canceled = this.props.canceled;

            this.setState(() => {
                return {progressBarStyle: {visibility: (completed || canceled) ? "hidden" : "visible"},
                stopUploadButtonStyle: (completed || canceled) ? {visibility:"visible", opacity: 1} : {visibility: "hidden", opacity: 0}}
            })
        }
    }

    render() {

        return <UploadItem 
                hideProgress={this.hideProgress}
                showProgress={this.showProgress}
                cancelUploadEvent={this.cancelUploadEvent}
                getUploadImage={this.getUploadImage}
                state={this.state}
                {...this.props}/>
    }
}

export default connect()(UploadItemContainer)