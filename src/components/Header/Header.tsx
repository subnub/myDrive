import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import MenuIcon from "../../icons/MenuIcon";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { useCallback } from "react";
import { closeDrawer, toggleDrawer } from "../../reducers/leftSection";
import { useUtils } from "../../hooks/utils";
import ChevronOutline from "../../icons/ChevronOutline";
import SettingsIconSolid from "../../icons/SettingsIconSolid";

const Header = () => {
  const drawerOpen = useAppSelector((state) => state.leftSection.drawOpen);
  const { isSettings } = useUtils();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const toggleDrawerClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      dispatch(toggleDrawer());
    },
    [toggleDrawer]
  );

  const closeDrawerClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      dispatch(closeDrawer());
    },
    [closeDrawer]
  );

  return (
    <header id="header" className="select-none">
      <div className="px-6 flex justify-between min-h-16 items-center py-3.5">
        <div className="items-center w-[260px] hidden desktopMode:flex">
          <a
            className="inline-flex items-center justify-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img className="w-9" src="/images/icon.png" alt="logo" />
          </a>
        </div>
        {!isSettings && (
          <div className="items-center flex desktopMode:hidden mr-4">
            <a className="inline-flex items-center justify-center cursor-pointer">
              {!drawerOpen && (
                <MenuIcon
                  id="menu-icon"
                  onClick={toggleDrawerClick}
                  className="text-primary w-9"
                />
              )}
              {drawerOpen && (
                <ChevronOutline
                  id="menu-icon"
                  onClick={closeDrawerClick}
                  className="text-primary w-9 rotate-90"
                />
              )}
            </a>
          </div>
        )}
        <SearchBar />
        <div className="justify-end w-[260px] hidden desktopMode:flex">
          <div>
            <div>
              <a
                onClick={() => navigate("/settings")}
                className="cursor-pointer"
              >
                <SettingsIconSolid className="w-7 h-7 text-gray-primary" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
