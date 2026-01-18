import React from 'react';

interface Class {
  id: number;
  name: string;
  parentType: number;
  statGroup: number;
  str: number;
  int: number;
  wis: number;
  agi: number;
  con: number;
  cha: number;
}

interface ClassEditorProps {
  classData: Class;
  onUpdateClass: (id: number, updates: Partial<Class>) => void;
  onDuplicateClass: (id: number) => void;
  onDeleteClass: (id: number) => void;
}

export default function ClassEditor({ 
  classData, 
  onUpdateClass,
  onDuplicateClass,
  onDeleteClass
}: ClassEditorProps) {
  const handleInputChange = (field: string, value: string | number) => {
    onUpdateClass(classData.id, { [field]: value });
  };

  const handleNumberInputChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    onUpdateClass(classData.id, { [field]: numValue });
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2>Class #{classData.id}</h2>
        <div className="editor-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => onDuplicateClass(classData.id)}
            title="Duplicate this class"
          >
            Duplicate
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onDeleteClass(classData.id)}
            title="Delete this class"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="editor-content">
        {/* Basic Information */}
        <div className="editor-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>ID</label>
              <input
                type="number"
                value={classData.id}
                disabled
                className="read-only"
              />
            </div>
            <div className="form-group flex-2">
              <label>Name</label>
              <input
                type="text"
                value={classData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Class name"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Parent Type</label>
              <input
                type="number"
                value={classData.parentType}
                onChange={(e) => handleNumberInputChange('parentType', e.target.value)}
                min="0"
                max="252"
              />
            </div>
            <div className="form-group">
              <label>Stat Group</label>
              <input
                type="number"
                value={classData.statGroup}
                onChange={(e) => handleNumberInputChange('statGroup', e.target.value)}
                min="0"
                max="252"
              />
            </div>
          </div>
        </div>

        {/* Base Stats */}
        <div className="editor-section">
          <h3>Base Stats</h3>
          <div className="form-row">
            <div className="form-group">
              <label>STR</label>
              <input
                type="number"
                value={classData.str}
                onChange={(e) => handleNumberInputChange('str', e.target.value)}
                min="0"
                max="64008"
              />
            </div>
            <div className="form-group">
              <label>INT</label>
              <input
                type="number"
                value={classData.int}
                onChange={(e) => handleNumberInputChange('int', e.target.value)}
                min="0"
                max="64008"
              />
            </div>
            <div className="form-group">
              <label>WIS</label>
              <input
                type="number"
                value={classData.wis}
                onChange={(e) => handleNumberInputChange('wis', e.target.value)}
                min="0"
                max="64008"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>AGI</label>
              <input
                type="number"
                value={classData.agi}
                onChange={(e) => handleNumberInputChange('agi', e.target.value)}
                min="0"
                max="64008"
              />
            </div>
            <div className="form-group">
              <label>CON</label>
              <input
                type="number"
                value={classData.con}
                onChange={(e) => handleNumberInputChange('con', e.target.value)}
                min="0"
                max="64008"
              />
            </div>
            <div className="form-group">
              <label>CHA</label>
              <input
                type="number"
                value={classData.cha}
                onChange={(e) => handleNumberInputChange('cha', e.target.value)}
                min="0"
                max="64008"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
