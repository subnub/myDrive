import React from "react";
import {Router, Route, Switch} from "react-router-dom";
import LoginPage from "../components/LoginPage"
import createHistory from "history/createBrowserHistory"
import HomePage from "../components/Homepage"
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import DownloadPage from "../components/DownloadPage";
import uuid from "uuid"

export const history = createHistory()

const AppRouter = () => (

    <Router history={history} >

    <Switch>

        <Route path="/" exact={true} component={LoginPage}/>
        <Route key={1} path="/home" component={HomePage}/>
        <Route path="/download-page/:id/:tempToken" component={DownloadPage}/>
        <Route key={1} path="/folder/:id" component={HomePage}/>
        <Route key={1} path="/search/:id" component={HomePage}/>
    </Switch>

    </Router>
)

export default AppRouter;
