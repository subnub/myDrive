import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { resetMultiSelect, setMoveModal } from "../../reducers/selected";
import {
  deleteMultiAPI,
  restoreMultiAPI,
  trashMultiAPI,
} from "../../api/filesAPI";
import { useFilesClient, useQuickFilesClient } from "../../hooks/files";
import { useFoldersClient } from "../../hooks/folders";
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

const MultiSelectBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const ignoreFirstMount = useRef(true);
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
  );
  const multiSelectMap = useAppSelector(
    (state) => state.selected.multiSelectMap
  );
  const multiSelectCount = useAppSelector(
    (state) => state.selected.multiSelectCount
  );
  const { invalidateFilesCache } = useFilesClient();
  const { invalidateFoldersCache } = useFoldersClient();
  const { invalidateQuickFilesCache } = useQuickFilesClient();

  const { isTrash, isMedia } = useUtils();

  useEffect(() => {
    if (ignoreFirstMount.current) {
      ignoreFirstMount.current = false;
    } else {
      closeMultiSelect();
    }
  }, [isTrash]);

  const closeMultiSelect = useCallback(() => {
    dispatch(resetMultiSelect());
  }, []);

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
      invalidateFilesCache();
      invalidateFoldersCache();
      invalidateQuickFilesCache();
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
      invalidateFilesCache();
      invalidateFoldersCache();
      invalidateQuickFilesCache();
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
    invalidateFilesCache();
    invalidateFoldersCache();
    invalidateQuickFilesCache();
    closeMultiSelect();
  };

  const moveItems = () => {
    dispatch(setMoveModal({ type: "multi-select", file: null, folder: null }));
  };

  if (!multiSelectMode) return <div></div>;

  return (
    <div className="flex justify-center items-center">
      <div className="border border-[#ebe9f9] bg-[#ebe9f9] rounded-full p-2 px-5 text-black text-sm mb-4 max-w-[600px] w-full mt-4 min-w-[300px] shadow-lg">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            <img
              className="w-[22px] h-[22px] cursor-pointer"
              src="/images/close_icon.png"
              onClick={closeMultiSelect}
            />
            <p className="ml-4">{multiSelectCount} selected</p>
          </div>

          <div className="flex flex-row items-center">
            {!isTrash && (
              <React.Fragment>
                <TrashIcon
                  className="ml-4 cursor-pointer w-5 h-5"
                  onClick={trashItems}
                />
                {!isMedia && (
                  <Moveicon
                    className="ml-4 cursor-pointer w-5 h-5"
                    onClick={moveItems}
                  />
                )}
              </React.Fragment>
            )}
            {isTrash && (
              <React.Fragment>
                <RestoreIcon
                  className="ml-4 cursor-pointer w-5 h-5"
                  onClick={restoreItems}
                />
                <TrashIcon
                  className="ml-4 cursor-pointer text-red-500 w-5 h-5"
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
