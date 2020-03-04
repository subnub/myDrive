import SpinnerLogin from ".././SpinnerLogin";
import React from "react";

const LoginPage = (props) => {

    if (window.localStorage.getItem("token")) {
        props.loginWithToken()
    }

    return (

        <div>
        
            {(window.localStorage.getItem("token") && !props.loginFailed) ?
        
            <div>
         
                <div className="box-layout">

                    <div>
                        <SpinnerLogin />
                    </div>
                </div>


            </div> 
        
            :
    
            <div>
                <div className="box-layout">
                    <div className="box-layout__box">
                        <h1 className="box-layout__title">MyDrive</h1>
                        <form onSubmit={props.login}>
                            <input className="box-layout__input" placeholder="Email" type="text" onChange={props.emailOnChange} value={props.state.email} ref={(ref) => {props.emailInput = ref}}/>
                            <input className="box-layout__input" placeholder="Password" type="password" onChange={props.passwordOnChange} value={props.state.password} ref={(ref) => {props.passwordInput = ref}}/>
                            {props.state.loginMode ? undefined : 
                                <input className="box-layout__input" placeholder="Verify Password" type="password" onChange={props.verifyPasswordOnChange} value={props.state.verifyPassword} ref={(ref) => {props.passwordInput = ref}}/>
                            }
                            <button className="button box-layout--button">{props.state.loginMode ? "Login": "Create"}</button>
                            <p className="box-layout__text" onClick={props.switchLoginMode}>{props.state.loginMode ? "Create Account": "Back To Login"}</p>

                            {props.loginFailed ? 
             
                                <div className="login__image__wrapper"> 
                                    <img className="login__image" src="/images/error-red.png"/>
                                    <p className="login__title">{props.loginFailed}</p>
                                </div>

                            :

                            undefined}

                        </form>
                    </div>
                </div>
         </div>

        }
        
        </div>

         
         
     )

}

export default LoginPage