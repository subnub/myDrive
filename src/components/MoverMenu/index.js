import React from "react";
import {connect} from "react-redux";
import MoverMenu from "./MoverMenu";
import axios from "../../axiosInterceptor";
import env from "../../enviroment/envFrontEnd";
import {resetMoverID} from "../../actions/mover";
import {removeFile, startResetCache} from "../../actions/files";
import {removeFolder} from "../../actions/folders"
import {addMoveFolderTreeID} from "../../actions/folderTree";

const currentURL = env.url;

class MoverMenuContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            folders: [],
            selected: "",
            lastClick: 0,
            search: "",
            title: "Home",
            historyList: []
        }
    }

    moveItem = () => {

        let id = this.props.ID;

        let parent = this.props.isGoogle ? "root" : "/";

        if (this.state.selected !== "") {
    
            parent = this.state.selected;

        } else if (this.state.historyList.length !== 0) {

            parent = this.state.historyList[this.state.historyList.length - 1].id;
        }

        const data = {
            id, 
            parent
        }

        if (this.props.isFile) {

            const url = this.props.isGoogle ? `/file-service-google/move` : `/file-service/move`;

            axios.patch(url, data).then((response) => {
        
                this.props.dispatch(removeFile(id));
                this.props.dispatch(resetMoverID());
                this.props.dispatch(addMoveFolderTreeID(id, {_id: id, parent}))
                this.props.dispatch(startResetCache());
    
            })
        
        } else {

            const url = this.props.isGoogle ? `/folder-service-google/move` : `/folder-service/move`;

            axios.patch(url, data).then((response) => {
           
                this.props.dispatch(removeFolder(id));
                this.props.dispatch(resetMoverID());
                this.props.dispatch(addMoveFolderTreeID(id, {_id: id, parent}))
                this.props.dispatch(startResetCache());
    
            })

        }

        
    }

    getButtonName = () => {


        if (this.state.selected !== "") {
    
            return "Move To Folder";

        } else if (this.state.historyList.length === 0) {

            return "Move To Home";
            
        } else {
            return "Move Here";
        }
    }

    search = (e) => {

        e.preventDefault();

        const searchValue = this.state.search;
   
        const id = this.props.isGoogle ? "root" : "/"

        const url = this.props.isGoogle ? 
        `/folder-service-google/list?search=${searchValue}&sortBy=DEFAULT}` 
        : this.props.isPersonal ? `/folder-service/list?parent=${id}&search=${searchValue}&itemType=personal&sortBy=DEFAULT` 
        : `/folder-service/list?parent=${id}&search=${searchValue}&itemType=nonpersonal&sortBy=DEFAULT`;

        axios.get(url).then((response) => {
           
            let folders = response.data;

            if (!this.props.isFile) folders = folders.filter((folder) => 
                folder._id !== this.props.ID);

            this.setState(() => ({
                ...this.state,
                title: "Search",
                folders,
                selected: "",
                historyList:[]
            }))
        })
    }

    inputChange = (e) => {

        const value = e.target.value;

        this.setState(() => ({
            ...this.state, 
            search: value
        }))
    }

    goHome = () => {

        const id = this.props.isGoogle ? "root" : "/"; 

        const url = this.props.isGoogle ? `/folder-service-google/list?parent=${id}` : this.props.isPersonal ? `/folder-service/list?parent=${id}&itemType=personal` : `/folder-service/list?parent=${id}&itemType=nonpersonal`;

        axios.get(url).then((response) => {
               
            let folders = response.data;

            if (!this.props.isFile) folders = folders.filter((folder) => 
                folder._id !== this.props.ID);

            this.setState(() => ({
                ...this.state,
                folders,
                title: "Home",
                search: "",
                selected: "",
                historyList: []
            }))

        }).catch((err) => {
            console.log(err);
        })
    }

    goBack = () => {

        let currentID = this.props.isGoogle ? "root" : "/";
        let currentName = "Home"
        let historyList = [];

        if (this.state.historyList.length > 1) {

            historyList = this.state.historyList;
            historyList.pop();
            
            currentID = this.state.historyList[this.state.historyList.length - 1].id;
            currentName = this.state.historyList[this.state.historyList.length - 1].name;

        } else if (this.state.historyList.length !== 0) {

            historyList = this.state.historyList;
            historyList.pop();
        }

        const url = this.props.isGoogle ? `/folder-service-google/list?parent=${currentID}` : this.props.isPersonal ? `/folder-service/list?parent=${currentID}&itemType=personal` : `/folder-service/list?parent=${currentID}&itemType=nonpersonal`;

        axios.get(url).then((response) => {
           
            let folders = response.data;

            if (!this.props.isFile) folders = folders.filter((folder) => 
                folder._id !== this.props.ID);

            this.setState(() => ({
                ...this.state,
                folders,
                title: currentName,
                search: "",
                selected: "",
                historyList
            }))
        })
    }

    closeMover = () => {

        this.props.dispatch(resetMoverID());
    }

    folderClick = (id, name) => {

        const date = new Date();
        const currentTime = date.getTime();
        const lastTimeDifference = currentTime - this.state.lastClick;

        if (lastTimeDifference < 1500 && id === this.state.selected) {
    
            const url = this.props.isGoogle ? `/folder-service-google/list?parent=${id}` : this.props.isPersonal ? `/folder-service/list?parent=${id}&itemType=personal` : `/folder-service/list?parent=${id}&itemType=nonpersonal`;

            axios.get(url).then((response) => {
               
                let folders = response.data;

                if (!this.props.isFile) folders = folders.filter((folder) => 
                folder._id !== this.props.ID);

                const historyList = this.state.historyList;
                historyList.push({id, name});
                this.setState(() => ({
                    ...this.state,
                    folders,
                    title: name,
                    search: "",
                    selected: "",
                    historyList
                }))

            }).catch((err) => {
                console.log(err);
            })
           
        } else {
         
            this.setState(() => ({
                ...this.state,
                selected: id,
                lastClick: currentTime,
            }))
        }
    }

    componentDidMount = () => {

        const id = this.props.isGoogle ? "root" : "/"

        const url = this.props.isGoogle ? `/folder-service-google/list?parent=${id}` : this.props.isPersonal ? `/folder-service/list?parent=${id}&itemType=personal` : `/folder-service/list?parent=${id}&itemType=nonpersonal`;

        axios.get(url).then((response) => {
           
            let folders = response.data;

            if (!this.props.isFile) folders = folders.filter((folder) => 
                folder._id !== this.props.ID);

            this.setState(() => ({
                ...this.state,
                folders
            }))
            
        }).catch((err) => {
            console.log(err);
        })
    }

    render() {

        return <MoverMenu 
                closeMover={this.closeMover}
                folderClick={this.folderClick}
                goBack={this.goBack}
                goHome={this.goHome}
                inputChange={this.inputChange}
                search={this.search}
                getButtonName={this.getButtonName}
                moveItem={this.moveItem}
                state={this.state}/>
    }

}

const connectStateToProps = (state) => ({
    ID: state.mover.id,
    parent: state.mover.parent,
    isFile: state.mover.isFile,
    isGoogle: state.mover.isGoogle,
    isPersonal: state.mover.isPersonal
})

export default connect(connectStateToProps)(MoverMenuContainer);