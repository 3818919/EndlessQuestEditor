# OakTree - EO Pub Editor

A cross-platform visual editor for Endless Online pub files and GFX graphics, built with Electron.

## ✨ Features Overview

### 📝 Multi-File Editor
Edit multiple pub file types simultaneously:
- **Items** (.eif) - Equipment, consumables, weapons
- **NPCs** (.enf) - Monsters and NPCs
- **Classes** (.ecf) - Character classes
- **Skills** (.esf) - Spells and abilities
- **Quests** (.eqf) - Quest chains with visual editor
- **Equipment** - Manage class equipment sets
- **Drops** - Monster drop tables
- **Inns** - Inn respawn locations

### 🎨 Visual Features
- **GFX Preview** - Live preview of item/NPC graphics
- **Animated Character Preview** - See equipment on animated characters (walking/attacking)
- **Quest Editor** - Visual node-based quest chain editor
- **Theme Support** - Light/Dark mode
- **Resizable Panels** - Customize your workspace

### 🔧 Editor Features
- **Search & Filter** - Quickly find items by name or ID
- **Add/Remove/Duplicate** - Full CRUD operations
- **Validation** - Real-time validation of data
- **Undo/Redo** - Track changes (via git integration)

### 📦 Project Management
- **Project System** - Organize all pub files in one project
- **Import/Export** - Individual file operations
- **Auto-save** - Changes saved automatically
- **Git Integration** - Built-in version control

## 🎬 Feature Demos

### Theme Switching
Switch between light and dark modes for comfortable editing in any environment.

![Theme Switching](recordings/light-dark-mode.gif)

### Quest Editor
Visual node-based editor for creating complex quest chains with states, rules, and actions.

![Quest Editor](recordings/quest-editor.gif)

### Tab Management
Reorder tabs by dragging, and minimize side panels for more workspace.

![Tab Reordering](recordings/reorder-tabs.gif)

### Git Integration
Built-in version control with staging, commits, branches, and remote operations.

![Git Features](recordings/git.gif)

### Workspace Customization
Minimize left/right panels to maximize your editing space.

![Minimize Menus](recordings/minimize-menus.gif)

## 🚀 Installation

### Prerequisites
- Node.js 16+ and npm

### Quick Start

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/oaktree.git
cd oaktree
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run the application**:
```bash
npm start
```

## 🛠️ Development

Run in development mode with hot reload and DevTools:
```bash
npm run dev
```

## 📦 Building

Build for your current platform:
```bash
npm run build
```

Build for specific platforms:
```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 📖 Usage Guide

### Getting Started

1. **Create a New Project**
   - Click "New Project" on the landing screen
   - Choose a project name and location
   - Import your existing pub files (optional)

2. **Open an Existing Project**
   - Click "Open Project"
   - Select your project's `.oaktree` folder

### Working with Files

1. **Items Editor**
   - View and edit item properties (stats, requirements, metadata)
   - Preview item graphics in static or animated mode
   - Add, duplicate, or remove items

2. **Quest Editor**
   - Create quest chains with visual nodes
   - Define states, rules, and actions
   - Link quests together

3. **NPC/Class/Skills Editors**
   - Edit NPC stats and graphics
   - Configure character classes
   - Manage spells and abilities

### Version Control (Git)

1. **Initialize Repository**
   - Click the Git icon in the left sidebar
   - Click "Initialize Repository" for version control

2. **Making Commits**
   - Stage changed files
   - Write a commit message
   - Click "Commit"

3. **Branch Management**
   - Click the branch dropdown to create/switch branches
   - Delete unused branches

4. **Remote Operations**
   - Go to Settings tab
   - Add a remote repository URL
   - Use Push/Pull buttons in the header

### Tips & Shortcuts

- **Drag tabs** to reorder them
- **Toggle side panels** with the `<` and `>` buttons
- **Use filters** to quickly find items
- **Theme switching** via the theme icon in the left sidebar
- **Stash changes** when switching between different work

## 📚 Documentation

For more detailed information:
- **[Animation System](ANIMATION_SYSTEM.md)** - Character animation architecture
- **[GFX File Reference](GFX_FILE_REFERENCE.md)** - GFX file format and resource IDs
- **[Git Integration](GIT_INTEGRATION.md)** - Version control features
- **[Project Specification](PROJECT_SPECIFICATION.md)** - Technical specifications
- **[Quick Start Guide](QUICKSTART.md)** - Getting started tutorial

## 🗂️ File Format Information

### EIF Files
EIF (Endless Item File) files store item data including:
- Item names and IDs
- Item types and subtypes
- Stats (HP, TP, damage, armor, etc.)
- Stat modifiers (STR, INT, WIS, AGI, CON, CHA)
- Requirements (level, class, stats)
- Graphics references
- Additional metadata

### GFX Files
GFX files (`.egf`) are PE (Portable Executable) format files containing embedded bitmap resources.

**Item Graphics**: Stored in `gfx023.egf`
- Resource ID formula: `(2 * graphicId) + 100` for inventory graphics

**Character Animation Graphics**:
- `gfx008.egf`: Skin sprites (standing, walking, attacking)
- `gfx011-012.egf`: Boots sprites (male/female)
- `gfx013-014.egf`: Armor sprites (male/female)
- `gfx015-016.egf`: Hat/helmet sprites (male/female)
- `gfx017-018.egf`: Weapon sprites (male/female)
- `gfx019-020.egf`: Back/shield items (male/female)

See [GFX_FILE_REFERENCE.md](GFX_FILE_REFERENCE.md) for complete details.

## 🎯 Technical Details

### Architecture

**Frontend**: React 18 with TypeScript
**Backend**: Electron (Node.js)
**Build**: Vite + electron-builder
**Styling**: Custom CSS with theme variables

### Character Animation System

Multi-layered rendering system with:
- **Z-order layering**: Back items → skin → boots → armor → weapon → shield → hair → helmet
- **Frame-based animation**: Walking (4 frames), attacking (2 frames), standing poses
- **Gender support**: Separate sprites and offsets for male/female characters
- **Zoom support**: 1x-4x zoom with pixel-perfect scaling

See [ANIMATION_SYSTEM.md](ANIMATION_SYSTEM.md) for architecture details.

For detailed information about the animation system, see [ANIMATION_SYSTEM.md](ANIMATION_SYSTEM.md).

## Project Structure

```
eo-pub-editor/
├── src/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Preload script for IPC
│   ├── eif-parser.js        # EIF file parser
│   ├── gfx-loader.js        # GFX file loader
│   ├── animation/           # Character animation system
│   │   ├── character-animator.js  # Main animator class
│   │   ├── constants.js           # Enums and constants
│   │   ├── offsets.js             # Equipment offset tables
│   │   ├── sprite-loader.js       # Sprite loading utilities
│   │   └── renderer.js            # Canvas rendering functions
│   └── renderer/
│       ├── index.html       # Main UI
│       ├── styles.css       # Styling
│       └── app.js           # Application logic
├── package.json
└── README.md
```

## Technical Details

### Number Encoding
EO files use a custom number encoding scheme:
- 254 represents 1
- 0 represents 254
- Numbers are encoded in base-253

## 🤝 Contributing

Contributions are welcome! Please feel free to:
- Report bugs via GitHub Issues
- Suggest features or improvements
- Submit pull requests

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

- File format specifications from [EndlessClient](https://github.com/ethanmoffat/EndlessClient)
- Built with [Electron](https://www.electronjs.org/) and [React](https://react.dev/)
- Icons from [game-icons.net](https://game-icons.net/) (CC BY 3.0)

---

**OakTree** - A modern, feature-rich editor for Endless Online content creation
