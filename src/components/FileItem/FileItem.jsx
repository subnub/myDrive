import capitalize from "../../utils/capitalize";
import moment from "moment";
import React from "react"
import NewContextMenu from "../NewContextMenu";
import mobilecheck from "../../utils/mobileCheck";

const FileItem = (props) => {

    if (props.state.movingMode) {

        return (
            <tr className={"moving__file"} onClick={() => {props.fileClick(props._id, props)}}
            onContextMenu={(e) => props.getContextMenu(e)}
            onTouchStart={props.onTouchStart}
            onTouchEnd={props.onTouchEnd}
            onTouchMove={props.onTouchMove}>
               <td>
					<div class="inner__moving">
						<div class="moving__info">
							<p>Moving 4 items…</p>
							<span>2 minutes remaining</span>
							<div class="progress__moving">
								<div class="active__progress" style={{width:"20%", marginLeft: `${props.state.movingPercentage}%`}}></div>
						    </div>
						</div>
					<div class="cancel__moving">
						<a href="#"><img src="/assets/cancelmove.svg" alt="cancelmode"/></a>
					</div>
				    </div>
				</td>
				<td></td>
				<td></td>
				<td></td>
            </tr>
        )
    } else if (props.listView) {

        const extensionImageResults = props.getExtensionImage();

        return (
            <tr className={props.state.editNameMode ? "editable__row"  :  props._id !== props.selected ? "" : "active__recent"} onClick={props.startFileClick}
            onContextMenu={props.selectContext}
            onTouchStart={props.onTouchStart}
            onTouchEnd={props.onTouchEnd}
            onTouchMove={props.onTouchMove}>
                {/* <NewContextMenu parent={props.metadata.parent} contextSelected={props.state.contextSelected} closeContext={props.closeContext} downloadFile={props.downloadFile} file={props} changeEditNameMode={props.changeEditNameMode} closeEditNameMode={props.closeEditNameMode} changeDeleteMode={props.changeDeleteMode} startMovingFile={props.startMovingFile}/> */}
               <td class="name__row">
					<div class="inner__name--row">
						<span class="extension__wrap noSelect">
                            {extensionImageResults.passed ? <img src={extensionImageResults.ext} alt="accessimage"/> 
                            :
                            <div className="no-extension__wrapper" style={{background: extensionImageResults.color}}>
                                <span className="no-extension__title">
                                    {extensionImageResults.ext}
                                </span>
                            </div>
                            }
                        </span>
                        <p className="name__row-filename noSelect">{props.state.editNameMode ? "" : capitalize(props.filename)}</p>
                        
                        {props.state.editNameMode ? 
                        <div onClick={props.clickStopPropagation} class='edit__name'>
                            <input type='text' value={props.state.editName} onChange={props.changeEditName}/>
                            <a onClick={props.saveNameEdit} class='edit__save'>SAVE</a>
                        </div> : undefined
                        }
					</div>
				</td>
				<td class="location__row noSelect">{props.metadata.drive ? "Google Drive" : props.metadata.personalFile ? "Amazon S3" : "myDrive"}</td>
                <td class="modified__row noSelect">{moment(props.uploadDate).format("L")}</td>
				<td class="settings__row noSelect">
				    <div class="settings__wrap">
                        <div>
                            <NewContextMenu parent={props.metadata.parent} contextSelected={props.state.contextSelected} closeContext={props.closeContext} downloadFile={props.downloadFile} file={props} changeEditNameMode={props.changeEditNameMode} closeEditNameMode={props.closeEditNameMode} changeDeleteMode={props.changeDeleteMode} startMovingFile={props.startMovingFile}/>
                        </div>
                        {/* <NewContextMenu parent={props.metadata.parent} contextSelected={props.state.contextSelected} closeContext={props.closeContext} downloadFile={props.downloadFile} file={props} changeEditNameMode={props.changeEditNameMode} closeEditNameMode={props.closeEditNameMode} changeDeleteMode={props.changeDeleteMode} startMovingFile={props.startMovingFile}/> */}
					    <a onClick={props.selectContext}><i class="fas fa-ellipsis-h"></i></a>
					</div>
                    
                    {props.state.deleteMode ? 
                    <div onClick={props.clickStopPropagation } class='delete__wrap'>
                        <p>Are you sure you want to delete this?</p>
                        <div class='delete__buttons'>
                            <a onClick={props.startDeleteFile} class='delete__button'>Delete</a>
                            <a onClick={props.removeDeleteMode} class='keep__button'>Keep File</a>
                        </div>
                    </div>  : undefined}
				</td> 
            </tr>
        )
    } else {

        return (<div className={props._id !== props.selected ? "elem__access noSelect" : "elem__access active__recent noSelect"} 
                onClick={() => {props.fileClick(props._id, props)}}
                onContextMenu={props.selectContext}
                onTouchStart={props.onTouchStart}
                onTouchEnd={props.onTouchEnd}
                onTouchMove={props.onTouchMove}
        >
                <div className="context__menu--wrapper" onClick={props.clickStopPropagation}>
                    <NewContextMenu gridMode={true} quickItemMode={true} contextSelected={props.state.contextSelected} closeContext={props.closeContext} downloadFile={props.downloadFile} file={props} changeEditNameMode={props.changeEditNameMode} closeEditNameMode={props.closeEditNameMode} changeDeleteMode={props.changeDeleteMode} startMovingFile={props.startMovingFile}/>
                </div>
                <div class="access__image noSelect">
                <img class={props.state.imageClassname} src={props.state.imageSrc} onError={props.thumbnailOnError} />
                </div>
                <div class="access__info--file">
                <p className="noSelect" style={props._id !== props.selected ? {} : {color:"white"}}>{capitalize(props.filename)}</p>
                <span className="noSelect" style={props._id !== props.selected ? {} : {color:"white"}}>{moment(props.uploadDate).format("L")}</span>
            </div>
            </div>)
    }
}

export default FileItem;
