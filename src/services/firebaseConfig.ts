import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, getAuth } from 'firebase/auth';
import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';
import { FirebaseCustomConfig } from '../types';

// Web app's live Firebase configuration for mnh-gazipur-news
export const DEFAULT_FIREBASE_CONFIG: FirebaseCustomConfig = {
  apiKey: "AIzaSyCasb3dDo02hCwvsG98J_1kE2GOy_X_R4k",
  authDomain: "mnh-gazipur-news.firebaseapp.com",
  projectId: "mnh-gazipur-news",
  storageBucket: "mnh-gazipur-news.firebasestorage.app",
  messagingSenderId: "455192717010",
  appId: "1:455192717010:web:e851e3571bd70bcea2ef0b",
  measurementId: "G-0CRZJXW7HP"
};

const STORAGE_KEY = 'mnh_gazipur_firebase_config';

export function getSavedFirebaseConfig(): FirebaseCustomConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // If previously saved with old placeholder, update to user's config
      if (parsed.apiKey && parsed.apiKey !== 'YOUR_API_KEY') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading saved Firebase config', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseCustomConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.location.reload();
  } catch (e) {
    console.error('Error saving Firebase config', e);
  }
}

export function isFirebaseConfigured(config = getSavedFirebaseConfig()): boolean {
  return (
    Boolean(config.apiKey) &&
    config.apiKey !== 'YOUR_API_KEY' &&
    Boolean(config.projectId) &&
    config.projectId !== 'YOUR_PROJECT_ID'
  );
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;

export function getFirebaseInstance() {
  const config = getSavedFirebaseConfig();
  if (!isFirebaseConfigured(config)) {
    return { app: null, db: null, auth: null, analytics: null, isLive: false };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    auth = getAuth(app);

    // Initialize Analytics if supported in the current environment
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      }).catch((e) => {
        // Non-blocking in dev or iframe environments
      });
    }

    return { app, db, auth, analytics, isLive: true };
  } catch (err) {
    console.warn('Firebase initialization note (fallback to local mock if needed):', err);
    return { app: null, db: null, auth: null, analytics: null, isLive: false, error: err };
  }
}
