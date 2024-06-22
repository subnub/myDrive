import QuickAccessItem from ".";
import {
  setRightSelected,
  setLastSelected,
  setSelected,
} from "../../actions/selectedItem";
import mobileCheck from "../../utils/mobileCheck";
import env from "../../enviroment/envFrontEnd";
import axios from "../../axiosInterceptor";
import { connect } from "react-redux";
import React from "react";
import Swal from "sweetalert2";
import { startRenameFile, startRemoveFile } from "../../actions/files";
import { setMoverID } from "../../actions/mover";
import mobilecheck from "../../utils/mobileCheck";
import { setMobileContextMenu } from "../../actions/mobileContextMenu";

const currentURL = env.url;

class QuickAccessItemContainer extends React.Component {
  constructor(props) {
    super(props);

    this.failedToLoad = false;

    this.state = {
      image: "/images/file-svg.svg",
      imageClassname: "noSelect file__item-no-thumbnail",
      contextSelected: false,
      hasThumbnail: false,
    };
  }

  changeEditNameMode = async () => {
    let inputValue = this.props.filename;

    const { value: folderName } = await Swal.fire({
      title: "Enter A File Name",
      input: "text",
      inputValue: inputValue,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Please Enter a Name";
        }
      },
    });

    if (folderName === undefined || folderName === null) {
      return;
    }

    this.props.dispatch(
      startRenameFile(this.props._id, folderName, this.props.metadata.drive)
    );
  };

  closeEditNameMode = () => {
    this.setState(() => {
      return {
        ...this.state,
        editNameMode: false,
      };
    });
  };

  changeDeleteMode = async () => {
    Swal.fire({
      title: "Confirm Deletion",
      text: "You cannot undo this action",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    }).then((result) => {
      if (result.value) {
        this.props.dispatch(
          startRemoveFile(
            this.props._id,
            this.props.metadata.drive,
            this.props.metadata.personalFile
          )
        );
      }
    });
  };

  startMovingFile = async () => {
    this.props.dispatch(
      setMoverID(
        this.props._id,
        this.props.metadata.parent,
        true,
        this.props.metadata.drive,
        this.props.metadata.personalFile
      )
    );
  };

  // render() {
  //   return (
  //     <QuickAccessItem
  //       startMovingFile={this.startMovingFile}
  //       state={this.state}
  //       {...this.props}
  //     />
  //   );
  // }
}

const connectStateToProp = (state) => ({
  rightSelected: state.selectedItem.rightSelected,
  selected: state.selectedItem.selected,
});

export default connect(connectStateToProp)(QuickAccessItemContainer);
