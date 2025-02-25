import React from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import LoginPage from "../components/LoginPage/LoginPage";
import HomePage from "../components/Homepage/Homepage";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import DownloadPage from "../components/DownloadPage/DownloadPage";
import VerifyEmailPage from "../components/VerifyEmailPage/VerifyEmailPage";
import uuid from "uuid";
import ResetPasswordPage from "../components/ResetPasswordPage/ResetPasswordPage";
import SettingsPage from "../components/SettingsPage/SettingsPage";
import Homepage from "../components/Homepage/Homepage";
import { usePreferenceSetter } from "../hooks/preferenceSetter";
import useAccessTokenHandler from "../hooks/user";

// export const history = createHistory();

const AppRouter = () => {
  usePreferenceSetter();
  useAccessTokenHandler();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact={true} element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          path="/public-download/:id/:tempToken"
          element={<DownloadPage />}
        />
        <Route
          path="/folder/:id"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          path="/search/:query"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          path="/search-trash/:query"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          path="/media"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          path="/search-media/:query"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          path="/trash"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          path="/folder-trash/:id"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
