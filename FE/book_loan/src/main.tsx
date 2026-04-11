import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import App from './App.tsx';
import ToastViewport from './components/ToastViewport';
import './assets/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <ToastViewport />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
