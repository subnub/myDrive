import ContextMenu from "../ContextMenu";
import capitalize from "../../utils/capitalize";
import bytes from "bytes";
import moment from "moment";
import React from "react"


const FileItem = (props) => {

    const wrapperClassname = props.getWrapperClassname()

    return (
            <div className={wrapperClassname}>
                    
                {props.listView ? 
                    
                    <div className={props._id !== props.selected ? "file__item__listview" : "file__item__listview file__item--selected"} 
                        onClick={() => {props.fileClick(props._id, props)}}
                        onContextMenu={(e) => props.getContextMenu(e)}>
                            
                            <div className="file__item__listview__title__wrapper">
                                <img className={props.state.imageClassname} src={props.state.imageSrc} onError={() => {props.image.src = "/images/file-svg.svg"; props.image.className="file__image__listview"; props.failedToLoad = true}}/>
                                <h5 className={props._id !== props.selected ? "file__title__listview file__title__listview--no-max" : "file__title__listview file__title__listview--no-max file__title--selected"}>{capitalize(props.filename)}</h5>
                            </div>
                            <h5 className={props._id !== props.selected ? "file__title__listview file__title__listview--no-margin" : "file__title__listview file__title__listview--no-margin file__title--selected"}>{bytes(props.length)}</h5>
                            <h5 className={props._id !== props.selected ? "file__title__listview" : "file__title__listview file__title--selected"}>{moment(props.uploadDate).format("L")}</h5>
        
                            {(props.rightSelected === props._id && props._id === props.selected) ? 
                            
                                <ContextMenu style={props.state} {...props} quickFile={false} downloadFile={props.downloadFile}/>
                            : 
                                 undefined}
        
                    </div>
        
                    : 
        
                    <div className="file__item__wrapper"
                        onClick={() => {props.fileClick(props._id, props)}}
                        onContextMenu={(e) => props.getContextMenu(e)}>
        
                        <div className="file__image__wrapper">
                            <img className={props.state.imageClassname} src={props.state.imageSrc} onError={() => {props.image.src = "/images/file-svg.svg"; props.image.className="file__image"; props.failedToLoad = true;}}/>
                        </div>
                            
                        <h5 className={props._id !== props.selected ? "file__title" : "file__title file__title--selected"}>{capitalize(props.filename)}</h5>
        
                        {(props.rightSelected === props._id && props._id === props.selected) ? 
                            
                                <ContextMenu style={props.state.contextMenuPos} {...props} quickFile={false} downloadFile={props.downloadFile}/>
                            : 
                                 undefined}
                            
        
                        </div>
                    
                    } 
                    
            </div>
            )

}

export default FileItem;
