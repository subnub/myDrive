type AlertIconType = React.SVGAttributes<SVGSVGElement>;

const AlertIcon: React.FC<AlertIconType> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <title>alert-circle</title>
      <path
        d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default AlertIcon;
