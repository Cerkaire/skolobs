import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { MainProvider } from './context/MainContext';
import * as serviceWorkerRegistration from './service-worker';

const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
  <BrowserRouter>
    <MainProvider>
      <App />
    </MainProvider>
  </BrowserRouter>
);

// Enregistre le service worker pour rendre l'application une PWA
serviceWorkerRegistration.register();
