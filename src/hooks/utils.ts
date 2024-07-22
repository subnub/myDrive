import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export const useUtils = () => {
  const location = useLocation();

  const isHome = useMemo(() => {
    return location.pathname === "/home";
  }, [location.pathname]);

  const isTrash = useMemo(() => {
    return (
      location.pathname === "/trash" ||
      location.pathname.includes("/folder-trash") ||
      location.pathname.includes("/search-trash")
    );
  }, [location.pathname]);

  const isMedia = useMemo(() => {
    return (
      location.pathname === "/media" ||
      location.pathname.includes("/search-media")
    );
  }, [location.pathname]);

  const isSettings = useMemo(() => {
    return location.pathname === "/settings";
  }, [location.pathname]);

  return { isHome, isTrash, isMedia, isSettings };
};

export const useClickOutOfBounds = (
  outOfBoundsCallback: (e: any) => any,
  shouldCheck = true
) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // TODO: Remove this any
  const outOfBoundsClickCheck = useCallback(
    (e: any) => {
      if (wrapperRef && !wrapperRef.current?.contains(e.target as Node)) {
        outOfBoundsCallback(e);
      }
    },
    [outOfBoundsCallback]
  );

  useEffect(() => {
    console.log("useeffect");
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
