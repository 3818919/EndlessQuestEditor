import React, { useEffect, useState, useRef } from 'react';
import { GFX_FILES } from '../../../animation/constants';

interface HairstyleSelectorProps {
  gender: number;
  hairColor: number;
  hairStyle: number;
  setHairStyle: (style: number) => void;
  gfxFolder: string;
  loadGfx: (gfxNumber: number, resourceId?: number) => Promise<string | null>;
}

export default function HairstyleSelector({
  gender,
  hairColor,
  hairStyle,
  setHairStyle,
  gfxFolder,
  loadGfx
}: HairstyleSelectorProps) {
  const [hairstyles, setHairstyles] = useState<Array<{style: number, dataUrl: string}>>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!gfxFolder || !loadGfx) {
      setHairstyles([]);
      return;
    }

    // Prevent duplicate loads
    if (loadingRef.current) {
      return;
    }

    const loadHairstyles = async () => {
      loadingRef.current = true;
      setLoading(true);
      try {
        // Determine which GFX file to use based on gender
        const hairGfxFile = gender === 0 ? GFX_FILES.FEMALE_HAIR : GFX_FILES.MALE_HAIR;
        
        // Load hairstyles ONE AT A TIME to avoid blocking the browser
        // Even loading 2-3 at once causes exponential slowdown with these legacy BMPs
        const MAX_STYLES = 30;
        const BATCH_SIZE = 3; // Update UI every 3 hairstyles for better perceived performance
        const loadedStyles = [];
        let consecutiveFailures = 0;
        
        for (let style = 1; style <= MAX_STYLES; style++) {
          // Calculate resource ID: (hairStyle - 1) * 40 + hairColor * 4 + 2 (down direction) + 100
          const baseGraphic = (style - 1) * 40 + hairColor * 4;
          const resourceId = baseGraphic + 2 + 100;
          
          // Load ONE image at a time
          const dataUrl = await loadGfx(hairGfxFile, resourceId);
          
          if (dataUrl) {
            loadedStyles.push({ style, dataUrl });
            consecutiveFailures = 0;
            
            // Update UI every BATCH_SIZE images for progressive rendering
            if (loadedStyles.length % BATCH_SIZE === 0) {
              setHairstyles([...loadedStyles]);
            }
          } else {
            consecutiveFailures++;
            // If we get 5 consecutive misses after loading some styles, stop
            if (consecutiveFailures >= 5 && loadedStyles.length > 0) {
              setHairstyles(loadedStyles);
              return;
            }
          }
        }
        
        // Final update with all loaded styles
        setHairstyles(loadedStyles);

        setHairstyles(loadedStyles);
      } catch (error) {
        console.error('Error loading hairstyles:', error);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    loadHairstyles();
  }, [gender, hairColor, gfxFolder, loadGfx]);

  if (!gfxFolder) {
    return (
      <div className="hairstyle-selector">
        <div className="hairstyle-selector-empty">
          Set GFX folder to see hairstyle previews
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hairstyle-selector">
        <div className="hairstyle-selector-loading">
          Loading hairstyles...
        </div>
      </div>
    );
  }

  if (hairstyles.length === 0) {
    return (
      <div className="hairstyle-selector">
        <div className="hairstyle-selector-empty">
          No hairstyles found
        </div>
      </div>
    );
  }

  return (
    <div className="hairstyle-selector">
      <div className="hairstyle-grid">
        {/* Bald/No hair option */}
        <div
          className={`hairstyle-item ${hairStyle === 0 ? 'selected' : ''}`}
          onClick={() => setHairStyle(0)}
          title="No Hair"
        >
          <div className="hairstyle-preview bald">
            <span>✕</span>
          </div>
          <div className="hairstyle-label">None</div>
        </div>

        {/* All loaded hairstyles */}
        {hairstyles.map(({ style, dataUrl }) => (
          <div
            key={style}
            className={`hairstyle-item ${hairStyle === style ? 'selected' : ''}`}
            onClick={() => setHairStyle(style)}
            title={`Hair Style ${style}`}
          >
            <div className="hairstyle-preview">
              {dataUrl && (
                <img 
                  src={dataUrl} 
                  alt={`Hair style ${style}`}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%',
                    imageRendering: 'pixelated'
                  }}
                />
              )}
            </div>
            <div className="hairstyle-label">{style}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
