import { MouseEventHandler, useRef, useState } from "react";

export const useContextMenu = () => {
  const [contextData, setContextData] = useState({
    selected: false,
    X: 0,
    Y: 0,
  });
  const lastTouched = useRef(0);
  const timeoutRef = useRef<any>(null);

  const onContextMenu = (e: any) => {
    if (e) e.stopPropagation();
    if (e) e.preventDefault();

    let X = e.clientX;
    let Y = e.clientY;

    setContextData({
      ...contextData,
      selected: true,
      X,
      Y,
    });
  };

  const closeContextMenu = () => {
    setContextData({
      ...contextData,
      selected: false,
      X: 0,
      Y: 0,
    });
  };

  const onTouchStart = (e: any) => {
    const touches = e.touches[0];
    let X = e.clientX || touches.clientX;
    let Y = e.clientY || touches.clientY;

    if (contextData.selected) return;

    timeoutRef.current = setTimeout(() => {
      console.log("timeout");
      setContextData({
        ...contextData,
        selected: true,
        X,
        Y,
      });
    }, 500);
  };

  const onTouchMove = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const onTouchEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const clickStopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return {
    ...contextData,
    onContextMenu,
    closeContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    clickStopPropagation,
  };
};
