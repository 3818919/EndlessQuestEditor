import React, { useState, useEffect, useCallback } from 'react';
import { GitService, GitFileStatus, GitCommit } from '../services/gitService';

interface GitPageProps {
  currentProject: string;
  projectName: string;
}

const GitPage: React.FC<GitPageProps> = ({ currentProject, projectName }) => {
  const [isGitRepo, setIsGitRepo] = useState(false);
  const [files, setFiles] = useState<GitFileStatus[]>([]);
  const [selectedFile, setSelectedFile] = useState<GitFileStatus | null>(null);
  const [diff, setDiff] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState('');
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [currentBranch, setCurrentBranch] = useState('');
  const [activeTab, setActiveTab] = useState<'changes' | 'history'>('changes');
  const [loading, setLoading] = useState(false);
  const [loadingDiff, setLoadingDiff] = useState(false);

  console.log('[GitPage] Rendered with currentProject:', currentProject, 'projectName:', projectName);

  // Check if project is a git repo
  useEffect(() => {
    const checkGitRepo = async () => {
      if (!currentProject) {
        console.log('[GitPage] No currentProject, skipping git check');
        return;
      }
      console.log('[GitPage] Checking git repo at:', currentProject);
      const isRepo = await GitService.isGitRepo(currentProject);
      console.log('[GitPage] isGitRepo:', isRepo);
      setIsGitRepo(isRepo);
      
      if (isRepo) {
        await refreshStatus();
        await refreshHistory();
        const branch = await GitService.getCurrentBranch(currentProject);
        setCurrentBranch(branch);
      }
    };
    checkGitRepo();
  }, [currentProject]);

  const refreshStatus = useCallback(async () => {
    if (!currentProject) return;
    const status = await GitService.getStatus(currentProject);
    setFiles(status);
  }, [currentProject]);

  const refreshHistory = useCallback(async () => {
    if (!currentProject) return;
    const log = await GitService.getLog(currentProject, 50);
    setCommits(log);
  }, [currentProject]);

  const handleInitRepo = async () => {
    setLoading(true);
    const result = await GitService.initRepo(currentProject);
    if (result.success) {
      setIsGitRepo(true);
      await refreshStatus();
      const branch = await GitService.getCurrentBranch(currentProject);
      setCurrentBranch(branch || 'main');
    } else {
      alert('Failed to initialize git repository: ' + result.error);
    }
    setLoading(false);
  };

  const handleFileClick = async (file: GitFileStatus) => {
    setSelectedFile(file);
    setLoadingDiff(true);
    setDiff('');
    console.log('Fetching diff for:', file.path, 'staged:', file.staged, 'status:', file.status);
    try {
      const fileDiff = await GitService.getDiff(currentProject, file.path, file.staged);
      console.log('Diff result length:', fileDiff.length);
      setDiff(fileDiff);
    } catch (error) {
      console.error('Error fetching diff:', error);
      setDiff('Error loading diff');
    } finally {
      setLoadingDiff(false);
    }
  };

  const handleStage = async (file: GitFileStatus) => {
    setLoading(true);
    const result = await GitService.stageFile(currentProject, file.path);
    if (result.success) {
      await refreshStatus();
      // Reload diff if this file is selected
      if (selectedFile?.path === file.path) {
        const updatedFile = { ...file, staged: true };
        setSelectedFile(updatedFile);
        setLoadingDiff(true);
        const fileDiff = await GitService.getDiff(currentProject, file.path, true);
        setDiff(fileDiff);
        setLoadingDiff(false);
      }
    } else {
      alert('Failed to stage file: ' + result.error);
    }
    setLoading(false);
  };

  const handleUnstage = async (file: GitFileStatus) => {
    setLoading(true);
    const result = await GitService.unstageFile(currentProject, file.path);
    if (result.success) {
      await refreshStatus();
      // Reload diff if this file is selected
      if (selectedFile?.path === file.path) {
        const updatedFile = { ...file, staged: false };
        setSelectedFile(updatedFile);
        setLoadingDiff(true);
        const fileDiff = await GitService.getDiff(currentProject, file.path, false);
        setDiff(fileDiff);
        setLoadingDiff(false);
      }
    } else {
      alert('Failed to unstage file: ' + result.error);
    }
    setLoading(false);
  };

  const handleStageAll = async () => {
    setLoading(true);
    const result = await GitService.stageAll(currentProject);
    if (result.success) {
      await refreshStatus();
      setSelectedFile(null);
      setDiff('');
    } else {
      alert('Failed to stage all files: ' + result.error);
    }
    setLoading(false);
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      alert('Please enter a commit message');
      return;
    }

    setLoading(true);
    const result = await GitService.commit(currentProject, commitMessage);
    if (result.success) {
      setCommitMessage('');
      await refreshStatus();
      await refreshHistory();
      setSelectedFile(null);
      setDiff('');
      alert('Changes committed successfully!');
    } else {
      alert('Failed to commit: ' + result.error);
    }
    setLoading(false);
  };

  const stagedFiles = files.filter(f => f.staged);
  const unstagedFiles = files.filter(f => !f.staged);

  if (!isGitRepo) {
    return (
      <div className="git-page">
        <div className="git-init-container">
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Version Control</h2>
          <p>This project is not yet under version control.</p>
          <p>Initialize a git repository to track changes to your project files.</p>
          <button 
            onClick={handleInitRepo}
            disabled={loading}
          >
            {loading ? 'Initializing...' : 'Initialize Git Repository'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="git-page">
      <div className="git-header">
        <h2>Version Control - {projectName}</h2>
        {currentBranch && (
          <div style={{
            display: 'inline-block',
            padding: '4px 8px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '4px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginTop: '8px'
          }}>
            Branch: {currentBranch}
          </div>
        )}
      </div>

      <div className="git-tabs">
        <button 
          className={`git-tab ${activeTab === 'changes' ? 'active' : ''}`}
          onClick={() => setActiveTab('changes')}
        >
          Changes
        </button>
        <button 
          className={`git-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {activeTab === 'changes' && (
        <div className="git-content">
          <div className="git-split-view">
            <div className="git-file-list">
              {files.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>No changes</p>
                </div>
              ) : (
                <>
                  {stagedFiles.length > 0 && (
                    <div className="git-section">
                      <div className="git-section-header">
                        Staged Changes ({stagedFiles.length})
                      </div>
                      {stagedFiles.map(file => (
                        <div 
                          key={file.path}
                          className={`file-item ${selectedFile?.path === file.path ? 'selected' : ''}`}
                          onClick={() => handleFileClick(file)}
                        >
                          <span className="file-item-name">{file.path}</span>
                          <div className="file-item-actions">
                            <span className={`file-item-status ${file.status}`}>
                              {file.status[0].toUpperCase()}
                            </span>
                            <button 
                              className="file-item-btn"
                              onClick={(e) => { e.stopPropagation(); handleUnstage(file); }}
                              title="Unstage"
                            >
                              −
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {unstagedFiles.length > 0 && (
                    <div className="git-section">
                      <div className="git-section-header">
                        Changes ({unstagedFiles.length})
                        {unstagedFiles.length > 0 && (
                          <button 
                            className="file-item-btn"
                            onClick={handleStageAll}
                            disabled={loading}
                            style={{ marginLeft: 'auto' }}
                          >
                            Stage All
                          </button>
                        )}
                      </div>
                      {unstagedFiles.map(file => (
                        <div 
                          key={file.path}
                          className={`file-item ${selectedFile?.path === file.path ? 'selected' : ''}`}
                          onClick={() => handleFileClick(file)}
                        >
                          <span className="file-item-name">{file.path}</span>
                          <div className="file-item-actions">
                            <span className={`file-item-status ${file.status}`}>
                              {file.status[0].toUpperCase()}
                            </span>
                            <button 
                              className="file-item-btn"
                              onClick={(e) => { e.stopPropagation(); handleStage(file); }}
                              title="Stage"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {stagedFiles.length > 0 && (
                    <div className="commit-form">
                      <textarea 
                        placeholder="Commit message..."
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        rows={3}
                      />
                      <button 
                        onClick={handleCommit}
                        disabled={loading || !commitMessage.trim()}
                      >
                        {loading ? 'Committing...' : 'Commit'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="diff-viewer">
              {selectedFile ? (
                <>
                  <div style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'var(--bg-tertiary)'
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{selectedFile.path}</span>
                    <span className={`file-item-status ${selectedFile.status}`}>
                      {selectedFile.status}
                    </span>
                  </div>
                  {loadingDiff ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 'calc(100% - 48px)',
                      color: 'var(--text-secondary)'
                    }}>
                      Loading diff...
                    </div>
                  ) : (
                    <pre style={{
                      margin: 0,
                      padding: '16px',
                      fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
                      fontSize: '12px',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      color: 'var(--text-primary)'
                    }}>
                      {diff || 'No changes to display'}
                    </pre>
                  )}
                </>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--text-secondary)'
                }}>
                  Select a file to view changes
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="git-content">
          {commits.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-secondary)'
            }}>
              <p>No commits yet</p>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                Make your first commit to see history here
              </p>
            </div>
          ) : (
            <div className="commit-list">
              {commits.map(commit => (
                <div key={commit.hash} className="commit-item">
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'center',
                    marginBottom: '6px'
                  }}>
                    <span className="commit-hash">{commit.hash.substring(0, 7)}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {commit.author}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                      {new Date(commit.date).toLocaleString()}
                    </span>
                  </div>
                  <div className="commit-message">{commit.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GitPage;
