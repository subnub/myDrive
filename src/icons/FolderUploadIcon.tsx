type FolderUploadIconType = React.SVGAttributes<SVGSVGElement>;

const FolderUploadIcon: React.FC<FolderUploadIconType> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <title>folder-upload-outline</title>
      <path
        d="M20 18H4V8H20M20 6H12L10 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V8A2 2 0 0 0 20 6M16 17H14V13H11L15 9L19 13H16Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default FolderUploadIcon;
