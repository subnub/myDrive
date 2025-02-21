import React, { memo, useEffect, useState } from "react";
import { useClickOutOfBounds, useUtils } from "../../hooks/utils";
import TrashIcon from "../../icons/TrashIcon";
import MultiSelectIcon from "../../icons/MultiSelectIcon";
import RenameIcon from "../../icons/RenameIcon";
import ShareIcon from "../../icons/ShareIcon";
import DownloadIcon from "../../icons/DownloadIcon";
import MoveIcon from "../../icons/MoveIcon";
import RestoreIcon from "../../icons/RestoreIcon";
import { FileInterface } from "../../types/file";
import { useNavigate } from "react-router-dom";
import { useActions } from "../../hooks/actions";
import { FolderInterface } from "../../types/folders";
import classNames from "classnames";

export interface ContextMenuProps {
  closeContext: () => void;
  contextSelected: {
    selected: boolean;
    X: number;
    Y: number;
  };
  folderMode?: boolean;
  quickItemMode?: boolean;
  parentBarMode?: boolean;
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
  const [animate, setAnimate] = useState(false);
  const {
    closeContext,
    contextSelected,
    folderMode,
    file,
    quickItemMode,
    stopPropagation,
    folder,
    parentBarMode,
  } = props;
  const { wrapperRef } = useClickOutOfBounds(closeContext);
  const { isTrash, isMedia } = useUtils();
  const navigate = useNavigate();
  const {
    renameItem,
    trashItem,
    deleteItem,
    restoreItem,
    openMoveItemModal,
    openShareItemModal,
    downloadItem,
    selectItemMultiSelect,
  } = useActions({ quickItemMode });

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

  const onAction = async (
    action:
      | "rename"
      | "trash"
      | "delete"
      | "restore"
      | "move"
      | "share"
      | "download"
      | "multi-select"
  ) => {
    closeContext();
    switch (action) {
      case "rename":
        await renameItem(file, folder);
        break;
      case "trash":
        await trashItem(file, folder);
        break;
      case "delete":
        await deleteItem(file, folder);
        break;
      case "restore":
        await restoreItem(file, folder);
        break;
      case "move":
        await openMoveItemModal(file, folder);
        break;
      case "share":
        openShareItemModal(file);
        break;
      case "download":
        downloadItem(file, folder);
        break;
      case "multi-select":
        selectItemMultiSelect(file, folder);
    }

    if (
      folder &&
      parentBarMode &&
      ["trash", "delete", "restore"].includes(action)
    ) {
      if (folder.parent === "/") {
        navigate("/trash");
      } else {
        navigate(`/folder-trash/${folder.parent}`);
      }
    }
  };

  useEffect(() => {
    setAnimate(true);
  }, []);

  const outterWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if ((e.target as HTMLDivElement).id !== "context-wrapper") {
      return;
    }
    closeContext();
  };

  return (
    <div
      id="context-wrapper"
      className="w-screen dynamic-height absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center flex-col"
      onClick={outterWrapperClick}
    >
      <div
        onClick={stopPropagation}
        ref={wrapperRef}
        className={classNames(
          "fixed min-w-[215px] bg-white shadow-lg rounded-md z-50 animate-movement",
          {
            "opacity-0": !animate,
            "opacity-100": animate,
          }
        )}
        style={
          fixedCoords.set
            ? {
                left: `${fixedCoords.X}px`,
                top: `${fixedCoords.Y}px`,
              }
            : {}
        }
      >
        <div>
          {!parentBarMode && (
            <div
              onClick={() => onAction("multi-select")}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary rounded-t-md"
            >
              <MultiSelectIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Multi-select</p>
            </div>
          )}
          {!isTrash && !isMedia && (
            <div
              onClick={() => onAction("rename")}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary"
            >
              <RenameIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Rename</p>
            </div>
          )}
          {!folderMode && !isTrash && (
            <div
              onClick={() => onAction("share")}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary"
            >
              <ShareIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Share</p>
            </div>
          )}
          {!isTrash && (
            <div
              onClick={() => onAction("download")}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary"
            >
              <DownloadIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Download</p>
            </div>
          )}
          {!isTrash && !isMedia && (
            <div
              onClick={() => onAction("move")}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary"
            >
              <MoveIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Move</p>
            </div>
          )}
          {!isTrash && (
            <div
              onClick={() => onAction("trash")}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary rounded-b-md"
            >
              <TrashIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Trash</p>
            </div>
          )}
          {isTrash && (
            <div
              onClick={() => onAction("restore")}
              className="text-gray-primary flex flex-row p-4 hover:bg-white-hover hover:text-primary"
            >
              <RestoreIcon className="w-5 h-5" />
              <p className="ml-2.5 text-sm">Restore</p>
            </div>
          )}
          {isTrash && (
            <div
              onClick={() => onAction("delete")}
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
