import React, { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { resetMultiSelect, setMoveModal } from "../../reducers/selected";
import {
  deleteMultiAPI,
  restoreMultiAPI,
  trashMultiAPI,
} from "../../api/filesAPI";
import { useFiles, useQuickFiles } from "../../hooks/files";
import TrashIcon from "../../icons/TrashIcon";
import Moveicon from "../../icons/MoveIcon";
import {
  deleteItemsPopup,
  restoreItemsPopup,
  trashItemsPopup,
} from "../../popups/file";
import RestoreIcon from "../../icons/RestoreIcon";
import { useUtils } from "../../hooks/utils";
import { toast } from "react-toastify";
import DownloadIcon from "../../icons/DownloadIcon";
import { downloadZIPAPI } from "../../api/foldersAPI";
import CloseIcon from "../../icons/CloseIcon";
import { useLocation } from "react-router-dom";
import { useFolders } from "../../hooks/folders";

const MultiSelectBar: React.FC = () => {
  const dispatch = useAppDispatch();
  // const ignoreFirstMount = useRef(true);
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
  );
  const multiSelectMap = useAppSelector(
    (state) => state.selected.multiSelectMap
  );
  const multiSelectCount = useAppSelector(
    (state) => state.selected.multiSelectCount
  );
  const { refetch: refetchFiles } = useFiles(false);
  const { refetch: refetchFolders } = useFolders(false);
  const { refetch: refetchQuickFiles } = useQuickFiles(false);

  const { isTrash, isMedia } = useUtils();

  const location = useLocation();

  // useEffect(() => {
  //   if (ignoreFirstMount.current) {
  //     ignoreFirstMount.current = false;
  //   } else {
  //     closeMultiSelect();
  //   }
  // }, [isTrash]);

  const closeMultiSelect = useCallback(() => {
    dispatch(resetMultiSelect());
  }, []);

  useEffect(() => {
    closeMultiSelect();
  }, [location.pathname, closeMultiSelect]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        closeMultiSelect();
      }
    },
    [closeMultiSelect]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const trashItems = async () => {
    try {
      const result = await trashItemsPopup();
      if (!result) return;

      const itemsToTrash = Object.values(multiSelectMap);
      await toast.promise(trashMultiAPI(itemsToTrash), {
        pending: "Trashing...",
        success: "Trashed",
        error: "Error Trashing",
      });
      refetchFiles();
      refetchFolders();
      refetchQuickFiles();
      closeMultiSelect();
    } catch (e) {
      console.log("Error Trashing Items", e);
    }
  };

  const deleteItems = async () => {
    try {
      const result = await deleteItemsPopup();
      if (!result) return;

      const itesmsToDelete = Object.values(multiSelectMap);
      await toast.promise(deleteMultiAPI(itesmsToDelete), {
        pending: "Deleting...",
        success: "Deleted",
        error: "Error Deleting",
      });
      refetchFiles();
      refetchFolders();
      refetchQuickFiles();
      closeMultiSelect();
    } catch (e) {
      console.log("Error Deleting Items", e);
    }
  };

  const restoreItems = async () => {
    const result = await restoreItemsPopup();
    if (!result) return;

    const itemsToRestore = Object.values(multiSelectMap);
    await toast.promise(restoreMultiAPI(itemsToRestore), {
      pending: "Restoring...",
      success: "Restored",
      error: "Error Restoring",
    });
    refetchFiles();
    refetchFolders();
    refetchQuickFiles();
    closeMultiSelect();
  };

  const moveItems = () => {
    dispatch(setMoveModal({ type: "multi-select", file: null, folder: null }));
  };

  const downloadItems = () => {
    const folders = [];
    const files = [];

    for (const key of Object.keys(multiSelectMap)) {
      const item = multiSelectMap[key];
      if (item.type === "folder") {
        folders.push(item.id);
      } else {
        files.push(item.id);
      }
    }

    downloadZIPAPI(folders, files);
  };

  if (!multiSelectMode) return <div></div>;

  return (
    <div className="flex justify-center items-center">
      <div className="border border-[#ebe9f9] bg-[#ebe9f9] rounded-full p-2 px-5 text-black text-sm mb-4 max-w-[600px] w-full mt-4 min-w-[300px] shadow-lg">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            <CloseIcon
              className="w-7 h-7 md:w-5 md:h-5 cursor-pointer hover:text-primary"
              onClick={closeMultiSelect}
            />
            <p className="ml-4 select-none">{multiSelectCount} selected</p>
          </div>

          <div className="flex flex-row items-center">
            {!isTrash && (
              <React.Fragment>
                <TrashIcon
                  className="ml-4 cursor-pointer w-7 h-7 md:w-5 md:h-5 hover:text-primary"
                  onClick={trashItems}
                />
                {!isMedia && (
                  <Moveicon
                    className="ml-4 cursor-pointer w-7 h-7 md:w-5 md:h-5 hover:text-primary"
                    onClick={moveItems}
                  />
                )}
                <DownloadIcon
                  className="ml-4 cursor-pointer w-7 h-7 md:w-5 md:h-5 hover:text-primary"
                  onClick={downloadItems}
                />
              </React.Fragment>
            )}
            {isTrash && (
              <React.Fragment>
                <RestoreIcon
                  className="ml-4 cursor-pointerw-7 h-7 md:w-5 md:h-5 hover:text-primary"
                  onClick={restoreItems}
                />
                <TrashIcon
                  className="ml-4 cursor-pointer text-red-500 w-7 h-7 md:w-5 md:h-5 hover:text-red-700"
                  onClick={deleteItems}
                />
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSelectBar;
