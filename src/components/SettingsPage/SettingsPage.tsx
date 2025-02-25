import { useEffect, useState } from "react";
import ChevronOutline from "../../icons/ChevronOutline";
import Header from "../Header/Header";
import classNames from "classnames";
import AccountIcon from "../../icons/AccountIcon";
import TuneIcon from "../../icons/TuneIcon";
import { useNavigate } from "react-router-dom";
import SettingsAccountSection from "./SettingsAccountSection";
import { getUserDetailedAPI, logoutAPI } from "../../api/userAPI";
import Spinner from "../Spinner/Spinner";
import Swal from "sweetalert2";
import SettingsGeneralSection from "./SettingsGeneralSection";
import { useClickOutOfBounds } from "../../hooks/utils";
import MenuIcon from "../../icons/MenuIcon";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("account");
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const navigate = useNavigate();

  const getUser = async () => {
    try {
      const userResponse = await getUserDetailedAPI();
      setUser(userResponse);
    } catch (e) {
      console.log("Loading user details error", e);
      const result = await Swal.fire({
        title: "Error loading user account",
        text: "There was an error loading your account, would you like to logout?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, logout",
      });
      if (result.value) {
        await toast.promise(logoutAPI(), {
          pending: "Logging out...",
          success: "Logged out",
          error: "Error Logging Out",
        });

        window.localStorage.removeItem("hasPreviouslyLoggedIn");

        navigate("/");
      } else {
        navigate("/home");
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const { wrapperRef } = useClickOutOfBounds(() => setShowSidebarMobile(false));

  const changeTab = (tab: string) => {
    setTab(tab);
    setShowSidebarMobile(false);
  };

  return (
    <div>
      <div className="hidden sm:block">
        <Header />
      </div>
      <div className="flex flex-row sm:mt-[70px]">
        <div
          ref={wrapperRef}
          className={classNames(
            "fixed sm:relative px-4 border-r border-gray-secondary w-72 dynamic-height animate-movement bg-white",
            {
              "-ml-72 sm:ml-0": !showSidebarMobile,
              "ml-0": showSidebarMobile,
            }
          )}
        >
          <a
            onClick={() => navigate("/home")}
            className="text-gray-600 hover:text-primary cursor-pointer flex flex-row items-center space-x-1 pt-6"
          >
            <ChevronOutline className="w-6 h-6 rotate-90" />
            <p>HOME</p>
          </a>
          <div className="mt-8 space-y-2">
            <div
              className={classNames(
                "pl-2 mr-5 py-2 hover:bg-white-hover rounded-md cursor-pointer animate flex flex-row items-center w-full",
                tab === "account"
                  ? "text-primary bg-white-hover"
                  : "text-gray-primary"
              )}
              onClick={() => changeTab("account")}
            >
              <AccountIcon className="w-6 h-6" />
              <p className="ml-3">Account</p>
            </div>
            <div
              className={classNames(
                "pl-2 mr-5 py-2 hover:bg-white-hover rounded-md cursor-pointer animate flex flex-row items-center w-full",
                tab === "general"
                  ? "text-primary bg-white-hover"
                  : "text-gray-primary"
              )}
              onClick={() => changeTab("general")}
            >
              <TuneIcon className="w-6 h-6" />
              <p className="ml-3">General</p>
            </div>
          </div>
        </div>
        {user && (
          <div className="mt-6 px-2 sm:px-64 w-full">
            <div className="block sm:hidden mb-2">
              <MenuIcon
                className="w-8 h-8"
                onClick={() => setShowSidebarMobile(!showSidebarMobile)}
              />
            </div>
            {tab === "account" && (
              <SettingsAccountSection user={user} getUser={getUser} />
            )}
            {tab === "general" && <SettingsGeneralSection />}
          </div>
        )}
        {!user && (
          <div className="w-full dynamic-height flex justify-center items-center">
            <Spinner />
          </div>
        )}
      </div>
      <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
    </div>
  );
};

export default SettingsPage;
