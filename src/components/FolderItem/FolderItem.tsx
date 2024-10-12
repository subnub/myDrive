import React, { memo, useCallback, useRef } from "react";
import ContextMenu from "../ContextMenu/ContextMenu";
import { useContextMenu } from "../../hooks/contextMenu";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import mobilecheck from "../../utils/mobileCheck";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { setMainSelect, setMultiSelectMode } from "../../reducers/selected";
import { useUtils } from "../../hooks/utils";
import { FolderInterface } from "../../types/folders";

interface FolderItemProps {
  folder: FolderInterface;
}

const FolderItem: React.FC<FolderItemProps> = memo((props) => {
  const { folder } = props;
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

  const folderClick = useCallback(
    (e: any) => {
      const multiSelectKey = e.metaKey || e.ctrlKey;
      if (multiSelectMode || multiSelectKey) {
        dispatch(
          setMultiSelectMode({
            type: "folder",
            id: folder._id,
            file: null,
            folder: folder,
          })
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
        return;
      }

      const isMobile = mobilecheck();

      if (isMobile || currentDate - lastSelected.current < 1500) {
        if (isTrash) {
          navigate(`/folder-trash/${folder._id}`);
        } else {
          navigate(`/folder/${folder._id}`);
        }
      }

      lastSelected.current = Date.now();
    },
    [mobilecheck, navigate, folder._id, elementSelected, multiSelectMode]
  );

  return (
    <div
      className={classNames(
        "p-[12px] border border-gray-third rounded-[4px] overflow-hidden cursor-pointer animate hover:border-[#3c85ee]",
        {
          "bg-[#3c85ee]": elementSelected || elementMultiSelected,
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
            "w-[40px] h-[40px]",
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
          "overflow-hidden text-ellipsis block w-full animate mt-2",
          elementSelected || elementMultiSelected
            ? "bg-[#3c85ee] text-white"
            : "bg-white text-[#637381]"
        )}
      >
        <p
          className={classNames(
            "m-0 text-[14px] leading-[16px] font-normal max-w-full overflow-hidden text-ellipsis whitespace-nowrap animate",
            elementSelected || elementMultiSelected
              ? "text-white"
              : "text-black"
          )}
        >
          {folder.name}
        </p>
        <span
          className={classNames(
            "m-0 font-normal max-w-full whitespace-nowrap text-xs animate hidden sm:block mt-1",
            elementSelected || elementMultiSelected
              ? "text-white"
              : "text-[#637381]"
          )}
        >
          Created {moment(folder.createdAt).format("MM/DD/YY hh:mma")}
        </span>
      </div>
    </div>
  );
});

export default FolderItem;
