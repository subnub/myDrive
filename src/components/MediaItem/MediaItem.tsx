import React, { memo, useRef, useState } from "react";
import { FileInterface } from "../../types/file";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import {
  setMainSelect,
  setMultiSelectMode,
  setPopupSelect,
} from "../../reducers/selected";
import mobilecheck from "../../utils/mobileCheck";
import classNames from "classnames";
import { useContextMenu } from "../../hooks/contextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import PlayButtonIcon from "../../icons/PlayIcon";
import getBackendURL from "../../utils/getBackendURL";
import AlertIcon from "../../icons/AlertIcon";

type MediaItemType = {
  file: FileInterface;
};

const MediaItem: React.FC<MediaItemType> = memo(({ file }) => {
  const [thumbnailError, setThumbnailError] = useState(false);
  const elementSelected = useAppSelector((state) => {
    if (state.selected.mainSection.type !== "file") return false;
    return state.selected.mainSection.id === file._id;
  });
  const elementMultiSelected = useAppSelector((state) => {
    if (!state.selected.multiSelectMode) return false;
    const selected = state.selected.multiSelectMap[file._id];
    return selected && selected.type === "file";
  });
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
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
  const lastSelected = useRef(0);
  const dispatch = useAppDispatch();
  const thumbnail = `${getBackendURL()}/file-service/thumbnail/${
    file.metadata.thumbnailID
  }`;

  // TODO: See if we can memoize this and remove any
  const mediaItemClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const multiSelectKey = e.metaKey || e.ctrlKey;
    if (multiSelectMode || multiSelectKey) {
      dispatch(
        setMultiSelectMode([
          {
            type: "file",
            id: file._id,
            file: file,
            folder: null,
          },
        ])
      );
      return;
    }
    const currentDate = Date.now();

    if (!elementSelected) {
      // dispatch(startSetSelectedItem(file._id, true, true));
      dispatch(
        setMainSelect({ file, id: file._id, type: "file", folder: null })
      );
      lastSelected.current = Date.now();
      return;
    }

    const isMobile = mobilecheck();

    if (isMobile || currentDate - lastSelected.current < 1500) {
      dispatch(setPopupSelect({ type: "file", file }));
    }

    lastSelected.current = Date.now();
  };

  return (
    <div
      className={classNames("h-[100px] bg-black cursor-pointer relative", {
        "border-4 border-[#3c85ee]": elementSelected || elementMultiSelected,
      })}
      onClick={mediaItemClick}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {contextMenuState.selected && (
        <div onClick={clickStopPropagation}>
          <ContextMenu
            quickItemMode={false}
            contextSelected={contextMenuState}
            closeContext={closeContextMenu}
            file={file}
          />
        </div>
      )}
      {file.metadata.isVideo && !thumbnailError && (
        <div className="w-full h-full absolute flex justify-center items-center text-white">
          <PlayButtonIcon className="w-[50px] h-[50px]" />
        </div>
      )}
      {!thumbnailError && (
        <img
          className="object-cover h-full w-full disable-force-touch"
          src={thumbnail}
          onError={() => setThumbnailError(true)}
        />
      )}
      {thumbnailError && (
        <div className="w-full h-full flex justify-center items-center">
          <AlertIcon className="w-7 h-7 text-red-500" />
        </div>
      )}
    </div>
  );
});

export default MediaItem;
