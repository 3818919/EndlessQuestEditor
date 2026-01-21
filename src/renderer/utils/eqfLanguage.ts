// Monaco Editor Language Definition for EQF (EO Quest Files)
// Based on cirras.eoplus VSCode extension

import { ConfigData } from '../services/configService';

export const EQF_LANGUAGE_ID = 'eqf';

export const eqfLanguageConfig = {
  comments: {
    lineComment: '//',
  },
  brackets: [
    ['{', '}'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
  ],
};

// Default actions/rules if config not loaded (matches config/actions.ini and config/rules.ini)
const DEFAULT_ACTIONS = [
  'AddNpcText', 'AddNpcInput', 'AddNpcChat', 'AddNpcPM', 'Roll', 'GiveItem', 'RemoveItem',
  'GiveExp', 'ShowHint', 'PlaySound', 'SetCoord', 'Quake', 'QuakeWorld', 'SetClass',
  'SetRace', 'SetHome', 'SetTitle', 'GiveKarma', 'RemoveKarma', 'StartQuest',
  'SetQuestState', 'ResetQuest', 'GiveStat', 'RemoveStat', 'ResetDaily', 'Reset', 'End'
];

const DEFAULT_RULES = [
  'TalkedToNpc', 'InputNpc', 'Rolled', 'KilledNpcs', 'KilledPlayers', 'GotItems',
  'LostItems', 'UsedItem', 'EnterCoord', 'LeaveCoord', 'EnterMap', 'LeaveMap',
  'IsClass', 'IsRace', 'IsGender', 'CitizenOf', 'GotSpell', 'LostSpell', 'UsedSpell',
  'IsWearing', 'StatGreater', 'StatLess', 'StatIs', 'StatNot', 'StatBetween',
  'StatRpn', 'DoneDaily', 'Always'
];

// Default stats for syntax highlighting
const DEFAULT_STATS = [
  'level', 'exp', 'str', 'int', 'wis', 'agi', 'con', 'cha',
  'statpoints', 'skillpoints', 'admin', 'gender', 'hairstyle',
  'haircolor', 'race', 'guildrank', 'karma', 'class'
];

function createTokensProvider(actions: string[], rules: string[]) {
  // Create regex patterns for actions and rules
  // These will match the function names followed by opening parenthesis
  const actionsPattern = actions.length > 0 
    ? new RegExp(`\\b(${actions.join('|')})(?=\\s*\\()`)
    : /(?!)/; // Never match if no actions
  
  const rulesPattern = rules.length > 0
    ? new RegExp(`\\b(${rules.join('|')})(?=\\s*\\()`)
    : /(?!)/; // Never match if no rules

  return {
    keywords: [
      'Main', 'State', 'random', 'action', 'rule', 'goto', 'desc',
      'questname', 'version', 'hidden', 'hidden_end', 'disabled'
    ],
    
    actions: actions,
    
    rules: rules,
    
    operators: [',', ';'],
    
    // Stat keywords
    stats: DEFAULT_STATS,

    tokenizer: {
      root: [
        // Comments
        [/\/\/.*$/, 'comment'],
        
        // Keywords (case-insensitive)
        [/\b(?:state)\b/i, 'keyword.state'],
        [/\b(?:Main|random)\b/i, 'keyword.control'],
        [/\b(?:action|rule|goto|desc|coord|item)\b/i, 'keyword'],
        [/\b(?:questname|version|hidden|hidden_end|disabled|minlevel|maxlevel|needadmin|adminreq|needclass|classreq|needquest|questreq|startnpc)\b/i, 'keyword.declaration'],
        
        // Actions - explicitly match action names from config
        [actionsPattern, 'support.function.action'],
        
        // Rules - explicitly match rule names from config
        [rulesPattern, 'support.function.rule'],
        
        // Stats - dynamically create pattern from DEFAULT_STATS
        [new RegExp(`\\b(?:${DEFAULT_STATS.join('|')})\\b`, 'i'), 'variable.language'],
        
        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string'],
        
        // Numbers
        [/\b\d+\.?\d*\b/, 'number'],
        
        // Operators
        [/[,;]/, 'delimiter'],
        
        // Brackets
        [/[{}()]/, '@brackets'],
        
        // Identifiers (state names, random names, etc.)
        [/[a-zA-Z_]\w*/, 'identifier'],
      ],
      
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop']
      ],
    },
  };
}

export function registerEQFLanguage(monaco: any, config?: ConfigData | null) {
  // Get actions and rules from config or use defaults
  const actions = config ? Object.keys(config.actions) : DEFAULT_ACTIONS;
  const rules = config ? Object.keys(config.rules) : DEFAULT_RULES;
  
  // Register language
  monaco.languages.register({ id: EQF_LANGUAGE_ID });
  
  // Set language configuration
  monaco.languages.setLanguageConfiguration(EQF_LANGUAGE_ID, eqfLanguageConfig);
  
  // Set tokens provider with dynamic actions/rules
  monaco.languages.setMonarchTokensProvider(EQF_LANGUAGE_ID, createTokensProvider(actions, rules));
  
  // Register completion provider for actions and rules
  monaco.languages.registerCompletionItemProvider(EQF_LANGUAGE_ID, {
    provideCompletionItems: (model: any, position: any) => {
      const suggestions: any[] = [];
      
      // Add action completions
      actions.forEach(action => {
        const doc = config?.actions[action];
        suggestions.push({
          label: action,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: `${action}()`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: doc ? `${doc.signature}\n\n${doc.description}` : undefined,
          detail: 'Action'
        });
      });
      
      // Add rule completions
      rules.forEach(rule => {
        const doc = config?.rules[rule];
        suggestions.push({
          label: rule,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: `${rule}()`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: doc ? `${doc.signature}\n\n${doc.description}` : undefined,
          detail: 'Rule'
        });
      });
      
      return { suggestions };
    }
  });
  
  // Define dark theme
  monaco.editor.defineTheme('eqf-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'keyword.control', foreground: 'C586C0', fontStyle: 'bold' },
      { token: 'keyword.state', foreground: '569CD6' },
      { token: 'keyword.declaration', foreground: '569CD6' },
      { token: 'support.function.action', foreground: 'DCDCAA' },
      { token: 'support.function.rule', foreground: '4EC9B0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'string.invalid', foreground: 'F44747' },
      { token: 'string.escape', foreground: 'D7BA7D' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'variable.language', foreground: '9CDCFE' },
      { token: 'identifier', foreground: 'D4D4D4' },
      { token: 'delimiter', foreground: 'D4D4D4' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editorLineNumber.foreground': '#858585',
      'editorCursor.foreground': '#AEAFAD',
      'editor.selectionBackground': '#264F78',
      'editor.lineHighlightBackground': '#2A2A2A',
    }
  });

  // Define light theme
  monaco.editor.defineTheme('eqf-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '008000' },
      { token: 'keyword', foreground: 'AF00DB' },
      { token: 'keyword.control', foreground: 'AF00DB', fontStyle: 'bold' },
      { token: 'keyword.state', foreground: '0000FF' },
      { token: 'keyword.declaration', foreground: '0000FF' },
      { token: 'support.function.action', foreground: '795E26' },
      { token: 'support.function.rule', foreground: '267F99' },
      { token: 'string', foreground: 'A31515' },
      { token: 'string.invalid', foreground: 'CD3131' },
      { token: 'string.escape', foreground: 'EE9900' },
      { token: 'number', foreground: '098658' },
      { token: 'variable.language', foreground: '001080' },
      { token: 'identifier', foreground: '000000' },
      { token: 'delimiter', foreground: '000000' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#000000',
      'editorLineNumber.foreground': '#237893',
      'editorCursor.foreground': '#000000',
      'editor.selectionBackground': '#ADD6FF',
      'editor.lineHighlightBackground': '#F0F0F0',
    }
  });
}
