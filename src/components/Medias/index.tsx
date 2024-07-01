import classNames from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import MediaItem from "../MediaItem";
import { useFiles, useThumbnail } from "../../hooks/files";
import MultiSelectBar from "../MultiSelectBar";
import { useInfiniteScroll } from "../../hooks/infiniteScroll";

const Medias = () => {
  const {
    data: files,
    isFetchingNextPage,
    fetchNextPage: filesFetchNextPage,
  } = useFiles();
  const [initialLoad, setInitialLoad] = useState(true);
  const { sentinelRef, reachedIntersect } = useInfiniteScroll();

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    } else if (!files) {
      return;
    }
    if (reachedIntersect && !isFetchingNextPage) {
      filesFetchNextPage();
    }
  }, [reachedIntersect, initialLoad, isFetchingNextPage]);

  return (
    <div className="w-full p-[17px_15px] mobileMode:p-[17px_40px] overflow-y-scroll">
      <div className="fixed bottom-0 flex justify-center items-center right-0 left-0">
        <MultiSelectBar />
      </div>
      <div
        className={classNames(
          "grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-[10px]"
        )}
      >
        {files?.pages.map((filePage, index) => (
          <React.Fragment key={index}>
            {filePage.map((file) => (
              <MediaItem file={file} key={file._id} />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div ref={sentinelRef} className="h-1"></div>
    </div>
  );
};

export default Medias;
