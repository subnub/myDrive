import QuickAccess from "../QuickAccess/QuickAccess";
import Folders from "../Folders/Folders";
import { useFiles, useQuickFiles, useUploader } from "../../hooks/files";
import { useInfiniteScroll } from "../../hooks/infiniteScroll";
import Files from "../Files/Files";
import { memo, useCallback, useEffect, useState } from "react";
import Spinner from "../Spinner/Spinner";
import { useAppDispatch } from "../../hooks/store";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import { useDragAndDrop } from "../../hooks/utils";
import MultiSelectBar from "../MultiSelectBar/MultiSelectBar";
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
  const { uploadFiles } = useUploader();

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
    (files: FileList) => {
      uploadFiles(files);
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
        "w-full px-2.5 desktopMode:px-10 py-6 overflow-y-scroll",
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
          <div className="fixed bottom-0 flex justify-center items-center right-0 left-0 z-10">
            <MultiSelectBar />
          </div>

          <QuickAccess />

          <Folders />

          <Files />
        </div>
      )}

      {isLoading && (
        <div className="w-full flex justify-center items-center h-full">
          <Spinner />
        </div>
      )}
      {/* @ts-ignore  */}
      <div ref={sentinelRef} className="h-1"></div>

      {/* TODO: Change this spinner name */}
      {isFetchingNextPage && (
        <div className="w-full flex justify-center items-center mt-4">
          <Spinner />
        </div>
      )}
    </div>
  );
});

export default DataForm;
