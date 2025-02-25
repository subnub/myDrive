import { toast } from "react-toastify";
import {
  deleteFileAPI,
  downloadFileAPI,
  renameFileAPI,
  restoreFileAPI,
  trashFileAPI,
} from "../api/filesAPI";
import {
  deleteFilePopup,
  renameFilePopup,
  restoreItemPopup,
  trashItemsPopup,
} from "../popups/file";
import { FileInterface } from "../types/file";
import { FolderInterface } from "../types/folders";
import { useFiles, useQuickFiles } from "./files";
import { useFolder, useFolders } from "./folders";
import { useAppDispatch } from "./store";
import {
  resetSelected,
  setMoveModal,
  setMultiSelectMode,
  setShareModal,
} from "../reducers/selected";
import { deleteFolderPopup, renameFolderPopup } from "../popups/folder";
import {
  deleteFolderAPI,
  downloadZIPAPI,
  renameFolder,
  restoreFolderAPI,
  trashFolderAPI,
} from "../api/foldersAPI";

type UseActionsProps = {
  quickItemMode?: boolean;
};

export const useActions = ({ quickItemMode }: UseActionsProps) => {
  const { refetch: refetchFiles } = useFiles(false);
  const { refetch: refetchFolders } = useFolders(false);
  const { refetch: refetchFolder } = useFolder(false);
  const { refetch: refetchQuickFiles } = useQuickFiles(false);

  const dispatch = useAppDispatch();

  const reloadItems = () => {
    refetchFiles();
    refetchQuickFiles();
    refetchFolders();
    refetchFolder();
    dispatch(resetSelected());
  };

  const renameItem = async (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    if (file) {
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
    } else if (folder) {
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

  const trashItem = async (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    if (file) {
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
    } else if (folder) {
      try {
        const result = await trashItemsPopup();
        if (!result) return;

        await toast.promise(trashFolderAPI(folder._id), {
          pending: "Trashing...",
          success: "Trashed",
          error: "Error Trashing",
        });
        reloadItems();

        // if (parentBarMode) {
        //   if (folder.parent === "/") {
        //     navigate("/home");
        //   } else {
        //     navigate(`/folder/${folder.parent}`);
        //   }
        // }
      } catch (e) {
        console.log("Error trashing folder", e);
      }
    }
  };

  const deleteItem = async (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    if (file) {
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
    } else if (folder) {
      try {
        const result = await deleteFolderPopup();
        if (!result) return;

        await toast.promise(deleteFolderAPI(folder._id), {
          pending: "Deleting...",
          success: "Deleted",
          error: "Error Deleting",
        });
        reloadItems();

        // if (parentBarMode) {
        //   if (folder.parent === "/") {
        //     navigate("/trash");
        //   } else {
        //     navigate(`/folder-trash/${folder.parent}`);
        //   }
        // }
      } catch (e) {
        console.log("Error deleting folder", e);
      }
    }
  };

  const restoreItem = async (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    const result = await restoreItemPopup();
    if (!result) return;
    if (file) {
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
    } else if (folder) {
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

  const openMoveItemModal = async (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    if (file) {
      dispatch(setMoveModal({ type: "file", file, folder: null }));
    } else if (folder) {
      dispatch(setMoveModal({ type: "folder", file: null, folder }));
    }
  };

  const openShareItemModal = (file?: FileInterface | null) => {
    dispatch(setShareModal(file!));
  };

  const downloadItem = (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    if (file) downloadFileAPI(file._id);
    if (folder) downloadZIPAPI([folder._id], []);
  };

  const selectItemMultiSelect = (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    if (folder) {
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
    } else if (file) {
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

  return {
    renameItem,
    trashItem,
    deleteItem,
    restoreItem,
    openMoveItemModal,
    openShareItemModal,
    downloadItem,
    selectItemMultiSelect,
  };
};
