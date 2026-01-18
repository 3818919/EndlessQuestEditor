import { useState, useEffect, useCallback } from 'react';

interface UseResizablePanelReturn {
  panelWidth: number;
  isResizing: boolean;
  isMinimized: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  toggleMinimized: () => void;
  setIsMinimized: (value: boolean) => void;
}

export const useResizablePanel = (
  initialWidth: number = 400,
  minWidth: number = 300,
  storageKey: string = 'rightPanelWidth'
): UseResizablePanelReturn => {
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved) : initialWidth;
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Save to localStorage when width changes
  useEffect(() => {
    localStorage.setItem(storageKey, panelWidth.toString());
  }, [panelWidth, storageKey]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= minWidth) {
      setPanelWidth(newWidth);
    }
  }, [minWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const toggleMinimized = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  return {
    panelWidth,
    isResizing,
    isMinimized,
    handleMouseDown,
    toggleMinimized,
    setIsMinimized
  };
};
