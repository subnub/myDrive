import React, { useMemo } from "react";
import ContextMenu from "../ContextMenu";
import { useContextMenu } from "../../hooks/contextMenu";
import classNames from "classnames";
import { useSelector } from "react-redux";

const FolderItem = (props) => {
  const currentSelectedItem = useSelector(
    (state) => state.selectedItem.selected
  );
  const {
    onContextMenu,
    closeContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    clickStopPropagation,
    ...contextMenuState
  } = useContextMenu();

  const elementSelected = useMemo(
    () => props._id === currentSelectedItem,
    [props._id, currentSelectedItem]
  );

  return (
    <div
      className={classNames(
        "p-[12px] border border-[#ebe9f9] rounded-[4px] overflow-hidden cursor-pointer animate",
        {
          "bg-[#3c85ee]": elementSelected,
        }
      )}
      onClick={() => props.folderClick(props._id, props)}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div onClick={clickStopPropagation}>
        <ContextMenu
          gridMode={true}
          folderMode={true}
          quickItemMode={props.parent !== "/"}
          contextSelected={contextMenuState}
          closeContext={closeContextMenu}
          folder={props}
        />
      </div>
      <div>
        <svg
          className={classNames(
            "w-[40px] h-[40px]",
            elementSelected ? "text-white" : "text-[#3c85ee]"
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
          "mt-2",
          elementSelected ? "text-white" : "text-black"
        )}
      >
        <p>{props.name}</p>
      </div>
    </div>
  );
};

export default FolderItem;
