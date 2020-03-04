import StorageWidget from ".././StorageWidget";
import React from "react";

const SettingsMenu = (props) => (

    <div className={props.showSettings ? "settingsmenu" : "settingsmenu settingsmenu--gone"}>
        

        {/* HEADER */}

        <div className="settingsmenu__header">


            <div className="settingsmenu__header__box">
                <img className="settingsmenu__header__image" src="images/gear_icon.png"/>
                <h3 className="settingsmenu__header__title">Settings</h3>
            </div>
        

            <img className="settingsmenu__header__button" src="/images/close_icon.png"
                onClick={props.closeSettings}/>

        </div>

        <div className="settingsmenu_body">
        

            {/*Storage*/}

            <div className="settingsmenu__option">
            
                <p className="settingsmenu__option__title settingsmenu__option__title--offset">Storage</p>

                <div className="settingsmenu__suboption settingsmenu__suboption--offset">

                    <StorageWidget />
                
                </div>

            </div>


            {/*List Style*/}

            <div className="settingsmenu__option">

                <div className="settingsmenu__option__title__wrapper">
                    <p className="settingsmenu__option__title">Default List Style</p>
                    <img className="settingsmenu__option__info__style" src="/images/info.svg"
                            onClick={props.infoStyle}/>
                </div>

                <div className="settingsmenu__suboption">

                    <select className="settingsmenu__select"
                            value={props.state.style}
                            onChange={props.setStyle}>
                    
                        <option>Grid (Default)</option>
                        <option>List</option>

                    </select>
                
                </div>

            </div>



            {/*List Size*/}
            <div className="settingsmenu__option">

                <div className="settingsmenu__option__title__wrapper">
                    <p className="settingsmenu__option__title">Default List Size</p>
                    <img className="settingsmenu__option__info__size" src="/images/info.svg"
                            onClick={props.infoSize}/>
                </div>
            

                <div className="settingsmenu__suboption">

                    <select className="settingsmenu__select"
                            value={props.state.size}
                            onChange={props.setSize}>
                    
                        <option>30</option>
                        <option>50 (Default)</option>
                        <option>100</option>
                        <option>200</option>

                    </select>
                    
                </div>

            </div>


            {/*Change password*/}
            <div className="settingsmenu__option">
            
                <p className="settingsmenu__option__title">Change Password</p>

                <div className="settingsmenu__suboption">

                    <button className="settingsmenu__button settingsmenu__button--offset-logout"
                            onClick={props.changePassword}>Change Password</button>
                </div>

            </div>


            {/*Logout*/}
            <div className="settingsmenu__option">
            
                <p className="settingsmenu__option__title">Logout</p>

                <div className="settingsmenu__suboption">

                    <button className="settingsmenu__button settingsmenu__button--offset-logout"
                            onClick={props.logout}>Logout</button>
                </div>

            </div>



            {/*Logout-all*/}
            <div className="settingsmenu__option settingsmenu__option">
            
                <div className="settingsmenu__option__title__wrapper">
                    <p className="settingsmenu__option__title">Logout All</p>
                    <img className="settingsmenu__option__info" src="/images/info.svg"
                            onClick={props.infoLogoutAll}/>
                </div>
                
                <div className="settingsmenu__suboption">

                    <button className="settingsmenu__button settingsmenu__button--offset-logout-all"
                            onClick={props.logoutAll}>Logout All</button>
                </div>

            </div>



            {/*Delete-all*/}
            <div className="settingsmenu__option settingsmenu__option--no-border">
            
                <div className="settingsmenu__option__title__wrapper">
                    <p className="settingsmenu__option__title">Delete All</p>
                    <img className="settingsmenu__option__info" src="/images/info.svg"
                            onClick={props.infoDeleteAll}/>
                </div>
                
                <div className="settingsmenu__suboption">

                    <button className="settingsmenu__button settingsmenu__button--red"
                            onClick={props.deleteAll}>Delete All</button>
                </div>

            </div>

        
        </div>


        

    </div>

    
)

export default SettingsMenu

