import ContextItem from "../ContextItem";
import React from "react";

const ContextMenu = React.forwardRef((props, ref) => (

    <div className="context-menu" ref={ref} style={props.style}>
                
        <ContextItem _id={props._id} title="Rename" image="/images/rename.svg" filename={props.filename} />
        <ContextItem title="Share" image="/images/share.svg" _id={props._id} file={props} />
        <ContextItem downloadFile={props.downloadFile} title="Download" image="/images/download.svg" _id={props._id}/>
        {props.quickFile ? undefined :
            <ContextItem title="Move" image="/images/move.svg" _id={props._id} parent={props.metadata.parent} isFile={true}/>
        }
        <ContextItem title="Delete" image="/images/trash.svg" _id={props._id}/>

    </div>
))

export default ContextMenu

