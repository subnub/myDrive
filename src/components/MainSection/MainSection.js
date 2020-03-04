import Subbar from ".././Subbar";
import Filter from ".././Filter";
import DataForm from ".././Dataform";
import RightSection from ".././RightSection";
import Spinner from ".././Spinner";
import QuickAccess from ".././QuickAccess/index";
import MoverMenu from ".././MoverMenu";
import Spacer from ".././Spacer"
import PopupWindow from '.././PopupWindow'
import ShareMenu from ".././ShareMenu";
import InfiniteScroll from 'react-infinite-scroller';
import React from "react";


const MainSection = React.forwardRef((props, ref) => {

    return (
        <div className="main-container">

            {props.showPopup ? <PopupWindow downloadFile={props.downloadFile}/> : undefined}

            <Subbar folderClick={props.folderClick} scrollParentRef={ref}/>

            <div className="sub-container">

                <div className="section" ref={ref}>

                    {(props.quickFiles.length !== 0 && props.parent === "/") ? 
                        <div>
                            <Spacer title="Quick Access"/>
                            <QuickAccess 
                                fileClick={props.fileClick}
                                downloadFile={props.downloadFile}/>
                        </div> :
                        undefined} 
                    

                    <ShareMenu />

                    <InfiniteScroll
                        pageStart={0}
                        loadMore={props.loadMoreItems}
                        hasMore={props.allowLoadMoreItems}
                        loader={<div className="loader" key={0}><Spinner /></div>}
                        useWindow={false}
                        getScrollParent={() => props.scrollParentRef}
                    >


                    <Filter />
                    <DataForm 
                        folderClick={props.folderClick}
                        fileClick={props.fileClick}
                        downloadFile={props.downloadFile}/>
                    
                    </InfiniteScroll>

                    {props.moverID.length === 0 ? undefined :
                    <MoverMenu />
                    }
                    
                </div>

                <RightSection />
            
            </div>

        </div>


)

})


export default MainSection