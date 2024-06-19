import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import configStore from "./store/configureStore";
import AppRouter from "./routers/AppRouter";
import "normalize.css/normalize.css";
import "./styles/styles.scss";
import "core-js/stable";
import "regenerator-runtime/runtime";
import "react-circular-progressbar/dist/styles.css";
import { AuthProvider } from "./providers/AuthProvider";
// import '../node_modules/@fortawesome/fontawesome-free/css/all.css';
// import '../node_modules/@fortawesome/fontawesome-free/js/all.js';

const store = configStore();

const jsxWrapper = (
  <Provider store={store}>
    <AppRouter />
  </Provider>
);

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(jsxWrapper);
