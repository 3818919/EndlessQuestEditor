// Monaco Editor Language Definition for EQF (EO Quest Files)
// Based on cirras.eoplus VSCode extension

import { ACTION_METADATA, RULE_METADATA } from '../../eqf-parser';

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

export const eqfLanguageTokens = {
  keywords: [
    'Main', 'State', 'random', 'action', 'rule', 'goto', 'desc',
    'questname', 'version', 'hidden', 'hidden_end', 'disabled',
    'minlevel', 'maxlevel', 'needadmin', 'adminreq', 'needclass',
    'classreq', 'needquest', 'questreq', 'startnpc', 'coord', 'item'
  ],
  
  actions: Object.keys(ACTION_METADATA),
  
  rules: Object.keys(RULE_METADATA),
  
  operators: [',', ';'],
  
  // Stat keywords
  stats: [
    'accuracy', 'agi', 'armor', 'cha', 'con', 'base_agi', 'base_cha', 'base_con',
    'base_int', 'base_str', 'base_wis', 'evade', 'exp', 'goldbank', 'hp', 'int',
    'level', 'mapid', 'maxhp', 'maxtp', 'maxsp', 'maxdam', 'maxweight', 'mindam',
    'skillpoints', 'statpoints', 'str', 'tp', 'weight', 'wis', 'x', 'y'
  ],

  tokenizer: {
    root: [
      // Comments
      [/\/\/.*$/, 'comment'],
      
      // Keywords (case-insensitive)
      [/\b(?:Main|State|random)\b/i, 'keyword.control'],
      [/\b(?:action|rule|goto|desc|coord|item)\b/i, 'keyword'],
      [/\b(?:questname|version|hidden|hidden_end|disabled|minlevel|maxlevel|needadmin|adminreq|needclass|classreq|needquest|questreq|startnpc)\b/i, 'keyword.declaration'],
      
      // Actions - match function-like syntax
      [/\b[A-Z][a-zA-Z]*(?=\s*\()/, {
        cases: {
          '@actions': 'support.function.action',
          '@rules': 'support.function.rule',
          '@default': 'identifier'
        }
      }],
      
      // Stats
      [/\b(?:accuracy|agi|armor|cha|con|base_agi|base_cha|base_con|base_int|base_str|base_wis|evade|exp|goldbank|hp|int|level|mapid|maxhp|maxtp|maxsp|maxdam|maxweight|mindam|skillpoints|statpoints|str|tp|weight|wis|x|y)\b/i, 'variable.language'],
      
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

export function registerEQFLanguage(monaco: any) {
  // Register language
  monaco.languages.register({ id: EQF_LANGUAGE_ID });
  
  // Set language configuration
  monaco.languages.setLanguageConfiguration(EQF_LANGUAGE_ID, eqfLanguageConfig);
  
  // Set tokens provider
  monaco.languages.setMonarchTokensProvider(EQF_LANGUAGE_ID, eqfLanguageTokens);
  
  // Define theme
  monaco.editor.defineTheme('eqf-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'keyword.control', foreground: 'C586C0', fontStyle: 'bold' },
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
}
