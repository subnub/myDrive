import ContextMenu from ".././ContextMenu"
import capitalize from "../../utils/capitalize";
import moment from "moment";
import React from "react";

const QuickAccessItem = (props) => (

    <div className={"quick-"+props._id !== props.selected ? "quickaccess__item" : "quickaccess__item file__item--selected"} onClick={() => {props.fileClick(props._id, props, true)}} 
    onContextMenu={(e) => props.getContextMenu(e)}>

        <div className="quickaccess__item__image__wrapper">
        <img className={props.state.imageClassname} src={props.state.image} onError={() => {props.image.src = "/images/file-svg.svg"; props.image.className="quickaccess__item__image"; props.failedToLoad = true}}/>

        </div>
        
        <div className="quickaccess__item__title__wrapper">
            <h3 className={"quick-"+props._id !== props.selected ? "quickaccess__item__title" : "quickaccess__item__title file__title--selected"}>{capitalize(props.filename)}</h3>
            <h4 className={"quick-"+props._id !== props.selected ? "quickaccess__item__subtitle" : "quickaccess__item__subtitle file__title--selected"}>Created {moment(props.uploadDate).calendar()}</h4>
        </div>

        {("quick-"+props._id === props.rightSelected) ? 
            
            <ContextMenu style={props.state.contextMenuPos} {...props} quickFile={true} downloadFile={props.downloadFile}/>
        : 
            undefined}
        
        
    
    </div>
)

export default QuickAccessItem

