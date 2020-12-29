import QuickAccessItem from ".././QuickAccessItem";
import React from "react";

const QuickAccess = (props) => (

    <div className="quick__access" style={props.currentRouteType === "home" ? {display:"block"} : {display:"none"}}>

        <div className="head__access">
            <h2 className="noSelect">Quick Access</h2>
        </div>

        <div className="main__access">

            {props.quickFiles
                .map((file) => <QuickAccessItem 
                                    key={file._id} 
                                    downloadFile={props.downloadFile} 
                                    fileClick={props.fileClick}
                                    {...file}/>)}

        </div>

    </div>
)


export default QuickAccess;