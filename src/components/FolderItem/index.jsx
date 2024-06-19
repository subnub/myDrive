import FolderItem from "./FolderItem"
import {startSetSelectedItem, setRightSelected, setLastSelected} from "../../actions/selectedItem"
import mobileCheck from "../../utils/mobileCheck"
import {connect} from "react-redux";
import React from "react";
import { startRenameFolder, startRemoveFolder } from "../../actions/folders";
import Swal from "sweetalert2";
import { setMoverID } from "../../actions/mover";
import mobilecheck from "../../utils/mobileCheck";
import { setMobileContextMenu } from "../../actions/mobileContextMenu";

class FolderItemContainer extends React.Component {

    constructor(props) {
        super(props)

        this.lastTouch = 0;

        this.state = {
            contextSelected: false
        }
    }

    shouldComponentUpdate = (nextProp, nextState) => {

        return (nextProp.itemSelected !== this.props.itemSelected 
                || nextProp.listView !== this.props.listView 
                || nextProp.rightSelected !== this.props.rightSelected 
                || nextProp.name !== this.props.name
                || nextProp.quickFilesLength !== this.props.quickFilesLength
                || nextState.contextSelected !== this.state.contextSelected)
    }

    onTouchStart = () => {
        const date = new Date();
        this.lastTouch = date.getTime();
    }

    onTouchMove = () => {

        this.lastTouch = 0;
    }

    onTouchEnd = () => {

        if (this.lastTouch === 0) {
            return;
        }

        const date = new Date();
        const difference = date - this.lastTouch;
   
        this.lastTouch = 0;

        if (difference > 500) {
            this.selectContext()
        }

    }

    getContextMenu = (e) => {

        if (e) e.preventDefault();

        const isMobile = mobileCheck();

        const windowX = window.innerWidth;
        const windowY = window.innerHeight;

        let styleObj = {right:0, left:0, top: "-14px", bottom: 0}

        if (isMobile) {

            styleObj = {bottom: 0, left: "2px", top:"unset"}

        } else {

            const clientY =  e.nativeEvent.clientY;
            const clientX = e.nativeEvent.clientX;


            if (clientY < (windowY / 3)) {

                const bottomSize = this.props.quickFilesLength === 0 ? "-126px" : "-190px"

                styleObj = {bottom: bottomSize, top:"unset"}
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

        this.setState(() => styleObj)

        this.props.dispatch(startSetSelectedItem(this.props._id, false))
        this.props.dispatch(setLastSelected(0));
        this.props.dispatch(setRightSelected(this.props._id))
    
    }

    getClassName = () => {

        let classname = "";

        if (this.props.listView) {

            classname += "file__item__listview"

        } else {

            classname += "folder__item__wrapper"
        } 

        if (this.props._id === this.props.selected) {

            classname += " file__item--selected"
        }

        return classname;
    }

    changeEditNameMode = async() => {

        let inputValue = this.props.name;
    
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

        this.props.dispatch(startRenameFolder(this.props._id, folderName, this.props.drive, this.props.parent));
    }

    closeEditNameMode = () => {

        this.setState(() => {

            return {
                ...this.state,
                editNameMode: false
            }
        })
    }

    changeDeleteMode = async() => {

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
                this.props.dispatch(startRemoveFolder(this.props._id, [...this.props.parentList, this.props._id], this.props.drive, this.props.parent, this.props.personalFolder))
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

    selectContext = (e) => {

        if (e) e.stopPropagation()
        if (e) e.preventDefault();

        if (mobilecheck()) {

            this.props.dispatch(setMobileContextMenu(false, this.props))

            return;
        }

        this.setState(() => {
            return {
                ...this.state,
                contextSelected: !this.state.contextSelected
            }
        })
    }

    startMoveFolder = async() => {

        this.props.dispatch(setMoverID(this.props._id, this.props.parent, false, this.props.drive, this.props.personalFolder));
    }

    render() {

        return <FolderItem 
                getContextMenu={this.getContextMenu} 
                getClassName={this.getClassName}
                onTouchStart={this.onTouchStart}
                onTouchMove={this.onTouchMove}
                onTouchEnd={this.onTouchEnd}
                closeContext={this.closeContext}
                selectContext={this.selectContext}
                changeEditNameMode={this.changeEditNameMode}
                closeEditNameMode={this.closeEditNameMode}
                startMoveFolder={this.startMoveFolder}
                changeDeleteMode={this.changeDeleteMode}
                state={this.state}
                {...this.props}/>
    }

}

const connectPropToState = (state) => ({
    listView: state.filter.listView,
    rightSelected: state.selectedItem.rightSelected,
    resetSelected: state.selectedItem.resetSelected,
    selected: state.selectedItem.selected,
    quickFilesLength: state.quickFiles.length
})

export default connect(connectPropToState)(FolderItemContainer);