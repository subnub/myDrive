import PhotoViewer from "./PhotoViewer";
import {connect} from "react-redux";
import env from "../../enviroment/envFrontEnd";
import React from "react";
import {resetPhotoID} from "../../actions/photoViewer";
import axios from "../../axiosInterceptor";

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
            responseType: 'arraybuffer'
        }; 
        
        const url = this.props.isGoogle ? `/file-service-google/full-thumbnail/${this.props.photoID}` 
        : !this.props.isPersonal ? `/file-service/full-thumbnail/${this.props.photoID}` : `/file-service-personal/full-thumbnail/${this.props.photoID}`;

        axios.get(url, config).then((response) => {

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
    photoID: state.photoViewer.id,
    isGoogle: state.photoViewer.isGoogle,
    isPersonal: state.photoViewer.isPersonal,
})

export default connect(connectStateToProp)(PhotoViewerContainer);