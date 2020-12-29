import DataForm from ".././Dataform";
import RightSection from ".././RightSection";
import MoverMenu from ".././MoverMenu";
import PopupWindow from '.././PopupWindow'
import React from "react";


const MainSection = React.forwardRef((props, ref) => {

    return (

        <div class="content__block">
                <div className="overlay" style={(props.leftSectionMode === "open" || props.rightSectionMode === "open") ? {display:"block"} : {display:"none"}}>
        
                </div>
				<div class="small__switcher--content">
					<a onClick={props.switchLeftSectionMode} class="menu__button"><i class="fas fa-bars"></i></a>
					<a onClick={props.switchRightSectionMode} class="image__viewer"><i class="fas fa-images"></i></a>
				</div>
				<div class="file__container" style={props.routeType === "search" ? {flexDirection: "column"} : {flexDirection:"row"}}>

					{true ? undefined : <div class="file__control--panel empty__control--panel">
						<div class="file__get--started">
							<div class="get__started--image">
								<img src="/assets/get_startedfile.svg" alt="get"/>
							</div>
							<h6>All your files in one place</h6>
							<p>Drag and drop a file to get started</p>
						</div>
					</div>}

                    {props.routeType === "search" ? 
                    <div class="file__control--panel folder__view" style={{paddingBottom:"0", marginBottom:"-50px"}}>
                        <div class="results__files">
                        <h2><span class="counter__result">{props.files.length + props.folders.length >= 50 ? "50+" : props.files.length + props.folders.length}</span> <span class="result__word">results</span> for <span class="result__search--word">{props.cachedSearch}</span></h2>
                        <p class="searching__result">You are searching in <span class="root__parent">{props.parent === "/" ? "Home" : props.parentNameList.length !== 0 ? props.parentNameList[props.parentNameList.length - 1] : "Unknown"}</span> <span class="spacer"><img style={{height:"11px", marginTop:"2px", display:"none"}} src="/assets/smallspacer.svg" alt="spacer"/></span><span class="current__folder"></span> <a href="#" style={{display:"none"}} class='search__filter--global'>Show results from everywhere</a></p>
						</div>
                    </div> : undefined}

                    {props.showPopup ? <PopupWindow downloadFile={props.downloadFile} /> : undefined}
                    
                    {props.moverID.length === 0 ? undefined :
                    <MoverMenu />
                    }

                    <DataForm
                        folderClick={props.folderClick}
                        fileClick={props.fileClick}
                        downloadFile={props.downloadFile}/>


                   <RightSection  
                        folderClick={props.folderClick}
                        fileClick={props.fileClick}
                        downloadFile={props.downloadFile}
                        /> 
                   
				</div>
		</div>

)

})


export default MainSection