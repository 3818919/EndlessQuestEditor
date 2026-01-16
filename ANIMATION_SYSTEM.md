# Character Animation System

This document explains how the animated character preview works in the EO Pub Editor.

## Overview

The character animator displays equipment items on a male character sprite with appropriate animations:
- **Armor items** (type 12): Walking animation (4 frames)
- **Weapon items** (type 10): Attacking animation (2 frames)
- **Shield/Back items** (type 11): Attacking animation
- **Boots items** (type 14): Walking animation (4 frames)
- **Hat items** (type 13): Walking animation (4 frames)

## Architecture

The animation system is organized into modular files within `src/animation/`:

### Core Files

#### `character-animator.js`
The main orchestrator class that:
- Manages animation state (standing, walking, attacking)
- Coordinates sprite loading and rendering
- Handles the animation loop and frame timing
- Provides the public API for the preview component

#### `constants.js`
Defines core enums and constants:
- `Gender`: Female (0), Male (1)
- `CharacterFrame`: All possible character poses/actions (22 total frames)
- `GFX_FILES`: GFX file numbers for different equipment types
- `ANIMATION_TIMING`: Frame delays for different animation states
- `ITEM_TYPE`: Item type constants from EIF spec
- Helper functions for calculating base graphics IDs

#### `offsets.js`
Equipment positioning tables that define pixel offsets for each equipment type:
- `BOOTS_OFFSETS`: Boot positioning for all character frames
- `ARMOR_OFFSETS`: Armor positioning for all character frames
- `HAT_OFFSETS`: Hat/helmet positioning for all character frames
- `WEAPON_OFFSETS`: Weapon positioning for all character frames
- `SHIELD_OFFSETS`: Shield positioning for all character frames
- `HAIR_OFFSETS`: Hair positioning for all character frames
- `BACK_OFFSETS`: Back item (wings, arrows) positioning for all character frames

Each offset table is organized by gender and character frame, ensuring equipment aligns properly with the character sprite in every pose.

#### `sprite-loader.js`
Handles loading sprite data from GFX files:
- `loadGFXFile()`: Loads raw GFX file data
- `createImageFromData()`: Converts bitmap data to Image objects with transparency
- `loadSkinSprites()`: Loads base character skin sprite sheets
- `loadArmorSprite()`: Loads armor sprites (50 sprites per item)
- `loadWeaponSprite()`: Loads weapon sprites (100 sprites per item)
- `loadBackSprite()`: Loads shield/back item sprites (50 sprites per item)
- `loadBootsSprite()`: Loads boots sprites (40 sprites per item)
- `loadHelmetSprite()`: Loads hat/helmet sprites (50 sprites per item)

#### `renderer.js`
Handles drawing sprites to canvas:
- `getCurrentCharacterFrame()`: Determines current frame enum based on state
- `getEquipmentOffset()`: Retrieves equipment offset for current frame
- `drawSkinSprite()`: Draws character skin from sprite sheet
- `drawSprite()`: Draws equipment sprites with offsets
- `drawStanding()`: Renders all layers for standing pose
- `drawWalking()`: Renders all layers for walking animation
- `drawAttacking()`: Renders all layers for attacking animation

### Sprite Layers
Character sprites are rendered in layers (bottom to top):
1. **Skin**: Base character skin from GFX008
2. **Armor**: Armor sprites from GFX013 (male)
3. **Weapon**: Weapon sprites from GFX017 (male)
4. **Back/Shield**: Shield sprites from GFX019 (male)

### Animation States

#### Standing
- Single static sprite for each layer
- Used for non-equippable items

#### Walking
- 4 frames of animation
- Frame delay: 9 game ticks per frame
- Direction: Down (facing camera)
- Sprites:
  - Skin: GFX008 #2 (sprite sheet with 16 columns)
  - Armor: Base graphic + offsets 3-6

#### Attacking
- 2 frames for melee weapons
- 1 frame for ranged weapons (bow)
- Frame delay: 12 game ticks per frame
- Direction: Down (facing camera)
- Sprites:
  - Skin: GFX008 #3 (melee) or #7 (bow)
  - Weapon: Base graphic + offsets 13-14 (SwingFrame1/2)

## GFX Resource Mapping

### Skin Sprites (GFX008)
The skin sprite sheet contains multiple GFX resources:
- **GFX 1**: Standing poses (4 directions, 2 genders, 7 races)
- **GFX 2**: Walking animation (16 columns: 4 directions × 4 frames)
- **GFX 3**: Melee attacking (8 columns: 4 directions × 2 frames)
- **GFX 7**: Bow/ranged attacking (4 columns: 4 directions × 1 frame)

Each skin sheet has:
- **7 rows**: One for each race (0-6)
- **Multiple columns**: Organized by gender, direction, and frame

### Equipment Sprites
Equipment graphics are organized with a base offset calculation:

**Armor** (50 sprites per item):
```
baseGraphic = (graphicId - 1) * 50 + 1
```

Sprite types (offsets from base):
- Standing: +1
- WalkFrame1: +3
- WalkFrame2: +4
- WalkFrame3: +5
- WalkFrame4: +6

**Weapons** (100 sprites per item):
```
baseGraphic = (graphicId - 1) * 100 + 1
```

Sprite types (offsets from base):
- Standing: +1
- SwingFrame1: +13
- SwingFrame2: +14

**Shields/Back Items** (50 sprites per item):
```
baseGraphic = (graphicId - 1) * 50 + 1
```

Sprite types (offsets from base):
- Standing: +1
- ShieldItemOnBack_AttackingWithBow: +3

## Canvas Rendering

The animator uses an HTML5 canvas with:
- Size: 400x400 pixels
- Image smoothing: Disabled (pixelated rendering)
- Compositing: Layers drawn sequentially

### Drawing Process

1. Clear canvas
2. Calculate center position
3. Draw skin sprite (with frame calculation for sprite sheets)
4. Draw equipment sprites (centered over character)
5. Request next animation frame

### Frame Updates

The animation loop uses `requestAnimationFrame` and tracks:
- `currentFrame`: Current animation frame (0-3 for walking, 0-1 for attacking)
- `frameTimer`: Counter to delay frame changes
- `state`: Current animation state ('standing', 'walking', 'attacking')

## Integration with UI

### Preview Mode Toggle
Two buttons in the preview panel:
- **Static**: Shows item's inventory graphic (default)
- **Animated**: Shows character with equipment and animation

### Mode Switching
When switching to animated mode:
1. Create canvas element (400x400)
2. Initialize animator with canvas
3. Load character sprites based on item type
4. Start animation loop

When switching to static mode:
1. Stop animation loop
2. Clear canvas
3. Display item graphic as static image

## Performance Considerations

- **Caching**: GFX data is cached after first load
- **Lazy Loading**: Character sprites only load in animated mode
- **Resource Cleanup**: Animator stops when preview is cleared or mode changes
- **Efficient Rendering**: Only redraws on frame changes

## Future Enhancements

Possible improvements to the animation system:
- [ ] Add direction controls (up, down, left, right)
- [ ] Support female character sprites
- [ ] Add race selection
- [ ] Include boots, gloves, hats in preview
- [ ] Add spell casting animation
- [ ] Support sitting animations
- [ ] Customize background color/image
- [ ] Add zoom controls
- [ ] Export animation as GIF

## References

Based on EndlessClient's character rendering system:
- `CharacterSpriteCalculator.cs`: Sprite offset calculations
- `CharacterAnimator.cs`: Animation timing and state management
- `ArmorShieldSpriteType.cs`, `WeaponSpriteType.cs`: Sprite type enums
