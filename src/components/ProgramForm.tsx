import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Paper,
  Container
} from '@mui/material';

interface FormData {
  activityType: string;
  segment: string;
  userType: string;
  trainingMode: string;
}

// Hardcoded URL mapping based on the Excel file structure
const URL_MAPPING: Record<string, string> = {
  'Running-Pro-New-Standard': 'https://example.com/running-pro-new-standard',
  'Running-Pro-New-Experienced': 'https://example.com/running-pro-new-experienced',
  'Running-Pro-New-Speed': 'https://example.com/running-pro-new-speed',
  'Running-Pro-Return-Standard': 'https://example.com/running-pro-return-standard',
  'Running-Pro-Return-Experienced': 'https://example.com/running-pro-return-experienced',
  'Running-Pro-Return-Speed': 'https://example.com/running-pro-return-speed',
  'Running-Lite-New-Standard': 'https://example.com/running-lite-new-standard',
  'Running-Lite-New-Experienced': 'https://example.com/running-lite-new-experienced',
  'Running-Lite-Return-Standard': 'https://example.com/running-lite-return-standard',
  'Running-Lite-Return-Experienced': 'https://example.com/running-lite-return-experienced',
  'Walking-Pro-New-Standard': 'https://example.com/walking-pro-new-standard',
  'Walking-Pro-New-Experienced': 'https://example.com/walking-pro-new-experienced',
  'Walking-Pro-New-Speed': 'https://example.com/walking-pro-new-speed',
  'Walking-Pro-Return-Standard': 'https://example.com/walking-pro-return-standard',
  'Walking-Pro-Return-Experienced': 'https://example.com/walking-pro-return-experienced',
  'Walking-Pro-Return-Speed': 'https://example.com/walking-pro-return-speed',
  'Walking-Lite-New-Standard': 'https://example.com/walking-lite-new-standard',
  'Walking-Lite-New-Experienced': 'https://example.com/walking-lite-new-experienced',
  'Walking-Lite-Return-Standard': 'https://example.com/walking-lite-return-standard',
  'Walking-Lite-Return-Experienced': 'https://example.com/walking-lite-return-experienced',
  'Masters-Pro-New-Standard': 'https://example.com/masters-pro-new-standard',
  'Masters-Pro-New-Experienced': 'https://example.com/masters-pro-new-experienced',
  'Masters-Pro-New-Speed': 'https://example.com/masters-pro-new-speed',
  'Masters-Pro-Return-Standard': 'https://example.com/masters-pro-return-standard',
  'Masters-Pro-Return-Experienced': 'https://example.com/masters-pro-return-experienced',
  'Masters-Pro-Return-Speed': 'https://example.com/masters-pro-return-speed',
  'Masters-Lite-New-Standard': 'https://example.com/masters-lite-new-standard',
  'Masters-Lite-New-Experienced': 'https://example.com/masters-lite-new-experienced',
  'Masters-Lite-Return-Standard': 'https://example.com/masters-lite-return-standard',
  'Masters-Lite-Return-Experienced': 'https://example.com/masters-lite-return-experienced',
};

const ProgramForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    activityType: '',
    segment: '',
    userType: '',
    trainingMode: ''
  });

  const handleChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTrainingModeOptions = () => {
    if (formData.segment === 'Pro') {
      return ['Standard', 'Experienced', 'Speed'];
    }
    return ['Standard', 'Experienced'];
  };

  const handleSubmit = () => {
    const key = `${formData.activityType}-${formData.segment}-${formData.userType}-${formData.trainingMode}`;
    const url = URL_MAPPING[key];
    
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('No matching program URL found for the selected options.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Program Selection
        </Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Activity Type</InputLabel>
            <Select
              name="activityType"
              value={formData.activityType}
              label="Activity Type"
              onChange={handleChange}
            >
              <MenuItem value="Running">Running</MenuItem>
              <MenuItem value="Walking">Walking</MenuItem>
              <MenuItem value="Masters">Masters</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Segment</InputLabel>
            <Select
              name="segment"
              value={formData.segment}
              label="Segment"
              onChange={handleChange}
            >
              <MenuItem value="Pro">Pro</MenuItem>
              <MenuItem value="Lite">Lite</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>User Type</InputLabel>
            <Select
              name="userType"
              value={formData.userType}
              label="User Type"
              onChange={handleChange}
            >
              <MenuItem value="New">New</MenuItem>
              <MenuItem value="Return">Return</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Training Mode</InputLabel>
            <Select
              name="trainingMode"
              value={formData.trainingMode}
              label="Training Mode"
              onChange={handleChange}
              disabled={!formData.segment}
            >
              {getTrainingModeOptions().map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!formData.activityType || !formData.segment || !formData.userType || !formData.trainingMode}
            sx={{ mt: 2 }}
          >
            Start Program
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProgramForm; 