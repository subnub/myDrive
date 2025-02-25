import React, { useRef, useState } from "react";
import SettingsChangePasswordPopup from "./SettingsChangePasswordPopup";
import { toast } from "react-toastify";
import { logoutAPI, resendVerifyEmailAPI } from "../../api/userAPI";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface SettingsPageAccountProps {
  user: {
    _id: string;
    email: string;
    emailVerified: boolean;
  };
  getUser: () => void;
}

const SettingsPageAccount: React.FC<SettingsPageAccountProps> = ({
  user,
  getUser,
}) => {
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const lastSentEmailVerifiation = useRef(0);
  const navigate = useNavigate();

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

      navigate("/");
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
        error: "Error Logging Out all",
      });

      window.localStorage.removeItem("hasPreviouslyLoggedIn");

      navigate("/");
    } catch (e) {
      console.log("Error logging out", e);
    }
  };

  const resendEmailVerification = async () => {
    try {
      const currentDate = Date.now();
      if (currentDate - lastSentEmailVerifiation.current < 1000 * 60 * 1) {
        await Swal.fire({
          title: "Please wait 1 minute before resending",
          icon: "warning",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Okay",
        });
        return;
      }
      lastSentEmailVerifiation.current = Date.now();

      await toast.promise(resendVerifyEmailAPI(), {
        pending: "Resending email verification...",
        success: "Email Verification Resent",
        error: "Error Resending Email Verification",
      });

      getUser();
    } catch (e) {
      console.log("Error resending email verification", e);
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
        {"emailVerified" in user && !user.emailVerified && (
          <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
            <p className="text-gray-primary">Email not verified</p>
            {!user.emailVerified && (
              <button
                className="text-primary hover:text-primary-hover cursor-pointer"
                onClick={resendEmailVerification}
              >
                Resend
              </button>
            )}
          </div>
        )}
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
          <p className="text-gray-primary">Logout all sessions</p>
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
