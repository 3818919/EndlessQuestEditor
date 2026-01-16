# GFX File Reference

This document maps each GFX file number to its contents, based on the EndlessClient source code (`EOLib.Graphics/GFXTypes.cs`).

## GFX File Mappings

| File Number | File Name   | Enum Name       | Contents                                    |
|-------------|-------------|-----------------|---------------------------------------------|
| 001         | gfx001.egf  | PreLoginUI      | Pre-login UI elements                       |
| 002         | gfx002.egf  | PostLoginUI     | Post-login UI elements                      |
| 003         | gfx003.egf  | MapTiles        | Map tile graphics                           |
| 004         | gfx004.egf  | MapObjects      | Map object graphics                         |
| 005         | gfx005.egf  | MapOverlay      | Map overlay graphics                        |
| 006         | gfx006.egf  | MapWalls        | Map wall graphics                           |
| 007         | gfx007.egf  | MapWallTop      | Map wall top graphics                       |
| 008         | gfx008.egf  | SkinSprites     | Character skin sprites (all races/genders)  |
| 009         | gfx009.egf  | MaleHair        | Male hair sprites (all styles/colors)       |
| 010         | gfx010.egf  | FemaleHair      | Female hair sprites (all styles/colors)     |
| 011         | gfx011.egf  | MaleShoes       | Male boots/shoes sprites                    |
| 012         | gfx012.egf  | FemaleShoes     | Female boots/shoes sprites                  |
| 013         | gfx013.egf  | MaleArmor       | Male armor sprites                          |
| 014         | gfx014.egf  | FemaleArmor     | Female armor sprites                        |
| 015         | gfx015.egf  | MaleHat         | Male hat/helmet sprites                     |
| 016         | gfx016.egf  | FemaleHat       | Female hat/helmet sprites                   |
| 017         | gfx017.egf  | MaleWeapons     | Male weapon sprites                         |
| 018         | gfx018.egf  | FemaleWeapons   | Female weapon sprites                       |
| 019         | gfx019.egf  | MaleBack        | Male back items (shields, wings, arrows)    |
| 020         | gfx020.egf  | FemaleBack      | Female back items (shields, wings, arrows)  |
| 021         | gfx021.egf  | NPC             | NPC sprites                                 |
| 022         | gfx022.egf  | Shadows         | Shadow graphics                             |
| 023         | gfx023.egf  | Items           | Item graphics (inventory icons)             |
| 024         | gfx024.egf  | Spells          | Spell effect animations                     |
| 025         | gfx025.egf  | SpellIcons      | Spell icon graphics                         |

## Character Sprite Organization

### Skin Sprites (GFX008)
- Contains all character skin sprites for all races/skin tones
- Organized as sprite sheets with 7 rows (one per race/skin tone):
  - 0: White
  - 1: Tan
  - 2: Yellow
  - 3: Orc
  - 4: Skeleton
  - 5: Panda
  - 6: (Reserved)
- Each row contains sprites for both genders and all directions/animations
- Resource IDs: 101 (standing), 102 (walking), 103 (attacking), 107 (bow attack)

### Hair Sprites (GFX009/GFX010)
- GFX009: Male hair
- GFX010: Female hair
- Hair color is NOT a separate file - it's an offset within the same GFX file
- Base graphic calculation: `(hairStyle - 1) * 40 + hairColor * 4`
- Each hair style has 40 sprites for different animations and directions
- Hair colors are stored as offsets within each style (typically 0-9 for 10 colors)

### Equipment Sprites (GFX011-GFX020)
- Separate files for male and female versions of each equipment type
- Each item has a base offset calculated as: `(graphicId - 1) * spriteCount`
- Sprite counts per equipment type:
  - Boots: 40 sprites per item
  - Armor: 50 sprites per item
  - Hats: 50 sprites per item
  - Weapons: 100 sprites per item
  - Shields/Back: 50 sprites per item

## Resource ID Offset

All sprite resources in GFX files use PE (Portable Executable) format with resource IDs starting at 100.
- To access sprite N in the file, use resource ID `N + 100`
- Example: First sprite (1) is at resource ID 101

## References

- EndlessClient source: `EOLib.Graphics/GFXTypes.cs`
- Character sprite calculator: `EndlessClient/Rendering/Sprites/CharacterSpriteCalculator.cs`
