# OakTree - Endless Online Visual Editor

## Project Overview

OakTree is a comprehensive visual editor for Endless Online game data files, built as an Electron desktop application. It provides intuitive interfaces for editing game items, NPCs, spells, classes, inns, quests, and graphics (GFX files) with real-time visual feedback and modern UI/UX.

### Primary Goals
- Replace tedious manual editing of binary and text-based game files
- Provide visual, drag-and-drop interfaces for game designers
- Enable real-time preview of game data (character animations, spell effects, items)
- Support import/export workflows for easy data management
- Reduce errors with type-safe editors and validation

## Technology Stack

### Core Framework
- **Electron** - Desktop application framework
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tooling and dev server

### UI Libraries
- **Monaco Editor** (@monaco-editor/react) - Code editor component for text-based editing
- **React Flow** (@xyflow/react) - Node-based visual diagram editor
- **dagre** - Graph auto-layout algorithm for quest flow diagrams
- **html-to-image** - Export visual diagrams as PNG images

### Build & Development
- **electron-builder** - Package and distribute the application
- **concurrently** - Run multiple dev processes
- **GitHub Actions** - CI/CD for automated releases

## Current Features

### 1. Item Editor
- Browse and edit all game items (weapons, armor, consumables, etc.)
- Visual fields for all item properties:
  - Name, description, graphic ID
  - Type, subtype, special properties
  - Stats (HP, TP, strength, intelligence, etc.)
  - Weight, size, value
  - Gender and class restrictions
- Grid-based item list with filtering
- Item duplication for quick variants
- Import/export individual items or full item database

### 2. NPC Editor
- Edit all Non-Player Character data
- Configure NPC properties:
  - Name, graphic ID, boss status
  - HP, experience, min/max damage
  - Drop tables with item IDs and rates
- NPC list with search and filtering
- Bulk import/export capabilities

### 3. Spell/Skill Editor
- Edit magical spells and character skills
- Configure spell properties:
  - Name, chant text, icon ID
  - Mana cost, cast time
  - Target type (self, single, group, all)
  - Effect type (damage, heal, buff)
- Integration with character animation system

### 4. Class Editor
- Define character classes (warrior, mage, archer, etc.)
- Configure class-specific properties:
  - Base stats and stat growth
  - Equipment restrictions
  - Skill access and progression

### 5. Inn Editor
- Edit spawn points and inn locations
- Configure inn properties:
  - Name, map coordinates
  - Alternate spawn points (for different conditions)
  - Level restrictions

### 6. Quest Editor ⭐ (Latest Major Feature)

#### Text Editor Mode
- **Monaco Editor** with custom EQF syntax highlighting
- Custom language definition for quest files with:
  - Keyword highlighting (State, action, rule, goto, random)
  - Action highlighting (80+ action types like AddNpcText, GiveItem, SetQuest)
  - Rule highlighting (60+ rule types like TalkedToNpc, GotItems, InputNpc)
  - String and number literal highlighting
- Save/revert functionality with Cmd/Ctrl+S shortcut
- Real-time parsing and validation
- **Ctrl/Cmd+Click Navigation** on goto statements to jump between state definitions

#### Visual Flow Diagram Mode
- **React Flow** based node diagram showing quest structure
- **Custom State Nodes** displaying:
  - State name and description
  - Actions list (filtered, excludes End() actions shown separately)
  - Rules list with conditional logic
  - **"Open in Editor" icon button** for quick navigation to text editor
- **Special END Node** - Circular red node for quest termination via End() actions
- **Smart Edge Connections**:
  - Purple dashed edges - Conditional rules (GotItems, TalkedToNpc, etc.)
  - Cyan solid edges - Unconditional rules (Always)
  - Teal edges - SetState/Goto actions
  - Red animated edges - End() actions leading to END node
- **Auto-layout** using dagre algorithm with dynamic node sizing
- **"Add State" button** to create new empty quest states
- **Template dropdown** to load pre-built quest patterns:
  - Fetch Quest (collect items for NPC)
  - Kill Quest (defeat X enemies)
  - Delivery Quest (bring item to another NPC)
  - Collection Quest (gather multiple item types)
  - Class Change Quest (upgrade character class)
- **PNG Export** functionality to save quest diagrams as images

#### Split View Mode
- Side-by-side text editor and visual diagram
- Real-time synchronization between views
- Changes in text editor update the diagram
- Visual navigation updates text editor cursor/scroll position

#### Quest Data Format (EQF)
```
Main
{
  version 1
  name "Quest Name"
}

State StateName
{
  desc "Description of what happens in this state"
  
  action AddNpcText(1, "Hello adventurer!")
  action GiveItem(100, 5)
  
  rule TalkedToNpc(1) goto NextState
  rule Always goto Begin
}

random
{
  1-10 "Random dialogue option 1"
  11-20 "Random dialogue option 2"
}
```

#### Supported Quest Actions (80+)
- **NPC Interaction**: AddNpcText, AddNpcInput, RemoveNpcText, ShowHint
- **Quest Management**: SetQuest, ResetQuest, GiveQuest
- **Inventory**: GiveItem, RemoveItem, GiveItemByChance
- **Character**: PlaySound, PlayEffect, Quake, Warp, SetClass
- **State Control**: SetState, Goto, End

#### Supported Quest Rules (60+)
- **NPC Events**: TalkedToNpc, KilledNpc, InputNpc
- **Inventory**: GotItems, GotAllItems, LostItem
- **Character State**: CitizenByName, NotCitizen, EnterMap
- **Quest Progress**: QuestCompleted, QuestStarted
- **Logic**: Always (unconditional goto)

### 7. GFX (Graphics) Loader
- Load and display Endless Online GFX files (custom binary format)
- Render sprite sheets with multiple frames
- Preview character animations, items, NPCs, spell effects

### 8. Character Animation System
- Real-time character preview with equipment
- Animate walking, attacking, spell casting
- Direction controls (8 directions)
- Frame-by-frame playback
- Equipment layering (armor, weapons, boots, etc.)

### 9. Project Management
- Create new projects or load existing ones
- Per-project settings and configurations
- Data validation on save
- Auto-save support

### 10. Theme System
- Dark mode (default)
- Light mode
- Consistent color variables across the application
- Smooth theme transitions

## Architecture

### Directory Structure
```
oaktree/
├── src/
│   ├── main.ts                 # Electron main process
│   ├── preload.ts              # Preload script for IPC
│   ├── eqf-parser.ts           # Quest file parser (80+ actions, 60+ rules)
│   ├── ecf-parser.ts           # Class file parser
│   ├── eif-parser.ts           # Item file parser
│   ├── enf-parser.ts           # NPC file parser
│   ├── esf-parser.ts           # Spell/Skill file parser
│   ├── inn-parser.ts           # Inn file parser
│   ├── gfx-loader.ts           # GFX graphics loader
│   ├── bmp-converter.ts        # BMP to EGF converter
│   ├── animation/              # Character animation system
│   │   ├── character-animator.ts
│   │   ├── sprite-loader.ts
│   │   ├── renderer.ts
│   │   ├── spell-metadata.ts
│   │   └── offsets.ts
│   ├── renderer/               # React UI
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── styles.css
│   │   ├── components/
│   │   │   ├── FileMenu.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   ├── ProjectSettings.tsx
│   │   │   ├── GenericList.tsx
│   │   │   ├── ListFilter.tsx
│   │   │   ├── items/
│   │   │   │   ├── ItemEditor.tsx
│   │   │   │   └── ItemList.tsx
│   │   │   ├── npcs/
│   │   │   │   ├── NPCEditor.tsx
│   │   │   │   └── NPCList.tsx
│   │   │   ├── skills/
│   │   │   │   ├── SkillEditor.tsx
│   │   │   │   └── SkillList.tsx
│   │   │   ├── classes/
│   │   │   │   ├── ClassEditor.tsx
│   │   │   │   └── ClassList.tsx
│   │   │   ├── inns/
│   │   │   │   └── InnEditor.tsx
│   │   │   └── quests/
│   │   │       ├── QuestEditor.tsx
│   │   │       ├── QuestList.tsx
│   │   │       ├── QuestTextEditor.tsx      # Monaco editor
│   │   │       └── QuestFlowDiagram.tsx     # React Flow diagram
│   │   ├── hooks/
│   │   │   ├── useProject.ts
│   │   │   ├── usePubData.ts
│   │   │   ├── useInnData.ts
│   │   │   ├── useGFXCache.ts
│   │   │   ├── useEquipment.ts
│   │   │   ├── useAppearance.ts
│   │   │   ├── useFileImportExport.ts
│   │   │   └── useResizablePanel.ts
│   │   ├── pages/
│   │   │   ├── LandingScreen.tsx
│   │   │   └── EditorPage.tsx
│   │   ├── services/
│   │   │   └── projectService.ts
│   │   └── utils/
│   │       ├── dataTransforms.ts
│   │       ├── fileIO.ts
│   │       ├── eqfLanguage.ts           # Monaco language definition
│   │       └── questTemplates.ts        # Quest templates
│   └── types/
│       └── global.d.ts
├── data/                       # Sample game data
│   ├── gfx/                   # Graphics files (gfx001.egf - gfx025.egf)
│   └── pub/                   # Game data files (dat001.eif, dtn001.enf, etc.)
├── build/                      # Build outputs
├── .github/
│   └── workflows/
│       └── release.yml        # CI/CD configuration
├── package.json
├── tsconfig.json
├── vite.config.js
├── README.md
├── QUICKSTART.md
└── ANIMATION_SYSTEM.md
```

### Key Design Patterns

#### React Hooks for Data Management
```typescript
// Example: useProject hook manages project state
const { project, updateProject, saveProject } = useProject();
```

#### IPC Communication (Electron)
- Main process handles file I/O, system dialogs
- Renderer process handles UI and user interactions
- Preload script provides secure IPC bridge

#### Parser Architecture
All parsers follow consistent interface:
```typescript
interface Parser<T> {
  parse(data: Buffer | string, id?: string): T;
  serialize(data: T): string | Buffer;
}
```

#### Component Composition
- GenericList - Reusable list component with filtering
- Editor components follow consistent prop patterns
- Hooks encapsulate complex state logic

### Monaco Editor Integration

#### Custom Language Registration
```typescript
// EQF language definition
monaco.languages.register({ id: 'eqf' });
monaco.languages.setMonarchTokensProvider('eqf', {
  keywords: ['State', 'action', 'rule', 'goto', 'Main', 'random'],
  actions: ['AddNpcText', 'GiveItem', 'SetQuest', ...],
  rules: ['TalkedToNpc', 'GotItems', 'InputNpc', ...]
});
```

#### Navigation Features
- **Goto Links**: State names in "goto StateName" are styled as clickable links
- **Ctrl/Cmd+Click**: Mouse event handler detects modifier keys and navigates
- **Line Highlighting**: Temporary highlight decoration (2-second duration) with cyan background
- **Auto-scroll**: `revealLineInCenter()` ensures target line is visible

### React Flow Integration

#### Custom Node Types
```typescript
const nodeTypes = {
  stateNode: StateNode,    // Quest state with actions/rules
  endNode: EndNode         // Special termination node
};
```

#### Edge Styling
- Conditional rules: Purple dashed (`strokeDasharray: '5,5'`)
- Unconditional rules: Cyan solid, animated
- End actions: Red solid, animated, arrow to END node

#### Layout Algorithm
- Dagre graph layout with top-to-bottom flow (`rankdir: 'TB'`)
- Dynamic node heights based on content (actions/rules count)
- Configurable spacing (`nodesep: 100`, `ranksep: 150`)

## File Formats

### EQF (Quest Files)
- Text-based format
- Sections: Main, State blocks, random blocks
- Actions: Function-like syntax with parameters
- Rules: Conditional logic with goto statements

### EIF (Item Files)
- Binary format (Endless Item File)
- Contains item properties, stats, restrictions

### ENF (NPC Files)
- Binary format (Endless NPC File)
- NPC stats, drops, behavior data

### ESF (Spell/Skill Files)
- Binary format (Endless Spell File)
- Spell effects, costs, targeting

### ECF (Class Files)
- Binary format (Endless Class File)
- Class stats, restrictions, progression

### EID (Inn Files)
- Text-based format
- Inn names, coordinates, spawn points

### EGF (Graphics Files)
- Custom binary format
- Sprite sheets with frame data
- Palette-based or PNG-based

## Future Enhancements

### High Priority

#### 1. State Node Editor Panel
**Goal**: Click on a state node in the visual diagram to open an inline editor

**Features**:
- Side panel or modal that opens when clicking a state node
- Editable fields:
  - State name (with validation)
  - Description text area
  - Actions list with add/remove/reorder
  - Rules list with add/remove/reorder
- Action editor:
  - Dropdown to select action type (from 80+ available)
  - Dynamic parameter inputs based on action type
  - Type validation (numbers, strings, item IDs, NPC IDs)
  - Visual hints for required parameters
- Rule editor:
  - Dropdown to select rule type (from 60+ available)
  - Parameter inputs
  - Goto state selector (dropdown of all states)
- Save/cancel buttons
- Real-time update of both text editor and visual diagram

**Implementation Approach**:
```typescript
// When state node is clicked
const onNodeClick = (event: React.MouseEvent, node: Node) => {
  setSelectedState(node.data.stateData);
  setEditorPanelOpen(true);
};

// Editor panel component
<StateEditorPanel 
  state={selectedState}
  allStates={quest.states}
  onSave={(updates) => updateQuestState(updates)}
  onClose={() => setEditorPanelOpen(false)}
/>
```

#### 2. Drag-and-Drop from Item/NPC Lists
**Goal**: Drag items or NPCs into quest editor to automatically create actions

**Features**:
- Drag item from ItemList → Drop on state node → Creates GiveItem(itemId, 1) action
- Drag NPC from NPCList → Drop on state node → Creates AddNpcText(npcId, "text") action
- Visual feedback during drag (ghost image, drop zones)
- Configurable parameters on drop (quantity for items, dialogue for NPCs)

**Implementation Approach**:
```typescript
// Make items draggable
<div 
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData('itemId', item.id);
    e.dataTransfer.setData('type', 'item');
  }}
>
  {item.name}
</div>

// State node accepts drops
<div
  onDrop={(e) => {
    const itemId = e.dataTransfer.getData('itemId');
    const type = e.dataTransfer.getData('type');
    if (type === 'item') {
      addAction({ type: 'GiveItem', params: [itemId, 1] });
    }
  }}
  onDragOver={(e) => e.preventDefault()}
>
  {/* state content */}
</div>
```

### Medium Priority

#### 3. Quest Testing/Simulation
- Step through quest states interactively
- Test rule conditions with mock character data
- Visualize state transitions in real-time

#### 4. Advanced Visual Features
- Minimap for large quest diagrams
- Zoom to fit/zoom to selection
- Node grouping/collapsing for complex quests
- Comments/annotations on diagram

#### 5. Search and Navigation
- Full-text search across all quest files
- Find references (where is this NPC/item used?)
- Go to definition (from item ID to item editor)

#### 6. Undo/Redo System
- Command pattern for all edit operations
- Visual undo history browser
- Per-editor undo stacks

#### 7. Multi-file Editing
- Tabbed interface for multiple quest files
- Compare view for quest variants
- Batch operations across multiple quests

### Low Priority

#### 8. AI-Assisted Quest Generation
- Natural language quest descriptions → Generated quest states
- Suggest rule conditions based on actions
- Dialogue generation for NPCs

#### 9. Collaborative Editing
- Real-time collaboration over network
- Change tracking and attribution
- Conflict resolution

#### 10. Plugin System
- Custom action/rule types
- External tool integrations
- Scripted data transformations

## Data Validation

### Current Validation
- Quest syntax validation on save
- Type checking for action/rule parameters
- State reference validation (goto targets must exist)

### Future Validation
- Cross-file reference checking (item/NPC IDs exist)
- Quest flow analysis (detect unreachable states, infinite loops)
- Required field validation with helpful error messages
- Duplicate detection (similar quests, repeated dialogue)

## Performance Considerations

### Current Optimizations
- React.memo for expensive components
- useMemo for computed values (quest node layout)
- Lazy loading of GFX graphics
- Efficient binary file parsing

### Future Optimizations
- Virtual scrolling for large lists (1000+ items)
- Web Worker for file parsing
- Incremental diagram layout updates
- Asset caching strategy

## Testing Strategy

### Current Testing
- Manual testing of all major features
- Test data in `/data` directory

### Future Testing
- Unit tests for parsers (Jest)
- Component tests for editors (React Testing Library)
- Integration tests for file I/O
- E2E tests for common workflows (Playwright)

## Documentation

### Existing Documentation
- [README.md](README.md) - Project overview and setup
- [QUICKSTART.md](QUICKSTART.md) - Getting started guide
- [ANIMATION_SYSTEM.md](ANIMATION_SYSTEM.md) - Character animation details
- [GFX_FILE_REFERENCE.md](GFX_FILE_REFERENCE.md) - Graphics file format

### Future Documentation
- API reference for all parsers
- Component library documentation (Storybook)
- Video tutorials for common tasks
- Best practices guide for quest design

## Build and Deployment

### Development
```bash
npm install
npm run dev      # Start dev server with hot reload
```

### Production Build
```bash
npm run build    # Build for all platforms
npm run build:win   # Windows only
npm run build:mac   # macOS only
npm run build:linux # Linux only
```

### GitHub Actions CI/CD
- Triggers on git tags (v*.*.*)
- Builds for Windows, macOS, and Linux in parallel
- Extracts version from tag and updates package.json
- Creates GitHub release with artifacts
- Uploads installers (.exe, .dmg, .AppImage)

### Release Process
```bash
# Update version and create tag
git tag v1.2.0
git push origin v1.2.0

# GitHub Actions automatically:
# 1. Builds for all platforms
# 2. Creates release
# 3. Uploads installers
```

## Known Issues and Limitations

### Current Limitations
1. Monaco editor links require Ctrl/Cmd+Click (not just click)
2. Large quest diagrams (50+ states) may have layout performance issues
3. No validation that referenced items/NPCs actually exist
4. Binary file editing is destructive (no undo after save)

### Planned Fixes
- Improve Monaco link activation (make clickable without modifier)
- Optimize dagre layout for large graphs (incremental layout)
- Add cross-reference validation system
- Implement undo system for all editors

## Contributing Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for consistency
- Prettier for code formatting
- Meaningful variable names, avoid abbreviations

### Component Patterns
- Functional components with hooks (no class components)
- Props interfaces with JSDoc comments
- Consistent naming: `useXxx` for hooks, `XxxEditor` for editors
- Separation of concerns: components, hooks, services

### Commit Messages
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Examples:
  - `feat(quests): add state node editor panel`
  - `fix(parser): handle missing quest states`
  - `docs(readme): update installation instructions`

## Security Considerations

- Content Security Policy (CSP) configured in Electron
- Monaco Editor CDN whitelisted (cdn.jsdelivr.net)
- No eval() or unsafe code execution
- Sandboxed renderer process
- Context isolation enabled

## Accessibility

### Current State
- Keyboard navigation for lists
- Focus management in dialogs
- Color contrast meets WCAG AA

### Future Improvements
- Screen reader support
- ARIA labels for complex components
- Keyboard shortcuts for all operations
- High contrast theme option

## Localization

### Current State
- English only
- No i18n framework

### Future Plans
- i18next integration
- Extractable translation keys
- RTL layout support
- Multiple language packs

---

## Quick Reference: LLM Context

When working on this project, LLMs should be aware of:

### File Naming Conventions
- Components: PascalCase (e.g., `QuestEditor.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useProject.ts`)
- Utilities: camelCase (e.g., `fileIO.ts`)
- Types: PascalCase for interfaces (e.g., `QuestData`)

### Common Patterns
- Use `useProject()` hook to access/update project data
- Use `GenericList` component for filterable lists
- Monaco editor instance stored in `editorRef.current`
- React Flow nodes/edges use `useNodesState` and `useEdgesState`

### Important Considerations
- EQF format has opening brace on separate line: `State Name\n{\n...`
- Quest actions/rules have 80+ and 60+ types respectively
- All binary files use custom Endless Online formats
- Electron IPC required for file system operations

### Navigation Flow
1. Landing screen (project selection)
2. Editor page with sidebar navigation
3. Individual editors (items, NPCs, quests, etc.)
4. Status bar shows current file/state

### State Management
- Project state: `useProject` hook
- Editor state: Local component state or dedicated hooks
- File data: Loaded on-demand, cached in memory
- Unsaved changes: Tracked per-editor with save/revert options

---

**Version**: 1.0.0 (as of January 2026)
**Last Updated**: January 19, 2026
