import SpinnerLogin from "../SpinnerLogin";
import React, { useEffect, useState } from "react";
import env from "../../enviroment/envFrontEnd";
import { getUserAPI } from "../../api/user";
import { useLocation, useNavigate } from "react-router-dom";
import { setUser } from "../../reducers/user";
import { useAppDispatch } from "../../hooks/store";

const LoginPage = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [attemptingLogin, setAttemptingLogin] = useState(false);
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
    }
  };

  const onSubmit = () => {};

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
      <div className="sign__back">
        <div className="login__block">
          <div className="login__inner">
            <div className="login__logo">
              <img src="/images/icon.png" alt="logo" />
            </div>

            {/* <!-- Login form block --> */}
            <div
              className="login__form"
              style={
                props.loginFailed && props.loginFailedCode === 404
                  ? { display: "none" }
                  : { display: "block" }
              }
            >
              <h2>
                {props.state.loginMode
                  ? "Login to your account"
                  : "Create an account"}
              </h2>
              <form onSubmit={props.login}>
                <div className="group__input">
                  <input
                    type="text"
                    placeholder="Email address"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>
                {!props.state.resetPasswordMode ? (
                  <div className="group__input forgot__pass">
                    <input
                      type="password"
                      placeholder="Password"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                    />
                    {props.state.loginMode ? (
                      <a onClick={props.switchResetPasswordMode}>Forgot?</a>
                    ) : undefined}
                  </div>
                ) : undefined}
                {props.state.loginMode ? undefined : (
                  <div className="group__input">
                    <input
                      type="password"
                      placeholder="Verify Password"
                      onChange={(e) => setVerifyPassword(e.target.value)}
                      value={verifyPassword}
                    />
                  </div>
                )}
                <div className="group__submit">
                  <input
                    type="submit"
                    value={
                      props.state.resetPasswordMode
                        ? "Reset"
                        : props.state.loginMode
                        ? "Login"
                        : "Create"
                    }
                  />
                </div>

                {!props.state.resetPasswordMode ? (
                  <div className="create__account">
                    {props.state.loginMode ? (
                      <p>
                        Don't have an account?{" "}
                        <a onClick={props.switchLoginMode}>Create account</a>
                      </p>
                    ) : (
                      <p>
                        Back to <a onClick={props.switchLoginMode}>Login</a>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="create__account">
                    <p>
                      Back to{" "}
                      <a onClick={props.switchResetPasswordMode}>Login</a>
                    </p>
                  </div>
                )}

                {props.loginFailed && (
                  <div className="login__image__wrapper">
                    <img className="login__image" src="/images/error-red.png" />
                    <p className="login__title">{props.loginFailed}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
