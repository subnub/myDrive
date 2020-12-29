import React from "react";

const Header = (props) => (

        <header>
                <div class="container">
                    <div class="outer__header">
                        <div class="left__header">
                            <div class="logo__wrapper">
                                <a onClick={props.goHome}>
                                    <img className="header__icon" src="/images/mydrive-logo.png" alt="logo"/>
                                </a>
                            </div>
                            <div class="search__wrapper">
                                <a href="#">
                                    <img src="/assets/searchicon.svg" alt="search"/>
                                </a>
                                <input type="text" 
                                    placeholder="Search your files"
                                    onChange={props.searchOnChange} 
                                    value={props.search}
                                    placeholder="Search" type="text"
                                    onFocus={props.showSuggested}
                                    onBlur={props.hideSuggested}/>
                                <div class="search__files--dropdown" style={(props.state.focused && props.searchValue.length !== 0)? {display:"block"} : {display:"none"}}>
                                    <div onMouseDown={props.selectSuggestedByParent} class="elem__search--files search__filter--local">
                                    <a>Search for <span class="file__name">{props.searchValue}</span><span class="spacer"><img src="/assets/spacer.svg" alt="spacer"/></span></a>
                                    </div>
							    </div>
                            </div>
                        </div>
                        <div class="right__header">
                            <div class="profile__info">
                                <div class="settings__button">
                                    <a onClick={props.goToSettings}>
                                        <img src="/assets/settings.svg" alt="settings"/>
                                    </a>
                                </div>
                                <div class="profile__wrapper">
                                    <div class="profile__button">
                                        <a style={{backgroundColor:"#3c85ee"}}> 
                                            <span style={{color:"#fff"}}>{props.getProfilePic()}</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
)

export default Header