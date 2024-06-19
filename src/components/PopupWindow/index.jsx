import PopupWindow from "./PopupWindow";
import {hidePopup} from "../../actions/popupFile"
import axios from "../../axiosInterceptor";
import env from "../../enviroment/envFrontEnd";
import {connect} from "react-redux";
import React from "react";
import { setPhotoID } from "../../actions/photoViewer";
import axiosNonInterceptor from "axios";

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

    getFileExtension = (filename) => {

        const filenameSplit = filename.split(".");

        if (filenameSplit.length > 1) {
            
            const extension = filenameSplit[filenameSplit.length - 1]

            return extension.toUpperCase();

        } else {

            return "Unknown"
        }
    }

    getThumbnail = () => {

        if (this.getFileExtension(this.props.popupFile.filename).toLowerCase() === "svg") {
            this.props.popupFile.metadata.hasThumbnail = false;
            return this.setState(() => {
                return {
                    ...this.state,
                    image: "/images/cloud-svg.svg",
                    imageClassname: "popup-window__image"
                }
            })
        }

        const thumbnailID = this.props.popupFile.metadata.drive ? this.props.popupFile._id : this.props.popupFile.metadata.thumbnailID
       
        const config = {
            responseType: 'arraybuffer'
        };

        const isDrive = this.props.popupFile.metadata.drive;
        const isPersonal = this.props.popupFile.metadata.personalFile;

        const url = isDrive ? `/file-service-google/thumbnail/${thumbnailID}` 
        : !isPersonal ? `/file-service/thumbnail/${thumbnailID}` : `/file-service-personal/thumbnail/${thumbnailID}`;

        axios.get(url, config).then((results) => {

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

    thumbnailOnError = () => {

        this.setState(() => ({
            ...this.state,
            imageClassname: "popup-window__image",
            spinnerClassname: "popup-window__spinner__wrapper popup-window--gone",
            image: "/images/cloud-svg.svg"
        }))
    }

    handleClickOutside = (e) => {

        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
            this.props.dispatch(hidePopup())
        }
    }

    getVideo = () => {

        // const config = {
        //     headers: {
        //     uuid: window.sessionStorage.getItem("uuid")
        // }
            
        // };   

        console.log("gettings stream video token")
        
        axios.get("/file-service/download/access-token-stream-video").then(() => {

            console.log("stream video got token")

            const isDrive = this.props.popupFile.metadata.drive;
            const isPersonal = this.props.popupFile.metadata.personalFile;
    
            const finalUrl = isDrive ? 
            `/file-service-google/stream-video/${this.props.popupFile._id}` 
            : !isPersonal ? `/file-service/stream-video/${this.props.popupFile._id}` 
            : `/file-service-personal/stream-video/${this.props.popupFile._id}`
    
            this.setState(() => ({
                ...this.state,
                video: finalUrl
            }))

        }).catch((e) => {
            console.log("Stream Video Error", e.message);
        })

        // axios.get(currentURL +'/file-service/download/get-token-video',config)
        // .then((response) => {
            
        //     this.tempToken =  response.data.tempToken;

        //     const uuidID = window.sessionStorage.getItem("uuid");

        //     const isDrive = this.props.popupFile.metadata.drive;
        //     const isPersonal = this.props.popupFile.metadata.personalFile;

        //     const finalUrl = isDrive ? 
        //     currentURL + `/file-service-google/stream-video/${this.props.popupFile._id}/${this.tempToken}/${uuidID}` 
        //     : !isPersonal ? currentURL + `/file-service/stream-video/${this.props.popupFile._id}/${this.tempToken}/${uuidID}` 
        //     : currentURL + `/file-service-personal/stream-video/${this.props.popupFile._id}/${this.tempToken}/${uuidID}`

        //     this.setState(() => ({
        //         ...this.state,
        //         video: finalUrl
        //     }))

        // }).catch((err) => {
        //     console.log(err)
        // })
    }

    componentWillUnmount = () => {

        document.removeEventListener('mousedown', this.handleClickOutside);   
      
        if (this.props.popupFile.metadata.isVideo) {

            axios.delete(`/file-service/remove-stream-video-token`).then(() => {

                console.log("removed video access token");

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
        
        if (this.props.popupFile.metadata.hasThumbnail && !this.props.popupFile.metadata.isVideo && !this.props.popupFile.metadata.drive) {

            this.getThumbnail()

        } else if (this.props.popupFile.metadata.drive && this.props.popupFile.metadata.hasThumbnail && !this.props.popupFile.metadata.googleDoc && !this.props.popupFile.metadata.isVideo) {

            this.getThumbnail();

        } else if (this.props.popupFile.metadata.drive && this.props.popupFile.metadata.hasThumbnail && !this.props.popupFile.metadata.isVideo) {

            this.setState(() => ({
                ...this.state,
                imageClassname: "popup-window__image",
                spinnerClassname: "popup-window__spinner__wrapper popup-window--gone",
                image: "/images/cloud-svg.svg"
            }))

        }else if (this.props.popupFile.metadata.isVideo) {

            this.getVideo();
        }
    }

    hidePopupWindow = () => {

        this.props.dispatch(hidePopup());
    }

    setPhotoViewerWindow = () => {

        const isGoogle = this.props.popupFile.metadata.drive
        const isPersonal = this.props.popupFile.metadata.personalFile;
        this.props.dispatch(setPhotoID(this.props.popupFile._id, isGoogle, isPersonal))
    }

    render() {

        return <PopupWindow 
                wrapperRef={this.wrapperRef}
                video={this.video}
                hidePopupWindow={this.hidePopupWindow}
                state={this.state}
                setPhotoViewerWindow={this.setPhotoViewerWindow}
                thumbnailOnError={this.thumbnailOnError}
                {...this.props}
                />
    }

}

const connectPropToState = (state) => ({
  
    popupFile: state.popupFile,
})


export default connect(connectPropToState)(PopupWindowContainer)
