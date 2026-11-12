import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripsProvider } from './context/TripsContext';
import { MessagesProvider } from './context/MessagesContext';
import { SafetyProvider } from './context/SafetyContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TripsProvider>
          <MessagesProvider>
            <SafetyProvider>
              <App />
            </SafetyProvider>
          </MessagesProvider>
        </TripsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
