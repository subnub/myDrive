import { connect } from "react-redux";
import React from "react";
import { Route, Navigate } from "react-router-dom";

export const PublicRoute = (
  { isAuthenticated, component: Component },
  ...rest
) => (
  <Route
    {...rest}
    component={(props) =>
      isAuthenticated ? <Navigate to="/home" /> : <Component {...props} />
    }
  />
);

const connectStateToProps = (state) => ({
  isAuthenticated: !!state.auth.id,
});

export default connect(connectStateToProps)(PublicRoute);
