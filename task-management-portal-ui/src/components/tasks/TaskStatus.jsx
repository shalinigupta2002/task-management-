import React from 'react';
import { Box, Paper, Typography, LinearProgress } from '@mui/material';

export default function TaskStatus() {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0px 4px 20px rgba(0,0,0,0.03)" }}>
      <Typography variant="h6" fontWeight={700} color="#0f172a" gutterBottom>Tasks Status Breakdown</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Open</Typography>
            <Typography variant="body2" fontWeight={600}>40%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={40} sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' } }} />
        </Box>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">In Progress</Typography>
            <Typography variant="body2" fontWeight={600}>35%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={35} sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#d97706' } }} />
        </Box>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Completed</Typography>
            <Typography variant="body2" fontWeight={600}>25%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={25} sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#16a34a' } }} />
        </Box>
      </Box>
    </Paper>
  );
}