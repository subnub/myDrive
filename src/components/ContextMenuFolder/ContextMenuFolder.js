import ContextItemFolder from "../ContextItemFolder";
import React from "react";

const ContextMenuFolder = React.forwardRef((props, ref) => (

    <div className="context-menu" ref={ref} style={props.style}>
        <ContextItemFolder _id={props._id} title="Rename" image="/images/rename.svg" parentList={props.parentList} name={props.name}/>
        <ContextItemFolder title="Delete" image="/images/trash.svg" _id={props._id} parentList={props.parentList}/>
        <ContextItemFolder title="Move" image="/images/move.svg" _id={props._id} parent={props.parent} isFile={false}/>
    </div>
))

export default ContextMenuFolder;

