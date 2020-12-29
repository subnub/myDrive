import React from "react";
import NewContextMenu from "../NewContextMenu";

const FolderItem = (props) => {

    return (

        <div className={props._id !== props.selected ? "elem__folders noSelect" : "elem__folders active__folder noSelect"}
        onClick={() => props.folderClick(props._id, props)}
        onContextMenu={props.selectContext}
        onTouchStart={props.onTouchStart}
        onTouchEnd={props.onTouchEnd}
        onTouchMove={props.onTouchMove}>
            <div className="context__menu--wrapper" onClick={props.clickStopPropagation}>
                <NewContextMenu gridMode={true} folderMode={true} quickItemMode={props.parent !== "/"} contextSelected={props.state.contextSelected} closeContext={props.closeContext} downloadFile={props.downloadFile} file={props} changeEditNameMode={props.changeEditNameMode} closeEditNameMode={props.closeEditNameMode} changeDeleteMode={props.changeDeleteMode} startMovingFile={props.startMoveFolder}/>
            </div>
            <div class={props._id !== props.selected ? "folders__image" : "folders__image folder__selected"}>
                <i class="fas fa-folder" aria-hidden={true}></i>
                {/* <img class="fas fa-folder" src="/assets/foldericon.svg"/> */}
			</div>
			<div class="folder__info">
				<p>{props.name}</p>
				<ul>
				    {/* <li>16 files</li>
					<li class="spacer__folder">•</li> */}
					<li>{props.drive ? 'Google Drive' : props.personalFolder ? 'Amazon S3' : 'myDrive'}</li>
				</ul>
			</div>
        </div>
    )
}

export default FolderItem;