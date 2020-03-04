import Subbar from "./Subbar";
import {showSideBar, hideSideBar}  from "../../actions/main";
import {showAddOptions2} from "../../actions/addOptions";
import {startAddFile} from "../../actions/files";
import {startAddFolder} from "../../actions/folders"
import {enableListView, disableListView} from "../../actions/filter";
import {resetSelected} from "../../actions/selectedItem";
import Swal from "sweetalert2";
import {connect} from "react-redux";
import {history} from "../../routers/AppRouter";
import React from "react";
import mobileCheck from "../../utils/mobileCheck";

class SubbarContainer extends React.Component {

    constructor(props) {
        super(props);

        this.uploadInput = React.createRef();
        this.wrapperRef = React.createRef();
        this.isMobile = mobileCheck();
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

        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target) && this.props.showAddOptions2) {
            this.addButtonEvent();
        }
    }
    
    componentDidMount = () => {

        if (this.isMobile) {
            document.addEventListener('mousedown', this.handleClickOutside);
        }   
    }

    componentWillUnmount = () => {

        if (this.isMobile) {
            document.removeEventListener('mousedown', this.handleClickOutside);
        }
    }

    addButtonEvent = () => {
        
        const currentAddOptions = !this.props.showAddOptions2
    
        this.props.dispatch(showAddOptions2(currentAddOptions))
    }

    handleUpload = (e) => {
        e.preventDefault();
    
        this.props.dispatch(startAddFile(this.uploadInput.current, this.props.parent, this.props.parentList))
        this.uploadInput.current.value = ""
    }

    showSideBarEvent = () => {

        let show = this.props.showSideBar;

        if (show === "gone") {
            show = false;
        }

        if (show) {
            this.props.dispatch(hideSideBar())
        } else {
            this.props.dispatch(showSideBar())
        }
    }

    showListViewEvent = () => {

        let listView = this.props.listView;

        if (listView) {
            this.props.dispatch(resetSelected())
            this.props.dispatch(disableListView())
        } else {
            this.props.dispatch(resetSelected())
            this.props.dispatch(enableListView())
        }
    }

    itemClick = (id) => {

        if (id === "/") {

            history.push("/home")

        } else {

            history.push(`/folder/${id}`)
        }
        
    }

    render() {

        return <Subbar 
                uploadInput={this.uploadInput}
                wrapperRef={this.wrapperRef}
                createFolder={this.createFolder}
                addButtonEvent={this.addButtonEvent}
                handleUpload={this.handleUpload}
                showSideBarEvent={this.showSideBarEvent}
                showListViewEvent={this.showListViewEvent}
                itemClick={this.itemClick}
                isMobile={this.isMobile}
                {...this.props}/>
    }

}

const connectPropToState = (state) => ({
    auth: state.auth,
    listView: state.filter.listView,
    parentList: state.parent.parentList,
    parentNameList: state.parent.parentNameList,
    parent: state.parent.parent,
    sortBy: state.filter.sortBy,
    showAddOptions2: state.addOptions.showAddOptions2,
    showSideBar: state.main.showSideBar,
    currentlySearching: state.filter.currentlySearching
})

export default connect(connectPropToState)(SubbarContainer)