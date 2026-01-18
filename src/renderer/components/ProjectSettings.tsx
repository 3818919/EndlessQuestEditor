import React, { useState } from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

interface ProjectSettingsProps {
  projectName: string;
  gfxPath: string | null;
  pubDirectory: string | null;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onClose: () => void;
  onSave: (settings: { projectName: string; gfxPath: string | null; pubDirectory: string | null }) => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  projectName,
  gfxPath,
  pubDirectory,
  theme,
  toggleTheme,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(projectName);
  const [gfx, setGfx] = useState(gfxPath);
  const [nameError, setNameError] = useState('');

  const handleSelectGfxFolder = async () => {
    if (!window.electronAPI) return;
    
    const result = await window.electronAPI.selectFolder();
    if (result.success && result.path) {
      setGfx(result.path);
    }
  };

  const handleSave = () => {
    // Validate project name
    if (!name || name.trim().length === 0) {
      setNameError('Project name cannot be empty');
      return;
    }

    // Check for invalid characters in project name
    if (!/^[a-zA-Z0-9_\- ]+$/.test(name)) {
      setNameError('Project name can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }

    onSave({
      projectName: name.trim(),
      gfxPath: gfx,
      pubDirectory: pubDirectory // Keep existing value, don't change it
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <h2>Project Settings</h2>
        
        <div className="form-group">
          <label>Theme</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={toggleTheme}
              className="button"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                flex: 1,
                justifyContent: 'center'
              }}
            >
              {theme === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
          <div className="form-help" style={{ marginTop: '4px' }}>
            Switch between dark and light themes. This setting applies globally to the entire application.
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError('');
            }}
            className="form-input"
            placeholder="Enter project name"
          />
          {nameError && <div className="form-error" style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>{nameError}</div>}
          <div className="form-help" style={{ marginTop: '4px' }}>
            The name of your project. This will be displayed in the project list.
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>GFX Folder</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={gfx || 'No folder selected'}
              readOnly
              className="form-input"
              style={{ flex: 1, cursor: 'default' }}
            />
            <button
              onClick={handleSelectGfxFolder}
              className="button"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              <FolderIcon style={{ fontSize: '18px' }} />
              Browse
            </button>
          </div>
          <div className="form-help" style={{ marginTop: '4px' }}>
            Path to the folder containing GFX files (gfx001.egf, gfx002.egf, etc.)
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '24px' }}>
          <button onClick={onClose} className="button button-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="button button-primary">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
