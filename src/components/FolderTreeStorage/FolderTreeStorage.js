import React from "react";
import FolderTreeStorageSub from ".././FolderTreeStorageSub";

const FolderTreeStorage = (props) => (

    <div className="folder-tree__storage">
                <div className="folder-tree__storage__box">
                    <div className="folder-tree__storage__image-div">
                        <img onClick={props.arrowClick} className="folder-tree__storage__image" src={(props.state.open && props.state.folders.length !== 0) ? "/images/menu-down.svg" : "/images/menu-right.svg"}/>
                    </div>
                    <div className="folder-tree__storage__text-div">
                        <p className="folder-tree__storage__text">{props.type === "drive" ? "Google Drive" : props.type === "mongo" ? "myDrive" : "Amazon S3"}</p>
                    </div>
                </div>

                <div className="folder-tree__storage-subview">
                    <div className="folder-tree__storage-subview-box">
                        {(props.state.open && props.state.folders.length !== 0)  ? props.state.folders.map((folder) => {
                            return <FolderTreeStorageSub folder={folder} type={props.type}/>
                        }) : undefined}
                    </div>
                </div>
    </div>
                        //return

    // <div class="elem__structure root__element">
    //     <div class={props.state.open ? "parent__structure active__parent" : "parent__structure"}>
    //         <span onClick={props.arrowClick}><img src="/assets/arrowstructure.svg" alt="arrowstructure"/></span>
    //         <div class="info__name">
    //             <p>{props.type === "drive" ? "Google Drive" : props.type === "mongo" ? "myDrive" : "Amazon S3"}</p>
    //         </div>
    //     </div>
    //     {(props.state.open && props.state.folders.length !== 0)  ? props.state.folders.map((folder) => {
    //         return <FolderTreeStorageSub key={folder._id} folder={folder} type={props.type}/>
    //     }) : undefined}
    // </div>
) 

export default FolderTreeStorage;