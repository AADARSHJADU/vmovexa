import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBu8PaWKJyz5YxcGmcntgopyik5Bxyn9z0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'vmovexa-5f0cf.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'vmovexa-5f0cf',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'vmovexa-5f0cf.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1007241948280',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1007241948280:web:3d9d021e3fab6d5c95118d',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7QZ40P7JJH',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

/**
 * Opens Firebase Google OAuth Popup and returns verified ID token + profile.
 * @returns {Promise<{ idToken: string, email: string, displayName: string, photoURL: string, user: any }>}
 */
export async function signInWithGooglePopup() {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken(true);
  return {
    idToken,
    user: result.user,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
  };
}

/**
 * Opens Firebase Apple OAuth Popup and returns verified ID token + profile.
 * @returns {Promise<{ idToken: string, email: string, displayName: string, user: any }>}
 */
export async function signInWithApplePopup() {
  const result = await signInWithPopup(auth, appleProvider);
  const idToken = await result.user.getIdToken(true);
  return {
    idToken,
    user: result.user,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
  };
}

export default app;
