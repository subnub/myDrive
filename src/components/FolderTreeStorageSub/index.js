import env from "../../enviroment/envFrontEnd";
import axios from "../../axiosInterceptor"
import React from "react";
import {setFolderTreeID, removeFolderTreeID, removeNewFolderTreeID, removeDeleteFolderTreeID, removeMoveFolderTreeID, addNewFolderTreeID, removeRenameFolderTreeID, setInsertedFolderTreeID} from "../../actions/folderTree";
import {history} from "../../routers/AppRouter";
import {connect} from "react-redux"
import FolderTreeStorageSub2 from ".././FolderTreeStorageSub";
import FolderTreeStorageSub from "./FolderTreeStorageSub";

class FolderTreeStorageSubContainer extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            folders: [],
            open: false,
            loaded: false,
            forceUpdate: ""
        }

        this.cachedFolders = {

        }

        this.ignoreNewList = {

        }

        this.ignoreDeleteList = {

        }

        this.ignoreMoveList = {

        }

        this.ignoreRenameList = {

        }

        this.ignoreInsertList = {

        }

        this.launchedByMain = false;
        this.skipUpdate = false;
    }

    componentDidUpdate = () => {

        if (this.props.selectedIDs[this.props.folder._id] 
            && !this.state.open 
            && !this.state.loaded
            && this.props.folder._id === this.props.selectedID) {
            this.skipUpdate = true;
            this.getFolders()
        } else if (this.props.selectedIDs[this.props.folder._id] 
            && !this.state.open
            && this.props.folder._id === this.props.selectedID) {
        
            this.skipUpdate = true;
            this.setState(() => {
                return {
                    ...this.state,
                    open: true,}
            })
        } else if (this.props.selectedIDs[this.props.folder._id] === undefined && this.state.open) {
            this.setState(() => {
                return {
                    ...this.state,
                    open: false,}
            })
        }

        this.addNewFolders()
        this.deleteRemovedFolders()
        this.moveMovedFolders();
        this.renameRenamedFolders();
        this.insertInsertedFolders();
    }

    addNewFolders = () => {

        for (let currentKey in this.props.newIDs) {
            
            const currentObj = this.props.newIDs[currentKey];
            if (currentObj.parent === this.props.folder._id && !this.ignoreNewList[currentObj._id]) {
                
                this.ignoreNewList[currentObj._id] = true;

                this.props.dispatch(removeNewFolderTreeID(currentObj._id))

                this.setState(() => {

                    return {
                        ...this.state,
                        folders: [...this.state.folders, currentObj]
                    }
                })
            }
        }
    }

    insertInsertedFolders = () => {

        for (let currentKey in this.props.insertedIDs) {

            const currentObj = this.props.insertedIDs[currentKey];

            if (currentObj.parent === this.props.folder._id && !this.ignoreInsertList[currentObj._id]) {
                
                this.ignoreInsertList[currentObj._id] = true;

                let tempInsertIDsList = this.props.insertedIDs;
                tempInsertIDsList = [...tempInsertIDsList.slice(0, currentKey), ...tempInsertIDsList.splice(currentKey+1, tempInsertIDsList.length)]
               
                this.props.dispatch(setFolderTreeID(this.props.folder._id))

                this.setState(() => {

                    return {
                        ...this.state,
                        folders: currentObj.subFolders,
                        open: true,
                        loaded: true
                    }

                }, () => {

                    if (tempInsertIDsList.length !== 0) {
                        const newID = tempInsertIDsList[0];
                        this.props.dispatch(setInsertedFolderTreeID(newID, tempInsertIDsList))
                    }
                })
                break;
            }
        }
    }

    deleteRemovedFolders = () => {

        for (let currentKey in this.props.deleteIDs) {

            const currentObj = this.props.deleteIDs[currentKey];

            if (this.cachedFolders[currentObj._id] && !this.ignoreDeleteList[currentObj._id]) {

                this.ignoreDeleteList[currentObj._id] = true;

                const tempFolderList = this.state.folders.filter((currentFolder) => {
                    return currentObj._id !== currentFolder._id
                })

                this.props.dispatch(removeDeleteFolderTreeID(currentObj._id));
                
                this.setState(() => {

                    return {
                        ...this.state,
                        folders: tempFolderList,
                    }
                })
            }
        }
    }

    moveMovedFolders = () => {

        for (let currentKey in this.props.moveIDs) {
            const currentObj = this.props.moveIDs[currentKey];

            if (this.cachedFolders[currentObj._id] && !this.ignoreMoveList[currentObj._id]) {

                this.ignoreMoveList[currentObj._id] = true;

                let movedValue = {}
                const tempFolderList = this.state.folders.filter((currentFolder) => {
                    
                    if (currentObj._id === currentFolder._id) movedValue = currentFolder;
                    return currentObj._id !== currentFolder._id
                })

                movedValue.parent = currentObj.parent;
                
                this.props.dispatch(removeMoveFolderTreeID(currentObj._id));
                this.props.dispatch(addNewFolderTreeID(currentObj._id, movedValue))

                this.setState(() => {

                    return {
                        ...this.state,
                        folders: tempFolderList
                    }
                })

            }
        }
    }

    renameRenamedFolders = () => {

        for (let currentKey in this.props.renameIDs) {
            const currentObj = this.props.renameIDs[currentKey];

            if (this.cachedFolders[currentObj._id] && !this.ignoreRenameList[currentObj._id]) {

                this.ignoreRenameList[currentObj._id] = true;

                let tempList = [];

                for (let currentValue of this.state.folders) {

                    if (currentValue._id === currentObj._id) {
                        currentValue.name = currentObj.name;
                    }
                    tempList.push(Object.assign({}, currentValue));
                }

                this.props.dispatch(removeRenameFolderTreeID(currentObj._id));

                this.setState(() => {

                    return {
                        ...this.state,
                        folders: [...tempList],
                    }
                })

            }
        }
    }

    folderClick = () => {

        const id = this.props.folder._id;
        const folderPush = this.props.type === "drive" ? `/folder-google/${id}` : this.props.type === "mongo" ? `/folder/${id}` : `/folder-personal/${id}`;
        history.push(folderPush)
    }

    getFolders = () => {

        const parent = this.props.folder._id;
        
        const url = this.props.type === "drive" ? `/folder-service-google/list?parent=${parent}` : `/folder-service/list?parent=${parent}`;
        axios.get(url).then((response) => {

            this.setState(() => {
                return {
                    folders: response.data,
                    open: true,
                    loaded: true
                }
            })
        })
    }

    clickEvent = () => {

        if (!this.state.open) {
            this.props.dispatch(setFolderTreeID(this.props.folder._id))
        } else {
            this.props.dispatch(removeFolderTreeID(this.props.folder._id));
            this.setState(() => {
                return {
                    ...this.state,
                    open: false,
                }
            })
        }
    }

    renderFolders = () => {

        this.cachedFolders = {}

        return this.state.folders.map((folder) => {
            this.cachedFolders[folder._id] = true;
            return <FolderTreeStorageSub2 key={folder._id} folder={folder} type={this.props.type}/>
        })
    }

    render () {

        return (

            <FolderTreeStorageSub 
                renderFolders={this.renderFolders} 
                skipUpdate={this.skipUpdate} 
                clickEvent={this.clickEvent}
                folderClick={this.folderClick}
                state={this.state}
                {...this.props}
                />
        )
    }
}

const connectStoreToProp = (state) => ({
    selectedID: state.folderTree.id,
    selectedIDs: state.folderTree.openIDs,
    newIDs: state.folderTree.newIDs,
    newID: state.folderTree.newID,
    deleteIDs: state.folderTree.deleteIDs,
    deleteID: state.folderTree.deleteID,
    moveIDs: state.folderTree.moveIDs,
    moveID: state.folderTree.moveID,
    renameIDs: state.folderTree.renameIDs,
    renameID: state.folderTree.renameID,
    insertedIDs: state.folderTree.insertedIDs,
    insertedID: state.folderTree.insertedID
})

export default connect(connectStoreToProp)(FolderTreeStorageSubContainer);