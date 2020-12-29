import SpinnerLogin from ".././SpinnerLogin";
import React from "react";
import env from "../../enviroment/envFrontEnd";

const LoginPage = (props) => {

    return (

        <div>

            {(!props.loginFailed) ?

                <div>

                    <div className="box-layout">

                        <div>
                            <SpinnerLogin />
                        </div>
                    </div>


                </div>

                :

                <div className="sign__back">
                
                    {(props.loginFailed && props.loginFailedCode === 404) ? 
    
                    <div class="sign__block">

                            <div class="sign__inner">

                                <div class="confirm__email">
                                    <h2>Confirm your email address</h2>
                                    <p>We've sent a confirmation email to <span>{env.emailAddress ? env.emailAddress.length !== 0 ? env.emailAddress : props.state.email : props.state.email}</span>.</p>
                                    <p>Refresh this page after confirming email.</p>
                                    <form action="">
                                        {/* <div class="group__input">
                                            <input type="text" placeholder="Enter one-time PIN"/>
                                        </div>
                                        <div class="group__submit">
                                            <input type="submit" value="Continue"/>
                                        </div> */}
                                        <div class="resend__email">
                                            <p style={props.state.verifyEmailResent ? {display:"block"} : {display:"none"}}><span><img src="/assets/checkbox.svg" alt="checkbox"/></span> We’ve resent the email. You can resend again in <span class="full__timer">0:<span class="seconds__span">{props.state.verifyEmailResentTimer}</span></span></p>
                                            <a class="resend__button" onClick={props.resendEmail}>Resend confirmation email</a>
                                            <a class="resend__button" onClick={props.logout}>Logout</a>
                                        </div>
                                    </form>
                            
                            
                                </div>
                            </div>

                        </div>



                        :

                        <div className="login__block">


                        <div className="login__inner">

                            <div class="login__logo">
                                <img src="/images/icon.png" alt="logo"/>
                            </div>

                            {/* <!-- Login form block --> */}
                            <div class="login__form" style={(props.loginFailed && props.loginFailedCode === 404) ? {display:"none"} : {display:"block"}}>
                                <h2>{props.state.loginMode ? "Login to your account" : "Create an account"}</h2>
                                <form onSubmit={props.login}>
                                    <div class="group__input">
                                        <input type="text" placeholder="Email address" onChange={props.emailOnChange} value={props.state.email} ref={(ref) => { props.emailInput = ref }}/>
                                    </div>
                                    {!props.state.resetPasswordMode ? <div class="group__input forgot__pass">
                                        <input type="password" placeholder="Password" onChange={props.passwordOnChange} value={props.state.password} ref={(ref) => { props.passwordInput = ref }}/>
                                        {props.state.loginMode ? <a onClick={props.switchResetPasswordMode}>Forgot?</a> : undefined}
                                    </div> : undefined}
                                    {props.state.loginMode ? undefined :

                                            <div class="group__input">
                                                <input type="password" placeholder="Verify Password" onChange={props.verifyPasswordOnChange} value={props.state.verifyPassword} ref={(ref) => { props.passwordInput = ref }}/>
                                            </div>
                                        }
                                    <div class="group__submit">
                                        <input type="submit" value={props.state.resetPasswordMode ? "Reset" : props.state.loginMode ? "Login" : "Create"}/>
                                    </div>
                                    
                                    {!props.state.resetPasswordMode ? 
                                    
                                    <div class="create__account">
                                        {props.state.loginMode ? 
                                        
                                        <p>Don't have an account? <a onClick={props.switchLoginMode}>Create account</a></p>

                                        :

                                        <p>Back to <a onClick={props.switchLoginMode}>Login</a></p>
                                        }
                                    </div>

                                    :

                                    <div class="create__account">
                                        <p>Back to <a onClick={props.switchResetPasswordMode}>Login</a></p>
                                    </div>
                                }

                                    {props.loginFailed ?

                                        props.loginFailedCode === 404 ? 
                                        <div>
                                            <div className="login__image__wrapper">
                                                <img className="login__image" src="/images/error-red.png" />
                                                <p className="login__title">Email Not Verified</p>
                                            </div>
                                            <div className="login-resend-email__wrapper">
                                                <p className="login-resend-email" onClick={props.resendEmail}>Resend Email Verification</p>
                                                <p className="login-resend-email" onClick={props.logout}>Logout</p>
                                            </div>
                                        </div>
                                            :
                                            <div className="login__image__wrapper">
                                                <img className="login__image" src="/images/error-red.png" />
                                                <p className="login__title">{props.loginFailed}</p>
                                            </div>
                                    :

                                    undefined}

                                </form>
                            </div>



                            {/* <!-- Forgot password block --> */}
                            <div class="forgotpass__form"  style={{display:"none"}}>
                                <h2>Forgot your password?</h2>
                                <p>Type in your email address and we’ll send you instructions to reset your password.</p>
                                <form action="">
                                    <div class="group__input">
                                        <input type="text" placeholder="Email address"/>
                                    </div>
                                    <div class="group__submit">
                                        <input type="submit" value="Submit"/>
                                    </div>
                                </form>
                            </div>

                            <div class="checkemail__pass" style={{display:"none"}}>
                                <h2>Check your email</h2>
                                <p>If the email address matches any in our database, we’ll send you an email with instructions on how to reset your password</p>
                            </div>
                        
                        </div>
                        

                        </div>
       
                    }

                    {/* <!-- Bottom copyright --> */}
                    {/* <div class="bottom__float">
                        <p>Copyright © 2020 myDrive. All Rights Reserved.</p>
                    </div> */}
                    
                </div>

            }

        </div>



    )

}

export default LoginPage