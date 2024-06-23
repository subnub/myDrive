import React from "react";

const ParentBar = (props) => (
  <div className="path__files">
    <a onClick={props.homeClick}>myDrive</a>
    <span className="spacer__path">
      <img src="/assets/spacer.svg" alt="spacer" />
    </span>
    <p onClick={props.onFolderClick} className="current__folder">
      {props.parentNameList.length !== 0
        ? props.parentNameList[props.parentNameList.length - 1]
        : "No Name"}
    </p>
  </div>
);

export default ParentBar;
