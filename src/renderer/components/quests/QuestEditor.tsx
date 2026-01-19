import React, { useState } from 'react';
import { QuestData } from '../../../eqf-parser';
import QuestTextEditor from './QuestTextEditor';
import QuestFlowDiagram from './QuestFlowDiagram';
import { QUEST_TEMPLATES } from '../../utils/questTemplates';

interface QuestEditorProps {
  quest: QuestData | null;
  onSave: (questId: number, updates: Partial<QuestData>) => void;
  onExport: (questId: number) => void;
  onDelete: (questId: number) => void;
}

export default function QuestEditor({ quest, onSave, onExport, onDelete }: QuestEditorProps) {
  const [editorMode, setEditorMode] = useState<'text' | 'visual' | 'split'>('text');
  const [navigateToState, setNavigateToState] = useState<string | null>(null);

  const handleNavigateToState = (stateName: string) => {
    console.log('[QuestEditor] handleNavigateToState called with:', stateName);
    console.log('[QuestEditor] Current editorMode:', editorMode);
    
    // Switch to split mode if in visual-only mode
    if (editorMode === 'visual') {
      console.log('[QuestEditor] Switching from visual to split mode');
      setEditorMode('split');
    }
    // Set the state to navigate to
    console.log('[QuestEditor] Setting navigateToState to:', stateName);
    setNavigateToState(stateName);
    // Clear after a longer delay to allow text editor to process
    setTimeout(() => {
      console.log('[QuestEditor] Clearing navigateToState');
      setNavigateToState(null);
    }, 500);
  };

  const handleLoadTemplate = (templateName: string) => {
    if (!quest || templateName === '') return;
    
    const template = QUEST_TEMPLATES[templateName];
    if (template) {
      // Load template data into current quest
      onSave(quest.id, {
        ...template,
        id: quest.id // Preserve the current quest ID
      });
    }
  };

  if (!quest) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#1e1e1e',
        color: '#888',
        fontSize: '14px'
      }}>
        Select a quest to edit
      </div>
    );
  }

  const handleSave = (updates: Partial<QuestData>) => {
    onSave(quest.id, updates);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: '#1e1e1e'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#252525',
        borderBottom: '1px solid #3a3a3a',
        gap: '12px'
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#e0e0e0'
          }}>
            {quest.questName || `Quest ${quest.id}`}
          </h2>
          <div style={{
            fontSize: '12px',
            color: '#888',
            marginTop: '4px'
          }}>
            Quest ID: {quest.id} | Version: {quest.version} | {quest.states.length} states
          </div>
        </div>

        {/* Template Selector (only in visual/split mode) */}
        {(editorMode === 'visual' || editorMode === 'split') && (
          <select
            onChange={(e) => handleLoadTemplate(e.target.value)}
            value=""
            style={{
              padding: '6px 12px',
              backgroundColor: '#2a2a2a',
              color: 'white',
              border: '1px solid #3a3a3a',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              outline: 'none'
            }}
          >
            <option value="">Load Template...</option>
            {Object.keys(QUEST_TEMPLATES).map(templateName => (
              <option key={templateName} value={templateName}>
                {templateName}
              </option>
            ))}
          </select>
        )}

        {/* Mode Toggle */}
        <div style={{
          display: 'flex',
          gap: '4px',
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
          padding: '2px'
        }}>
          <button
            onClick={() => setEditorMode('text')}
            style={{
              padding: '6px 12px',
              backgroundColor: editorMode === 'text' ? '#0e7490' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'background-color 0.2s'
            }}
          >
            Text
          </button>
          <button
            onClick={() => setEditorMode('split')}
            style={{
              padding: '6px 12px',
              backgroundColor: editorMode === 'split' ? '#0e7490' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'background-color 0.2s'
            }}
          >
            Split
          </button>
          <button
            onClick={() => setEditorMode('visual')}
            style={{
              padding: '6px 12px',
              backgroundColor: editorMode === 'visual' ? '#0e7490' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'background-color 0.2s'
            }}
          >
            Visual
          </button>
        </div>

        <button
          onClick={() => onExport(quest.id)}
          style={{
            padding: '6px 16px',
            backgroundColor: '#0e639c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1177bb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0e639c'}
        >
          Export
        </button>

        <button
          onClick={() => {
            if (confirm(`Delete quest "${quest.questName}" (ID: ${quest.id})?`)) {
              onDelete(quest.id);
            }
          }}
          style={{
            padding: '6px 16px',
            backgroundColor: '#c63838',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d64545'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#c63838'}
        >
          Delete
        </button>
      </div>

      {/* Editor Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {editorMode === 'text' ? (
          <QuestTextEditor quest={quest} onSave={handleSave} navigateToState={navigateToState} />
        ) : editorMode === 'visual' ? (
          <QuestFlowDiagram quest={quest} onQuestChange={handleSave} onNavigateToState={handleNavigateToState} />
        ) : (
          // Split view
          <div style={{ display: 'flex', height: '100%', gap: '1px', backgroundColor: '#3a3a3a' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <QuestTextEditor quest={quest} onSave={handleSave} navigateToState={navigateToState} />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <QuestFlowDiagram quest={quest} onQuestChange={handleSave} onNavigateToState={handleNavigateToState} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
