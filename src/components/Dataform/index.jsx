import DataForm from "./DataForm";
import {connect} from "react-redux";
import React from "react";
import { enableListView, disableListView, setSortBy } from "../../actions/filter";
import { startSetFiles, startLoadMoreFiles } from "../../actions/files";
import { startSetFolders } from "../../actions/folders";
import { resetItems } from "../../actions/main";

class DataFormContainer extends React.Component {

    constructor(props) {

        super(props);

        this.timeout = 0;
    }

    changeListViewMode = () => {

        if (!this.props.listView) {
            this.props.dispatch(enableListView())
        } else {
            this.props.dispatch(disableListView())
        }
        
    }

    onScrollEvent = () => {
    }


    componentDidMount = () => {

        document.addEventListener("scroll", this.scrollCheck)
    }

    scrollCheck = (e) => {

        const heightValue = (app.clientHeight - (app.clientHeight / 4));  
            
        if (heightValue < window.scrollY) {
            
            const date = new Date();

            if (this.props.loadMoreItems && this.timeout < date.getTime() && !this.props.loadingMoreItems) {
                this.timeout = date.getTime() + 500;
                this.loadMoreItems();
            } else {
                
            }
        }
    }

    loadMoreItems = () => {

        let limit = window.localStorage.getItem("list-size") || 50
        limit = parseInt(limit)

        if (this.props.files.length >= limit) {

            const parent = this.props.parent;
            const search = this.props.search;
            const sortBy = this.props.sortBy;
            const lastFileDate = this.props.files[this.props.files.length - 1].uploadDate
            const lastFileName = this.props.files[this.props.files.length - 1].filename
            const lastPageToken = this.props.files[this.props.files.length - 1].pageToken
            const isGoogle = this.props.isGoogle;

            this.props.dispatch(startLoadMoreFiles(parent, sortBy, search, lastFileDate, lastFileName, lastPageToken, isGoogle))  
        } 
    }

    componentDidUpdate = () => {

    }

    switchSortBy = () => {

        let sortByString = this.props.sortBy.includes('date') ? 
        this.props.sortBy === "date_desc" ? 'date_asc' : 'date_desc' : 
        this.props.sortBy === 'alp_desc' ? 'alp_asc' : 'alp_desc';

        const parent = this.props.parent;
        const search = this.props.search;

        this.props.dispatch(setSortBy(sortByString))
        this.props.dispatch(startSetFiles(parent, sortByString, search))
        this.props.dispatch(startSetFolders(parent, sortByString, search))
        this.props.dispatch(resetItems())
    }

    onChangeSelect = (e) => {

        const value = e.target.value;

        let sortByString = ''

        if (value === "date") {
            if (this.props.sortBy.includes("asc")) {
                sortByString = 'date_asc';
            } else {
                sortByString = 'date_desc';
            }
        } else if (value === 'name') {
            if (this.props.sortBy.includes('asc')) {
                sortByString = 'alp_asc'
            } else {
                sortByString = 'alp_desc'
            }
        }

        const parent = this.props.parent;
        const search = this.props.search;

        this.props.dispatch(setSortBy(sortByString))
        this.props.dispatch(startSetFiles(parent, sortByString, search))
        this.props.dispatch(startSetFolders(parent, sortByString, search))
        this.props.dispatch(resetItems())
    }

    render() {
        return <DataForm 
                {...this.props} 
                onChangeSelect={this.onChangeSelect} 
                changeListViewMode={this.changeListViewMode}
                switchSortBy={this.switchSortBy} 
                onScrollEvent={this.onScrollEvent}/>
    }
}

const mapStateToProp = (state) => ({
    files: state.files,
    folders: state.folders,
    selected: state.selectedItem.selected,
    resetItems: state.main.resetItems,
    parent: state.parent.parent,
    listView: state.filter.listView,
    sortBy: state.filter.sortBy,
    search: state.filter.search,
    isGoogle: state.filter.isGoogle,
    loadMoreItems: state.main.loadMoreItems,
    loading: state.main.loading,
    loadingMoreItems: state.main.loadingMoreItems
})

export default connect(mapStateToProp)(DataFormContainer);