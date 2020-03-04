import Filter from "./Filter";
import {setSortBy} from "../../actions/filter";
import {startSetFiles} from "../../actions/files"
import {startSetFolders} from "../../actions/folders";
import {resetItems} from "../../actions/main"
import {connect} from "react-redux";
import React from "react";

class FilterContainer extends React.Component {

    constructor(props) {
        super(props);
    }

    changeOrder = () => {

        const sortBySwitch = this.props.filter.sortBy.split("_");
        const sortByPrefix = sortBySwitch[0];

        if (this.props.filter.sortBy.includes("asc")) {

            return sortByPrefix + "_desc"

        } else {

            return sortByPrefix + "_asc"
        }
    }

    changeSortBy = async() => {

        const sortByString = this.changeOrder();

        const parent = this.props.parent;
        const search = this.props.filter.search;

        this.props.dispatch(setSortBy(sortByString))
        this.props.dispatch(startSetFiles(parent, sortByString, search))
        this.props.dispatch(startSetFolders(parent, sortByString, search))
        this.props.dispatch(resetItems())
    }

    changeSelected = (e) => {

        const sortBySwitch = this.props.filter.sortBy.split("_");
        const sortBySuffix = sortBySwitch[1];

        if (sortBySwitch.includes("date")) {

            return "alp_" + sortBySuffix;
    
        } else {
    
            return "date_" + sortBySuffix;
        }

    }

    selectedOnChange = async(e) => {

        const sortByString = this.changeSelected();

        const parent = this.props.parent;
        const search = this.props.filter.search;

        this.props.dispatch(setSortBy(sortByString))
        this.props.dispatch(startSetFiles(parent, sortByString, search))
        this.props.dispatch(startSetFolders(parent, sortByString, search))
        this.props.dispatch(resetItems())
    }

    getFilterOptionType = () => {

        if (this.props.filter.sortBy.includes("alp")) {

            return "name"

        } else {

            return "date"
        }
    }
    
    getFilterOptionValue = () => {

        if (this.props.filter.sortBy.includes("asc")) {

            return false;

        } else {

            return true;
        }
    }

    render() {

        return <Filter 
                selectedOnChange={this.selectedOnChange} 
                changeSortBy={this.changeSortBy} 
                getFilterOptionType={this.getFilterOptionType}
                getFilterOptionValue={this.getFilterOptionValue}
                {...this.props}/>

    }
}

const connectPropToStore = (state) => ({
    filter: state.filter,
    folderListLength: state.folders.length,
    parent: state.parent.parent
})


export default connect(connectPropToStore)(FilterContainer);