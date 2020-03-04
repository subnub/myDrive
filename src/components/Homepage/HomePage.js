import Header from ".././Header";
import LeftSection from ".././LeftSection"
import MainSection from ".././MainSection";
import Uploader from ".././Uploader";
import SettingsMenu from ".././SettingsMenu";
import React from "react";
import PhotoViewer from "../PhotoViewer"

const HomePage = (props) => (

    <div>
        <Header goHome={props.goHome}/>
        <div className="main-page" >

            <LeftSection />
            <MainSection />           
            <Uploader />         
            <SettingsMenu />
            {props.photoID.length === 0 ? undefined :
            <PhotoViewer />}
               
        </div>
    </div>

)

export default HomePage

