
import {startLoadMoreFiles} from "../../actions/files";
import {startSetSelectedItem, setLastSelected} from "../../actions/selectedItem";
import {setLoading, setLeftSectionMode, setRightSectionMode} from "../../actions/main";
import {setPopupFile} from "../../actions/popupFile";
import mobileCheck from "../../utils/mobileCheck"
import MainSection from "./MainSection";
import env from "../../enviroment/envFrontEnd";
import axios from "../../axiosInterceptor";
import {connect} from "react-redux";
import {history} from "../../routers/AppRouter";
import React from "react";
import { getUpdateSettingsID } from "../../utils/updateSettings";

class MainSectionContainer extends React.Component {

    constructor(props) {
        super(props);

        this.doubleClickFoldersMobile = false;
        this.lastSettingsUpdateID = "";
    }

    folderClick = (id, folder, bypass=false) => {

        const currentDate = Date.now();
        const mobile = mobileCheck();
        const selectedID = this.props.selected;

        const doubleClickMobile = localStorage.getItem("double-click-folders") || false;

        if ((currentDate - this.props.lastSelected < 1500 && selectedID === id) || (mobile && !doubleClickMobile)|| bypass) {

            const folderPush = folder.drive ? `/folder-google/${id}` : folder.personalFolder ?  `/folder-personal/${id}` :  `/folder/${id}`;
            history.push(folderPush)

        } else {

            const isGoogleDrive = folder.drive;

            this.props.dispatch(startSetSelectedItem(id, false, false, isGoogleDrive));
        }
        
    }

    fileClick = (fileID, file, fromQuickItems=false, bypass=false) => {

        const currentDate = Date.now();

        let selectedFileID = fileID;

        if (fromQuickItems) {
           selectedFileID = "quick-" + fileID;
        }

        const isMobile = mobileCheck();

        if ((currentDate - this.props.lastSelected < 1500 && selectedFileID === this.props.selected) || bypass) {

            this.props.dispatch(setPopupFile({showPopup: true, ...file}))

        } else {

            const isGoogleDrive = file.metadata.drive

            this.props.dispatch(startSetSelectedItem(fileID, true, fromQuickItems, isGoogleDrive))

        }

    }

    scrollEvent = (e) => {

        //if (!mobileCheck()) return;

        return;

        const scrollY = window.pageYOffset;
        const windowY = document.documentElement.scrollHeight;

        let limit = window.localStorage.getItem("list-size") || 50
        limit = parseInt(limit)

        if (this.props.loading) return;

        if ((windowY / 2) < scrollY && this.props.allowLoadMoreItems) {

            console.log("load more main")
            
            if (this.props.files.length >= limit) {
                const parent = this.props.parent;
                const search = this.props.filter.search;
                const sortBy = this.props.filter.sortBy;
                const lastFileDate = this.props.files[this.props.files.length - 1].uploadDate
                const lastFileName = this.props.files[this.props.files.length - 1].filename

                this.props.dispatch(setLoading(true));
                this.props.dispatch(startLoadMoreFiles(parent, sortBy, search, lastFileDate, lastFileName));

            } 
        }
    }

    componentDidMount = () => {
        window.addEventListener("scroll", this.scrollEvent);
        window.addEventListener("resize", this.resizeEvent);

        this.getSettings();
    }

    componentDidUpdate = () => {

        console.log("main updated");

        // console.log("update ID main", getUpdateSettingsID());

        // if (this.lastSettingsUpdateID !== getUpdateSettingsID()) {
        //     console.log("Settings Update!");
        //     this.getSettings();
        // }

        // this.lastSettingsUpdateID = getUpdateSettingsID();

        // console.log("update settings id", updateSettingsID);

        // console.log("Main Section Updated", this.props.resetSettingsMain);

        // if (this.lastSettingsUpdateID !== this.props.resetSettingsMain) {
        //     console.log("Settings Update!");
        //     this.getSettings();
        // }

        // this.lastSettingsUpdateID = this.props.resetSettingsMain;
    }

    getSettings = () => {

        this.doubleClickFoldersMobile = localStorage.getItem("double-click-folders") || false;
    }

    componentWillUnmount = () => {
 
        window.removeEventListener("scroll", this.scrollEvent);
    }

    resizeEvent = () => {
        if (this.props.leftSectionMode === 'open') this.props.dispatch(setLeftSectionMode(''))
        if (this.props.rightSectionMode === 'open') this.props.dispatch(setRightSectionMode(''))
    }

    downloadFile = (fileID, file) => {

        const isGoogle = file.metadata.drive;
        const isGoogleDoc = file.metadata.googleDoc;
        const isPersonal = file.metadata.personalFile;  

        this.props.dispatch(setLastSelected(0));

        axios.post("/user-service/get-token").then((response) => {

           

            const finalUrl = 
            isGoogle ? !isGoogleDoc ? `/file-service-google/download/${fileID}` : `/file-service-google-doc/download/${fileID}`  
            : !isPersonal ? `/file-service/download/${fileID}` : `/file-service-personal/download/${fileID}`

            console.log("download file", finalUrl);

            const link = document.createElement('a');
            document.body.appendChild(link);
            link.href = finalUrl;
            link.setAttribute('type', 'hidden');
            link.setAttribute("download", true);
            link.click();

        }).catch((e) => {
            console.log("Download file get refresh token error", e);
        })

        // axios.get(currentURL +'/file-service/download/get-token')
        // .then((response) => {

        //     const tempToken = response.data.tempToken;

        //     const finalUrl = 
        //     isGoogle ? !isGoogleDoc ? currentURL + `/file-service-google/download/${fileID}` : currentURL + `/file-service-google-doc/download/${fileID}`  
        //     : !isPersonal ? currentURL + `/file-service/download/${fileID}` : currentURL + `/file-service-personal/download/${fileID}`

        //     const link = document.createElement('a');
        //     document.body.appendChild(link);
        //     link.href = finalUrl;
        //     link.setAttribute('type', 'hidden');
        //     link.setAttribute("download", true);
        //     link.click();

        // }).catch((err) => {
        //     console.log(err)
        // })
    }

    loadMoreItems = () => {
    
        return;

        console.log("load more main")

        if (mobileCheck()) return;

        let limit = window.localStorage.getItem("list-size") || 50
        limit = parseInt(limit)

        if (this.props.loading) {

            return;
        }

        if (this.props.files.length >= limit) {

            const parent = this.props.parent;
            const search = this.props.filter.search;
            const sortBy = this.props.filter.sortBy;
            const lastFileDate = this.props.files[this.props.files.length - 1].uploadDate
            const lastFileName = this.props.files[this.props.files.length - 1].filename
            const lastPageToken = this.props.files[this.props.files.length - 1].pageToken
            const isGoogle = this.props.filter.isGoogle;

            this.props.dispatch(startLoadMoreFiles(parent, sortBy, search, lastFileDate, lastFileName, lastPageToken, isGoogle))  
        } 
    }

    switchLeftSectionMode = () => {

        const leftSectionMode = this.props.leftSectionMode;

        if (leftSectionMode === '' || leftSectionMode === 'close') {
            this.props.dispatch(setLeftSectionMode('open'))
        } else {
            this.props.dispatch(setLeftSectionMode('close'))
        }
    }

    switchRightSectionMode = () => {

        const rightSectionMode = this.props.rightSectionMode;

        if (rightSectionMode === '' || rightSectionMode === 'close') {
            this.props.dispatch(setRightSectionMode('open'))
        } else {
            this.props.dispatch(setRightSectionMode('close'))
        }
    }

    render() {

        return <MainSection 
                folderClick={this.folderClick}
                fileClick={this.fileClick}
                downloadFile={this.downloadFile}
                loadMoreItems={this.loadMoreItems}
                switchLeftSectionMode={this.switchLeftSectionMode}
                switchRightSectionMode={this.switchRightSectionMode}
                {...this.props}/>
    }

}

const connectPropToState = (state) => ({
    filter: state.filter,
    files: state.files,
    folders: state.folders,
    allowLoadMoreItems: state.main.loadMoreItems,
    loading: state.main.loading,
    showPopup: state.popupFile.showPopup,
    quickFiles: state.quickFiles,
    selected: state.selectedItem.selected,
    lastSelected: state.selectedItem.lastSelected,
    parent: state.parent.parent,
    parentNameList: state.parent.parentNameList,
    moverID: state.mover.id,
    routeType: state.main.currentRouteType,
    cachedSearch: state.main.cachedSearch,
    leftSectionMode: state.main.leftSectionMode,
    rightSectionMode: state.main.rightSectionMode,
    // resetSettingsMain: state.main.resetSettingsMain
})

export default connect(connectPropToState)(MainSectionContainer);