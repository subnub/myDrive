import {setLoginFailed} from "./main";
import {history} from "../routers/AppRouter"
import {resetUpload} from "./uploads"
import axios from "axios";
import env from "../enviroment/envFrontEnd";

const currentURL = env.url;

export const login = (id) => ({
    type: "LOGIN",
    id
})

export const logout = () => ({
    type: "LOGOUT"
})

export const startLogin = (email, password, currentRoute) => {

    return (dispatch) => {

        const dt = {email, password};

        axios.post(currentURL+"/user-service/login", dt).then((response) => {

            const token = response.data.token;
            const id = response.data.user._id;

            window.localStorage.setItem("token", token);
          
            dispatch(setLoginFailed(false))
            dispatch(login(id));
            history.push(currentRoute);

        }).catch((err) => {
            dispatch(setLoginFailed("Incorrect Email or Password"))
            console.log(err);
        })
    }
}

export const startCreateAccount = (email, password) => {

    return (dispatch) => {


        const dt = {email, password};
        axios.post(currentURL+"/user-service/create", dt).then((response) => {
            
            const token = response.data.token;
            const id = response.data.user._id;

            window.localStorage.setItem("token", token);
    
            dispatch(setLoginFailed(false))
            dispatch(login(id));
            history.push("/home");

        }).catch((err) => {

            console.log(err);

            if (err.response) {

                const errStatus = err.response.status;

                if (errStatus === 401) {

                    dispatch(setLoginFailed("Create Blocked By Admin"))

                } else {

                    dispatch(setLoginFailed("Duplicate Email, or Invalid Password"))
                }

            } else {

                dispatch(setLoginFailed("Duplicate Email, or Invalid Password"))
            }
        })
    }
}

export const startLoginCheck = (token, currentRoute) => {

    return (dispatch) => {

        const config = {
            headers: {'Authorization': "Bearer " + token}
        };

        axios.get(currentURL+"/user-service/user", config).then((response) => {
    
            const id = response.data._id;

            dispatch(setLoginFailed(false))
            dispatch(login(id))
            history.push(currentRoute);

        }).catch((err) => {

            console.log("login check error", err);
            window.localStorage.removeItem("token")
            dispatch(setLoginFailed("Login Expired"))
            // history.push("/login")
        })
    }
}

export const startLogoutAll = () => {

    return (dispatch) => {

        const token = window.localStorage.getItem("token")

        const config = {
            headers: {'Authorization': "Bearer " + token}
        };
    
        axios.post(currentURL+"/user-service/logout-all", undefined,config).then(() => {

            window.localStorage.removeItem("token")

            dispatch(resetUpload())
            dispatch(setLoginFailed(false))
            dispatch(logout())

            history.push("/")

        }).catch((err) => {
            console.log(err);
        })

    }

}

export const startLogout = () => {

    return (dispatch) => {

        const token = window.localStorage.getItem("token")

        const config = {
            headers: {'Authorization': "Bearer " + token}
        };
    
        axios.post(currentURL+"/user-service/logout", undefined,config).then(() => {

            window.localStorage.removeItem("token")

            dispatch(resetUpload())
            dispatch(setLoginFailed(false))
            dispatch(logout())

            history.push("/")

        }).catch((err) => {
            console.log(err);
        })

    }
}