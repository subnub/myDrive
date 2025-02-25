import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../Spinner/Spinner";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";
import { resetPasswordAPI } from "../../api/userAPI";
import AlertIcon from "../../icons/AlertIcon";
import { AxiosError } from "axios";

const ResetPasswordPage = () => {
  const token = useParams().token!;
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const errorMessage = (() => {
    if (password.length === 0) {
      return "";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    } else if (password.length > 256) {
      return "Password must be less than 256 characters";
    }

    if (
      password.length &&
      verifyPassword.length &&
      password !== verifyPassword
    ) {
      return "Passwords do not match";
    }

    return "";
  })();

  const isSubmitDisabled =
    !password.length || password !== verifyPassword || errorMessage;

  const onSubmit = async (e: any) => {
    try {
      e.preventDefault();
      setLoadingLogin(true);
      await toast.promise(resetPasswordAPI(password, token), {
        pending: "Resetting password...",
        success: "Password Reset",
      });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 401) {
        setError("Invalid token error");
      } else {
        setError("Reset Password Failed");
      }
      console.log("Reset Password Error", e);
      setLoadingLogin(false);
    }
  };

  return (
    <div>
      <div className="bg-[#F4F4F6] w-screen dynamic-height flex justify-center items-center">
        <div className="rounded-md shadow-lg bg-white p-10 relative w-[90%] sm:w-[500px] animate-height">
          <div className="absolute -top-10 left-0 right-0 flex justify-center items-center">
            <div className="flex items-center justify-center rounded-full bg-white p-3 shadow-md">
              {!loadingLogin && (
                <img src="/images/icon.png" alt="logo" className="w-[45px]" />
              )}
              {loadingLogin && <Spinner />}
            </div>
          </div>
          <form onSubmit={onSubmit}>
            <p className="text-[#212B36] font-medium text-[25px] mt-0 mb-[15px] text-center">
              Reset password
            </p>

            <input
              type="password"
              placeholder="Password"
              className="w-full h-[48px] pl-[12px] pr-[70px] text-black border border-[#637381] rounded-[5px] outline-none text-[15px] mt-4"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <input
              type="password"
              placeholder="Verify Password"
              className="w-full h-[48px] pl-[12px] pr-[12px] text-black border border-[#637381] rounded-[5px] outline-none text-[15px] mt-4"
              onChange={(e) => setVerifyPassword(e.target.value)}
              value={verifyPassword}
            />

            <div className="flex justify-center items-center mt-4">
              <input
                type="submit"
                value="Reset"
                disabled={!!isSubmitDisabled || loadingLogin}
                className="bg-[#3c85ee] border border-[#3c85ee] hover:bg-[#326bcc] rounded-[5px] text-white text-[15px] font-medium cursor-pointer py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {(error || errorMessage) && (
              <div className="mt-4">
                <div className="flex justify-center items-center">
                  <AlertIcon className="w-[20px] text-red-600 mr-2" />
                  <p className="text-[#637381] text-[15px]">
                    {error ? error : errorMessage}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
    </div>
  );
};

export default ResetPasswordPage;
