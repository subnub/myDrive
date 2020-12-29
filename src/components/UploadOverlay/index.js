import React from "react";
import {connect} from "react-redux"
import { startAddFile } from "../../actions/files";
import { closeUploadOverlay } from "../../actions/main";
import UploadOverlay from "./UploadOverlay";

class UploadOverlayContainer extends React.Component {

    constructor(props) {
        super(props)
    }

    onDragDropEvent = (e) => {

        e.preventDefault()

        const fileInput = e.dataTransfer;

        this.props.dispatch(startAddFile(fileInput, this.props.parent, this.props.parentList, this.props.storageSwitcher))
        this.closeOverlay()
    }

    onDragEnterEvent = (e) => {
        e.preventDefault()
    }

    onDragLeaveEvent = (e) => {
        e.preventDefault()
    }

    onDragOverEvent = (e) => {
        e.preventDefault()
    }

    closeOverlay = () => {

        this.props.dispatch(closeUploadOverlay());
    }

    render() {
        return (

            <UploadOverlay 
                closeOverlay={this.closeOverlay}
                onDragDropEvent={this.onDragDropEvent}
                onDragOverEvent={this.onDragOverEvent}
                onDragLeaveEvent={this.onDragLeaveEvent}
                onDragEnterEvent={this.onDragEnterEvent}
                {...this.props}/>
        )
    }
}

const connectStoreToProp = (state) => ({
    uploadOverlayOpen: state.main.uploadOverlayOpen,
    parent: state.parent.parent,
    parentList: state.parent.parentList,
    storageSwitcher: state.storageSwitcher.selected
})

export default connect(connectStoreToProp)(UploadOverlayContainer);