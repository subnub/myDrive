import FileItem from ".././FileItem"
import FolderItem from ".././FolderItem"
import Spacer from ".././Spacer";
import React from "react";

const DataForm = (props) => (

    <div>
        
        <div>
        
            {props.folders.length === 0 ? 
                    
                (undefined)
                : 
                (<div className="dataform">
                    {props.folders.map((folder) => 
                        (<FolderItem 
                            {...folder} 
                            key={folder._id} 
                            itemSelected={folder._id === props.selected} 
                            folderClick={props.folderClick} 
                            deleteFolder={props.deleteFolder}/>))}    
                </div>)}
        </div>
    
        {props.files.length !== 0 ? <Spacer title="Files"/> : undefined}
        
        <div>
        
            {props.files.length === 0 ? 
                    
                (undefined) 
                :
                (<div className="dataform">

                    {props.files.map((file) => 
                        ( <FileItem 
                        {...file} 
                        key={file._id} 
                        itemSelected={file._id === props.selected} 
                        downloadFile={props.downloadFile} 
                        removeFile={props.removeFile}
                        fileClick={props.fileClick}/>))}    
                    
                </div>)}
        </div>
        
    </div>
)

export default DataForm;