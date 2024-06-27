import { useCallback, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

export const useUtils = () => {
  const params = useParams();

  const isHome = useMemo(() => {
    return !params.id && !params.query;
  }, [params.id, params.query]);

  return { isHome };
};

export const useClickOutOfBounds = (outOfBoundsCallback: () => any) => {
  console.log("out");
  const wrapperRef = useRef<HTMLDivElement>(null);
  // TODO: Remove this any
  const outOfBoundsClickCheck = useCallback(
    (e: any) => {
      if (wrapperRef && !wrapperRef.current?.contains(e.target as Node)) {
        outOfBoundsCallback();
      }
    },
    [outOfBoundsCallback]
  );

  useEffect(() => {
    document.addEventListener("mousedown", outOfBoundsClickCheck);
    document.addEventListener("touchstart", outOfBoundsClickCheck);

    return () => {
      console.log("remove listener");
      document.removeEventListener("mousedown", outOfBoundsClickCheck);
      document.removeEventListener("touchstart", outOfBoundsClickCheck);
    };
  }, [outOfBoundsCallback]);

  return {
    wrapperRef,
  };
};
