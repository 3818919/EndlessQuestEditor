import React, { useState, useEffect } from 'react';
import { QuestState, QuestAction, QuestRule } from '../../../eqf-parser';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { loadConfig, ConfigData, ParamInfo } from '../../services/configService';
import { loadStateTemplates, StateTemplateData } from '../../services/stateTemplateService';

interface StateNodeEditorProps {
  state: QuestState;
  stateIndex: number;
  originalStateName: string;
  allStates: QuestState[];
  onClose: () => void;
  onSave: (updates: Partial<QuestState>, nameChanged: boolean, oldName: string) => void;
  onCreateState?: (stateName: string) => void;
}

// Default action/rule types if config not loaded (matches config/actions.ini and config/rules.ini)
const DEFAULT_ACTION_TYPES = [
  'AddNpcText', 'AddNpcInput', 'AddNpcChat', 'AddNpcPM', 'Roll', 'GiveItem', 'RemoveItem',
  'GiveExp', 'ShowHint', 'PlaySound', 'SetCoord', 'Quake', 'QuakeWorld', 'SetClass',
  'SetRace', 'SetHome', 'SetTitle', 'GiveKarma', 'RemoveKarma', 'StartQuest',
  'SetQuestState', 'ResetQuest', 'GiveStat', 'RemoveStat', 'ResetDaily', 'Reset', 'End'
];

const DEFAULT_RULE_TYPES = [
  'TalkedToNpc', 'InputNpc', 'Rolled', 'KilledNpcs', 'KilledPlayers', 'GotItems',
  'LostItems', 'UsedItem', 'EnterCoord', 'LeaveCoord', 'EnterMap', 'LeaveMap',
  'IsClass', 'IsRace', 'IsGender', 'CitizenOf', 'GotSpell', 'LostSpell', 'UsedSpell',
  'IsWearing', 'StatGreater', 'StatLess', 'StatIs', 'StatNot', 'StatBetween',
  'StatRpn', 'DoneDaily', 'Always'
];

// Parameter configuration for actions (fallback - matches config/actions.ini)
const DEFAULT_ACTION_PARAMS: Record<string, string[]> = {
  AddNpcText: ['npcQuestId', 'message'],
  AddNpcInput: ['npcQuestId', 'inputId', 'message'],
  AddNpcChat: ['npcQuestId', 'message'],
  AddNpcPM: ['npcQuestId', 'message'],
  Roll: ['amount'],
  GiveItem: ['itemId', 'amount'],
  RemoveItem: ['itemId', 'amount'],
  GiveExp: ['amount'],
  ShowHint: ['message'],
  PlaySound: ['soundId'],
  SetCoord: ['mapId', 'x', 'y'],
  Quake: ['magnitude'],
  QuakeWorld: ['magnitude'],
  SetClass: ['classId'],
  SetRace: ['raceId'],
  SetHome: ['home'],
  SetTitle: ['title'],
  GiveKarma: ['amount'],
  RemoveKarma: ['amount'],
  StartQuest: ['questId', 'quest state'],
  SetQuestState: ['questId', 'quest state'],
  ResetQuest: ['questId'],
  GiveStat: ['stat', 'amount'],
  RemoveStat: ['stat', 'amount'],
  ResetDaily: [],
  Reset: [],
  End: []
};

// Parameter configuration for rules (fallback - matches config/rules.ini)
const DEFAULT_RULE_PARAMS: Record<string, string[]> = {
  TalkedToNpc: ['npcQuestId'],
  InputNpc: ['inputId'],
  Rolled: ['roll'],
  KilledNpcs: ['npcId', 'amount'],
  KilledPlayers: ['amount'],
  GotItems: ['itemId', 'amount'],
  LostItems: ['itemId', 'amount'],
  UsedItem: ['itemId', 'amount'],
  EnterCoord: ['mapId', 'x', 'y'],
  LeaveCoord: ['mapId', 'x', 'y'],
  EnterMap: ['mapId'],
  LeaveMap: ['mapId'],
  IsClass: ['classId'],
  IsRace: ['raceId'],
  IsGender: ['genderId'],
  CitizenOf: ['homeName'],
  GotSpell: ['spellId'],
  LostSpell: ['spellId'],
  UsedSpell: ['spellId', 'amount'],
  IsWearing: ['itemId'],
  StatGreater: ['statName', 'value'],
  StatLess: ['statName', 'value'],
  StatIs: ['statName', 'value'],
  StatNot: ['statName', 'value'],
  StatBetween: ['statName', 'low_value', 'high_value'],
  StatRpn: ['Reverse Polish Notion Formula'],
  DoneDaily: ['value'],
  Always: []
};

// Check if signature includes a semicolon at the end (for actions)
function signatureHasSemicolon(signature: string): boolean {
  // Remove backticks and check for semicolon
  const clean = signature.replace(/`/g, '').trim();
  return clean.endsWith(';');
}

export default function StateNodeEditor({ state, stateIndex, originalStateName, allStates, onClose, onSave, onCreateState }: StateNodeEditorProps) {
  const [editedState, setEditedState] = useState<QuestState>({
    name: state.name,
    description: state.description,
    actions: [...state.actions],
    rules: [...state.rules]
  });
  
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [actionTypes, setActionTypes] = useState<string[]>(DEFAULT_ACTION_TYPES);
  const [ruleTypes, setRuleTypes] = useState<string[]>(DEFAULT_RULE_TYPES);
  const [actionParams, setActionParams] = useState<Record<string, ParamInfo[]>>({});
  const [ruleParams, setRuleParams] = useState<Record<string, ParamInfo[]>>({});
  const [actionHasSemicolon, setActionHasSemicolon] = useState<Record<string, boolean>>({});
  const [stateTemplates, setStateTemplates] = useState<Record<string, StateTemplateData>>({});

  // Load config and state templates on mount
  useEffect(() => {
    // Load config
    loadConfig().then(loadedConfig => {
      setConfig(loadedConfig);
      
      // Extract action types and params from config
      if (Object.keys(loadedConfig.actions).length > 0) {
        const types = Object.keys(loadedConfig.actions);
        setActionTypes(types);
        
        // Build params from config (already parsed)
        const params: Record<string, ParamInfo[]> = {};
        const semicolons: Record<string, boolean> = {};
        for (const [name, data] of Object.entries(loadedConfig.actions)) {
          params[name] = data.params;
          semicolons[name] = signatureHasSemicolon(data.rawSignature);
        }
        setActionParams(params);
        setActionHasSemicolon(semicolons);
      }
      
      // Extract rule types and params from config
      if (Object.keys(loadedConfig.rules).length > 0) {
        const types = Object.keys(loadedConfig.rules);
        setRuleTypes(types);
        
        // Build params from config (already parsed)
        const params: Record<string, ParamInfo[]> = {};
        for (const [name, data] of Object.entries(loadedConfig.rules)) {
          params[name] = data.params;
        }
        setRuleParams(params);
      }
    });
    
    // Load state templates
    loadStateTemplates().then(templates => {
      setStateTemplates(templates);
    });
  }, []);

  // Helper function to generate rawText for an action
  const generateActionRawText = (action: QuestAction): string => {
    // Get param info to determine which params should be strings
    const paramInfos = actionParams[action.type] || [];
    
    const paramsStr = action.params.map((p, idx) => {
      const paramInfo = paramInfos[idx];
      // If param info says it's a string type, wrap in quotes
      // Otherwise, if it's already a string but should be an integer, don't wrap
      if (paramInfo?.type === 'string') {
        return `"${p}"`;
      } else {
        // It's an integer type - return as-is (no quotes)
        return p;
      }
    }).join(', ');
    
    // Check if this action type should have a semicolon
    const hasSemicolon = actionHasSemicolon[action.type] ?? true; // Default to true
    return `${action.type}(${paramsStr})${hasSemicolon ? ';' : ''}`;
  };

  // Helper function to generate rawText for a rule
  const generateRuleRawText = (rule: QuestRule): string => {
    // Get param info to determine which params should be strings
    const paramInfos = ruleParams[rule.type] || [];
    
    const paramsStr = rule.params.map((p, idx) => {
      const paramInfo = paramInfos[idx];
      // If param info says it's a string type, wrap in quotes
      if (paramInfo?.type === 'string') {
        return `"${p}"`;
      } else {
        // It's an integer type - return as-is (no quotes)
        return p;
      }
    }).join(', ');
    
    return `${rule.type}(${paramsStr}) goto ${rule.gotoState}`;
  };

  const handleSave = () => {
    const nameChanged = editedState.name !== originalStateName;
    onSave(editedState, nameChanged, originalStateName);
    onClose();
  };

  const handleAddAction = () => {
    const defaultType = actionTypes[0] || 'AddNpcText';
    const paramConfig = actionParams[defaultType] || [];
    const newAction: QuestAction = { 
      type: defaultType, 
      params: paramConfig.map(p => p.type === 'string' ? '' : 0), 
      rawText: '' 
    };
    newAction.rawText = generateActionRawText(newAction);
    setEditedState({
      ...editedState,
      actions: [
        ...editedState.actions,
        newAction
      ]
    });
  };

  const handleRemoveAction = (index: number) => {
    setEditedState({
      ...editedState,
      actions: editedState.actions.filter((_, i) => i !== index)
    });
  };

  const handleUpdateAction = (index: number, field: 'type' | 'params', value: any) => {
    const newActions = [...editedState.actions];
    if (field === 'type') {
      const paramConfig = actionParams[value] || [];
      newActions[index] = { type: value, params: paramConfig.map(p => p.type === 'string' ? '' : 0), rawText: '' };
      newActions[index].rawText = generateActionRawText(newActions[index]);
    } else {
      newActions[index] = { ...newActions[index], params: value };
      newActions[index].rawText = generateActionRawText(newActions[index]);
    }
    setEditedState({ ...editedState, actions: newActions });
  };

  const handleAddRule = () => {
    const defaultType = ruleTypes[0] || 'Always';
    const paramConfig = ruleParams[defaultType] || [];
    const newRule: QuestRule = { 
      type: defaultType, 
      params: paramConfig.map(p => p.type === 'string' ? '' : 0), 
      gotoState: '', 
      rawText: '' 
    };
    newRule.rawText = generateRuleRawText(newRule);
    setEditedState({
      ...editedState,
      rules: [
        ...editedState.rules,
        newRule
      ]
    });
  };

  const handleRemoveRule = (index: number) => {
    setEditedState({
      ...editedState,
      rules: editedState.rules.filter((_, i) => i !== index)
    });
  };

  const handleUpdateRule = (index: number, field: 'type' | 'params' | 'gotoState', value: any) => {
    const newRules = [...editedState.rules];
    if (field === 'type') {
      const paramConfig = ruleParams[value] || [];
      newRules[index] = { type: value, params: paramConfig.map(p => p.type === 'string' ? '' : 0), gotoState: newRules[index].gotoState, rawText: '' };
      newRules[index].rawText = generateRuleRawText(newRules[index]);
    } else if (field === 'gotoState') {
      newRules[index] = { ...newRules[index], gotoState: value };
      newRules[index].rawText = generateRuleRawText(newRules[index]);
    } else {
      newRules[index] = { ...newRules[index], params: value };
      newRules[index].rawText = generateRuleRawText(newRules[index]);
    }
    setEditedState({ ...editedState, rules: newRules });
  };

  const handleParamChange = (actionOrRule: 'action' | 'rule', index: number, paramIndex: number, value: string) => {
    if (actionOrRule === 'action') {
      const newActions = [...editedState.actions];
      const newParams = [...newActions[index].params];
      const paramInfos = actionParams[newActions[index].type] || [];
      const paramInfo = paramInfos[paramIndex];
      
      // Parse based on expected type from config
      let parsedValue: string | number;
      if (paramInfo?.type === 'string') {
        parsedValue = value; // Keep as string
      } else {
        // Integer type - parse as number, default to 0 if invalid
        parsedValue = !isNaN(Number(value)) && value.trim() !== '' ? Number(value) : 0;
      }
      
      newParams[paramIndex] = parsedValue;
      newActions[index] = { ...newActions[index], params: newParams };
      newActions[index].rawText = generateActionRawText(newActions[index]);
      setEditedState({ ...editedState, actions: newActions });
    } else {
      const newRules = [...editedState.rules];
      const newParams = [...newRules[index].params];
      const paramInfos = ruleParams[newRules[index].type] || [];
      const paramInfo = paramInfos[paramIndex];
      
      // Parse based on expected type from config
      let parsedValue: string | number;
      if (paramInfo?.type === 'string') {
        parsedValue = value; // Keep as string
      } else {
        // Integer type - parse as number, default to 0 if invalid
        parsedValue = !isNaN(Number(value)) && value.trim() !== '' ? Number(value) : 0;
      }
      
      newParams[paramIndex] = parsedValue;
      newRules[index] = { ...newRules[index], params: newParams };
      newRules[index].rawText = generateRuleRawText(newRules[index]);
      setEditedState({ ...editedState, rules: newRules });
    }
  };

  // Get description for an action or rule from config
  const getDescription = (type: 'action' | 'rule', name: string): string | null => {
    if (!config) return null;
    if (type === 'action') {
      return config.actions[name]?.description || null;
    } else {
      return config.rules[name]?.description || null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '1px solid var(--border-primary)'
        }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Edit State: {state.name}</h2>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
              State #{stateIndex + 1}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* State Info */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 500,
            color: 'var(--text-primary)'
          }}>
            State Name
          </label>
          <input
            type="text"
            value={editedState.name}
            onChange={(e) => setEditedState({ ...editedState, name: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 500,
            color: 'var(--text-primary)'
          }}>
            Description
          </label>
          <textarea
            value={editedState.description}
            onChange={(e) => setEditedState({ ...editedState, description: e.target.value })}
            rows={2}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        {/* State Templates Section */}
        {Object.keys(stateTemplates).length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 500,
              color: 'var(--text-primary)'
            }}>
              State Templates
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                defaultValue=""
                onChange={(e) => {
                  const templateName = e.target.value;
                  if (templateName && stateTemplates[templateName]) {
                    const template = stateTemplates[templateName];
                    setEditedState({
                      ...editedState,
                      description: template.description || editedState.description,
                      actions: [...template.actions],
                      rules: [...template.rules]
                    });
                    // Reset the select
                    e.target.value = '';
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Apply State Template --</option>
                {Object.keys(stateTemplates).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <span style={{ 
                fontSize: '11px', 
                color: 'var(--text-tertiary)',
                fontStyle: 'italic'
              }}>
                Replaces current actions & rules
              </span>
            </div>
          </div>
        )}

        {/* Actions Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>
              Actions ({editedState.actions.length})
            </h3>
            <button
              onClick={handleAddAction}
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--accent-success)',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <AddIcon fontSize="small" />
              Add Action
            </button>
          </div>

          {editedState.actions.map((action, index) => (
            <div 
              key={index}
              style={{
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '4px',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    Action Type
                  </label>
                  <select
                    value={action.type}
                    onChange={(e) => handleUpdateAction(index, 'type', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  >
                    {actionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {getDescription('action', action.type) && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--text-tertiary)', 
                      marginTop: '4px',
                      fontStyle: 'italic'
                    }}>
                      {getDescription('action', action.type)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveAction(index)}
                  style={{
                    marginTop: '18px',
                    padding: '6px',
                    backgroundColor: 'var(--accent-danger)',
                    color: 'var(--text-primary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Remove action"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>

              {action.params.length > 0 && (
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px'
                  }}>
                    Parameters
                  </label>
                  {action.params.map((param, paramIndex) => {
                    const paramInfos = actionParams[action.type] || [];
                    const paramInfo = paramInfos[paramIndex];
                    const placeholder = paramInfo?.name || `Parameter ${paramIndex + 1}`;
                    const isString = paramInfo?.type === 'string';
                    return (
                      <div key={paramIndex} style={{ marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type={isString ? 'text' : 'number'}
                            value={param}
                            onChange={(e) => handleParamChange('action', index, paramIndex, e.target.value)}
                            placeholder={placeholder}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              backgroundColor: 'var(--bg-input)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-primary)',
                              borderRadius: '3px',
                              fontSize: '12px'
                            }}
                          />
                          <span style={{ 
                            fontSize: '10px', 
                            color: 'var(--text-tertiary)',
                            minWidth: '40px'
                          }}>
                            {isString ? 'text' : 'int'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          ))}

          {editedState.actions.length === 0 && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              No actions defined
            </div>
          )}
        </div>

        {/* Rules Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>
              Rules ({editedState.rules.length})
            </h3>
            <button
              onClick={handleAddRule}
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--accent-warning)',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <AddIcon fontSize="small" />
              Add Rule
            </button>
          </div>

          {editedState.rules.map((rule, index) => (
            <div 
              key={index}
              style={{
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '4px',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    Rule Type
                  </label>
                  <select
                    value={rule.type}
                    onChange={(e) => handleUpdateRule(index, 'type', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  >
                    {ruleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {getDescription('rule', rule.type) && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--text-tertiary)', 
                      marginTop: '4px',
                      fontStyle: 'italic'
                    }}>
                      {getDescription('rule', rule.type)}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    Goto State
                  </label>
                  <select
                    value={rule.gotoState}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '__NEW_STATE__') {
                        // Generate a unique new state name
                        let counter = 1;
                        let newStateName = `NewState${counter}`;
                        while (allStates.some(s => s.name === newStateName) || editedState.name === newStateName) {
                          counter++;
                          newStateName = `NewState${counter}`;
                        }
                        // Create the new state if callback is provided
                        if (onCreateState) {
                          onCreateState(newStateName);
                        }
                        // Set the rule to go to this new state
                        handleUpdateRule(index, 'gotoState', newStateName);
                      } else {
                        handleUpdateRule(index, 'gotoState', value);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '6px',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">-- Select State --</option>
                    {allStates.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                    <option value="__NEW_STATE__" style={{ fontStyle: 'italic' }}>+ New State...</option>
                  </select>
                </div>
                <button
                  onClick={() => handleRemoveRule(index)}
                  style={{
                    marginTop: '18px',
                    padding: '6px',
                    backgroundColor: 'var(--accent-danger)',
                    color: 'var(--text-primary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Remove rule"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>

              {rule.params.length > 0 && (
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px'
                  }}>
                    Parameters
                  </label>
                  {rule.params.map((param, paramIndex) => {
                    const paramInfos = ruleParams[rule.type] || [];
                    const paramInfo = paramInfos[paramIndex];
                    const placeholder = paramInfo?.name || `Parameter ${paramIndex + 1}`;
                    const isString = paramInfo?.type === 'string';
                    return (
                      <div key={paramIndex} style={{ marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type={isString ? 'text' : 'number'}
                            value={param}
                            onChange={(e) => handleParamChange('rule', index, paramIndex, e.target.value)}
                            placeholder={placeholder}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              backgroundColor: 'var(--bg-input)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-primary)',
                              borderRadius: '3px',
                              fontSize: '12px'
                            }}
                          />
                          <span style={{ 
                            fontSize: '10px', 
                            color: 'var(--text-tertiary)',
                            minWidth: '40px'
                          }}>
                            {isString ? 'text' : 'int'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          ))}

          {editedState.rules.length === 0 && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              No rules defined
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'flex-end',
          paddingTop: '15px',
          borderTop: '1px solid var(--border-primary)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
