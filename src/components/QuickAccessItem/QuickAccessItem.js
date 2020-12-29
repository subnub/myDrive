import capitalize from "../../utils/capitalize";
import moment from "moment";
import React from "react";
import NewContextMenu from "../NewContextMenu";

const QuickAccessItem = (props) => (

    <div className={"quick-"+props._id !== props.selected ? "elem__access noSelect" : "elem__access active__recent noSelect"} onClick={() => {props.fileClick(props._id, props, true)}}
    onContextMenu={props.selectContext}
    onTouchStart={props.onTouchStart}
    onTouchEnd={props.onTouchEnd}
    onTouchMove={props.onTouchMove}
    >
      <div className="context__menu--wrapper" onClick={props.clickStopPropagation}>
                    <NewContextMenu gridMode={true} quickItemMode={true} contextSelected={props.state.contextSelected} closeContext={props.closeContext} downloadFile={props.downloadFile} file={props} changeEditNameMode={props.changeEditNameMode} closeEditNameMode={props.closeEditNameMode} changeDeleteMode={props.changeDeleteMode} startMovingFile={props.startMovingFile}/>
                </div>
	    <div class="access__image">
			<img className={props.state.imageClassname} src={props.state.image} onError={props.thumbnailOnError}/>
        </div>
        <div class="access__info--file">
			<p className="noSelect" style={"quick-"+props._id !== props.selected ? {} : {color:"white"}}>{capitalize(props.filename)}</p>
			<span className="noSelect" style={"quick-"+props._id !== props.selected ? {} : {color:"white"}}>Created {moment(props.uploadDate).calendar()}</span>
		</div>
    </div>
)

export default QuickAccessItem

