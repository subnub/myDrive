import PhotoViewer from "./PhotoViewer";
import {connect} from "react-redux";
import env from "../../enviroment/envFrontEnd";
import React from "react";
import {resetPhotoID} from "../../actions/photoViewer";
import axios from "axios";

const currentURL = env.url;

class PhotoViewerContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            image: ""
        }
    }

    closePhotoViewer = () => {

        this.props.dispatch(resetPhotoID())        
    }

    componentDidMount = () => {

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")},
            responseType: 'arraybuffer'
        };    

        axios.get(currentURL +`/file-service/full-thumbnail/${this.props.photoID}`, config).then((response) => {

            const imgFile = new Blob([response.data]);
            const imgUrl = URL.createObjectURL(imgFile);

            this.setState(() => ({
                ...this.state,
                image: imgUrl
            }))
        })
    }

    render() {

        return <PhotoViewer 
                closePhotoViewer={this.closePhotoViewer}
                state={this.state}/>
    }
}

const connectStateToProp = (state) => ({
    photoID: state.photoViewer.id
})

export default connect(connectStateToProp)(PhotoViewerContainer);