/**
 * File I/O utilities for Electron and browser environments
 * Provides consistent API for reading/writing files
 */

const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

export interface FileIOResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Read a text file and parse as JSON
 */
export async function readJSONFile<T = any>(filePath: string): Promise<FileIOResult<T>> {
  try {
    if (!isElectron) {
      return { success: false, error: 'File operations only available in Electron' };
    }

    const result = await (window as any).electronAPI.readTextFile(filePath);
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to read file' };
    }

    const data = JSON.parse(result.data);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to parse JSON' };
  }
}

/**
 * Write data to a JSON file
 */
export async function writeJSONFile(filePath: string, data: any): Promise<FileIOResult<void>> {
  try {
    if (!isElectron) {
      return { success: false, error: 'File operations only available in Electron' };
    }

    const jsonString = JSON.stringify(data, null, 2);
    const result = await (window as any).electronAPI.writeTextFile(filePath, jsonString);
    
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to write file' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to write JSON file' };
  }
}

/**
 * Read a binary file (for EIF/ENF parsing)
 */
export async function readBinaryFile(filePath: string): Promise<FileIOResult<Uint8Array>> {
  try {
    if (!isElectron) {
      return { success: false, error: 'File operations only available in Electron' };
    }

    const result = await (window as any).electronAPI.readFile(filePath);
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to read binary file' };
    }

    const uint8Array = new Uint8Array(result.data);
    return { success: true, data: uint8Array };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to read binary file' };
  }
}

/**
 * Write binary data to a file
 */
export async function writeBinaryFile(filePath: string, data: Uint8Array): Promise<FileIOResult<void>> {
  try {
    if (!isElectron) {
      return { success: false, error: 'File operations only available in Electron' };
    }

    const result = await (window as any).electronAPI.writeFile(filePath, data);
    
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to write binary file' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to write binary file' };
  }
}

/**
 * Ensure a directory exists
 */
export async function ensureDirectory(dirPath: string): Promise<FileIOResult<void>> {
  try {
    if (!isElectron) {
      return { success: false, error: 'File operations only available in Electron' };
    }

    const result = await (window as any).electronAPI.ensureDir(dirPath);
    
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to create directory' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to ensure directory' };
  }
}

/**
 * List directories in a path
 */
export async function listDirectories(dirPath: string): Promise<FileIOResult<string[]>> {
  try {
    if (!isElectron) {
      return { success: false, error: 'File operations only available in Electron' };
    }

    const result = await (window as any).electronAPI.listDirectories(dirPath);
    
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to list directories' };
    }

    return { success: true, data: result.data || [] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to list directories' };
  }
}

/**
 * Delete a directory
 */
export async function deleteDirectory(dirPath: string): Promise<FileIOResult<void>> {
  try {
    if (!isElectron) {
      return { success: false, error: 'File operations only available in Electron' };
    }

    const result = await (window as any).electronAPI.deleteDirectory(dirPath);
    
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to delete directory' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete directory' };
  }
}
