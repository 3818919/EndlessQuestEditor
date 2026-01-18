import React from 'react';
import { InnRecord } from 'eolib';
import CollapsibleSection from '../CollapsibleSection';

interface InnEditorProps {
  inn: InnRecord;
  onUpdateInn: (index: number, updates: Partial<InnRecord>) => void;
  onDuplicateInn: (index: number) => void;
  onDeleteInn: (index: number) => void;
  innIndex: number;
  npcs: { [key: number]: any };
}

export default function InnEditor({ 
  inn, 
  onUpdateInn,
  onDuplicateInn,
  onDeleteInn,
  innIndex,
  npcs
}: InnEditorProps) {
  const handleInputChange = (field: string, value: any) => {
    onUpdateInn(innIndex, { [field]: value });
  };

  const handleQuestionChange = (questionIndex: number, field: 'question' | 'answer', value: string) => {
    const updatedQuestions = [...inn.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    onUpdateInn(innIndex, { questions: updatedQuestions });
  };

  if (!inn) {
    return (
      <div className="editor-empty">
        <p>Select an inn to edit</p>
      </div>
    );
  }

  // Get sorted NPC list for dropdown
  const npcList = Object.values(npcs).sort((a, b) => a.id - b.id);

  return (
    <div className="inn-editor">
      <div className="editor-header">
        <h2>Inn: {inn.name || `#${innIndex}`}</h2>
        <div className="editor-header-actions">
          <button 
            onClick={() => onDuplicateInn(innIndex)} 
            className="btn btn-secondary"
            title="Duplicate this inn"
          >
            Duplicate
          </button>
          <button 
            onClick={() => onDeleteInn(innIndex)} 
            className="btn btn-danger"
            title="Delete this inn"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="editor-content">
        {/* General Settings Card */}
        <CollapsibleSection title="General" defaultExpanded={true}>
          <div className="form-group">
            <label>Inn Name</label>
            <input
              type="text"
              value={inn.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="form-input"
              placeholder="e.g., Aeven, Wanderer, Tutorial Island"
            />
          </div>

          <div className="form-group">
            <label>Innkeeper NPC</label>
            <select
              value={inn.behaviorId || 0}
              onChange={(e) => handleInputChange('behaviorId', parseInt(e.target.value))}
              className="form-input"
            >
              <option value="0">None (Default Spawn Point)</option>
              {npcList.map(npc => (
                <option key={npc.id} value={npc.id}>
                  #{npc.id} - {npc.name}
                </option>
              ))}
            </select>
            <div className="form-help">
              Select the NPC that players talk to for registering at this inn
            </div>
          </div>
        </CollapsibleSection>

        {/* Respawn Location Card */}
        <CollapsibleSection title="Respawn Location" defaultExpanded={true}>
          <div className="form-help" style={{ marginBottom: '12px' }}>
            Where players respawn when they die
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Map ID</label>
              <input
                type="number"
                value={inn.spawnMap || 0}
                onChange={(e) => handleInputChange('spawnMap', parseInt(e.target.value) || 0)}
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>X Coordinate</label>
              <input
                type="number"
                value={inn.spawnX || 0}
                onChange={(e) => handleInputChange('spawnX', parseInt(e.target.value) || 0)}
                className="form-input"
                min="0"
                max="252"
              />
            </div>

            <div className="form-group">
              <label>Y Coordinate</label>
              <input
                type="number"
                value={inn.spawnY || 0}
                onChange={(e) => handleInputChange('spawnY', parseInt(e.target.value) || 0)}
                className="form-input"
                min="0"
                max="252"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Sleep Location Card */}
        <CollapsibleSection title="Sleep Location" defaultExpanded={true}>
          <div className="form-help" style={{ marginBottom: '12px' }}>
            Where players wake up after sleeping at this inn
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Map ID</label>
              <input
                type="number"
                value={inn.sleepMap || 0}
                onChange={(e) => handleInputChange('sleepMap', parseInt(e.target.value) || 0)}
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>X Coordinate</label>
              <input
                type="number"
                value={inn.sleepX || 0}
                onChange={(e) => handleInputChange('sleepX', parseInt(e.target.value) || 0)}
                className="form-input"
                min="0"
                max="252"
              />
            </div>

            <div className="form-group">
              <label>Y Coordinate</label>
              <input
                type="number"
                value={inn.sleepY || 0}
                onChange={(e) => handleInputChange('sleepY', parseInt(e.target.value) || 0)}
                className="form-input"
                min="0"
                max="252"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Alternate Spawn Card */}
        <CollapsibleSection 
          title="Alternate Spawn (Optional)" 
          defaultExpanded={inn.alternateSpawnEnabled}
        >
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={inn.alternateSpawnEnabled || false}
                onChange={(e) => handleInputChange('alternateSpawnEnabled', e.target.checked)}
              />
              <span>Enable Alternate Spawn Point</span>
            </label>
            <div className="form-help">
              Used for special spawn conditions (e.g., tutorial island for new characters)
            </div>
          </div>

          <div 
            className={`form-section ${!inn.alternateSpawnEnabled ? 'disabled' : ''}`}
            style={{ 
              opacity: inn.alternateSpawnEnabled ? 1 : 0.5,
              pointerEvents: inn.alternateSpawnEnabled ? 'auto' : 'none'
            }}
          >
            <div className="form-row">
              <div className="form-group">
                <label>Map ID</label>
                <input
                  type="number"
                  value={inn.alternateSpawnMap || 0}
                  onChange={(e) => handleInputChange('alternateSpawnMap', parseInt(e.target.value) || 0)}
                  className="form-input"
                  min="0"
                  disabled={!inn.alternateSpawnEnabled}
                />
              </div>

              <div className="form-group">
                <label>X Coordinate</label>
                <input
                  type="number"
                  value={inn.alternateSpawnX || 0}
                  onChange={(e) => handleInputChange('alternateSpawnX', parseInt(e.target.value) || 0)}
                  className="form-input"
                  min="0"
                  max="252"
                  disabled={!inn.alternateSpawnEnabled}
                />
              </div>

              <div className="form-group">
                <label>Y Coordinate</label>
                <input
                  type="number"
                  value={inn.alternateSpawnY || 0}
                  onChange={(e) => handleInputChange('alternateSpawnY', parseInt(e.target.value) || 0)}
                  className="form-input"
                  min="0"
                  max="252"
                  disabled={!inn.alternateSpawnEnabled}
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Registration Questions Card - Only show if NPC is selected */}
        {inn.behaviorId > 0 && (
          <CollapsibleSection title="Registration Questions" defaultExpanded={false}>
            <div className="form-help" style={{ marginBottom: '16px' }}>
              Players must answer these questions correctly to register citizenship at this inn
            </div>

            {inn.questions?.map((q, index) => (
              <div key={index} className="question-group">
                <div className="form-group">
                  <label>Question {index + 1}</label>
                  <input
                    type="text"
                    value={q.question || ''}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    className="form-input"
                    placeholder={`Enter question ${index + 1}`}
                  />
                </div>

                <div className="form-group">
                  <label>Answer {index + 1}</label>
                  <input
                    type="text"
                    value={q.answer || ''}
                    onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                    className="form-input"
                    placeholder={`Enter answer ${index + 1}`}
                  />
                </div>
              </div>
            ))}
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
