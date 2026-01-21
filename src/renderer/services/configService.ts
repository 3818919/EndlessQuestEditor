/**
 * Service for loading and parsing external configuration files (actions.ini, rules.ini)
 */

export interface ParamInfo {
  name: string;
  type: 'string' | 'integer';
}

export interface ActionOrRuleDoc {
  signature: string;
  description: string;
  params: ParamInfo[];
  rawSignature: string; // The exact signature line from the config (e.g., includes semicolon)
}

export interface ConfigData {
  actions: Record<string, ActionOrRuleDoc>;
  rules: Record<string, ActionOrRuleDoc>;
}

/**
 * Parse parameters from a signature string like `ActionName(param1, "param2");`
 * Parameters in double quotes are strings, others are integers
 */
function parseParamsFromSignature(signature: string): ParamInfo[] {
  // Extract the content between parentheses
  const match = signature.match(/\(([^)]*)\)/);
  if (!match || !match[1].trim()) return [];
  
  const paramsStr = match[1];
  const params: ParamInfo[] = [];
  
  // Split by comma, handling quoted strings
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < paramsStr.length; i++) {
    const char = paramsStr[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === ',' && !inQuotes) {
      const param = current.trim();
      if (param) {
        params.push(parseParamType(param));
      }
      current = '';
    } else {
      current += char;
    }
  }
  
  // Don't forget the last parameter
  const lastParam = current.trim();
  if (lastParam) {
    params.push(parseParamType(lastParam));
  }
  
  return params;
}

/**
 * Determine if a parameter is a string or integer based on whether it's in quotes
 */
function parseParamType(param: string): ParamInfo {
  // Remove backticks if present
  const cleanParam = param.replace(/`/g, '');
  
  // If it's in double quotes, it's a string parameter
  if (cleanParam.startsWith('"') && cleanParam.endsWith('"')) {
    // Extract the name from within the quotes
    const name = cleanParam.slice(1, -1);
    return { name, type: 'string' };
  }
  
  // Otherwise it's an integer parameter
  return { name: cleanParam, type: 'integer' };
}

/**
 * Parse an INI file content into a record of action/rule definitions
 */
function parseIniContent(content: string): Record<string, ActionOrRuleDoc> {
  const result: Record<string, ActionOrRuleDoc> = {};
  const lines = content.split('\n');
  
  let currentSection: string | null = null;
  let currentData: { signature?: string; description?: string } = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith(';')) {
      continue;
    }
    
    // Check for section header [SectionName]
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      // Save previous section if exists
      if (currentSection && currentData.signature && currentData.description) {
        const params = parseParamsFromSignature(currentData.signature);
        result[currentSection] = {
          signature: currentData.signature,
          description: currentData.description,
          params,
          rawSignature: currentData.signature
        };
      }
      
      // Start new section
      currentSection = sectionMatch[1];
      currentData = {};
      continue;
    }
    
    // Parse key = value
    const keyValueMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
    if (keyValueMatch && currentSection) {
      const [, key, value] = keyValueMatch;
      if (key === 'signature') {
        currentData.signature = value;
      } else if (key === 'description') {
        currentData.description = value;
      }
    }
  }
  
  // Don't forget the last section
  if (currentSection && currentData.signature && currentData.description) {
    const params = parseParamsFromSignature(currentData.signature);
    result[currentSection] = {
      signature: currentData.signature,
      description: currentData.description,
      params,
      rawSignature: currentData.signature
    };
  }
  
  return result;
}

// Cache for loaded config
let configCache: ConfigData | null = null;
let configLoadPromise: Promise<ConfigData> | null = null;

/**
 * Load actions and rules configuration from external INI files
 */
export async function loadConfig(): Promise<ConfigData> {
  // Return cached config if available
  if (configCache) {
    return configCache;
  }
  
  // If already loading, wait for that promise
  if (configLoadPromise) {
    return configLoadPromise;
  }
  
  configLoadPromise = (async () => {
    const config: ConfigData = {
      actions: {},
      rules: {}
    };
    
    if (!window.electronAPI) {
      console.warn('Electron API not available, using empty config');
      return config;
    }
    
    try {
      const configDir = await window.electronAPI.getConfigDir();
      
      // Load actions.ini
      const actionsPath = `${configDir}/actions.ini`;
      const actionsResult = await window.electronAPI.readTextFile(actionsPath);
      if (actionsResult.success && actionsResult.data) {
        config.actions = parseIniContent(actionsResult.data);
        console.log(`Loaded ${Object.keys(config.actions).length} actions from config`);
      } else {
        console.warn('Could not load actions.ini:', actionsResult.error);
      }
      
      // Load rules.ini
      const rulesPath = `${configDir}/rules.ini`;
      const rulesResult = await window.electronAPI.readTextFile(rulesPath);
      if (rulesResult.success && rulesResult.data) {
        config.rules = parseIniContent(rulesResult.data);
        console.log(`Loaded ${Object.keys(config.rules).length} rules from config`);
      } else {
        console.warn('Could not load rules.ini:', rulesResult.error);
      }
    } catch (error) {
      console.error('Error loading config files:', error);
    }
    
    configCache = config;
    return config;
  })();
  
  return configLoadPromise;
}

/**
 * Get documentation for a specific action or rule
 */
export function getDocumentation(config: ConfigData, word: string): ActionOrRuleDoc | null {
  return config.actions[word] || config.rules[word] || null;
}

/**
 * Get all action names
 */
export function getActionNames(config: ConfigData): string[] {
  return Object.keys(config.actions);
}

/**
 * Get all rule names
 */
export function getRuleNames(config: ConfigData): string[] {
  return Object.keys(config.rules);
}

/**
 * Clear the config cache (useful for reloading)
 */
export function clearConfigCache(): void {
  configCache = null;
  configLoadPromise = null;
}
