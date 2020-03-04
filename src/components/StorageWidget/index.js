import StorageWidget from "./StorageWidget"
import {connect} from "react-redux";
import React from "react";

class StorageWidgetContainer extends React.Component {

    constructor(props) {
        super(props);
    }


    getProgressWidth = (props) => {
     
        const totalSpace = props.storage.total
        const usedSpace = props.storage.total - props.storage.available;
    
        const difference = (usedSpace / totalSpace) * 100;
    
        return difference + "%"
    }

    render() {

        return <StorageWidget 
                getProgressWidth={this.getProgressWidth}
                {...this.props}/>
    }
 
}

const connectStateToProp = (state) => ({
    storage: state.storage,
})

export default connect(connectStateToProp)(StorageWidgetContainer)