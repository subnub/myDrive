import { useEffect, useState } from "react";
import ChevronOutline from "../../icons/ChevronOutline";
import Header from "../Header/Header";
import classNames from "classnames";
import AccountIcon from "../../icons/AccountIcon";
import TuneIcon from "../../icons/TuneIcon";
import { useNavigate } from "react-router-dom";
import SettingsPageAccount from "./SettingsPageAccount";
import { getUserDetailedAPI } from "../../api/user";
import Spinner from "../Spinner/Spinner";
import Swal from "sweetalert2";
import SettingsPageGeneral from "./SettingsPageGeneral";

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("account");
  const navigate = useNavigate();

  const goHome = () => {
    window.location.assign("/home");
  };

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
      } else {
        navigate("/home");
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (!user) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="mt-[70px] flex flex-row">
        <div className="px-4 border-r border-gray-secondary w-64 h-screen">
          <a
            onClick={goHome}
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
              onClick={() => setTab("account")}
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
              onClick={() => setTab("general")}
            >
              <TuneIcon className="w-6 h-6" />
              <p className="ml-3">General</p>
            </div>
          </div>
        </div>
        <div className="mt-6 px-64 w-full">
          {tab === "account" && <SettingsPageAccount user={user} />}
          {tab === "general" && <SettingsPageGeneral />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
