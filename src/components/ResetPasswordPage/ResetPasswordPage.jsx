import React from "react";

const ResetPasswordPage = (props) => (
    <div class="modal__wrap">
        <div class="inner__modal">
            <div class="password__modal">
                <div class="head__password">
                    <h2>{"Reset Password"}</h2>
                    <div class="close__modal">
                    </div>
                </div>
                <div class="password__content">
                    <form onSubmit={props.resetPassword}>
                        <div style={props.state.passwordChanged ? {display:"none"} : {}} class="group__password">
                            <input value={props.state.password} onChange={props.passwordOnChange} placeholder="New Password" type="password"/>
                        </div>
                        <div style={props.state.passwordChanged ? {display:"none"} : {}} class="group__password">
                            <input value={props.state.verifyPassword} onChange={props.verifyPasswordOnChange} placeholder="Verify New Password" type="password"/>
                        </div>
                        <div class="password__submit">
                        <input type="submit" value={props.state.passwordChanged ? 'Go Back' : 'Submit'}/>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
)

export default ResetPasswordPage;