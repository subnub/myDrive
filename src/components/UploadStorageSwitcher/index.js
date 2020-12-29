import React from "react";
import {connect} from "react-redux";
import env from "../../enviroment/envFrontEnd"
import UploadStorageSwitcher from "./UploadStorageSwitcher";

class UploadStorageSwitcherContainer extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            options: [],
            value: ""
        }
    }

    getOptionList = () => {

        const options = []

        if (env.activeSubscription || !env.commercialMode) options.push({type:"stripe", name:"myDrive"});
        if (env.googleDriveEnabled) options.push({type:"drive", name:"Google Drive"});
        if (env.s3Enabled) options.push({type:"s3", name:"Amazon S3"})

        this.setState(() => {
            return {
                ...this.state,
                options,
                value: options.length !== 0 ? options[0].type : ""
            }
        })

        env.uploadMode = options.length !== 0 ? options[0].type : "";
    }

    changeUploadSwitcher = (e) => {

        const value = e.target.value;

        env.uploadMode = value;

        this.setState(() => ({
            ...this.state,
            value
        }))
    }

    componentDidMount = () => {

        this.getOptionList();
    }

    componentDidUpdate = () => {

        env.uploadMode = this.props.storageSwitcher !== "" ? this.props.storageSwitcher : this.state.value;
    }

    render() {

        return <UploadStorageSwitcher 
                    changeUploadSwitcher={this.changeUploadSwitcher}
                    state={this.state}
                    {...this.props}/>
    }
}

const connectStoreToProp = (state) => ({
    storageSwitcher: state.storageSwitcher.selected
})

export default connect(connectStoreToProp)(UploadStorageSwitcherContainer);