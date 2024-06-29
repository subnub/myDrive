import React, { memo, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUtils } from "../../hooks/utils";
import { useFolder } from "../../hooks/folders";
import Spinner from "../Spinner";

const ParentBar = memo(() => {
  const { data: folder, isLoading } = useFolder();
  console.log("folder", folder);
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

  // TODO: Decide how to handle loading
  // if (!isLoading) {
  //   return <div className="flex">

  //   </div>
  // }

  return (
    <div className="w-full items-center hidden sm:flex">
      <div className="flex items-center">
        <a
          className="text-[#637381] text-[18px] leading-[21px] font-medium m-0 no-underline animate cursor-pointer"
          onClick={goHomeOrTrash}
        >
          {!isTrash ? "Home" : "Trash"}
        </a>
        <span className="inline-flex m-[0px_10px]">
          <img src="/assets/spacer.svg" alt="spacer" />
        </span>
        <p
          onClick={goToFolder}
          className="text-[#212b36] text-[18px] leading-[21px] font-medium m-0 whitespace-nowrap max-w-[300px] overflow-hidden text-ellipsis cursor-pointer"
        >
          {folder.name}
        </p>
      </div>
    </div>
  );
});

export default ParentBar;
