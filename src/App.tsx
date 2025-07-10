import React, { useState } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Tabs, 
  Tab, 
  Box, 
  Paper,
} from '@mui/material';
import { Security, BugReport } from '@mui/icons-material';

// Import dos componentes de vulnerabilidades
import XSSDemo from './components/XSSDemo.tsx';
import DataExposureDemo from './components/DataExposureDemo.tsx';
import CSRFDemo from './components/CSRFDemo.tsx';
import CORSDemo from './components/CORSDemo.tsx';
import ClickjackingDemo from './components/ClickjackingDemo.tsx';

// Tema customizado com cores de segurança
const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f', // Vermelho para representar perigo
    },
    secondary: {
      main: '#2e7d32', // Verde para representar segurança
    },
    background: {
      default: '#fafafa',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      color: '#d32f2f',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `security-tab-${index}`,
    'aria-controls': `security-tabpanel-${index}`,
  };
}

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{width: '100vw'}}>
      <CssBaseline />
      <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)' }}>
        <Toolbar>
          <Security sx={{ mr: 2 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Frontend Security Lab
          </Typography>
          <BugReport sx={{ ml: 2 }} />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 3, px: { xs: 2, sm: 3 } }}>
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            🎯 Veja os erros. Entenda. Corrija.
          </Typography>
        </Paper>

        <Paper elevation={2}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={value} 
              onChange={handleChange} 
              aria-label="security vulnerabilities tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="XSS" {...a11yProps(0)} />
              <Tab label="Dados Sensíveis" {...a11yProps(1)} />
              <Tab label="CSRF" {...a11yProps(2)} />
              <Tab label="CORS" {...a11yProps(3)} />
              <Tab label="Clickjacking" {...a11yProps(4)} />
            </Tabs>
          </Box>
          
          <TabPanel value={value} index={0}>
            <XSSDemo />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <DataExposureDemo />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <CSRFDemo />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <CORSDemo />
          </TabPanel>
          <TabPanel value={value} index={4}>
            <ClickjackingDemo />
          </TabPanel>
        </Paper>
      </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
