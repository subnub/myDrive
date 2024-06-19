import React from "react";

export default ({title, body, first=true}) => (

    <div className="section-detail__wrapper">
        <h5 className={first ? "section-detail__title" : "section-detail__title section-detail__title--margin"}>{title}</h5>
        <h5 className={first ? "section-detail__body" : "section-detail__body section-detail__body--margin"}>{body}</h5>
    </div>
    
)