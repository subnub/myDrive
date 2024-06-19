import React from "react";

const UploadStorageSwitcher = (props) => (
    <div className="upload-switcher__wrapper">
        {props.state.options.length !== 0 ? 
        <select className="upload-switcher__select" value={props.storageSwitcher === "" ? props.state.value : props.storageSwitcher} onChange={props.changeUploadSwitcher}>
            {props.state.options.map((currentOption) => <option disabled={props.storageSwitcher === "" ? false : props.storageSwitcher !== currentOption.type} value={currentOption.type}>{currentOption.name}</option>)}
        </select> :
        <p>No Storage Accounts</p>}
    </div>
)

export default UploadStorageSwitcher;