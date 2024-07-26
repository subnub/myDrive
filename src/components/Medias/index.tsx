import classNames from "classnames";
import React, { memo, useEffect, useMemo, useState } from "react";
import MediaItem from "../MediaItem";
import { useFiles } from "../../hooks/files";
import MultiSelectBar from "../MultiSelectBar";
import { useInfiniteScroll } from "../../hooks/infiniteScroll";

const Medias = memo(() => {
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
    <div className="w-full p-[17px_15px] desktopMode:p-[17px_40px] overflow-y-scroll">
      <div
        className={classNames(
          "grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-[10px]"
        )}
      >
        <div className="fixed bottom-0 flex justify-center items-center right-0 left-0 z-10">
          <MultiSelectBar />
        </div>
        {files?.pages.map((filePage, index) => (
          <React.Fragment key={index}>
            {filePage.map((file) => (
              <MediaItem file={file} key={file._id} />
            ))}
          </React.Fragment>
        ))}
      </div>
      {/* @ts-ignore */}
      <div ref={sentinelRef} className="h-1"></div>
    </div>
  );
});

export default Medias;
