import React from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import LoginPage from "../components/LoginPage";
import HomePage from "../components/Homepage";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import DownloadPage from "../components/DownloadPage";
import VerifyEmailPage from "../components/VerifyEmailPage";
import uuid from "uuid";
import ResetPasswordPage from "../components/ResetPasswordPage";
import SettingsPage from "../components/SettingsPage";
import Homepage from "../components/Homepage";

// export const history = createHistory();

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact={true} element={<LoginPage />} />
        <Route
          key={1}
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
          key={1}
          path="/folder/:id"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          key={1}
          path="/search/:query"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          key={1}
          path="/search-trash/:query"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          key={1}
          path="/media"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          key={1}
          path="/search-media/:query"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          key={1}
          path="/trash"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route
          key={1}
          path="/folder-trash/:id"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route path="/verify-email/:id" element={<VerifyEmailPage />} />
        <Route path="/reset-password/:id" element={<ResetPasswordPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
{
  /* <Route key={1} path="/home" element={HomePage} />
      <Route path="/download-page/:id/:tempToken" element={DownloadPage} />
      <Route key={1} path="/folder/:id" element={HomePage} />
      <Route key={1} path="/folder-google/:id" element={HomePage} />
      <Route key={1} path="/folder-personal/:id" element={HomePage} />
      <Route key={1} path="/search/:id" element={HomePage} />
      <Route path="/verify-email/:id" element={VerifyEmailPage} />
      <Route path="/reset-password/:id" element={ResetPasswordPage} />
      <Route path="/add-google-account" element={GoogleAccountPage} />
      <Route path="/add-storage" element={AddStoragePage} />
      <Route path="/settings" element={SettingsPage} /> */
}
