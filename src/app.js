import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux"
import configStore from "./store/configureStore"
import AppRouter from "./routers/AppRouter"
import "normalize.css/normalize.css"
import "./styles/styles.scss";
import "core-js/stable";
import "regenerator-runtime/runtime";
import 'react-circular-progressbar/dist/styles.css';



const store = configStore();

const jsxWrapper = (
    <Provider store={store}>

        <AppRouter />
    </Provider>
)

ReactDOM.render(jsxWrapper, document.getElementById("app"))



