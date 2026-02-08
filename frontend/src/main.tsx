import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import mainStore from './store/mainStore.ts';
import { StoreContext } from './store/storeContext.ts';
import { ThemeProvider } from './components/ThemeProvider.tsx';
import { StrictMode } from 'react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreContext.Provider value={mainStore}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </StoreContext.Provider>
  </StrictMode>
);
