import React, { useCallback, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createFolderAPI } from "../../api/foldersAPI";
import { useFoldersClient } from "../../hooks/folders";
import { showCreateFolderPopup } from "../../popups/folder";
import { useClickOutOfBounds, useUtils } from "../../hooks/utils";
import AddNewDropdown from "../AddNewDropdown";
import HomeListIcon from "../../icons/HomeListIcon";
import TrashIcon from "../../icons/TrashIcon";
import classNames from "classnames";
import PhotoIcon from "../../icons/PhotoIcon";

const LeftSection = (props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isHome, isTrash, isMedia } = useUtils();
  const navigate = useNavigate();
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

  const goHome = () => {
    navigate("/home");
  };

  const goTrash = () => {
    navigate("/trash");
  };

  const goMedia = () => {
    navigate("/media");
  };

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
      <div className="navigation__block flex flex-col h-full">
        <div>
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
          <div className="pr-[20px] pb-4">
            <ul className="m-0 list-none p-0 cursor-pointer">
              <li>
                <a
                  onClick={goHome}
                  className={classNames(
                    "flex items-center text-[#3c85ee] font-medium no-underline animate",
                    isHome ? "text-[#3c85ee]" : "text-[#637381]"
                  )}
                >
                  <span>
                    <HomeListIcon />
                  </span>
                  <p className="ml-3">Home</p>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#E8EEF2] pr-[20px] pt-3 pb-3">
          <ul className="m-0 list-none p-0 cursor-pointer ">
            <li>
              <a
                onClick={goMedia}
                className={classNames(
                  "flex items-center text-[#3c85ee] font-medium no-underline animate",
                  isMedia ? "text-[#3c85ee]" : "text-[#637381]"
                )}
              >
                <span>
                  <PhotoIcon className="w-[20px] h-[20px]" />
                </span>
                <p className="ml-3">Media</p>
              </a>
            </li>
          </ul>
        </div>
        <div className="border-t border-[#E8EEF2] pr-[20px] pt-4">
          <ul className="m-0 list-none p-0 cursor-pointer ">
            <li>
              <a
                onClick={goTrash}
                className={classNames(
                  "flex items-center text-[#3c85ee] font-medium no-underline animate",
                  isTrash ? "text-red-500" : "text-[#637381]"
                )}
              >
                <span>
                  <TrashIcon />
                </span>
                <p className="ml-3">Trash</p>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeftSection;
