import { useRef, useState } from "react";

export const useContextMenu = () => {
  const [contextData, setContextData] = useState({
    selected: false,
    X: 0,
    Y: 0,
  });
  const lastTouched = useRef(0);

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e) e.stopPropagation();
    if (e) e.preventDefault();
    setContextData({
      ...contextData,
      selected: true,
      X: e.clientX,
      Y: e.clientY,
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

  const onTouchStart = () => {
    lastTouched.current = new Date().getTime();
  };

  const onTouchMove = () => {
    lastTouched.current = 0;
  };

  const onTouchEnd = () => {
    if (lastTouched.current === 0) {
      return;
    }

    const date = new Date();
    const difference = date.getTime() - lastTouched.current;

    if (difference > 500) {
      setContextData({
        ...contextData,
        selected: true,
      });
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
