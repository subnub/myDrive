import { useState } from "react";
import CloseIcon from "../../icons/CloseIcon";
import classNames from "classnames";
import { toast } from "react-toastify";
import { changePasswordAPI } from "../../api/userAPI";
import { AxiosError } from "axios";

interface SettingsChangePasswordPopupProps {
  closePopup: () => void;
}

const SettingsChangePasswordPopup: React.FC<
  SettingsChangePasswordPopupProps
> = ({ closePopup }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verifyNewPassword, setVerifyNewPassword] = useState("");
  const [loadingChangePassword, setLoadingChangePassword] = useState(false);

  const inputDisabled = (() => {
    if (
      loadingChangePassword ||
      currentPassword.length === 0 ||
      newPassword.length === 0 ||
      verifyNewPassword.length === 0
    ) {
      return true;
    }

    if (newPassword !== verifyNewPassword) {
      return true;
    }

    if (newPassword.length < 6) {
      return true;
    }

    return false;
  })();

  const errorMessage = (() => {
    if (newPassword.length === 0) {
      return "";
    }

    if (newPassword.length < 6) {
      return "Password must be at least 6 characters";
    } else if (newPassword.length > 256) {
      return "Password must be less than 256 characters";
    }

    if (
      newPassword.length &&
      verifyNewPassword.length &&
      newPassword !== verifyNewPassword
    ) {
      return "Passwords do not match";
    }

    return "";
  })();

  const submitPasswordChange = async (e: any) => {
    e.preventDefault();
    setLoadingChangePassword(true);
    try {
      await toast.promise(changePasswordAPI(currentPassword, newPassword), {
        pending: "Changing password...",
        success: "Password Changed",
      });
      closePopup();
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 401) {
        toast.error("Incorrect password");
      } else {
        toast.error("Error changing password");
      }
      console.log("Error changing password", e);
    } finally {
      setLoadingChangePassword(false);
    }
  };

  const outterWrapperClick = (e: any) => {
    if (e.target.id !== "outer-wrapper") return;
    closePopup();
  };

  return (
    <div
      id="outer-wrapper"
      className="w-screen dynamic-height bg-black bg-opacity-80 absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center flex-col"
      onClick={outterWrapperClick}
    >
      <div className="w-[300px] sm:w-[440px] bg-white rounded-md animate">
        <div className="flex justify-between p-4 border-b border-gray-secondary">
          <p className="text-md ">Change password</p>
          <CloseIcon className="w-6 h-6 cursor-pointer" onClick={closePopup} />
        </div>
        <form className="mt-2 p-4" onSubmit={submitPasswordChange}>
          <label>
            <p className="text-sm text-gray-primary mb-1">Current password</p>
            <input
              className="border border-[#BEC9D3] rounded-md py-2 px-3 text-black w-full text-sm mb-3"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </label>

          <label>
            <p className="text-sm text-gray-primary mb-1">New password</p>
            <input
              className="border border-[#BEC9D3] rounded-md py-2 px-3 text-black w-full mb-3"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>

          <label>
            <p className="text-sm text-gray-primary mb-1">
              Verify new password
            </p>
            <input
              className="border border-[#BEC9D3] rounded-md py-2 px-3 text-black w-full mb-3"
              type="password"
              value={verifyNewPassword}
              onChange={(e) => setVerifyNewPassword(e.target.value)}
            />
          </label>

          {errorMessage && (
            <div className="p-2">
              <p className="text-sm text-red-500 text-center">{errorMessage}</p>
            </div>
          )}

          <div className="flex justify-center mt-2">
            <input
              type="submit"
              value="Submit"
              className={classNames(
                "bg-primary text-white px-4 py-2 rounded-md w-32 cursor-pointer",
                {
                  "opacity-50 cursor-not-allowed": inputDisabled,
                }
              )}
              disabled={inputDisabled}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsChangePasswordPopup;
