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
import axios from "../../axiosInterceptor";
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

        // console.log("Search value". value)
        
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

    selectSuggested = () => {

        history.push(`/search/${this.searchValue}`)

        this.searchValue = ''

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

        return;

        // if (this.searchValue === "") {
            
        //     return this.setState(() => {
        //         return {
        //             ...this.state, 
        //             suggestedList: {
        //                 fileList: [],
        //                 folderList: []
        //             }
        //         }
        //     })
        // }

        // const url = !env.googleDriveEnabled ? currentURL +`/file-service/suggested-list?search=${this.searchValue}` : currentURL +`/file-service-google-mongo/suggested-list?search=${this.searchValue}`

        // axios.get(url).then((results) => {

        //     this.setState(() => {
        //         return {
        //             ...this.state, 
        //             suggestedList: results.data
        //         }
        //     }) 

        // }).catch((err) => {
        //     console.log(err)
        // })
    }

    showSettings = () => {

        this.props.dispatch(showSettings())
    }

    logoutUser = () => {
        
        this.props.dispatch(startLogout())
    }

    itemClick = () => {
        console.log("item click")
    }

    selectSuggestedByParent = () => {

       // const parent = this.props.parent === "/" ? "home" : this.props.parent;

        const parent = this.props.parent;

        history.push(`/search/${this.searchValue}?parent=${parent}&folder_search=true`)

        this.searchValue = ''

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

    selectSuggestedByStorageType = () => {

        history.push(`/search/${this.searchValue}?storageType=stripe`)

        this.searchValue = ''

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

    goToSettings = () => {

        window.location.assign(env.url+"/settings")
    }

    getProfilePic = () => {

        if (env.name && env.name.length !== 0) {
            return env.name.substring(0, 1).toUpperCase();
        } else if (env.emailAddress && env.emailAddress.length !== 0) {
            return env.emailAddress.substring(0,1).toUpperCase();
        } else {
            return "?"
        }
    }

    render() {

        return <Header 
                    searchEvent={this.searchEvent}
                    searchOnChange={this.searchOnChange}
                    selectSuggested={this.selectSuggested}
                    showSuggested={this.showSuggested}
                    hideSuggested={this.hideSuggested}
                    showSettings={this.showSettings}
                    searchValue={this.searchValue}
                    selectSuggestedByParent={this.selectSuggestedByParent}
                    selectSuggestedByStorageType={this.selectSuggestedByStorageType}
                    itemClick={this.itemClick}
                    goToSettings={this.goToSettings}
                    getProfilePic={this.getProfilePic}
                    state={this.state}
                    {...this.props}
                    />
    }
}

const connectPropToStore = (state) => ({
    search: state.filter.search,
    parentNameList: state.parent.parentNameList,
    parent: state.parent.parent,
})

export default connect(connectPropToStore)(HeaderContainer);