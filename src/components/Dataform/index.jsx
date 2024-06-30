import QuickAccess from "../QuickAccess";
import Folders from "../Folders";
import { useFiles, useQuickFiles } from "../../hooks/files";
import { useInfiniteScroll } from "../../hooks/infiniteScroll";
import Files from "../Files";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import SpinnerPage from "../SpinnerPage";
import SearchBar from "../SearchBar";
import { useAppDispatch } from "../../hooks/store";
import { startAddFile } from "../../actions/files";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import { useDragAndDrop } from "../../hooks/utils";
import MultiSelectBar from "../MultiSelectBar";
import { useFolders } from "../../hooks/folders";

const DataForm = memo(() => {
  const {
    fetchNextPage: filesFetchNextPage,
    isFetchingNextPage,
    data: fileList,
    isLoading: isLoadingFiles,
  } = useFiles();
  const { isLoading: isLoadingFolders } = useFolders();
  const { isLoading: isLoadingQuickItems } = useQuickFiles();
  const dispatch = useAppDispatch();
  const { sentinelRef, reachedIntersect } = useInfiniteScroll();
  const [initialLoad, setInitialLoad] = useState(true);
  const params = useParams();

  const isLoading = isLoadingFiles || isLoadingFolders || isLoadingQuickItems;

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    } else if (!fileList) {
      return;
    }
    if (reachedIntersect && !isFetchingNextPage) {
      filesFetchNextPage();
    }
  }, [reachedIntersect, initialLoad, isFetchingNextPage]);

  const addFile = useCallback(
    (file) => {
      dispatch(startAddFile(file, params.id));
    },
    [params.id]
  );

  const {
    isDraggingFile,
    onDragDropEvent,
    onDragEvent,
    onDragEnterEvent,
    stopDrag,
  } = useDragAndDrop(addFile);

  return (
    <div
      className={classNames(
        "w-full p-[17px_15px] mobileMode:p-[17px_40px] overflow-y-scroll",
        {
          "opacity-50": isDraggingFile,
        }
      )}
      onDrop={onDragDropEvent}
      onDragOver={onDragEvent}
      onDragLeave={onDragEvent}
      onDragEnter={onDragEnterEvent}
      onMouseLeave={stopDrag}
    >
      {!isLoading && (
        <div>
          <MultiSelectBar />

          <QuickAccess />

          <Folders />

          <Files />
        </div>
      )}

      {isLoading && (
        <div className="w-full flex justify-center items-center h-full">
          <SpinnerPage />
        </div>
      )}

      <div ref={sentinelRef} className="h-1"></div>

      {/* TODO: Change this spinner name */}
      {isFetchingNextPage && (
        <div className="w-full flex justify-center items-center mt-4">
          <SpinnerPage />
        </div>
      )}
    </div>
  );
});

export default DataForm;
