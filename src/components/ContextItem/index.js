import ContextItem from "./ContextItem";
import {setRightSelected, setSelected, setShareSelected} from "../../actions/selectedItem"
import {startRemoveFile, startRenameFile} from "../../actions/files"
import {setMoverID} from "../../actions/mover";
import Swal from "sweetalert2"
import {connect} from "react-redux"
import React from "react";

class ContextItemContainer extends React.Component {

    constructor(props) {
        super(props);
    }

    onClick =  async(e) => {
        e.stopPropagation();
        
        this.props.dispatch(setSelected(""))
        this.props.dispatch(setRightSelected(""))

        const itemTitle = this.props.title;
    
        if (itemTitle === "Download") {
    
            this.props.downloadFile(this.props._id, undefined, false, true)
            
        } else if (itemTitle === "Delete") {
    
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
                    this.props.dispatch(startRemoveFile(this.props._id))
                }
            })
    
        } else if (itemTitle === "Rename") {
    
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
    
            this.props.dispatch(startRenameFile(this.props._id, folderName))
    
        } else if (itemTitle === "Share") {
    
            this.props.dispatch(setShareSelected({...this.props.file}))

        } else if (itemTitle === "Move") {

            this.props.dispatch(setMoverID(this.props._id, this.props.parent, this.props.isFile));
        }
    }

    render() {
        return <ContextItem onClick={this.onClick} {...this.props}/>
    }
}


export default connect()(ContextItemContainer);

