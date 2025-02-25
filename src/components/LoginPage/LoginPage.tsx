import { useEffect, useRef, useState } from "react";
import {
  createAccountAPI,
  getUserAPI,
  loginAPI,
  sendPasswordResetAPI,
} from "../../api/userAPI";
import { useLocation, useNavigate } from "react-router-dom";
import { setUser } from "../../reducers/user";
import { useAppDispatch } from "../../hooks/store";
import capitalize from "lodash/capitalize";
import AlertIcon from "../../icons/AlertIcon";
import Spinner from "../Spinner/Spinner";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { AxiosError } from "axios";
import isEmail from "validator/es/lib/isEmail";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [mode, setMode] = useState<"login" | "create" | "reset">("login");
  const [attemptingLogin, setAttemptingLogin] = useState(true);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const lastSentPassowordReset = useRef(0);

  const attemptLoginWithToken = async () => {
    setAttemptingLogin(true);

    try {
      const userResponse = await getUserAPI();

      const redirectPath = location.state?.from?.pathname || "/home";
      dispatch(setUser(userResponse));
      navigate(redirectPath);
      window.localStorage.setItem("hasPreviouslyLoggedIn", "true");
    } catch (e) {
      setAttemptingLogin(false);
      if (window.localStorage.getItem("hasPreviouslyLoggedIn")) {
        setError("Login Expired");
        window.localStorage.removeItem("hasPreviouslyLoggedIn");
      }
    }
  };

  const login = async () => {
    try {
      setLoadingLogin(true);
      const loginResponse = await loginAPI(email, password);
      window.localStorage.setItem("hasPreviouslyLoggedIn", "true");
      dispatch(setUser(loginResponse));
      navigate("/home");
      setLoadingLogin(false);
    } catch (e) {
      if (
        e instanceof AxiosError &&
        [400, 401].includes(e.response?.status || 0)
      ) {
        setError("Incorrect email or password");
      } else {
        setError("Login Error");
      }
      console.log("Login Error", e);
      setLoadingLogin(false);
    }
  };

  const createAccount = async () => {
    try {
      setLoadingLogin(true);
      const createAccountResponse = await createAccountAPI(email, password);
      window.localStorage.setItem("hasPreviouslyLoggedIn", "true");

      if (createAccountResponse.emailSent) {
        toast.success("Email Verification Sent");
      }

      dispatch(setUser(createAccountResponse.user));
      navigate("/home");
      setLoadingLogin(false);
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 409) {
        setError("Email Already Exists");
      } else if (e instanceof AxiosError && e.response?.status === 400) {
        setError("Validation Error");
      } else {
        setError("Create Account Error");
      }
      console.log("Create Account Error", e);
      setLoadingLogin(false);
    }
  };

  const resetPassword = async () => {
    try {
      const currentDate = Date.now();
      if (currentDate - lastSentPassowordReset.current < 1000 * 60 * 1) {
        await Swal.fire({
          title: "Please wait 1 minute before resending",
          icon: "warning",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Okay",
        });
        return;
      }

      lastSentPassowordReset.current = Date.now();

      setLoadingLogin(true);

      await toast.promise(sendPasswordResetAPI(email), {
        pending: "Sending password reset...",
        success: "Password Reset Sent",
        error: "Error Sending Password Reset",
      });

      setLoadingLogin(false);
    } catch (e) {
      console.log("Create Account Error", e);
      setLoadingLogin(false);
      if (e instanceof AxiosError && e.response?.status === 404) {
        setError("Email does not exist");
      } else if (e instanceof AxiosError && e.response?.status === 403) {
        setError("Email Verification Not Enabled");
      } else {
        setError("Create Account Failed");
      }
    }
  };

  const isSubmitDisabled = (() => {
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
  })();

  const onSubmit = (e: any) => {
    e.preventDefault();
    if (mode === "login") {
      login();
    } else if (mode === "create") {
      createAccount();
    } else if (mode === "reset") {
      resetPassword();
    }
  };

  const headerTitle = (() => {
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
  })();

  const validationError = (() => {
    if (mode === "login" || mode === "reset") return "";

    if (mode === "create") {
      if (password.length) {
        if (password.length < 6) {
          return "Password must be at least 6 characters";
        } else if (password.length > 256) {
          return "Password must be less than 256 characters";
        }
      }

      if (
        password.length &&
        verifyPassword.length &&
        password !== verifyPassword
      ) {
        return "Passwords do not match";
      }

      if (email.length) {
        const isValidEmail = isEmail(email);

        if (email.length < 3) {
          return "Email must be at least 3 characters";
        } else if (email.length > 320) {
          return "Email must be less than 320 characters";
        } else if (!isValidEmail) {
          return "Email is invalid";
        }
      }
    }

    return "";
  })();

  useEffect(() => {
    setError("");
  }, [email.length, password.length, verifyPassword.length]);

  useEffect(() => {
    const loggedIn = window.localStorage.getItem("hasPreviouslyLoggedIn");
    if (loggedIn === "true") {
      attemptLoginWithToken();
    } else {
      setAttemptingLogin(false);
    }
  }, []);

  if (attemptingLogin) {
    return (
      <div>
        <div className="w-screen dynamic-height flex justify-center items-center">
          <div>
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

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
                disabled={
                  isSubmitDisabled || loadingLogin || validationError !== ""
                }
                className="bg-[#3c85ee] border border-[#3c85ee] hover:bg-[#326bcc] rounded-[5px] text-white text-[15px] font-medium cursor-pointer py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="mt-4">
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
            {(validationError || error) && (
              <div className="mt-4">
                <div className="flex justify-center items-center">
                  <AlertIcon className="w-[20px] text-red-600 mr-2" />
                  <p className="text-[#637381] text-[15px]">
                    {validationError || error}
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

export default LoginPage;
