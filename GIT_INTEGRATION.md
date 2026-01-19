# Git Integration - Phase 1 Implementation

## Overview
Added version control capabilities to OakTree with a dedicated "Version Control" tab alongside the existing "Editor" tab.

## Features Implemented

### 1. Git Service (`src/renderer/services/gitService.ts`)
A comprehensive Git wrapper service with the following operations:
- **`initRepo()`** - Initialize a new Git repository
- **`isGitRepo()`** - Check if the project has Git initialized
- **`getStatus()`** - Get all modified/staged/untracked files
- **`getDiff()`** - View file differences (staged or unstaged)
- **`stageFile()`** - Stage individual files for commit
- **`unstageFile()`** - Unstage files from staging area
- **`stageAll()`** - Stage all changes at once
- **`commit()`** - Commit staged changes with a message
- **`getLog()`** - View commit history
- **`getCurrentBranch()`** - Get the active branch name

### 2. Git UI (`src/renderer/pages/GitPage.tsx`)
A complete version control interface with:
- **Two-tab layout**: "Changes" and "History"
- **Changes Tab**:
  - File list showing modified/staged files
  - Visual indicators for file status (Modified, Added, Deleted)
  - Stage/Unstage buttons for each file
  - "Stage All Changes" button
  - Diff viewer showing line-by-line changes
  - Commit message input with validation
  - Real-time updates after operations
- **History Tab**:
  - Commit list with hash, author, date, and message
  - Chronological ordering (newest first)
- **Auto-refresh**: Updates status after stage/unstage/commit operations
- **Initialize Git UI**: For projects without Git, shows a simple button to initialize

### 3. Main Tab System (`src/renderer/App.tsx`)
- Added top-level tab switcher between "Editor" and "Version Control"
- Clean tab interface with highlighting for active tab
- Both tabs share the same project context

### 4. IPC Layer
Added shell command execution support:
- **`main.ts`**: Added `shell:runCommand` IPC handler
- **`preload.ts`**: Exposed `runCommand` to renderer process
- **`global.d.ts`**: Added TypeScript types for `runCommand`
- Uses Node.js `child_process.exec` with 10MB buffer for large diffs

### 5. Styling (`src/renderer/styles.css`)
Complete CSS theme for Git UI:
- Dark/light theme support
- Status badges (modified, added, deleted)
- File list with hover effects
- Diff viewer with syntax highlighting for +/- lines
- Commit form styling
- Commit history list
- Error message styling

## Usage

### Getting Started
1. Open a project in OakTree
2. Click the "Version Control" tab in the top navigation
3. If Git isn't initialized, click "Initialize Git Repository"

### Working with Changes
1. Edit files in the Editor tab
2. Switch to Version Control tab to see changes
3. Click on a file to view its diff
4. Click "Stage" to stage individual files or "Stage All Changes"
5. Enter a commit message
6. Click "Commit Changes"

### Viewing History
1. Click the "History" tab
2. View all commits with details
3. Commits show: hash, author, date, and message

## Technical Details

### Git Command Examples
```bash
# Status (porcelain format for parsing)
git status --porcelain

# Diff
git diff <file>           # Unstaged changes
git diff --cached <file>  # Staged changes

# Stage/Unstage
git add <file>
git add -A               # Stage all
git reset HEAD <file>

# Commit
git commit -m "message"

# History
git log --oneline -n 20

# Branch
git rev-parse --abbrev-ref HEAD
```

### File Status Indicators
- `M` - Modified file
- `A` - Added (new) file
- `D` - Deleted file
- `??` - Untracked file

### Diff Format
- Lines starting with `+` - Added lines (green)
- Lines starting with `-` - Removed lines (red)
- Lines starting with `@@` - Chunk headers

## Future Enhancements (Phase 2)
- Branch management (create, switch, delete)
- Remote operations (push, pull, fetch)
- Merge conflict resolution
- Stash support
- Visual diff improvements
- File history viewer
- Blame annotations
- .gitignore editor

## Architecture

```
┌─────────────────────────────────────────┐
│           App.tsx                        │
│  ┌────────────┬─────────────────────┐  │
│  │  Editor    │  Version Control    │  │
│  └────────────┴─────────────────────┘  │
└─────────────────────────────────────────┘
              │
              ├─── EditorPage.tsx
              │
              └─── GitPage.tsx
                      │
                      └─── GitService.ts
                              │
                              └─── window.electronAPI.runCommand
                                      │
                                      └─── main.ts (IPC handler)
                                              │
                                              └─── child_process.exec
```

## Testing Checklist
- [x] Initialize Git repository
- [x] View file status
- [x] Stage individual files
- [x] Stage all files
- [x] Unstage files
- [x] View file diffs
- [x] Commit changes
- [x] View commit history
- [x] Error handling (e.g., empty commit message)
- [x] Theme support (dark/light)
- [x] Tab switching

## Notes
- Git must be installed on the system
- All Git operations run in the project directory
- Large diffs may take a moment to load
- Currently supports local operations only (no remote yet)
