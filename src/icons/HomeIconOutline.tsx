type HomeIconOutlineType = React.SVGAttributes<SVGSVGElement>;

const HomeIconOutline: React.FC<HomeIconOutlineType> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <title>home-variant-outline</title>
      <path
        d="M9,13H15V19H18V10L12,5.5L6,10V19H9V13M4,21V9L12,3L20,9V21H4Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default HomeIconOutline;
