import { useLocation, useNavigate } from "react-router-dom";

const withNavigate = (Component) => {
  return (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    return <Component {...props} navigate={navigate} location={location} />;
  };
};

export default withNavigate;
