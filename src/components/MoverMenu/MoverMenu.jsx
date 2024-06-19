import React from "react";
import moment from "moment";

const MoverMenu = (props) => (
    <div className="movermenu">
    
        <img className="movermenu__close-button" onClick={props.closeMover} src="/images/close_icon.png"/>

        <div className="movermenu__nav_wrapper"> 

            <img className={(props.state.historyList.length ==! 0 || props.state.search.length > 0) ?
                "movermenu__back-button" : "movermenu__back-button movermenu__back-button--disabled"
            } onClick={props.goBack} src="/images/back.svg"/>
            <p className="movermenu__title">{props.state.title}</p>
            <img className={(props.state.historyList.length ==! 0 || props.state.search.length > 0) ?
                "movermenu__home-button" : "movermenu__home-button movermenu__home-button--disabled"
            } onClick={props.goHome} src="/images/home.svg"/>

        </div>

        <div className="movermenu__search_wrapper">
            <form className="movermenu__form" onSubmit={props.search}>
                <input className="movermenu__input" onChange={props.inputChange} value={props.state.search} placeholder="Search"/>
            </form>
        </div>

        <div className="movermenu__main_wrapper">
            {props.state.folders.map((folder) => {

                return <div className={folder._id !== props.state.selected ? "file__item__listview file__item__listview--smaller-max-width" : "file__item__listview file__item__listview--smaller-max-width file__item--selected"} 
                    onClick={() => props.folderClick(folder._id, folder.name)}
                >
                    
                    <div className="file__item__listview__title__wrapper file__item__listview__title__wrapper--mover">
                        <img className="file__image__listview file__image__listview--mover" src="/images/folder-svg.svg"/>
                        <h5 className={folder._id !== props.state.selected ? "file__title__listview file__title__listview--no-max file__title__listview--mover" : "file__title__listview file__title__listview--no-max file__title--selected file__title__listview--mover"}>{folder.name}</h5>
                    </div>
           
                    <h5 className={folder._id !== props.state.selected ? "file__title__listview" : "file__title__listview file__title--selected"}>{moment(folder.createdAt).format("L")}</h5>

                </div>
                
            })}
        </div>

        <div className="movermenu__button_wrapper">
            <button className="movermenu__button" onClick={props.moveItem}>{props.getButtonName()}</button>
        </div>

    </div>
)

export default MoverMenu;