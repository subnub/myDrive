import QuickAccess from "./QuickAccess";
import {connect} from "react-redux";
import React from "react";

class QuickAccessContainer extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <QuickAccess {...this.props}/>
    }

}

const connectStateToProp = (state) => ({
    quickFiles: state.quickFiles
})

export default connect(connectStateToProp)(QuickAccessContainer)