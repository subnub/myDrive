import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { useMoveFolders } from "../../hooks/folders";
import { FolderInterface } from "../../types/folders";
import CloseIcon from "../../icons/CloseIcon";
import { resetMoveModal } from "../../reducers/selected";
import { debounce } from "lodash";
import Spinner from "../Spinner";
import HomeIconOutline from "../../icons/HomeIconOutline";
import ArrowBackIcon from "../../icons/ArrowBackIcon";
import classNames from "classnames";
import FolderIcon from "../../icons/FolderIcon";

const MoverPopup = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [parent, setParent] = useState("/");
  const [parentList, setParentList] = useState(["/"]);
  const [selectedFolderID, setSelectedFolderID] = useState("");
  const file = useAppSelector((state) => state.selected.moveModal.file);
  const folder = useAppSelector((state) => state.selected.moveModal.folder);
  const dispatch = useAppDispatch();
  const lastSelected = useRef({
    timestamp: 0,
    folderID: "",
  });

  const { data: folderList, isLoading: isLoadingFolders } = useMoveFolders(
    parent,
    debouncedSearch,
    folder?._id
  );

  const debouncedSetSearchText = useMemo(
    () => debounce(setDebouncedSearch, 500),
    []
  );

  useEffect(() => {
    debouncedSetSearchText(search);
    return () => {
      debouncedSetSearchText.cancel();
    };
  }, [search, debouncedSetSearchText]);

  const onFolderClick = (folderID: string) => {
    const currentDate = Date.now();

    if (
      lastSelected.current.folderID === folderID &&
      currentDate - lastSelected.current.timestamp < 1500
    ) {
      setSearch("");
      setDebouncedSearch("");
      setParentList([...parentList, folderID]);
      setParent(folderID);
      setSelectedFolderID("");
    } else {
      setSelectedFolderID(folderID);
    }

    lastSelected.current.timestamp = Date.now();
    lastSelected.current.folderID = folderID;
  };

  const onBackClick = () => {
    setSearch("");
    setDebouncedSearch("");
    const newParentList = parentList.slice(0, parentList.length - 1);
    if (newParentList.length <= 1) {
      setParent("/");
      setParentList(["/"]);
    } else {
      setParentList(newParentList);
      setParent(newParentList[newParentList.length - 1]);
    }
  };

  const moveText = useMemo(() => {
    if (selectedFolderID) {
      return "Move to selected folder";
    } else if (parent === "/") {
      return "Move home";
    } else {
      return "Move here";
    }
  }, [selectedFolderID, parent]);

  const onHomeClick = () => {
    setSearch("");
    setDebouncedSearch("");
    setParent("/");
    setParentList(["/"]);
    setSelectedFolderID("");
  };

  return (
    <div className="w-screen h-screen bg-black bg-opacity-80 absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center flex-col">
      <div className="absolute top-[20px] flex justify-between w-full">
        <div>
          <CloseIcon
            className="w-[25px] h-[25px] cursor-pointer"
            onClick={() => dispatch(resetMoveModal())}
          />
        </div>
      </div>
      <div className="bg-white w-full max-w-[500px] p-4 rounded-md">
        <div className="flex flex-row items-center">
          <ArrowBackIcon
            className="w-7 h-7 cursor-pointer mr-2"
            onClick={onBackClick}
          />
          <input
            className="w-full py-2 px-3 text-black border border-gray-primary rounded-md text-sm outline-none"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <HomeIconOutline
            className="w-7 h-7 cursor-pointer ml-2"
            onClick={onHomeClick}
          />
        </div>
        <div className="flex flex-col overflow-y-scroll h-[230px]">
          {!isLoadingFolders && (
            <React.Fragment>
              {folderList?.map((folder: FolderInterface) => (
                <div
                  className={classNames(
                    "p-2 border-b border-[#ebe9f9] rounded-md mt-1 flex flex-row items-center",
                    {
                      "bg-primary text-white hover:bg-primary-hover":
                        selectedFolderID === folder._id,
                      "hover:bg-white-hover": selectedFolderID !== folder._id,
                    }
                  )}
                  key={folder._id}
                  onClick={() => onFolderClick(folder._id)}
                >
                  <FolderIcon
                    className={classNames("w-5 h-5 mr-2 select-none", {
                      "text-white": selectedFolderID === folder._id,
                      "text-primary": selectedFolderID !== folder._id,
                    })}
                  />
                  <p className="max-w-[75%] text-ellipsis overflow-hidden select-none">
                    {folder.name}
                  </p>
                </div>
              ))}
            </React.Fragment>
          )}
          {isLoadingFolders && (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button
            className={classNames(
              "bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md"
            )}
          >
            {moveText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoverPopup;
