import QuickAccessItem from "./QuickAccessItem"
import {setRightSelected, setLastSelected, setSelected} from "../../actions/selectedItem"
import mobileCheck from "../../utils/mobileCheck"
import env from "../../enviroment/envFrontEnd";
import axios from "axios";
import {connect} from "react-redux";
import React from "react";

const currentURL = env.url;

class QuickAccessItemContainer extends React.Component {

    constructor(props) {
        super(props);

        this.failedToLoad = false;

        this.state = {
            contextMenuPos: {},
            image: "/images/file-svg.svg",
            imageClassname: "quickaccess__item__image"
        }
    }

    componentDidMount = () => {

        const hasThumbnail = this.props.metadata.hasThumbnail;

        if (hasThumbnail && !this.failedToLoad) {
            this.getThumbnail();
        }
    }

    getThumbnail = async() => {

        const thumbnailID = this.props.metadata.thumbnailID;
        const imageClassname = "quickaccess__item__image quickaccess__item__image--no-opacity"

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")},
            responseType: 'arraybuffer'
        };

        await this.setState(() => ({
            ...this.state,
            iimage: "/images/file-svg.svg",
            imageClassname: "quickaccess__item__image"
        }))
    
        axios.get(currentURL +`/file-service/thumbnail/${thumbnailID}`, config).then((results) => {
     
            const imgFile = new Blob([results.data]);
            const imgUrl = URL.createObjectURL(imgFile);
           
            this.setState(() => ({
                ...this.state,
                image: imgUrl,
                imageClassname: imageClassname
            }))
            
        }).catch((err) => {
            console.log(err)
        })
    }
    getContextMenu = (e) => {

        e.preventDefault();

        const isMobile = mobileCheck()
    
        const windowX = window.innerWidth;
        const windowY = window.innerHeight;

        let styleObj = {right:0, left:0, top: "-3px", bottom: 0}

        const clientY =  e.nativeEvent.clientY;
        const clientX = e.nativeEvent.clientX;

        if (clientX > windowX / 2) {

            styleObj = {...styleObj, left:"unset", right:0}

        } else {
         
            styleObj = {...styleObj, left:0, right:"unset"}
        }

        if (isMobile) {

            styleObj = {bottom: 0, left: "2px"}
        }

        this.setState(() => ({
            ...this.state,
            contextMenuPos: styleObj
        }))

        this.props.dispatch(setSelected("quick-"+this.props._id))
        this.props.dispatch(setRightSelected("quick-"+this.props._id))
        this.props.dispatch(setLastSelected(0));
    }



    render() {

        return <QuickAccessItem 
                getContextMenu={this.getContextMenu} 
                state={this.state} 
                {...this.props}/>
    }

}

const connectStateToProp = (state) => ({
    rightSelected: state.selectedItem.rightSelected,
    selected: state.selectedItem.selected
})

export default connect(connectStateToProp)(QuickAccessItemContainer);

