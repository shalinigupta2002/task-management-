import React from 'react';
import { Box, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

export default function TaskFilter({ filterStatus, setFilterStatus, filterPriority, setFilterPriority, searchTerm, setSearchTerm }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <TextField
        label="Search Tasks"
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ flexGrow: 1, minWidth: 220, bgcolor: 'background.paper', borderRadius: 1 }}
      />
      
      <FormControl size="small" sx={{ minWidth: 140, bgcolor: 'background.paper' }}>
        <InputLabel>Status</InputLabel>
        <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Open">Open</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 140, bgcolor: 'background.paper' }}>
        <InputLabel>Priority</InputLabel>
        <Select value={filterPriority} label="Priority" onChange={(e) => setFilterPriority(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}