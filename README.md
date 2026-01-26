<p align="center">
  <img src="icon.png" alt="Endless Quest Writer" width="128" height="128">
</p>

<h1 align="center">Endless Quest Writer</h1>

<p align="center">
  <strong>A visual editor for Endless Online quest files (.eqf)</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue" alt="Platform">
  <img src="https://img.shields.io/badge/electron-28.0.0-47848F?logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/typescript-5.3-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

---

> **Note**: This project is a fork of [OakTree](https://github.com/do4k/OakTree) by CoderDan, modified to focus specifically on quest editing functionality.

---

# Endless Quest Writer

A quest creation tool for Endless Online servers.

---

## ✨ Features

### Visual Quest Editor
- **Node-Based Flow Diagram** — Design quest flows visually with drag-and-drop states
- **Auto-Layout** — Automatic graph layout using the Dagre algorithm
- **Click-to-Edit** — Double-click any state node to edit its properties
- **Visual Connections** — See rule transitions between states at a glance

### State Editor
- **Unified Actions & Rules** — Actions and rules displayed in a single section with color-coded borders (green for actions, blue for rules)
- **Drag-and-Drop Reordering** — Interleave actions and rules in any order with persistent ordering
- **Save as Template** — Quickly save states as reusable templates
- **Load Template** - Quickly load from a state template 
- **Reset State** — Clear all actions/rules and start fresh

### Text Editor
- **Monaco Editor** — Professional code editor with syntax highlighting
- **EQF Language Support** — Custom syntax highlighting for quest files
- **Auto-Completion** — IntelliSense for actions and rules
- **Go-to Navigation** — Click state references to jump to definitions
- **Split View** — Edit in both visual and text modes simultaneously

### Quest Management
- **Quest List** — Browse and search all quests in your project
- **Quick Create** — Create new quests with custom ID, name, and version

### Template System
- **Quest Templates** — Browse, create, and manage reusable quest templates (Fetch, Kill, Delivery, etc.)
- **State Templates** — Define and organize state templates for common quest patterns
- **Custom Templates** — All templates are saved as `.eqf` files in `~/.EndlessQuestWriter/config/`

### Configuration Editors
- **Actions Editor** — Edit server actions configuration directly within the application
- **Rules Editor** — Modify server rules configuration with a dedicated editor interface
- **Drag-and-Drop Reordering** — Reorder items with changes persisted to config files

### Project System
- **Server Linking** — Link directly to your game server's directory
- **Auto-Discovery** — Automatically finds quests in `data/quests/`
- **5-Digit Auto Naming** — Quest files use standard naming (`00001.eqf` to `99999.eqf`)
- **Multiple Projects** — Switch between different server directories

### User Experience
- **Dark/Light Theme** — Toggle between themes in settings
- **Auto-Save** — Changes save automatically when using the visual editor
- **Keyboard Shortcuts** — Quick save with Ctrl+S
- **Status Indicators** — See last saved time and quest statistics

![example.gif](https://endless-memories.net/images/example.gif)
---

## Download

### <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg" width="20" height="20"> Windows
- [Download for Windows](https://github.com/3818919/EndlessQuestWriter/releases/download/v1.2.0/Endless.Quest.Writer.Setup.1.2.0.exe)

### <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" width="20" height="20"> macOS
- [Download for macOS](https://github.com/3818919/EndlessQuestWriter/releases/download/v1.2.0/Endless.Quest.Writer-1.2.0.dmg)

### <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" width="20" height="20"> Linux
- [Download for Linux](https://github.com/3818919/EndlessQuestWriter/releases/download/v1.2.0/Endless.Quest.Writer-1.2.0.AppImage)

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) 16+ and npm

### From Source

```bash
# Clone the repository
git clone https://github.com/3818919/EndlessQuestWriter.git
cd EndlessQuestWriter

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Pre-built Releases

Download the latest release for your platform from the [Releases](https://github.com/3818919/EndlessQuestWriter/releases) page:

- **Windows**: `.exe` installer
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` portable application

---

## Usage

### Getting Started

1. **Launch the Application**
2. **Link a Server Directory** — Click "Link Server Directory" and select your game server's root folder
3. **Browse Quests** — Your existing quests will appear in the left panel
4. **Create or Edit** — Select a quest to edit or click "New Quest" to create one

### Editor Modes

| Mode | Description |
|------|-------------|
| **Visual** | Node-based flow diagram editor (default) |
| **Split** | Side-by-side visual and text editors |
| **Text** | Full-screen Monaco text editor |

### Creating a New Quest

1. Click the **+ New Quest** button
2. Enter a **Quest ID** (1-99999, next available is suggested)
3. Enter a **Quest Name**
4. Set the **Version** number
5. Optionally mark as **Hidden**
6. Click **Create Quest**

### Using Templates

1. Open a quest in Visual or Split mode
2. Click the **Load Template...** dropdown
3. Select a template (Fetch Quest, Kill Quest, etc.)
4. The template will replace the current quest content

---

## Configuration

On first launch, default configuration files are copied to your user directory:

| Platform | Location |
|----------|----------|
| Linux | `~/.EndlessQuestWriter/config/` |
| macOS | `~/.EndlessQuestWriter/config/` |
| Windows | `C:\Users\<username>\.EndlessQuestWriter\config\` |

### actions.ini

Define available quest actions:

```ini
[AddNpcText]
signature = `AddNpcText(npcQuestId, "message")`
description = Displays dialog text from an NPC in the quest dialog window.

[GiveItem]
signature = `GiveItem(itemId, amount)`
description = Gives the player a specified amount of an item.
```

### rules.ini

Define available quest rules:

```ini
[TalkedToNpc]
signature = `TalkedToNpc(npcQuestId)`
description = Satisfied when the player talks to the specified NPC.

[GotItems]
signature = `GotItems(itemId, amount)`
description = Satisfied when the player has the specified items.
```

### templates/

Add custom quest templates as `.eqf` files:

```
~/.EndlessQuestWriter/config/templates/
├── Delivery Quest.eqf
├── Empty Quest.eqf
├── Fetch Quest.eqf
├── Kill Quest.eqf
└── My Custom Quest.eqf    ← Your custom template
```

The filename (without `.eqf`) becomes the template name in the dropdown.

---

## Server Directory Structure

The editor expects your game server to have this structure:

```
server/
├── data/
│   └── quests/
│       ├── 00001.eqf
│       ├── 00002.eqf
│       ├── 00003.eqf
│       └── ...
└── ...
```

---

## Quest File Format (EQF)

Quest files use the EQF format:

```
Main
{
    questname "My Quest Name"
    version 1
}

State Begin
{
    desc "Starting state description"

    action AddNpcText(1, "Hello, adventurer!");
    action ShowHint("Talk to the NPC to begin.");
    rule TalkedToNpc(1) goto QuestAccepted
}

State QuestAccepted
{
    desc "Player accepted the quest"

    action AddNpcText(1, "Bring me 5 apples.");
    action SetQuestState("Collect 5 Apples");
    rule GotItems(100, 5) goto QuestComplete
}

State QuestComplete
{
    desc "Quest completion"

    action AddNpcText(1, "Thank you!");
    action RemoveItem(100, 5);
    action GiveExp(500);
    action End();
}
```

---

## Building

Build distributable packages for each platform:

```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build:win    # Windows (.exe)
npm run build:mac    # macOS (.dmg)
npm run build:linux  # Linux (.AppImage)
```

Output files are placed in the `build/` directory.

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| [Electron](https://www.electronjs.org/) | Desktop application framework |
| [React 18](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | Code editor component |
| [React Flow](https://reactflow.dev/) | Node-based diagram editor |
| [Dagre](https://github.com/dagrejs/dagre) | Graph auto-layout algorithm |
| [Vite](https://vitejs.dev/) | Build tool |
| [electron-builder](https://www.electron.build/) | Application packaging |

---

## Credits

### Original Project

**[OakTree](https://github.com/do4k/OakTree)** — A comprehensive Endless Online pub editor

Created by **CoderDan** ([@do4k](https://github.com/do4k))

### Quest Editor Fork

**Endless Quest Writer** — Focused quest editing with enhanced visual tools

Modified by **Vexx** — [vexx.info](https://vexx.info/)

### Additional Credits

- Icons from [Material UI](https://mui.com/material-ui/material-icons/)

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Made with ❤️ for the Endless Online community
</p>
