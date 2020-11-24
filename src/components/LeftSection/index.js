import LeftSection from "./LeftSection";
import {showAddOptions} from "../../actions/addOptions";
import {startAddFile} from "../../actions/files";
import {startAddFolder} from "../../actions/folders"
import Swal from "sweetalert2";
import {connect} from "react-redux";
import React from "react";
import { openUploadOverlay, setLeftSectionMode } from "../../actions/main";

class LeftSectionContainer extends React.Component {

    constructor(props) {
        super(props);

        this.wrapperRef = React.createRef();
        this.uploadInput = React.createRef();

        this.leftSectionRef = React.createRef()

        this.state = {
            open: false,
            hideFolderTree: false,
        }
    }

    createFolder = async(e) => {

        let inputValue = ""

        const { value: folderName} = await Swal.fire({
            title: 'Enter Folder Name',
            input: 'text',
            inputValue: inputValue,
            showCancelButton: true,
            inputValidator: (value) => {
              if (!value) {
                return 'Please Enter a Name'
              }
            }
          })

        if (folderName === undefined || folderName === null) {

            return;
        }

        const parent = this.props.parent;
        const owner = this.props.auth.id;
        const parentList = this.props.parentList;
        const isGoogle = this.props.isGoogle;

        this.props.dispatch(startAddFolder(folderName, owner, parent, parentList, isGoogle));
        this.showDropDown();
    }

    handleClickOutside = (e) => {

        if (this.leftSectionRef && !this.leftSectionRef.current.contains(event.target)) {
          
            if (this.props.leftSectionMode === 'open') {
                this.props.dispatch(setLeftSectionMode('close'))
            }
        }
    }

    componentDidMount = () => {
        document.addEventListener('mousedown', this.handleClickOutside);

        const hideFolderTree = localStorage.getItem("hide-folder-tree");

        if (hideFolderTree) {

            this.setState(() => ({
                hideFolderTree
            }))
        }
    }

    componentWillUnmount = () => {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    addButtonEvent = () => {
        
        const currentAddOptions = !this.props.showAddOptions
        this.props.dispatch(showAddOptions(currentAddOptions))
    }

    handleUpload = (e) => {
        e.preventDefault();

        this.props.dispatch(startAddFile(this.uploadInput.current, this.props.parent, this.props.parentList, this.props.storageSwitcher))
        this.uploadInput.current.value = ""
    }

    showDropDown = () => {

        this.setState(() => {
            return {
                ...this.state,
                open: !this.state.open
            }
        })
    }

    showUploadOverlay = () => {

        this.showDropDown();
        this.props.dispatch(openUploadOverlay());
    }

    render() {

        return <LeftSection 
                    addButtonEvent={this.addButtonEvent}
                    wrapperRef={this.wrapperRef}
                    uploadInput={this.uploadInput}
                    createFolder={this.createFolder}
                    handleUpload={this.handleUpload}
                    showDropDown={this.showDropDown}
                    showUploadOverlay={this.showUploadOverlay}
                    leftSectionRef={this.leftSectionRef}
                    state={this.state}
                    {...this.props}/>
    }
}

const connectPropToState = (state) => ({
    auth: state.auth,
    parent: state.parent.parent,
    parentList: state.parent.parentList,
    storage: state.storage,
    showAddOptions: state.addOptions.showAddOptions,
    isGoogle: state.filter.isGoogle,
    storageSwitcher: state.storageSwitcher.selected,
    leftSectionMode: state.main.leftSectionMode
})

export default connect(connectPropToState)(LeftSectionContainer);