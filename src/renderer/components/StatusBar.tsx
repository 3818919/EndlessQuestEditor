import React from 'react';
import { LinearProgress, Box, Typography } from '@mui/material';

interface StatusBarProps {
  isLoading: boolean;
  progress: number;
  message?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ isLoading, progress, message }) => {
  if (!isLoading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1e1e1e',
        borderTop: '1px solid #333',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        zIndex: 9999,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: '#aaa',
          minWidth: '200px',
          fontSize: '12px',
        }}
      >
        {message || 'Processing GFX files...'}
      </Typography>
      <Box sx={{ flexGrow: 1, maxWidth: '400px' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: '#333',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#4a9eff',
              borderRadius: 3,
            },
          }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: '#aaa',
          minWidth: '50px',
          textAlign: 'right',
          fontSize: '12px',
        }}
      >
        {Math.round(progress)}%
      </Typography>
    </Box>
  );
};

export default StatusBar;
