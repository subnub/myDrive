import DataForm from "./DataForm";
import {connect} from "react-redux";
import React from "react";

class DataFormContainer extends React.Component {

    constructor(props) {

        super(props);
    }

    render() {

        return <DataForm {...this.props}/>

    }
}

const mapStateToProp = (state) => ({
    files: state.files,
    folders: state.folders,
    selected: state.selectedItem.selected,
    resetItems: state.main.resetItems
})

export default connect(mapStateToProp)(DataFormContainer);