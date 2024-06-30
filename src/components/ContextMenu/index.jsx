import classNames from "classnames";
import React, { useEffect, useRef } from "react";
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
  deleteFolder,
  renameFolder,
  restoreFolderAPI,
  trashFolderAPI,
} from "../../api/foldersAPI";
import { useClickOutOfBounds, useUtils } from "../../hooks/utils";
import { useAppDispatch } from "../../hooks/store";
import { setMultiSelectMode } from "../../reducers/selected";
import TrashIcon from "../../icons/TrashIcon";
import MultiSelectIcon from "../../icons/MultiSelectIcon";
import RenameIcon from "../../icons/RenameIcon";
import ShareIcon from "../../icons/ShareIcon";
import DownloadIcon from "../../icons/DownloadIcon";
import MoveIcon from "../../icons/MoveIcon";
import RestoreIcon from "../../icons/RestoreIcon";
import { restoreItemPopup } from "../../popups/file";

const ContextMenu = (props) => {
  const { invalidateFilesCache } = useFilesClient();
  const { invalidateFoldersCache } = useFoldersClient();
  const { invalidateQuickFilesCache } = useQuickFilesClient();
  const { wrapperRef } = useClickOutOfBounds(props.closeContext);
  const { isTrash } = useUtils();
  const dispatch = useAppDispatch();
  const liClassname =
    "flex w-full px-[20px] py-[12px] items-center font-normal text-[#637381] justify-start no-underline animate hover:bg-[#f6f5fd] hover:text-[#3c85ee] hover:font-medium";
  const spanClassname = "flex items-center justify-center mr-[18px]";

  const renameItem = async () => {
    props.closeContext();
    if (!props.folderMode) {
      const { value: filename } = await Swal.fire({
        title: "Enter A File Name",
        input: "text",
        inputValue: props.file.filename,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Please Enter a Name";
          }
        },
      });
      await renameFileAPI(props.file._id, filename);
      invalidateFilesCache();
      invalidateQuickFilesCache();
    } else {
      const { value: folderName } = await Swal.fire({
        title: "Enter A folder Name",
        input: "text",
        inputValue: props.folder.name,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Please Enter a Name";
          }
        },
      });

      if (folderName === undefined || folderName === null) {
        return;
      }

      await renameFolder(props.folder._id, folderName);
      invalidateFoldersCache();
    }
  };

  const trashItem = async () => {
    props.closeContext();
    if (!props.folderMode) {
      const result = await Swal.fire({
        title: "Move to trash?",
        text: "Items in the trash will eventually be deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      });

      if (result.value) {
        await trashFileAPI(props.file._id);
        invalidateFilesCache();
        invalidateQuickFilesCache();
      }
    } else {
      const result = await Swal.fire({
        title: "Move to trash?",
        text: "Items in the trash will eventually be deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      });
      if (result.value) {
        await trashFolderAPI(props.folder._id);
        invalidateFoldersCache();
      }
    }
  };

  const deleteItem = async () => {
    props.closeContext();
    if (!props.folderMode) {
      const result = await Swal.fire({
        title: "Delete file?",
        text: "You will not be able to recover this file.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      });

      if (result.value) {
        await deleteFileAPI(props.file._id);
        invalidateFilesCache();
        invalidateQuickFilesCache();
      }
    } else {
      const result = await Swal.fire({
        title: "Delete folder?",
        text: "You will not be able to recover this folder.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      });
      if (result.value) {
        await deleteFolder(props.folder._id);
        invalidateFoldersCache();
      }
    }
  };

  const restoreItem = async () => {
    props.closeContext();
    const result = await restoreItemPopup();
    if (!result) return;
    if (!props.folderMode) {
      await restoreFileAPI(props.file._id);
      invalidateFilesCache();
    } else {
      await restoreFolderAPI(props.folder._id);
      invalidateFoldersCache();
    }
  };

  const openMoveItemModal = async () => {
    props.closeContext();
    if (!props.folderMode) {
      dispatch(setMoverID(props.file._id, props.file.metadata.parent, true));
    } else {
      dispatch(setMoverID(props.folder._id, props.folder.parent, false));
    }
  };

  const openShareItemModal = () => {
    props.closeContext();
    dispatch(setShareSelected(props.file));
  };

  const downloadItem = () => {
    props.closeContext();
    downloadFileAPI(props.file._id);
  };

  const selectItemMultiSelect = () => {
    props.closeContext();
    if (props.folderMode) {
      dispatch(
        setMultiSelectMode({
          type: "folder",
          id: props.folder._id,
          file: null,
          folder: props.folder,
        })
      );
    } else {
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
        "fixed min-w-[215px] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.15),_inset_0px_1px_0px_#f5f7fa] rounded-[4px] mt-[-5px] z-[2] ",
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
            Multi select
          </a>
        </li>
        {!isTrash && (
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
        {!isTrash && (
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
};

export default ContextMenu;
