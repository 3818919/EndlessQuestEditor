import React from 'react';
import CollapsibleSection from '../CollapsibleSection';

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
        <CollapsibleSection title="Basic Information" defaultExpanded={true}>
          <div className="form-group">
            <label>Class Name</label>
            <input
              type="text"
              value={classData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Warrior, Mage, Archer"
              className="form-input"
            />
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
                className="form-input"
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
                className="form-input"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Base Stats */}
        <CollapsibleSection title="Starting Stats" defaultExpanded={true}>
          <div className="form-help" style={{ marginBottom: '12px' }}>
            Initial stat values for new characters of this class
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>STR (Strength)</label>
              <input
                type="number"
                value={classData.str}
                onChange={(e) => handleNumberInputChange('str', e.target.value)}
                min="0"
                max="64008"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>INT (Intelligence)</label>
              <input
                type="number"
                value={classData.int}
                onChange={(e) => handleNumberInputChange('int', e.target.value)}
                min="0"
                max="64008"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>WIS (Wisdom)</label>
              <input
                type="number"
                value={classData.wis}
                onChange={(e) => handleNumberInputChange('wis', e.target.value)}
                min="0"
                max="64008"
                className="form-input"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>AGI (Agility)</label>
              <input
                type="number"
                value={classData.agi}
                onChange={(e) => handleNumberInputChange('agi', e.target.value)}
                min="0"
                max="64008"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>CON (Constitution)</label>
              <input
                type="number"
                value={classData.con}
                onChange={(e) => handleNumberInputChange('con', e.target.value)}
                min="0"
                max="64008"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>CHA (Charisma)</label>
              <input
                type="number"
                value={classData.cha}
                onChange={(e) => handleNumberInputChange('cha', e.target.value)}
                min="0"
                max="64008"
                className="form-input"
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
