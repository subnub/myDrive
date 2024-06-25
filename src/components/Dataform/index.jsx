import QuickAccess from "../QuickAccess";
import Folders from "../Folders";
import { useFiles } from "../../hooks/files";
import { useInfiniteScroll } from "../../hooks/infiniteScroll";
import Files from "../Files";
import { memo, useEffect, useState } from "react";
import SpinnerPage from "../SpinnerPage";

const DataForm = memo(() => {
  const {
    fetchNextPage: filesFetchNextPage,
    isFetchingNextPage,
    data: fileList,
  } = useFiles();
  const { sentinelRef, reachedIntersect } = useInfiniteScroll();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    } else if (!fileList) {
      return;
    }
    if (reachedIntersect) {
      filesFetchNextPage();
    }
  }, [reachedIntersect, initialLoad]);

  return (
    <div className="w-full p-[65px_40px] overflow-y-scroll">
      <QuickAccess />

      <Folders />

      <Files />

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
