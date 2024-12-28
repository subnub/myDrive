import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClickOutOfBounds, useUtils } from "../../hooks/utils";
import AddNewDropdown from "../AddNewDropdown/AddNewDropdown";
import TrashIcon from "../../icons/TrashIcon";
import classNames from "classnames";
import PhotoIcon from "../../icons/PhotoIcon";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { closeDrawer } from "../../reducers/leftSection";
import SettingsIcon from "../../icons/SettingsIcon";
import ChevronSolid from "../../icons/ChevronSolid";
import HomeIconOutline from "../../icons/HomeIconOutline";
import { addNavigationMap } from "../../reducers/selected";

const LeftSection = ({
  scrollDivRef,
}: {
  scrollDivRef: React.RefObject<HTMLDivElement>;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const leftSectionOpen = useAppSelector((state) => state.leftSection.drawOpen);
  const { isHome, isHomeFolder, isTrash, isMedia, isSettings } = useUtils();
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
    dispatch(
      addNavigationMap({
        url: window.location.pathname,
        scrollTop: scrollDivRef.current?.scrollTop || 0,
      })
    );
    navigate("/home");
  };

  const goTrash = () => {
    dispatch(closeDrawer());
    dispatch(
      addNavigationMap({
        url: window.location.pathname,
        scrollTop: scrollDivRef.current?.scrollTop || 0,
      })
    );
    navigate("/trash");
  };

  const goMedia = () => {
    dispatch(closeDrawer());
    dispatch(
      addNavigationMap({
        url: window.location.pathname,
        scrollTop: scrollDivRef.current?.scrollTop || 0,
      })
    );
    navigate("/media");
  };

  const goSettings = () => {
    dispatch(closeDrawer());
    dispatch(
      addNavigationMap({
        url: window.location.pathname,
        scrollTop: scrollDivRef.current?.scrollTop || 0,
      })
    );
    navigate("/settings");
  };

  const closeDrawerEvent = useCallback(
    (e: any) => {
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
        "p-6 fixed desktopMode:relative border-r w-[270px] min-w-[270px] bg-white h-full z-20 desktopMode:z-0 animate-movement mt-1.5",
        {
          "-left-[270px] desktopMode:left-0": !leftSectionOpen,
          "left-0": leftSectionOpen,
        }
      )}
    >
      <div className="flex flex-col h-full select-none">
        <div>
          <div className="relative mb-7">
            <a
              onClick={openDropdown}
              className="flex items-center justify-center bg-primary hover:bg-primary-hover no-underline rounded-md px-2 py-2.5"
            >
              <p className="m-0 w-full text-center text-white font-medium text-sm">
                ADD NEW
              </p>
              <ChevronSolid className="text-white mr-1" />
            </a>
            {isDropdownOpen && <AddNewDropdown closeDropdown={closeDropdown} />}
          </div>
        </div>

        <div
          className={classNames(
            "pl-2 mr-5 py-2 hover:bg-white-hover rounded-md cursor-pointer animate flex flex-row items-center w-full",
            isHome || isHomeFolder
              ? "text-primary bg-white-hover"
              : "text-gray-primary"
          )}
          onClick={goHome}
        >
          <HomeIconOutline className="w-6 h-6" />
          <p className="ml-3">Home</p>
        </div>

        <div
          className={classNames(
            "pl-2 mr-5 py-2 hover:bg-white-hover rounded-md cursor-pointer animate flex flex-row items-center mt-1 w-full",
            isMedia ? "text-primary bg-white-hover" : "text-gray-primary"
          )}
          onClick={goMedia}
        >
          <PhotoIcon className="w-6 h-6" />
          <p className="ml-3">Media</p>
        </div>

        <div
          className={classNames(
            "pl-2 mr-5 py-2 hover:bg-white-hover rounded-md cursor-pointer animate flex flex-row items-center desktopMode:hidden mt-1 w-full",
            isSettings ? "text-primary bg-white-hover" : "text-gray-primary"
          )}
          onClick={goSettings}
        >
          <SettingsIcon className="w-6 h-6" />
          <p className="ml-3">Settings</p>
        </div>

        <div
          className={classNames(
            "pl-2 mr-5 py-2 hover:bg-white-hover rounded-md cursor-pointer animate flex flex-row items-center mt-1 w-full",
            isTrash ? "text-red-500 bg-white-hover" : "text-gray-primary"
          )}
          onClick={goTrash}
        >
          <TrashIcon className="w-6 h-6" />
          <p className="ml-3">Trash</p>
        </div>
      </div>
    </div>
  );
};

export default LeftSection;
