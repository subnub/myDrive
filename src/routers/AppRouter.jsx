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
import GoogleAccountPage from "../components/GoogleAccountPage";
import AddStoragePage from "../components/AddStoragePage";
import SettingsPage from "../components/SettingsPage";
import Homepage2 from "../components/Homepage/Homepage2";

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
              <Homepage2 />
            </PrivateRoute>
          }
        />
        <Route
          path="/download-page/:id/:tempToken"
          element={<DownloadPage />}
        />
        <Route
          key={1}
          path="/folder/:id"
          element={
            <PrivateRoute>
              <Homepage2 />
            </PrivateRoute>
          }
        />
        <Route
          key={1}
          path="/search/:query"
          element={
            <PrivateRoute>
              <Homepage2 />
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
