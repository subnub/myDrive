import React from "react";
import {connect} from "react-redux";

class HomepageSpinnerContainer extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="homepage__spinner__wrapper" style={this.props.loading ? {} : {display:"none"}}>
                <div className="spinner spinner__no-margin">
    
                </div>
            </div>
        )
    }
}

const connectPropToStore = (state) => ({
    loading: state.main.loading
})

export default connect(connectPropToStore)(HomepageSpinnerContainer);