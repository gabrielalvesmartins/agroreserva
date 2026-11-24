import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { AvisoProvider } from './contexts/AvisoContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AvisoProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AvisoProvider>
    </BrowserRouter>
  </StrictMode>,
);
