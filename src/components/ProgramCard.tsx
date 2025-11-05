import React from 'react';
import { Card, CardContent, CardActions, Typography, Button } from '@mui/material';
import { Program } from '../types';

interface ProgramCardProps {
  program: Program;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  return (
    <Card sx={{ maxWidth: 345, m: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {program.name}
        </Typography>
        {program.description && (
          <Typography variant="body2" color="text.secondary">
            {program.description}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          color="primary" 
          href={program.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProgramCard; 