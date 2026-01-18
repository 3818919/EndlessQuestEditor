import React from 'react';
import { NpcType } from 'eolib';

// Generate NPC type options from the enum
const NPC_TYPES = Object.entries(NpcType)
  .filter(([key]) => isNaN(Number(key))) // Filter out numeric keys
  .map(([label, value]) => ({ value: value as number, label }));

interface Npc {
  id: number;
  name: string;
  graphic: number;
  race: number;
  boss: boolean;
  child: boolean;
  type: number;
  behaviorId: number;
  hp: number;
  tp: number;
  minDamage: number;
  maxDamage: number;
  accuracy: number;
  evade: number;
  armor: number;
  returnDamage: number;
  element: number;
  elementDamage: number;
  elementWeakness: number;
  elementWeaknessDamage: number;
  level: number;
  exp: number;
}

interface NpcEditorProps {
  npc: Npc | null;
  onUpdate: (npcId: number, updates: Partial<Npc>) => void;
  onDuplicateNpc: (id: number) => void;
  onDeleteNpc: (id: number) => void;
}

const NpcEditor: React.FC<NpcEditorProps> = ({ npc, onUpdate, onDuplicateNpc, onDeleteNpc }) => {
  if (!npc) {
    return (
      <div className="editor-empty">
        <p>Select an NPC to edit</p>
      </div>
    );
  }

  const handleInputChange = (field: keyof Npc, value: string | number) => {
    onUpdate(npc.id, { [field]: value });
  };

  return (
    <div className="item-editor">
      <div className="editor-header">
        <h2>NPC #{npc.id}</h2>
        <div className="editor-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => onDuplicateNpc(npc.id)}
            title="Duplicate this NPC"
          >
            Duplicate
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onDeleteNpc(npc.id)}
            title="Delete this NPC"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="form-grid">
          {/* Basic Properties */}
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={npc.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Graphic ID</label>
            <input
              type="number"
              value={npc.graphic || 0}
              onChange={(e) => handleInputChange('graphic', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Race</label>
            <input
              type="number"
              value={npc.race || 0}
              onChange={(e) => handleInputChange('race', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              value={npc.type || 0}
              onChange={(e) => handleInputChange('type', parseInt(e.target.value) || 0)}
              className="form-input"
            >
              {NPC_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Behavior ID</label>
            <input
              type="number"
              value={npc.behaviorId || 0}
              onChange={(e) => handleInputChange('behaviorId', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Level</label>
            <input
              type="number"
              value={npc.level || 0}
              onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          {/* Boss/Child Flags */}
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={npc.boss || false}
                onChange={(e) => handleInputChange('boss', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Boss NPC
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={npc.child || false}
                onChange={(e) => handleInputChange('child', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Child/Minion NPC
            </label>
          </div>

          {/* Stats */}
          <div className="form-group">
            <label>HP</label>
            <input
              type="number"
              value={npc.hp || 0}
              onChange={(e) => handleInputChange('hp', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>TP (Mana)</label>
            <input
              type="number"
              value={npc.tp || 0}
              onChange={(e) => handleInputChange('tp', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Min Damage</label>
            <input
              type="number"
              value={npc.minDamage || 0}
              onChange={(e) => handleInputChange('minDamage', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Max Damage</label>
            <input
              type="number"
              value={npc.maxDamage || 0}
              onChange={(e) => handleInputChange('maxDamage', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Accuracy</label>
            <input
              type="number"
              value={npc.accuracy || 0}
              onChange={(e) => handleInputChange('accuracy', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Evade</label>
            <input
              type="number"
              value={npc.evade || 0}
              onChange={(e) => handleInputChange('evade', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Armor</label>
            <input
              type="number"
              value={npc.armor || 0}
              onChange={(e) => handleInputChange('armor', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Return Damage</label>
            <input
              type="number"
              value={npc.returnDamage || 0}
              onChange={(e) => handleInputChange('returnDamage', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          {/* Elemental Properties */}
          <div className="form-group">
            <label>Element</label>
            <input
              type="number"
              value={npc.element || 0}
              onChange={(e) => handleInputChange('element', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Element Damage</label>
            <input
              type="number"
              value={npc.elementDamage || 0}
              onChange={(e) => handleInputChange('elementDamage', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Element Weakness</label>
            <input
              type="number"
              value={npc.elementWeakness || 0}
              onChange={(e) => handleInputChange('elementWeakness', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Weakness Damage</label>
            <input
              type="number"
              value={npc.elementWeaknessDamage || 0}
              onChange={(e) => handleInputChange('elementWeaknessDamage', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Experience</label>
            <input
              type="number"
              value={npc.exp || 0}
              onChange={(e) => handleInputChange('exp', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NpcEditor;
