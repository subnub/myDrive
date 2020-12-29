import React from "react";
import {connect} from "react-redux"
import env from "../../enviroment/envFrontEnd";
import {history} from "../../routers/AppRouter"
import ParentBar from "./ParentBar";

class ParentBarContainer extends React.Component {

    constructor(props) {
        super(props)
    }

    onFolderClick = () => {

        const id = this.props.parentList.length !== 0 ? this.props.parentList[this.props.parentList.length - 1] : "";
        const url = env.uploadMode === "drive" ? `/folder-google/${id}` : env.uploadMode === "s3" ? `/folder-personal/${id}` : `/folder/${id}`;

        if (id.length === 0) return;

        history.push(url)
    }

    homeClick = () => {
        history.push("/home")
    }

    render() {
        return <ParentBar 
                    homeClick={this.homeClick}
                    onFolderClick={this.onFolderClick}
                    {...this.props}/>
    }
}

const connectStoreToProp = (state) => ({
    parentNameList: state.parent.parentNameList,
    parentList: state.parent.parentList
})

export default connect(connectStoreToProp)(ParentBarContainer);