import React, { memo, useEffect, useState } from "react";
import {
  deleteFileAPI,
  renameFileAPI,
  downloadFileAPI,
  trashFileAPI,
  restoreFileAPI,
} from "../../api/filesAPI";
import { useFiles, useQuickFiles } from "../../hooks/files";
import {
  deleteFolderAPI,
  downloadZIPAPI,
  renameFolder,
  restoreFolderAPI,
  trashFolderAPI,
} from "../../api/foldersAPI";
import { useClickOutOfBounds, useUtils } from "../../hooks/utils";
import { useAppDispatch } from "../../hooks/store";
import {
  resetSelected,
  setMoveModal,
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
import { useFolders } from "../../hooks/folders";

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
  const [fixedCoords, setFixedCoords] = useState({
    X: 0,
    Y: 0,
    set: false,
  });
  const { refetch: refetchFiles } = useFiles(false);
  const { refetch: refetchFolders } = useFolders(false);
  const { refetch: refetchQuickFiles } = useQuickFiles(false);
  const {
    closeContext,
    contextSelected,
    folderMode,
    file,
    quickItemMode,
    stopPropagation,
    folder,
  } = props;
  const { wrapperRef } = useClickOutOfBounds(closeContext);
  const { isTrash, isMedia } = useUtils();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!wrapperRef.current) return;

    const modalWidth = wrapperRef.current.clientWidth;
    const modalHeight = wrapperRef.current.clientHeight;

    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

    let X = contextSelected.X;
    let Y = contextSelected.Y;

    if (X + modalWidth > windowWidth) {
      X = windowWidth - modalWidth - 10;
    }

    if (Y + modalHeight > windowHeight) {
      Y = windowHeight - modalHeight - 10;
    }

    setFixedCoords({
      X,
      Y,
      set: true,
    });
  }, [wrapperRef, contextSelected.X, contextSelected.Y]);

  const renameItem = async () => {
    closeContext();
    if (!folderMode && file) {
      try {
        const filename = await renameFilePopup(file.filename);
        if (!filename || filename === file.filename) return;
        await toast.promise(renameFileAPI(file._id, filename), {
          pending: "Renaming...",
          success: "Renamed",
          error: "Error Renaming",
        });
        reloadItems();
      } catch (e) {
        console.log("Error renaming file", e);
      }
    } else if (folderMode && folder) {
      try {
        const folderName = await renameFolderPopup(folder.name);
        if (!folderName || folderName === folder.name) return;
        await toast.promise(renameFolder(folder._id, folderName), {
          pending: "Renaming...",
          success: "Renamed",
          error: "Error Renaming",
        });
        reloadItems();
      } catch (e) {
        console.log("Error renaming folder", e);
      }
    }
  };

  const trashItem = async () => {
    closeContext();
    if (!folderMode && file) {
      try {
        const result = await trashItemsPopup();
        if (!result) return;

        await toast.promise(trashFileAPI(file._id), {
          pending: "Trashing...",
          success: "Trashed",
          error: "Error Trashing",
        });
        reloadItems();
      } catch (e) {
        console.log("Error trashing file", e);
      }
    } else if (folderMode && folder) {
      try {
        const result = await trashItemsPopup();
        if (!result) return;

        await toast.promise(trashFolderAPI(folder._id), {
          pending: "Trashing...",
          success: "Trashed",
          error: "Error Trashing",
        });
        reloadItems();
      } catch (e) {
        console.log("Error trashing folder", e);
      }
    }
  };

  const deleteItem = async () => {
    closeContext();
    if (!folderMode && file) {
      try {
        const result = await deleteFilePopup();
        if (!result) return;

        await toast.promise(deleteFileAPI(file._id), {
          pending: "Deleting...",
          success: "Deleted",
          error: "Error Deleting",
        });
        reloadItems();
      } catch (e) {
        console.log("Error deleting file", e);
      }
    } else if (folderMode && folder) {
      try {
        const result = await deleteFolderPopup();
        if (!result) return;

        await toast.promise(deleteFolderAPI(folder._id), {
          pending: "Deleting...",
          success: "Deleted",
          error: "Error Deleting",
        });
        reloadItems();
      } catch (e) {
        console.log("Error deleting folder", e);
      }
    }
  };

  const restoreItem = async () => {
    closeContext();
    const result = await restoreItemPopup();
    if (!result) return;
    if (!folderMode && file) {
      try {
        await toast.promise(restoreFileAPI(file._id), {
          pending: "Restoring...",
          success: "Restored",
          error: "Error Restoring",
        });
        reloadItems();
      } catch (e) {
        console.log("Error restoring file", e);
      }
    } else if (folderMode && folder) {
      try {
        await toast.promise(restoreFolderAPI(folder._id), {
          pending: "Restoring...",
          success: "Restored",
          error: "Error Restoring",
        });
        reloadItems();
      } catch (e) {
        console.log("Error restoring folder", e);
      }
    }
  };

  const reloadItems = () => {
    refetchFiles();
    refetchQuickFiles();
    refetchFolders();
    dispatch(resetSelected());
  };

  const openMoveItemModal = async () => {
    closeContext();
    if (!folderMode && file) {
      // dispatch(setMoverID(file._id, file.metadata.parent, true));
      dispatch(setMoveModal({ type: "file", file, folder: null }));
    } else if (folderMode && folder) {
      //   dispatch(setMoverID(folder._id, folder.parent, false));
      // }
      dispatch(setMoveModal({ type: "folder", file: null, folder }));
    }
  };

  const openShareItemModal = () => {
    closeContext();
    dispatch(setShareModal(file!));
  };

  const downloadItem = () => {
    closeContext();
    if (file) downloadFileAPI(file._id);
    if (folder) downloadZIPAPI([folder._id], []);
  };

  const selectItemMultiSelect = () => {
    closeContext();

    if (folderMode && folder) {
      dispatch(
        setMultiSelectMode([
          {
            type: "folder",
            id: folder._id,
            file: null,
            folder: folder,
          },
        ])
      );
    } else if (!folderMode && file) {
      dispatch(
        setMultiSelectMode([
          {
            type: quickItemMode ? "quick-item" : "file",
            id: file._id,
            file: file,
            folder: null,
          },
        ])
      );
    }
  };

  return (
    <div className="w-screen dynamic-height absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center flex-col">
      <div
        onClick={stopPropagation}
        ref={wrapperRef}
        className="fixed min-w-[215px] bg-white shadow-lg rounded-md z-50"
        style={
          fixedCoords.set
            ? {
                display: "block",
                left: `${fixedCoords.X}px`,
                top: `${fixedCoords.Y}px`,
              }
            : { opacity: 0 }
        }
      >
        <div>
          <div
            onClick={selectItemMultiSelect}
            className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary rounded-t-md"
          >
            <MultiSelectIcon className="w-5 h-5" />
            <p className="ml-2.5 text-sm">Multi-select</p>
          </div>
          {!isTrash && !isMedia && (
            <div
              onClick={renameItem}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary"
            >
              <RenameIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Rename</p>
            </div>
          )}
          {!folderMode && !isTrash && (
            <div
              onClick={openShareItemModal}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary"
            >
              <ShareIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Share</p>
            </div>
          )}
          {!isTrash && (
            <div
              onClick={downloadItem}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary"
            >
              <DownloadIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Download</p>
            </div>
          )}
          {!isTrash && !isMedia && (
            <div
              onClick={openMoveItemModal}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary"
            >
              <MoveIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Move</p>
            </div>
          )}
          {!isTrash && (
            <div
              onClick={trashItem}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary rounded-b-md"
            >
              <TrashIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Trash</p>
            </div>
          )}
          {isTrash && (
            <div
              onClick={restoreItem}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary"
            >
              <RestoreIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Restore</p>
            </div>
          )}
          {isTrash && (
            <div
              onClick={deleteItem}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-red-500 rounded-b-md"
            >
              <TrashIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Delete</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ContextMenu;
