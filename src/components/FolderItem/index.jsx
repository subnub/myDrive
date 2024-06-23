import React, { useMemo, useRef } from "react";
import ContextMenu from "../ContextMenu";
import { useContextMenu } from "../../hooks/contextMenu";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { startSetSelectedItem } from "../../actions/selectedItem";
import mobilecheck from "../../utils/mobileCheck";
import moment from "moment";

const FolderItem = (props) => {
  const { folder } = props;
  const currentSelectedItem = useSelector(
    (state) => state.selectedItem.selected
  );
  const lastSelected = useRef(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    () => props.folder._id === currentSelectedItem,
    [props.folder._id, currentSelectedItem]
  );

  const folderClick = () => {
    const currentDate = Date.now();

    if (!elementSelected) {
      dispatch(startSetSelectedItem(folder._id, false, false));
    }

    const isMobile = mobilecheck();

    if (isMobile || currentDate - lastSelected.current < 1500) {
      navigate(`/folder/${folder._id}`);
    }

    lastSelected.current = Date.now();
  };

  return (
    <div
      className={classNames(
        "p-[12px] border border-[#ebe9f9] rounded-[4px] overflow-hidden w-48 cursor-pointer animate",
        {
          "bg-[#3c85ee]": elementSelected,
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
            gridMode={true}
            folderMode={true}
            quickItemMode={props.folder.parent !== "/"}
            contextSelected={contextMenuState}
            closeContext={closeContextMenu}
            folder={props.folder}
          />
        </div>
      )}

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
        <p>{props.folder.name}</p>
      </div>
      <p
        className={classNames(
          "m-0 mt-2 font-normal max-w-full whitespace-nowrap text-xs animate",
          elementSelected ? "text-white" : "text-[#637381]"
        )}
      >
        Created {moment(folder.createdAt).format("MM/DD/YY hh:mma")}
      </p>
    </div>
  );
};

export default FolderItem;
