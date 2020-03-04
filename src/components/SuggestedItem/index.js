import moment from "moment"
import React from "react";

export default ({suggested, folder, itemClick}) => { 
    
    const name = folder ? suggested.name : suggested.filename;
    
    return(
        <div onMouseDown={() => itemClick(name)} className="header__input__suggested__item">

            <div className="header__input__suggested__item__title__wrapper">
            
                <img className="header__input__suggested__item__image" src={folder ? "/images/folder-svg.svg" : "/images/file-svg.svg"}/>
                <h3 className="header__input__suggested__item__title">{name}</h3>

            </div>

            <h3 className="header__input__suggested__item__subtitle">{folder ? moment(suggested.createdAt).format("L") :  moment(suggested.uploadDate).format("L")}</h3>
        
        </div>
    )

}