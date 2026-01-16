import React, { useState } from 'react';
import ItemList from './components/ItemList';
import ItemEditor from './components/ItemEditor';
import CharacterPreview from './components/CharacterPreview';
import PaperdollSlots from './components/PaperdollSlots';
import AppearanceControls from './components/AppearanceControls';
import LandingScreen from './components/LandingScreen';
import { useEIFData } from './hooks/useEIFData';
import { useGFXCache } from './hooks/useGFXCache';
import { useEquipment } from './hooks/useEquipment';
import { useAppearance } from './hooks/useAppearance';
import FaceIcon from '@mui/icons-material/Face';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

const App: React.FC = () => {
  const [gfxFolder, setGfxFolder] = useState(
    localStorage.getItem('gfxFolder') || ''
  );
  const [activeTab, setActiveTab] = useState('appearance');
  const [rightPanelWidth, setRightPanelWidth] = useState(
    parseInt(localStorage.getItem('rightPanelWidth') || '400')
  );
  const [isResizing, setIsResizing] = useState(false);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [leftPanelMinimized, setLeftPanelMinimized] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const { 
    eifData, 
    currentFile, 
    selectedItemId, 
    setSelectedItemId,
    loadFile,
    loadFileFromPath,
    saveFile,
    addItem,
    deleteItem,
    duplicateItem,
    updateItem,
    setEifData,
    setCurrentFile
  } = useEIFData();

  const { loadGfx, saveDirHandle } = useGFXCache(gfxFolder);
  
  const selectGfxFolder = async () => {
    try {
      if (!isElectron) {
        // Browser: Use File System Access API
        if ('showDirectoryPicker' in window) {
          const dirHandle = await (window as any).showDirectoryPicker();
          
          // Save the handle to IndexedDB for persistence
          await saveDirHandle(dirHandle);
          
          const path = dirHandle.name;
          setGfxFolder(path);
          localStorage.setItem('gfxFolder', path);
          alert(`Selected folder: ${path}\n\nGFX graphics loading is now enabled! The folder will be remembered across sessions.`);
        } else {
          alert('Folder selection requires a modern browser (Chrome 86+, Edge 86+). For full functionality, use the Electron app: npm run dev');
        }
        return;
      }
      
      if (!window.electronAPI) {
        alert('Electron API not available');
        return;
      }
      
      const folder = await window.electronAPI.openDirectory();
      if (folder) {
        setGfxFolder(folder);
        localStorage.setItem('gfxFolder', folder);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled the picker
        return;
      }
      console.error('Error selecting GFX folder:', error);
      alert('Error selecting GFX folder: ' + error.message);
    }
  };
  
  const { 
    equippedItems, 
    equipItem, 
    unequipSlot,
    clearAll 
  } = useEquipment();
  
  const {
    gender,
    setGender,
    hairStyle,
    setHairStyle,
    hairColor,
    setHairColor,
    skinTone,
    setSkinTone,
    presets,
    savePreset,
    loadPreset,
    deletePreset
  } = useAppearance();
  
  // Handle resize
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };
  
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setRightPanelWidth(newWidth);
        localStorage.setItem('rightPanelWidth', newWidth.toString());
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const selectedItem = selectedItemId !== null ? eifData.items[selectedItemId] : null;

  // Wrapper functions for drag and drop
  const handleLoadEIFFromPath = async (path: string) => {
    if (isElectron && window.electronAPI) {
      await loadFileFromPath(path);
    }
  };

  const handleSelectGfxFromPath = (path: string) => {
    setGfxFolder(path);
    localStorage.setItem('gfxFolder', path);
  };

  const handleResetFileSelection = () => {
    // Clear localStorage
    localStorage.removeItem('lastEifFile');
    localStorage.removeItem('gfxFolder');
    
    // Clear state
    setGfxFolder('');
    
    // Clear EIF data (this will also clear currentFile)
    setEifData({ version: 1, items: {} });
    setCurrentFile(null);
    setSelectedItemId(null);
    
    // Force reload to show landing page
    window.location.reload();
  };

  // Check if we need to show the landing screen
  const showLandingScreen = !currentFile || !gfxFolder;

  // If landing screen should be shown, render it
  if (showLandingScreen) {
    return (
      <LandingScreen
        onLoadEIFFile={loadFile}
        onSelectGfxFolder={selectGfxFolder}
        onLoadEIFFromPath={handleLoadEIFFromPath}
        onSelectGfxFromPath={handleSelectGfxFromPath}
        hasEIFFile={!!currentFile}
        hasGfxFolder={!!gfxFolder}
        eifFileName={currentFile}
        gfxFolderPath={gfxFolder}
      />
    );
  }

  return (
    <div className="app">
      <div className="main-content">
        <div className={`left-panel ${leftPanelMinimized ? 'minimized' : ''}`}>
          <ItemList
            items={eifData.items}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            onAddItem={addItem}
            onDeleteItem={deleteItem}
            onDuplicateItem={duplicateItem}
            onLoadFile={loadFile}
            onSaveFile={saveFile}
            currentFile={currentFile}
            onSelectGfxFolder={selectGfxFolder}
            gfxFolder={gfxFolder}
            loadGfx={loadGfx}
            onEquipItem={equipItem}
            showSettingsModal={showSettingsModal}
            setShowSettingsModal={setShowSettingsModal}
            leftPanelMinimized={leftPanelMinimized}
            setLeftPanelMinimized={setLeftPanelMinimized}
            onResetFileSelection={handleResetFileSelection}
            onLoadEIFFromPath={handleLoadEIFFromPath}
            onSelectGfxFromPath={handleSelectGfxFromPath}
          />
        </div>
        
        <div className="center-panel">
          {selectedItem && (
            <ItemEditor
              item={selectedItem}
              onUpdateItem={updateItem}
              onDuplicateItem={duplicateItem}
              loadGfx={loadGfx}
              gfxFolder={gfxFolder}
              onSetGfxFolder={setGfxFolder}
            />
          )}
        </div>
        
        <div 
          className={`right-panel ${isResizing ? 'resizing' : ''} ${isPanelMinimized ? 'minimized' : ''}`}
          style={{ width: isPanelMinimized ? '60px' : `${rightPanelWidth}px` }}
        >
          <div className="resize-handle" onMouseDown={handleMouseDown} />
          
          <div className="right-panel-content">
            <div className="right-panel-top">
              {activeTab === 'appearance' && (
                <AppearanceControls
                  gender={gender}
                  setGender={setGender}
                  hairStyle={hairStyle}
                  setHairStyle={setHairStyle}
                  hairColor={hairColor}
                  setHairColor={setHairColor}
                  skinTone={skinTone}
                  setSkinTone={setSkinTone}
                  gfxFolder={gfxFolder}
                  loadGfx={loadGfx}
                  presets={presets}
                  onSavePreset={savePreset}
                  onLoadPreset={loadPreset}
                  onDeletePreset={deletePreset}
                />
              )}
              
              {activeTab === 'equipment' && (
                <PaperdollSlots
                  equippedItems={equippedItems}
                  onEquipItem={equipItem}
                  onUnequipSlot={unequipSlot}
                  onClearAll={clearAll}
                  items={eifData.items}
                  onAutoGenderSwitch={setGender}
                  loadGfx={loadGfx}
                  gfxFolder={gfxFolder}
                />
              )}
            </div>
            
            {showPreview && (
            <div className="right-panel-bottom">
              <CharacterPreview
                equippedItems={equippedItems}
                gender={gender}
                hairStyle={hairStyle}
                hairColor={hairColor}
                skinTone={skinTone}
                loadGfx={loadGfx}
                gfxFolder={gfxFolder}
                items={eifData.items}
              />
            </div>
            )}
          </div>
          
          <div className="vertical-sidebar">
            <button
              className={`sidebar-button ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => {
                if (activeTab === 'appearance' && !isPanelMinimized) {
                  setIsPanelMinimized(true);
                } else {
                  setActiveTab('appearance');
                  setIsPanelMinimized(false);
                }
              }}
              title="Appearance"
            >
              <FaceIcon />
              <span className="sidebar-label">Appearance</span>
            </button>
            <button
              className={`sidebar-button ${activeTab === 'equipment' ? 'active' : ''}`}
              onClick={() => {
                if (activeTab === 'equipment' && !isPanelMinimized) {
                  setIsPanelMinimized(true);
                } else {
                  setActiveTab('equipment');
                  setIsPanelMinimized(false);
                }
              }}
              title="Equipment"
            >
              <CheckroomIcon />
              <span className="sidebar-label">Equipment</span>
            </button>
            <div className="sidebar-spacer"></div>
            <button
              className={`sidebar-button ${showPreview ? 'active' : ''}`}
              onClick={() => setShowPreview(!showPreview)}
              title="Toggle Preview"
            >
              <VisibilityIcon />
              <span className="sidebar-label">Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
