import LeftSection from "./LeftSection";
import {showAddOptions} from "../../actions/addOptions";
import {startAddFile} from "../../actions/files";
import {startAddFolder} from "../../actions/folders"
import Swal from "sweetalert2";
import {connect} from "react-redux";
import React from "react";

class LeftSectionContainer extends React.Component {

    constructor(props) {
        super(props);

        this.wrapperRef = React.createRef();
        this.uploadInput = React.createRef();
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

        this.props.dispatch(startAddFolder(folderName, owner, parent, parentList));
    }

    handleClickOutside = (e) => {

        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target) && this.props.showAddOptions) {
            this.addButtonEvent();
        }
    }

    componentDidMount = () => {
        document.addEventListener('mousedown', this.handleClickOutside);
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

        this.props.dispatch(startAddFile(this.uploadInput.current, this.props.parent, this.props.parentList))
        this.uploadInput.current.value = ""
    }

    render() {

        return <LeftSection 
                    addButtonEvent={this.addButtonEvent}
                    wrapperRef={this.wrapperRef}
                    uploadInput={this.uploadInput}
                    createFolder={this.createFolder}
                    handleUpload={this.handleUpload}
                    state={this.state}
                    {...this.props}/>
    }
}

const connectPropToState = (state) => ({
    auth: state.auth,
    parent: state.parent.parent,
    parentList: state.parent.parentList,
    storage: state.storage,
    showAddOptions: state.addOptions.showAddOptions
})

export default connect(connectPropToState)(LeftSectionContainer);