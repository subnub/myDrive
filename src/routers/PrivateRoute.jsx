import React from "react";
import { connect, useSelector } from "react-redux";
import { Route, Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => !!state.auth.id);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
