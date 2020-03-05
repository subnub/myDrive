import RightSection from "./RightSection";
import RightSectionDetail from ".././RightSectionDetail"
import {editFileMetadata} from "../../actions/files"
import {resetSelectedItem} from "../../actions/selectedItem";
import env from "../../enviroment/envFrontEnd";
import axios from "axios";
import {connect} from "react-redux";
import React from "react";

const currentURL = env.url;

class RightSectionContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            optimizing: false,
            optimizing_finished: false,
            optimizing_removed: false
        }

        this.prevID = ""
    }

    getFileExtension = (filename) => {

        const filenameSplit = filename.split(".");

        if (filenameSplit.length > 1) {
            
            const extension = filenameSplit[filenameSplit.length - 1]

            return extension.toUpperCase();

        } else {

            return "Unknown"
        }

        
    }

    getSidebarClassName = (value) => {

        if (value==="gone") {
            return "section section--right section--no-animation"
        } else if (value) {
            return "section section--right"
        } else {
            return "section section--right section--minimized"
        }
    }

    removeTranscodeVideo = (props, e) => {

        const headers = {'Authorization': "Bearer " + window.localStorage.getItem("token")}

        const data = {id: props.selectedItem.id}

        axios.delete(currentURL +'/file-service/transcode-video/remove', {
            headers,
            data
        }).then(() => {
            
            this.props.dispatch(editFileMetadata(props.selectedItem.id, {transcoded: undefined}))

            this.setState(() => ({
                ...this.state,
                optimizing: false, 
                optimizing_finished: false,
                optimizing_removed: true
            }))

        }).catch((err) => {
            console.log(err)
        })
    }

    transcodeVideo = (props, e) => {

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")},
            file: {_id: props.selectedItem.id}
        };    

        const data = {file: {_id: props.selectedItem.id}}

        this.setState(() => ({
            ...this.state,
            optimizing: true
        }))
    

        axios.post(currentURL +'/file-service/transcode-video', data,config)
        .then((response) => {
            
            const data = response.data;

            if (data === "Finished") {

                this.props.dispatch(editFileMetadata(props.selectedItem.id, {isVideo: true, transcoded: true}))

                this.setState(() => ({
                    ...this.state,
                    optimizing: false, 
                    optimizing_finished: true,
                    optimizing_removed: false
                }))
            }

        }).catch((err) => {
            console.log(err)
        })
    }

    getTranscodeButton = (props) => {

        if (!props.selectedItem.isVideo || !env.enableVideoTranscoding) {
            return undefined;
        }

        if (this.state.optimizing && !this.state.optimizing_finished) {
            return (<div>
                <button disabled className="button--small button--small--disabled">Optimizing</button>
                </div>)

        } else if ((props.selectedItem.transcoded || this.state.optimizing_finished) && !this.state.optimizing_removed) {
            return (<div>
                <button onClick={(e) => this.removeTranscodeVideo(props, e)} className="button--small">Unoptimize Video</button>
                </div>)
        } else {
            return (<div>
                <button onClick={(e) => this.transcodeVideo(props, e)} className="button--small">Optimize Video</button>
                </div>)
        }
    }

    getPublicStatus = () => {

        if (this.props.selectedItem.linkType === "one") {

            return <RightSectionDetail first={false} title="One Time Link" body="True"/> 

        } else {

            return <RightSectionDetail first={false} title="Public" body="True"/> 
        }
    }

    resetState = () => {

        if (this.prevID !== "" && this.prevID !== this.props.selectedItem.id) {

            this.setState(() => ({
                ...this.state,
                optimizing: false, 
                optimizing_finished: false
            }))
        }
    }

    resetSelected = () => {

        this.props.dispatch(resetSelectedItem());
    }

    render() {

        return <RightSection 
                getPublicStatus={this.getPublicStatus}
                getTranscodeButton={this.getTranscodeButton}
                getFileExtension={this.getFileExtension}
                getSidebarClassName={this.getSidebarClassName}
                resetState={this.resetState}
                resetSelected={this.resetSelected}
                state={this.state}
                {...this.props}
                 />
    }
}

const connectPropToState = (state) => ({
    selectedItem: state.selectedItem,
    showSideBar: state.main.showSideBar,
    selected: state.main.selected
})

export default connect(connectPropToState)(RightSectionContainer)