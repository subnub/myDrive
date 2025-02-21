import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { useFolders, useMoveFolders } from "../../hooks/folders";
import { FolderInterface } from "../../types/folders";
import CloseIcon from "../../icons/CloseIcon";
import { resetMoveModal } from "../../reducers/selected";
import debounce from "lodash/debounce";
import Spinner from "../Spinner/Spinner";
import HomeIconOutline from "../../icons/HomeIconOutline";
import ArrowBackIcon from "../../icons/ArrowBackIcon";
import classNames from "classnames";
import FolderIcon from "../../icons/FolderIcon";
import { toast } from "react-toastify";
import { moveFileAPI, moveMultiAPI } from "../../api/filesAPI";
import { useFiles } from "../../hooks/files";
import { moveFolderAPI } from "../../api/foldersAPI";

const MoverPopup = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [parent, setParent] = useState<FolderInterface | null>(null);
  const [parentList, setParentList] = useState<FolderInterface[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderInterface | null>(
    null
  );
  const [animate, setAnimate] = useState(false);
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
  );
  const multiSelectMap = useAppSelector(
    (state) => state.selected.multiSelectMap
  );
  const [isLoadingMove, setIsLoadingMove] = useState(false);
  const file = useAppSelector((state) => state.selected.moveModal.file);
  const folder = useAppSelector((state) => state.selected.moveModal.folder);
  const dispatch = useAppDispatch();
  const { refetch: refetchFiles } = useFiles(false);
  const { refetch: refetchFolders } = useFolders(false);
  const lastSelected = useRef({
    timestamp: 0,
    folderID: "",
  });

  const foldersToMove = useAppSelector((state) => {
    if (state.selected.multiSelectMode) {
      return Object.keys(state.selected.multiSelectMap);
    } else {
      return [state.selected.mainSection.id];
    }
  });

  const { data: folderList, isLoading: isLoadingFolders } = useMoveFolders(
    parent?._id || "/",
    debouncedSearch,
    foldersToMove
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

  const onFolderClick = (folder: FolderInterface) => {
    const currentDate = Date.now();

    if (
      lastSelected.current.folderID === folder._id &&
      currentDate - lastSelected.current.timestamp < 1500
    ) {
      setSearch("");
      setDebouncedSearch("");
      setParentList([...parentList, folder]);
      setParent(folder);
      setSelectedFolder(null);
    } else {
      setSelectedFolder(folder);
    }

    lastSelected.current.timestamp = Date.now();
    lastSelected.current.folderID = folder._id;
  };

  const onBackClick = () => {
    if (!parent) return;
    setSearch("");
    setDebouncedSearch("");
    const newParentList = parentList.slice(0, parentList.length - 1);
    if (newParentList.length === 0) {
      setParent(null);
      setParentList([]);
    } else {
      setParentList(newParentList);
      setParent(newParentList[newParentList.length - 1]);
    }
  };

  const moveText = (() => {
    if (selectedFolder?._id && selectedFolder?.name) {
      return `Move to ${selectedFolder.name}`;
    } else if (!parent) {
      return "Move to home";
    } else {
      const lastParent = parentList[parentList.length - 1];
      return `Move to ${lastParent.name}`;
    }
  })();

  const headerText = (() => {
    if (parent) {
      return parent.name;
    } else {
      return "Home";
    }
  })();

  useEffect(() => {
    setAnimate(true);
  }, []);

  const onHomeClick = () => {
    setSearch("");
    setDebouncedSearch("");
    setParent(null);
    setParentList([]);
    setSelectedFolder(null);
  };

  const onMoveClick = async () => {
    setIsLoadingMove(true);
    const moveTo = selectedFolder?._id
      ? selectedFolder?._id
      : parent?._id || "/";
    try {
      if (multiSelectMode) {
        const itemsToMove = Object.values(multiSelectMap);
        await toast.promise(moveMultiAPI(itemsToMove, moveTo), {
          pending: "Moving items...",
          success: "Items Moved",
          error: "Error Moving Items",
        });
        refetchFiles();
        refetchFolders();
        dispatch(resetMoveModal());
      } else if (file) {
        await toast.promise(moveFileAPI(file._id, moveTo), {
          pending: "Moving File...",
          success: "File Moved",
          error: "Error Moving File",
        });
        refetchFiles();
        dispatch(resetMoveModal());
      } else if (folder) {
        await toast.promise(moveFolderAPI(folder._id, moveTo), {
          pending: "Moving Folder...",
          success: "Folder Moved",
          error: "Error Moving Folder",
        });
        refetchFolders();
        dispatch(resetMoveModal());
      }
      console.log("move to", moveTo);
    } catch (e) {
      console.log("move error", e);
    } finally {
      setIsLoadingMove(false);
    }
  };

  const onTitleClick = () => {
    setSelectedFolder(parentList[parentList.length - 1]);
  };

  const closeModal = () => {
    setAnimate(false);
    setTimeout(() => dispatch(resetMoveModal()), 200);
  };

  const wrapperClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.id !== "outer-wrapper") return;
    closeModal();
  };

  return (
    <div
      className="w-screen dynamic-height bg-black bg-opacity-80 absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center flex-col"
      id="outer-wrapper"
      onClick={wrapperClick}
    >
      <div className="absolute top-[20px] flex justify-end w-full">
        <div>
          <CloseIcon
            className="w-6 h-6 cursor-pointer text-white mr-4"
            onClick={closeModal}
          />
        </div>
      </div>
      <div
        className="bg-white w-full max-w-[500px] p-4 rounded-md animate-easy"
        style={{ marginTop: !animate ? "calc(100vh + 480px" : 0 }}
      >
        <div
          className={classNames("flex flex-row items-center", {
            "justify-between": multiSelectMode,
          })}
        >
          <ArrowBackIcon
            className={classNames("w-7 h-7 cursor-pointer mr-2", {
              "opacity-50": !parent,
            })}
            onClick={onBackClick}
          />
          {!multiSelectMode && (
            <input
              className="w-full py-2 px-3 text-black border border-gray-primary rounded-md text-sm outline-none"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          <HomeIconOutline
            className="w-7 h-7 cursor-pointer ml-2"
            onClick={onHomeClick}
          />
        </div>
        <div>
          <p
            className="text-lg mt-2 mb-2 max-w-[75%] text-ellipsis overflow-hidden select-none cursor-pointer"
            onClick={onTitleClick}
          >
            {headerText}
          </p>
        </div>
        <div className="flex flex-col overflow-y-scroll h-[230px]">
          {!isLoadingFolders && (
            <React.Fragment>
              {folderList?.map((folder: FolderInterface) => (
                <div
                  className={classNames(
                    "p-2 border-b border-[#ebe9f9] rounded-md flex flex-row items-center",
                    {
                      "bg-primary text-white hover:bg-primary-hover":
                        selectedFolder?._id === folder._id,
                      "hover:bg-white-hover":
                        selectedFolder?._id !== folder._id,
                    }
                  )}
                  key={folder._id}
                  onClick={() => onFolderClick(folder)}
                >
                  <FolderIcon
                    className={classNames("w-5 h-5 mr-2 select-none", {
                      "text-white": selectedFolder?._id === folder._id,
                      "text-primary": selectedFolder?._id !== folder._id,
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
        <div className="mt-4 border border-gray-secondary rounded-md p-4">
          <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap select-none">
            {moveText}
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            className={classNames(
              "bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md",
              {
                "opacity-50": isLoadingMove,
              }
            )}
            onClick={onMoveClick}
            disabled={isLoadingMove}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoverPopup;
