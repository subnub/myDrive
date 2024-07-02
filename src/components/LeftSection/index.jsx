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
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { closeDrawer } from "../../reducers/leftSection";
import SettingsIcon from "../../icons/SettingsIcon";

const LeftSection = (props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const leftSectionOpen = useAppSelector((state) => state.leftSection.drawOpen);
  const { isHome, isTrash, isMedia, isSettings } = useUtils();
  const dispatch = useAppDispatch();
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
    dispatch(closeDrawer());
    navigate("/home");
  };

  const goTrash = () => {
    dispatch(closeDrawer());
    navigate("/trash");
  };

  const goMedia = () => {
    dispatch(closeDrawer());
    navigate("/media");
  };

  const goSettings = () => {
    dispatch(closeDrawer());
    navigate("/settings");
  };

  const closeDrawerEvent = useCallback(
    (e) => {
      console.log("close", e?.target.id);
      if (
        !e ||
        !leftSectionOpen ||
        e.target.id === "search-bar" ||
        e.target.id === "menu-icon" ||
        e.target.id === "header"
      ) {
        return;
      }

      dispatch(closeDrawer());
    },
    [closeDrawer, leftSectionOpen]
  );

  const { wrapperRef } = useClickOutOfBounds(closeDrawerEvent, leftSectionOpen);

  return (
    <div
      ref={wrapperRef}
      className={classNames(
        "p-6 fixed desktopMode:relative border-r w-[270px] min-w-[270px] bg-white h-full z-20 mt-[9px] animate-movement",
        {
          "-left-[270px] desktopMode:left-0": !leftSectionOpen,
          "left-0": leftSectionOpen,
        }
      )}
    >
      <div className="flex flex-col h-full">
        <div>
          <div className="relative mb-[30px]">
            <a
              onClick={openDropdown}
              className="flex items-center justify-center bg-[#3c85ee] no-underline rounded-[5px]"
            >
              <p className="m-0 w-full text-center text-white text-[16px] font-medium">
                ADD NEW
              </p>
              <span className="min-w-[50px] min-h-[45px] rounded-tr-[5px] rounded-br-[5px] flex items-center justify-center">
                <img src="/assets/dropselect.svg" alt="dropselect" />
              </span>
            </a>
            {/* TODO: Remove this props */}
            {isDropdownOpen && (
              <AddNewDropdown closeDropdown={closeDropdown} {...props} />
            )}
          </div>
          <div className="pl-2 mr-[20px] py-2 hover:bg-[#f6f5fd] rounded-md">
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
        <div className="pl-2 mr-[20px] py-2 hover:bg-[#f6f5fd] mt-1 mb-1 rounded-md">
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
                  <PhotoIcon className="w-[20px] h-[20px] -ml-[2px]" />
                </span>
                <p className="ml-3">Media</p>
              </a>
            </li>
          </ul>
        </div>
        <div className="pl-2 mr-[20px] py-2 hover:bg-[#f6f5fd] rounded-md block desktopMode:hidden mb-1">
          <ul className="m-0 list-none p-0 cursor-pointer ">
            <li>
              <a
                onClick={goSettings}
                className={classNames(
                  "flex items-center text-[#3c85ee] font-medium no-underline animate",
                  isSettings ? "text-[#3c85ee]" : "text-[#637381]"
                )}
              >
                <span>
                  <SettingsIcon className="w-[22px] h-[22px] -ml-[2px]" />
                </span>
                <p className="ml-2">Settings</p>
              </a>
            </li>
          </ul>
        </div>
        <div className="pl-2 mr-[20px] py-2 hover:bg-[#f6f5fd] rounded-md">
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
