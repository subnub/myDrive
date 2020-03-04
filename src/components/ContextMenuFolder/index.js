import ContextMenuFolder from "./ContextMenuFolder";
import {setRightSelected, setSelected} from "../../actions/selectedItem";
import {connect} from "react-redux"
import React from "react";

class ContextMenuFolderContainer extends React.Component {

    constructor(props) {
        super(props);

        this.wrapperRef = React.createRef()
    }

    handleClickOutside = (e) => {

        if (this.wrapperRef && !this.wrapperRef.current.contains(e.target)) {
          
            this.props.dispatch(setSelected(""));
            this.props.dispatch(setRightSelected(""));
        }
    }

    componentDidMount = () => {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount = () => {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    render() {

        return <ContextMenuFolder ref={this.wrapperRef} {...this.props}/>
    }
}

export default connect()(ContextMenuFolderContainer);