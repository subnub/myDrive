import { useState } from "react";

export const useContextMenu = () => {
  const [contextData, setContextData] = useState({
    selected: false,
    X: 0,
    Y: 0,
    lastTouched: 0,
  });

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
      lastTouched: 0,
    });
  };

  return { ...contextData, onContextMenu, closeContextMenu };
};
