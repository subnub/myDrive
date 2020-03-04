import Header from "./Header";
import {startLogout} from "../../actions/auth"
import {showSettings} from "../../actions/settings";
import {setSearch} from "../../actions/filter"
import {loadMoreItems} from "../../actions/main";
import {setParent, resetParentList} from "../../actions/parent";
import {startSetFiles} from "../../actions/files";
import {startSetFolders} from "../../actions/folders";
import env from "../../enviroment/envFrontEnd";
import {history} from "../../routers/AppRouter";
import axios from "axios";
import {connect} from "react-redux";
import React from "react";

const currentURL = env.url;

class HeaderContainer extends React.Component {

    constructor(props) {
        super(props);

        this.searchValue = "";

        this.state = {
            focused: false,
            suggestedList: {
                fileList: [],
                folderList: []
            }
        }
    }
    
    searchEvent = (e) => {
        e.preventDefault();

        const value = this.props.search;
        
        const parent = "/"
        this.props.dispatch(setParent(parent))
        this.props.dispatch(loadMoreItems(true))
        this.props.dispatch(startSetFiles(undefined, undefined, value));
        this.props.dispatch(startSetFolders(undefined, undefined, value));
        this.props.dispatch(resetParentList())

   
    }

    searchOnChange = (e) => {

        const value = e.target.value;
        this.searchValue = value;

        this.props.dispatch(setSearch(value))
        this.searchSuggested()
    }

    showSuggested = () => {
        
        this.setState(() => {
            return {
                ...this.state,
                focused: true
            }
        })
    }

    hideSuggested = () => {

        this.setState(() => {
            return {
                ...this.state,
                focused: false
            }
        })
    }

    selectSuggested = (value) => {

        history.push(`/search/${value}`)

        this.setState(() => {
            return {
                ...this.state, 
                suggestedList: {
                    fileList: [],
                    folderList: []
                }
            }
        })
    }

    searchSuggested = () => {

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        };
       

        if (this.searchValue === "") {
            
            return this.setState(() => {
                return {
                    ...this.state, 
                    suggestedList: {
                        fileList: [],
                        folderList: []
                    }
                }
            })
        }

        axios.get(currentURL +`/file-service/suggested-list?search=${this.searchValue}`, config).then((results) => {

            this.setState(() => {
                return {
                    ...this.state, 
                    suggestedList: results.data
                }
            })
           

        }).catch((err) => {
            console.log(err)
        })
    }

    showSettings = () => {

        this.props.dispatch(showSettings())
    }

    logoutUser = () => {
        
        this.props.dispatch(startLogout())
    }

    render() {

        return <Header 
                    searchEvent={this.searchEvent}
                    searchOnChange={this.searchOnChange}
                    selectSuggested={this.selectSuggested}
                    showSuggested={this.showSuggested}
                    hideSuggested={this.hideSuggested}
                    showSettings={this.showSettings}
                    state={this.state}
                    {...this.props}
                    />
    }
}

const connectPropToStore = (state) => ({
    search: state.filter.search
})

export default connect(connectPropToStore)(HeaderContainer);