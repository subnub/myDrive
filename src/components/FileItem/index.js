import FileItem from "./FileItem";
import {startSetSelectedItem, setRightSelected, setLastSelected} from "../../actions/selectedItem"
import mobileCheck from "../../utils/mobileCheck"
import env from "../../enviroment/envFrontEnd";
import axios from "axios";
import {connect} from "react-redux";
import React from "react";

const currentURL = env.url;

class FileItemContainer extends React.Component {

    constructor(props) {
        super(props);
  
        this.failedToLoad = false;

        this.state = {
            contextMenuPos: {},
            imageSrc: "/images/file-svg.svg",
            imageClassname: this.props.listView ? "file__image__listview" : "file__image"
        }
    }

    getThumbnail = async() => {

        const thumbnailID = this.props.metadata.thumbnailID;
        const imageClassname = this.props.listView ? "file__image__listview--no-opacity" : "file__image--no-opacity"

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")},
            responseType: 'arraybuffer'
        };

        await this.setState(() => ({
            ...this.state,
            imageSrc: "/images/file-svg.svg",
            imageClassname: this.props.listView ? "file__image__listview" : "file__image"
        }))
    
        axios.get(currentURL +`/file-service/thumbnail/${thumbnailID}`, config).then((results) => {

            const imgFile = new Blob([results.data]);
            const imgUrl = URL.createObjectURL(imgFile);   

            this.setState(() => ({
                ...this.state,
                imageSrc: imgUrl,
                imageClassname: imageClassname
            }))
            

        }).catch((err) => {
            console.log(err)
        })
    }

    componentDidMount = () => {

        const hasThumbnail = this.props.metadata.hasThumbnail;

        if (hasThumbnail && !this.failedToLoad) {
            this.getThumbnail();
        }
    }
    
    shouldComponentUpdate = (nextProp, nextState) => {

        return (nextProp.itemSelected !== this.props.itemSelected 
                || nextProp.listView !== this.props.listView 
                || nextProp.rightSelected !== this.props.rightSelected 
                || nextState.imageSrc !== this.state.imageSrc
                || nextState.imageClassname !== this.state.imageClassname
                || this.props.filename !== nextProp.filename
                || this.props.metadata.transcoded !== nextProp.metadata.transcoded) 
    }

   
    componentDidUpdate = (nextProp) => {

        console.log("file item component updated")

        const hasThumbnail = this.props.metadata.hasThumbnail;

        if (hasThumbnail && !this.failedToLoad && nextProp.listView !== this.props.listView) {
    
            this.getThumbnail();

        } else if (nextProp.listView !== this.props.listView) {

            this.setState(() => ({
                ...this.state,
                imageClassname: this.props.listView ? "file__image__listview" : "file__image"
            }))
        }
    }

    getContextMenu = (e) => {

        e.preventDefault();

        const isMobile = mobileCheck();
    
        const windowX = window.innerWidth;
        const windowY = window.innerHeight;

        let styleObj = {right:0, left:0, top: "-38px", bottom: 0}

        const clientY =  e.nativeEvent.clientY;
        const clientX = e.nativeEvent.clientX;

        if (clientY < (windowY / 3)) {

            styleObj = {bottom:"-190px", top:"unset"}
        } 

        if (clientY > ((windowY / 4) * 3.5)) {

            styleObj = {bottom:"unset", top: "-190px"}
        }

        if (clientX > windowX / 2) {

            styleObj = {...styleObj, left:"unset", right:0}

        } else {
         
            styleObj = {...styleObj, left:0, right:"unset"}
        }

        if (isMobile) {

            styleObj = {bottom: 0, left: "2px", top: "unset", right: "unset"}
        }

        this.setState(() => ({...this.state, contextMenuPos: styleObj}))

        this.props.dispatch(startSetSelectedItem(this.props._id, true, false))
        this.props.dispatch(setLastSelected(0));
        this.props.dispatch(setRightSelected(this.props._id))
    
    }

    getWrapperClassname = () => {

        let classname = "";

        if (this.props.listView) {

            classname += "file__item__listview"

        } else {

            classname += "file__item"
        }

        if (this.props._id === this.props.selected) {

            classname += " file__item--selected"
        }

        return classname;
    }

    render() {

        return <FileItem 
                getWrapperClassname={this.getWrapperClassname} 
                getContextMenu={this.getContextMenu} 
                state={this.state}
                {...this.props}/>
    }
}

const connectStateToProp = (state) => ({
    listView: state.filter.listView,
    rightSelected: state.selectedItem.rightSelected,
    resetSelected: state.selectedItem.resetSelected,
    selected: state.selectedItem.selected
})

export default connect(connectStateToProp)(FileItemContainer)