import RightSection from "./RightSection";
import RightSectionDetail from ".././RightSectionDetail"
import {editFileMetadata, startRemoveFile, startRenameFile} from "../../actions/files"
import {resetSelectedItem} from "../../actions/selectedItem";
import env from "../../enviroment/envFrontEnd";
import axios from "../../axiosInterceptor";
import {connect} from "react-redux";
import React from "react";
import { setRightSectionMode } from "../../actions/main";
import Swal from "sweetalert2";
import { startRemoveFolder, startRenameFolder } from "../../actions/folders";
import { setMoverID } from "../../actions/mover";
import mobilecheck from "../../utils/mobileCheck";
import { setMobileContextMenu } from "../../actions/mobileContextMenu";

class RightSectionContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            optimizing: false,
            optimizing_finished: false,
            optimizing_removed: false,
            contextSelected: false
        }

        this.prevID = ""

        this.rightSectionRef = React.createRef()
    }

    getFileExtension = (filename) => {

        const filenameSplit = filename.split(".");

        if (filenameSplit.length > 1) {
            
            const extension = filenameSplit[filenameSplit.length - 1]

            return extension.toUpperCase();

        } else {

            return "Unknown"
        }

        
    }

    getSidebarClassName = (value) => {

        if (value==="gone") {
            return "section section--right section--no-animation"
        } else if (value) {
            return "section section--right"
        } else {
            return "section section--right section--minimized"
        }
    }

    removeTranscodeVideo = (props, e) => {

        const data = {id: props.selectedItem.id}

        axios.delete('/file-service/transcode-video/remove', {
            data
        }).then(() => {
            
            this.props.dispatch(editFileMetadata(props.selectedItem.id, {transcoded: undefined}))

            this.setState(() => ({
                ...this.state,
                optimizing: false, 
                optimizing_finished: false,
                optimizing_removed: true
            }))

        }).catch((err) => {
            console.log(err)
        })
    }

    transcodeVideo = (props, e) => {

        const config = {
            file: {_id: props.selectedItem.id}
        };    

        const data = {file: {_id: props.selectedItem.id}}

        this.setState(() => ({
            ...this.state,
            optimizing: true
        }))
    

        axios.post('/file-service/transcode-video', data,config)
        .then((response) => {
            
            const data = response.data;

            if (data === "Finished") {

                this.props.dispatch(editFileMetadata(props.selectedItem.id, {isVideo: true, transcoded: true}))

                this.setState(() => ({
                    ...this.state,
                    optimizing: false, 
                    optimizing_finished: true,
                    optimizing_removed: false
                }))
            }

        }).catch((err) => {
            console.log(err)
        })
    }

    getTranscodeButton = (props) => {

        if (!props.selectedItem.isVideo || !env.enableVideoTranscoding) {
            return undefined;
        }

        if (this.state.optimizing && !this.state.optimizing_finished) {
            return (<div>
                <button disabled className="button--small button--small--disabled">Optimizing</button>
                </div>)

        } else if ((props.selectedItem.transcoded || this.state.optimizing_finished) && !this.state.optimizing_removed) {
            return (<div>
                <button onClick={(e) => this.removeTranscodeVideo(props, e)} className="button--small">Unoptimize Video</button>
                </div>)
        } else {
            return (<div>
                <button onClick={(e) => this.transcodeVideo(props, e)} className="button--small">Optimize Video</button>
                </div>)
        }
    }

    getPublicStatus = () => {

        if (this.props.selectedItem.linkType === "one") {

            return <RightSectionDetail first={false} title="One Time Link" body="True"/> 

        } else {

            return <RightSectionDetail first={false} title="Public" body="True"/> 
        }
    }

    resetState = () => {

        if (this.prevID !== "" && this.prevID !== this.props.selectedItem.id) {

            this.setState(() => ({
                ...this.state,
                optimizing: false, 
                optimizing_finished: false
            }))
        }
    }

    resetSelected = () => {

        this.props.dispatch(resetSelectedItem());
    }

    handleClickOutside = (e) => {

        if (this.rightSectionRef && !this.rightSectionRef.current.contains(event.target)) {
            if (this.props.rightSectionMode === 'open') {
                this.props.dispatch(setRightSectionMode('close'))
                this.closeContext();
            }
        }
    }

    componentDidMount = () => {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount = () => {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    openItem = (e) => {
        
        if (this.props.selectedItem.file) {
            this.props.fileClick(this.props.selectedItem.id, this.props.selectedItem.data, false, true)
        } else {
            this.props.folderClick(this.props.selectedItem.id, this.props.selectedItem.data, true)
        }
    }

    closeContext = () => {
     
        this.setState(() => {
            return {
                ...this.state,
                contextSelected: false
            }
        })
    }

    selectContext = (e) => {

        if (e) e.stopPropagation()
        if (e) e.preventDefault();

        // if (mobilecheck()) {

        //     this.props.dispatch(setMobileContextMenu(this.props.selectedItem.file, this.props.selectedItem.data));
        //     return;
        // }

        console.log("right props", this.props.selectedItem)

        this.setState(() => {
            return {
                ...this.state,
                contextSelected: !this.state.contextSelected
            }
        })
    }

    clickStopPropagation = (e) => {
        if (e) e.stopPropagation()
    } 

    clickTest = (e) => {
        console.log("click test")
    }

    changeEditNameMode = async() => {

        let inputValue = this.props.selectedItem.name;
    
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

        //this.props.selectedItem.drive

        const parent = this.props.selectedItem.file ? this.props.selectedItem.data.metadata.parent : this.props.selectedItem.data.parent;

        this.props.selectedItem.file ? 
        this.props.dispatch(startRenameFile(this.props.selectedItem.id, folderName, this.props.selectedItem.drive)) :
        this.props.dispatch(startRenameFolder(this.props.selectedItem.id, folderName, this.props.selectedItem.drive, parent));

        //this.props.dispatch(startRenameFolder(this.props.selectedItem.data._id, folderName, this.props.selectedItem.data.));
    }

    startMoveFolder = async() => {

        const parent = this.props.selectedItem.file ? this.props.selectedItem.data.metadata.parent : this.props.selectedItem.data.parent;
        const isPersonal = this.props.selectedItem.file ? this.props.selectedItem.data.metadata.personalFile : this.props.selectedItem.data.personalFolder;

        this.props.dispatch(setMoverID(this.props.selectedItem.id, parent, this.props.selectedItem.file, this.props.selectedItem.drive, isPersonal));
    }

    changeDeleteMode = async() => {

        const parent = this.props.selectedItem.file ? this.props.selectedItem.data.metadata.parent : this.props.selectedItem.data.parent;


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

                this.props.selectedItem.file ? 
                this.props.dispatch(startRemoveFile(this.props.selectedItem.id, this.props.selectedItem.drive, this.props.selectedItem.data.metadata.personalFile)) :
                this.props.dispatch(startRemoveFolder(this.props.selectedItem.id, [...this.props.selectedItem.data.parentList, this.props.selectedItem.id], this.props.selectedItem.drive, parent, this.props.selectedItem.data.metadata.personalFolder));
                
            }
        })
    }

    render() {

        return <RightSection 
                getPublicStatus={this.getPublicStatus}
                getTranscodeButton={this.getTranscodeButton}
                getFileExtension={this.getFileExtension}
                getSidebarClassName={this.getSidebarClassName}
                resetState={this.resetState}
                resetSelected={this.resetSelected}
                openItem={this.openItem}
                rightSectionRef={this.rightSectionRef}
                clickStopPropagation={this.clickStopPropagation}
                closeContext={this.closeContext}
                selectContext={this.selectContext}
                changeEditNameMode={this.changeEditNameMode}
                startMoveFolder={this.startMoveFolder}
                changeDeleteMode={this.changeDeleteMode}
                clickTest={this.clickTest}
                state={this.state}
                {...this.props}
                 />
    }
}

const connectPropToState = (state) => ({
    selectedItem: state.selectedItem,
    showSideBar: state.main.showSideBar,
    selected: state.main.selected,
    rightSectionMode: state.main.rightSectionMode
})

export default connect(connectPropToState)(RightSectionContainer)