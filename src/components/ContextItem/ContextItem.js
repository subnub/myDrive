import React from "react";

const ContextItem = (props) => (
    <div className="context__item" onClick={props.onClick}>
    <img className="context__item__image" src={props.image}/>
    <p className="context__item__title">{props.title}</p>
    </div>
)

export default ContextItem;

