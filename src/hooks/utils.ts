import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export const useUtils = () => {
  const location = useLocation();

  const isHome = location.pathname === "/home";

  const isTrash =
    location.pathname === "/trash" ||
    location.pathname.includes("/folder-trash") ||
    location.pathname.includes("/search-trash");

  const isMedia =
    location.pathname === "/media" ||
    location.pathname.includes("/search-media");

  const isSettings = location.pathname === "/settings";

  const isHomeFolder = location.pathname.includes("/folder/");

  const isSearch = location.pathname.includes("/search/");

  return { isHome, isTrash, isMedia, isSettings, isHomeFolder, isSearch };
};

export const useClickOutOfBounds = (
  outOfBoundsCallback: (e: any) => any,
  shouldCheck = true
) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // TODO: Remove this any
  const outOfBoundsClickCheck = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (
        wrapperRef?.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        outOfBoundsCallback(e);
      }
    },
    [outOfBoundsCallback]
  );

  useEffect(() => {
    if (shouldCheck) {
      document.addEventListener("mousedown", outOfBoundsClickCheck);
      document.addEventListener("touchstart", outOfBoundsClickCheck);
    } else {
      document.removeEventListener("mousedown", outOfBoundsClickCheck);
      document.removeEventListener("touchstart", outOfBoundsClickCheck);
    }
    return () => {
      if (shouldCheck) {
        document.removeEventListener("mousedown", outOfBoundsClickCheck);
        document.removeEventListener("touchstart", outOfBoundsClickCheck);
      }
    };
  }, [outOfBoundsCallback, outOfBoundsClickCheck, shouldCheck]);

  return {
    wrapperRef,
  };
};

export const useDragAndDrop = (fileDroppedCallback: (file: any) => any) => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const isDraggingFileRef = useRef(false);

  const onDragDropEvent = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      isDraggingFileRef.current = false;
      setIsDraggingFile(false);

      fileDroppedCallback(e.dataTransfer.files);
    },
    [fileDroppedCallback]
  );
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
  }, [stopDrag]);

  return {
    isDraggingFile,
    onDragDropEvent,
    onDragEvent,
    onDragEnterEvent,
    stopDrag,
  };
};
