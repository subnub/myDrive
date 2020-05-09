import React from "react";

export class Subbar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className="subbar">

            <div className="add-button add-button-2" onClick={this.props.addButtonEvent} ref={this.props.wrapperRef}>
                            
            <img className="add-button__img" src="/images/add-blue.png"/>

            <h3 className="add-button__title">New</h3>

            <div className={this.props.showAddOptions2 ? "add-button__option-wrapper2 add-button__option-wrapper--show" : "add-button__option-wrapper2"}>
                <div className="add_button__option__add-folder-wrapper" onClick={this.props.createFolder}>
                    <img className="add_button__option__add-folder-image" src="/images/grey-add-folder.png"/>
                    <p className="add_button__option__add-folder-title">Folder</p>
                </div>

                <div className="add_button__option__add-folder-wrapper add_button__option__add-folder-wrapper--no-border">
                            
                    <img className="add_button__option__add-folder-image" src="/images/upload-file-grey.png"/>
                    <p className="add_button__option__add-folder-title">File Upload</p>
                    <input className="add_button__option__add-file-input"  ref={this.props.uploadInput} 
                    type="file" multiple={true} onChange={this.props.handleUpload}/>
                            
                </div>

                <div className="add_button__option__add-folder-wrapper add_button__option__add-folder-wrapper--no-border">
                    <img className="add_button__option__add-folder-image" src="/images/folder-upload-grey.png"/>
                    <p className="add_button__option__add-folder-title">Folder Upload</p>
                </div>
                </div>
                </div>
           
                
                <div className="path__wrapper">

                {(this.props.parentList.length !== 1 || this.props.currentlySearching)? 
                    (
                    <div className="path__block">
                    
                    {this.props.parentNameList.map((parent, index) => {

                        const parentID = this.props.parentList[index];

                        return (
                            <div className="path__block" onClick={() => {this.props.itemClick(parentID, parent, true)}}>
                                <h3 className="path__title">{parent}</h3>

                                {index !== this.props.parentNameList.length - 1 ? (<img className="path__image" src="/images/right-arrow-svg.svg"/>) : undefined}
                                
                            </div>
                        )
                    })}
                    
                    </div>)
                    
                 : undefined}

                
                
                </div>
                

                <img className="grid-button" src={!this.props.listView ? "/images/grid-icon-svg.svg" : "/images/list-icon-svg.svg"} onClick={this.props.showListViewEvent}/>
                <img className="info-button" src="/images/info-icon-grey.png" onClick={this.props.showSideBarEvent}/>
             </div>
        )
    }
}


export default Subbar