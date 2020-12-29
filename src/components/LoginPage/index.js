import LoginPage from "./LoginPage";
import {startLogin, startLoginCheck, startCreateAccount} from "../../actions/auth"
import {setLoginFailed, setCreateNewAccount} from "../../actions/main";
import {connect} from "react-redux";
import React from "react";
import axios from "../../axiosInterceptor";
import Swal from "sweetalert2";
import env from "../../enviroment/envFrontEnd";

class LoginPageContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: undefined,
            loginMode: true,
            email: "",
            password: "",
            verifyPassword: "",
            resetPasswordMode: false,
            verifyEmailResent: false,
            verifyEmailResentTimer: 0,
            verifyEmailResentTimerStarted: false
        }

        this.timer;
    }

    loginWithToken = () => {

        this.props.dispatch(startLoginCheck(this.props.currentRoute))
    }

    componentDidUpdate = () => {

        if (this.props.createNewAccount) {
            this.props.dispatch(setCreateNewAccount(false));

            Swal.fire({
                icon: 'info',
                title: 'Email Verification Sent',
                text: 'Sent Email Verification, Please Check Your Inbox.',
              })
        }
    }

    login = (e) => {

        e.preventDefault();

        const email = this.state.email
        const password = this.state.password
        const verifyPassword = this.state.verifyPassword;

        if (this.state.resetPasswordMode) {

            const data = {
                email,
            }
            axios.post("/user-service/send-password-reset", data).then((response) => {
       
                Swal.fire(
                    'Check your email',
                    'If the email address matches any in our database, we’ll send you an email with instructions on how to reset your password.',
                    'success'
                  )

            }).catch((err) => {
                console.log("Reset Password Err", err);
            })

        } else if (this.state.loginMode) {

            this.props.dispatch(startLogin(email, password, this.props.currentRoute))

        } else if (password === verifyPassword) {

            this.props.dispatch(startCreateAccount(email, password));

        } else {

            this.props.dispatch(setLoginFailed("Passwords Do Not Match"));
        }
    }   

    switchResetPasswordMode = () => {

        this.setState(() => {
            return {
                ...this.state,
                resetPasswordMode: !this.state.resetPasswordMode
            }
        })
    }

    switchLoginMode = () => {

        this.setState(() => {

            return {
                ...this.state,
                loginMode: !this.state.loginMode
            }
        })
    }

    emailOnChange = (e) => {

        const value = e.target.value;

        this.setState(() => ({
            ...this.state,
            email: value

        }))
        
    }
    
    passwordOnChange = (e) => {

        const value = e.target.value;

        this.setState(() => ({
            ...this.state,
            password: value
        }))
        
    }

    verifyPasswordOnChange = (e) => {

        const value = e.target.value;

        this.setState(() => ({
            ...this.state,
            verifyPassword: value
        }))
    } 

    startVerifyEmailTimer = () => {

        this.timer = window.setInterval(this.decreaseVerifyTimer, 1000)

    }

    decreaseVerifyTimer = () => {

        if (this.state.verifyEmailResentTimer <= 0 && this.state.verifyEmailResentTimerStarted) {
            clearInterval(this.timer);
            return this.setState(() => {
                return {
                    ...this.state,
                    verifyEmailResentTimerStarted: false,
                    verifyEmailResentTimer: 0,
                    verifyEmailResent: false
                }
            })
        }

        this.setState(() => {

            return {
                ...this.state,
                verifyEmailResentTimer: this.state.verifyEmailResentTimer - 1
            }
        })
    }

    resendEmail = () => {

        if (this.state.verifyEmailResentTimer !== 0) {
            console.log("verify email timer not at 0 yet");
            return;
        }

        axios.post("/user-service/resend-verify-email").then((response) => {
            
            this.setState(() => {
                return {
                    ...this.state,
                    verifyEmailResent: true,
                    verifyEmailResentTimer: 59,
                    verifyEmailResentTimerStarted: true
                }
            }, () => {
                this.startVerifyEmailTimer()
            })
        })
    }

    logout = () => {
     
        // window.localStorage.removeItem("token");

        axios.post("/user-service/logout").then((response) => {

            console.log("user logged out verify email");
            
            //this.props.dispatch(setLoginFailed(false))

            window.location.reload();
            
            // this.setState(() => {
            //     return {
            //         ...this.state,
            //         value: undefined,
            //         loginMode: true,
            //         email: "",
            //         password: "",
            //         verifyPassword: "",
            //         resetPasswordMode: false,
            //         verifyEmailResent: false,
            //         verifyEmailResentTimer: 0,
            //         verifyEmailResentTimerStarted: false,
            //     }
            // })

        }).catch((e) => {
            window.location.reload();
            console.log("Cannot logout user verify email");
        })

    }

    componentDidMount = () => {

        env.emailAddress = "";
        this.setState(() => ({
            ...this.state,
            email: "",
        }))
        this.loginWithToken();

    }

    render() {

        return <LoginPage 
                    loginWithToken={this.loginWithToken}
                    switchLoginMode={this.switchLoginMode}
                    switchResetPasswordMode={this.switchResetPasswordMode}
                    login={this.login}
                    emailOnChange={this.emailOnChange}
                    passwordOnChange={this.passwordOnChange}
                    verifyPasswordOnChange={this.verifyPasswordOnChange}
                    resendEmail={this.resendEmail}
                    logout={this.logout}
                    {...this.props}
                    state={this.state}/>

    }

}

const mapStateToProps = (state) => ({
    id: state.auth.id,
    loginFailed: state.main.loginFailed,
    loginFailedCode: state.main.loginFailedCode,
    currentRoute: state.routes.currentRoute,
    createNewAccount: state.main.createNewAccount,
})

export default connect(mapStateToProps)(LoginPageContainer)