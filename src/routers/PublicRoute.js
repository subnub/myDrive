import {connect} from "react-redux";
import React from "react";
import {Route, Redirect} from "react-router-dom"

export const PublicRoute = ({isAuthenticated, component: Component}, ...rest) => (
    <Route {...rest} component={(props) => (
        isAuthenticated ? (<Redirect to="/home"/>) : (<Component {...props}/>)
    )}/>
)

const connectStateToProps = (state) => ({
    isAuthenticated: !!state.auth.id
})

export default connect(connectStateToProps)(PublicRoute)