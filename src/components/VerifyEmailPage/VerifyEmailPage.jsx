import React from "react";

const VerifyEmailPage = (props) => (
    <div className="verify-page__wrapper">
        <p className="verify-page__title">{props.state.error ? "Verification Error" : props.state.verified ? "Email Verified" : "Verifying Email..."}</p>
    </div>
)

export default VerifyEmailPage;