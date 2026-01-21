/**
 * Service for loading state templates from external .eqf files
 * State templates are partial quest files that define only state content
 * (description, actions, rules) without the full quest structure.
 */

import { QuestAction, QuestRule } from '../../eqf-parser';

export interface StateTemplateData {
  description: string;
  actions: QuestAction[];
  rules: QuestRule[];
}

// Cache for loaded state templates
let stateTemplatesCache: Record<string, StateTemplateData> | null = null;
let stateTemplatesLoadPromise: Promise<Record<string, StateTemplateData>> | null = null;

/**
 * Parse a state template file content
 * State templates have a simplified format:
 *   desc    "Description"
 *   action  ActionName(params);
 *   rule    RuleName(params) goto StateName
 */
function parseStateTemplate(content: string): StateTemplateData {
  const lines = content.split('\n');
  const template: StateTemplateData = {
    description: '',
    actions: [],
    rules: []
  };

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('//')) continue;

    // Parse description
    if (trimmed.toLowerCase().startsWith('desc')) {
      const match = trimmed.match(/"([^"]*)"/);
      if (match) {
        template.description = match[1];
      }
      continue;
    }

    // Parse action
    if (trimmed.toLowerCase().startsWith('action')) {
      const actionMatch = trimmed.match(/action\s+(\w+)\s*\((.*?)\)\s*;?/i);
      if (actionMatch) {
        const type = actionMatch[1];
        const paramsStr = actionMatch[2];
        const params = parseParams(paramsStr);
        template.actions.push({
          type,
          params,
          rawText: `${type}(${paramsStr})${trimmed.includes(';') ? ';' : ''}`
        });
      }
      continue;
    }

    // Parse rule
    if (trimmed.toLowerCase().startsWith('rule')) {
      const ruleMatch = trimmed.match(/rule\s+(\w+)\s*\((.*?)\)\s+goto\s+(\w+)/i);
      if (ruleMatch) {
        const type = ruleMatch[1];
        const paramsStr = ruleMatch[2];
        const gotoState = ruleMatch[3];
        const params = parseParams(paramsStr);
        template.rules.push({
          type,
          params,
          gotoState,
          rawText: `${type}(${paramsStr}) goto ${gotoState}`
        });
      }
      continue;
    }
  }

  return template;
}

/**
 * Parse parameter string into array of values
 */
function parseParams(paramsStr: string): (string | number)[] {
  if (!paramsStr.trim()) return [];

  const params: (string | number)[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < paramsStr.length; i++) {
    const char = paramsStr[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === ',' && !inQuotes) {
      params.push(parseParam(current.trim()));
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    params.push(parseParam(current.trim()));
  }

  return params;
}

/**
 * Parse a single parameter value
 */
function parseParam(param: string): string | number {
  // Remove quotes if present
  if (param.startsWith('"') && param.endsWith('"')) {
    return param.slice(1, -1);
  }

  // Try to parse as number
  const num = parseFloat(param);
  if (!isNaN(num)) {
    return num;
  }

  return param;
}

/**
 * Load all state templates from the config/templates/states directory
 */
export async function loadStateTemplates(): Promise<Record<string, StateTemplateData>> {
  // Return cached templates if available
  if (stateTemplatesCache) {
    return stateTemplatesCache;
  }
  
  // If already loading, wait for that promise
  if (stateTemplatesLoadPromise) {
    return stateTemplatesLoadPromise;
  }
  
  stateTemplatesLoadPromise = (async () => {
    const templates: Record<string, StateTemplateData> = {};
    
    if (!window.electronAPI) {
      console.warn('Electron API not available, using empty state templates');
      return templates;
    }
    
    try {
      const configDir = await window.electronAPI.getConfigDir();
      const statesDir = `${configDir}/templates/states`;
      
      // Check if states directory exists
      const dirExists = await window.electronAPI.fileExists(statesDir);
      if (!dirExists) {
        console.log('State templates directory does not exist, creating it');
        await window.electronAPI.ensureDir(statesDir);
        return templates;
      }
      
      // List all .eqf files in states directory
      const listResult = await window.electronAPI.listFiles(statesDir, '.eqf');
      if (!listResult.success || listResult.files.length === 0) {
        console.log('No state template files found');
        return templates;
      }
      
      // Build file paths for batch reading
      const filePaths = listResult.files.map(filename => `${statesDir}/${filename}`);
      const batchResults = await window.electronAPI.readTextBatch(filePaths);
      
      // Parse each state template
      for (let i = 0; i < listResult.files.length; i++) {
        const filename = listResult.files[i];
        const filePath = filePaths[i];
        const result = batchResults[filePath];
        
        if (result?.success && result.data) {
          try {
            // Parse the state template file
            const stateTemplate = parseStateTemplate(result.data);
            
            // Use filename (without extension) as the template name
            const templateName = filename.replace(/\.eqf$/i, '');
            templates[templateName] = stateTemplate;
            
            console.log(`Loaded state template: ${templateName}`);
          } catch (parseError) {
            console.warn(`Failed to parse state template ${filename}:`, parseError);
          }
        }
      }
      
      console.log(`Loaded ${Object.keys(templates).length} state templates`);
    } catch (error) {
      console.error('Error loading state templates:', error);
    }
    
    stateTemplatesCache = templates;
    return templates;
  })();
  
  return stateTemplatesLoadPromise;
}

/**
 * Get list of available state template names
 */
export async function getStateTemplateNames(): Promise<string[]> {
  const templates = await loadStateTemplates();
  return Object.keys(templates);
}

/**
 * Clear the state templates cache (useful for reloading)
 */
export function clearStateTemplatesCache(): void {
  stateTemplatesCache = null;
  stateTemplatesLoadPromise = null;
}
