import React, { useEffect, useRef, useState } from 'react';
import { CharacterAnimator } from '../../../animation/character-animator';

interface CharacterPreviewProps {
  equippedItems: Record<string, any>;
  gender: number;
  hairStyle: number;
  hairColor: number;
  skinTone: number;
  loadGfx: (gfxNumber: number, resourceId?: number) => Promise<string | null>;
  gfxFolder: string;
}

const CharacterPreview: React.FC<CharacterPreviewProps> = ({
  equippedItems,
  gender,
  hairStyle,
  hairColor,
  skinTone,
  loadGfx: _loadGfx,
  gfxFolder
}) => {
  const canvasRef = useRef(null);
  const animatorRef = useRef(null);
  const [animationState, setAnimationState] = useState('walking');
  const [zoom, setZoom] = useState(2);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState<'down' | 'up'>('down');

  // Handle mouse wheel zoom with non-passive listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(prev => {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        return Math.max(0.5, Math.min(4, prev + delta));
      });
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  // Initialize animator
  useEffect(() => {
    if (canvasRef.current && !animatorRef.current) {
      animatorRef.current = new CharacterAnimator();
      animatorRef.current.initialize(canvasRef.current);
    }
  }, []);

  // Update character appearance when equipment or appearance changes
  useEffect(() => {
    if (!animatorRef.current || !gfxFolder) return;

    const updateCharacter = async () => {
      const animator = animatorRef.current;
      
      // Stop current animation
      animator.stop();
      
      // Update appearance properties
      animator.gender = gender;
      animator.hairStyle = hairStyle;
      animator.hairColor = hairColor;
      animator.skinTone = skinTone;
      
      // Load skin sprites
      const skinData = await animator.loadGFXFile(gfxFolder, animator.GFX_SKIN);
      if (skinData) {
        animator.sprites.skin = await animator.loadSkinSprites(skinData, skinTone);
      }
      
      // Load hair sprites
      if (hairStyle > 0) {
        const hairGfxFile = gender === 0 ? animator.GFX_FEMALE_HAIR : animator.GFX_MALE_HAIR;
        const hairData = await animator.loadGFXFile(gfxFolder, hairGfxFile);
        if (hairData) {
          animator.sprites.hair = await animator.loadHairSprites(hairData, hairStyle, hairColor, animator.direction);
        }
      } else {
        animator.sprites.hair = null;
      }
      
      // Load equipped items (equippedItems already contains full item objects)
      console.log('Equipped items in CharacterPreview:', equippedItems);
      const armor = equippedItems.armor || null;
      const helmet = equippedItems.helmet || null;
      const boots = equippedItems.boots || null;
      const weapon = equippedItems.weapon || null;
      const shield = equippedItems.shield || null;
      console.log('Parsed equipment:', { armor, helmet, boots, weapon, shield });
      
      // Load armor if equipped (layer 1 - on top of skin)
      if (armor && armor.dollGraphic && armor.dollGraphic > 0) {
        await animator.loadArmorSprite(gfxFolder, armor.dollGraphic, gender);
      } else {
        animator.sprites.armor = null;
      }
      
      // Load boots if equipped (layer 2)
      if (boots && boots.dollGraphic && boots.dollGraphic > 0) {
        await animator.loadBootsSprite(gfxFolder, boots.dollGraphic);
      } else {
        animator.sprites.boots = null;
      }
      
      // Load shield/back items if equipped (layer 3 - can be behind or beside character)
      if (shield && shield.dollGraphic && shield.dollGraphic > 0) {
        await animator.loadShieldSprite(gfxFolder, shield.dollGraphic, shield.subType || 0);
      } else {
        animator.sprites.shield = null;
        animator.sprites.back = null;
      }
      
      // Load weapon if equipped (layer 4)
      if (weapon && weapon.dollGraphic && weapon.dollGraphic > 0) {
        await animator.loadWeaponSprite(gfxFolder, weapon.dollGraphic);
      } else {
        animator.sprites.weapon = null;
      }
      
      // Load helmet if equipped (layer 5 - on top of hair)
      if (helmet && helmet.dollGraphic && helmet.dollGraphic > 0) {
        await animator.loadHelmetSprite(gfxFolder, helmet.dollGraphic);
      } else {
        animator.sprites.helmet = null;
      }
      
      // Set animation state and direction
      animator.state = animationState;
      animator.direction = direction;
      
      // Start animation if playing
      if (isPlaying) {
        animator.start();
      } else {
        animator.render();
      }
    };

    updateCharacter();
  }, [equippedItems, gender, hairStyle, hairColor, skinTone, gfxFolder, animationState, isPlaying, direction]);
  // Note: Removed 'items' dependency to prevent reloading on every item edit
  // Equipment changes are tracked via equippedItems, which contains item IDs

  // Update zoom level separately without reloading sprites
  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.zoomLevel = zoom;
      if (!animatorRef.current.isAnimating) {
        animatorRef.current.render();
      }
    }
  }, [zoom]);

  // Handle animation state changes
  const handleAnimationChange = (newState) => {
    setAnimationState(newState);
    if (animatorRef.current) {
      animatorRef.current.state = newState;
      animatorRef.current.currentFrame = 0;
      animatorRef.current.frameTimer = 0;
    }
  };

  // Handle play/pause
  const togglePlayback = () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    
    if (animatorRef.current) {
      if (newIsPlaying) {
        animatorRef.current.start();
      } else {
        animatorRef.current.stop();
        animatorRef.current.render();
      }
    }
  };

  return (
    <div className="character-preview">
      <h4>Character Preview</h4>
      
      <div className="preview-controls" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: '1rem', flexDirection: 'row' }}>
        <div>
          <button
            className="btn btn-small"
            onClick={() => setDirection(direction === 'down' ? 'up' : 'down')}
          >
            Direction: {direction === 'down' ? '↓ Down' : '← Left'}
          </button>
        </div>

        <div>
          <button
            className={`btn btn-small ${animationState === 'walking' ? 'active' : ''}`}
            onClick={() => handleAnimationChange('walking')}
          >
            Walk
          </button>
        </div>
        <div>
          <button
            className={`btn btn-small ${animationState === 'attacking' ? 'active' : ''}`}
            onClick={() => handleAnimationChange('attacking')}
          >
            Attack
          </button>
        </div>
        <div>
          <button
            className={`btn btn-small ${animationState === 'spell' ? 'active' : ''}`}
            onClick={() => handleAnimationChange('spell')}
          >
            Spell
          </button>
        </div>
        <div>
          <button
            className={`btn btn-small ${animationState === 'sitting' ? 'active' : ''}`}
            onClick={() => handleAnimationChange('sitting')}
          >
            Sit
          </button>
        </div>

        <div>
          <button
            className="btn btn-small"
            onClick={togglePlayback}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      <div className="preview-canvas-container">
        <canvas
          ref={canvasRef}
          width="300"
          height="300"
          className="preview-canvas"
        />
      </div>

      {!gfxFolder && (
        <div className="preview-warning">
          <p>⚠️ Set GFX folder to preview character</p>
        </div>
      )}
    </div>
  );
};

export default CharacterPreview;
