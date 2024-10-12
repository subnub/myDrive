import React, { useState } from "react";
import SettingsChangePasswordPopup from "./SettingsChangePasswordPopup";
import { toast } from "react-toastify";
import { logoutAPI } from "../../api/user";
import Swal from "sweetalert2";

interface SettingsPageAccountProps {
  user: {
    _id: string;
    email: string;
  };
}

const SettingsPageAccount: React.FC<SettingsPageAccountProps> = ({ user }) => {
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);

  const logoutClick = async () => {
    try {
      const result = await Swal.fire({
        title: "Logout?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, logout",
      });

      if (!result.value) return;

      await toast.promise(logoutAPI(), {
        pending: "Logging out...",
        success: "Logged out",
        error: "Error Logging Out",
      });

      window.localStorage.removeItem("hasPreviouslyLoggedIn");

      window.location.assign("/");
    } catch (e) {
      console.log("Error logging out", e);
    }
  };

  const logoutAllClick = async () => {
    try {
      const result = await Swal.fire({
        title: "Logout all?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, logout all",
      });

      if (!result.value) return;

      await toast.promise(logoutAPI(), {
        pending: "Logging out all...",
        success: "Logged out all",
        error: "Error Logging Out Al",
      });

      window.localStorage.removeItem("hasPreviouslyLoggedIn");

      window.location.assign("/");
    } catch (e) {
      console.log("Error logging out", e);
    }
  };

  return (
    <div>
      {showChangePasswordPopup && (
        <SettingsChangePasswordPopup
          closePopup={() => setShowChangePasswordPopup(false)}
        />
      )}

      <div className="bg-white-hover p-3 flex items-center w-full rounded-md">
        <p className="text-base">Account</p>
      </div>
      <div>
        <div className="p-3 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Email</p>
          <p>{user.email}</p>
        </div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Change password</p>
          <button
            className="text-primary hover:text-primary-hover cursor-pointer"
            onClick={() => setShowChangePasswordPopup(true)}
          >
            Change
          </button>
        </div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Logout account</p>
          <button
            className="text-primary hover:text-primary-hover cursor-pointer"
            onClick={logoutClick}
          >
            Logout
          </button>
        </div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Logout all accounts</p>
          <button
            className="text-primary hover:text-primary-hover cursor-pointer"
            onClick={logoutAllClick}
          >
            Logout all
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageAccount;
