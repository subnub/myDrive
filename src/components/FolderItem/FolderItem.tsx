import React, { memo, useRef } from "react";
import ContextMenu from "../ContextMenu/ContextMenu";
import { useContextMenu } from "../../hooks/contextMenu";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import {
  addNavigationMap,
  setMainSelect,
  setMultiSelectMode,
} from "../../reducers/selected";
import { useUtils } from "../../hooks/utils";
import { FolderInterface } from "../../types/folders";
import dayjs from "dayjs";
import ClockIcon from "../../icons/ClockIcon";

interface FolderItemProps {
  folder: FolderInterface;
  scrollDivRef: React.RefObject<HTMLDivElement>;
}

const FolderItem: React.FC<FolderItemProps> = memo((props) => {
  const { folder, scrollDivRef } = props;
  const elementSelected = useAppSelector((state) => {
    if (state.selected.mainSection.type !== "folder") return false;
    return state.selected.mainSection.id === folder._id;
  });
  const elementMultiSelected = useAppSelector((state) => {
    if (!state.selected.multiSelectMode) return false;
    return state.selected.multiSelectMap[folder._id];
  });
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
  );
  const singleClickFolders = useAppSelector(
    (state) => state.general.singleClickFolders
  );
  const { isTrash } = useUtils();
  const lastSelected = useRef(0);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    onContextMenu,
    closeContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    clickStopPropagation,
    ...contextMenuState
  } = useContextMenu();

  const folderClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const multiSelectKey = e.metaKey || e.ctrlKey;
    if (multiSelectMode || multiSelectKey) {
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
      return;
    }
    const currentDate = Date.now();

    if (!elementSelected) {
      dispatch(
        setMainSelect({
          file: null,
          id: folder._id,
          type: "folder",
          folder: folder,
        })
      );
      lastSelected.current = Date.now();

      if (!singleClickFolders) return;
    }

    if (singleClickFolders || currentDate - lastSelected.current < 1500) {
      dispatch(
        addNavigationMap({
          url: window.location.pathname,
          scrollTop: scrollDivRef.current?.scrollTop || 0,
        })
      );
      if (isTrash) {
        navigate(`/folder-trash/${folder._id}`);
      } else {
        navigate(`/folder/${folder._id}`);
      }
    }

    lastSelected.current = Date.now();
  };

  return (
    <div
      className={classNames(
        "p-3 border border-gray-third rounded-md overflow-hidden cursor-pointer animate hover:border-primary",
        {
          "bg-primary": elementSelected || elementMultiSelected,
        }
      )}
      onClick={folderClick}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {contextMenuState.selected && (
        <div onClick={clickStopPropagation}>
          <ContextMenu
            folderMode={true}
            quickItemMode={folder.parent !== "/"}
            contextSelected={contextMenuState}
            closeContext={closeContextMenu}
            folder={folder}
          />
        </div>
      )}

      <div>
        <svg
          className={classNames(
            "w-10 h-10",
            elementSelected || elementMultiSelected
              ? "text-white"
              : "text-[#3c85ee]"
          )}
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="folder"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          data-fa-i2svg=""
        >
          <path
            fill="currentColor"
            d="M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z"
          ></path>
        </svg>
      </div>
      <div
        className={classNames(
          "text-ellipsis block w-full animate",
          elementSelected || elementMultiSelected
            ? "bg-primary text-white"
            : "bg-white text-gray-primary"
        )}
      >
        <p
          className={classNames(
            "m-0 text-sm font-normal max-w-full overflow-hidden text-ellipsis whitespace-nowrap animate",
            elementSelected || elementMultiSelected
              ? "text-white"
              : "text-black"
          )}
        >
          {folder.name}
        </p>
        <div className="flex flex-row items-center mt-1">
          <ClockIcon className="h-4 w-4 mr-1" />
          <p
            className={classNames(
              "m-0 font-normal max-w-full whitespace-nowrap text-xs animate",
              elementSelected || elementMultiSelected
                ? "text-white"
                : "text-gray-primary"
            )}
          >
            {dayjs(folder.createdAt).format("MM/DD/YY hh:mma")}
          </p>
        </div>
      </div>
    </div>
  );
});

export default FolderItem;
