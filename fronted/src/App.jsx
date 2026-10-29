import React, { useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes/AppRoutes';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
import { ScrollToTop } from './components/ScrollToTop';
import { useAppDispatch } from './store/hooks';
import { fetchMeThunk, markBootstrapped } from './store/slices/authSlice';
import { storage } from './utils/storage';

/**
 * AuthBootstrap — on app load, restore the session:
 * if a token exists, call /auth/me; otherwise mark bootstrapped so guards can act.
 */
function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (storage.getAccessToken()) {
      dispatch(fetchMeThunk()); // validates token + restores user; reject path clears + bootstraps
    } else {
      dispatch(markBootstrapped()); // no token → nothing to restore; let guards send to /login
    }
  }, [dispatch]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
          <BrowserRouter>
            <AuthBootstrap />
            <ScrollToTop />
            <AppRoutes />

            {/* ── Global Toast Notification System ─────────────────────────────
                Usage anywhere: import toast from 'react-hot-toast'
                toast.success('Done!') | toast.error('Failed') | toast.loading(...)
            ──────────────────────────────────────────────────────────────────── */}
            <Toaster
              position="top-right"
              gutter={10}
              containerStyle={{ top: 16, right: 16 }}
              toastOptions={{
                duration: 3500,
                style: {
                  maxWidth: '380px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#fff' },
                  style: {
                    background: '#f0fdf4',
                    color: '#14532d',
                    border: '1px solid #bbf7d0',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                  style: {
                    background: '#fef2f2',
                    color: '#7f1d1d',
                    border: '1px solid #fecaca',
                  },
                },
                loading: {
                  iconTheme: { primary: '#3b82f6', secondary: '#fff' },
                  style: {
                    background: '#eff6ff',
                    color: '#1e3a5f',
                    border: '1px solid #bfdbfe',
                  },
                },
              }}
            />
          </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
