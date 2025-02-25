type ChevronOutlineType = React.SVGAttributes<SVGSVGElement>;

const ChevronOutline: React.FC<ChevronOutlineType> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="35"
      height="35"
      {...props}
    >
      <path
        d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default ChevronOutline;
