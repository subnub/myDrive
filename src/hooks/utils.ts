import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export const useDragAndDrop = (fileDroppedCallback: (file: any) => any) => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const isDraggingFileRef = useRef(false);

  const onDragDropEvent = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingFileRef.current = false;
    setIsDraggingFile(false);

    const fileInput = e.dataTransfer;

    fileDroppedCallback(fileInput);
  }, []);
  const onDragEvent = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const onDragEnterEvent = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDraggingFileRef.current) return;
    isDraggingFileRef.current = true;
    setIsDraggingFile(true);
  }, []);
  const stopDrag = useCallback((e: any) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!isDraggingFileRef.current) return;
    isDraggingFileRef.current = false;
    setIsDraggingFile(false);
  }, []);

  useEffect(() => {
    window.addEventListener("dragover", stopDrag);
    window.addEventListener("focus", stopDrag);

    return () => {
      window.removeEventListener("dragover", stopDrag);
      window.removeEventListener("focus", stopDrag);
    };
  }, []);

  return {
    isDraggingFile,
    onDragDropEvent,
    onDragEvent,
    onDragEnterEvent,
    stopDrag,
  };
};
