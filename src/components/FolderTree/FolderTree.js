import React from "react";
import env from "../../enviroment/envFrontEnd";
import FolderTreeStorage from ".././FolderTreeStorage"

const FolderTree = (props) => (

    <div className="folder-tree__main">
        <div className={props.state.showFolderTreeScrollBars ? "folder-tree__box" : "folder-tree__box-hide-scroll-bars"}>

            {(env.activeSubscription || !env.commercialMode) ? <FolderTreeStorage type={"mongo"}/> : undefined}
            {env.s3Enabled ? <FolderTreeStorage type={"s3"}/> : undefined}
            {env.googleDriveEnabled ? <FolderTreeStorage type={"drive"}/> : undefined}
        </div>
    </div>

    // <div class="folder__structure" style={{overflow:"unset", maxHeight:"unset", maxWidth:"unset"}}>
    //     {(env.activeSubscription || !env.commercialMode) ? <FolderTreeStorage type={"mongo"}/> : undefined}
    //     {env.s3Enabled ? <FolderTreeStorage type={"s3"}/> : undefined}
    //     {env.googleDriveEnabled ? <FolderTreeStorage type={"drive"}/> : undefined}
    // </div>
)

export default FolderTree;