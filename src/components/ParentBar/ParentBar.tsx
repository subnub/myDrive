import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useUtils } from "../../hooks/utils";
import { useFolder } from "../../hooks/folders";
import SpacerIcon from "../../icons/SpacerIcon";
import ArrowBackIcon from "../../icons/ArrowBackIcon";

const ParentBar = memo(() => {
  const { data: folder } = useFolder(false);
  const navigate = useNavigate();
  const { isHome, isTrash } = useUtils();

  if (isHome || !folder) {
    return <div></div>;
  }

  const goHomeOrTrash = () => {
    if (!isTrash) {
      navigate("/home");
    } else {
      navigate("/trash");
    }
  };

  const goToFolder = () => {
    navigate(`/folder/${folder?._id}`);
  };

  const goBackAFolder = () => {
    if (folder?.parent === "/") {
      navigate("/home");
    } else {
      navigate(`/folder/${folder.parent}`);
    }
  };

  return (
    <div className="w-full items-center flex border border-gray-third  rounded-md">
      <div className="flex items-center">
        <div className="flex items-center justify-center h-full border-r p-2 mr-2 hover:bg-gray-third">
          <ArrowBackIcon
            className="w-5 h-5 cursor-pointer"
            onClick={goBackAFolder}
          />
        </div>
        <a
          className="text-[#637381] text-md leading-[21px] font-medium m-0 no-underline animate cursor-pointer rounded-md p-1 hover:bg-gray-third"
          onClick={goHomeOrTrash}
        >
          {!isTrash ? "Home" : "Trash"}
        </a>
        <SpacerIcon className="text-black mx-2 w-2.5 h-2.5" />
        <p
          onClick={goToFolder}
          className="text-primary text-md leading-[21px] font-medium m-0 whitespace-nowrap max-w-[170px] sm:max-w-[300px] overflow-hidden text-ellipsis cursor-pointer rounded-md p-1 hover:bg-gray-third "
        >
          {folder.name}
        </p>
      </div>
    </div>
  );
});

export default ParentBar;
