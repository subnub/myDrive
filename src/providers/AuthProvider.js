import React, { createContext, useState, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const authenticated = useSelector((state) => !!state.auth.id);
  const location = useLocation();
  const navigate = useNavigate();
  console.log("isAuthenticated", isAuthenticated);
  if (!authenticated && location.pathname !== "/") {
    navigate("/");
  }

  return <AuthContext.Provider>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
