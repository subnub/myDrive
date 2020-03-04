import QuickAccessItem from ".././QuickAccessItem";
import React from "react";

const QuickAccess = (props) => (
    <div className="quickaccess">

        {props.quickFiles
            .map((file) => <QuickAccessItem 
                                key={file._id} 
                                downloadFile={props.downloadFile} 
                                fileClick={props.fileClick}
                                {...file}/>)}

    </div>
)


export default QuickAccess;