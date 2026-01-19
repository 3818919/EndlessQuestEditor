/**
 * Git Service
 * Handles git operations for project version control
 */

const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

export interface GitFileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked';
  staged: boolean;
}

export interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export class GitService {
  /**
   * Initialize a git repository in the project directory
   */
  static async initRepo(projectPath: string): Promise<{ success: boolean; error?: string }> {
    if (!isElectron || !window.electronAPI) {
      return { success: false, error: 'Electron API not available' };
    }

    try {
      const result = await window.electronAPI.runCommand(`cd "${projectPath}" && git init`);
      return { success: result.exitCode === 0, error: result.stderr };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Check if directory is a git repository
   * We specifically check for a .git folder in the project directory to avoid
   * detecting parent repositories
   */
  static async isGitRepo(projectPath: string): Promise<boolean> {
    if (!isElectron || !window.electronAPI) {
      return false;
    }

    try {
      // Check if .git directory exists in the project folder
      const result = await window.electronAPI.runCommand(`test -d "${projectPath}/.git" && echo "exists" || echo "not exists"`);
      return result.stdout.trim() === 'exists';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get git status (list of modified/staged files)
   */
  static async getStatus(projectPath: string): Promise<GitFileStatus[]> {
    if (!isElectron || !window.electronAPI) {
      return [];
    }

    try {
      // Use porcelain format for easier parsing
      const result = await window.electronAPI.runCommand(`cd "${projectPath}" && git status --porcelain`);
      
      if (result.exitCode !== 0) {
        console.error('Git status failed:', result.stderr);
        return [];
      }

      const lines = result.stdout.split('\n').filter(line => line.trim());
      const files: GitFileStatus[] = [];

      for (const line of lines) {
        if (line.length < 4) continue;

        const statusCode = line.substring(0, 2);
        const filePath = line.substring(3);

        let status: GitFileStatus['status'] = 'modified';
        let staged = false;

        // Parse git status codes
        const x = statusCode[0]; // staged status
        const y = statusCode[1]; // unstaged status

        if (x === 'A' || y === 'A') status = 'added';
        if (x === 'D' || y === 'D') status = 'deleted';
        if (x === 'R' || y === 'R') status = 'renamed';
        if (x === '?' && y === '?') status = 'untracked';
        if (x === 'M') status = 'modified';

        staged = x !== ' ' && x !== '?';

        files.push({ path: filePath, status, staged });
      }

      return files;
    } catch (error) {
      console.error('Error getting git status:', error);
      return [];
    }
  }

  /**
   * Get diff for a file
   */
  static async getDiff(projectPath: string, filePath: string, staged: boolean = false): Promise<string> {
    if (!isElectron || !window.electronAPI) {
      return '';
    }

    try {
      console.log('=== getDiff called ===');
      console.log('Project path:', projectPath);
      console.log('File path:', filePath);
      console.log('Staged:', staged);

      // Check file status first
      const statusCmd = `cd "${projectPath}" && git status --porcelain -- "${filePath}"`;
      console.log('Running command:', statusCmd);
      
      const statusResult = await window.electronAPI.runCommand(statusCmd);
      console.log('Status result:', statusResult);
      
      const status = statusResult.stdout.trim();
      console.log('File status:', status);
      
      // For untracked files (??), show full content
      if (status.startsWith('??')) {
        console.log('Untracked file detected, showing full content');
        const contentResult = await window.electronAPI.runCommand(
          `cd "${projectPath}" && cat "${filePath}"`
        );
        if (contentResult.exitCode === 0 && contentResult.stdout) {
          const lines = contentResult.stdout.split('\n');
          return lines.map(line => `+${line}`).join('\n');
        }
        return 'Unable to read file content';
      }
      
      // For added files (A ), show diff --cached
      if (status.startsWith('A ')) {
        console.log('Added file detected, showing cached diff');
        const result = await window.electronAPI.runCommand(
          `cd "${projectPath}" && git diff --cached -- "${filePath}"`
        );
        console.log('Cached diff result:', result);
        if (result.stdout) {
          return result.stdout;
        }
        // If no cached diff, show the file content
        const contentResult = await window.electronAPI.runCommand(
          `cd "${projectPath}" && cat "${filePath}"`
        );
        if (contentResult.exitCode === 0 && contentResult.stdout) {
          const lines = contentResult.stdout.split('\n');
          return lines.map(line => `+${line}`).join('\n');
        }
      }
      
      // For modified files, use appropriate diff command
      const stagedFlag = staged ? '--cached' : '';
      const diffCmd = `cd "${projectPath}" && git diff ${stagedFlag} -- "${filePath}"`;
      console.log('Running diff command:', diffCmd);
      
      const result = await window.electronAPI.runCommand(diffCmd);
      console.log('Diff result:', result);
      console.log('Diff stdout length:', result.stdout?.length || 0);
      console.log('Diff stderr:', result.stderr);
      console.log('Diff exitCode:', result.exitCode);
      
      if (result.stdout && result.stdout.trim()) {
        return result.stdout;
      }
      
      return 'No changes to display (empty diff output)';
    } catch (error) {
      console.error('Error getting diff:', error);
      return 'Error loading diff: ' + (error as Error).message;
    }
  }

  /**
   * Stage a file
   */
  static async stageFile(projectPath: string, filePath: string): Promise<{ success: boolean; error?: string }> {
    if (!isElectron || !window.electronAPI) {
      return { success: false, error: 'Electron API not available' };
    }

    try {
      const result = await window.electronAPI.runCommand(`cd "${projectPath}" && git add "${filePath}"`);
      return { success: result.exitCode === 0, error: result.stderr };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Unstage a file
   */
  static async unstageFile(projectPath: string, filePath: string): Promise<{ success: boolean; error?: string }> {
    if (!isElectron || !window.electronAPI) {
      return { success: false, error: 'Electron API not available' };
    }

    try {
      const result = await window.electronAPI.runCommand(`cd "${projectPath}" && git reset HEAD "${filePath}"`);
      return { success: result.exitCode === 0, error: result.stderr };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Stage all files
   */
  static async stageAll(projectPath: string): Promise<{ success: boolean; error?: string }> {
    if (!isElectron || !window.electronAPI) {
      return { success: false, error: 'Electron API not available' };
    }

    try {
      const result = await window.electronAPI.runCommand(`cd "${projectPath}" && git add -A`);
      return { success: result.exitCode === 0, error: result.stderr };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Commit staged changes
   */
  static async commit(projectPath: string, message: string): Promise<{ success: boolean; error?: string }> {
    if (!isElectron || !window.electronAPI) {
      return { success: false, error: 'Electron API not available' };
    }

    try {
      // Escape double quotes in commit message
      const escapedMessage = message.replace(/"/g, '\\"');
      const result = await window.electronAPI.runCommand(
        `cd "${projectPath}" && git commit -m "${escapedMessage}"`
      );
      return { success: result.exitCode === 0, error: result.stderr };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get commit history
   */
  static async getLog(projectPath: string, limit: number = 50): Promise<GitCommit[]> {
    if (!isElectron || !window.electronAPI) {
      return [];
    }

    try {
      // Use custom format for easier parsing
      const format = '%H%n%an%n%ai%n%s%n---END---';
      const result = await window.electronAPI.runCommand(
        `cd "${projectPath}" && git log --format="${format}" -n ${limit}`
      );
      
      if (result.exitCode !== 0) {
        return [];
      }

      const commits: GitCommit[] = [];
      const entries = result.stdout.split('---END---\n').filter(e => e.trim());

      for (const entry of entries) {
        const lines = entry.trim().split('\n');
        if (lines.length >= 4) {
          commits.push({
            hash: lines[0],
            author: lines[1],
            date: lines[2],
            message: lines[3]
          });
        }
      }

      return commits;
    } catch (error) {
      console.error('Error getting git log:', error);
      return [];
    }
  }

  /**
   * Get current branch name
   */
  static async getCurrentBranch(projectPath: string): Promise<string> {
    if (!isElectron || !window.electronAPI) {
      return '';
    }

    try {
      const result = await window.electronAPI.runCommand(`cd "${projectPath}" && git branch --show-current`);
      return result.stdout.trim();
    } catch (error) {
      return '';
    }
  }
}
