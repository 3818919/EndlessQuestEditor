import React, { useEffect, useRef, useState } from 'react';

interface NpcPreviewProps {
  npc: any;
  loadGfx: (gfxNumber: number, resourceId?: number) => Promise<string | null>;
  gfxFolder: string | null;
}

const NpcPreview: React.FC<NpcPreviewProps> = ({ npc, loadGfx, gfxFolder }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [npcSprites, setNpcSprites] = useState<HTMLImageElement[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoom, setZoom] = useState(1);
  const animationRef = useRef<number>();

  // Handle mouse wheel zoom with non-passive listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(prev => {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        return Math.max(0.5, Math.min(3, prev + delta));
      });
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  // Load NPC sprites when NPC or gfxFolder changes
  useEffect(() => {
    if (!npc || !gfxFolder || !loadGfx) {
      setNpcSprites([]);
      return;
    }

    const loadNpcSprites = async () => {
      try {
        const sprites: HTMLImageElement[] = [];
        const graphicId = npc.graphic;
        
        if (!graphicId || graphicId === 0) {
          console.log('No graphic ID for NPC');
          return;
        }

        // NPCs are in GFX021
        // Each NPC has 40 frames total, with specific offsets for different animations
        // From EndlessClient: Standing=1/3, Walk=5-8/9-12, Attack=13-14/15-16
        // Base calculation: (graphicId - 1) * 40
        const baseGraphic = (graphicId - 1) * 40;

        // Load animation frames (using actual frame offsets from EndlessClient)
        // Frame offsets: 5-8=walk down, 9-12=walk up/left
        const frameOffsets = [5, 6, 7, 8, 9, 10, 11, 12]; // walk down x4, walk up/left x4
        for (let i = 0; i < frameOffsets.length; i++) {
          const resourceId = baseGraphic + frameOffsets[i] + 100; // +100 for PE offset
          const dataUrl = await loadGfx(21, resourceId); // GFX021 = NPCs
          
          if (dataUrl) {
            const img = new Image();
            img.src = dataUrl;
            await new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            });
            sprites[i] = img;
          }
        }

        console.log(`Loaded ${sprites.length} NPC sprites for graphic ${graphicId}`);
        setNpcSprites(sprites);
      } catch (error) {
        console.error('Error loading NPC sprites:', error);
      }
    };

    loadNpcSprites();
  }, [npc, gfxFolder, loadGfx]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || npcSprites.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    const WALK_FRAME_DELAY = 4; // Frames to wait before advancing walk cycle

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate which sprite to draw
      let spriteIndex = 0;
      if (isPlaying) {
        const walkCycle = direction === 'down' ? 0 : 4; // Down starts at 0, Up starts at 4
        const walkFrame = Math.floor(currentFrame / WALK_FRAME_DELAY) % 4; // 0-3
        spriteIndex = walkCycle + walkFrame;
      } else {
        // Standing pose
        spriteIndex = direction === 'down' ? 0 : 4;
      }

      // Draw NPC sprite
      if (npcSprites[spriteIndex]) {
        const sprite = npcSprites[spriteIndex];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw sprite centered with zoom
        const width = sprite.width * zoom;
        const height = sprite.height * zoom;
        const x = centerX - width / 2;
        const y = centerY - height / 2;
        ctx.drawImage(sprite, x, y, width, height);
      }

      if (isPlaying) {
        frameCount++;
        if (frameCount >= WALK_FRAME_DELAY) {
          frameCount = 0;
          setCurrentFrame((prev) => (prev + 1) % (WALK_FRAME_DELAY * 4));
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [npcSprites, currentFrame, direction, isPlaying, zoom]);

  if (!npc) {
    return (
      <div className="npc-preview-container">
        <p>Select an NPC to preview</p>
      </div>
    );
  }

  return (
    <div className="npc-preview-container">
      <div className="npc-preview-controls-top" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'left', marginBottom: '1rem' }}>
        <div className="direction-controls">
          <button
            onClick={() => setDirection(direction === 'down' ? 'up' : 'down')}
            className="btn btn-primary btn-small"
          >
            Direction: {direction === 'down' ? '↓ Down' : '← Left'}
          </button>
        </div>
        <div className="playback-controls">
          <button
            className="btn btn-small"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>
      
      <div className="npc-preview-canvas-container">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
};

export default NpcPreview;
