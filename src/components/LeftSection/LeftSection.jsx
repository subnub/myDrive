import React, { useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { createFolderAPI } from "../../api/foldersAPI";
import { useFoldersClient } from "../../hooks/folders";
import { showCreateFolderPopup } from "../../popups/folder";
import { useClickOutOfBounds } from "../../hooks/utils";
import AddNewDropdown from "../AddNewDropdown";

const LeftSection = (props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const addNewDisabled = useRef(false);

  const openDropdown = useCallback(() => {
    if (addNewDisabled.current) return;
    setIsDropdownOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    addNewDisabled.current = true;
    setIsDropdownOpen(false);
    // Clicking out of bounds on the add new button will cause it to reopen
    setTimeout(() => (addNewDisabled.current = false), 300);
  }, []);

  return (
    <div
      className="menu__block p-6 hidden mobileMode:block border-r w-[270px] min-w-[270px]"
      ref={props.leftSectionRef}
      style={
        props.leftSectionMode === ""
          ? {}
          : props.leftSectionMode === "open"
          ? { left: "0px" }
          : { left: "-290px" }
      }
    >
      <div className="navigation__block">
        <div className="add__new">
          <a onClick={openDropdown}>
            <p>ADD NEW</p>
            <span>
              <img src="/assets/dropselect.svg" alt="dropselect" />
            </span>
          </a>
          {/* TODO: Remove this props */}
          {isDropdownOpen && (
            <AddNewDropdown closeDropdown={closeDropdown} {...props} />
          )}
        </div>
        <div className="page__navigation">
          <ul>
            <li className="active__page">
              <a onClick={props.goHome}>
                <span>
                  <img src="/assets/homea.svg" alt="homeactive" />
                </span>
                Home
              </a>
            </li>
          </ul>
        </div>
        <div
          className={
            props.state.hideFolderTree
              ? "utility__buttons utility__buttons_no_border"
              : "utility__buttons"
          }
        >
          <ul>
            {/* <li><a href="#"><span><img src="/assets/utility1.svg" alt="utility"/></span> Shared with me</a></li>
            <li><a href="#"><span><img src="/assets/utility2.svg" alt="utility"/></span> Recent Files</a></li>
            <li><a href="#"><span><img src="/assets/utility3.svg" alt="utility"/></span> Trash</a></li> */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeftSection;
