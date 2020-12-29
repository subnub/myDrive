import Spinner from ".././SpinnerLogin";
import React from "react";

const DownloadPage = ({download,state}) => {

    if (state.size === "" && !state.error) {

        return <div className="downloadpage__box">
            <Spinner />
        </div>
    }

    return (
        
        <div className="downloadpage">

            {!state.error ? 
                
            (<div className="downloadpage__box">
                <p className="downloadpage__box__title">{state.title}</p>
                <p className="downloadpage__box__subtitle">Type: {state.type}</p>
                <p className="downloadpage__box__subtitle">Size: {state.size}</p>
                <button className="button popup-window__button" onClick={download}>Download</button>
            </div>) 
            : 
            <div className="downloadpage__box"> 
                <p>Unauthorized/Not Found Download</p>
            </div>
            }
       
        </div>)
}

export default DownloadPage;

