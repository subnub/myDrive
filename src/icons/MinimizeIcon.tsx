type MinimizeIconType = React.SVGAttributes<SVGSVGElement>;

const MinimizeIcon: React.FC<MinimizeIconType> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <title>minus</title>
      <path d="M19,13H5V11H19V13Z" fill="currentColor" />
    </svg>
  );
};

export default MinimizeIcon;
