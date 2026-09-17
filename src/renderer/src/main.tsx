import './assets/main.css';
import '@renderer/lib/i18n';

import { Toaster } from '@renderer/components/ui/toast';
import { TooltipProvider } from '@renderer/components/ui/tooltip';
import { queryClient } from '@renderer/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster>
          <App />
        </Toaster>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
