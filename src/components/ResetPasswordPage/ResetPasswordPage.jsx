import React from "react";

const ResetPasswordPage = (props) => (
  <div className="modal__wrap">
    <div className="inner__modal">
      <div className="password__modal">
        <div className="head__password">
          <h2>{"Reset Password"}</h2>
          <div className="close__modal"></div>
        </div>
        <div className="password__content">
          <form onSubmit={props.resetPassword}>
            <div
              style={props.state.passwordChanged ? { display: "none" } : {}}
              className="group__password"
            >
              <input
                value={props.state.password}
                onChange={props.passwordOnChange}
                placeholder="New Password"
                type="password"
              />
            </div>
            <div
              style={props.state.passwordChanged ? { display: "none" } : {}}
              className="group__password"
            >
              <input
                value={props.state.verifyPassword}
                onChange={props.verifyPasswordOnChange}
                placeholder="Verify New Password"
                type="password"
              />
            </div>
            <div className="password__submit">
              <input
                type="submit"
                value={props.state.passwordChanged ? "Go Back" : "Submit"}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
);

export default ResetPasswordPage;
