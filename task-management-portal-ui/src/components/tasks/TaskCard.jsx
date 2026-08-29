import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import { Edit, Delete, AccessTime } from '@mui/icons-material';

export default function TaskCard({ task = { title: "Sample Task", description: "Task description goes here.", priority: "High", status: "Open", dueDate: "2026-06-10" }, onEdit, onDelete }) {
  const getPriorityColor = (p) => {
    switch (p?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0px 4px 20px rgba(0,0,0,0.03)", mb: 2, '&:hover': { boxShadow: "0px 6px 24px rgba(0,0,0,0.06)" } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" fontWeight={700} color="#0f172a">
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} sx={{ fontWeight: 600, borderRadius: 1 }} />
            <Chip label={task.status} size="small" variant="outlined" sx={{ fontWeight: 600, borderRadius: 1 }} />
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {task.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #f1f5f9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <AccessTime fontSize="small" />
            <Typography variant="caption">Due: {task.dueDate}</Typography>
          </Box>
          <Box>
            <IconButton size="small" color="primary" onClick={onEdit}><Edit fontSize="small" /></IconButton>
            <IconButton size="small" color="error" onClick={onDelete}><Delete fontSize="small" /></IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}