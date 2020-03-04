import PopupWindow from "./PopupWindow";
import {hidePopup} from "../../actions/popupFile"
import axios from "axios";
import env from "../../enviroment/envFrontEnd";
import {connect} from "react-redux";
import React from "react";
import { setPhotoID } from "../../actions/photoViewer";

const currentURL = env.url;

class PopupWindowContainer extends React.Component {

    constructor(props) {
        super(props);

        this.wrapperRef = React.createRef();
        this.video = React.createRef();
        this.imageData = ""
        this.tempToken = ""

        this.state = {
            image: "/images/cloud-svg.svg",
            imageClassname: this.props.popupFile.metadata.hasThumbnail ? "popup-window__image popup-window popup-window--gone" : "popup-window__image",
            video: "",
            spinnerClassname: "popup-window__spinner__wrapper"
        }
    }

    getThumbnail = () => {

        const thumbnailID = this.props.popupFile.metadata.thumbnailID
       
        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")},
            responseType: 'arraybuffer'
        };

        axios.get(currentURL +`/file-service/thumbnail/${thumbnailID}`, config).then((results) => {

           const imgFile = new Blob([results.data]);
           const imgUrl = URL.createObjectURL(imgFile);

           this.setState(() => ({
               ...this.state,
               image: imgUrl,
               imageClassname: "popup-window__image popup-window__image--loaded",
               spinnerClassname: "popup-window__spinner__wrapper popup-window--gone"

           }))

        }).catch((err) => {
            console.log(err)
        })
    }

    handleClickOutside = (e) => {

        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
            this.props.dispatch(hidePopup())
        }
    }

    getVideo = () => {

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token"),
            uuid: window.sessionStorage.getItem("uuid")
        },
            
        };    

        axios.get(currentURL +'/file-service/download/get-token-video',config)
        .then((response) => {
            
            this.tempToken =  response.data.tempToken;

            const uuidID = window.sessionStorage.getItem("uuid");

            const finalUrl = !this.props.popupFile.metadata.transcoded ? currentURL + `/file-service/stream-video/${this.props.popupFile._id}/${this.tempToken}/${uuidID}` 
            : currentURL + `/file-service/stream-video-transcoded/${this.props.popupFile._id}/${this.tempToken}/${uuidID}`

            this.setState(() => ({
                ...this.state,
                video: finalUrl
            }))

        }).catch((err) => {
            console.log(err)
        })
    }

    componentWillUnmount = () => {

        document.removeEventListener('mousedown', this.handleClickOutside);   

        const headers = {'Authorization': "Bearer " + window.localStorage.getItem("token")}
      
        if (this.props.popupFile.metadata.isVideo) {

            axios.delete(currentURL +`/file-service/remove/token-video/${this.tempToken}`, {
                headers,
            }).catch((err) => {
                console.log(err);
            })

            this.video.current.pause();
        
            this.setState(() => ({
                ...this.state,
                video: ""
            }))
        }
    }

    componentDidMount = () => {

        document.addEventListener('mousedown', this.handleClickOutside);
        
        if (this.props.popupFile.metadata.hasThumbnail) {

            this.getThumbnail()

        } else if (this.props.popupFile.metadata.isVideo) {

            this.getVideo();
        }
    }

    hidePopupWindow = () => {

        this.props.dispatch(hidePopup());
    }

    setPhotoViewerWindow = () => {

        console.log("set photoviewer window", this.props.popupFile._id);
        this.props.dispatch(setPhotoID(this.props.popupFile._id))
    }

    render() {

        return <PopupWindow 
                wrapperRef={this.wrapperRef}
                video={this.video}
                hidePopupWindow={this.hidePopupWindow}
                state={this.state}
                setPhotoViewerWindow={this.setPhotoViewerWindow}
                {...this.props}
                />
    }

}

const connectPropToState = (state) => ({
  
    popupFile: state.popupFile,
})


export default connect(connectPropToState)(PopupWindowContainer)
