import DownloadPage from "./DownloadPage";
import capitalize from "../../utils/capitalize";
import env from "../../enviroment/envFrontEnd";
import axios from "axios";
import bytes from "bytes";
import React from "react";

const currentURL = env.url;

class DownloadPageContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
                error: false,
                title: "",
                type: "",
                size: "",
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

    componentDidMount = () => {

        const _id = this.props.match.params.id;
        const tempToken = this.props.match.params.tempToken

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        };

        axios.get(currentURL +`/file-service/public/info/${_id}/${tempToken}`, config).then((results) => {

           const data = results.data;

           const title = capitalize(data.filename);
           const size = bytes(data.length);
           const type = this.getFileExtension(title);

           this.setState(() => ({
               ...this.state,
                title, 
                type,
                size
           }))
            
        }).catch((err) => {
            console.log(err)
            this.setState(() => ({...this.state, error: true}))
        })
    }

    download = () => {

        const _id = this.props.match.params.id;
        const tempToken = this.props.match.params.tempToken
        const finalUrl = currentURL + `/file-service/public/download/${_id}/${tempToken}`
   
        const link = document.createElement('a');
        document.body.appendChild(link);
        link.href = finalUrl;
        link.setAttribute('type', 'hidden');
        link.click();
    }

    render() {

        return <DownloadPage state={this.state} download={this.download} {...this.props}/>
    }
}

export default DownloadPageContainer;