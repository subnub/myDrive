import SuggestedItem from ".././SuggestedItem";
import React from "react";
import uuid from "uuid";

const Header = (props) => (
    <header className="header">
    
        <img className="header__image" src="/images/my-drive-icon2.png" onClick={props.goHome}/>

        <form className="header__form" onSubmit={props.searchEvent}>
        
            <input className="header__input" onChange={props.searchOnChange} 
                value={props.search}
                placeholder="Search" type="text"
                onFocus={props.showSuggested}
                onBlur={props.hideSuggested}
            />

            <div className={(props.state.focused && (props.state.suggestedList.folderList.length !== 0 || props.state.suggestedList.fileList.length !== 0)) ? "header__input__suggested" : "header__input__suggested header__input__suggested--gone"}>

                {props.state.suggestedList.folderList.map((suggested) => {

                    return <SuggestedItem key={uuid()} itemClick={props.selectSuggested} suggested={suggested} folder={true}/>
                })}

                {props.state.suggestedList.fileList.map((suggested) => {

                    return <SuggestedItem key={uuid()} itemClick={props.selectSuggested} suggested={suggested} folder={false}/>
                })}

            </div>

        </form>

            <img className="header__setting" onClick={props.showSettings} src="/images/gear_icon.png" />
    </header>
)

export default Header