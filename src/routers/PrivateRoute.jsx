import React from "react";
import { connect, useSelector } from "react-redux";
import { Route, Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/store";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.user.loggedIn);
  console.log("isAuthenticated", isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
