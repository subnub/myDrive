import QuickAccess from "../QuickAccess/QuickAccess";
import Folders from "../Folders/Folders";
import { useFiles, useQuickFiles, useUploader } from "../../hooks/files";
import { useInfiniteScroll } from "../../hooks/infiniteScroll";
import Files from "../Files/Files";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Spinner from "../Spinner/Spinner";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { useLocation, useParams } from "react-router-dom";
import classNames from "classnames";
import { useDragAndDrop, useUtils } from "../../hooks/utils";
import MultiSelectBar from "../MultiSelectBar/MultiSelectBar";
import { useFolder, useFolders } from "../../hooks/folders";
import { removeNavigationMap } from "../../reducers/selected";
import AlertIcon from "../../icons/AlertIcon";

const DataForm = memo(
  ({ scrollDivRef }: { scrollDivRef: React.RefObject<HTMLDivElement> }) => {
    const {
      fetchNextPage: filesFetchNextPage,
      isFetchingNextPage: isFetchingNextPageState,
      data: fileList,
      isLoading: isLoadingFiles,
    } = useFiles();
    const { isLoading: isLoadingFolder } = useFolder(true);
    const { isLoading: isLoadingFolders } = useFolders();
    const { isLoading: isLoadingQuickItems } = useQuickFiles();
    const dispatch = useAppDispatch();
    const { sentinelRef, reachedIntersect } = useInfiniteScroll();
    const [initialLoad, setInitialLoad] = useState(true);
    const params = useParams();
    const { uploadFiles } = useUploader();
    const isFetchingNextPage = useRef(false);
    const prevPathname = useRef("");
    const location = useLocation();
    const navigationMap = useAppSelector((state) => {
      return state.selected.navigationMap[location.pathname];
    });
    const { isTrash } = useUtils();

    const isLoading =
      isLoadingFiles ||
      isLoadingFolders ||
      isLoadingQuickItems ||
      isLoadingFolder;

    useEffect(() => {
      if (initialLoad) {
        setInitialLoad(false);
        return;
      } else if (!fileList || isFetchingNextPage.current) {
        return;
      }
      if (reachedIntersect && !isLoadingFiles) {
        isFetchingNextPage.current = true;
        filesFetchNextPage().then(() => {
          isFetchingNextPage.current = false;
        });
      }
    }, [reachedIntersect, initialLoad, isLoadingFiles]);

    useEffect(() => {
      if (!isLoading && navigationMap) {
        const scrollTop = navigationMap.scrollTop;
        scrollDivRef.current?.scrollTo(0, scrollTop);
        dispatch(removeNavigationMap(location.pathname));
        prevPathname.current = location.pathname;
      } else if (!isLoading && prevPathname.current !== location.pathname) {
        scrollDivRef.current?.scrollTo(0, 0);
        prevPathname.current = location.pathname;
      }
    }, [isLoading, navigationMap, location.pathname]);

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
        ref={scrollDivRef}
      >
        {!isLoading && (
          <div>
            <div className="fixed bottom-0 flex justify-center items-center right-0 left-0 z-10">
              <MultiSelectBar />
            </div>

            <QuickAccess />

            {isTrash && (
              <div
                className="bg-light-primary p-4 rounded-md text-sm 
              text-black mt-4 flex items-center select-none"
              >
                <AlertIcon className="w-6 h-6 min-h-6 min-w-6 mr-2" />
                <span>
                  Items in the trash may be automatically deleted depending on
                  the servers settings
                </span>
              </div>
            )}

            <Folders scrollDivRef={scrollDivRef} />

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

        {isFetchingNextPageState && (
          <div className="w-full flex justify-center items-center mt-4">
            <Spinner />
          </div>
        )}
      </div>
    );
  }
);

export default DataForm;
