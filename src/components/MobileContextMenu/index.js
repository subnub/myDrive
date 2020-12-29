import React from "react";
import {connect} from "react-redux";
import Swal from "sweetalert2";
import { startRenameFolder, startRemoveFolder } from "../../actions/folders";
import { startRenameFile, startRemoveFile } from "../../actions/files";
import { setShareSelected, setLastSelected } from "../../actions/selectedItem";
import { resetMobileContextMenu } from "../../actions/mobileContextMenu";
import axios from "../../axiosInterceptor";
import { setMoverID } from "../../actions/mover";

class MobileContextMenuContainer extends React.Component {

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

    handleClickOutside = () => {
        if (this.props.mobileContextMenu.open && this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
            this.props.dispatch(resetMobileContextMenu());
        } 
    }

    renameOnClick = async() => {

        let inputValue = this.props.mobileContextMenu.isFile ? this.props.mobileContextMenu.data.filename : this.props.mobileContextMenu.data.name;
    
        const { value: folderName} = await Swal.fire({
            title: 'Enter A File Name',
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

        this.props.mobileContextMenu.isFile ? 
        this.props.dispatch(startRenameFile(this.props.mobileContextMenu.data._id, folderName, this.props.mobileContextMenu.data.metadata.drive)) :
        this.props.dispatch(startRenameFolder(this.props.mobileContextMenu.data._id, folderName, this.props.mobileContextMenu.data.drive, this.props.mobileContextMenu.data.parent));
        this.props.dispatch(resetMobileContextMenu());
    }

    shareFileOnClick = () => {
    
        this.props.dispatch(setShareSelected({...this.props.mobileContextMenu.data}));
        this.props.dispatch(resetMobileContextMenu());
    }

    downloadFileOnClick = () => {

        this.props.dispatch(resetMobileContextMenu());

        const fileID = this.props.mobileContextMenu.data._id;
        const isGoogle = this.props.mobileContextMenu.data.metadata.drive;
        const isGoogleDoc = this.props.mobileContextMenu.data.metadata.googleDoc;
        const isPersonal = this.props.mobileContextMenu.data.metadata.personalFile;  

        this.props.dispatch(setLastSelected(0));

        axios.post("/user-service/get-token").then((response) => {

            const finalUrl = 
            isGoogle ? !isGoogleDoc ? `/file-service-google/download/${fileID}` : `/file-service-google-doc/download/${fileID}`  
            : !isPersonal ? `/file-service/download/${fileID}` : `/file-service-personal/download/${fileID}`

            const link = document.createElement('a');
            document.body.appendChild(link);
            link.href = finalUrl;
            link.setAttribute('type', 'hidden');
            link.setAttribute("download", true);
            link.click();

        }).catch((e) => {
            console.log("Download file get refresh token error", e);
        })

        // axios.get(currentURL +'/file-service/download/get-token')
        // .then((response) => {

        //     const tempToken = response.data.tempToken;

        //     const finalUrl = 
        //     isGoogle ? !isGoogleDoc ? currentURL + `/file-service-google/download/${fileID}/${tempToken}` : currentURL + `/file-service-google-doc/download/${fileID}/${tempToken}`  
        //     : !isPersonal ? currentURL + `/file-service/download/${fileID}/${tempToken}` : currentURL + `/file-service-personal/download/${fileID}/${tempToken}`

        //     const link = document.createElement('a');
        //     document.body.appendChild(link);
        //     link.href = finalUrl;
        //     link.setAttribute('type', 'hidden');
        //     link.setAttribute("download", true);
        //     link.click();

        // }).catch((err) => {
        //     console.log(err)
        // })
    }

    moveOnClick = () => {
        
        const id = this.props.mobileContextMenu.data._id;
        const parent = this.props.mobileContextMenu.isFile ? this.props.mobileContextMenu.data.metadata.parent : this.props.mobileContextMenu.data.parent;
        const isFile = this.props.mobileContextMenu.isFile;
        const drive = this.props.mobileContextMenu.isFile ? this.props.mobileContextMenu.data.metadata.drive : this.props.mobileContextMenu.data.drive;
        const personalItem = this.props.mobileContextMenu.isFile ? this.props.mobileContextMenu.data.metadata.personalFile : this.props.mobileContextMenu.data.personalFolder;

        this.props.dispatch(setMoverID(id, parent, isFile, drive, personalItem));
        this.props.dispatch(resetMobileContextMenu());
    }

    deleteOnClick = () => {
        Swal.fire({
            title: 'Confirm Deletion',
            text: "You cannot undo this action",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete'
          }).then((result) => {
            if (result.value) {
            
                const id = this.props.mobileContextMenu.data._id;
                const drive = this.props.mobileContextMenu.isFile ? this.props.mobileContextMenu.data.metadata.drive : this.props.mobileContextMenu.data.drive;
                const personalItem = this.props.mobileContextMenu.isFile ? this.props.mobileContextMenu.data.metadata.personalFile : this.props.mobileContextMenu.data.personalFolder;
                const parent = this.props.mobileContextMenu.isFile ? this.props.mobileContextMenu.data.metadata.parent : this.props.mobileContextMenu.data.parent;
                //this.props.dispatch(startRemoveFolder(this.props._id, [...this.props.parentList, this.props._id], this.props.drive, this.props.parent))

                this.props.mobileContextMenu.isFile ? 
                this.props.dispatch(startRemoveFile(id, drive, personalItem)) : 
                this.props.dispatch(startRemoveFolder(id, [...this.props.mobileContextMenu.data.parentList, id], drive, parent, personalItem));
                this.props.dispatch(resetMobileContextMenu());
            }
        })
    }

    render() {
        return (
            <div className="mobile__context-menu__wrapper" ref={this.wrapperRef} style={this.props.mobileContextMenu.open ? {} : {display: "none"}}>
                <div onClick={this.renameOnClick} className="mobile__context-menu__item">
                    <img className="mobile__context-menu__image" src="/assets/filesetting1.svg" alt="setting"/> <p className="mobile__context-menu__title">Rename</p>
                </div>
                {this.props.mobileContextMenu.isFile ? 
                <div onClick={this.shareFileOnClick} className="mobile__context-menu__item">
                    <img className="mobile__context-menu__image" src="/assets/filesetting2.svg" alt="setting"/> <p className="mobile__context-menu__title">Share</p>
                </div> : undefined}
                {this.props.mobileContextMenu.isFile ? 
                <div onClick={this.downloadFileOnClick} className="mobile__context-menu__item">
                    <img className="mobile__context-menu__image" src="/assets/filesetting3.svg" alt="setting"/> <p className="mobile__context-menu__title">Download</p>
                </div> : undefined}
                <div onClick={this.moveOnClick} className="mobile__context-menu__item">
                    <img className="mobile__context-menu__image" src="/assets/filesetting4.svg" alt="setting"/> <p className="mobile__context-menu__title">Move</p>
                </div>
                <div onClick={this.deleteOnClick} className="mobile__context-menu__item">
                    <img className="mobile__context-menu__image" src="/assets/filesetting5.svg" alt="setting"/> <p className="mobile__context-menu__title">Delete</p>
                </div>
            </div>
        )
    }
}

const connectPropToStore = (state) => ({
    mobileContextMenu: state.mobileContextMenu,
})

export default connect(connectPropToStore)(MobileContextMenuContainer);