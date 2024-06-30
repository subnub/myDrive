import React, { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { resetMultiSelect } from "../../reducers/selected";
import Swal from "sweetalert2";
import {
  deleteMultiAPI,
  restoreMultiAPI,
  trashMultiAPI,
} from "../../api/filesAPI";
import { useFilesClient, useQuickFilesClient } from "../../hooks/files";
import { useFoldersClient } from "../../hooks/folders";
import TrashIcon from "../../icons/TrashIcon";
import Moveicon from "../../icons/MoveIcon";
import { deleteItemsPopup, restoreItemsPopup } from "../../popups/file";
import RestoreIcon from "../../icons/RestoreIcon";
import { useUtils } from "../../hooks/utils";

const MultiSelectBar = () => {
  const dispatch = useAppDispatch();
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

  const { isTrash } = useUtils();

  const closeMultiSelect = () => {
    dispatch(resetMultiSelect());
  };

  const trashItems = async () => {
    const result = await Swal.fire({
      title: "Move to trash?",
      text: "Items in the trash will eventually be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    });

    if (result) {
      const itemsToTrash = Object.values(multiSelectMap);
      await trashMultiAPI(itemsToTrash);
      invalidateFilesCache();
      invalidateFoldersCache();
      invalidateQuickFilesCache();
      closeMultiSelect();
    }
  };

  const deleteItems = async () => {
    const result = await deleteItemsPopup();
    if (result) {
      const itemsToTrash = Object.values(multiSelectMap);
      await deleteMultiAPI(itemsToTrash);
      invalidateFilesCache();
      invalidateFoldersCache();
      invalidateQuickFilesCache();
      closeMultiSelect();
    }
  };

  const restoreItems = async () => {
    const result = await restoreItemsPopup();

    if (result) {
      const itemsToTrash = Object.values(multiSelectMap);
      await restoreMultiAPI(itemsToTrash);
      invalidateFilesCache();
      invalidateFoldersCache();
      invalidateQuickFilesCache();
      closeMultiSelect();
    }
  };

  if (!multiSelectMode) return <div></div>;

  return (
    <div className="flex justify-center items-center">
      <div className="border border-[#ebe9f9] bg-[#ebe9f9] rounded-full p-2 px-5 text-black text-sm mb-4 max-w-[600px] w-full mt-4">
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
              <TrashIcon className="ml-4 cursor-pointer" onClick={trashItems} />
            )}
            {isTrash && (
              <React.Fragment>
                <RestoreIcon
                  className="ml-4 cursor-pointer h-[20px] w-[20px]"
                  onClick={restoreItems}
                />
                <TrashIcon
                  className="ml-4 cursor-pointer text-red-500"
                  onClick={deleteItems}
                />
              </React.Fragment>
            )}

            {!isTrash && (
              <Moveicon className="ml-4 cursor-pointer" onClick={() => {}} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSelectBar;
