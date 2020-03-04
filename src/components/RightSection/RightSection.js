import RightSectionDetail from ".././RightSectionDetail"
import capitalize from "../../utils/capitalize";
import bytes from "bytes";
import moment from "moment";
import React from "react";

const RightSection = (props) => {

    props.resetState();

    props.prevID = props.selectedItem.id;

    return (

        <div className={props.getSidebarClassName(props.showSideBar)}>
            
            {props.selectedItem.name === "" ? 
            (
            <div className="section__none--wrapper">
                <img className="section__image" src="/images/edit.svg"/>   
                <h3 className="section__title">Select a file or folder to view its details</h3>             
            </div>
            )
            :
            (
            <div className="section-detail-wrapper">
                <div className="section__title-wrapper">
                    <h2 className={props.selected === "" ? "section__title-text section__title-text--gone" : "section__title-text"} >{capitalize(props.selectedItem.name)}</h2>
                    <img className={props.selected === "" ? "section__title-image section__title-image--gone" : "section__title-image"} src="/images/close_icon.png" onClick={props.resetSelected}/>
                </div>
    
                <div className="section-detail__block">
                    {props.selectedItem.file ? (<RightSectionDetail title="Type" body={props.getFileExtension(props.selectedItem.name)}/>) : (<RightSectionDetail title="Type" body="Folder"/>)}
                    {props.selectedItem.file ? (<RightSectionDetail first={false} title="Size" body={bytes(props.selectedItem.size)}/>) : undefined}
                    <RightSectionDetail first={false} title="Created" body={moment(props.selectedItem.date).format("L")}/>
                    <RightSectionDetail first={false} title="Location" body={props.selectedItem.location} />
                    {props.selectedItem.isVideo ? 
                        <RightSectionDetail first={false} title="Optimized" body={(props.selectedItem.transcoded || props.state.optimizing_finished) ? "True" : "False"} /> :
                        undefined}
                    
                    {props.selectedItem.link ? 
                        props.getPublicStatus()
                        : undefined}
                        
                    {props.getTranscodeButton(props)}
                
                </div>
            </div>
            )}        
                            
        </div>
    )

}


export default RightSection;