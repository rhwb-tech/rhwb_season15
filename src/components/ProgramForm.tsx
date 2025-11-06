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

// Hardcoded URL mapping (Season 15 - Spring)
const URL_MAPPING: Record<string, string> = {
  // Spring Track (Dec-Apr)
  'spring-Coach Guided-Running-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a01coach-guided-run-new-std',
  'spring-Coach Guided-Running-new-Exp': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a02coach-guided-run-new-exp',
  'spring-Coach Guided-Running-new-Speed': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a03coach-guided-run-new-speed',
  'spring-Coach Guided-Running-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a04coach-guided-run-return-std',
  'spring-Coach Guided-Running-return-Exp': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a05coach-guided-run-return-exp',
  'spring-Coach Guided-Running-return-Speed': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a06coach-guided-run-return-speed',
  'spring-Coach Guided-Walking-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a07coach-guided-walk-new-std',
  'spring-Coach Guided-Walking-return-Std': 'https://finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a08coach-guided-walk-return-std',
  'spring-Self Serve-Running-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a09self-serve-run-new-std',
  'spring-Self Serve-Running-new-Exp': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a10self-serve-run-new-exp',
  'spring-Self Serve-Running-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a11self-serve-run-return-std',
  'spring-Self Serve-Running-return-Exp': 'https://finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a12self-serve-run-return-exp',
  'spring-Self Serve-Walking-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a13self-serve-walk-new-std',
  'spring-Self Serve-Walking-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a14self-serve-walk-return-std',
  'spring-Coach Guided-Masters-new-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a15masters-walk-new-std',
  'spring-Coach Guided-Masters-return-Std': 'https://www.finalsurge.com/coach/rhwb/training/rhwb-s15admissions/a16masters-walk-return-std',
};

const ProgramForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    track: 'spring',
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

    if (name === "activityType") {
      if (value === "Masters") {
        setFormData(prev => ({
          ...prev,
          activityType: value,
          segment: "Coach Guided",
          trainingMode: "Std"
        }));
      } else if (value === "Walking") {
        setFormData(prev => ({
          ...prev,
          activityType: value,
          trainingMode: "Std"
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          activityType: value,
          segment: "",
          trainingMode: ""
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
    if (formData.activityType === 'Walking') return ['Std'];
    if (formData.segment === 'Coach Guided') return ['Std', 'Exp', 'Speed'];
    return ['Std', 'Exp'];
  };

  const calculateProgramCost = () => {
    if (formData.activityType === 'Running') {
      if (formData.segment === 'Coach Guided') {
        return formData.userType === 'new' ? 60 : 35;
      } else { // Self Serve
        return formData.userType === 'new' ? 35 : 20;
      }
    } else if (formData.activityType === 'Walking') {
      if (formData.segment === 'Coach Guided') {
        return 30;
      } else { // Self Serve
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
  let popup: Window | null = null;

  const key = `${formData.track}-${formData.segment}-${formData.activityType}-${formData.userType}-${formData.trainingMode}`;
  const url = URL_MAPPING[key];

  if (url) {
    // Open a blank popup immediately
    popup = window.open('', '_blank');
  }

  // Save data if needed
  if (formData.userType === 'return') {
    await saveReturningUserData();
  }

  if (popup && url) {
    popup.location.href = url;
  } else if (!popup && url) {
    // fallback if popup was blocked
    window.open(url, '_blank');
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
          <Typography variant="h6">Welcome to Season 15</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <CardMedia
              component="img"
              image="/season15coaches.jpeg"
              alt="RHWB Season 15"
              sx={{ 
                borderRadius: 1,
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                maxWidth: '100%'
              }}
            />
            <Typography variant="h6" sx={{ textAlign: 'center' }}>
              Are you ready to kick off Season 15?!!
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              <strong>Our Program Offerings</strong><br/>
              RHWB now offers a{' '}
              <a 
                href="https://www.rhwb.org/training-programs" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                variety of programs
              </a>
              {' '}to suit diverse needs of our runners. Please review them before proceeding.
              <br/>
              <br/>
              Our program runs in a single track this season:
              <li>Spring (Dec-Apr)</li>
               Review{' '}
              <a 
                href="https://www.rhwb.org/season-15-calendar" 
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
                allowFullScreen={true}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                New Runners:
              </Typography>
              <Typography variant="body1">
              It is mandatory that you watch the above orientation program before you jump in. We want you to first understand the program requirements and key details to make your journey with us successful.
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
                Return Runners:
              </Typography>
              <Typography variant="body1">
              We recommend you take some time to refresh key details and requirements for your continued success at RHWB.
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
                  <MenuItem value="spring">Spring (Dec-Apr)</MenuItem>
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
                  disabled={formData.activityType === "Masters"}
                >
                  <MenuItem value="Coach Guided">Coach Guided</MenuItem>
                  <MenuItem value="Self Serve">Self Serve</MenuItem>
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
                  <MenuItem value="new">New Runners to RHWB</MenuItem>
                  <MenuItem value="return">Returning Runners to RHWB</MenuItem>
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
    disabled={
      formData.activityType === "Masters" ||
      formData.activityType === "Walking" ||
      !formData.segment
    }
  >
    {getTrainingModeOptions().map((mode) => (
      <MenuItem key={mode} value={mode}>
        {mode === 'Std' ? 'Standard (<2 years of running experience)' :
         mode === 'Exp' ? 'Experienced (>2 years of running experience)' :
         'High Intensity Speed (>4 years of running experience)'}
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
                    : 'India & China residents only use coupon code BALADISCOUNT for additional discount'}
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
