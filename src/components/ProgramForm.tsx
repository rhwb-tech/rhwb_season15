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
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardMedia,
  TextField,
  FormHelperText,
  Alert,
  Snackbar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { supabase } from '../lib/supabaseClient';

interface FormData {
  track: string;
  activityType: string;
  segment: string;
  userType: string;
  trainingMode: string;
  email: string;
  coachPreference: string;
}

// Hardcoded URL mapping based on the Excel file structure
const URL_MAPPING: Record<string, string> = {
  // Summer Track
  'summer-Pro-Running-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a01pro-run-new-std',
  'summer-Pro-Running-new-Exp': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a02pro-run-new-exp',
  'summer-Pro-Running-new-Speed': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a03pro-run-new-speed',
  'summer-Pro-Running-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a04pro-run-return-std',
  'summer-Pro-Running-return-Exp': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a05pro-run-return-exp',
  'summer-Pro-Running-return-Speed': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a06pro-run-return-speed',
  'summer-Pro-Walking-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a07pro-walk-new-std',
  'summer-Pro-Walking-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a08pro-walk-return-std',
  'summer-Lite-Running-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a09lite-run-new-std',
  'summer-Lite-Running-new-Exp': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a10lite-run-new-exp',
  'summer-Lite-Running-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a11lite-run-return-std',
  'summer-Lite-Running-return-Exp': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a12lite-run-return-exp',
  'summer-Lite-Walking-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a13lite-walk-new-std',
  'summer-Lite-Walking-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a14lite-walk-return-std',
  'summer-Pro-Masters-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a15masters-walk-new-std',
  'summer-Pro-Masters-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s14admissions/a16masters-walk-return-std',

  // Fall Track
  'fall-Pro-Running-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a01fallpro-run-new-std',
  'fall-Pro-Running-new-Exp': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a02fallpro-run-new-exp',
  'fall-Pro-Running-new-Speed': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a03fallpro-run-new-speed',
  'fall-Pro-Running-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a04fallpro-run-return-std',
  'fall-Pro-Running-return-Exp': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a05fallpro-run-return-exp',
  'fall-Pro-Running-return-Speed': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a06fallpro-run-return-speed',
  'fall-Pro-Walking-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a07fallpro-walk-new-std',
  'fall-Pro-Walking-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a08fallpro-walk-return-std',
  'fall-Lite-Running-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a09falllite-run-new-std',
  'fall-Lite-Running-new-Exp': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a10falllite-run-new-exp',
  'fall-Lite-Running-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a11falllite-run-return-std',
  'fall-Lite-Running-return-Exp': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a12falllite-run-return-exp',
  'fall-Lite-Walking-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a13falllite-walk-new-std',
  'fall-Lite-Walking-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a14falllite-walk-return-std',
  'fall-Pro-Masters-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a15fallmasters-walk-new-std',
  'fall-Pro-Masters-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/s14-fall/a16fallmasters-walk-return-std',
};

const ProgramForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    track: '',
    activityType: '',
    segment: '',
    userType: '',
    trainingMode: '',
    email: '',
    coachPreference: ''
  });

  const [expanded, setExpanded] = useState<string | false>('program-info');

  // Add state for handling submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Add state for email validation
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Separate handler for Select components
  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Separate handler for TextField components
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    
    if (name === 'email' && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTrainingModeOptions = () => {
    if (formData.segment === 'Pro') {
      return ['Std', 'Exp', 'Speed'];
    }
    return ['Std', 'Exp'];
  };

  const calculateProgramCost = () => {
    if (formData.activityType === 'Running') {
      if (formData.segment === 'Pro') {
        return formData.userType === 'new' ? 60 : 35;
      } else { // Lite
        return formData.userType === 'new' ? 35 : 20;
      }
    } else if (formData.activityType === 'Walking') {
      if (formData.segment === 'Pro') {
        return 30;
      } else { // Lite
        return 15;
      }
    }
    return 0; // For Masters or other cases
  };

  // Function to save returning user data to Supabase
  const saveReturningUserData = async () => {
    if (formData.userType !== 'return') return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const { data, error } = await supabase
        .from('returning_users')
        .insert([
          {
            email: formData.email,
            coach_preference: formData.coachPreference,
            track: formData.track,
            activity_type: formData.activityType,
            segment: formData.segment,
            training_mode: formData.trainingMode
          }
        ])
        .select();

      if (error) throw error;

      setSubmitSuccess(true);
      console.log('Data saved successfully:', data);
    } catch (error) {
      console.error('Error saving data:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    // If it's a returning user, save their data first
    if (formData.userType === 'return') {
      await saveReturningUserData();
    }

    // Continue with the existing URL redirection logic
    const key = `${formData.track}-${formData.segment}-${formData.activityType}-${formData.userType}-${formData.trainingMode}`;
    const url = URL_MAPPING[key];
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setSubmitError('No matching program URL found for the selected options.');
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <Container maxWidth="sm">
      <Accordion 
        expanded={expanded === 'program-info'} 
        onChange={handleAccordionChange('program-info')}
        sx={{ mb: 3 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="program-info-content"
          id="program-info-header"
        >
          <Typography variant="h6">Welcome to Season 14</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <CardMedia
              component="img"
              height="300"
              image="/IMG_2646.JPG"
              alt="RHWB Season 14"
              sx={{ borderRadius: 1 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              Are you ready to kick off Season 14?!!
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              RHWB now offers a{' '}
              <a 
                href="https://www.rhwb.org/training-programs" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                variety of programs
              </a>
              {' '}to suit diverse needs. All programs are available in two tracks. Summer track starting in June with race day in October and Fall Track starting in August and ending in December. Fall Tracks is meant for people living in hotter climates such as India, Texas and Middle East. However, both tracks are open for all. Once signed up you cannot change tracks. Review{' '}
              <a 
                href="https://www.rhwb.org/season-14-calendar" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                Training Calendar
              </a>
              {' '}before deciding.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expanded === 'orientation'} 
        onChange={handleAccordionChange('orientation')}
        sx={{ mb: 3 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="orientation-content"
          id="orientation-header"
        >
          <Typography variant="h6">RHWB Orientation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px'
                }}
                src="https://www.youtube.com/embed/7Cl6v_VQgQI"
                title="RHWB Orientation Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                New Runners:
              </Typography>
              <Typography variant="body1">
                We highly recommend that you watch the below orientation video in its entirety to understand the program requirements and key details to make you successful in the program.
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
                Return Runners:
              </Typography>
              <Typography variant="body1">
                While it is optional for you, we recommend you take some time to refresh key details and requirements for your continued success with RHWB
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expanded === 'program-selection'} 
        onChange={handleAccordionChange('program-selection')}
        sx={{ mb: 3 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="program-selection-content"
          id="program-selection-header"
        >
          <Typography variant="h6">Program Selection</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Track</InputLabel>
                <Select
                  name="track"
                  value={formData.track}
                  label="Track"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="summer">Summer (Jun-Oct)</MenuItem>
                  <MenuItem value="fall">Fall (Aug-Dec)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Activity Type</InputLabel>
                <Select
                  name="activityType"
                  value={formData.activityType}
                  label="Activity Type"
                  onChange={handleSelectChange}
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
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Pro">Pro (Coach Assisted)</MenuItem>
                  <MenuItem value="Lite">Lite (Self Assisted)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>User Type</InputLabel>
                <Select
                  name="userType"
                  value={formData.userType}
                  label="User Type"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="new">New to RHWB</MenuItem>
                  <MenuItem value="return">Participated in one or more seasons in the past</MenuItem>
                </Select>
              </FormControl>

              {formData.userType === 'return' && (
                <>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email used in previous season"
                    type="email"
                    value={formData.email}
                    onChange={handleTextChange}
                    required
                    error={!!emailError}
                    helperText={emailError || "Please enter the email you used in your previous season"}
                  />
                  
                  <FormControl fullWidth>
                    <InputLabel>Coaching Preference</InputLabel>
                    <Select
                      name="coachPreference"
                      value={formData.coachPreference}
                      label="Coaching Preference"
                      onChange={handleSelectChange}
                      required
                    >
                      <MenuItem value="stay">Happy to stay with my current coach</MenuItem>
                      <MenuItem value="open">Open to trying a new coach</MenuItem>
                    </Select>
                    <FormHelperText>
                      Let us know your coaching preference for this season. While we can't guarantee placements, we'll consider your input.
                    </FormHelperText>
                  </FormControl>
                </>
              )}

              <FormControl fullWidth>
                <InputLabel>Training Intensity</InputLabel>
                <Select
                  name="trainingMode"
                  value={formData.trainingMode}
                  label="Training Intensity"
                  onChange={handleSelectChange}
                  disabled={!formData.segment}
                >
                  {getTrainingModeOptions().map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {mode === 'Std' ? 'Standard (<2 years of running experience)' :
                       mode === 'Exp' ? 'Experienced (>2 years of running experience)' :
                       'Speed (>4 years of running experience)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formData.activityType && formData.segment && formData.userType && (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    mt: 2
                  }}
                >
                  Your Program Cost: ${calculateProgramCost()}
                </Typography>
              )}

              {formData.activityType && formData.segment && formData.userType && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    textAlign: 'center',
                    mt: 0
                  }}
                >
                  {formData.activityType === 'Masters' 
                    ? 'Use coupon code BALAFREE in the last step to waive the fees off'
                    : 'India residents only use coupon code BALADISCOUNT for additional discount'}
                </Typography>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !formData.track || 
                  !formData.activityType || 
                  !formData.segment || 
                  !formData.userType || 
                  !formData.trainingMode || 
                  (formData.userType === 'return' && (!formData.email || !formData.coachPreference))
                }
                sx={{ mt: 2 }}
              >
                {isSubmitting ? 'Submitting...' : 'Start Registration'}
              </Button>
            </Box>
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* Add feedback messages */}
      <Snackbar 
        open={submitSuccess} 
        autoHideDuration={6000} 
        onClose={() => setSubmitSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSubmitSuccess(false)}>
          Registration data saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!submitError} 
        autoHideDuration={6000} 
        onClose={() => setSubmitError(null)}
      >
        <Alert severity="error" onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProgramForm; 