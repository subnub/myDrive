import React from "react";
import Swal from "sweetalert2";
import axios from "../../axiosInterceptor";
import env from "../../enviroment/envFrontEnd";
import ResetPasswordPage from "./ResetPasswordPage";

class ResetPasswordPageContainer extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            password: "",
            verifyPassword: "",
            passwordChanged: false,
        }
    }

    passwordOnChange = (e) => {

        const value = e.target.value;

        this.setState(() => {

            return {
                ...this.state,
                password: value
            }
        })
    }

    verifyPasswordOnChange = (e) => {

        const value = e.target.value;

        this.setState(() => {

            return {
                ...this.state,
                verifyPassword : value
            }
        })
    }

    resetPassword = (e) => {

        e.preventDefault()

        if (this.state.passwordChanged) {

            window.location.assign(env.url);
            return;
        }

        const id = this.props.match.params.id;

        if (this.state.password === this.state.verifyPassword) {

            const data = {
                passwordToken: id,
                password: this.state.password
            }

            axios.post("/user-service/reset-password", data).then((response) => {
              
                Swal.fire(
                    'Password Successfully Reset',
                    'You Have Successfully Resetted Your Password, All Sessions Have Been Logged Out.',
                    'success'
                )

                this.setState(() => {
                    return {
                        ...this.state,
                        passwordChanged: true
                    }
                })

            }).catch((err) => {
                console.log("reset password err", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Passwords Reset Error',
                  })
            });

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Passwords do not match',
              })
        }
    }

    render() {
        return <ResetPasswordPage 
                    resetPassword={this.resetPassword}
                    passwordOnChange={this.passwordOnChange}
                    verifyPasswordOnChange={this.verifyPasswordOnChange}
                    state={this.state}
                    {...this.props}/>
    }
}

export default ResetPasswordPageContainer;