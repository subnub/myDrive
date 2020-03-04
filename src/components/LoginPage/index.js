import LoginPage from "./LoginPage";
import {startLogin, startLoginCheck, startCreateAccount} from "../../actions/auth"
import {setLoginFailed} from "../../actions/main";
import {connect} from "react-redux";
import React from "react";

class LoginPageContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: undefined,
            loginMode: true,
            email: "",
            password: "",
            verifyPassword: "",
        }
    }

    loginWithToken = () => {

        const token = window.localStorage.getItem("token");
        this.props.dispatch(startLoginCheck(token, this.props.currentRoute))
    }

    login = (e) => {

        e.preventDefault();

        const email = this.state.email
        const password = this.state.password
        const verifyPassword = this.state.verifyPassword;

        if (this.state.loginMode) {

            this.props.dispatch(startLogin(email, password, this.props.currentRoute))

        } else if (password === verifyPassword) {

            this.props.dispatch(startCreateAccount(email, password));

        } else {

            this.props.dispatch(setLoginFailed("Passwords Do Not Match"));
        }
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

    render() {

        return <LoginPage 
                    loginWithToken={this.loginWithToken}
                    switchLoginMode={this.switchLoginMode}
                    login={this.login}
                    emailOnChange={this.emailOnChange}
                    passwordOnChange={this.passwordOnChange}
                    verifyPasswordOnChange={this.verifyPasswordOnChange}
                    {...this.props}
                    state={this.state}/>

    }

}

const mapStateToProps = (state) => ({
    id: state.auth.id,
    loginFailed: state.main.loginFailed,
    currentRoute: state.routes.currentRoute
})

export default connect(mapStateToProps)(LoginPageContainer)