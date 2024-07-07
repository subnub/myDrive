import { MouseEventHandler, useRef, useState } from "react";

export const useContextMenu = () => {
  // 215 X 240
  const [contextData, setContextData] = useState({
    selected: false,
    X: 0,
    Y: 0,
  });
  const lastTouched = useRef(0);

  const onContextMenu = (e: any) => {
    if (e) e.stopPropagation();
    if (e) e.preventDefault();

    const contextWidth = 245;
    const contextHeight = 260;

    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    let X = e.clientX;
    let Y = e.clientY;

    if (X + contextWidth > windowWidth) {
      X = windowWidth - contextWidth;
    }

    if (Y + contextHeight > windowHeight) {
      Y = windowHeight - contextHeight;
    }

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
