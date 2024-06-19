import React from "react";
import AddStorageItem from "./AddStorageItem";

class AddStorageItemContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            open: false,
        }
    }

    openDetails = () => {

        this.setState((e) => {
            return {
                ...this.state,
                open: !this.state.open,
            }
        })
    }

    render() {
        return <AddStorageItem state={this.state} {...this.props} openDetails={this.openDetails}/>
    }
}

export default AddStorageItemContainer;