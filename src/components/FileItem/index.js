import FileItem from "./FileItem";
import {startSetSelectedItem, setRightSelected, setLastSelected} from "../../actions/selectedItem"
import mobileCheck from "../../utils/mobileCheck"
import env from "../../enviroment/envFrontEnd";
import axios from "../../axiosInterceptor";
import {connect} from "react-redux";
import React from "react";
import { startRenameFile, startRemoveFile } from "../../actions/files";
import mobilecheck from "../../utils/mobileCheck";
import Swal from "sweetalert2"
import { setMoverID } from "../../actions/mover";
import { setMobileContextMenu } from "../../actions/mobileContextMenu";

class FileItemContainer extends React.Component {

    constructor(props) {
        super(props);
  
        this.failedToLoad = false;

        this.lastTouch = 0;

        this.imageLoaded = false

        this.state = {
            contextMenuPos: {},
            imageSrc: "/images/file-svg.svg",
            imageClassname: "noSelect file__item-no-thumbnail",
            contextSelected: false,
            editNameMode: false,
            editName: this.props.filename,
            deleteMode: false,
            movingMode: false,
            movingPercentage: 0,
        }
    }

    getThumbnail = async() => {

        this.imageLoaded = true;

        const thumbnailID = this.props.metadata.thumbnailID;
        // const imageClassname = this.props.listView ? "file__image__listview--no-opacity" : "file__image--no-opacity"
        const imageClassname = "noSelect"

        if (this.props.metadata.drive && !this.props.metadata.googleDoc) {

            return await this.setState(() => ({
                ...this.state,
                imageSrc: this.props.metadata.thumbnailID,
                imageClassname: imageClassname
            }))
        }

        const config = {
            responseType: 'arraybuffer'
        };

        await this.setState(() => ({
            ...this.state,
            imageSrc: "/images/file-svg.svg",
            imageClassname: "noSelect file__item-no-thumbnail"
        }))

        const url = !this.props.metadata.personalFile ? `/file-service/thumbnail/${thumbnailID}` : `/file-service-personal/thumbnail/${thumbnailID}`;
    
        axios.get(url, config).then((results) => {

            const imgFile = new Blob([results.data]);
            const imgUrl = URL.createObjectURL(imgFile);   

            this.setState(() => ({
                ...this.state,
                imageSrc: imgUrl,
                imageClassname: imageClassname
            }))
            

        }).catch((err) => {
            console.log(err)
        })
    }

    thumbnailOnError = () => {

        console.log("thumbnail on error");

        this.setState(() => ({
            ...this.state,
            imageSrc: "/images/file-svg.svg",
            imageClassname: "noSelect file__item-no-thumbnail",
        }))

    }

    componentDidMount = () => {

        const hasThumbnail = this.props.metadata.hasThumbnail;

        if (hasThumbnail && !this.failedToLoad && !this.props.listView && !this.imageLoaded) {
            this.getThumbnail();
        }
    }
    
    shouldComponentUpdate = (nextProp, nextState) => {

        return (nextProp.itemSelected !== this.props.itemSelected 
                || nextProp.listView !== this.props.listView 
                || nextProp.rightSelected !== this.props.rightSelected 
                || nextState.imageSrc !== this.state.imageSrc
                || nextState.imageClassname !== this.state.imageClassname
                || this.props.filename !== nextProp.filename
                || this.props.metadata.transcoded !== nextProp.metadata.transcode 
                || nextState.contextSelected !== this.state.contextSelected
                || nextState.editNameMode !== this.state.editNameMode
                || nextState.editName !== this.state.editName
                || nextState.deleteMode !== this.state.deleteMode
                || nextState.movingMode !== this.state.movingMode
                || nextState.movingPercentage !== this.state.movingPercentage) 
    }
   
    componentDidUpdate = (nextProp) => {

        // console.log("file item component updated")

        return;

        const hasThumbnail = this.props.metadata.hasThumbnail;

        if (hasThumbnail && !this.failedToLoad && !this.imageLoaded) {
    
            this.getThumbnail();

        } else if (nextProp.listView !== this.props.listView) {

            this.setState(() => ({
                ...this.state,
                imageClassname: this.props.listView ? "file__image__listview" : "file__image"
            }))
        }
    }

    onTouchStart = () => {
        //alert("Touch start");
        const date = new Date();
        this.lastTouch = date.getTime();
    }

    onTouchMove = () => {

        this.lastTouch = 0;
    }

    onTouchEnd = () => {

        if (this.lastTouch === 0) {

            //alert("last touch 0");
            return;
        }

        const date = new Date();
        const difference = date - this.lastTouch;
        //alert("Touch end: " + difference)
        //alert("touch end: " + difference);
        this.lastTouch = 0;

        if (difference > 500) {
            //alert("Context menu");
            //this.getContextMenu();
            this.selectContext()
        }

    }

    getContextMenu = (e) => {

        if (e) e.preventDefault();
        
        const isMobile = mobileCheck();
    
        const windowX = window.innerWidth;
        const windowY = window.innerHeight;

        let styleObj = {right:0, left:0, top: "-38px", bottom: 0}

        if (isMobile) {

            styleObj = {bottom: 0, left: "2px", top: "unset", right: "unset"}

        } else {

            const clientY =  e.nativeEvent.clientY;
            const clientX = e.nativeEvent.clientX;

            if (clientY < (windowY / 3)) {

                styleObj = {bottom:"-190px", top:"unset"}
            } 

            if (clientY > ((windowY / 4) * 3.5)) {

                styleObj = {bottom:"unset", top: "-190px"}
            }

            if (clientX > windowX / 2) {

                styleObj = {...styleObj, left:"unset", right:0}

            } else {
            
                styleObj = {...styleObj, left:0, right:"unset"}
            }
        }

        // if (isMobile) {

        //     styleObj = {bottom: 0, left: "2px", top: "unset", right: "unset"}
        // }

        this.setState(() => ({...this.state, contextMenuPos: styleObj}))

        this.props.dispatch(startSetSelectedItem(this.props._id, true, false))
        this.props.dispatch(setLastSelected(0));
        this.props.dispatch(setRightSelected(this.props._id))
    
    }

    getWrapperClassname = () => {

        let classname = "";

        if (this.props.listView) {

            classname += "file__item__listview"

        } else {

            classname += "file__item"
        }

        if (this.props._id === this.props.selected) {

            classname += " file__item--selected"
        }

        return classname;
    }

    selectContext = (e) => {

        if (e) e.stopPropagation();
        if (e) e.preventDefault();

        if (mobilecheck()) {

            this.props.dispatch(setMobileContextMenu(true, this.props))

            return;
        }

        this.setState(() => {
            return {
                ...this.state,
                contextSelected: !this.state.contextSelected
            }
        })
    }

    closeContext = () => {

        this.setState(() => {
            return {
                ...this.state,
                contextSelected: false
            }
        })
    }

    editNamePopup = async() => {

        let inputValue = this.props.filename;
    
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

        // console.log("rename is google", this.props.isGoogle);
        this.props.dispatch(startRenameFile(this.props._id, folderName, this.props.metadata.drive))
    }

    changeEditNameMode = () => {

        this.editNamePopup();

        // const isMobile = mobilecheck();

        // if (isMobile || !this.props.listView) {
        //     this.mobileEditName();
        //     return;
        // }

        // this.setState(() => {

        //     return {
        //         ...this.state,
        //         editNameMode: !this.state.editNameMode
        //     }
        // })
    }

    closeEditNameMode = () => {

        this.setState(() => {

            return {
                ...this.state,
                editNameMode: false
            }
        })
    }

    changeEditName = (e) => {

        const value = e.target.value; 

        this.setState(() => {
            return {
                ...this.state,
                editName: value
            }
        })
    }

    saveNameEdit = () => {

        const value = this.state.editName;

        this.props.dispatch(startRenameFile(this.props._id, value, this.props.metadata.drive))

        this.closeEditNameMode();
    }

    deleteFilePopup = () => {

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
                this.props.dispatch(startRemoveFile(this.props._id, this.props.metadata.drive, this.props.metadata.personalFile))
            }
        })
    }

    removeDeleteMode = () => {

        this.setState(() => {

            return {
                ...this.state,
                deleteMode: false,
            }
        })
    }

    changeDeleteMode = () => {

        this.deleteFilePopup();

        // const isMobile = mobilecheck();

        // if (isMobile || !this.props.listView) {
        //     this.mobileDeleteFile()
        //     return;
        // }

        // this.setState(() => {

        //     return {
        //         ...this.state,
        //         deleteMode: true,
        //         contextSelected: false
        //     }
        // })
    }

    startDeleteFile = () => {

        //this.props.dispatch(startRemoveFile(this.props._id, this.props.metadata.drive, this.props.metadata.personalFile))

        this.changeDeleteMode();
    }

    startMovingFile = () => {

        // console.log("moving file")

        // this.setState(() => {
        //     return {
        //         ...this.state,
        //         movingMode: true
        //     }
        // })

        // window.setInterval(this.changeMoverPos, 50)
        // // REMEMBER TO STOP THIS WHEN FINISHED
        this.props.dispatch(setMoverID(this.props._id, this.props.metadata.parent, true, this.props.metadata.drive, this.props.metadata.personalFile));
    }

    changeMoverPos = () => {

        this.setState(() => {
            return {
                ...this.state,
                movingPercentage: this.state.movingPercentage >= 80 ? 0 : this.state.movingPercentage + 1
            }
        })
    }

    getFileExtension = (filename) => {

        const filenameSplit = filename.split(".");

        if (filenameSplit.length > 1) {
            
            let extension = filenameSplit[filenameSplit.length - 1]

            if (extension.length > 3) extension = extension.substring(0,2) + extension.substring(extension.length - 1, extension.length);

            return extension.toUpperCase();

        } else {

            return "UNK"
        }
    }

    getColor = (ext) => {

        const letter = ext.substring(0,1).toUpperCase();

        const colorObj = {
            A: '#e53935',
            B: '#d81b60',
            C: '#8e24aa',
            D: '#5e35b1',
            E: '#3949ab',
            F: '#1e88e5',
            G: '#039be5',
            H: '#00acc1',
            I: '#00897b',
            J: '#43a047',
            K: '#fdd835',
            L: '#ffb300',
            M: '#fb8c00',
            N: '#f4511e',
            O: '#d32f2f',
            P: '#c2185b',
            Q: '#7b1fa2',
            R: '#512da8',
            S: '#303f9f',
            T: '#1976d2',
            U: '#0288d1',
            V: '#0097a7',
            W: '#0097a7',
            X: '#00796b',
            Y: '#388e3c',
            Z: '#fbc02d'
        }

        if (colorObj[letter]) {
            return colorObj[letter]
        } else {
            return "#03a9f4"
        }
    }

    getExtensionImage = () => {

        const ext = this.getFileExtension(this.props.filename);

        const extensionObj = {
            PDF: "/assets/extension1.svg",
            DOC:  "/assets/extension2.svg",
            DOCX: "/assets/extension2.svg",
            XLS: "/assets/extension3.svg",
            PTT: "/assets/extension4.svg",
            ZIP: "/assets/extension5.svg",   
        }

        if (extensionObj[ext]) {
            return {passed: true, ext: extensionObj[ext]};
        } else {
            return {passed: false, ext, color: this.getColor(ext)}
        }
    }

    startFileClick = () => {
        this.props.fileClick(this.props._id, this.props)
    }

    clickStopPropagation = (e) => {
        e.stopPropagation()
    }

    render() {

        return <FileItem 
                getWrapperClassname={this.getWrapperClassname} 
                getContextMenu={this.getContextMenu} 
                onTouchStart={this.onTouchStart}
                onTouchEnd={this.onTouchEnd}
                onTouchMove={this.onTouchMove}
                selectContext={this.selectContext}
                closeContext={this.closeContext}
                changeEditNameMode={this.changeEditNameMode}
                closeEditNameMode={this.closeEditNameMode}
                changeEditName={this.changeEditName}
                saveNameEdit={this.saveNameEdit}
                changeDeleteMode={this.changeDeleteMode}
                startDeleteFile={this.startDeleteFile}
                startMovingFile={this.startMovingFile}
                getExtensionImage={this.getExtensionImage}
                startFileClick={this.startFileClick}
                clickStopPropagation={this.clickStopPropagation}
                removeDeleteMode={this.removeDeleteMode}
                thumbnailOnError={this.thumbnailOnError}
                state={this.state}
                {...this.props}/>
    }
}

const connectStateToProp = (state) => ({
    listView: state.filter.listView,
    rightSelected: state.selectedItem.rightSelected,
    resetSelected: state.selectedItem.resetSelected,
    selected: state.selectedItem.selected
})

export default connect(connectStateToProp)(FileItemContainer)