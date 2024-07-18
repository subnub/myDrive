import SpinnerLogin from "../SpinnerLogin";
import React, { useEffect, useMemo, useState } from "react";
import { getUserAPI, loginAPI } from "../../api/user";
import { useLocation, useNavigate } from "react-router-dom";
import { setUser } from "../../reducers/user";
import { useAppDispatch } from "../../hooks/store";
import { capitalize } from "lodash";
import AlertIcon from "../../icons/AlertIcon";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [mode, setMode] = useState<"login" | "create" | "reset">("login");
  const [attemptingLogin, setAttemptingLogin] = useState(false);
  const [loginExpired, setLoginExpired] = useState(false);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const attemptLoginWithToken = async () => {
    setAttemptingLogin(true);
    console.log("login with token");

    try {
      const userResponse = await getUserAPI();
      console.log("user response", userResponse);
      if (userResponse.emailVerified) {
        // TODO: Fix this
      }

      const redirectPath = location.state?.from?.pathname || "/home";
      console.log("redirect path", redirectPath);
      dispatch(setUser(userResponse));
      navigate(redirectPath);
      setAttemptingLogin(false);
      window.localStorage.setItem("hasPreviouslyLoggedIn", "true");
    } catch (e) {
      console.log("Login Error", e);
      setAttemptingLogin(false);
      if (window.localStorage.getItem("hasPreviouslyLoggedIn")) {
        setLoginExpired(true);
      }
    }
  };

  const login = async () => {
    try {
      const loginResponse = await loginAPI(email, password);
      console.log("login response", loginResponse);
      window.localStorage.setItem("hasPreviouslyLoggedIn", "true");
      dispatch(setUser(loginResponse));
      navigate("/home");
    } catch (e) {
      console.log("Login Error", e);
    }
  };

  const isSubmitDisabled = useMemo(() => {
    switch (mode) {
      case "login":
        return !email || !password;
      case "create":
        return !email || !password || !verifyPassword;
      case "reset":
        return !email;
      default:
        return false;
    }
  }, [email, password, verifyPassword, mode]);

  const onSubmit = (e: any) => {
    e.preventDefault();
    if (mode === "login") {
      login();
    }
  };

  const headerTitle = useMemo(() => {
    switch (mode) {
      case "login":
        return "Login to your account";
      case "create":
        return "Create an account";
      case "reset":
        return "Reset Password";
      default:
        return "Login to your account";
    }
  }, [mode]);

  useEffect(() => {
    attemptLoginWithToken();
  }, []);

  if (attemptingLogin) {
    return (
      <div>
        <div className="box-layout">
          <div>
            <SpinnerLogin />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#F4F4F6] w-screen h-screen flex justify-center items-center">
        <div className="rounded-md shadow-lg bg-white p-10 relative min-w-[500px]">
          <div className="absolute -top-10 left-0 right-0 flex justify-center items-center">
            <div className="flex items-center justify-center rounded-full bg-white p-3 shadow-md">
              <img src="/images/icon.png" alt="logo" className="w-[45px]" />
            </div>
          </div>
          <form onSubmit={onSubmit}>
            <p className="text-[#212B36] font-medium text-[25px] mt-0 mb-[15px] text-center">
              {headerTitle}
            </p>
            {/* Email Address */}
            <input
              type="text"
              placeholder="Email address"
              className="w-full h-[48px] pl-[12px] pr-[12px] text-black border border-[#637381] rounded-[5px] outline-none text-[15px]"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />

            {/* Password */}
            {(mode === "login" || mode === "create") && (
              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full h-[48px] pl-[12px] pr-[70px] text-black border border-[#637381] rounded-[5px] outline-none text-[15px] mt-4"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                {mode === "login" && (
                  <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center">
                    <a
                      className="text-[#3c85ee] text-[15px] font-medium no-underline mr-2 mt-4"
                      onClick={() => setMode("reset")}
                    >
                      Forgot?
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Verify Password */}
            {mode === "create" && (
              <input
                type="password"
                placeholder="Verify Password"
                className="w-full h-[48px] pl-[12px] pr-[12px] text-black border border-[#637381] rounded-[5px] outline-none text-[15px] mt-4"
                onChange={(e) => setVerifyPassword(e.target.value)}
                value={verifyPassword}
              />
            )}

            <div className="flex justify-center items-center mt-4">
              <input
                type="submit"
                value={capitalize(mode)}
                disabled={isSubmitDisabled}
                className="bg-[#3c85ee] border border-[#3c85ee] rounded-[5px] text-white text-[15px] font-medium cursor-pointer py-2 px-4 disabled:opacity-50"
              />
            </div>

            <div className="mt-2">
              {mode === "login" && (
                <p className="text-center text-[#637381] text-[15px] font-normal">
                  Don't have an account?{" "}
                  <a
                    onClick={() => setMode("create")}
                    className="text-[#3c85ee] text-[15px] font-medium no-underline"
                  >
                    Create account
                  </a>
                </p>
              )}
              {(mode === "create" || mode === "reset") && (
                <p className="text-center text-[#637381] text-[15px] font-normal">
                  Back to{" "}
                  <a
                    onClick={() => setMode("login")}
                    className="text-[#3c85ee] text-[15px] font-medium no-underline"
                  >
                    Login
                  </a>
                </p>
              )}
            </div>
            {loginExpired && (
              <div className="mt-4">
                <div className="flex justify-center items-center">
                  <AlertIcon className="w-[20px] text-red-600 mr-2" />
                  <p className="text-[#637381] text-[15px]">Login expired</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
