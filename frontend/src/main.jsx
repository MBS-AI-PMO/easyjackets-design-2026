import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import SiteGate from './components/SiteGate';
import { AuthProvider } from './lib/auth';
import { CartProvider } from './lib/cart';
import './lib/siteIdentity'; // logos + favicons from the admin: starts loading before the first render
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/ui.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {/* the holding page while the site is under construction (admin: Settings → Site Status) */}
          <SiteGate>
            <App />
          </SiteGate>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
