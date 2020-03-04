import React from "react";
import {connect} from "react-redux";
import MoverMenu from "./MoverMenu";
import axios from "axios";
import env from "../../enviroment/envFrontEnd";
import {resetMoverID} from "../../actions/mover";
import {removeFile} from "../../actions/files";
import {removeFolder} from "../../actions/folders"

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

        let parent = "/";

        if (this.state.selected !== "") {
    
            parent = this.state.selected;

        } else if (this.state.historyList.length !== 0) {

            parent = this.state.historyList[this.state.historyList.length - 1].id;
        }

        
        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        }

        const data = {
            id, 
            parent
        }

        if (this.props.isFile) {

            axios.patch(currentURL+`/file-service/move`, data, config).then((response) => {
          
                console.log("file moved!");
    
                this.props.dispatch(removeFile(id));
                this.props.dispatch(resetMoverID());
    
            })
        
        } else {

            axios.patch(currentURL+`/folder-service/move`, data, config).then((response) => {
          
                console.log("folder moved!");
                
                this.props.dispatch(removeFolder(id));
                this.props.dispatch(resetMoverID());
              
    
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
   
        const id = "/"

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        }

        axios.get(currentURL+`/folder-service/list?parent=${id}&search=${searchValue}&sortBy=DEFAULT}`, config).then((response) => {
           
            let folders = response.data;

            if (!this.props.isFile) folders = folders.filter((folder) => 
                folder._id !== this.props.ID);

            console.log("folders", folders);
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

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        }

        const id = "/"
     
        axios.get(currentURL+`/folder-service/list?parent=${id}`, config).then((response) => {
               
            let folders = response.data;

            if (!this.props.isFile) folders = folders.filter((folder) => 
                folder._id !== this.props.ID);

            console.log("folders", folders);
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

        let currentID = "/"
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

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        }

        axios.get(currentURL+`/folder-service/list?parent=${currentID}`, config).then((response) => {
           
            let folders = response.data;

            if (!this.props.isFile) folders = folders.filter((folder) => 
                folder._id !== this.props.ID);

            console.log("folders", folders);
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

            const config = {
                headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
            }
    
            axios.get(currentURL+`/folder-service/list?parent=${id}`, config).then((response) => {
               
                let folders = response.data;

                if (!this.props.isFile) folders = folders.filter((folder) => 
                folder._id !== this.props.ID);

                const historyList = this.state.historyList;
                historyList.push({id, name});
                console.log("folders", folders);
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

        console.log("Mover Mounted", this.props.ID, this.props.parent)

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        }

        const id = "/"

        axios.get(currentURL+`/folder-service/list?parent=${id}`, config).then((response) => {
           
            let folders = response.data;

            if (!this.props.isFile) folders = folders.filter((folder) => 
                folder._id !== this.props.ID);

            console.log("folders", folders);
            
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
    isFile: state.mover.isFile
})

export default connect(connectStateToProps)(MoverMenuContainer);