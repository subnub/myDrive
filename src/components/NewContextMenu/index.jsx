import React from "react";
import {connect} from "react-redux";
import { setShareSelected } from "../../actions/selectedItem";
import NewContextMenu from "./NewContextMenu";

class NewContextMenuContainer extends React.Component {

    constructor(props) {
        super(props);

        this.wrapperRef = React.createRef();
    }

    componentDidMount = () => {

        document.addEventListener("mousedown", this.handleClickOutside)
    }

    componentWillUnmount = () => {

        document.removeEventListener("mousedown", this.handleClickOutside)
    }

    componentDidUpdate = () => {
    }

    handleClickOutside = () => {
        if (this.props.contextSelected && this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
            this.props.closeContext();
        } 
    }

    startFileDownload = () => {
        console.log("start download file", this.props.file._id);
        this.props.downloadFile(this.props.file._id, this.props.file)
    }

    startRenameFile = async(e) => {
        console.log("rename file click")
        this.props.changeEditNameMode();
    }

    startDeleteFile = async() => {
        this.props.changeDeleteMode()
    }

    startShareFile = () => {
        this.props.dispatch(setShareSelected({...this.props.file}))
    }


    stopPropagation = (e) => {
        e.stopPropagation()
        if (this.props.quickItemMode || this.props.gridMode) this.props.closeContext();
    }

    render() {
       
        return <NewContextMenu 
                    wrapperRef={this.wrapperRef}
                    stopPropagation={this.stopPropagation}
                    startRenameFile={this.startRenameFile}
                    startShareFile={this.startShareFile}
                    startFileDownload={this.startFileDownload}
                    startDeleteFile={this.startDeleteFile}
                    state={this.state}
                    {...this.props}
                    />
    }

}

export default connect()(NewContextMenuContainer);