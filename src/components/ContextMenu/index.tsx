import classNames from "classnames";
import React, { memo, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  deleteFileAPI,
  renameFileAPI,
  downloadFileAPI,
  trashFileAPI,
  restoreFileAPI,
} from "../../api/filesAPI";
import { useFilesClient, useQuickFilesClient } from "../../hooks/files";
import { useFoldersClient } from "../../hooks/folders";
import { useDispatch } from "react-redux";
import { setMoverID } from "../../actions/mover";
import { setShareSelected } from "../../actions/selectedItem";
import {
  deleteFolderAPI,
  renameFolder,
  restoreFolderAPI,
  trashFolderAPI,
} from "../../api/foldersAPI";
import { useClickOutOfBounds, useUtils } from "../../hooks/utils";
import { useAppDispatch } from "../../hooks/store";
import {
  resetSelected,
  setMultiSelectMode,
  setShareModal,
} from "../../reducers/selected";
import TrashIcon from "../../icons/TrashIcon";
import MultiSelectIcon from "../../icons/MultiSelectIcon";
import RenameIcon from "../../icons/RenameIcon";
import ShareIcon from "../../icons/ShareIcon";
import DownloadIcon from "../../icons/DownloadIcon";
import MoveIcon from "../../icons/MoveIcon";
import RestoreIcon from "../../icons/RestoreIcon";
import {
  deleteFilePopup,
  renameFilePopup,
  restoreItemPopup,
  trashItemsPopup,
} from "../../popups/file";
import { FileInterface } from "../../types/file";
import { FolderInterface } from "../../types/folders";
import { toast } from "react-toastify";
import { deleteFolderPopup, renameFolderPopup } from "../../popups/folder";

export interface ContextMenuProps {
  closeContext: () => void;
  contextSelected: {
    selected: boolean;
    X: number;
    Y: number;
  };
  folderMode?: boolean;
  quickItemMode?: boolean;
  file?: FileInterface | null;
  folder?: FolderInterface | null;
  stopPropagation?: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = memo((props) => {
  const { invalidateFilesCache } = useFilesClient();
  const { invalidateFoldersCache } = useFoldersClient();
  const { invalidateQuickFilesCache } = useQuickFilesClient();
  const { wrapperRef } = useClickOutOfBounds(props.closeContext);
  const { isTrash, isMedia } = useUtils();
  const dispatch = useAppDispatch();
  const liClassname =
    "flex w-full px-[20px] py-[12px] items-center font-normal text-[#637381] justify-start no-underline animate hover:bg-[#f6f5fd] hover:text-[#3c85ee] hover:font-medium";
  const spanClassname = "flex items-center justify-center mr-[18px]";

  const renameItem = async () => {
    props.closeContext();
    if (!props.folderMode && props.file) {
      try {
        const filename = await renameFilePopup(props.file.filename);
        if (!filename || filename === props.file.filename) return;
        await toast.promise(renameFileAPI(props.file._id, filename), {
          pending: "Renaming...",
          success: "Renamed",
          error: "Error Renaming",
        });
        invalidateFilesCache();
        invalidateQuickFilesCache();
      } catch (e) {
        console.log("Error renaming file", e);
      }
    } else if (props.folderMode && props.folder) {
      try {
        const folderName = await renameFolderPopup(props.folder.name);
        if (!folderName || folderName === props.folder.name) return;
        await toast.promise(renameFolder(props.folder._id, folderName), {
          pending: "Renaming...",
          success: "Renamed",
          error: "Error Renaming",
        });
        invalidateFoldersCache();
      } catch (e) {
        console.log("Error renaming folder", e);
      }
    }
  };

  const trashItem = async () => {
    props.closeContext();
    if (!props.folderMode && props.file) {
      try {
        const result = await trashItemsPopup();
        if (!result) return;

        await toast.promise(trashFileAPI(props.file._id), {
          pending: "Trashing...",
          success: "Trashed",
          error: "Error Trashing",
        });
        invalidateFilesCache();
        invalidateQuickFilesCache();
        dispatch(resetSelected());
      } catch (e) {
        console.log("Error trashing file", e);
      }
    } else if (props.folderMode && props.folder) {
      try {
        const result = await trashItemsPopup();
        if (!result) return;

        await toast.promise(trashFolderAPI(props.folder._id), {
          pending: "Trashing...",
          success: "Trashed",
          error: "Error Trashing",
        });
        invalidateFoldersCache();
        dispatch(resetSelected());
      } catch (e) {
        console.log("Error trashing folder", e);
      }
    }
  };

  const deleteItem = async () => {
    props.closeContext();
    if (!props.folderMode && props.file) {
      try {
        const result = await deleteFilePopup();
        if (!result) return;

        await toast.promise(deleteFileAPI(props.file._id), {
          pending: "Deleting...",
          success: "Deleted",
          error: "Error Deleting",
        });
        invalidateFilesCache();
        invalidateQuickFilesCache();
        dispatch(resetSelected());
      } catch (e) {
        console.log("Error deleting file", e);
      }
    } else if (props.folderMode && props.folder) {
      try {
        const result = await deleteFolderPopup();
        if (!result) return;

        await toast.promise(deleteFolderAPI(props.folder._id), {
          pending: "Deleting...",
          success: "Deleted",
          error: "Error Deleting",
        });
        invalidateFoldersCache();
        dispatch(resetSelected());
      } catch (e) {
        console.log("Error deleting folder", e);
      }
    }
  };

  const restoreItem = async () => {
    props.closeContext();
    const result = await restoreItemPopup();
    if (!result) return;
    if (!props.folderMode && props.file) {
      try {
        await toast.promise(restoreFileAPI(props.file._id), {
          pending: "Restoring...",
          success: "Restored",
          error: "Error Restoring",
        });
        invalidateFilesCache();
      } catch (e) {
        console.log("Error restoring file", e);
      }
    } else if (props.folderMode && props.folder) {
      try {
        await toast.promise(restoreFolderAPI(props.folder._id), {
          pending: "Restoring...",
          success: "Restored",
          error: "Error Restoring",
        });
        invalidateFoldersCache();
      } catch (e) {
        console.log("Error restoring folder", e);
      }
    }
  };

  const openMoveItemModal = async () => {
    props.closeContext();
    if (!props.folderMode && props.file) {
      dispatch(setMoverID(props.file._id, props.file.metadata.parent, true));
    } else if (props.folderMode && props.folder) {
      dispatch(setMoverID(props.folder._id, props.folder.parent, false));
    }
  };

  const openShareItemModal = () => {
    props.closeContext();
    dispatch(setShareModal(props.file!));
  };

  const downloadItem = () => {
    props.closeContext();
    if (props.file) downloadFileAPI(props.file._id);
  };

  const selectItemMultiSelect = () => {
    props.closeContext();
    if (props.folderMode && props.folder) {
      dispatch(
        setMultiSelectMode({
          type: "folder",
          id: props.folder._id,
          file: null,
          folder: props.folder,
        })
      );
    } else if (!props.folderMode && props.file) {
      dispatch(
        setMultiSelectMode({
          type: props.quickItemMode ? "quick-item" : "file",
          id: props.file._id,
          file: props.file,
          folder: null,
        })
      );
    }
  };

  return (
    <div
      onClick={props.stopPropagation}
      ref={wrapperRef}
      className={classNames(
        "fixed min-w-[215px] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.15),_inset_0px_1px_0px_#f5f7fa] rounded-[4px] mt-[-5px] z-50 ",
        props.contextSelected.selected ? "opacity-100" : "opacity-0"
      )}
      style={
        props.contextSelected.selected
          ? {
              display: "block",
              left: `${props.contextSelected.X}px`,
              top: `${props.contextSelected.Y}px`,
            }
          : { display: "none" }
      }
    >
      <ul className="p-0 list-none m-0 ">
        <li onClick={selectItemMultiSelect} className={liClassname}>
          <a className="flex">
            <span className={spanClassname}>
              <MultiSelectIcon className="w-[19px] h-[20px]" />
            </span>
            Multi-select
          </a>
        </li>
        {!isTrash && !isMedia && (
          <li onClick={renameItem} className={liClassname}>
            <a className="flex">
              <span className={spanClassname}>
                <RenameIcon />
              </span>
              Rename
            </a>
          </li>
        )}
        {!props.folderMode && !isTrash ? (
          <li onClick={openShareItemModal} className={liClassname}>
            <a className="flex" data-modal="share__modal">
              <span className="inline-flex mr-[18px]">
                <ShareIcon />
              </span>
              Share
            </a>
          </li>
        ) : undefined}
        {!props.folderMode && !isTrash ? (
          <li onClick={downloadItem} className={liClassname}>
            <a className="flex">
              <span className={spanClassname}>
                <DownloadIcon />
              </span>
              Download
            </a>
          </li>
        ) : undefined}
        {!isTrash && !isMedia && (
          <li onClick={openMoveItemModal} className={liClassname}>
            <a className="flex" data-modal="destination__modal">
              <span className={spanClassname}>
                <MoveIcon />
              </span>{" "}
              Move
            </a>
          </li>
        )}
        {!isTrash && (
          <li onClick={trashItem} className={liClassname}>
            <a className="flex">
              <span className={spanClassname}>
                <TrashIcon />
              </span>
              Trash
            </a>
          </li>
        )}
        {isTrash && (
          <li onClick={restoreItem} className={liClassname}>
            <a className="flex">
              <span className={spanClassname}>
                <RestoreIcon className="w-[19px] h-[20px]" />
              </span>
              Restore
            </a>
          </li>
        )}
        {isTrash && (
          <li
            onClick={deleteItem}
            className={classNames(liClassname, "hover:text-red-500")}
          >
            <a className="flex">
              <span className={spanClassname}>
                <TrashIcon />
              </span>
              Delete
            </a>
          </li>
        )}
      </ul>
    </div>
  );
});

export default ContextMenu;
