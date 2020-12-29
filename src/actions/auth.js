import {setLoginFailed} from "./main";
import {history} from "../routers/AppRouter"
import {resetUpload} from "./uploads"
import axios from "../axiosInterceptor";
import env from "../enviroment/envFrontEnd";
import {setCreateNewAccount} from "./main";

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

        axios.post("/user-service/login", dt).then((response) => {

            // console.log("USER SERVICE LOGIN RESPONSE")

            const id = response.data.user._id;
            const emailVerified = response.data.user.emailVerified;

            env.googleDriveEnabled = response.data.user.googleDriveEnabled;
            env.s3Enabled = response.data.user.s3Enabled;
            env.activeSubscription = response.data.user.activeSubscription;
            env.emailAddress = response.data.user.email;
            env.name = response.data.user.name || ""

            //window.localStorage.setItem("token", token);

            if (emailVerified) {

                dispatch(setLoginFailed(false))
                dispatch(login(id));
                history.push(currentRoute);
            } else {
                console.log("Email Not Verified")
                dispatch(setLoginFailed("Unverified Email", 404))
            }

        }).catch((err) => {
            console.log("USER SERVICE LOGIN ERROR")
            const code = err.response.status;
            dispatch(setLoginFailed("Incorrect Email or Password", code))
            console.log(err);
        })
    }
}

export const startCreateAccount = (email, password) => {

    return (dispatch) => {

        const dt = {email, password};
        axios.post("/user-service/create", dt).then((response) => {
            
            const token = response.data.token;
            const id = response.data.user._id;
            const emailVerified = response.data.user.emailVerified;

            // window.localStorage.setItem("token", token);
    
            if (emailVerified) {
                dispatch(setLoginFailed(false))
                dispatch(login(id));
                history.push("/home");
            } else {
                console.log("Email Not Verified")
                dispatch(setLoginFailed("Unverified Email", 404))
                dispatch(setCreateNewAccount(true))
            }

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

const reload = () => {
    setTimeout(() => {
        window.location.reload(true);
    }, 3000);
}

export const startLoginCheck = (currentRoute) => {

    return (dispatch) => {

        axios.get("/user-service/user").then((response) => {
    
            const emailVerified = response.data.emailVerified;

            const id = response.data._id;

            env.googleDriveEnabled = response.data.googleDriveEnabled;
            env.s3Enabled = response.data.s3Enabled;
            env.activeSubscription = response.data.activeSubscription;
            env.emailAddress = response.data.email;
            env.name = response.data.name || ""

            if (emailVerified) {
                dispatch(setLoginFailed(false))
                dispatch(login(id))
                history.push(currentRoute);
            } else {
                console.log("Email Not Verified")
                dispatch(setLoginFailed("Unverified Email", 404))
            }

            //reload();

        }).catch((err) => {

            console.log("login check error", err, err.response.data, err.data, err.response);
            // window.localStorage.removeItem("token")
            dispatch(setLoginFailed("Login Expired"))
            // history.push("/login")
        })
    }
}

export const startLogoutAll = () => {

    return (dispatch) => {

        axios.post("/user-service/logout-all").then(() => {

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

        axios.post("/user-service/logout").then(() => {

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