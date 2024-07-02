import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar";
import MenuIcon from "../../icons/MenuIcon";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { useCallback, useMemo } from "react";
import { toggleDrawer } from "../../reducers/leftSection";

const Header = () => {
  const drawerOpen = useAppSelector((state) => state.leftSection.drawOpen);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const toggleDrawerClick = useCallback(() => {
    dispatch(toggleDrawer());
  }, [toggleDrawer]);
  return (
    <header>
      <div className="px-6 flex justify-between min-h-[68px] items-center py-[15px]">
        <div className="items-center w-[260px] hidden mobileMode:flex">
          <a
            className="inline-flex items-center justify-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img className="w-[35px]" src="/images/icon.png" alt="logo" />
          </a>
        </div>
        <div className="items-center flex mobileMode:hidden mr-4">
          <a className="inline-flex items-center justify-center cursor-pointer">
            <MenuIcon
              id="menu-icon"
              onClick={toggleDrawerClick}
              className="text-[#3c85ee] w-[35px]"
            />
          </a>
        </div>
        <SearchBar />
        <div className="justify-end w-[260px] hidden mobileMode:flex">
          <div>
            <div>
              <a
                onClick={() => navigate("/settings")}
                className="cursor-pointer"
              >
                <img src="/assets/settings.svg" alt="settings" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
