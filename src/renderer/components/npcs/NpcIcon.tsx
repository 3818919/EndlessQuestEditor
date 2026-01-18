import React, { useState, useEffect, useRef } from 'react';

// Global queue to ensure sequential loading of NPC graphics
const loadQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || loadQueue.length === 0) return;
  
  isProcessingQueue = true;
  while (loadQueue.length > 0) {
    const loadFn = loadQueue.shift();
    if (loadFn) {
      await loadFn();
    }
  }
  isProcessingQueue = false;
};

interface NpcIconProps {
  graphic: number;
  loadGfx: (gfxNumber: number, resourceId?: number) => Promise<string | null>;
  gfxFolder: string | null;
  size?: 'small' | 'medium';
  lazy?: boolean;
}

const NpcIcon: React.FC<NpcIconProps> = ({ graphic, loadGfx, gfxFolder, size = 'small', lazy = true }) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(!lazy);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [lazy]);

  useEffect(() => {
    if (!isVisible || !gfxFolder || !loadGfx || !graphic || graphic === 0) {
      if (!isVisible) {
        setLoading(true);
        return;
      }
      setIconUrl(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadIcon = async () => {
      try {
        // NPCs are in GFX021
        // Each NPC has 40 frames in the GFX file
        // Standing frame is offset 1 from the base
        // Formula from EndlessClient: baseGfx = (graphic - 1) * 40, then add frame offset
        // Standing frame offset = 1, plus PE resource offset of 100
        const baseGfx = (graphic - 1) * 40;
        const resourceId = baseGfx + 1 + 100; // +1 for standing frame, +100 for PE offset
        
        const dataUrl = await loadGfx(21, resourceId);
        
        if (!cancelled) {
          setIconUrl(dataUrl);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading NPC icon:', error);
        if (!cancelled) {
          setIconUrl(null);
          setLoading(false);
        }
      }
    };

    // Add to queue for sequential processing
    loadQueue.push(loadIcon);
    processQueue();

    return () => {
      cancelled = true;
    };
  }, [graphic, gfxFolder, loadGfx, isVisible]);

  const sizeClass = size === 'small' ? 'preview-small' : 'preview-medium';

  if (loading) {
    return (
      <div ref={containerRef} className={`item-preview ${sizeClass} preview-empty`}>
        <span>{isVisible ? '...' : ' '}</span>
      </div>
    );
  }

  if (!iconUrl) {
    return (
      <div ref={containerRef} className={`item-preview ${sizeClass} preview-empty`}>
        <span>No Icon</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`item-preview ${sizeClass}`}>
      <img src={iconUrl} alt="NPC" style={{ imageRendering: 'pixelated' }} />
    </div>
  );
};

export default NpcIcon;
