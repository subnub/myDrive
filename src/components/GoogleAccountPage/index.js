import React from "react";
import axios from "../../axiosInterceptor";
import Swal from "sweetalert2";
import env from "../../enviroment/envFrontEnd";
import GoogleAccountPage from "./GoogleAccountPage";

class GoogleAccountPageContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            accountDetailsLoaded: false,
            accountEmail: "",
            accountAdded: false,
            info: 'Loading Account Details...'
        }
    }

    componentDidMount = () => {

        axios.get(`/user-service/user`).then((response) => {
            
            this.setState(() => {
                return {
                    ...this.state,
                    accountDetailsLoaded: true,
                    accountEmail: response.data.email
                }
            })
            
        }).catch((err) => {
            console.log("google account page get user err", err);
            Swal.fire({
                icon: 'error',
                title: 'Account Info Error',
                text: 'Could Not Load Account Info',
            })
            this.setState(() => {
                return {
                    ...this.state,
                    info: 'Could Not Load Account'
                }
            })
        })
    }

    addGoogleAccount = (e) => {

        e.preventDefault();

        if (this.state.accountAdded) {

            window.location.assign(env.url);
            return;
        }

        const tokenCode = (new URLSearchParams(window.location.search)).get("code")

        const data = {
            code: tokenCode
        }

        axios.post('/user-service/add-google-storage', data).then((response) => {
        
            Swal.fire(
                'Added Google Account',
                'Google Account Has Been Successfully Linked',
                'success'
            )

            this.setState(() => {
                return {
                    ...this.state,
                    accountAdded: true
                }
            })

        }).catch((err) => {
            console.log("add google storage err", err)
            Swal.fire({
                icon: 'error',
                title: 'Add Google Account Error',
                text: 'Could Not Link Google Account',
            })
        });
    }

    render () {
        return (

            <GoogleAccountPage 
                addGoogleAccount={this.addGoogleAccount}
                state={this.state}
                {...this.props}/>
        )
    }
}

export default GoogleAccountPageContainer;